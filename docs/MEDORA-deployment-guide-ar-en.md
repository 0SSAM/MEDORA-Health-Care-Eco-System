# MEDORA Deployment Guide | دليل نشر ميدورا

## 1. Prerequisites | المتطلبات الأساسية
- **Docker & Docker Compose** installed.
- **Nginx** installed (as a reverse proxy).
- **Domain Name** pointed to your server IP.
- **SSL Certificate** (e.g., Let's Encrypt).

- تثبيت **Docker & Docker Compose**.
- تثبيت **Nginx** (كوكيل عكسي).
- **اسم نطاق** موجه إلى عنوان IP الخاص بخادمك.
- **شهادة SSL** (مثل Let's Encrypt).

## 2. Environment Setup | إعداد البيئة
Create a `.env` file in the root directory:
```env
DATABASE_URL=mysql://user:pass@db:3306/medora
INTERNAL_SESSION_SECRET=your_secure_random_secret
PORT=3000
NODE_ENV=production
```

قم بإنشاء ملف `.env` في الدليل الرئيسي:
```env
DATABASE_URL=mysql://user:pass@db:3306/medora
INTERNAL_SESSION_SECRET=your_secure_random_secret
PORT=3000
NODE_ENV=production
```

## 3. Docker Deployment | النشر باستخدام دوكر
Run the following command to start the services:
```bash
docker-compose up -d --build
```
This will start the application and the MySQL database containers.

قم بتشغيل الأمر التالي لبدء الخدمات:
```bash
docker-compose up -d --build
```
سيؤدي ذلك إلى بدء تشغيل حاويات التطبيق وقاعدة بيانات MySQL.

## 4. Nginx Configuration | إعداد Nginx
Configure Nginx to proxy requests to the application:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

قم بتهيئة Nginx لتوجيه الطلبات إلى التطبيق كما هو موضح أعلاه.

## 5. Maintenance | الصيانة
- **Backups:** Use the `scripts/backup-db.sh` to schedule regular database backups.
- **Logs:** View logs using `docker-compose logs -f app`.

- **النسخ الاحتياطي:** استخدم `scripts/backup-db.sh` لجدولة نسخ احتياطي منتظم لقاعدة البيانات.
- **السجلات:** عرض السجلات باستخدام `docker-compose logs -f app`.
