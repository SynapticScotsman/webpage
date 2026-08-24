# ICNS website — issues list

Review of westernsydney.edu.au/icns, 24 August 2026. Every broken link below was verified against the live server; every content observation was taken from the rendered pages on that date.

## Broken links (verified 404s)

1. **Opportunities page** — three of its five cards are dead:
   - "Open PhD Projects" → `/icns/opportunities/research-opportunities` (working page exists at `/icns/research-projects/open-phd-projects`)
   - "Master's Program" → `/icns/opportunities/masters-program` (working page: `/icns/masters-program`)
   - "Partner With Us" → `/icns/opportunities/partner-with-us` (working page: `/icns/partnership/partnership-opportunities`)
2. **Research page and Perception page** → `/icns/research/research-videos` is dead (videos live at `/icns/resources/research-videos`)
3. **Perception page** — its six video links (`/icns/research/research-streams/perception/...`) are all dead copies of the same videos
4. **News listing** → "First Images from Space!" links to a dead page (`/icns/news/first-images-from-space!2`)
5. **Our Vision page** → links to an archived Impact page that no longer exists
6. **People pages** → three links to archived profiles of people who have left return 404
7. `/icns/resources/student-support` → dead, still linked within the section

## Outdated content

- **DeepSouth is still "to be built".** The homepage hero, the newest news item, and the page's Google search description all announce the supercomputer in the future tense. The announcement is from December 2023; the machine launched in April 2024.
- **Newest news item is December 2023** — and the news listing shows no dates, so visitors only discover the staleness after clicking.
- **Events section ends at "2023 Events"**, which appears in the navigation of every page on the site.
- **Current Vacancies and Current Scholarships** both display "No results were found" with no explanation or contact.
- **Research videos are from 2020** and are presented as current content.
- Duplicate copies of the same pages exist under different URL spellings (hyphen and underscore versions), which splits search rankings.

## UI / UX issues

- The homepage hero is an **auto-playing carousel with no pause button** (a WCAG accessibility failure) and a visible scrollbar; three of its four slides are never seen by most visitors.
- Card text is **cut off mid-word** ("...the scale of the human b...", "pioneerin...") followed by nine identical "READ MORE" buttons that don't say where they lead.
- **No h1 heading on the homepage**; heading levels skip, and there is no skip-to-content link for keyboard users.
- The **site search box has no label** and its button has no accessible name — a screen reader user gets nothing.
- **Alt text is missing** on images across key pages, including all 14 researcher portraits and all 27 PhD project thumbnails.
- **63 of 82 homepage images have no set dimensions**, which is why the page visibly jumps around while loading.
- Thumbnail imagery is inconsistent: the Master's Program card is a poster cropped so it reads "ER OF / OMORPHIC / EERING"; stock 3D renders sit next to genuine research photography.
- Section headings are styled as underlined hyperlinks ("NEWS | Discover what's happening..."), a dated portal pattern.

## Structure issues

- The same content lives in **three overlapping sections** (Research, Research and Projects, Resources); "Research Videos" appears in two different menus.
- **People are buried** four levels deep under About and are never linked from the homepage.
- The **Publications page is 131 words** pointing to individual Google Scholar profiles — thin for a research centre.
- Public URLs expose CMS clutter: `reproducible-research3`, `first-images-from-space!2`.

## The short version

The centre's strongest assets — DeepSouth, event cameras on the ISS, the Intel partnership, 24 open PhD projects — are all on the site, but the site presents them behind broken links, missing dates, and a homepage that still announces its 2023 plans. Most of the fixes above are ordinary CMS edits; the full audit with a phased fix plan is available on request.
