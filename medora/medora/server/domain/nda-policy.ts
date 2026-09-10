import { createHash } from "node:crypto";

export const MEDORA_NDA_VERSION = "2026-08-22";

export const MEDORA_NDA_TEXT = {
  ar: `اتفاقية عدم الإفصاح واستخدام MEDORA

قبل الدخول إلى MEDORA أو استخدامها، يقر المستخدم بأنه سيحافظ على سرية كل المعلومات غير العامة التي يطّلع عليها، بما في ذلك بيانات التشغيل، البيانات الصحية والشخصية، هيكل النظام، الشيفرة المصدرية، التصميمات، الخطط، الوثائق، المفاتيح، وبيانات الاعتماد. لا يجوز نسخ هذه المعلومات أو تصويرها أو تسجيلها أو مشاركتها أو استخدامها خارج الغرض المصرّح به، إلا بموافقة كتابية مسبقة من صاحب الحقوق.

تظل الملكية الفكرية وحقوق المؤلف والعلامات التجارية والمواد السرية الخاصة بـ MEDORA ومالكيها محفوظة. يلتزم المستخدم بإبلاغ الجهة المالكة فوراً عن أي وصول أو إفصاح أو فقدان غير مصرح به. هذه البوابة توثق قبول المستخدم ولا تمنح حق ملكية أو ترخيصاً أوسع من الصلاحية الممنوحة له. عند عدم الموافقة، يجب الامتناع عن استخدام النظام وتسجيل الخروج.

هذه صياغة تشغيلية يجب أن يراجعها مستشار قانوني مؤهل قبل اعتمادها كعقد نهائي في كل ولاية قضائية.`,
  en: `MEDORA Non-Disclosure and Use Agreement

Before accessing or using MEDORA, the user agrees to keep confidential all non-public information seen through the system, including operational, health and personal data, system architecture, source code, designs, plans, documents, keys, and credentials. Such information must not be copied, captured, recorded, shared, or used outside the authorized purpose without prior written permission from the rights holder.

MEDORA and its owners retain all intellectual-property, copyright, trademark, and confidential-information rights. The user must promptly report any unauthorized access, disclosure, or loss. This gate records acceptance; it does not grant ownership or a broader license than the user’s assigned authorization. If the user does not agree, the user must not use the system and should sign out.

This is an operational template and requires review by qualified legal counsel before adoption as a final agreement in every jurisdiction.`,
} as const;

export const MEDORA_NDA_HASH = createHash("sha256")
  .update(`${MEDORA_NDA_VERSION}\n${MEDORA_NDA_TEXT.ar}\n${MEDORA_NDA_TEXT.en}`)
  .digest("hex");

export type NdaSurface = "web" | "mobile_webview" | "desktop_wrapper" | "unknown";

export type NdaAcceptanceSnapshot = {
  documentVersion: string;
  documentHash: string;
} | null | undefined;

export function isCurrentNdaAcceptance(acceptance: NdaAcceptanceSnapshot) {
  return Boolean(
    acceptance
    && acceptance.documentVersion === MEDORA_NDA_VERSION
    && acceptance.documentHash === MEDORA_NDA_HASH,
  );
}

export function getNdaDocument() {
  return {
    version: MEDORA_NDA_VERSION,
    hash: MEDORA_NDA_HASH,
    text: MEDORA_NDA_TEXT,
  };
}
