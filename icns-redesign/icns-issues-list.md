# Issues with the current ICNS website

Review of westernsydney.edu.au/icns, 24 August 2026. Every broken link below was checked against the live server that day. Every content observation comes from the rendered pages.

## Broken links, all verified dead

1. **Opportunities page.** Three of its five cards lead nowhere:
   - "Open PhD Projects" points to `/icns/opportunities/research-opportunities`. The working page is `/icns/research-projects/open-phd-projects`.
   - "Master's Program" points to `/icns/opportunities/masters-program`. The working page is `/icns/masters-program`.
   - "Partner With Us" points to `/icns/opportunities/partner-with-us`. The working page is `/icns/partnership/partnership-opportunities`.
2. **Research and Perception pages** both link to `/icns/research/research-videos`, which is dead. The videos live at `/icns/resources/research-videos`.
3. **Perception page** also carries six dead links to copies of those same videos.
4. **News listing.** "First Images from Space!" leads to a dead page.
5. **Our Vision page** links to an archived Impact page that no longer exists.
6. **People pages** link to three profiles of researchers who have left. All three are dead.
7. `/icns/resources/student-support` is dead but still linked within the section.

## Outdated content

- DeepSouth is still "to be built". The homepage, the newest news item and the page's Google search description all announce the supercomputer in the future tense. The announcement is from December 2023. The machine launched in April 2024.
- The newest news item is from December 2023, and the listing shows no dates, so visitors only discover this after clicking.
- The events section ends at "2023 Events", and that label sits in the navigation of every page on the site.
- Current Vacancies and Current Scholarships both show "No results were found", with no explanation and no contact.
- The research videos are from 2020 but presented as current.
- Several pages exist twice under different spellings of the same address, which splits the site's Google ranking.

## Design and usability

- The homepage banner is a rotating carousel that plays automatically and has no pause button. That fails WCAG, the web accessibility standard the university's own web policy commits to. Three of its four slides are never seen by most visitors.
- Card text cuts off mid-word, "...the scale of the human b..." and "pioneerin...", above nine identical "READ MORE" buttons that never say where they lead.
- The homepage has no main heading, heading levels skip, and there is no skip-to-content link for keyboard users.
- The site search box has no label and its button has no accessible name. A screen reader announces nothing useful for either.
- Alt text, the image description a screen reader speaks aloud, is missing across key pages, including all 14 researcher portraits and all 27 PhD project thumbnails.
- 63 of the 82 homepage images have no set dimensions, which is why the page jumps around while it loads.
- Thumbnail images follow no system. The Master's Program card is a poster cropped so it reads "ER OF / OMORPHIC / EERING", and stock graphics sit next to genuine research photography, which is far stronger material.
- Section headings are styled as underlined hyperlinks ("NEWS | Discover what's happening..."), a pattern from 2010s-era web portals.

## Structure

- The same material lives in three overlapping sections: Research, Research and Projects, and Resources. "Research Videos" appears in two different menus.
- People are four clicks deep under About, and the homepage never links to them.
- The Publications page is 131 words pointing visitors to individual Google Scholar profiles. For a research centre, that is thin.
- Public addresses expose editing leftovers, such as `reproducible-research3` and `first-images-from-space!2`.

## The short version

The centre's strongest stories are all on the site: DeepSouth, event cameras on the International Space Station, the Intel partnership, 24 open PhD projects. The site hides them behind dead links, missing dates and a homepage still announcing its 2023 plans. Most of the fixes are ordinary edits in the university's web publishing system, Squiz Matrix, no rebuild required. The full audit with a staged fix plan is available on request.
