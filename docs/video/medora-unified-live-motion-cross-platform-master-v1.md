# MEDORA Unified Live-Motion Cross-Platform Master v1

## Scope

This record documents a single **19.40-second square (`1:1`) live-motion master** for MEDORA Health Care Eco System. It was created to remain legible and useful in web embeds, desktop players, mobile devices, chat applications, and typical social feeds. It is a cross-platform **viewing master**, not a claim that every platform will preserve its original encoding, bitrate, aspect ratio, duration limit, or upload requirements.

## Final file

| Property | Verified value |
|---|---|
| Filename | `MEDORA_unified_live_motion_cross_platform_master_v1.mp4` |
| Container | MP4 with fast-start metadata |
| Video | H.264 High Profile, `1080×1080`, 24 fps, `yuv420p` |
| Audio | AAC-LC, stereo, 48 kHz, 192 kb/s target |
| Duration | 19.40 seconds |
| Narration | Original Arabic male narration |
| Captions | Embedded English captions, manually timed |
| Music | Original modern electronic/percussive instrumental, ducked below narration |
| Brand treatment | MEDORA upper-right identity bug on all live scenes and independently authored end card |

## Authorized visual provenance

The visual material is derived only from the user-authorized campaign master `MEDORA_extended_horizontal_master_v1.mp4`, whose provenance was recorded in `docs/video/medora-extended-horizontal-master-v1.md`. All inherited source audio is discarded. The permitted portions are narrow square crops reviewed in a contact sheet before use:

| Source time range | Use in final master | Protection decision |
|---|---|---|
| 3.0–7.3 s | Workplace movement / opening and callback | `980×980` crop reviewed for removal of inherited lower text |
| 38.0–42.3 s | Human pharmacy action | `500×500` human-only crop excludes headline, interface, package, and readable shelf material |
| 45.0–49.3 s | Human warehouse action | `500×500` human-only crop excludes headline and readable carton labels |
| N/A | Closing end card | Independently authored MEDORA frame |

The review rejected other candidate segments when inherited cards, interface fragments, labels, or text remained visible. No blur was used to disguise such material; the affected scenes were excluded.

## Claims and safety boundary

The narration describes operational visibility, organization, follow-up, and human review. It describes AI only as decision support and explicitly states that it does not replace people. The master makes **no** claim of regulator approval, GAHAR certification, live external integration, clinical outcome, autonomous medical decision-making, or active connection to third-party systems.

## Quality verification

The final MP4 was fully decoded after export. `ffprobe` confirmed H.264 video at `1080×1080` / 24 fps and AAC stereo at 48 kHz; the measured duration was **19.416667 seconds**. Opening, midpoint, and closing audio windows measured mean levels of **−18.8 dB**, **−21.6 dB**, and **−17.4 dB**, respectively, confirming audible narration/music throughout. A time-spread square contact sheet was visually checked for live-action continuity, readable English captions, fixed MEDORA identity, and the absence of inherited source UI, subtitle bands, readable labels, or other source text. The source audio track is not mapped into the final file.

The reusable `quota-aware-cinematic-video-production` Skill was also revalidated with its documented validator after the unified-master workflow was added.

## Distribution note

The `1:1` master is intentionally resilient across common surfaces. A platform may still transcode, crop within player chrome, mute autoplay, letterbox, or impose upload limits. Use native `9:16` or `16:9` edits only where a particular placement requires them; do not stretch this master.
