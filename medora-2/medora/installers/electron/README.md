# MEDORA Desktop (Electron wrapper)

مغلف سطح مكتب خفيف يفتح تطبيق ميدورا (الويب) في نافذة أصلية.

## بناء محليًا (مطلوب — بيئة البناء هنا لا تنتج ثنائيات exe/apk/ipa)
```bash
cd installers/electron
npm install
MEDORA_APP_URL="http://localhost:3000" npm start        # تشغيل الواجهة
npm run dist                                             # إنشاء AppImage/dmg/nsis
```

## الوضع الصادق
- لايوجد في هذه البيئة سلاسل أدوات Electron/Android SDK/Xcode → **لا تُنتَج هنا ملفات exe/apk/ipa**.
- البديل الجاهز والمُدفوع: **PWA** (`client/public/manifest.webmanifest` + `sw.js`) — تثبيت من المتصفح على أندرويد/iOS/سطح المكتب.
- هذا المجلد = نقطة بداية مطوّرة للمسار الأصلي.
