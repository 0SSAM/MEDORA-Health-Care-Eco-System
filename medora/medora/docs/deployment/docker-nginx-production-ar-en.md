# MEDORA Production Deployment Guide

## دليل نشر MEDORA في بيئة الإنتاج باستخدام Docker وNginx

**Version / الإصدار:** 1.0
**Application / التطبيق:** MEDORA | ميدورا — Integrated Health System
**Repository / المستودع:** [0SSAM/MEDORA-Integrated-Health-System](https://github.com/0SSAM/MEDORA-Integrated-Health-System)

> This guide describes a repeatable production deployment for the MEDORA application as a Docker container behind Nginx. It intentionally separates application configuration, TLS termination, secrets, database operations, and operational verification. / يشرح هذا الدليل نشر تطبيق MEDORA بطريقة قابلة للتكرار داخل حاوية Docker خلف Nginx، مع فصل إعدادات التطبيق وإنهاء TLS والأسرار وقاعدة البيانات والتحقق التشغيلي.

## 1. Deployment architecture | البنية المستهدفة

The recommended topology is:

```text
Internet
   |
   | HTTPS :443
   v
Nginx reverse proxy
   |  HTTP on a private host interface
   v
MEDORA Docker container :3000
   |
   +--> MySQL/TiDB database over a private network
   +--> approved object storage / external services as configured
```

Nginx terminates TLS, redirects HTTP to HTTPS, forwards the browser-visible host and protocol, and applies conservative request limits. The MEDORA container listens on port `3000` by default and runs as the non-root `medora` user. The image includes a health check for `/` and does not embed credentials.

> **Production boundary / حد الإنتاج:** The application image does not create a database, issue TLS certificates, or replace a secret manager. Those responsibilities belong to the hosting environment and its operational controls.

## 2. Prerequisites | المتطلبات

| Area | Requirement | متطلب |
|---|---|---|
| Host | Linux server with Docker Engine and Compose plugin | خادم Linux مثبت عليه Docker وCompose |
| DNS | An A/AAAA record for the MEDORA hostname | سجل DNS للنطاق |
| TLS | A valid certificate for the production hostname | شهادة TLS صحيحة |
| Database | Reachable MySQL/TiDB instance with migrations approved for release | قاعدة MySQL/TiDB جاهزة |
| Secrets | Runtime secret manager or protected environment file outside Git | مدير أسرار أو ملف محمي خارج Git |
| Access | SSH access and a least-privilege deployment account | حساب نشر بصلاحيات محدودة |
| Repository | Access to `0SSAM/MEDORA-Integrated-Health-System` and the approved release ref | صلاحية الوصول للمستودع |

Use a supported Node/Docker base image from the repository Dockerfile. Do not install dependencies with an unlocked command in production; the image uses `pnpm install --frozen-lockfile`.

## 3. Prepare the server | تجهيز الخادم

Create a dedicated directory and restrict its permissions:

```bash
sudo install -d -m 0750 -o "$USER" -g "$USER" /opt/medora
cd /opt/medora
```

Install Docker using the official instructions for the host distribution. Enable the service and confirm that the deployment account can invoke Docker through the approved operational policy. Do not add broad administrative access merely to simplify deployment.

Create a protected runtime environment file outside the Git working tree:

```bash
sudo install -m 0600 /dev/null /opt/medora/medora.env
sudoedit /opt/medora/medora.env
```

The file should contain only values required by the server and approved for this environment. Typical values include:

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://medora_runtime:REDACTED@db.internal:3306/medora
JWT_SECRET=REDACTED
OAUTH_SERVER_URL=https://approved-identity.example
VITE_MEDORA_SALES_CONTACT_URL=https://example.com/contact
```

Do not commit `medora.env`, paste it into an issue, include it in a Docker build context, or print it in CI logs. Use the hosting provider's secret manager when available.

## 4. Build and run the MEDORA image | بناء وتشغيل الصورة

Clone or fetch only the approved integration/release ref. The current synchronization branch is `manus/auto-sync-medora`; production should normally use an approved tag or reviewed commit rather than an unreviewed branch.

```bash
git clone https://github.com/0SSAM/MEDORA-Integrated-Health-System.git /opt/medora/source
cd /opt/medora/source
git fetch --tags origin
git checkout <approved-release-ref>
```

Before building, verify that the working tree is clean and that no secret, dependency cache, build output, local log, or presentation artifact is present in the build context:

```bash
git status --short
git diff --check
docker build --pull --tag medora:<release-id> .
```

The repository `Dockerfile` performs a multi-stage build, runs `pnpm check` and `pnpm build`, prunes production dependencies, and starts `node dist/index.js` as the unprivileged `medora` user. Run the container on a private host port:

```bash
docker network create medora-private 2>/dev/null || true

docker run -d \
  --name medora \
  --restart unless-stopped \
  --env-file /opt/medora/medora.env \
  --network medora-private \
  --health-cmd="node -e \"fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\"" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-retries=3 \
  --publish 127.0.0.1:3000:3000 \
  medora:<release-id>
```

Check container state without exposing secrets:

```bash
docker ps --filter name=medora
docker inspect --format '{{.State.Health.Status}}' medora
curl --fail --silent --show-error --head http://127.0.0.1:3000/
```

## 5. Nginx reverse proxy | إعداد Nginx

Install Nginx from the host distribution and create a site configuration such as `/etc/nginx/sites-available/medora`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name medora.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name medora.example.com;

    ssl_certificate     /etc/letsencrypt/live/medora.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medora.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    client_max_body_size 10m;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location = /healthz {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and validate the site:

```bash
sudo ln -sfn /etc/nginx/sites-available/medora /etc/nginx/sites-enabled/medora
sudo nginx -t
sudo systemctl reload nginx
```

The `X-Forwarded-Proto` header is important because MEDORA's Express server trusts exactly one managed proxy hop for browser-visible HTTPS and origin checks. Do not configure an unbounded proxy chain.

## 6. TLS and DNS | النطاق وTLS

Point the production hostname to the host before issuing a certificate. Use an approved ACME client or the organization's certificate service. Verify both the redirect and the certificate chain:

```bash
curl --fail --silent --show-error --head http://medora.example.com/
curl --fail --silent --show-error --head https://medora.example.com/
openssl s_client -connect medora.example.com:443 -servername medora.example.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

Renewal must be automated by the certificate service and tested before the current certificate approaches expiry. Never put private keys in the repository or inside the MEDORA image.

## 7. Database and migrations | قاعدة البيانات والترحيلات

Back up the database and verify restore procedures before a schema change. Run the approved migration process from a controlled release job, not from every application container start. Review migrations for organization scope, jurisdiction scope, audit behavior, and backward compatibility.

A release checklist should record the migration identifier, backup reference, operator, timestamp, rollback decision, and post-migration verification. Regulated sales, prescriptions, invoices, and controlled-substance actions must fail closed when authorization, jurisdiction readiness, or required evidence is unavailable.

## 8. Deployment and rollback | النشر والتراجع

A safe deployment sequence is:

1. Review the release commit and CI results.
2. Build a uniquely tagged image, for example `medora:2026.08.19-<sha>`.
3. Run the image in an isolated verification environment.
4. Apply approved database migrations, if any.
5. Stop the previous container only after the new image is available.
6. Start the new container with the protected environment file.
7. Wait for the Docker health check, then validate through Nginx over HTTPS.
8. Monitor application, proxy, database, and authentication metrics.
9. Retain the previous image and environment version for the approved rollback window.

Rollback should replace the container with the last known-good image and, when necessary, execute the separately approved database rollback procedure. Do not use a schema rollback that can destroy data without a tested backup and explicit authorization.

## 9. Post-deployment verification | التحقق بعد النشر

| Check | Expected result | النتيجة المتوقعة |
|---|---|---|
| `https://medora.example.com/` | HTTP 200 and MEDORA page title | صفحة MEDORA تعمل |
| `document.documentElement.lang` | `ar` on first load or configured default | اللغة الافتراضية صحيحة |
| `document.documentElement.dir` | `rtl` for Arabic and `ltr` for English | اتجاه الصفحة صحيح |
| Language switcher | Changes visible copy and persists in local storage | تبديل اللغة يعمل ويحفظ الاختيار |
| Login and protected routes | Unauthorized users do not enter workspace | المسارات المحمية آمنة |
| Docker health | `healthy` | الحاوية سليمة |
| Nginx | Valid configuration and HTTPS redirect | Nginx وTLS يعملان |
| Logs | No secrets, tokens, or passwords | السجلات خالية من الأسرار |

Run the repository checks and Playwright suite before promoting the image:

```bash
pnpm check
pnpm test
pnpm exec playwright test
```

## 10. Operations and incident response | التشغيل والاستجابة للحوادث

Monitor the container health state, Nginx 4xx/5xx rates, latency, database connectivity, authentication failures, disk usage, certificate expiry, and backup success. Keep logs centralized with access controls and retention appropriate to the environment. Do not log patient identifiers, credentials, access tokens, or secret environment values.

For a suspected security incident, preserve relevant evidence, restrict access without destroying logs, rotate affected credentials through the approved secret manager, and follow [`SECURITY.md`](../../SECURITY.md). Do not disclose a vulnerability through a public issue or Pull Request.

## References | المراجع

1. [Dockerfile reference — Docker Docs](https://docs.docker.com/reference/dockerfile/)
2. [Docker build best practices — Docker Docs](https://docs.docker.com/build/building/best-practices/)
3. [Nginx reverse proxy documentation](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
4. [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
5. [Playwright Test documentation](https://playwright.dev/docs/intro)
6. [Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html)
7. [Let's Encrypt documentation](https://letsencrypt.org/docs/)

---

**MEDORA | ميدورا** — Deploy deliberately, verify continuously, and keep regulated operations fail-closed.
**MEDORA | ميدورا** — انشر بانضباط، تحقق باستمرار، وحافظ على توقف العمليات المنظمة بأمان عند غياب الشروط المطلوبة.
