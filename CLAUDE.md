# Six Brand Websites — Three Kitchen Remodeling, One Security, One Dental, One Landscaping

## What this project is

Six **completely separate** websites, built to look like the work of six different world-class
agencies. Different brand, positioning, customer, color system, typography, layout philosophy, and
conversion strategy for each. Sites 1–3 are kitchen remodeling; **Site 4 is a security firm**,
**Site 5 is a dental practice** and **Site 6 is a landscaping and exterior-cleaning company**, each added to
prove the pattern and the toolchain travel to another industry without being adapted.

Sites 1–4 are demo/sample sites: fictional brands anchored to real affluent metros so local SEO,
service-area content, and schema read as genuine. **Sites 5 and 6 are different — each is a
redesign of a real business** (sapphiredentalstudio.com and bluefoxlandscapeandservices.com) using that
business's own content, people, prices, photography and logo palette. Nothing about either is
invented, which changes the rules: see their brand blocks.

Static HTML/CSS/JS you can open in a browser and show a client — structured so every section maps
1:1 onto a GoHighLevel landing-page block for the real build.

---

## Locked decisions

| Question | Decision |
|---|---|
| Deliverable | Coded demos only — no separate markdown strategy docs |
| Scope | **7 pages per site for Sites 1–4; 9 for Site 5; 39 files for Site 6 (34 pages + 4 alternate routes + thank-you) = 76 files**, all at full fidelity |
| Media | Photography throughout + hero video loops + click-to-load testimonial video |
| Website 3 "3D" | **Real WebGL** (`kitchen3d.js`, raw — no Three.js) **plus** the scroll-driven Chamber. Both, not either. |
| Brands | Sites 1–4 fictional, each anchored to a real affluent metro. **Sites 5 and 6 are real businesses.** |
| Site 4 source | Content structure adapted from truelovesecurity.com; brand, NAP and licences invented |
| Site 6 source | bluefoxlandscapeandservices.com — a real company. Services, area, hours, financing and the $250 design fee are its own |
| Build system | **None.** No framework, no bundler, no package manager. |

### Nothing from the original 19-page brief was lost — it relocated

Our Process, Testimonials, FAQ and About are substantial **homepage sections**. Custom Cabinets,
Countertops and Kitchen Design are deep **H2 sections on the Kitchen Remodeling page**, each with
its own `Service` schema block so they still rank. Service Areas folds into Contact. "Kitchen
Renovation" is a keyword variant targeted from the Kitchen Remodeling page — a separate page
would cannibalize it. Privacy and Terms are footer links to be added at real launch.

---

## The seven pages (identical set across Sites 1–4)

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

### Site 5 — SAPPHIRE · *Dental Studio* → `site-5-sapphire/`
**Metro:** Winter Garden / Windermere / Horizon West, Florida — west Orange County
**Industry:** Dentistry — implants, prosthodontics, periodontics, cosmetic, sedation, sleep apnea.
**Source:** A redesign of **sapphiredentalstudio.com**. Unlike Sites 1–4 this is a **real business**,
so the NAP, the three doctors and their credentials, the membership tiers and their prices, the
financing partners, the hours and the service list are all **real and taken from the practice's own
published material**. The before/after case photography and the three headshots are the practice's
own files. The **palette is taken from the practice's live website theme**, not from its logo:
`#40b0df` cyan and `#ffd53d` yellow, read off the site's own `--wp--preset--color--*` tokens.
The logo and the website disagree — the logo PNG is `#001868` navy + `#D8B860` gold (19.7% and
18.7% of its opaque pixels) — and the client chose the website. **The real logo is used as
artwork**: the gem mark in the header, the full lockup in the footer, plus a reversed variant
(navy → `--on-gem`, gold untouched) for the dark bands.

> **The rule that follows from that.** Because the business is real, nothing may be invented about
> it. No fabricated reviews, no invented licence numbers, no made-up clinical claims about an
> identifiable patient. The three homepage testimonial cards are therefore **explicit placeholders**
> marked SAMPLE in an HTML comment and in the footer, to be replaced with real attributed Google
> reviews. The `aggregateRating` (5.0 / 40) is the practice's genuine public Google rating, checked
> August 2026, with an HTML comment telling whoever launches it to re-confirm the count.

**Positioning:** Three board-certified specialists under one roof — a periodontist who places the
implant, a prosthodontist who restores it, and a dentist anesthesiologist who handles sedation. In
most towns those are three referrals; here it is one plan, one building, one day.
**Customer:** Implant, full-arch and cosmetic patients, plus the large group who avoid dentistry
entirely out of fear. The anxiety segment is the wedge, and the in-house anesthesiologist is the
proof.
**Emotional angle:** Relief, not aspiration. *"The dentistry was never the hard part. The dread was."*
**Layout — clinical light, rounded.** A light, luminous surface: near-white ground, deep-teal
full-bleed "gem" bands for contrast, yellow hairlines, and generous air, with a faint 60°/-60°
lattice carried over from the logo's tessellation.

> **The facet is gone.** It was documented here as the signature motif, but the `.fct` chamfer
> classes were never applied to a single element on any of the nine pages — the site was not
> faceted, it was square. It now uses a radius scale instead: `--r` 8 / `--r-m` 14 / `--r-l` 20 /
> `--r-xl` clamp(22–34) / `--r-pill`. The radii stay tighter than Hearth & Hollis's 24–48px
> organic curves, and the ◆ bullets and the lattice stay, so the two still do not read alike.

| Token | Value |
|---|---|
| Porcelain | `#F4FAFD` — page base, a tint of the theme's `primary-extra-light` |
| Paper | `#FFFFFF` — raised panel (theme `base`) |
| Mist / Frost | `#ECF7FC` / `#D9EFF9` — theme `primary-extra-light` / `primary-light` |
| Sapphire | `#205870` — theme `primary-extra-dark`; brand ink, **7.41:1 on porcelain** |
| Sapphire-2/3 | `#2D7B9C` — theme `primary-dark`; raised gem panel and button hover (white 4.75:1) |
| Cyan | `#40B0DF` — theme `primary`. **2.35:1 on porcelain, so fills, rules and icons only** |
| Abyss | `#0E2731` — **derived**; the gem bands and footer |
| Ink | `#112F3C` — **derived**; body text, 13.33:1 |
| Slate | `#385765` — **derived**; secondary, 7.33:1 |
| Slate-dim | `#527483` — **derived**; tertiary, 4.76:1. **Light-ground only** — 3.09:1 on abyss |
| Gold | `#FFD53D` — theme `secondary`. **1.34:1 on porcelain, so large display / rules / icons only; 10.96:1 on abyss, so legal as text on the gem** |
| Gold-deep | `#836D1F` — **derived**; small yellow text on light, **4.78:1** |
| On-gem / dim | `#EAF6FB` / `#99CDE2` — text on the bands, 14.10:1 / 9.00:1 |
| Display | `Cormorant Garamond` 300–600 + italic |
| Body / UI | `Manrope` 400/500/600/700 |

> **The theme ships no near-black and no accessible yellow.** Its darkest yellow, `#B3952B`, is
> 2.90:1 on white. So `--abyss`, `--ink`, `--slate`, `--slate-dim` and `--gold-deep` are derived by
> darkening the theme hues until they hit their contrast target. Every value above is measured
> against the ground it is actually used on, not against pure white — `--gold-deep` measures 4.78:1
> on porcelain but only 4.38:1 would have been reached had it been solved against `#FFFFFF`.

**Light-ground tokens must not be used inside a `.gem` band.** `--slate` is 2.53:1 and `--slate-dim`
3.09:1 on `--abyss`. The band has its own pair, `--on-gem` / `--on-gem-dim`. This bit the Smile
Studio controls, `.check`, `.ss__hint` and `.ftr__bot`, all of which now have `.gem` overrides.

**Collision risk with Vantage went UP, and is managed rather than absent.** Vantage's accent is
`#4D8DFF`; Sapphire's is now `#40B0DF` — the same bright-blue family, where the old `#001868` navy
was not. They stay apart on ground and everything else: Vantage is ~96% dark pixels, mono type, HUD
ticks and 4px radius; Sapphire is ~90% light pixels, a Garamond display face, pill buttons and
20–34px radii, with a yellow secondary Vantage does not have. Sapphire still never uses `#4D8DFF`,
a mono family, or `.18em` uppercase micro-caps. **If either brand's accent moves again, re-check
this.**

#### The Smile Studio — WebGL over real paired case photography (`assets/js/smile-studio.js`)

Site 5's answer to Obsidian's WebGL room and Vantage's Perimeter. ~16KB, raw WebGL, one fullscreen
quad, three textures, no library.

The practice publishes ten genuine before/after cases. Because each case is a **pair**, the tooth
mask never had to be hand-traced onto a photograph — it is **derived offline from the before→after
difference** plus a luminance and redness gate, cleaned with a largest-connected-component pass and
a median/blur, and shipped as a greyscale image beside the pair. The mask is therefore a
*measurement of the case*, not an artist's guess about it, and re-shooting a case regenerates its
mask rather than breaking it. Four cases (01, 02, 07, 08) segment cleanly and are the ones the
Studio offers; the rest are ordinary sliders in the gallery.

- the **whitening slider shades the before photograph** inside the mask, in the fragment shader:
  pull the enamel toward neutral, then lift toward white weighted by its own luminance so the
  tooth's shading and texture survive instead of flattening to a white paste
- the **reveal button cross-fades to the genuine clinical after**, so shape and alignment change,
  not just shade
- a divider wipes between "Today" and the live state — done **inside the canvas**, deliberately, so
  no `clip-path`-ed DOM element exists for an `IntersectionObserver` to deadlock on
- a one-shot entrance reveals the real result on its own after 900ms, because with nothing applied
  both halves are the same photograph and the widget otherwise arrives looking inert. Any visitor
  interaction cancels it.
- an "I get anxious at the dentist" checkbox rewrites the plan readout **and** the CTA and its href
  — a lead qualifier disguised as a control, mapping straight onto the practice's real differentiator

> **Simulation and real outcome are labelled separately and never blended.** The whitening is
> called a simulation everywhere it appears and **never claims a VITA shade number**, because you
> cannot honestly measure an absolute shade through an unknown white balance. The revealed side is
> an unretouched photograph. A tool that blurred those two would be the exact thing dental
> advertising rules exist to police, and for a real practice with three named board-certified
> doctors that is not a footnote — it is the deciding constraint.

**The canvas is `aria-hidden` and only ever draws.** Every control is a real form element beside
it — `input[type=range]`, `button[aria-pressed]`, `input[type=checkbox]` — and the plan readout is
a native `<output>`, which is implicitly `role="status" aria-live="polite"`, debounced 260ms so a
slider drag does not fire a hundred announcements. That is what makes the whole feature
keyboard-operable with no parallel implementation.

**Texture loading.** The case images ship `loading="lazy"` so the three cases nobody opens are never
fetched — but they live in a 1px clipped `.vh` box, where the lazy loader has no viewport proximity
to react to and **would never start them at all**. `whenReady()` therefore promotes just the
requested case's images to `loading="eager"` at the moment that case is needed. Marking them eager
in the markup instead would pull all twelve down on every visit.

**Conversion — relief, then proof.** The Studio persuades, the ask stays short. Risk reversal is
that the first visit is diagnosis only: *"You can come in, meet the team, look at the room and leave
again without anyone touching your teeth."*

#### The nine pages

Site 5 breaks the seven-page lock: `meet-the-team.html` and `sedation-dentistry.html` earn their own
URLs because the three named specialists and the in-house anesthesiologist **are** the positioning,
and folding either into a homepage section would bury the two things that actually differentiate the
practice. Order: `index` · `services` · `smile-gallery` · `sedation-dentistry` · `meet-the-team` ·
`membership` · `book-appointment` · `thank-you` · `contact`.

---

### Site 6 — BLUE FOX · *Landscape & Services* → `site-6-bluefox/`
**Metro:** Lake Mary / Heathrow / Altamonte Springs / Longwood / Orlando — Central Florida
**Industry:** Landscaping, pressure washing and soft washing.
**Source:** A redesign of **bluefoxlandscapeandservices.com**. Like Site 5 this is a **real
business**, so the service list, the five-city service area, both phone numbers, the hours, the
Acorn Finance partnership and the $250 digital-design fee (50% deposit, credited back if the
package is approved) are all **real and taken from the company's own published material.**
The October 2026 redesign (the client's *Blue Fox Website Redesign Report*) added three washing
services the live site does not list — **exterior window washing, interior window washing and solar
panel cleaning** — and four **extended-area towns** (Winter Park, Winter Garden, Windermere, Ocoee).
All seven were **confirmed by the client**, and each page carries an HTML comment saying so. The
service pages state scope only — no method, equipment, price or result claims — and the four towns
promise *availability confirmation per address*, never coverage.

**The palette is measured off the company's own logo files.** `#145282` is 73–78% of the opaque
pixels in every version of the mark and `#D3E1F0` is the other 17–22% — there is no third colour
in the logo itself. The orange is real too: `#D98D3B` is 93.8% of the favicon, which is the same
mark reversed out of a solid orange tile. So the brand is steel blue on pale ice with orange as
the one accent, and this build treats it exactly that way. Unlike the previous occupant of this
directory, the site's own CSS shipped no usable theme tokens at all, so the logo was the only
source of truth available.

> **The same rule that binds Site 5 binds this one.** Nothing may be invented. Two things the
> company does not publish are **absent rather than filled in**, each flagged in an HTML comment:
> a **street address** (schema carries `addressLocality` only) and any **licence or insurance
> numbers**. The financing page states **no rates, terms or amounts**, because those are Acorn's to
> quote. The design fee is shown exactly as published ("as of 7/1/2023") with a
> `CONFIRM BEFORE LAUNCH` comment beside every instance.
>
> **Reviews are real now.** The live site embeds an Elfsight Google-review widget
> (`ec53b920-a2d4-47a4-bfa7-4cd3497c010b`, Google place `ChIJ2ew02570xGURCXi63r12k7U`). An earlier
> build missed it and concluded the company had no reviews. The redesign quotes those reviews
> **verbatim** — an excerpt is a leading run of whole sentences ending in "…", never an edit — and
> links each card to its own Google URL. The Erika Dollar excerpt the report asks for on service
> pages is her genuine 5★ review of 29 Feb 2024. The live widget itself loads on `reviews.html`
> (lazy, on approach), and its rendered header fills every `[data-rating]` slot with the live rating
> and count. **Still no `aggregateRating`**: self-served LocalBusiness review stars are not shown by
> Google, and the total is not something a static page can pin. Never type a rating or count into
> the markup.

**Positioning:** One company for the build *and* the upkeep. Most landscapers cannot wash and most
washing companies cannot plant, so a landscape gets installed and then quietly ages five years in
two. Blue Fox does both halves, which means nobody gets to blame the other.
**Customer:** Central Florida homeowners and commercial sites, building or restoring.
**Emotional angle:** Competence and foresight. *"Most yards are not badly designed. They are badly
maintained."*
**Layout — surveyed, then built.** The mark is a **soft, rounded** fox head set against a **serif
small-caps wordmark**, so this site is rounded and classical, not cut and engineered — deliberately
the opposite of the hard-chamfered system that occupied this directory before it. Radii are
`--cut` 10 / `--cut-m` 16 / `--cut-l` 24.

| Token | Value |
|---|---|
| Steel | `#145282` — **measured, 73–78% of the mark.** 8.21:1 on paper — brand ink |
| Ice | `#D3E1F0` — **measured, 17–22% of the mark.** Raised tint |
| Amber | `#D98D3B` — **measured, 93.8% of the favicon.** 2.68:1 on paper → fills/display only |
| Paper / Frost / Mist | `#FFFFFF` / `#F5F8FC` / `#E7EFF8` |
| Bark | `#0B2C48` — **derived**; the dark bands and the footer |
| Ink | `#10273A` — **derived**; body text, 14.0:1 |
| Slate / Slate-dim | `#3D5B72` (6.7:1) / `#4C687D` (5.4:1) — **derived**, light-ground only |
| Steel-mid | `#1C6BAA` — **derived**; links, 5.63:1 |
| Amber-deep | `#8A5410` — **derived**; small orange text on light, 6.26:1 |
| On-deep / dim | `#E8F1FA` (12.6:1) / `#AFC7DC` (8.0:1) — text on the bands |
| Amber-lt / Steel-lt | `#F0A94C` (6.1:1) / `#7FB3DC` (7.4:1) — accents on the bands |
| Display | `Bitter` 500–800 (slab serif) |
| Body / UI | `Source Sans 3` 400/500/600/700 |

> **The contrast relationship inverts, exactly as it did for the previous brand.** `--amber` is
> 2.68:1 on paper — fills, rules, icons and display type only — but **5.33:1 on `--bark`**, so on
> the dark bands it is legal at body size. Conversely the light-ground text tokens are illegal
> inside `.deep`: `--slate` measures about 2.4:1 there. The bands carry their own pair,
> `--on-deep` / `--on-deep-dim`.

**Type is the main separator from the other five.** Bitter is the only slab serif in the repo —
Sites 1/3/4 are grotesques, Site 2 is Fraunces, Site 5 is Cormorant Garamond. Combined with the
soft radii and the steel/orange pairing, Site 6 does not read like any of them, and the three
blue-accented brands (Vantage `#4D8DFF`, Sapphire `#40B0DF`, Blue Fox `#145282`) stay apart because
Blue Fox's blue is a **dark ink** rather than a bright accent — it is used where the others use
near-black.

#### The Property Plan — a lot that measures itself (`assets/js/property-plan.js`)

> **Moved to `estimator.html` in the redesign.** It is a direct-link tool the team shares with
> prospects: absent from the homepage, the nav and the footer, so the public enquiry flow stays
> short. `property-plan.js` loads on that page only.

Site 6's answer to Obsidian's WebGL room, Vantage's Perimeter and Sapphire's Smile Studio. ~13KB,
raw 2D canvas, no library, DPR-aware, `ResizeObserver`.

It exists because every landscaper in Central Florida offers a "free estimate" and then makes you
wait for a truck to find out what you own.

- a lot-size range and eight service checkboxes generate a **zone array** — house, driveway,
  walkway, front/back/side lawn, front/back beds, patio
- zones are laid out by **squarified treemap** inside the lot footprint, each hatched to its type
  and labelled with its own square footage
- ticking a service highlights **exactly** the zones that service touches, and the total is summed
  from that same array — so the drawing and the number cannot disagree
- a survey sweep passes down the plan on entry; `prefers-reduced-motion` draws one finished frame
- the scope travels into the estimate form's querystring, and `site.js` prefills it there

> **It deliberately quotes no price.** Blue Fox publishes no unit pricing — the only published
> figure is the $250 design fee — so a dollar number here would be inventing a fact about a real
> company. It measures and scopes instead, turning "I'd like a quote" into a brief. The page says
> so in as many words.

**The canvas is `aria-hidden` and only ever draws.** Every control is a real form element and the
readout is a native `<output>`, debounced 300ms.

#### The thirty-nine files

**34 distinct pages + 4 compatibility routes + `thank-you.html`.** The report counts 38 routes;
`thank-you.html` is the tracking URL on top of those.

- **Home + 2 overviews:** `index` · `landscaping` · `washing`
- **7 landscaping:** `landscape-design-construction` · `sod-installation` · `paver-installation` ·
  `irrigation` · `tree-removal` (Tree & hedge work) · `lighting-installation` · `drainage`
- **7 washing:** `exterior-window-washing` · `interior-window-washing` · `power-washing-services` ·
  `house-wash` · `soft-wash-gutters` (Gutter cleaning) · `solar-panel-cleaning` · `roof-cleaning` (Roof washing)
- **9 communities:** `lake-mary` · `heathrow` · `altamonte-springs` · `longwood` · `orlando`
  (established) · `winter-park` · `winter-garden` · `windermere` · `ocoee` (confirm availability)
- **Supporting:** `gallery` · `service-area` · `financing` · `contact` · `reviews` · `free-quote` ·
  `estimator` · `soft-washing-services` (explained as a method, not a service)
- **Compatibility routes** (meta-refresh + canonical, `noindex`; become 301s at launch):
  `tree-hedge-work` · `landscape-lighting` · `power-washing` · `roof-washing`

Slugs match the live site's own URLs wherever one exists (`house-wash`, `soft-wash-gutters`,
`drainage`, the five city slugs), so production redirects are only needed for the four
alternates. The power-washing sub-services keep their live anchors (`#power-washing-driveways`
etc.) as H2 panels with their own `Service` schema.

**Every page is `noindex`** — the redesign is a review version and has not replaced the live site.
Remove the robots tag at launch.

**Shared chrome:** a floating glass navbar, clear over photography and frosted past 40px or while a
menu is open. Landscaping and Washing are dropdowns whose label links to the overview, with a
separate chevron `<button>` owning `aria-expanded`. On phones, native `<details>` groups. Below-fold
quote CTAs (`[data-quote="svc"]`) open one shared `<dialog id="qm">` with the service preselected;
each is a real link to `free-quote.html?service=…`, so it still works without script.

**The quote form is one component** (`qform()` in the generator, `.qform` in CSS): name, email,
phone and service required; ZIP optional; **no street address**; SMS consent optional and never
pre-checked. It validates inline, says plainly that it is a preview and sends nothing, then lands
on `thank-you.html?preview=1`. A `LAUNCH:` comment on every form says what GHL replaces.

**Photography is the company's own wherever a claim is made.** The pool grew from 8 to 28 real
photographs, pulled from the live site's own CDN (credits in `CREDITS.json`). Only those carry a
"Blue Fox project" caption, and the gallery shows **only** those. The window, solar, gutter and roof
pages use uncaptioned general home exteriors with alt text saying what they show.

> **The old homepage before/after was not a pair.** `bx-wash-before` is a walkway mid-wash with a
> hose on it; `bx-wash-after` is a driveway at a garage — different places, overlaid as "the same
> driveway, forty minutes apart". The slider now uses the company's genuine **Longwood paver
> cleaning** pair (`bx-pv-before` / `bx-pv-after`, same house number in both). The before frame was
> cropped (scale 0.83, edge-correlation search on the house and garage) to register with the after.
> The Viburnum hedge pair could not be registered, so it is shown as two side-by-side stills.

> ⚠ **Known: built `index.html` is 5.6 MB and `gallery.html` 8.5 MB** (23 tiles plus both pairs).
> If GHL paste size binds, cut the gallery mosaic first; every tile is a card-role 1100px image.

**Pages are generated, then edited as plain HTML.** A one-off generator in the session scratchpad
wrote all 39 files from shared chrome and content data. It is not part of the toolchain. Edit the
HTML directly. A nav or footer change touches every file, exactly as it does on the other sites.


---

## Repository structure

```
/
├── CLAUDE.md
├── index.html                      ← launcher: three demo cards
├── assets/media/img/               ← 86 photos × 4 variants (400/800/1600 webp + 1200 jpg)
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
├── site-5-sapphire/                ← 9 pages, own CSS/JS + smile-studio.js
├── site-6-bluefox/                 ← 39 files (34 pages + 4 alternates + thank-you), own CSS/JS + property-plan.js
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
- **Do not share CSS, JS, or design tokens across the six sites.** Divergence is the deliverable.
- Do not add a framework, bundler, or package manager. `build.py` (stdlib + Pillow) is the whole toolchain.
- Do not add jQuery or an animation library.
- Do not exceed the JS budget: ≤20KB for Sites 1–2 (currently ~15.5KB each);
  ≤40KB for Site 3 (currently ~39KB across `site.js` + `chamber.js` + `kitchen3d.js`);
  ≤30KB for Site 4 (currently ~27KB across `site.js` + `perimeter.js`);
  ≤36KB for Site 5 (currently ~27KB across `site.js` + `smile-studio.js`);
  ≤36KB for Site 6 (currently ~34KB across `site.js` + `property-plan.js` — but `property-plan.js`
  now loads only on `estimator.html`, so every other page ships `site.js` alone, ~20KB).
  The ceiling moved from 30KB to pay for the redesign's dropdowns, quote popup, validation,
  carousel, gallery lightbox and review-feed loader — a deliberate trade.
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
  **This rule is scoped to Sites 1–4.** It cannot bind Site 5: gingiva and lips are pink in every
  real clinical photograph, and the practice's own before/after cases are the proof the page is
  built on. Site 5 keeps the spirit of it instead — no green or red is used as a *brand or status*
  colour anywhere; status reads sapphire, never a traffic light.
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
6. Root `index.html` launcher — six cards, one line of positioning each.
7. **Site 4 — Vantage.** Same page set in a different industry, plus `perimeter.js`.
8. **Site 5 — Sapphire.** A real practice redesigned from its own content, plus `smile-studio.js`.
9. **Site 6 — Blue Fox.** A real landscaping company redesigned from its own content, plus `property-plan.js`.

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
- **Links:** every nav and footer link on all six sites resolves; all 76 files, no 404s.
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

**Custom properties inherit, so two effects must never share a variable name.**
Site 5's cursor-follow CTA (`.magnet`) reads `--mx` / `--my`. The pointer spotlight on
its dark bands was written with the same two names and declared
`.gem { --mx: 50%; --my: 50% }` as its at-rest default. Those cascade into every
descendant, so **every magnetic button inside a gem section was translated by half its
own width and height** — `translate3d(50%, 50%, 0)` — pushing the final CTA off the
right edge of six pages at once. It surfaced as `A.btn.btn--gold` sitting at
`left:187 right:393` in a 375px viewport, and `scrollWidth` did catch this one because
the buttons genuinely widened the page.

The fix was to namespace the spotlight to `--gx` / `--gy`. The rule: **a custom
property consumed by a `transform` is effectively global**, because any ancestor may
set it. Give every such variable an owner prefix, and never declare a bare `--mx` on a
container.

**A deliberately over-scaled element is not an overflow bug — check `scrollDelta`.**
Site 5's hero image is `scale(1 + var(--sp) * .07)`, so its rect necessarily exceeds
the viewport; it sits inside `.hero { overflow: hidden }` and the page never scrolls.
The element-rect sweep flags it at every width with `scrollDelta: 0`. Same category as
`.marq`'s `width: max-content` track. Both are excluded from the sweep by ancestor
(`.marq`), and the hero is verified by its zero scroll delta rather than excluded —
read the two signals together, never one alone.

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


**A required regex attribute silently un-inlines the JavaScript.** `build.py` matched
`<script src="assets/js/([a-z0-9_-]+)\.js" defer></script>` — with `defer`
**mandatory**. Site 6's pages were written without it, so the pattern matched
nothing, no warning was printed, and all sixteen built pages went into `dist/`
still carrying `<script src="assets/js/site.js">`. That path does not exist
inside GoHighLevel, so every one of them would have pasted in as a page that
looks completely finished and is dead — no reveals, no navigation, no estimator.

This is the same shape as the `\b` `ROLE_RULES` bug: **a regex that matches
nothing reports nothing.** `defer` is now optional in the pattern, and the
inliner raises if any `<script src="assets/…">` survives into the output, so the
failure can never again be silent. Source pages should still write `defer` —
it is the convention across all six sites.


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
