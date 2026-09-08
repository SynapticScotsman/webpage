# Rebuilding the ICNS page as an author, without touching code

Everything here is done by writing a document. No development request, no template
change, no ticket. It uses only blocks and variants that already exist in the
Western Sydney Edge Delivery Services project, verified against the live code on
3 September 2026.

The important finding: of everything that made the redesign feel modern, only one
item needs a developer, and it is the least important one.

## What you actually have

Twelve blocks exist in the project, though the current ICNS page uses seven:

`embed` · `hero` · `tabs` · `carousel` · `cards` · `columns` · `table` ·
`fragment` · `breadcrumb` · `header` · `footer` · `back-to-top`

Cards carry variants you select by typing them in the block header:

| Variant | Effect |
|---|---|
| `cards-crimson` `cards-purple` `cards-black` `cards-dark-grey` `cards-red` `cards-teal` | Coloured background, white text |
| `cards-off-white` `cards-light-grey` `cards-nicm-green` `cards-orange` | Coloured background, black text |
| `cards-horizontal` | Single column, image left at 40%, content right |
| `cards-horizontal` + `cards-image-small` | Image drops to 20%, content centred |
| `btn-outline` | Outline button style |

Your page already uses `cards btn-outline cards-crimson` and
`table dynamic-width no-border two-column-table`, so the mechanism is proven on
your own content.

## Video: available today

The embed block is the second largest file in the project and already does the
work. It supports YouTube and Vimeo, loads a thumbnail with a play button and only
fetches the player when someone clicks, lazy-loads through an IntersectionObserver,
holds a 16:9 ratio, and falls back through thumbnail qualities when the highest is
missing.

To place one, the document needs a table with the block name in the first cell:

| Embed |
| :--- |
| https://www.youtube.com/watch?v=5ct78VxCGlQ |

That is the entire authoring step. Fourteen research videos are currently three
clicks deep at `/resources/research-videos` and could be on the main page this
week.

One thing to raise with the web team: the block does not use the
`youtube-nocookie` domain, so playing a video sets Google cookies. It is worth a
sentence to whoever owns privacy compliance, not a blocker.

## The page, block by block

Write the document in this order. Block names go in the first cell of a table;
variants go in brackets after the name.

**1 — Hero.** One image, one heading, one sentence, one button. Replaces the
four-slide carousel. Three of those four slides are only seen by someone who
chooses to click through, and the evidence says almost nobody does, so three of
your four headline messages currently go unread.

**2 — Embed.** The strongest single piece of footage, full width, directly under
the hero. This is where the argument gets made: an event camera outputs nothing
when nothing moves, so a still frame misrepresents the work.

**3 — Cards.** The flagship programmes, standard grid, three across. Falcon Neuro,
DeepSouth, Astrosite. Each card carries a date or a status line, because undated
content reads as abandoned content.

**4 — Tabs, one tab per sector.** Space and defence, agriculture and environment,
industry and manufacturing, health and assistive. This is the single biggest
structural gain available to you: it removes four screens of scrolling and lets a
partner land on their own sector immediately. The tabs block exists and the main
university research page already uses it fifteen times.

**5 — Cards (cards-horizontal) inside each tab.** Compact rows, thumbnail left,
title and one line right. This is the layout that stops a long list of projects
becoming a wall. Use a colour variant per sector if you want them visually
distinct, though restraint reads better than four colours.

**6 — Columns.** Doctoral topics grouped by sector, plus the standing statement
that recruitment never closes. Written as directions you would supervise rather
than a list of open projects, so nothing decays and nobody has to maintain it.

**7 — Cards (cards-horizontal, cards-off-white).** The open-source tools, each
linking to its repository. Working software other groups already depend on is the
most credible capability claim a research centre can make, and none of it is
currently on the site.

**8 — Table (two-column-table).** Contact and access. Who to write to for
partnerships, for study, for media.

## What you cannot do as an author

The full-bleed background video in the hero. I read `hero.js`: it handles a
`<picture>` and turns links into buttons, and has no video path at all. That needs
a developer.

Do not spend your one favour on it. Everything above delivers most of the value,
and a background video is the smallest part of what made the redesign work. If a
development slot does become available, the cheap ask is to extend the existing
hero to accept an `.mp4` link and treat it as a background layer behind the
existing picture, rather than commissioning a new block. It benefits every
institute on the platform, not only you.

## What survives from the redesign

The parts that mattered were never code:

- one message instead of four
- hierarchy, so the eye knows what matters
- dates and status on everything
- sector language instead of internal structure
- research footage brought to the surface instead of buried
- doctoral topics framed as supervision rather than vacancies

Every one of those is an authoring decision. The dark theme and the custom
typography do not survive, and they were the least load-bearing part of it.
