# Kitchen Remodeling — Three Brand Demo Sites

Three completely separate kitchen remodeling websites, built to look like the work of three
different agencies. Different brand, positioning, customer, color system, typography, layout
philosophy and conversion strategy for each. Seven pages per site, 21 pages total.

Fictional brands anchored to real affluent metros, so the local SEO, service-area content and
schema read as genuine.

## Live demos

| Site | Brand | Metro | Link |
|---|---|---|---|
| 1 | **NORTHSTONE** · Kitchen Architecture | Scottsdale / Paradise Valley, AZ | https://sherrybutt17-stack.github.io/kitchen-demos/site-1-northstone/ |
| 2 | **HEARTH & HOLLIS** · Kitchen Studio | Mill Valley / Marin County, CA | https://sherrybutt17-stack.github.io/kitchen-demos/site-2-hearth-hollis/ |
| 3 | **OBSIDIAN** · Kitchen Studio | Coral Gables / Bal Harbour, FL | https://sherrybutt17-stack.github.io/kitchen-demos/site-3-obsidian/ |

Launcher with all three: https://sherrybutt17-stack.github.io/kitchen-demos/

Each site has the same seven pages — `index`, `kitchen-remodeling`, `portfolio`, `financing`,
`free-consultation`, `thank-you`, `contact`.

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
toolchain. The three sites deliberately share no CSS, JS or design tokens — the divergence is
the deliverable.

See [CLAUDE.md](CLAUDE.md) for the full brief: brand systems, color tokens, conversion strategy,
accessibility rules, and the traps already hit.
