# دليل تنفيذ نظام Sensor Fusion لمنع التلاعب بالموقع الجغرافي (GPS Spoofing)
## مشروع MEDORA | ميدورا للرعاية الصحية

يعتبر نظام **Sensor Fusion** أحد أقوى الحلول التقنية لمنع التلاعب بالموقع الجغرافي، حيث يعتمد على مقارنة البيانات الفيزيائية من حساسات الهاتف (مثل التسارع والجاذبية) مع التغير في إحداثيات الـ GPS.

### 1. المبدأ التقني (Technical Principle)
في الحالات الطبيعية، عندما يتحرك الموظف لتسجيل الحضور، يجب أن ترصد حساسات الحركة (Accelerometer) نشاطاً فيزيائياً يتناسب مع التغير في الموقع. تطبيقات الـ **Mock Location** تقوم بتغيير الإحداثيات برمجياً بينما يظل الهاتف ثابتاً فيزيائياً، وهذا هو "التناقض" الذي نكشفه.

### 2. خطوات التنفيذ البرمجية (React Native / Expo)

#### أ. جمع بيانات الحساسات (Client-Side)
يتم رصد الحركة خلال الـ 10 ثواني التي تسبق عملية البصمة.

```typescript
import { Accelerometer } from 'expo-sensors';

let movementScore = 0;

// البدء في مراقبة الحساسات
const startMonitoring = () => {
  Accelerometer.setUpdateInterval(100); // تحديث كل 100 ملي ثانية
  const subscription = Accelerometer.addListener(data => {
    // حساب القوة المحصلة (Magnitude)
    const totalForce = Math.sqrt(data.x**2 + data.y**2 + data.z**2);
    // إذا كانت القوة أكبر من الجاذبية الأرضية (1G)، فهناك حركة فيزيائية
    if (Math.abs(totalForce - 1) > 0.1) {
      movementScore += 1;
    }
  });
  return subscription;
};
```

#### ب. حساب معامل التحقق الفيزيائي (Physical Verification Score)
نقوم بمقارنة الـ `movementScore` مع سرعة الانتقال المسجلة عبر الـ GPS.

| الحالة | بيانات الـ GPS | بيانات الحساسات | النتيجة |
| :--- | :--- | :--- | :--- |
| **طبيعية** | تغيير في الموقع | نشاط حركي مسجل | **مقبول (Verified)** |
| **تلاعب (Spoofing)** | تغيير في الموقع | الهاتف ثابت تماماً | **مرفوض (Spoofed)** |
| **ثبات** | الموقع ثابت | الهاتف ثابت | **مقبول (Stationary)** |

### 3. التحقق في الخلفية (Backend Validation)
يتم إرسال معامل الحركة مع طلب البصمة ليقوم الخادم باتخاذ القرار النهائي.

```typescript
// في ملف server/routers/attendance.ts
if (input.latitude && input.longitude) {
  const movementDetected = input.movementScore > threshold;
  const locationChanged = checkLocationChange(lastLocation, currentCoords);

  if (locationChanged && !movementDetected) {
    // رصد تناقض: الموقع يتغير والحساسات لا ترصد حركة
    await triggerSecurityAlert("محاولة تلاعب فيزيائي بالموقع");
    throw new TRPCError({ code: "FORBIDDEN", message: "تلاعب فيزيائي مكتشف" });
  }
}
```

### 4. أفضل الممارسات الأمنية (Best Practices)
1. **Cross-Validation:** لا تعتمد على مصدر واحد؛ قارن بين GPS، أبراج الجوال (Cell ID)، وشبكات الـ Wi-Fi المحيطة.
2. **Jitter Analysis:** تطبيقات التزييف تعطي إحداثيات "نظيفة جداً"، بينما الـ GPS الحقيقي يحتوي دائماً على "اهتزاز" (Jitter) بسيط حتى عند الثبات.
3. **Hardware Integrity:** استخدم APIs مثل `Google Play Integrity` أو `Apple DeviceCheck` للتأكد من أن نظام التشغيل لم يتم العبث به (Rooted/Jailbroken).

### 5. الخلاصة
تطبيق **Sensor Fusion** يحول الهاتف من مجرد مستقبل إحداثيات إلى "مستشعر فيزيائي" متكامل، مما يجعل عملية تزوير الحضور تتطلب معدات معقدة جداً تتجاوز قدرة المستخدم العادي وتطبيقات الـ Mock Location البسيطة.

---
**إعداد:** مساعد MEDORA الذكي (AI Assistant)
**التاريخ:** أغسطس 2026
