# MEDORA Reels & TikTok Long Vertical Master v3

## Deliverable

This revision provides a **90.005-second native vertical `1080×1920` (`9:16`) MEDORA master** intended for Instagram Reels and TikTok. It replaces the short square viewing-master concept with a long social edit and keeps the mobile-compatible H.264/AAC, `faststart` export path established in the recovery revision.

The output is:

`/home/ubuntu/medora_video_assets/MEDORA_reels_tiktok_vertical_long_en_captioned_v3.mp4`

It includes original Arabic male narration, original electronic/percussive music, authored MEDORA cards, and **embedded English captions**. The captions are deliberately conservative, time-aligned summaries of the documented editorial sequence rather than a claimed verbatim transcript. They do not add approval, clinical, integration, or autonomous-AI claims.

## Source and caption boundary

The underlying long vertical edit is the reviewed `MEDORA_vertical_social_master_v1.mp4`, previously built only from user-authorized human-action windows and independently authored MEDORA cards. Its source exclusions continue to apply: inherited UI, readable source documents, third-party logos, external badges, maps, source subtitles, source music, source narration, customer data, and unsupported claims.

The English caption sidecar is:

`/home/ubuntu/medora_video_assets/working/reels_tiktok_vertical_audit/medora_vertical_long_en_captions_v3.ass`

It keeps caption placement above the platform-control zone while leaving the upper title zone and central human action readable. The final caption burn-in script is:

`/home/ubuntu/medora_video_assets/working/reels_tiktok_vertical_audit/build_medora_vertical_long_en_captioned_v3.sh`

## Technical verification

| Property | Verified value |
|---|---|
| Runtime | 90.005 seconds |
| Frame | 1080 × 1920, 9:16, 24 fps |
| Video | H.264 / AVC Main profile, Level 4.1, `yuv420p` |
| Audio | AAC-LC, 48 kHz, stereo |
| MP4 behavior | `faststart` enabled |
| File size | 45,629,335 bytes |

The final file completed a full `ffmpeg -v error` decode without errors. Audible audio samples were present at 2, 45, and 87 seconds, with mean levels of `-19.9 dB`, `-19.6 dB`, and `-31.1 dB` respectively. A five-point contact review checked the opening, two early/middle positions, late action, and close; English captions were visible and readable in the reviewed frames, the MEDORA card remained intact, and no newly introduced source interface or unsafe claim was observed.

## Claims and platform boundary

This is a decision-support and operational-visibility film. It does not state or imply GAHAR approval, a live regulator connection, confirmed e-invoicing connectivity, an autonomous AI decision, a clinical outcome, or a customer result. Reels and TikTok may independently transcode uploads; the evidence here verifies the delivered MP4 locally, not the behavior of every third-party upload client or platform player.
