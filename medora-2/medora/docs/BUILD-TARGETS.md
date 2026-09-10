# أهداف البناء (exe / apk / ipa)
- **zip المصدر + الويب المبني (PWA):** يُبنى على أي نظام — الملف المرفق.
- **Windows .exe:** يتطلب إضافة Electron/Tauri (غير موجودة بالمستودع) + سلسلة أدوات Windows. غير مُبنى هنا.
- **Android .apk:** يتطلب Capacitor/Cordova مهيأ فعليًا + Android SDK + توقيع. مجلد native-wrapper-reference/android مرجعي فقط. غير مُبنى هنا.
- **iOS .ipa:** يتطلب macOS + Xcode + Apple signing. مستحيل في بيئة Linux.
- الواجهة React/Vite ثابتة بالكامل → يمكن حزمها بأي غلاف لاحقًا من نفس dist/.
