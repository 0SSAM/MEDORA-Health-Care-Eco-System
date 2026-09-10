# MEDORA Encrypted Backup Restore Drill Record

## Record identity

| Field | Value |
|---|---|
| Organization / branch | ______________________________ |
| Environment | Development / Staging / Production |
| Drill date (UTC) | ______________________________ |
| Backup artifact identifier | ______________________________ |
| Backup provider / storage class | ______________________________ |
| Key reference (never the key) | ______________________________ |
| Approved by | ______________________________ |
| Performed by | ______________________________ |
| Witness / verifier | ______________________________ |

## Preconditions

Confirm that the backup was created by the approved process, encrypted before leaving the trusted boundary, and accompanied by a checksum or manifest. Confirm that the decryption key is retrieved through the approved secret-management process and is not written into this record, the repository, application logs, or chat messages. Confirm that the restore is isolated from production until validation is complete.

## Restore checks

| Check | Result | Evidence / exception |
|---|---|---|
| Artifact integrity and checksum | Pass / Fail | __________________ |
| Decryption through approved key custody | Pass / Fail | __________________ |
| Schema/version compatibility | Pass / Fail | __________________ |
| Organization/branch/jurisdiction isolation | Pass / Fail | __________________ |
| Audit-chain verification | Pass / Fail | __________________ |
| User and role boundary verification | Pass / Fail | __________________ |
| Invoice, inventory, and balance reconciliation | Pass / Fail | __________________ |
| Offline queue and conflict records preserved safely | Pass / Fail | __________________ |
| No secrets or PHI leaked to logs or exports | Pass / Fail | __________________ |
| Recovery time observed | __________ | Target: __________ |
| Recovery point observed | __________ | Target: __________ |

## Disposition

Mark the drill **accepted**, **accepted with exceptions**, or **failed**. A failed drill requires an incident or corrective-action record and must not be hidden by overwriting the record. A successful drill is evidence for this backup version and environment only; it does not prove that every future backup or deployment is restorable.

## Arabic operating note

يجب تنفيذ الاستعادة أولاً في بيئة معزولة، والتحقق من سلامة الملف والتشفير والعزل بين المؤسسة والفروع، ثم فحص سجل التدقيق والأرصدة والبيانات الحساسة قبل السماح بأي استخدام إنتاجي. لا يجوز كتابة مفتاح فك التشفير في هذا السجل أو المستودع أو سجلات التطبيق. يجب حفظ نتيجة الاختبار كـ **ناجح** أو **ناجح مع استثناءات** أو **فاشل** مع الاحتفاظ بالأدلة والاستثناءات.
