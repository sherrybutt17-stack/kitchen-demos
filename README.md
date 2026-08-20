# Five Brand Demo Sites — Three Kitchen, One Security, One Dental

Five completely separate websites, built to look like the work of five different agencies.
Different brand, positioning, customer, color system, typography, layout philosophy and
conversion strategy for each. **37 pages total.**

Sites 1–4 are fictional brands anchored to real affluent metros, so the local SEO, service-area
content and schema read as genuine. **Site 5 is different** — it is a redesign of a real practice
using that practice's own content, doctors, prices, photography and logo palette.

## Live demos

| Site | Brand | Metro | Link |
|---|---|---|---|
| 1 | **NORTHSTONE** · Kitchen Architecture | Scottsdale / Paradise Valley, AZ | https://sherrybutt17-stack.github.io/kitchen-demos/site-1-northstone/ |
| 2 | **HEARTH & HOLLIS** · Kitchen Studio | Mill Valley / Marin County, CA | https://sherrybutt17-stack.github.io/kitchen-demos/site-2-hearth-hollis/ |
| 3 | **OBSIDIAN** · Kitchen Studio | Coral Gables / Bal Harbour, FL | https://sherrybutt17-stack.github.io/kitchen-demos/site-3-obsidian/ |
| 4 | **VANTAGE** · Security Systems | Westlake / Dallas–Fort Worth, TX | https://sherrybutt17-stack.github.io/kitchen-demos/site-4-vantage/ |
| 5 | **SAPPHIRE** · Dental Studio | Winter Garden / west Orlando, FL | https://sherrybutt17-stack.github.io/kitchen-demos/site-5-sapphire/ |

Launcher with all five: https://sherrybutt17-stack.github.io/kitchen-demos/

Sites 1–4 have seven pages each — `index`, the service page, the gallery, the pricing/financing
page, `free-consultation`, `thank-you`, `contact`. Site 5 has nine: it gives `meet-the-team` and
`sedation-dentistry` their own URLs, because the three named specialists and the in-house
anesthesiologist *are* the positioning.

## The signature feature in each

Each site carries one interactive centrepiece, written from scratch with no library:

- **Obsidian** — `kitchen3d.js`, a real WebGL kitchen generated procedurally from one unit cube,
  plus a scroll-driven Transformation Chamber.
- **Vantage** — `perimeter.js`, a live canvas coverage plan whose camera cones are ray-marched
  and clipped against the buildings, so the coverage percentage is *measured*, not claimed.
- **Sapphire** — `smile-studio.js`, WebGL over the practice's genuine paired case photography.
  Because each case is a before/after *pair*, the tooth mask is derived offline from the
  before→after difference rather than hand-traced. The whitening slider shades the real patient's
  before photo inside that mask; a separate control cross-fades to the real clinical after.
  Simulation and real outcome are labelled distinctly and never blended.

## Which folder do I use?

**`site-*/`** — the source pages. External CSS/JS and relative image paths, comfortable to edit.
This is what GitHub Pages serves above, and what you should edit.

**`dist/`** — the built pages. CSS, JavaScript and every photograph inlined as base64, so each
file is completely self-contained. **This is what you paste into GoHighLevel**, one file per
Custom-HTML block. Never hand-edit it; it is regenerated from scratch on every build.

```bash
python3 scripts/build.py    # regenerates dist/ from the source pages
```

Always edit the source page plus its `assets/css/site.css` / `assets/js/site.js`, then re-run
the build.

## Running it locally

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## No build system

No framework, no bundler, no package manager. `build.py` (Python stdlib + Pillow) is the whole
toolchain. The five sites deliberately share no CSS, JS or design tokens — the divergence is
the deliverable.

See [CLAUDE.md](CLAUDE.md) for the full brief: brand systems, color tokens, conversion strategy,
accessibility rules, and the traps already hit.
