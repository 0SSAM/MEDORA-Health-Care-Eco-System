# MEDORA Monitoring & Logging Guide
## دليل مراقبة الأداء وتسجيل السجلات لنظام MEDORA

This guide outlines the strategy for monitoring the health, performance, and security of the MEDORA system in production. / يوضح هذا الدليل استراتيجية مراقبة صحة وأداء وأمان نظام MEDORA في بيئة الإنتاج.

---

### 1. Container Logs | سجلات الحاويات
The primary source of application logs is the Docker container output. / المصدر الرئيسي لسجلات التطبيق هو مخرجات حاوية Docker.

*   **View Live Logs / عرض السجلات مباشرة:**
    ```bash
    docker logs -f medora
    ```
*   **Log Rotation / تدوير السجلات:**
    Ensure Docker is configured with the `json-file` log driver and limits to prevent disk exhaustion:
    ```json
    {
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "10m",
        "max-file": "3"
      }
    }
    ```

---

### 2. Nginx Access & Error Logs | سجلات Nginx
Nginx logs provide insights into traffic patterns, response times, and connection errors. / توفر سجلات Nginx رؤى حول أنماط حركة المرور وأوقات الاستجابة وأخطاء الاتصال.

*   **Access Logs:** `/var/log/nginx/access.log` (Traffic & Latency)
*   **Error Logs:** `/var/log/nginx/error.log` (Upstream connection issues)

---

### 3. Health Monitoring | مراقبة الصحة
MEDORA includes a built-in health check endpoint. / يتضمن نظام MEDORA نقطة تحقق من الصحة مدمجة.

*   **Endpoint:** `GET /` or `GET /healthz` (via Nginx)
*   **Verification / التحقق:**
    ```bash
    docker inspect --format '{{.State.Health.Status}}' medora
    ```
*   **Uptime Monitoring / مراقبة وقت التشغيل:**
    Use external services (e.g., UptimeRobot, BetterStack, or self-hosted Uptime Kuma) to monitor the public URL.

---

### 4. Performance Metrics | مقاييس الأداء
For deep insights, monitor the following metrics: / للحصول على رؤى أعمق، راقب المقاييس التالية:

| Metric | Tool | Goal |
|---|---|---|
| **CPU/RAM Usage** | `docker stats` | Identify resource bottlenecks |
| **Response Time** | Nginx `$request_time` | Ensure < 200ms for API calls |
| **DB Connection Pool** | MySQL `SHOW PROCESSLIST` | Monitor active connections |
| **Error Rate** | Grep 5xx in Nginx logs | Detect service instability |

---

### 5. Security Monitoring | المراقبة الأمنية
*   **Authentication Failures:** Monitor logs for repeated `401 Unauthorized` or `403 Forbidden` errors to detect brute-force attempts.
*   **Dependency Scanning:** Regularly run `pnpm audit` on the source code to detect new vulnerabilities.
*   **File Integrity:** Monitor `/opt/medora/medora.env` for unauthorized changes.

---

### 6. Recommended Stack (Advanced) | الحلول المتقدمة المقترحة
For enterprise-grade monitoring, consider:
1.  **Prometheus & Grafana:** For real-time metrics and dashboards.
2.  **ELK Stack (Elasticsearch, Logstash, Kibana):** For centralized log analysis.
3.  **Sentry:** For automated application error tracking and reporting.

---
**MEDORA | ميدورا** — Observability is the key to resilience. / المراقبة هي مفتاح الاستمرارية.
