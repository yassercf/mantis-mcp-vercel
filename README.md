# Mantis MCP Server (Vercel — بدون كارت)

نسخة أونلاين مجانية من غير أي متطلب كارت، تشتغل من claude.ai على الموبايل أو أي متصفح.

## البيانات اللي هتحتاجها

| المتغير | القيمة |
|---|---|
| `MANTIS_URL` | `https://mantis.bee-technology.com` |
| `MANTIS_TOKEN` | التوكن اللي عملته من Mantis (My Account > API Tokens) |
| `AUTH_TOKEN` | `de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293` (مفتاح سري، احتفظ بيه) |

## خطوات النشر

### 1) ارفع الملفات على GitHub
1. لو عندك ريبو `mantis-mcp-remote` من قبل، اعمل واحد جديد بدل ما تلخبط فيه، سمّيه `mantis-mcp-vercel`
2. اضغط **New repository** على github.com، خليه Private، واضغط Create
3. جوه الريبو الفاضي، دوس **uploading an existing file**
4. ارفع الملفات دي بنفس الترتيب:
   - `api/mcp.js` (لازم يفضل جوه فولدر اسمه `api` بالظبط)
   - `package.json`
   - `.gitignore`
5. اضغط **Commit changes**

> ملحوظة: لو GitHub مسمحش لك تعمل الفولدر `api` مباشرة أثناء الرفع، اكتب اسم الملف كده في خانة اسم الملف وقت الرفع: `api/mcp.js` — هو هيعمل الفولدر لوحده.

### 2) اعمل حساب على Vercel
1. روح على vercel.com واضغط **Sign Up**
2. اختار **Continue with GitHub** (سجل بنفس حساب الـ GitHub) — مفيش كارت مطلوب خالص
3. من الداشبورد اضغط **Add New** → **Project**
4. اختار الريبو `mantis-mcp-vercel` واضغط **Import**
5. سيب باقي الإعدادات زي ما هي واضغط **Deploy**

### 3) ضيف المتغيرات السرية
1. بعد ما يخلص الـ Deploy، روح لصفحة المشروع → **Settings** → **Environment Variables**
2. ضيف التلاتة:
   - `MANTIS_URL` = `https://mantis.bee-technology.com`
   - `MANTIS_TOKEN` = (توكن مانتس بتاعك)
   - `AUTH_TOKEN` = `de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293`
3. بعد الحفظ، روح لتبويب **Deployments** ودوس على أحدث Deployment → زرار **⋯** → **Redeploy** (عشان المتغيرات الجديدة تتفعّل)

### 4) هتاخد رابط زي كده
```
https://mantis-mcp-vercel.vercel.app
```

## تجربة سريعة إن السيرفر شغال
افتح الرابط ده في المتصفح (غيّر الاسم والمفتاح حسب بتاعك):
```
https://mantis-mcp-vercel.vercel.app/api/mcp?key=de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293
```
لو ظهرت رسالة JSON فيها خطأ عن "Method Not Allowed" أو حاجة شبه كده (مش 401 unauthorized)، يبقى المفتاح شغال والسيرفر تمام — الصفحة دي أصلاً مش مفروض تتفتح من المتصفح العادي، بس ظهور رسالة بدل صفحة بيضا فاضية أو 404 معناه إنه شغال.

## ضيفه في Claude
1. من claude.ai (موبايل أو ويب) → **Settings** → **Connectors**
2. اضغط **Add custom connector**
3. في خانة الرابط اكتب:
```
https://اسم-مشروعك.vercel.app/api/mcp?key=de7bddbad24a2012d1978bc4d60a23ced1fcf9ee13b67293
```
4. احفظ، وفعّل الأدوات في أي محادثة من زرار الأدوات (المطرقة/plug)
