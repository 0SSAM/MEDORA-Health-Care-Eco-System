# Trusted-device attestation contract

## Security boundary

Offline healthcare replay must use a device-trust assertion that is issued or verified by an authorized client trust mechanism. Browser-reported properties such as user agent, platform name, screen-lock hints, local storage availability, or network state are not security evidence because they can be modified by an untrusted client.

## Required server-side claims

The replay request must be associated with a stable device identifier, the authenticated actor and organization/branch/jurisdiction scope, an encrypted local-storage assurance, a supported application version, a screen-lock assurance, an active non-revoked device state, and an expiry or freshness value. The server must validate the claims against an authoritative device-registration or attestation service before allowing regulated replay.

| Claim | Required treatment |
|---|---|
| Device identity | Must be bound to an authorized device registration; client-generated random IDs are insufficient by themselves. |
| Local encryption | Must be attested by the approved native client/MDM or equivalent trusted control; a browser flag is insufficient. |
| Supported version | Must be checked against the server policy and revoked versions. |
| Screen lock | Must be attested by the trusted client or device-management control. |
| Revocation | Must be checked server-side before replay and must fail closed when status is unavailable. |
| Scope | Must match the authenticated actor, organization, branch, and jurisdiction. |
| Freshness | Must prevent replay of stale attestation evidence and support emergency revocation. |

## Approved implementation paths

A future implementation may use a native iOS/Android client with platform attestation, a managed Windows client with enterprise device-management attestation, or an approved enterprise identity/device-trust provider. The exact provider, key registration, certificate chain, nonce handling, key rotation, and revocation endpoint must be selected and configured before enabling the feature.

Until one of these paths is supplied and tested, the server gate and user interface remain fail-closed. The current browser application deliberately does not manufacture an attestation or treat browser capabilities as proof of device trust.
