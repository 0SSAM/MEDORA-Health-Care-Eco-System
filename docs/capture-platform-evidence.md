# Capture protection platform evidence

- Android official guidance: `FLAG_SECURE` tells Android not to allow screenshots or display the window on a non-secure display; Android also cautions it is not reliable for all overlay attacks and older devices vary. Source: https://developer.android.com/security/fraud-prevention/activities
- Apple UIKit official guidance: `UIScreen.capturedDidChangeNotification` is posted when screen capture status changes; the screen may be recorded, mirrored, sent over AirPlay, or cloned. Source: https://developer.apple.com/documentation/uikit/uiscreen/captureddidchangenotification
- These sources support a native wrapper roadmap, not an absolute cross-platform guarantee. The web layer remains responsible for fail-safe redaction and watermarking.

تعذر استخراج نص قابل للتحقق من صفحة Huawei Developer في جلسة المتصفح الحالية، رغم أن الرابط الرسمي هو https://developer.huawei.com/consumer/en/doc/harmonyos-faqs/faqs-ability-112. لذلك يقتصر توثيق HarmonyOS في خارطة الطريق على استخدام واجهات الخصوصية/تقييد الالتقاط التي يثبتها إصدار SDK المستهدف أثناء بناء الغلاف الأصلي، ولا تُعلن MEDORA دعمًا أو منعًا عامًا قبل اختبار الجهاز والإصدار فعليًا.
