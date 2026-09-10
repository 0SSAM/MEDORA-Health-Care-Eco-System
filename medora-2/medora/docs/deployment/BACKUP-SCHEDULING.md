# MEDORA Automated Backup Scheduling
## جدولة النسخ الاحتياطي التلقائي لنظام MEDORA

This document explains how to schedule the `backup-db.sh` script to run automatically using Cron. / يوضح هذا المستند كيفية جدولة سكربت النسخ الاحتياطي ليعمل تلقائياً باستخدام Cron.

---

### 1. The Backup Script | سكربت النسخ الاحتياطي
The script is located at `scripts/backup-db.sh`. It performs a full MySQL dump, compresses it, and applies a 7-day retention policy. / يقع السكربت في `scripts/backup-db.sh` ويقوم بعمل نسخة كاملة وضغطها مع الاحتفاظ بنسخ آخر 7 أيام فقط.

### 2. Scheduling with Cron | الجدولة باستخدام Cron
To run the backup every night at 2:00 AM, follow these steps: / لتشغيل النسخ الاحتياطي كل ليلة في الساعة 2 صباحاً، اتبع الخطوات التالية:

1.  Open the crontab editor for the root user: / افتح محرر crontab للمستخدم root:
    ```bash
    sudo crontab -e
    ```

2.  Add the following line at the end of the file: / أضف السطر التالي في نهاية الملف:
    ```text
    0 2 * * * /opt/medora/scripts/backup-db.sh >> /var/log/medora-backup.log 2>&1
    ```

3.  Save and exit. / احفظ واخرج.

### 3. Verification | التحقق
Check the backup log to ensure it's running correctly: / تحقق من سجل النسخ الاحتياطي للتأكد من عمله بشكل صحيح:
```bash
tail -f /var/log/medora-backup.log
```

### 4. Off-site Backups (Recommended) | النسخ الاحتياطي الخارجي (موصى به)
For maximum safety, it is recommended to sync the `/opt/medora/backups` directory to an off-site location (e.g., S3, Google Cloud Storage, or another server) using `rclone` or `rsync`. / لأقصى درجات الأمان، يوصى بمزامنة مجلد النسخ الاحتياطي إلى موقع خارجي.

---
**MEDORA | ميدورا** — Data integrity is our priority. / سلامة البيانات هي أولويتنا.
