# MEDORA Vertical Social Master v1

**Target:** A 90-second, `1080×1920` (`9:16`) social-platform edit using only authorized source footage, original MEDORA titles, Arabic male narration, and original instrumental music.

## First Vertical Recomposition Audit

The first subject-safe crop audit kept the outdoor arrival, a neutral clinician context, warehouse movement, a team-review close-up, and keyboard/action detail as candidate material. It rejected or requires alternate reframing for any view that revealed source application panels, white-screen UI, product-specific document text, map/network graphics, service-satisfaction wording, badges, or external claims. The source’s lower-third subtitles, original audio, embedded UI, and original title cards remain excluded without exception.

The vertical version is an independent editorial sequence rather than an automatic crop of the horizontal master. Each final excerpt must keep a face, hand, medicine pack, scanner, or observable professional action within the vertical center-safe area. Original MEDORA captions will remain in the upper safe area; the bottom region is reserved for platform controls and must not carry essential text.

The centre-safe sweep confirms usable material near `00–06s` (professional arrival), `20–27s` (hand-held pack and Data Matrix scanning), `35–43s` (warehouse professional movement after excluding shelf labels), and `45–48s` or `60–63s` (human workflow/review detail). It rejects the `10–15s`, `30s`, `50–55s`, and `65s` centre crops because they reveal inherited source interfaces, readable source wording, or documents that cannot be truthfully repurposed as MEDORA content.

The second sweep excludes blank/focused transitions, source access/credential graphics, dashboards, city/network maps, and embedded operational labels near `70–120s`. It retains only short, reframed human material near `120–127s` (team and warehouse movement) and `130–138s` (pharmacist interaction behind shelving), subject to final crop review. No source graphic is treated as MEDORA evidence.

## Planned Vertical Sequence and Provenance

The initial 90-second edit uses the same authorized landscape master only at `00–10s`, `19–29s`, `33–41s`, `45–50s`, `57–63s`, `110–114.2s`, `125–130s`, and `130–139.4s`. The source is cropped to an `450×800` upper-frame window before scale-up; the crop windows are recorded in `render_medora_vertical_social_master_v1.sh`. The edit slows only these distinct action excerpts by a modest 1.25 factor, then interleaves four independent MEDORA motion cards. It does not loop any source excerpt.

The soundtrack is new: one original Arabic male narration and one original instrumental score. Source narration and source music are not mapped into the final file. The planned audio mix delays narration by 2.4 seconds, holds the score below speech, and fades it in the last six seconds.

## Review Correction

The first assembled contact review exposed a residual source interface in the short `110–114.2s` quality excerpt. That excerpt has been excluded entirely rather than masked or relabelled. Its 4.2-second duration is now occupied by an independent MEDORA decision-support card that explicitly keeps the statement within human review. The replacement preserves the 90-second runtime without reusing a source interface or repeating source footage.

The visual review after correction confirms that the replacement card contains only newly authored MEDORA text and that the reviewed contact points show no source subtitle, map, badge, or source interface. The final audio mix keeps narration clear while raising the music presence in the closing card and moving its fade to the final three seconds; final sound levels are recorded only after rerendering.

## Final Render and Verification

| Property | Verified value |
|---|---:|
| Output | `/home/ubuntu/medora_video_assets/MEDORA_vertical_social_master_v1.mp4` |
| Runtime | 90.000 seconds |
| Frame | 1080 × 1920, 9:16, 24 fps |
| Video | H.264 High profile, `yuv420p` |
| Audio | AAC-LC, 48 kHz, stereo |
| File size | 177,999,267 bytes |

The completed file was decoded with both mapped streams under `ffmpeg -v error`, with no decode errors. Eight-second audio inspections found non-silent sound at 8, 45, and 82 seconds: mean levels were `-20.8 dB`, `-19.2 dB`, and `-42.6 dB`; maximum levels were `-4.9 dB`, `-3.6 dB`, and `-17.1 dB` respectively. The third sample is the deliberately quieter musical close, but it remains an active, audible AAC stream through the final card.

The reproducible source script is `/home/ubuntu/medora_reuse_assets/render_medora_vertical_social_master_v1.sh`. It is a 90-second social master built only from user-authorized source footage, original MEDORA motion cards, original Arabic narration, and original instrumental music. It remains subject to the stated no-claim, no-source-UI, and human-review boundaries.

## Claims Boundary

The narration may show and say only: ERP/CRM/HR workspaces, controlled pharmacy pack/Data Matrix workflow, organized operational visibility, e-invoicing inside approved integration boundaries, and human-reviewed decision support. It must not state or imply a regulator approval, a live third-party integration, autonomous AI, verified external connection, clinical outcome, or customer result.
