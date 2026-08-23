# MEDORA Reels & TikTok — Pre-publish QC and editing guide v4

## Publication decision

The approved long vertical master is **visually and technically suitable for TikTok**, and its newly exported 30 fps derivative is the recommended file for **both Instagram Reels and TikTok**. The earlier captioned v3 master remains a valid 1080×1920 H.264/AAC MP4, but it is 24 fps. Instagram’s published Reel guidance specifies a 30 fps minimum, so v3 should not be the selected upload for Instagram. [1]

Use this upload file:

`/home/ubuntu/medora_video_assets/MEDORA_reels_tiktok_30fps_publish_master_v4.mp4`

The 30 fps conversion repeats approved frames as required; it **does not** interpolate, synthesize, or alter the real recorded motion, narration, captions, claims, or MEDORA identity.

## Verified technical check

| Check | Captioned master v3 | Recommended publish master v4 | Assessment |
|---|---:|---:|---|
| Frame / aspect ratio | 1080×1920 / 9:16 | 1080×1920 / 9:16 | Correct for full-height vertical placement. TikTok recommends 9:16 and at least 540×960 for its in-feed specification. [2] |
| Frame rate | 24 fps | **30 fps** | v4 meets Instagram’s stated minimum 30 fps. [1] |
| Video | H.264 Main, Level 4.1, `yuv420p` | H.264 Main, Level 4.1, `yuv420p` | Mobile-compatible AVC and broadly safe chroma format. |
| Audio | AAC-LC, 48 kHz, stereo | AAC-LC, 48 kHz, stereo | Preserved in v4. |
| Runtime | 90.005 s | 90.005 s | No artificial truncation or timing expansion. |
| MP4 start | `faststart` | `faststart` | Supports progressive download/playback behavior. |
| File size / average rate | 45,629,335 bytes / 4.06 Mb/s | 45,453,865 bytes / approximately 4.04 Mb/s | Below TikTok’s cited 500 MB maximum and above its cited 516 kb/s minimum. [2] |
| Full decode | Passed | Passed | FFmpeg reported no decode error. |
| Audio samples | 2 s: −19.9 dB; 45 s: −19.6 dB; 87 s: −31.1 dB | Same | Audible at opening, middle, and soft close. |

The six-point frame review verified that MEDORA identity and English captions remain readable. Captions are intentionally placed in the lower-middle portion rather than on the extreme lower edge. This is a practical safe-frame decision, not a promise that every app version, device, account control, caption length, or interactive overlay will occupy identical pixels. TikTok explicitly notes that safe zones vary with dimension, caption length, and additional formats. [2]

## Professional transitions for the new section

Do not apply one transition type everywhere. The existing edit already has a deliberate alternation between live human action and authored MEDORA cards. Retain decisive cuts between related live-action shots; use a very short transition only when a scene changes location or moves into/out of an authored card. This protects the energetic rhythm and avoids a presentation-like slideshow effect.

| Scene change type | Recommended transition | Working duration | Rationale |
|---|---|---:|---|
| Live action → related live action | Clean cut; add a 2–3 frame dip only if the cut feels abrupt | 0–0.10 s | Keeps pace and real movement. |
| Live action → MEDORA card | Teal-tinted dip to color or opacity fade | 0.20–0.30 s | Creates a controlled separation without hiding the message. |
| MEDORA card → live action | Directional blur only if motion direction matches; otherwise a short dissolve | 0.20–0.25 s | Returns attention to the human action cleanly. |
| End card | Hold the final card, then fade audio and picture together | 0.8–1.0 s | Gives the brand a readable ending. |

In CapCut, DaVinci Resolve, or Premiere Pro, place the transition on the edit point, keep its center aligned with the cut, and preview at actual 1080×1920 output. If a transition covers the English caption, reduce it before moving the caption; captions should retain their safe placement and contrast. Avoid spins, zoom bursts, glitch overlays, and long cross-dissolves, because they compete with the live action and reduce readability.

## Background music mix for the new section

The current master already contains an original electronic/percussive score and Arabic narration. To adjust music professionally, **do not edit the mixed MP4’s audio alone**. Reopen the source assets used by the documented vertical master:

| Element | Reusable source |
|---|---|
| Arabic narration | `/home/ubuntu/medora_video_assets/MEDORA_vertical_social_arabic_narration.wav` |
| Original score | `/home/ubuntu/medora_video_assets/MEDORA_vertical_social_score.wav` |
| Rebuild reference | `/home/ubuntu/medora_reuse_assets/render_medora_vertical_social_master_v1.sh` |

Start with the narration as the dominant track. Set the music about **6–9 dB lower than the narration while speech is active**, apply a short 0.3–0.5 second music fade-in at the opening, and let the score rise only in speech gaps or on the final brand card. Use a 0.8–1.0 second fade-out at the end. Before exporting, listen through headphones and the phone speaker; if any English caption is displayed while the narration is dense, reduce the music slightly rather than raising visual effects.

The existing source build starts music at a low bed and fades it out over the final three seconds; preserve that behavior unless a newly licensed or newly generated original score is explicitly substituted. Never add platform-library music until the publishing account’s commercial-use rights and the intended paid/organic use are confirmed.

## Upload checklist

For Instagram, upload v4 and enable **Upload at highest quality** in the app’s Media quality settings. [1] For TikTok, upload v4 as MP4 and use the in-app draft preview to check the account panel, caption bar, right-side action controls, and any call-to-action overlay. [2] In both platforms, do not place a long native post caption or call-to-action over the on-video English captions; use the post description for hashtags and links instead.

> **Final recommendation:** Upload `MEDORA_reels_tiktok_30fps_publish_master_v4.mp4`, first as an unposted draft on each platform. Play it from beginning to end in the respective native preview, especially at the 45-second captioned action scene and the final brand card. The local MP4 has passed decoding and audio checks; the draft preview is the final platform-specific overlay check.

## References

[1]: https://help.instagram.com/1038071743007909 "Instagram Help Center — Reel size & aspect ratios"

[2]: https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads "TikTok for Business — In-Feed Auction Ads"
