# Gym Timer

مؤقت فترات للتمارين: خطوات مرتبة (إحماء، تمرين، راحة، تهدئة) تتكرر بعدد الجولات، مع دخول برابط سحري على الإيميل وحفظ التمارين لكل مستخدم.

**التقنيات:** Next.js 16 (App Router) · Supabase (Auth + Postgres + RLS) · Tailwind CSS 4 · Vercel

## التشغيل محلياً

يحتاج Node.js 20 أو أحدث.

```bash
npm install
cp .env.local.example .env.local   # ثم ضع مفاتيح Supabase
npm run dev
```

افتح http://localhost:3000. المؤقت يعمل حتى بدون مفاتيح Supabase. تسجيل الدخول والحفظ فقط يحتاجانها.

```bash
npm test          # اختبارات محرّك المؤقت
npm run build     # فحص البناء قبل النشر
```

## إعداد Supabase

1. أنشئ مشروعاً على https://supabase.com.
2. **SQL Editor:** الصق محتوى `supabase/migrations/0001_workouts.sql` وشغّله. هذا ينشئ جدول `workouts` مع RLS بحيث كل مستخدم يرى تمارينه فقط.
3. **Project Settings → API:** انسخ `Project URL` والمفتاح العام (anon أو publishable) إلى `.env.local`.
4. **Authentication → URL Configuration:**
   - `Site URL`: رابط الموقع بعد النشر (مثلاً `https://gym-timer.vercel.app`)
   - `Redirect URLs`: أضف
     - `http://localhost:3000/**`
     - `https://gym-timer.vercel.app/**`
     - `https://*-<your-team>.vercel.app/**` (لروابط المعاينة)
5. **(موصى به) Authentication → Email Templates:** غيّر الرابط في قالبين:
   - **Magic Link** (للمستخدمين الحاليين)
   - **Confirm signup** (لأول دخول لمستخدم جديد)

   في كليهما استبدل الرابط بهذا السطر:
   ```html
   <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">سجّل الدخول</a>
   ```
   بهذا يعمل الرابط حتى لو فُتح على جهاز غير الذي طُلب منه. بدون هذا التعديل يعمل القالب الافتراضي أيضاً، لكن يجب فتح الرابط في نفس المتصفح.
   هذا الرابط يعتمد على `Redirect URLs` في الخطوة 4: إذا كان العنوان غير مضاف هناك، سيفشل الرابط.

> بريد Supabase المدمج محدود بعدد قليل من الرسائل في الساعة. للإنتاج اربط SMTP خاص (Resend أو Postmark مثلاً) من **Authentication → SMTP Settings**.

## النشر على Vercel

1. ارفع المشروع إلى GitHub.
2. في Vercel اختر **Add New → Project** واستورد المستودع.
3. أضف متغيرات البيئة `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` لبيئتي Production و Preview.
4. انشر، ثم حدّث `Site URL` و `Redirect URLs` في Supabase بالدومين النهائي.

## بنية المشروع

```
supabase/migrations/0001_workouts.sql   جدول التمارين + RLS
src/proxy.ts                            تحديث الجلسة وحماية /workouts
src/lib/timeline.ts                     تحويل التمرين إلى تسلسل مقاطع (مع اختبارات)
src/hooks/useIntervalTimer.ts           محرّك المؤقت (بلا انحراف زمني)
src/hooks/useWakeLock.ts                إبقاء الشاشة مضاءة
src/lib/audio.ts                        الصفارات (Web Audio)
src/components/WorkoutEditor.tsx        محرّر الخطوات والجولات
src/components/RunClient.tsx            شاشة التشغيل
src/app/login, src/app/auth/*           الرابط السحري وتسجيل الخروج
src/app/workouts/*                      قائمة التمارين المحفوظة، إنشاء، تعديل، حذف
```
