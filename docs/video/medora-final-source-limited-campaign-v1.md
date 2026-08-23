# MEDORA — Final Source-Limited Campaign v1

**Status:** Finalised short-form cut using the approved user-supplied footage available in this task. This file is **not** represented as the planned 150-second master, because the supplied material safely supports only the selected scanning and operating fragments without repetition, unsupported source cards, or fabricated scenes.

## Production Scope

| Item | Decision |
|---|---|
| Output | 16:9 H.264 MP4 with AAC stereo audio, approximately 27.6 seconds |
| Source footage | User-authorized `MEDORA-150s-16x9.mp4`, selectively reframed excerpts near 26–33 seconds; the earlier operating excerpts with a source UI were removed from the final cut |
| Visual finish | Deep navy/teal grade, restrained vignette, data-grid overlays, scanner line, title motion, and caption cards |
| Narration | Newly produced Arabic male voice-over; it describes human review, pack inspection, Data Matrix scanning, organized operations, and data-supported decisions only |
| Music | Newly produced original instrumental score, mixed below narration |
| Exclusions | Source subtitles, source UI, third-party/product names, readiness badges, regulator claims, e-invoicing claims, autonomous-AI claims, source narration, and source music |

## Final Spoken Text

> في MEDORA، تبدأ الثقة من إنسان يراجع كل خطوة. من فحص العبوة ومسح Data Matrix، إلى تنظيم العمليات ودعم القرار بالبيانات. سير عمل أوضح، ومسؤولية بشرية في كل مرحلة. MEDORA Health Care Eco System.

## Claims Boundary

The film deliberately depicts operational workflow and human-reviewed decision support. It does not assert regulator approval, a live external integration, clinical effectiveness, autonomous AI, or a specific data-exchange status.

## Verification Required After Render

Inspect the exported file with `ffprobe` for both video and audio streams. Play representative opening, middle, and closing samples to confirm the Arabic narration is audible, the music remains below speech, and the final title is legible. Preserve the three source paths, export metadata, and inspection result alongside the deliverable.

## Completed Verification

The final render is `/home/ubuntu/medora_video_assets/MEDORA_final_source_limited_campaign_v1.mp4`. `ffprobe` confirms a 27.600-second `1920×1080` H.264 video stream at `24 fps`, together with AAC stereo audio at `96 kHz`; the exported file is 10,433,109 bytes. The opening, middle, and closing four-second audio samples returned non-silent mean levels of `-20.4 dB`, `-17.8 dB`, and `-22.1 dB` respectively, with maximum levels of `-1.6 dB`, `-2.1 dB`, and `-5.0 dB`.

The visual contact-sheet review confirms that source subtitles and source interface panels are excluded from the selected final reframes. The output retains only the human pharmacy workflow, independent MEDORA end cards, restrained teal data-grid and scan-line finishing, plus the new narration and instrumental score.

Finally, the complete MP4 was decoded with both mapped streams under `ffmpeg -v error`; it completed with no decode errors. This validates file integrity and playback readiness, while the source-limited duration statement above remains in force.

## Source Expansion Audit — 2026-08-22

A five-second contact audit of the complete 150-second user-supplied master identified additional human-operated, potentially reusable footage: an exterior arrival, pharmacy pack handling, warehouse movement, clinician and counter workflows, team collaboration, purchasing paperwork, controlled-access context, service work, and mixed operations teams. All of these remain **candidate visuals only** until individually reframed to remove the source’s embedded subtitles, product/UI panels, maps, badges, and unsupported claims.

The expanded cut will communicate only verified capability boundaries: connected ERP/CRM/HR workspaces, pharmacy pack/Data Matrix workflow, operational readiness as a team-led process, e-invoicing only inside approved integration boundaries, and AI as human-reviewed decision support. It will not reuse the reference master’s original text, narration, music, or claims.
