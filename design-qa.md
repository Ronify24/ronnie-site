# Cinematic portfolio redesign — design QA

Date: 2026-11-07

final result: passed

## Scope and visual truth

This is a portfolio redesign using the user's Lumify references as art direction, not a pixel-for-pixel recreation of a Lumify marketing site. User explicitly requested all connected site windows, replacement of the old launch artwork, and portrait placement only in Contact.

Source visual truth:
- `/Users/ronniec/Downloads/Lumify_ Artists Back in Control (1).png` — 1821 × 864; wide cinematic composition, cyan and obsidian palette, strong headline and amber image contrast.
- `/Users/ronniec/Downloads/Lumify_ Artists Back in Control.png` — 1672 × 941; second composition reference.
- `/var/folders/bj/mx9fyhf97hb3tf8jff8nghym0000gn/T/codex-clipboard-24f7f137-a52c-4644-be70-38b64ae9ddff.png` — supplied Batch Stills reference; organized hierarchy, panel boundaries, readable actions.
- Existing live site `https://ronniecleland.com/#overview`, captured before edits in `artifacts/cinematic-qa/before.png`.

## Evidence

All implementation images were captured from the actual local app through the Codex in-app browser. Screenshot files are in `/Users/ronniec/Documents/GitHub/ronnie-site/artifacts/cinematic-qa/`:

- `overview.png`, `skills.png`, `projects.png`, `credits.png`, `reel.png`, `resume.png`, `gallery.png`, `contact.png` — desktop evidence, primarily 1366 × 768 CSS viewport and 1366 × 768 PNG pixels (1× density).
- `mobile-skills.png`, `mobile-projects.png` — full-page mobile captures at 390 × 844 CSS viewport; natural vertical scrolling is intentional.
- `desktop-measurements.json` — final live DOM fit checks for all four routes at 1024 × 768, 1280 × 720, and 1366 × 768; no page overflow or clipped scene content detected in those checks.

Full-view comparison: the original first Lumify reference and the actual Overview, Skills, and Projects screenshots were opened together in one comparison tool result. The source and implementation have different aspect ratios; compared composition and visual language at whole-frame scale, with no pixel-diff claim. The portrait screenshot supplied by the user is an organizational reference, not a desktop layout to copy. The implementation intentionally preserves portfolio identity and real navigation rather than rasterizing a marketing mockup.

Focused comparison: home headline/action grouping, Skills active selection and list spacing, project artwork/action strip, Contact portrait placement, Gallery controls and thumbnails, and résumé preview sizing were inspected at their native screenshot scale. These regions are clearly readable at 1×; additional enlarged image crops were not necessary.

## Required fidelity surfaces

- **Fonts and typography:** Barlow Condensed supplies the bold cinematic display treatment; Inter handles readable UI; IBM Plex Mono labels structure the views. Increased desktop detail/body text after the first pass. Removed missing whitespace caused by hiding line breaks on mobile.
- **Spacing and layout rhythm:** one bounded desktop scene, persistent navigation and footer; related content appears beside artwork instead of beneath a repeated masthead. Modal windows use the same wide proportions and measured padding. Smaller windows and mobile retain scrolling for access.
- **Colors and tokens:** consistent deep teal/obsidian surface colors, subdued blue-gray secondary text, thin cyan framing, and bright cyan primary actions. Amber light in imagery provides intentional contrast.
- **Image quality:** a new 1672 × 941 WebP artwork was generated with built-in ImageGen and saved in the project. No baked-in fake UI in the home art. Original deck art is used in Projects; real existing UI screenshots remain in Gallery. Portrait has one source reference, inside Contact only. Old `WebLaunchImg.png` has no remaining site references.
- **Copy and content:** each route leads with artistic purpose. All seven original skill groups, all original project detail entries, all 18 film/TV credits, five reel URLs, both résumé PDFs, and the portfolio PDF remain available. Project details use paging to preserve depth without a desktop scroll stack. Public LinkedIn URL comes from the existing résumé rather than the old LinkedIn account-settings destination.

## Interaction validation

- All four primary routes and desktop previous/next scene controls are implemented; direct `#reel` reload verified.
- Home CTAs navigate; Reel's “Explore the credits” opens the Film & television tab, and “Explore Lumify” selects Lumify.
- Skill selection changes title, description and tools. Mobile select tested with Workflow Orchestration.
- Project tabs and Stack detail pagination tested; tab groups implement ArrowLeft/ArrowRight/Home/End keyboard navigation.
- Reel player loads, first video plays and pauses (progress observed at 8 seconds), next reel changes the player, and leaving Reel removes the iframe so playback stops.
- Gallery loads all 11 existing images. Next image and maximize/close verified; thumbnail buttons remain real buttons. Existing touch pan, pinch and swipe behavior retained, though touch gestures were not emulated in this session.
- Résumé chooser opens and closes; both PDF targets resolve locally, with previews visible. Mobile allows scrolling to both documents.
- Contact opens with portrait, email, LinkedIn, IMDb, YouTube and résumé actions. Escape closes it. Focus returns to the launcher after modal close.
- Browser error/warning log was empty on final check. JavaScript syntax checks passed for app.js, content.js and gallery.js. All 18 local src/href targets checked on disk exist.

## Comparison and correction history

1. First desktop pass: secondary text was too small and the Skills artwork too shallow. Increased readable content sizes and art height. Final evidence: skills.png and projects.png.
2. Compact-height pass: overview rail had 9px internal overflow; reel grid consumed bottom padding. Adjusted rail line heights and allowed the reel grid/flex children to shrink. Rechecked every route at three desktop sizes; final measurements show no overflow.
3. Mobile pass: seven skill buttons pushed the selected discipline down; changed to a native compact selector on phones. Corrected line-break spacing in headings and locked background scrolling while dialogs are open.
4. Navigation pass: credit-specific links initially opened the general Projects route. Added explicit project-tab targets; verified “Explore the credits” selects Film & television.

## Remaining limitations

- Verified in the Codex in-app browser, not separate physical Windows, Safari, or Android devices.
- Responsive sizing checked through browser viewport overrides, not OS-level text zoom. Width/height fallbacks allow natural scroll when space is limited.
- Full playback of all five externally hosted reels was not tested; original URLs were preserved.
- Generated artwork is a new portfolio design asset, not presented as a historical production credit.
- PDF document contents were retained; this redesign covers their connected chooser, not a redesign of the PDFs themselves.
- This is a local implementation. No commit, push, or production deployment was performed.

## Implementation checklist

- [x] Cohesive Overview, Skills, Reel, Projects, Gallery, Résumé and Contact design.
- [x] Old home artwork removed; portrait limited to Contact.
- [x] Desktop content fit and mobile access checked.
- [x] Core navigation, selection, playback and modal behavior verified.
- [x] No actionable P0/P1/P2 findings remain in tested views.
