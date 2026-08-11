# Four Brand Websites — Three Kitchen Remodeling, One Security

## What this project is

Four **completely separate** websites, built to look like the work of four different world-class
agencies. Different brand, positioning, customer, color system, typography, layout philosophy, and
conversion strategy for each. Sites 1–3 are kitchen remodeling; **Site 4 is a security firm**,
added to prove the pattern and the toolchain travel to another industry without being adapted.

They are demo/sample sites: fictional brands anchored to real affluent metros so local SEO,
service-area content, and schema read as genuine.

Static HTML/CSS/JS you can open in a browser and show a client — structured so every section maps
1:1 onto a GoHighLevel landing-page block for the real build.

---

## Locked decisions

| Question | Decision |
|---|---|
| Deliverable | Coded demos only — no separate markdown strategy docs |
| Scope | **7 pages per site = 28 pages total**, all at full fidelity |
| Media | Photography throughout + hero video loops + click-to-load testimonial video |
| Website 3 "3D" | **Real WebGL** (`kitchen3d.js`, raw — no Three.js) **plus** the scroll-driven Chamber. Both, not either. |
| Brands | Fictional, each anchored to a real affluent metro |
| Site 4 source | Content structure adapted from truelovesecurity.com; brand, NAP and licences invented |
| Build system | **None.** No framework, no bundler, no package manager. |

### Nothing from the original 19-page brief was lost — it relocated

Our Process, Testimonials, FAQ and About are substantial **homepage sections**. Custom Cabinets,
Countertops and Kitchen Design are deep **H2 sections on the Kitchen Remodeling page**, each with
its own `Service` schema block so they still rank. Service Areas folds into Contact. "Kitchen
Renovation" is a keyword variant targeted from the Kitchen Remodeling page — a separate page
would cannibalize it. Privacy and Terms are footer links to be added at real launch.

---

## The seven pages (identical set across all four sites)

| # | File | Role | Absorbs |
|---|---|---|---|
| 1 | `index.html` | Emotional hook + full trust arc | Process, Testimonials, FAQ, About |
| 2 | `kitchen-remodeling.html` | Primary SEO money page | Cabinets, Countertops, Design, "renovation" variant |
| 3 | `portfolio.html` | Proof — gallery + before/after sliders | Before & After Gallery |
| 4 | `financing.html` | Kills the affordability objection | — |
| 5 | `free-consultation.html` | Conversion LP — no nav, no exit links | — |
| 6 | `thank-you.html` | Tracking URL + next-step nurture | — |
| 7 | `contact.html` | NAP, map, hours, local schema | Service Areas |

`thank-you.html` earns a distinct URL because that is where GHL workflows trigger and conversion
pixels fire. An inline post-submit state cannot do that cleanly.

---

## The four brands

### Site 1 — NORTHSTONE · *Kitchen Architecture* → `site-1-northstone/`
**Metro:** Scottsdale / Paradise Valley, Arizona
**Positioning:** The architecture practice that happens to build kitchens. Deliberately scarce —
"We accept fourteen projects a year."
**Customer:** $2M+ homeowners, design-literate, hiring a point of view rather than a contractor.
**Emotional angle:** Restraint as status. The site never oversells; the confidence *is* the pitch.
**Layout:** Strict 12-column grid. Oversized section numerals (01 / 02 / 03). Hairline rules.
Zero border-radius, zero shadows. Full-bleed photography, enormous negative space.

| Token | Value |
|---|---|
| Ink | `#111111` |
| Paper | `#FFFFFF` |
| Wash | `#F5F5F5` |
| Champagne | `#C8A96A` — accent / large text only |
| Oak | `#BE9B72` |
| Display | `Inter Tight` 800, `clamp()` to ~7rem, tracking `-0.04em` |
| Body | `Inter` 400/500 |
| Pull-quote | `Instrument Serif` |

**Conversion — qualified scarcity.** One restrained CTA, repeated at low frequency. The form
*qualifies* (scope, timeline, investment band) rather than minimizing friction; this raises
perceived value and filters the list. Proof via architectural credentials and a project counter,
not badge clutter.

---

### Site 2 — HEARTH & HOLLIS · *Kitchen Studio* → `site-2-hearth-hollis/`
**Metro:** Mill Valley / Marin County, California
**Positioning:** "The kitchen your family grows up in." StoryBrand executed literally — the family
is the hero, Hearth & Hollis is the guide with the plan.
**Customer:** Two-income families, $900k–$2M homes, renovating around real daily life.
**Emotional angle:** Warmth and safety. The fear being answered is *"will this wreck our home life
for six months?"* — so process and guarantee carry the weight.
**Layout:** Organic. 24–48px radii, arch-topped image masks, soft layered shadows, asymmetric
lifestyle two-columns, subtle paper-grain overlay, generous rounded cards.

| Token | Value |
|---|---|
| Cream | `#FAF6EF` |
| Warm White | `#FFFDF9` |
| Clay | `#B08968` — 2.9:1 on cream, so large text/rules/icons only; `#7A5334` for small text (6.0:1) |
| Bone | `#EFE7DA` — the quiet mid-tone between cream and stone |
| Walnut | `#5C4433` |
| Stone | `#D9CDBB` |
| Bronze | `#A87C4F` |
| Display | `Fraunces` |
| Body | `Karla` |

**Conversion — low-friction warmth.** Multi-step "Design Your Kitchen" quiz form (one question per
screen, progress bar) instead of a wall of fields. Financing surfaced early and often. Named
family testimonials with photos and click-to-play video. Risk reversal is a written
**"Kitchen-in-Use Promise"** — working sink and fridge access throughout the build.

---

### Site 3 — OBSIDIAN · *Kitchen Studio, Miami* → `site-3-obsidian/`
**Metro:** Coral Gables / Pinecrest / Bal Harbour, Florida
**Positioning:** Anti-contractor. An experience brand that stages the room where life happens.
Looks like a fashion house or a car launch, not a remodeler.
**Customer:** Design-obsessed, brand-fluent, 35–55, buys the story as much as the cabinetry.
**Emotional angle:** Awe, then desire. Earn the "how did they do that" reaction in three seconds.
**Layout:** Dark editorial. Bodoni at absurd scale. Pinned scroll chapters, horizontal portfolio
rail, page-load curtain, character-scramble headline reveals, custom cursor on desktop.

| Token | Value |
|---|---|
| Black | `#0A0A0A` |
| Graphite | `#1A1C1B` |
| Copper | `#B87333` |
| Off-white | `#EDE8E0` |
| Ink (`--ink-deep`) | `#101A26` — midnight navy. Replaced oxblood, which replaced emerald. **No green and no red anywhere on Sites 2 or 3.** |
| Display | `Bodoni Moda` |
| UI / micro-caps | `Space Grotesk`, tracking `0.18em` |

#### The Room — real WebGL 3D (`assets/js/kitchen3d.js`)

An actual three-dimensional kitchen, written in **raw WebGL with no library and no model
files** (~14KB). Geometry is generated procedurally from one unit cube; stone and timber are
procedural fbm shaders, so nothing has to be downloaded.

- perspective camera, orbits on drag/swipe, drifts when idle, arrow-key operable
- scroll drives a dolly-in and a darkness-to-light reveal
- three countertop stones (Calacatta / Nero Marquina / Copper Ore) cross-fade live in the shader
- enclosed shell (ceiling + two returns) — without it the joinery floats and reads as a model
- cabinetry is a shader material: door shadow-gaps at 620mm pitch plus a copper bar pull
- the two pendants are real inverse-square point lights, and their shades are emissive
- analytic floor reflection: the floor ray-marches the island AABB, so it mirrors with no texture
- contact occlusion darkens surfaces toward the floor and into the back corner
- `faceUV()` picks UVs from the dominant face normal so vertical panels don't stripe
- falls back to a still photograph without WebGL or under `prefers-reduced-motion`

Wire-up: the section is `#k3d`; the picker buttons are `.k3d__mat[data-stone]` and call
`window.OBSIDIAN_SET_STONE(key)` from `site.js`.

#### The Transformation Chamber
Pinned full-viewport stage driven by **one** scroll-progress CSS custom property:

| Progress | What happens | Copy beat |
|---|---|---|
| 0–20% | Dated kitchen, desaturated, low light | "Every great kitchen starts in the dark." |
| 20–40% | Gradient lighting sweep; `filter` brightness/saturation ramps | "Then someone turns on the light." |
| 40–60% | `clip-path` wipe cross-fades cabinetry; SVG copper hardware line-draws | "Cabinetry, to the millimeter." |
| 60–80% | **Interactive** — 3 countertop swatches swap the surface layer | "Choose your surface." |
| 80–100% | Full-color reveal, headline scales in, CTA lands | "This is where your life happens." |

`IntersectionObserver` + `requestAnimationFrame`. `prefers-reduced-motion` short-circuits to the
final state. No library.

> **Why not real WebGL:** a true scroll-scrubbed frame sequence needs 60–120 renders of the *same*
> kitchen under changing light, which stock cannot supply, and Three.js costs ~600KB plus a model
> host GHL won't provide. The layered composite is cinematically equivalent at ~15KB.

**Conversion — earned intent.** The wow persuades; the ask stays minimal (name, email, ZIP). A
sticky copper progress rail doubles as a persistent CTA. Portfolio-first funnel: visitors convert
*after* the horizontal project rail, not before it.

---

### Site 4 — VANTAGE · *Security Systems* → `site-4-vantage/`
**Metro:** Westlake / Southlake / Colleyville, Texas — serving the Dallas–Fort Worth Metroplex
**Industry:** Home and commercial security — cameras, monitored alarms, CCTV, access control.
**Source:** Content structure, service list, no-contract positioning, warranty terms, monitoring
price ladder and DFW service area are adapted from truelovesecurity.com. The brand, address, phone,
email, licence numbers and reviews are **invented** and flagged as sample throughout.
**Positioning:** The firm for people who want to *know*, not to worry. Systems engineered per
property and installed by the people who designed them. Month to month — never a contract.
**Customer:** $1.5M+ DFW homes plus commercial — dealerships, medical, warehouse, multi-site retail.
**Emotional angle:** Certainty, never fear. The site never sells on threat.
*"The dark was never the problem. Not knowing was."*
**Layout — command surface.** Dark glass panels on a hairline column grid, mono data readouts,
HUD corner ticks, faint scanlines, and **luminous 1px lit edges instead of shadows**. Radius is 4px
everywhere — distinct from Northstone's 0, Hearth's 24–48px and Obsidian's editorial flatness.

| Token | Value |
|---|---|
| Void | `#06070A` — page base |
| Panel | `#0D1117` — raised glass |
| Platinum | `#E8EAED` — body text, 16:1 on void |
| Steel | `#9AA4B2` — secondary, **7.99:1** |
| Signal | `#4D8DFF` — accent, **6.30:1 on void, so it is AA-safe at body size** |
| Signal-lt | `#7FB0FF` — accent on panels |
| Signal-dk | `#2F6BD4` — small text on light surfaces |
| Display + body | `Sora` 300/400/600/700 |
| Micro-caps / data | `JetBrains Mono` 400/500 |

Signal blue clearing 4.5:1 on the base is a real advantage over Obsidian's copper: the accent needs
no "large text only" caveat. **No green and no red** anywhere, palette or photography — so status
indicators break convention deliberately. Armed reads signal blue; an alert pulses hot white.

#### The Perimeter — live coverage plan (`assets/js/perimeter.js`)

Raw 2D canvas, no library, DPR-aware, `ResizeObserver`. ~14KB. Site 4's answer to Obsidian's WebGL
room. A top-down property plan — house, garage, shop, pool, driveway, street:

- camera cones are **ray-marched and clipped against the building footprints**, so structures cast
  real coverage shadows. That occlusion is what separates engineering from decorative wedges
- the coverage percentage is **measured from the same ray field the cones are drawn from**, so what
  you see and what the readout claims cannot disagree. Drag a camera and the number moves
- clicking a node opens that camera's view — a real photograph under a HUD frame
- a radar sweep, a walking subject that draws a detection box, and a live event feed
- scroll drives dusk → night; `IntersectionObserver` pauses the loop off-screen
- `prefers-reduced-motion` renders one static night frame, keeping drag and keyboard live

**One plan unit is 2 ft.** The lot inside the boundary is 90 × 62 units = 0.51 acres, and the
default cameras are a real 2.8 mm lens (110°) at 58 units = 116 ft of IR. That configuration
measures **76%**, which is the best whole-lot figure five cameras with honest optics can deliver.
Starting at a plausible number rather than a perfect one is deliberate: there is headroom, so
dragging a camera earns something instead of only ever spoiling a 99% nobody could claim.

**The camera nodes are real `<button>`s layered over the canvas** — focusable, draggable,
announced, 46px hit area. The canvas only ever draws; it is never the control surface. That is what
makes the whole feature keyboard-operable without a parallel implementation.

**Conversion — measured certainty.** The Perimeter does the persuading, so the ask stays short
(name, phone, ZIP, email, property type). Risk reversal is that **the drawn coverage plan is yours
either way**, including if you hand it to a competitor.

---

## Repository structure

```
/
├── CLAUDE.md
├── index.html                      ← launcher: three demo cards
├── assets/media/img/               ← 42 photos × 4 variants (400/800/1600 webp + 1200 jpg)
├── assets/media/video/             ← 11 clips + posters, plus -sm.mp4 360p cuts
├── assets/media/CREDITS.json       ← source URL + licence for every asset
├── scripts/build.py                ← generates dist/ (see below)
├── site-1-northstone/              ← SOURCE: external css/js, relative image paths
│   ├── index.html … contact.html   (7 pages)
│   ├── assets/css/site.css         ← source of truth for this site's design system
│   ├── assets/js/site.js           ← source of truth for this site's behaviour
│   └── llms.txt
├── site-2-hearth-hollis/           ← same 7 pages, wholly independent CSS/JS
├── site-3-obsidian/                ← same 7 pages, own CSS/JS + chamber.js
├── site-4-vantage/                 ← same 7 pages, own CSS/JS + perimeter.js
└── dist/                           ← BUILT: what you paste into GoHighLevel
    └── site-*/ *.html              (CSS + JS + all images inlined, zero external files)
```

## The build step (`python3 scripts/build.py`)

Source pages use external CSS/JS and relative image paths — comfortable to edit.
`dist/` pages are **completely self-contained**, which is what GHL needs.

| Source | → | dist |
|---|---|---|
| `<link href="assets/css/site.css">` | → | full `<style>` inlined in `<head>` |
| `<script src="assets/js/site.js">` | → | full `<script>` inlined before `</body>` |
| `<img src="../assets/media/img/x-800.webp">` | → | `src="data:image/webp;base64,…"` |
| `<video data-src="…hero.mp4">` | → | base64 MP4 (360p `-sm.mp4` cut, ≤1.4MB) |

**Always edit the source page + `site.css` / `site.js`, then re-run the build.** Never hand-edit
anything in `dist/` — it is regenerated from scratch every run.

Width caps and quality live in `HERO_W` / `BA_W` / `POSTER_W` / `DEFAULT_W` / `CARD_W` at the top
of `build.py`. Roles are resolved from the **wrapper** element in step 3, not from the `<img>`.
Typical output: 0.13–0.4 MB per page, 1.7–1.8 MB for a portfolio, 2.2–3.1 MB for a homepage
carrying an inlined hero video.

> Spend bytes on pixels, not on quality. At a fixed width, WebP q82 → q76 costs ~12% of the
> bytes and is invisible on photographs; 1100px → 1500px costs ~60% and is the thing you can
> actually see. Measured across a six-photo sample in `scripts/`.

> ⚠️ Regex replacements in `build.py` **must** use `lambda` callbacks. CSS, JS and data URIs
> contain backslashes that Python's `re.sub` would otherwise parse as escape sequences.

### 🚫 Do not
- **Do not share CSS, JS, or design tokens across the four sites.** Divergence is the deliverable.
- Do not add a framework, bundler, or package manager. `build.py` (stdlib + Pillow) is the whole toolchain.
- Do not add jQuery or an animation library.
- Do not exceed the JS budget: ≤20KB for Sites 1–2 (currently ~15.5KB each);
  ≤40KB for Site 3 (currently ~39KB across `site.js` + `chamber.js` + `kitchen3d.js`);
  ≤30KB for Site 4 (currently ~27KB across `site.js` + `perimeter.js`).
  The ceiling moved from 35KB to 40KB to pay for the lighting/material upgrade in
  `kitchen3d.js` — that was a deliberate trade, not drift.
- Do not hand-edit `dist/`.

---

## Media rules

**Environment constraint discovered during setup:** this machine can reach `images.unsplash.com`,
`images.pexels.com`, `picsum.photos`, `upload.wikimedia.org` and `res.cloudinary.com` directly,
but `unsplash.com` (401), `pexels.com` (403) and all stock **video** CDNs (Pexels/Mixkit/Coverr,
403) are bot-blocked. The Pexels and Unsplash search APIs both require a key. Openverse is
reachable but only indexes amateur Flickr photography — unusable at this quality bar.

**The 403 is a `curl` fact, not a network fact — `WebFetch` reads Pexels search pages fine.**
Discovered while sourcing Site 4's pool. `curl https://www.pexels.com/search/...` still returns 403,
but `WebFetch` on the same URL returns the full result list, and every photo page URL ends in its
numeric ID. So the working harvest loop is:

1. `WebFetch` a `pexels.com/search/<term>/` page and read off ~24 `ID — description` pairs
2. build the CDN URL from the ID alone:
   `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=2400`
3. download, contact-sheet with PIL, **review visually**, then encode the variant ladder

That beats guessing slugs: it produced 35 usable photographs from 84 candidates in two rounds.
`WebSearch` restricted to `pexels.com` also surfaces IDs but far fewer per call. Stock **video**
CDNs remain 403 to everything — re-verified against `videos.pexels.com` and `assets.mixkit.co`.

**Consequence for Site 4: it has no hero video and never will get one from stock.** Its homepage
hero is a photograph, which CLAUDE.md already names as the only way to make a hero genuinely sharp
— the three video heroes are capped at their 1280×720 poster grabs, and Vantage's is 2200px.

Consequence: media is **downloaded into `assets/media/`**, not hotlinked, so the demos are
self-contained and work offline. Every candidate is visually verified via a PIL contact sheet
before use — never trust an image ID by name alone.

**Hero video.** Muted, looping, `playsinline`, with:
- `poster` frame painted first so LCP is an image, never a video decode
- `preload="none"`; `<source>` attached only once the hero enters the viewport
- playback paused via `IntersectionObserver` when scrolled off-screen
- poster only under `prefers-reduced-motion` and `navigator.connection.saveData`
- explicit `width`/`height` + color-matched background so there is zero layout shift

**Testimonial video — facade pattern.** Poster image plus a play button; the `<iframe>` is
injected only on click. Zero third-party JS on initial load. Each facade is a real `<button>`
with an `aria-label`.

**Resolution masters.** Each photo has a `-2400.webp` master alongside the 400/800/1600
variants; `build.py` prefers it and falls through to `-1600.webp` when it is absent.
34 of the 42 were re-fetched at source resolution (Burst serves the native file when you
drop `?width=`, up to 4000px; Unsplash serves `w=2560&q=90`). **Eight Burst slugs have
since been delisted** — the CDN now answers them with the Burst gallery HTML, not an
image — so `before-granite`, `h-dining-warm`, `n-cabinetry-panel`, `n-kitchen-island`,
`n-marble-abstract`, `o-kitchen-navy`, `o-knife-detail` and `o-range-dark` keep their
existing 1600px masters. All eight are card / before-after slots at 34–52vw, where 1600px
is already enough, so none of them is a hero. Re-fetching them would mean choosing new
photography. A re-fetch script lives in the session scratchpad, not in `scripts/`.

**The three hero video posters are 1280×720 frame grabs**, because the stock clips are
720p. That is the resolution ceiling on each homepage's LCP image; no build setting can
raise it. Making a hero genuinely sharp means giving it a photograph instead of a video.

**Photography.** `srcset` + `sizes`, `loading="lazy"`, `decoding="async"`, explicit dimensions.
Each site's `index.html` carries an `IMAGE_MANIFEST` comment listing every media slot, its
intent, and its aspect ratio, so real client media swaps in cleanly.

**Before/after sliders.** Pure CSS `clip-path` driven by a `range` input — keyboard operable,
touch-draggable, no library.

---

## Conventions

**GHL mapping.** Every section opens with a build comment:
```html
<!-- GHL SECTION 03 · Transformation | full-width | 2-col → 1-col @768 | bg: image + overlay -->
```

**Homepage section order** (all four sites — differentiation is in execution, not sequence;
Site 4 substitutes The Perimeter for the before/after slot and a photographic hero for the video):
Hero (video) → Trust bar → Problem → Transformation before/after → Services → Portfolio teaser →
Process → Testimonials (video facades) → About → Financing → FAQ → Final CTA.

**Copy rules.** Hormozi value equation on every page: raise dream outcome and perceived
likelihood, lower time delay and effort. Every page answers *why us / why trust you / why now /
what's different*.
Banned phrases: "quality kitchen remodeling services," "we pride ourselves," "attention to
detail," and "family owned and operated" as a standalone claim.

**Schema per page:** `LocalBusiness` (+ `areaServed`), `Service`, `FAQPage`, `BreadcrumbList`,
`AggregateRating`/`Review`, `VideoObject`. All review data flagged sample in an HTML comment.
Plus canonical, OpenGraph, Twitter card, and a single `<h1>` with clean H2–H4 descent.

**AEO/GEO.** Question-shaped H2/H3s, each followed immediately by a 40–60 word direct answer in
one paragraph (the extractable unit). Entity density: city and neighborhood names, material and
finish terminology, real cabinetry and stone brand references. A "Key Facts" definition list on
the service page. `llms.txt` at each site root.

**Accessibility & contrast — non-negotiable.**
- Champagne `#C8A96A` fails AA as body text on white → large display text, rules and icons only;
  use `#8A6E36` for small text on light backgrounds.
- Copper `#B87333` on `#0A0A0A` passes for **large text only** → small text on dark uses `#EDE8E0`.
- Clay `#B08968` is decorative/large only (2.9:1); use `#7A5334` for any small text (6.0:1).
- Site 2 is **warm neutrals only** — no cool accent at all. Sage was removed for being green,
  and the harbor blue that briefly replaced it was removed for being cool.
- **No green and no red** in either the palettes or the photography — client instruction.
  Photos carrying either were swapped out; see `scripts/`-adjacent notes in git history.
- Every site: skip link, visible `:focus-visible` rings, `aria-label`s on icon buttons,
  keyboard-operable accordions/sliders/video facades, honors `prefers-reduced-motion`.

**Mobile.** Fluid `clamp()` typography, ≥48px tap targets, sticky bottom CTA bar (tap-to-call +
book), off-canvas nav, `overflow-x: hidden` guard plus per-section audit at 320/375/414/768px.

**Performance (target 95+).** Critical CSS inlined in `<head>`; max 2 Google font families per
site via `preconnect` + `display=swap`; all below-fold media lazy; animations restricted to
`transform` / `opacity` / `filter`.

---

## Build order

1. `CLAUDE.md` ✅
2. Media pool — download + visually verify into `assets/media/`
3. **Site 1 — Northstone.** Establishes the seven-page pattern.
4. **Site 2 — Hearth & Hollis.** Same page set, independent design system + multi-step form.
5. **Site 3 — Obsidian.** Same page set, plus `chamber.js` and horizontal portfolio rail.
6. Root `index.html` launcher — four cards, one line of positioning each.
7. **Site 4 — Vantage.** Same page set in a different industry, plus `perimeter.js`.

---

## Preview & verify

```bash
cd "/Users/shaheerbutt/Documents/Kitchen Remoddling website 1"
python3 -m http.server 8080
# → http://localhost:8080
```

- **Responsive:** DevTools at 320 / 375 / 414 / 768 / 1024 / 1440 / 2560px. Zero horizontal
  scroll at every width; no text below 16px; no tap target under 48px.
- **Performance:** Lighthouse mobile preset on all three homepages plus the three service pages.
  Target 95+ performance, 100 accessibility. Investigate any CLS above 0.02.
- **Media:** every hero video plays muted and loops, pauses off-screen; no testimonial iframe
  appears in the Network tab until its play button is clicked.
- **Schema:** paste rendered source into Google's Rich Results Test — `LocalBusiness`, `Service`,
  `FAQPage`, `BreadcrumbList`, `VideoObject` all parse without errors.
- **Motion:** enable macOS Reduce Motion, reload Site 3 — the Chamber renders its final state
  immediately, no scroll-jacking; hero videos show posters only.
- **Keyboard:** Tab each homepage start to finish — skip link fires first, focus ring always
  visible, accordions / sliders / video facades operable, no focus trap.
- **Links:** every nav and footer link on all four sites resolves; all 28 pages, no 404s.
- **Funnel:** each site's CTAs reach `free-consultation.html`; submitting lands on `thank-you.html`.

---

## Traps already hit — do not reintroduce

**`clip-path` deadlocks `IntersectionObserver`.** An element that starts at
`clip-path: inset(0 0 100% 0)` has a zero-area intersection rectangle, so an observer
watching *that element* never fires and it stays clipped forever. This silently hid every
`.ba` before/after slider and two `.fig` blocks on Sites 1 and 2 — the large blank bands
the client reported as "empty spaces". The fix in both `site.js` files: observe an
**unclipped ancestor** and forward `data-in` down to the clipped children. Any future
reveal that combines `.rv` with `.clip` must go through that path.

**Reveal masks need descender headroom.** `.split .w` carries
`padding-bottom: .18em; margin-bottom: -.18em`. At `.06em` the tails of `g`, `y` and `p`
grazed the mask edge on large display sizes.

**Section rhythm.** `--sect` was cut roughly 30% across all three sites (Northstone
`9.5rem → 6.75rem`, Hearth `9rem → 6.5rem`, Obsidian `10rem → 7.25rem`) and every
`.shead` is now `6fr/5fr` and bottom-aligned. Before that, a tall headline in a narrow
4fr column left the right-hand 60% of the section head empty.

**Off-screen hiding breaks inside GHL — clip instead.** `.skip` was hidden with
`position: absolute; top: 0; transform: translateY(-120%)`. Standalone, `absolute`
resolves against the initial containing block, so it sat above the viewport. Inside a
GHL Custom-HTML block it resolves against GHL's `position: relative` column, so it rose
only its own height and landed *on* the page above the site — a black "SKIP TO CONTENT"
chip over the client's own header, inset by the column's left padding. All three sites
now hide it the way `.vh` always did: a 1px box with `overflow: hidden`, `clip` and
`clip-path: inset(50%)`, restored to `auto` on `:focus`, with `position: fixed` so the
revealed state lands at the viewport corner. **A clipped box is invisible at any nesting
depth; a translated one is only invisible if you know its containing block.** Never hide
anything in these sites by moving it off-screen. `scripts/ghl-nesting-test.html`
reproduces the GHL column chain and shows the before/after side by side.

**`\b` does not fence a BEM name, and wrapper classes are not on the `<img>`.**
`build.py`'s `ROLE_RULES` matched `class="[^"]*\bhero__media\b'` and `class="[^"]*\bba\b'`
against each `<img>` tag. Both silently missed **every one of the 110 images in all 21
pages**: `hero__media` is a class on the surrounding `<div>` and `ba` on the surrounding
`<figure>`, and `\bba\b` cannot match `ba__after` because `_` is a word character. So no
image ever hit the 1500px rule — everything built at the 820/1000px fallback at q70,
which is what made the photography look soft. Roles are now assigned by sweeping the
wrapper (`in_wrapper("hero")` / `in_wrapper("ba")`) before the generic `<img>` pass.
If you add a role, add it as a wrapper sweep and verify the count changes.

**`overflow-x: hidden` hides the evidence, so measuring `scrollWidth` is not an
overflow test.** Site 4's header put a `flex: none` wordmark and a `flex: none`
CTA group in one bar. Below 640px they out-measured the viewport and shoved the
burger past the right edge — and because `body { overflow-x: hidden }` clips
rather than scrolls, `documentElement.scrollWidth - clientWidth` stayed **0** at
every width. The QA sweep reported zero overflow on all 21 page/viewport
combinations while the only navigation control on phones was unreachable. It
surfaced only when Playwright tried to click `.burger` and reported "element is
outside of the viewport".

The honest check walks every element and compares its `getBoundingClientRect()`
against the viewport box, ignoring `position: fixed` chrome:

```js
r.right > innerWidth + 1.5 || r.left < -1.5
```

`scripts/`-external `offscreen.py` in the session scratchpad does this at
320/375/390/414/768/1024/1440/2560px. **Run it alongside the scrollWidth check,
never instead of it** — one catches content that pushes the page wide, the other
catches content silently clipped off the edge. The fix was to drop the header CTA
and the wordmark subtitle at ≤640px, where `.mbar` already carries "Book a survey".

**Fixed CTA bar.** `.mbar` is `position: fixed`, so each site pairs
`.mbar { display: grid }` with a matching `body { padding-bottom }` in the same media
query. Drop one and the last rows of every page sit under the bar.

## What the QA sweep does and does not flag

`scripts/`-external harness (kept in the session scratchpad) drives Playwright over all
21 pages × phone/tablet/desktop and checks horizontal overflow, sub-11px text, sub-44px
touch targets, clipped text, dead vertical space and text collisions.

Collision detection compares **glyph extents**, not border boxes — padding and
line-height leading are stripped first. Three overlap classes are excluded because they
are the design: fixed chrome (`.mbar`, `.hdr`) floating over content, the Chamber/hero
cross-fading stacked layers in one pinned stage, and consecutive lines of a single
display heading whose em boxes overlap at `line-height: 1.02` while the glyphs do not.
Content inside a **closed `<details>`** must also be skipped — Chromium still reports
boxes for it.

Current state: **zero** overflow, zero sub-11px text, zero sub-44px touch targets, zero
clipped text. Remaining "dead space" hits are the Chamber and `.pin` sections, which are
intentionally tall pinned scroll stages.


## Typographic measures: `ch` is a body-font unit

`max-width: 18ch` on a heading caps it at 18 characters **of the body font**, not of the
heading. On Site 3, `.phero__h` at `.d1` renders around 130px Bodoni, where the single
word "composition." needs ~700px — wider than its 695px column, so it could not wrap and
simply overflowed. Display headings therefore use `em` measures and, where a long word
still will not fit, their own smaller `clamp()`. The same trap clipped `ROC #331402` and
`CSLB #1049772` in the trust bar, and the stats band inside the landing pages' narrow
left column.

**`&nbsp;` in a display heading is a liability.** All three sites already set
`text-wrap: balance`, which prevents orphans properly. The extra non-breaking spaces
welded words into tokens too wide to fit their columns — 23 of them were removed from
Site 3's headings for exactly that reason. Do not reintroduce them in `h1`–`h3`.

## The WebGL room: what makes it read as real

Beyond geometry, the things that moved it furthest from "low-poly" were, in order:
filmic tone mapping (`aces()` — raw linear output is what makes WebGL look plasticky),
shadow rays cast through the island and cabinet-run AABBs, an emissive window acting as
a third light, a vignette, and props on the counters. An empty room always reads as a
model.

**Shadow rays must be offset along the surface NORMAL, not the light vector.** Offsetting
along the light leaves the origin inside its own box, so every surface self-shadows — that
mistake alone pushed 79% of the frame into shadow.

---

## Pasting into GoHighLevel — the two things that go wrong

**1. Paste `dist/`, never `site-*/`.** The source pages carry
`<link rel="stylesheet" href="assets/css/site.css">` and
`<script src="assets/js/site.js">`. Those paths do not exist inside GHL, so the page
renders as unstyled markup. Only `dist/` has the CSS, the JavaScript and every
photograph embedded. Each built file now opens with a comment saying so.

**2. Full width.** A GHL Custom-HTML block sits inside a centred, padded column, so
pasted markup inherits that column's width. Every built page carries a
`<style id="ghl-fullbleed">` block that breaks each band back out to the viewport:

```css
.hdr, .lphdr, .ftr, main, main > section, .marq {
  width: 100vw; max-width: 100vw;
  margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw);
}
```

`calc(50% - 50vw)` resolves against the *parent's* width, so it works at any nesting
depth — the selectors must NOT be anchored to `body >`, because GHL nests the content
several levels down. Verified against a simulated GHL column
(`.c-section > .c-row > .c-column`): 15/15 bands full-width at 1440px and 390px on all
three sites. Still set the GHL section to full width with zero padding — the escape is
a safety net, not a licence to skip that.

`overflow-x: clip` is used rather than `hidden`, because `hidden` on an ancestor
silently disables `position: sticky` on the landing-page form.

## Byte order matters as much as byte count

Inlining everything is right for GHL but put 0.6–1.2 MB of base64 *ahead* of the hero
markup, so the parser could not reach the headline until the whole blob arrived.
Measured on throttled 4G:

| | before | after |
|---|---|---|
| Northstone first paint | 3648 ms | 2612 ms |
| Obsidian layout shift | **0.70** | **0.017** |
| Hearth & Hollis shift | 0.295 | 0 |
| Bytes before hero content | ~1.2 MB | ~14 KB |

The fix: `build.py` emits the hero video and every `loading="lazy"` image into
`<script type="text/plain">` blocks at the end of the document, with a four-line
resolver that hands them back before `site.js` runs. Nothing external is added and no
image quality changes — only the order the bytes arrive in. **Do not move those payloads
back into the markup.**

Media is still 94–96% of each homepage. The next real gain is hosting the three hero
videos as normal files instead of inlining them, which would roughly halve first paint.
That trades away one-file-paste convenience, so it is the client's call.
