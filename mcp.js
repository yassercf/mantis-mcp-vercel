/**
 * Vercel Serverless Function: /api/mcp
 * Bridges Claude with a MantisBT ticket system, hosted for free on Vercel.
 *
 * Required Environment Variables (set in Vercel project settings):
 *   MANTIS_URL   - e.g. https://mantis.bee-technology.com
 *   MANTIS_TOKEN - MantisBT personal API token (My Account -> API Tokens)
 *   AUTH_TOKEN   - a secret string YOU make up, put in the connector URL as ?key=...
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const MANTIS_URL = (process.env.MANTIS_URL || "").replace(/\/+$/, "");
const MANTIS_TOKEN = process.env.MANTIS_TOKEN || "";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "";

async function mantisFetch(path, options = {}) {
  const url = `${MANTIS_URL}/api/rest${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: MANTIS_TOKEN,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const msg = body?.message || body?.localized || text || res.statusText;
    throw new Error(`Mantis API error (${res.status}): ${msg}`);
  }
  return body;
}

let projectCache = null;
async function getProjects() {
  if (!projectCache) {
    const data = await mantisFetch("/projects");
    projectCache = data.projects || [];
  }
  return projectCache;
}

async function resolveProjectRef(projectNameOrId) {
  if (/^\d+$/.test(String(projectNameOrId))) {
    return { id: Number(projectNameOrId) };
  }
  const projects = await getProjects();
  const match = projects.find(
    (p) => p.name?.toLowerCase() === String(projectNameOrId).toLowerCase()
  );
  if (!match) {
    const names = projects.map((p) => p.name).join(", ");
    throw new Error(`Project "${projectNameOrId}" not found. Available projects: ${names}`);
  }
  return { id: match.id, name: match.name };
}

const TOOLS = [
  {
    name: "list_projects",
    description: "List all Mantis projects visible to this account (id and name).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_issues",
    description:
      "List tickets/issues, optionally filtered by project name or id. Returns id, summary, status, priority, category, handler.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project name or numeric id. Omit to list across all accessible projects." },
        page: { type: "number", description: "Page number, default 1" },
        page_size: { type: "number", description: "Results per page, default 25" },
      },
    },
  },
  {
    name: "get_issue",
    description: "Get full details of a single ticket/issue by its numeric id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number", description: "Issue id" } },
      required: ["id"],
    },
  },
  {
    name: "create_issue",
    description:
      "Create a new ticket/issue in Mantis. Provide the project name, a summary, and a description; other fields are optional.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project name or numeric id" },
        summary: { type: "string", description: "Short title of the ticket" },
        description: { type: "string", description: "Full description / steps to reproduce" },
        category: { type: "string", description: "Category name (must exist in the project). Optional." },
        priority: { type: "string", description: "none, low, normal, high, urgent, immediate. Optional." },
        severity: { type: "string", description: "feature, trivial, text, tweak, minor, major, crash, block. Optional." },
        reproducibility: { type: "string", description: "always, sometimes, random, have not tried, unable to reproduce, N/A. Optional." },
        handler: { type: "string", description: "Username to assign the ticket to. Optional." },
        additional_information: { type: "string", description: "Extra notes/info. Optional." },
      },
      required: ["project", "summary", "description"],
    },
  },
  {
    name: "add_note",
    description: "Add a note/comment to an existing ticket.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Issue id" },
        text: { type: "string", description: "Note text" },
      },
      required: ["id", "text"],
    },
  },
];

async function handleToolCall(name, args) {
  switch (name) {
    case "list_projects": {
      const projects = await getProjects();
      const summary = projects.map((p) => `#${p.id} ${p.name}`).join("\n");
      return summary || "No projects found.";
    }
    case "list_issues": {
      const params = new URLSearchParams();
      if (args?.project) {
        const proj = await resolveProjectRef(args.project);
        params.set("project_id", proj.id);
      }
      params.set("page", String(args?.page || 1));
      params.set("page_size", String(args?.page_size || 25));
      const data = await mantisFetch(`/issues?${params.toString()}`);
      const issues = data.issues || [];
      return (
        issues
          .map((i) => `#${i.id} [${i.status?.name}] ${i.summary} (project: ${i.project?.name}, priority: ${i.priority?.name}, category: ${i.category?.name})`)
          .join("\n") || "No issues found."
      );
    }
    case "get_issue": {
      const data = await mantisFetch(`/issues/${args.id}`);
      const issue = data.issues?.[0];
      if (!issue) throw new Error(`Issue #${args.id} not found.`);
      return JSON.stringify(issue, null, 2);
    }
    case "create_issue": {
      const proj = await resolveProjectRef(args.project);
      const payload = { summary: args.summary, description: args.description, project: proj };
      if (args.category) payload.category = { name: args.category };
      if (args.priority) payload.priority = { name: args.priority };
      if (args.severity) payload.severity = { name: args.severity };
      if (args.reproducibility) payload.reproducibility = { name: args.reproducibility };
      if (args.handler) payload.handler = { name: args.handler };
      if (args.additional_information) payload.additional_information = args.additional_information;
      const data = await mantisFetch("/issues", { method: "POST", body: JSON.stringify(payload) });
      const created = data.issue;
      return `Created issue #${created.id}: ${created.summary} (project: ${created.project?.name})`;
    }
    case "add_note": {
      await mantisFetch(`/issues/${args.id}/notes`, { method: "POST", body: JSON.stringify({ text: args.text }) });
      return `Note added to issue #${args.id}.`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function buildServer() {
  const server = new Server({ name: "mantis-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const text = await handleToolCall(name, args);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  });
  return server;
}

// Vercel needs the raw body; tell it not to pre-parse JSON so the MCP
// transport can read the request stream itself.
export const config = { api: { bodyParser: false } };

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export default async function handler(req, res) {
  if (AUTH_TOKEN) {
    const url = new URL(req.url, "http://localhost");
    const provided = url.searchParams.get("key") || req.headers["x-auth-token"];
    if (provided !== AUTH_TOKEN) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
  }
  try {
    const body = req.method === "POST" ? await readJsonBody(req) : undefined;
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: String(err) });
  }
}
