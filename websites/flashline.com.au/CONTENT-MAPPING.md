# Flash Line — Content Mapping (original → replacement)

Source of truth for the original content: `/home/hermes/flashline-crawl/content/*.txt`
(extracted from the live WordPress site via WP REST API + page HTML).
Audit: `python3 /home/hermes/flashline-crawl/remap-audit.py` — 180 fact probes, 0 missing.

## Page-by-page mapping

| Original page | Replacement section | Treatment |
|---|---|---|
| Home | `#top` hero, `#capability`, `#services`, `#why-us`, `#coverage`, `#case-studies`, `#news` | Full remap |
| Our Story | `#story` (intro split + `.journey` era blocks) | Full text, professionally structured |
| About | `#about` (lead + vision/mission grid) | Full text |
| Our Team | `#team` (culture intro + 5 department cards + tracking strip) | Full text |
| Our Clients | `#clients` (9 cards) | Full list, sub-brand/coverage notes kept |
| NEWS (listing) | `#news` | All 5 posts as cards, dated October 22, 2025 |
| Post: Prime Mover June issue | `#news` featured card | Full text + pages 34–37 from Home cross-ref |
| Post: Direct Line Sydney–Melbourne | `#news` card + expandable full story | Full text |
| Post: 14-pallet rigid run Brisbane | `#news` card + expandable full story | Full text |
| Post: HDS Operator of the Month (July 2025) | `#news` card + expandable full story | Full text |
| Post: Emu Plains Junior Rugby League Club | `#news` card + expandable full story | Full text |
| Fleet Gallery | `#fleet` | Gallery + fleet range description from Our Story |
| Contact | `#contact` | Phone, email, address, consultation form fields kept |
| Test (draft) | merged into `#story` | See notes below |
| Sample Page | — | Dropped (WordPress default placeholder, no client content) |
| Category/Author archives | — | Not applicable (taxonomy pages, no unique content) |

## Conscious compressions / editorial decisions

1. **Test page merged into Our Story.** `/test/` was an unpublished richer draft of
   Our Story. All unique facts were pulled into `#story`: mentor John Simonetta,
   the single truck in 2010, 17 supermarkets in Canberra, two-pallet→14-pallet
   Hino rigid + B-double fleet range, QANTAS/D'nata airfreight support, and the
   $30M Marsden Park hub with 35,000-litre refuelling. Date conflict: the
   published Our Story page says Anushka joined in **2014**; the test draft says
   2015. The published page wins (2014); the growth era is labelled 2015–2025.
2. **Animated counters → real stats.** The original's animated "0+ Years" /
   "$0 Million" counters are rendered as static facts: 15+ years, 70+ trucks,
   $20M+ invested, 24/7 operations.
3. **Repeated slogan blocks.** Home repeated "Australia's Finest / Trust Us to
   Deliver!" and "Case Study" carousel placeholders; represented once each in the
   trust strip and the case-studies heading.
4. **Case studies.** The original home carousel had no distinct case text, so the
   section uses three real, sourced events: the 2019 bushfire Nowra mission
   (Our Story), the Sydney–Melbourne Direct Line and the Brisbane 14-pallet
   deployment (News posts).
5. **News bodies behind "Read the full story".** Each news card shows the lead
   paragraph; the remaining original paragraphs expand via `<details>` — full
   text preserved, page stays scannable.
6. **Spelling preserved where branded.** "Blaney", "Taracutta", "HDS Logistic"
   etc. kept as on the original; "Bev chain" normalised to "BevChain".
7. **Hero video.** Original Vimeo hero (ID 1199057995, hash 33f03cc14b) kept as
   background embed with poster fallback.

## Verification

- `remap-audit.py`: 180 fact probes across home/about/our-story/our-team/
  our-clients/news/contact — **0 missing**.
- Playwright QA (desktop 1440px + mobile 390px): sections, images, nav, form,
  horizontal overflow — see run history on kanban task `t_0478c0f4`.
