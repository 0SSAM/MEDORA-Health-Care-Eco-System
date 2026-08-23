# خارطة حماية التقاط الشاشة في الأغلفة الأصلية

## Android

يُطبّق الغلاف الأصلي `FLAG_SECURE` على Activity التي تعرض الشاشات الحساسة، خصوصًا POS والتقارير والبيانات الصحية، مع تفعيل حماية شاشة الخلفية. وعلى Android 14 أو أحدث يمكن إضافة Screenshot Detection API لتسجيل حدث الالتقاط وإخفاء المحتوى أو إنهاء العرض الحساس عند اكتشافه. لا تُعتبر هذه الحماية بديلًا عن العزل والصلاحيات، ولا تمنع التصوير بجهاز خارجي أو جميع هجمات الطبقات/الأجهزة.

## iOS

لا يوفر UIKit آلية عامة مضمونة لمنع screenshot في كل الحالات. يعتمد الغلاف على `UIScreen.capturedDidChangeNotification` و`UIScreen.isCaptured` لاكتشاف التسجيل أو العرض المرآتي، ثم يضع طبقة تعمية/إخفاء فوق البيانات الحساسة ويوقف العمليات الحساسة حتى عودة الشاشة إلى حالة آمنة. يجب أيضًا تغطية شاشة التطبيق عند الانتقال إلى الخلفية عبر lifecycle handlers. هذا المسار يكتشف حالات الالتقاط المدعومة ولا يضمن منع كل screenshot.

## HarmonyOS

يُنفّذ المسار عبر واجهة الخصوصية/تقييد التقاط الشاشة التي يثبتها إصدار HarmonyOS SDK المستهدف، مع اختبار فعلي على الأجهزة والإصدارات المدعومة قبل الإعلان عن التوافق. عند اكتشاف الالتقاط أو تعذر فرض تقييد النظام، يستخدم الغلاف نفس سياسة iOS: إخفاء البيانات، إيقاف الإجراء الحساس، وإظهار رسالة عربية واضحة. لا يُفعل أي API غير مثبت في SDK المشروع، ولا تُستخدم أسماء واجهات تخمينية.

## واجهة مشتركة للمنصات

يوفر الغلاف الأصلي bridge موحدًا بأربع حالات: `protected`، `capture-detected`، `unsupported`، و`error`. عند `capture-detected` أو `error` تُزال البيانات الحساسة من العرض، وتظل سجلات التدقيق مقتصرة على الحدث والهوية والنطاق والوقت دون حفظ صورة أو إطار فيديو. ويبقى غلاف الويب الحالي هو خط الحماية الأساسي عند فتح النظام من المتصفح أو PWA.

## حدود أمنية إلزامية

لا يمكن لأي واجهة تطبيق ضمان منع الالتقاط عبر جهاز خارجي، نظام تشغيل مخترق، صلاحيات root/jailbreak، أو تصوير الشاشة بكاميرا أخرى. لذلك تُستخدم العلامة المائية، تقليل البيانات المعروضة، الإخفاء عند فقدان الرؤية، صلاحيات الخادم، وسجل التدقيق كطبقات دفاع متراكبة بدل وعد تقني غير قابل للتحقق.

## مراجع

[Android secure sensitive activities](https://developer.android.com/security/fraud-prevention/activities)؛ [Android 14 screenshot detection](https://developer.android.com/about/versions/14/features/screenshot-detection)؛ [Apple capturedDidChangeNotification](https://developer.apple.com/documentation/uikit/uiscreen/captureddidchangenotification)؛ [Huawei Developer FAQ](https://developer.huawei.com/consumer/en/doc/harmonyos-faqs/faqs-ability-112).
