# Communication channels integration — WhatsApp Cloud API + Twilio Programmable Voice

Date: 2026-08-28 · Branch: main · applies on top of existing customer-care & call-centre modules.

## What was already in Medora (backend, verified live)
- Call centre: `call_queues`, `call_queue_members`, `call_tickets` (channel + direction columns), `call_interactions`; tRPC: queues, addMember, listTickets, assignTicket, updateTicket, scheduleCallback, slaWatch.
- Customer care: `customer_care_cases`, `customer_care_tasks`, `customer_care_satisfaction`, `customer_profiles`; tRPC: customer360, transitionCase, transitionTask; CRM: contacts/leads/opportunities/activities.
- Policies: `server/domain/customer-care-policy.ts` (scope + offline replay), `secondary-modules-policy.ts`.

## What was added (this turn, all committed)
| File | Purpose |
|---|---|
| `server/channels/whatsapp.ts` | Pure helpers: GET webhook verification (hub.mode/verify_token/challenge), inbound message/status parsing, text & template payload builders. API shapes verified against Meta docs. |
| `server/channels/twilio.ts` | Pure helpers: create-call params, status-callback parsing, Arabic TwiML dialog, X-Twilio-Signature HMAC-SHA1 verification. |
| `server/channels/webhooks.ts` | Express router mounted at `/api/channels` (GET/POST `/whatsapp/webhook`, POST `/twilio/status`, POST `/twilio/voice`). Inbound WhatsApp → `channel_messages` row + `call_tickets` (channel=whatsapp) linked to matched `customer_profiles` by phone. |
| `server/routers/communicationChannels.ts` | tRPC: config.get/save (per org), whatsapp.sendText / sendTemplate, telephony.dialOut, messages.list, calls.list — RBAC protected, credentials live in `channel_accounts` (never committed). |
| `drizzle` SQL (applied live) | Tables `channel_accounts`, `channel_messages`, `channel_calls` executed against the live MariaDB. |

## How to connect (live)
### WhatsApp Cloud API
1. Create a Meta app → WhatsApp → add a phone number → copy **Phone number ID** and generate an **access token**.
2. Set webhook: callback URL `https://<your-domain>/api/channels/whatsapp/webhook`, verify token = `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, fields = **messages**.
3. In Medora: tRPC `communicationChannels.config.save` {channel:'whatsapp', config:{accessToken, phoneNumberId, apiVersion}} — or env vars.
### Telephony (Twilio)
1. Buy/verify a Twilio number; get Account SID + Auth Token.
2. Set env `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`/`PUBLIC_BASE_URL` (or save via tRPC config).
3. Outbound: `communicationChannels.telephony.dialOut` {to, greeting} → Twilio Calls.json → status callbacks to `/api/channels/twilio/status` update `channel_calls` + ticket status.
4. Inbound: point the number's Voice webhook to `https://<domain>/api/channels/twilio/voice` (returns Arabic TwiML + queue).
