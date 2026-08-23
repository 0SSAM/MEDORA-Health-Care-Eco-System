# MEDORA Reels & TikTok Vertical Recovery Master v2

## Purpose and corrective scope

This record covers the replacement for the short square viewing master after the user reported that the delivered file appeared corrupt and was far too short for the intended advertising use. The replacement is a **90-second native vertical 9:16 MEDORA social edit**, not a stretched or looped version of the 19.4-second square master.

The user-reported playback problem cannot be attributed to a particular device, platform upload, or attachment transfer from the local evidence alone. The earlier square file (`MEDORA_unified_live_motion_cross_platform_master_v1.mp4`) was locally probed as H.264 High / AAC-LC, 1080×1080, 24 fps, 19.416667 seconds, and fully decoded without FFmpeg errors. Its **short duration is confirmed**, and it was not appropriate as the only Reels/TikTok campaign deliverable.

## Source and editorial boundary

The recovery output remasters the previously reviewed, independent 90-second vertical MEDORA edit at:

`/home/ubuntu/medora_video_assets/MEDORA_vertical_social_master_v1.mp4`

That edit uses only the recorded user-authorized human-action source windows, independently authored MEDORA motion cards, original Arabic male narration, and original instrumental music documented in [the first vertical-master record](./medora-vertical-social-master-v1.md). It does **not** reuse, loop, or stretch the short square master. It retains the earlier source exclusions: inherited UI, embedded subtitles, source logos, product-specific document text, badges, maps, regulator marks, customer data, original source audio, and unsupported claims.

## Corrective export configuration

| Property | Verified recovery value |
|---|---|
| Output | `/home/ubuntu/medora_video_assets/MEDORA_reels_tiktok_vertical_recovery_master_v2.mp4` |
| Editorial runtime | 90.005 seconds |
| Frame | 1080 × 1920, 9:16, 24 fps |
| Video | H.264 / AVC Main profile, Level 4.1, `yuv420p` |
| Audio | AAC-LC, 48 kHz, stereo, 160 kb/s target |
| MP4 delivery behavior | `faststart` enabled for progressive mobile/web playback |
| File size | 45,512,971 bytes |

The recovery uses a fresh H.264/AAC remaster with `faststart`, rather than a raw file copy. The reproducible build command is stored at:

`/home/ubuntu/medora_video_assets/working/reels_tiktok_vertical_audit/build_medora_vertical_recovery_v2.sh`

The recovery preserves the existing Arabic narration and MEDORA Arabic on-screen copy of the long vertical source. It does **not** add a newly verified embedded English subtitle track; automated transcription was unavailable in this run, so no English translation was guessed or burned in.

## Quality checks completed

The final recovery MP4 completed a full `ffmpeg -v error` decode with no reported errors. The opening, midpoint, and closing audio checks were non-silent: mean levels measured `-19.9 dB` at 2 seconds, `-19.6 dB` at 45 seconds, and `-31.1 dB` at 87 seconds. The latter is an intentionally softer close but remains audible. A start/middle/end contact review verified the native vertical composition, MEDORA card treatment, and absence of a source interface in those sampled frames.

## Claims and platform boundary

The retained content depicts professional operations and human-reviewed decision support. It does not claim regulatory approval, a live regulator connection, GAHAR certification, confirmed e-invoicing connectivity, autonomous AI, clinical outcomes, or customer results. The master is optimized for Reels and TikTok upload, but a platform may still re-encode media after upload; successful local decode does not guarantee every third-party player, attachment client, or social upload will preserve the same bitrate or display behavior.
