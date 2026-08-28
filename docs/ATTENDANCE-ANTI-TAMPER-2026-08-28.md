# Mobile attendance (GPS + biometric) — anti-tamper & KPI modules — 2026-08-28

## Flow (server-authoritative)
1. Employee opens `/attendance` on mobile → browser geolocation + platform biometric (WebAuthn/fingerprint/face) on the device.
2. Client sends claims: lat/lng, deviceId, biometricMethod+verifiedAt, punchTs, mockLocationAttested, emulatorAttested.
3. Server evaluates EVERYTHING in `server/domain/attendance-tamper-policy.ts` (haversine distance vs configured `attendance_geofences`, clock skew vs server time, mock/emulator attestation, biometric method+staleness). Client values are claims, never trust.
4. Every punch is logged to `attendance_events` (outcome + reason + punchHash). Duplicate punch (same org+employee+date+type+device) rejected by SHA-256 punch hash.
5. Accepted punch upserts `employee_attendance` with `source='verified_device'`, device bindings, geofence distance, `serverReceivedAt` (server clock, not client), risk flags.

## Anti-tamper matrix (each verified live this turn)
| Control | Enforcement | Live proof |
|---|---|---|
| Geofence radius (server-side) | distance > radius → `out_of_geofence` | curl rejected |
| Mock location / emulator | client attestations force `mock_location` | curl rejected |
| Server timestamp | skew > tolerance → `clock_skew` | unit test |
| Biometric required & fresh | missing → `biometric_failed`; stale (>120s) → `biometric_stale` | curl + unit rejected |
| Replay / duplicate | SHA-256 punchHash per org/emp/date/type/device | curl rejected |
| Check-out without check-in | → `no_check_in` | implemented |
| Device binding | deviceId persisted on attendance + events | DB proof |
| Audit trail | every punch in `attendance_events` + updatedAt | DB proof |

## KPI modules (full)
- `kpi.dashboard` — 9 live KPIs (HR attendance rate/late/absences, care open/total tickets, ICD-11 coverage, delivery zones, GP MAX points, channel messages) + snapshot into `kpi_entries`.
- `kpi.definitions` / `kpi.entries` — maintained definitions and historical snapshots.
- `kpi.listRoleTemplates` / `kpi.previewRoleTemplate` — role templates with human-approval mode (existing).
- UI: `/kpi` dashboard; routes `/attendance` (mobile) + `/kpi` added in App.tsx.

## Env
ATTENDANCE_ALLOWED_CLOCK_SKEW_MINUTES=5, ATTENDANCE_REQUIRE_BIOMETRIC=true
