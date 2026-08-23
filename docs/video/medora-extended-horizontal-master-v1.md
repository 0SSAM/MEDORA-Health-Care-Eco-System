# MEDORA Extended Horizontal Master v1

**Status:** Final horizontal master from the currently authorized source footage. This is a 150-second campaign edit, not a claim that further scenes, live integrations, or regulatory approvals have been independently verified.

## Deliverable

| Property | Verified value |
|---|---:|
| Output | `/home/ubuntu/medora_video_assets/MEDORA_extended_horizontal_master_v1.mp4` |
| Runtime | 150.000 seconds |
| Frame | 1920 × 1080, 16:9, 24 fps |
| Video | H.264 High profile, `yuv420p` |
| Audio | AAC-LC, 48 kHz, stereo |
| File size | 61,918,550 bytes |

## Editorial and Rights Boundary

The picture uses only short excerpts from the user-authorized `/home/ubuntu/upload/MEDORA-150s-16x9.mp4`. Every retained excerpt was independently reframed to exclude the reference film’s lower-thirds, subtitles, product interfaces, map panels, badges, original music, original narration, and unverified claims. The title cards, Arabic male narration, instrumental score, data-grid finish, scan-line finish, colour treatment, and transitions were newly created for this MEDORA cut.

The cut shows human-operated pharmacy, warehouse, purchasing, service, team, and review contexts. It communicates ERP/CRM/HR workspace connection, pack/Data Matrix workflow, e-invoicing as an **approved-integration boundary**, and AI as **human-reviewed decision support**. It does not claim GAHAR certification, external integration activation, autonomous AI, or live verification.

## Audio Production and Verification

The narration comprises three original Arabic male speech segments: operational visibility and Data Matrix, connected ERP/CRM/HR workspaces and integration boundary, then human-reviewed decision support and the MEDORA close. Two original instrumental score segments were mixed beneath narration, loudness-normalized, and exported in the final MP4 as AAC stereo.

`ffprobe` confirms both streams and their target properties. A complete `ffmpeg -v error` decode with explicitly mapped video and audio streams completed without error. Eight-second audio inspections confirm non-silent sound at 10, 75, and 135 seconds, with mean levels of `-19.0 dB`, `-18.8 dB`, and `-22.1 dB` respectively; maximum levels remained between `-4.3 dB` and `-4.5 dB`.

## Reproducibility

The edit is reproduced by `/home/ubuntu/medora_reuse_assets/render_medora_extended_master_v1.sh`. It requires the authorized source master plus the five named narration/music assets in `/home/ubuntu/medora_video_assets/`. It must not be repurposed with source text, source UI, source audio, or extra claims.
