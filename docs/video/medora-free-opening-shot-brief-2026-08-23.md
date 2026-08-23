# MEDORA — Free Opening Shot Brief

| Field | Approved value |
|---|---|
| Purpose | A single, representative opening test for the MEDORA campaign; it is not a claim of a complete campaign master. |
| Audience | Pharmacy, healthcare-operations, and decision-maker audiences. |
| Duration | Five seconds. |
| Format | Horizontal 16:9, 720p. |
| Visual treatment | Live-action commercial realism; calm navy and cyan practical light; warm natural skin tone; restrained, credible healthcare setting. |
| Recurring visual anchor | Adult Arab pharmacist, white coat without marks, unbranded small medicine carton, handheld barcode/Data Matrix scanner, neutral modern pharmacy workspace. |
| On-screen text | None. The generated frame and clip must contain no logo, label, watermark, certification statement, patient data, screen UI, or regulatory assertion. |
| Narration | Off-screen Arabic male: “ميدورا، حيث تتصل الرعاية بكل خطوة.” The separately generated narration may be used only after its duration is aligned to the final clip. |
| Music and effects | Low, restrained electronic pulse and a quiet scanner confirmation; no source audio is reused. |
| Reference | `/home/ubuntu/webdev-static-assets/medora-opening-pharmacist-datamatrix-reference-16x9.png` when generation has completed. |

## Clip specification

| Field | Value |
|---|---|
| Narrative purpose | Establish a traceable, focused medication-handling workflow without claiming compliance, approval, or system performance. |
| Pacing | Moderate. |
| Camera | A slow, physically plausible dolly-in from a medium three-quarter view to a closer view of the scanner and carton. |
| First frame | The pharmacist stands at the work surface, visible throughout the shot; the carton is already in the left hand and the scanner is already in the right hand. |
| Action | The pharmacist brings the scanner forward over roughly two seconds, pauses briefly for the scan, then lowers it slightly while remaining in the same workstation. |
| Transition description | The same adult pharmacist in an unmarked white coat remains at the work surface for the entire clip; the unbranded carton and handheld scanner are present from the first frame and never change hands. The camera moves forward slowly and smoothly on a short dolly path while the pharmacist brings the scanner toward the carton, holds the pose during a quiet scan confirmation, then relaxes the scanner a few centimetres. Pharmacy shelving remains softly out of focus in the background, with no screens, labels, patient information, logos, or additional people entering frame. The exposure stays stable with subtle navy/cyan practical light and warm neutral skin tones. |
| Boundary | Single self-contained scene; no cut to another room, UI, report, patient, or warehouse. |

## Safety and acceptance gates

The test must use **one generation request only** and must not be retried solely for taste or polish. A technically valid resulting file is checked only for decodability, 16:9 framing, absence of obvious prohibited on-screen claims or data, and basic continuity. It must not be described as regulatory validation, a real system demonstration, or a substitute for approved production footage.

If the platform rejects the request because a free-generation quota is exhausted, the exact rejection is recorded and no paid or unauthorised route is attempted.
