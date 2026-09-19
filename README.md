# Mantis MCP Server (Remote / Online version)

نسخة أونلاين من سيرفر الـ MCP بتاع Mantis، تشتغل من claude.ai على الموبايل أو أي متصفح، مش بس من جهازك.

## الفكرة
السيرفر ده بيشتغل كموقع صغير على الإنترنت، وكلود بيكلمه عن طريق رابط (URL). عشان محدش تاني يقدر يستخدمه غيرك، السيرفر بيطلب مفتاح سري (`AUTH_TOKEN`) تحطه في آخر الرابط.

## البيانات اللي هتحتاجها

| المتغير | القيمة |
|---|---|
| `MANTIS_URL` | `https://mantis.bee-technology.com` |
| `MANTIS_TOKEN` | التوكن اللي عملته من Mantis (My Account > API Tokens) |
| `AUTH_TOKEN` | `de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293` (مفتاح سري اتولّد لك، احتفظ بيه) |

## خطوات النشر (Render.com – مجاني)

### 1) ارفع الملفات دي على GitHub
1. اعمل حساب مجاني على github.com لو مالكش واحد
2. اضغط **New repository** (زرار أخضر)، سمّيه `mantis-mcp-remote`، خليه Private، واضغط Create
3. جوه الريبو الفاضي، دوس **uploading an existing file**
4. اسحب (drag & drop) الملفات التلاتة: `server.mjs`, `package.json`, `.gitignore`
5. اضغط **Commit changes**

### 2) اعمل حساب على Render
1. روح على render.com واعمل حساب (تقدر تسجل بحساب الـ GitHub بتاعك مباشرة)
2. اضغط **New +** → **Web Service**
3. اختار **Build and deploy from a Git repository** واربط حساب GitHub بتاعك، واختار الريبو `mantis-mcp-remote`
4. Runtime: Node
5. Build Command: `npm install`
6. Start Command: `node server.mjs`
7. Instance Type: Free

### 3) ضيف المتغيرات (Environment Variables)
تحت في نفس صفحة الإعداد، هتلاقي قسم **Environment Variables**، ضيف التلاتة دول:
- `MANTIS_URL` = `https://mantis.bee-technology.com`
- `MANTIS_TOKEN` = (التوكن بتاعك من Mantis)
- `AUTH_TOKEN` = `de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293`

اضغط **Create Web Service** وانتظر شوية لحد ما يخلص Deploy (هتشوف "Live" باللون الأخضر).

### 4) هتاخد رابط زي كده
```
https://mantis-mcp-remote.onrender.com
```

## ضيفه في Claude
1. من claude.ai (موبايل أو ويب) → **Settings** → **Connectors**
2. اضغط **Add custom connector**
3. في خانة الرابط اكتب:
```
https://اسم-السيرفر-بتاعك.onrender.com/mcp?key=de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293
```
4. احفظ، وفعّل الأدوات في أي محادثة من زرار الأدوات (المطرقة/plug)

## ملاحظة عن الخطة المجانية في Render
الخطة المجانية بتـ"تنام" بعد فترة من غير استخدام، وأول طلب بعد النوم بياخد شوية ثواني عشان يصحى. ده عادي ومش عيب.

## تجربة سريعة إن السيرفر شغال
افتح الرابط ده في المتصفح:
```
https://اسم-السيرفر-بتاعك.onrender.com/
```
المفروض تشوف: `Mantis MCP server is running.`
