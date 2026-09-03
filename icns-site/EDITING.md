# Editing this site

Written for someone who is comfortable with words but does not want to learn HTML.
You can do everything below in a web browser without installing anything.

## The easiest way: edit the page itself

Add `?edit` to the end of the address and the page becomes editable where it sits.

    http://localhost:8901/?edit
    https://synapticscotsman.github.io/webpage/icns-site/?edit

Every piece of text gets a faint dashed outline. Click any of it and type. Changed
blocks turn slightly green so you can see what you have touched. When you are done,
press **Save a copy** and the browser puts a finished `index.html` in your downloads.
Upload that file to GitHub, replacing the old one, and the site updates.

Nothing else on the page can be broken this way. Only text is editable, so layout,
colours, links and structure are untouchable. That is deliberate: the usual way a
visual editor ruins a site is somebody dragging a box and silently breaking it for
everyone on a phone.

If you close the tab with unsaved changes the browser will stop you and ask.

A normal visitor never sees any of this and never downloads the code for it. It only
exists when `?edit` is in the address.

---

## The other way: edit the file directly

Go to the repository on GitHub, open `icns-site/index.html`, click the pencil icon,
change the words between the angle brackets, and press **Commit changes**. The site
rebuilds itself within a minute.

The only rule that matters: **change the words, never the angle brackets.** If a
line reads

    <h4>Astrosite</h4>

you may change `Astrosite` to anything you like. Leave `<h4>` and `</h4>` alone.

If something breaks, GitHub keeps every previous version. Open the file's History
and restore the last good one. Nothing you do here can be permanently broken.

---

## The three things people ask for most

### Change which video is in the top banner

Find this line, near the middle of the file. Search for `var BANNER`.

    var BANNER = 'W5mUwBitFtg';

That code is the YouTube video id, the part after `?v=` in a YouTube address.
Change it to any id listed in the `CLIPS` block directly below it, and the banner
picture, the opening sentence and the play button all follow.

To promote a video that is not yet in `CLIPS`, copy an existing entry, paste it
above the closing brace, and change the id, the `lede` sentence, the `alt`
description and the `label`. Then set `BANNER` to your new id.

### Change the headline or the opening paragraph

Search for `<h1>`. The line looks like this:

    <h1>Nothing fires until something <em>changes</em></h1>

The `<em>` marks the word set in the italic serif. The paragraph underneath it is
the line beginning `<p class="lede"`.

Note that the opening paragraph is also set per video in the `CLIPS` block, and
that version wins when the page loads. If you change the paragraph and it reverts,
you have edited the copy in the HTML rather than the one in `CLIPS`.

### Add or remove a project card

Each card is a block that starts with `<article class="wcard">` and ends with
`</article>`. To remove one, delete everything from one of those to its matching
`</article>`. To add one, copy an existing block and change the words.

A card with a video needs the YouTube id in three places: twice in the picture
address and once in `data-video`. Search for the id of the card you copied and
replace every instance inside that block.

A card with no video is simpler. Copy one that begins `<article class="wcard plain">`
and there is nothing to change but the words.

### Change a project's status

The small coloured line above a card title. Green means running, amber means it
needs checking or is not ready yet.

    <span class="live">On orbit since 2022</span>      green
    <span class="todo" data-check="1">Confirm status</span>   amber

Change the words inside. Swap `live` for `todo` or the reverse to change the colour.
Anything still marked `data-check="1"` is something nobody has confirmed yet, and
there is a list of them at the bottom of this file.

---

## If someone else should edit it, and they should not see HTML at all

The honest position: the page is hand-written HTML, so today it needs a person who
will not panic at an angle bracket. If a communications colleague is going to
maintain it, that is worth fixing properly, and there are two routes.

**Route one, small.** Move the editable content out of the page and into a single
data file listing the videos, cards and topics. The page is then generated from
that file automatically whenever it changes. Editing becomes filling in fields in a
list rather than working around markup. Roughly half a day of work, no new accounts,
nothing to pay for.

**Route two, full.** Put a proper editing interface on top of that data file. Several
are free and work directly against a GitHub repository with no server to run:

- **Pages CMS** (pagescms.org) is the closest fit here. It is built for exactly this
  situation, a static site in a GitHub repository with no build system.
- **Sveltia CMS** is a modern rewrite of the old Netlify CMS and needs slightly more
  setup, but is more capable.
- **TinaCMS** is the most polished and has a paid tier once you pass the free limits.

All three give a form-based interface: type in a box, upload a picture, press save,
the site updates. All three need route one done first, because they edit structured
data and cannot edit prose buried in markup.

Setting either up needs a decision from you rather than from me: route two requires
registering an application against the GitHub account, which is your credential and
your call. Say which route you want and I will do the part that is code.

**A third option worth naming honestly.** If this page ends up living inside the
University's own publishing system, Squiz Matrix, then it already has an editing
interface and none of the above is needed. The trade is that you lose most of the
design, because the template constrains layout, colour and typography. That is the
choice described in the audit: the University system gives you easy editing and a
generic page, and a separate site gives you this page and a maintenance job.

---

## Things that were left deliberately unconfirmed

Search the file for `data-check` to find them. Each one is a claim nobody has
verified, and each is written so that it is obviously unfinished rather than
quietly wrong.

At the time of writing, on the landing page: the acoustic drone detection work
("Hearing what you cannot see"), the chip and processor work ("Silicon that
spikes"), the acoustic ecological monitoring, the speech and reading assessment
tools, and the doctoral scholarship routes and typical duration.

On the access page, all five are commercial: what contract research terms to
state, which joint funding schemes, whether hardware and licensing are available,
what the standard agreements and lead times are, and what the centre is willing to
say publicly about rates, intellectual property and the cost of sponsoring a
student.

Fill them in and delete the marker. Leave them until somebody actually knows.
