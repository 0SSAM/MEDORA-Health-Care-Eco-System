# MEDORA Free Automation Engine Evaluation

**Status:** Activepieces selected as the free, self-hosted downstream receiver. This decision does not activate any external destination.

## Candidate: Activepieces

The official Activepieces open-source page describes the product as **MIT licensed**, self-hostable, and free to self-host without per-task pricing. It also identifies a core webhook capability, which is sufficient for MEDORA's deliberately narrow requirement: receive a signed outbound operational summary and route it onward without receiving commands back into MEDORA.[^1]

MEDORA would treat Activepieces as an isolated downstream automation endpoint only. The integration boundary remains HTTPS-only, HMAC-signed, scope-indexed, payload-minimized, logged, and outbound-only. It excludes patients, prescriptions, medicines, batches, prices, supplier details, credentials, and execution authority.

[^1]: [Activepieces, “Open source automation · Self-hosted Zapier alternative”](https://www.activepieces.com/open-source)

## Candidate: Node-RED

The official Node-RED site characterizes it as a Node.js-based, event-driven low-code flow platform that can run in cloud or edge environments. Its flexibility is useful, but MEDORA would have to own more of the receiving-flow security and operational governance itself.[^2]

## Decision

MEDORA selects **self-hosted Activepieces** as the optional free receiver because its MIT license and webhook-first automation model meet the narrow outbound-only requirement while keeping downstream flow administration distinct from MEDORA. The receiver must be hosted independently on an HTTPS-capable persistent environment. It remains disabled until its endpoint and an HMAC secret are supplied as server-side credentials and a signed delivery is verified; no incoming Activepieces endpoint is exposed by MEDORA.

[^2]: [Node-RED, “Low-code programming for event-driven applications”](https://nodered.org/)
