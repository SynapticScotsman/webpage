# paulkirkland.dev — site design

The design notes for **Paul Kirkland's personal research site**. This is not the ICNS
design system: ICNS is Western Sydney University's centre brand (Crimson `#990033`,
Gotham Narrow, the W shield), and this site deliberately does not use it. Where the two
touch is the *figure* palette — the data colours below are borrowed from ICNS because
they are colour-blind audited, and that is the only inheritance.

One page per surface, one lever per concern. Edit the file named; nothing else needs
touching.

## Identity

**Neuromorphic Perception & Cognition** — the label.
**"How do you see the world?"** — the question the site is built around, answered by
**"How do you map the world?"** at the end of the hero.

The pairing is the whole idea: a machine that sees, asked a human question. Keep both
halves; neither works alone.

## The two surfaces

| Surface | File | Look |
|---|---|---|
| Homepage | `index.html` | Warm black `#141412`, red `#E0445E`; Inter, JetBrains Mono, Playfair Display |
| Cognitive map atlas | `cognitive_map.html` | Pure black, cyan `#22d3ee`; JetBrains Mono, Newsreader |

There was a third surface, a `how-you-see/` explainer, deleted once the
homepage's Perception and Cognition sections did the same job in place. If an
explainer ever returns it should start where those sections stop — the
bind/bundle/unbind detail — not repeat the introduction.

The atlas keeps cyan on purpose — it predates the red identity and reads as its own
artifact. If it is ever brought in line, the change is its `:root` block alone.

## Levers

### Palette — `index.html`, the `tailwind.config` block (line ~35)
Every `cyan-*` and `slate-*` class in the markup resolves through this remap, so the
accent changes in one place (`cyan.400/500`). `emerald.*` maps to mint `#7CE0C0` for
status. Hardcoded hexes also live in the `<style>` block and the demo JS — search
`#E0445E`.

### The hero — a sticky scroll stage
`#hero-scroll` (line ~207) is `240vh` mobile / `340vh` desktop with a `sticky` child, so
the canvas stays pinned while the transform plays. Progress comes from the stage's own
rect, not page percentage (`heroProgress`, line ~729) — page percentage was the original
bug: the morph fired long after the hero had scrolled away and nobody ever saw it.

The sequence, as fractions of the stage:

| Range | What happens |
|---|---|
| 0 – .20 | hero copy fades out |
| .06 – .40 | height collapses to footprints, each point on its own beat |
| .28 – .60 | camera climbs to plan view, lens narrows 70° → 40° |
| .15 – .52 | blue/orange polarity collapses to one ink |
| .60 – .74 | the map holds alone, nothing else on screen |
| .68 – .84 | scrim rises under where the text will land |
| .74 – .86 | "How do you map the world?" fades in |
| .86 – 1 | tail: the text simply sits before the stage releases |

Two rails (`scroll-snap-type: y proximity`) catch the start and the finished map.
Disabled under `prefers-reduced-motion`.

### The event scene and the map — inside `initThree`
| Concern | Where | Notes |
|---|---|---|
| Landmarks and names | line ~850 | `nameSeq` / `pad()`; names must describe the shape (see below) |
| Object vectors | line ~951 | `CLASS_SEED`; 62% class + 38% instance, so siblings answer alike |
| Query field | line ~998 | `rebuildField()` writes a `DataTexture` under the events |
| HUD label wording | line ~1072 | `HUD_LABELS` — every word in a tracked-object box, written once |
| Motion timings | line ~1190 | `flatten`, `rise`, `updateInk` |

**Name things for what they are.** The shapes are a box with a pitched roof (`house_`),
a tall block (`tower_`), two flat boxes (`vehicle_`), a pole and panel (`sign_`). The
class name drives the class vector, so a wrong name means the wrong things group
together when you query.

**Camera framing is aspect-derived.** Plan-view height solves for a target half-width of
32 world units, clamped `[46, 115]`. Anything that culls by distance must scale with
camera height — a fixed cutoff silently deleted every HUD label once the view pulled
back.

### Cognitive map — `cognitive_map.html`
CSS variables at the top (`--accent` etc.). Tweak defaults in `TWEAK_DEFAULTS`
(`mapStyle`, `inkColor`, `showMinimap`, `animateCamera`). Each demo is a self-contained
IIFE near the bottom: hero three.js, VSA robot walk, maze sim, uncertainty thermostat,
minimap and event strip.


## Typography

Sentence case everywhere. Uppercase is reserved for mono eyebrows and the identity
lockup. Section headers use a mono red eyebrow above a sentence-case heading; the
serif questions (Playfair on the homepage, Newsreader elsewhere) are the only display
faces and carry the human voice against the machine's mono.

## Data colours — colour-blind safe

| Meaning | Hex | Used for |
|---|---|---|
| ON events | `#3B9BFF` blue (`#22d3ee` cyan on the atlas) | leading edge, calm states |
| OFF events | `#FF8C42` orange | trailing tail, SPAD probe |
| Targets | `#FF3DA6` magenta | drone item, rock landmarks |
| Clutter / secondary | `#FFB000` amber | noise, rover item, tree landmarks, field peaks |
| Reference / stable | `#7CE0C0` mint | STABLE tags, self-location |
| Alert / accent | `#E0445E` red | thresholds, the identity accent |

Never pair red×green or blue×violet in one figure. Colour is never the only channel —
every coded state also carries a label or a shape. Event polarity is fixed: **blue is
ON at the leading edge, orange is OFF trailing behind**, and the orange tail is longer
because that is what a decaying OFF response looks like.

## Content rules

- No DECRA mentions anywhere.
- Simulated numbers are labelled as simulated ("SIM VIZ"), never presented as field
  results.
- Publications carry their real DOIs.
- The homepage similarity field is a sum of signed gaussians — a stand-in. Do not
  describe it with language earned by the real FHRR work ("quasi-probability", "sinc
  sidelobes"); link to the measured showcase instead if that claim is wanted.

## Publishing

GitHub Pages serves `main` of `SynapticScotsman/webpage` at
https://synapticscotsman.github.io/webpage/. Work happens on a branch; merging to `main`
publishes. Local preview: the `site` entry in `.claude/launch.json`, or
`py -m http.server 8741`.

The design drafts live in a Claude Design project (`019dc4ab-…`), which mirrors
`index.html` for visual iteration. It is a scratchpad, not a source of truth — this repo
is.
