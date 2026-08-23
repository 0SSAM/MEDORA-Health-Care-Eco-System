# MEDORA Bilingual Live-Action Masters v1 — Provenance and Verification Record

## Deliverables

| Edition | File | Duration | Voice-over | Burned-in subtitles |
|---|---|---:|---|---|
| English-led | `MEDORA_live_action_english_voice_arabic_subtitles_v1.mp4` | 43.500 s | Original energetic English male narration | Arabic |
| Arabic-led | `MEDORA_live_action_arabic_voice_english_subtitles_v1.mp4` | 54.417 s | Original energetic Modern Standard Arabic male narration | English |

Both files are 16:9, 1920×1080 H.264 exports with AAC-LC 48 kHz stereo audio. They are campaign recuts, not evidence of a newly generated live-action production.

## Source and Creative Boundaries

The images are derived only from user-authorized video supplied in this workspace: `MEDORA_extended_horizontal_master_v1.mp4` and `medora-shot-03-pharmacy-traceability-horizontal.mp4`. The approved live-action excerpts show generic human arrival, physical package handling, scanner interaction, warehouse activity, team review, and operational focus. Each retained excerpt from the earlier master was cropped below its inherited upper strip before new overlays were applied.

The project uses newly authored English and Arabic narration, newly generated original electronic/percussive instrumental music, manually timed opposing-language ASS captions, a MEDORA logo overlay, and a new MEDORA end card. It does **not** reuse source narration, source music, source subtitles, source lower-thirds, source UI, source title cards, or package data. The supplied opening clip's tablet/UI close-up was not used.

> **Claim boundary.** The campaign describes workflow visibility, traceability support, defined roles, quality indicators, and human review. It does not claim regulator approval, an active third-party integration, clinical accuracy, a live connection, autonomous AI decision-making, or a certification.

## Quality-Control Record

| Check | English-led edition | Arabic-led edition |
|---|---|---|
| Full decode | Passed with no FFmpeg decode errors | Passed with no FFmpeg decode errors |
| Video/audio streams | H.264 1920×1080; AAC 48 kHz stereo | H.264 1920×1080; AAC 48 kHz stereo |
| Audio sample windows | Non-silent at 2.0 s, 21.75 s, 40.50 s | Non-silent at 2.0 s, 27.21 s, 51.42 s |
| Subtitle pairing | English narration with Arabic captions | Arabic narration with English captions |
| Visual contact-sheet review | MEDORA mark, Arabic captions, cropped source strip, end card confirmed | MEDORA mark, English captions, cropped source strip, end card confirmed |

## Reproduction Material

The working directory contains `build_bilingual_editions.sh`, both ASS caption files, original narration WAVs, the original music WAV, and review contact sheets. Rebuild only in a controlled workspace after confirming that the same source permissions and approved claim set remain valid.
