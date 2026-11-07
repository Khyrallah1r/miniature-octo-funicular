# حصن المسلم — تطبيق أندرويد (React Native + Expo)

تطبيق أذكار الكتاب والسنة بواجهة عربية كاملة من اليمين إلى اليسار، يعمل دون اتصال بالإنترنت.
المحتوى: 133 بابًا و295 ذكرًا مستخرجة من قاعدة بيانات «حصن المسلم» المرفقة.

## متطلبات التشغيل

- Node.js 20.19 أو أحدث
- pnpm 9 أو أحدث

## تثبيت الحزم

```bash
pnpm install
```

## تشغيل المشروع

```bash
pnpm start          # تشغيل خادم التطوير (Expo)
pnpm run android    # تشغيل على محاكي أو جهاز أندرويد
pnpm run web        # تشغيل نسخة الويب للمعاينة
```

## بناء حزمة الأندرويد

دليل تفصيلي لبناء ملف APK للتجربة عبر EAS موجود في [BUILD_APK.md](./BUILD_APK.md).

```bash
# بناء حزمة APK للتجربة عبر EAS
eas build -p android --profile preview

# بناء حزمة AAB للنشر عبر EAS
eas build -p android --profile production
```

يتطلب ذلك حساب Expo وحزمة `eas-cli`:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

## التحقق من جودة الكود

```bash
pnpm run lint
npx tsc --noEmit
pnpm run export-web
```

## بنية المشروع

```
app/                 # الشاشات (Expo Router)
  index.tsx          # الشاشة الرئيسية
  browse.tsx         # قائمة الأبواب
  category/[id].tsx  # أذكار الباب
  zekr/[id].tsx      # قارئ الذكر والعدّاد
  search.tsx         # البحث
  favorites.tsx      # المفضلة
  settings.tsx       # الإعدادات
components/          # مكوّنات الواجهة والزخارف
constants/           # لوحة الألوان والخطوط
data/hisn.json       # محتوى الأبواب والأذكار
lib/                 # طبقة البيانات والبحث وحالة التطبيق
assets/fonts/        # خطوط عربية
```

## ملاحظات

- الخطوط العربية المستخدمة: Amiri وAref Ruqaa (رخصة SIL Open Font License).
- جميع نصوص الأذكار مأخوذة كما هي من قاعدة البيانات المصدرية دون تعديل.
- نسخة iOS غير مدعومة في هذه النسخة؛ التطبيق موجّه لأندرويد والويب.
