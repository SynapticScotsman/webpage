# Design comp reviewed against the audit checklist

Reviewing `ICNS-Website.dc.html` (Claude Design project "ICNS webpage redesign") against the findings in `icns-issues-list.md` and the full audit. 24 August 2026.

Short version: the comp fixes almost every structural and content problem the audit found, and reintroduces two of the accessibility ones. Fix those and it is a strong basis to build from.

## Audit findings the comp resolves

- **The dead-link problem is designed out.** One routed structure with six screens, no duplicate Opportunities or Research Videos trees, so the class of bug that produced nine dead links cannot recur.
- **People and Publications are top-level navigation**, which the audit asked for. People were four clicks deep on the live site.
- **Publications is a real page**: year, title, subject area and theme filters, built to render from the university's research repository, ResearchDirect. The live site's 131-word pointer page is gone.
- **DeepSouth is present tense** and described as an operating machine rather than an announcement.
- **Card copy is written to length.** No mid-word truncation, and every action says where it goes ("All projects", "Enquire", "Projects"). The nine identical "READ MORE" buttons are gone.
- **No carousel.** The A/B hero switch is a reviewer control, not something a visitor sees.
- **One main heading per screen**, mono eyebrows above each, consistent with the kit.
- **Empty-page problem answered well.** "Postdoctoral and engineering roles · Posted as they open" is exactly the standing copy the audit recommended in place of "No results were found".
- **The audience router** (industry and defence, prospective students, researchers) solves the "highlights without drowning" problem directly: three columns of three links each, and everything else lives deeper.

## Gaps to close before build

### Accessibility, the audit's own findings repeated

1. **Two animated canvases with no reduced-motion guard.** The hero and the theme explorer both run continuous animation loops. Visitors who set "reduce motion" get the animation anyway. The audit criticised the live site's unpausable carousel on exactly this ground.
2. **No text alternative for the figures.** Both canvases carry meaning (event streams, spike rasters, target tracks). A screen reader gets nothing. Each needs a short text description, and the caption alone does not count.
3. **No accessibility attributes anywhere**: no `aria-` attributes, no skip-to-content link, no `lang` on the page. All three were audit findings against the live site.
4. **Every navigation item and control is a placeholder link.** Menu items, theme selectors and filters are `href="#"` with a click handler. The audit flagged this exact pattern on the live site. Production needs real addresses.
5. **State does not change the address.** Selecting a theme, a project filter or a publication filter leaves the address bar unchanged, so nothing is linkable or shareable and the back button does not work. The audit raised the same point about the live site.
6. **The contact form needs autocomplete attributes** on name, organisation and email so browsers can fill them. The kit components carry visible labels already, which is the harder half.

### Content still to supply

7. **All eight people are "Name to supply"**, project imagery is pending, partner logos are pending, and the publications are subject-area placeholders rather than citations. The comp is honest about this in its own footnotes, but it is not fillable as it stands.
8. **No news or events anywhere.** The audit's complaint was that news had gone stale, and the comp's answer is to remove news entirely. That is defensible, but a research centre with no dated content looks equally static, and there is nowhere to put the ISS flight, the Intel partnership or the student's NASA placement. Recommend a dated updates strip on the home page, three items, with a real date on each.

### Factual and naming checks

9. **"Deep South" should be "DeepSouth"**, one word, throughout the comp and the sample data.
10. **"Master of Neuromorphic Engineering" should be "Master of Applied Neuromorphic Engineering"**, the enrolled course name.
11. **The postal address needs checking.** The comp uses Werrington South NSW 2747. The current site gives Locked Bag 1797, Penrith NSW 2751, with the office in Building BA.
12. **"under NDA" needs expanding** on first use to "under a non-disclosure agreement". Partners will know it; the students and journalists reading the same page may not.

### Smaller notes

13. The YouTube embed loads on page load. Defer it behind a poster image, both for speed and to avoid setting third-party cookies before a visitor asks for the video.
14. Grid columns are fixed at three and four across with no visible breakpoints. Mobile behaviour needs a pass; the audit checked the live site at phone width and this comp has not been checked there yet.
15. Hero B uses `62vh` for minimum height. Prefer `dvh` so mobile browser toolbars do not clip it.

## Recommended next step

Merge the comp with the Plate homepage prototype. Hero B and that prototype are converging on the same design, and the prototype already carries the reduced-motion handling, the masking shield and the brand-correct white logo lockup that the comp needs. One canonical home page, then take the accessibility list above through the rest of the screens.
