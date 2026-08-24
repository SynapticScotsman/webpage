# Site design — where everything lives

One page per surface, one lever per concern. Edit the file named; nothing else needs touching.

## The three surfaces

| Surface | File | Look |
|---|---|---|
| Homepage | `index.html` | Warm black `#141412`, red `#E0445E`, Inter + JetBrains Mono |
| Cognitive map atlas | `cognitive_map.html` | Pure black, cyan `#22d3ee`, JetBrains Mono + Newsreader |
| Explainer | `how-you-see/index.html` | Warm black, red, Inter + JetBrains Mono + Newsreader |

Identity: **Neuromorphic Perception & Cognition** · mantra **"How do you see the world?"**

## Levers

### Homepage palette — `index.html`, the `tailwind.config` block (~line 35)
Every `cyan-*` and `slate-*` class in the markup resolves through this remap. Change the
red once here (`cyan.400/500`) and the whole page follows. `emerald.*` is remapped to
ICNS mint `#7CE0C0` (status colors). Hardcoded hexes also exist in the `<style>` block
and demo JS — search `#E0445E` to find them all.

### Homepage sections — `index.html`, in order
| Section | Anchor | Notes |
|---|---|---|
| Nav (desktop + mobile) | `<nav>` / `#mobile-menu` | Two link lists; keep them in sync |
| Hero | `#hero-heading` | Identity + mantra over the three.js event scene (`initThree`) |
| About | `#about` | "Embodied intelligence" lives here now |
| Explore doors | `#explore` | Cards to the explainer + atlas |
| Projects | `#projects` | Six `.project-card`s — the real research projects |
| Research hub | `#exhibits` | Pipeline / CNN-vs-SNN / binding / fallback demos + `#vsa-explorer` |
| Video | `#video-heading` | Lazy YouTube poster |
| Publications | `#publications` | `.pub-card`s with DOIs |
| Partners / Contact | `#partners-heading` / `#contact` | Contact band is deep red `#A20C32` |

Section header idiom: mono red eyebrow (`Projects · …`) above a sentence-case heading.
The uppercase hero is the one deliberate exception.

### Cognitive map — `cognitive_map.html`
CSS variables at the top (`--accent` etc.); tweak defaults in the `TWEAK_DEFAULTS`
script (`mapStyle`, `inkColor`, `showMinimap`, `animateCamera`). Each demo is one
self-contained IIFE near the bottom (hero three.js, VSA robot walk, maze sim,
uncertainty thermostat, minimap + event strip).

### Explainer — `how-you-see/index.html`
All styling in its own `<style>` block, tokens under `:root`. No JavaScript at all.

## Data-colour rules (colour-blind safe, from the ICNS figure palette)

| Meaning | Hex | Used for |
|---|---|---|
| ON events | `#22d3ee` cyan (map page) / `#3B9BFF` blue | event dots, calm states |
| OFF events / probe | `#FF8C42` orange | event dots, SPAD probe trace |
| Targets | `#FF3DA6` magenta | drone item, rock landmarks |
| Clutter / secondary | `#FFB000` amber | noise dots, rover item, tree landmarks |
| Reference / stable | `#7CE0C0` mint | STABLE tags (via emerald remap) |
| Alert | `#E0445E` accent red | thresholds, stressed bars |

Never pair red×green or blue×violet in the same figure. Every colour-coded state also
carries a text label or shape — colour is never the only channel.

## Publishing

GitHub Pages serves `main` of `SynapticScotsman/webpage` at
https://synapticscotsman.github.io/webpage/. Work happens on a branch; merge to main
publishes. Local preview: `py -m http.server 8741` (or the `.claude/launch.json` entry).

Content rule: no DECRA mentions, no invented metrics presented as field results
(simulated numbers are labelled "SIM"), publications carry their real DOIs.
