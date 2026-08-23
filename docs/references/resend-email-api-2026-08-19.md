# Resend Email API Reference Snapshot

**Retrieved:** 2026-08-19
**Source:** [Resend — Send Email API](https://resend.com/docs/api-reference/emails/send-email)

The official API reference describes a `POST` email-send operation. The request requires a sender (`from`), one or more recipients (`to`), and a `subject`; it accepts both HTML and plaintext message bodies. It also supports an `Idempotency-Key` request header, which is unique per API request, valid for 24 hours, and limited to 256 characters.

MEDORA will use the configured server-only sender credential and sender address, resolve a single authorized recipient at delivery time, send a minimal aggregate summary, and derive a bounded idempotency key from the scheduled report run and definition. The integration will not include report attachments, patient records, credentials, or raw operational rows.
