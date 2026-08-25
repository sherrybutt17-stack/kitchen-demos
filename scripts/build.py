#!/usr/bin/env python3
"""
build.py — produce fully self-contained pages for GoHighLevel.

Source pages live in  site-*/            (external CSS/JS, relative image paths)
Built pages land in   dist/site-*/       (everything inlined, nothing external)

What gets inlined
  · assets/css/site.css        -> <style> in <head>
  · assets/js/site.js          -> <script> before </body>
  · every <img> / poster       -> base64 WebP data URI (re-encoded, size-capped)
  · hero <video data-src>      -> base64 MP4 data URI (360p, only if small enough)

Run:  python3 scripts/build.py
"""
import base64, io, os, re, sys, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
MEDIA_IMG = os.path.join(ROOT, "assets", "media", "img")
MEDIA_VID = os.path.join(ROOT, "assets", "media", "video")

# Width cap + quality by role. Keeps pages pasteable inside the GHL editor.
#
# Roles are resolved from the WRAPPER element, not from the <img> tag. The rules
# used to be regexes tested against the img itself — `class="[^"]*\bhero__media\b'`
# and `class="[^"]*\bba\b'` — but `hero__media` is a class on the surrounding <div>
# and `ba` is on the surrounding <figure>; worse, `\bba\b` cannot match the one img
# class that does exist, `ba__after`, because `_` is a word character. Both rules
# therefore missed every tag, and all 110 images in all 21 pages were built at the
# 820/1000px fallback — which is what made the photography look soft.
# Quality is a mild lever and width is the strong one: at a fixed width q82->q76 costs
# about 12% of the bytes for no visible difference on photographs, while 1100->1500px
# costs 60% and is the thing you can actually see. So: spend on pixels, not on q.
HERO_W,    HERO_Q    = 2200, 78   # full-bleed above-the-fold media
BA_W,      BA_Q      = 1600, 76   # before/after slider halves
POSTER_W,  POSTER_Q  = 1600, 84   # hero video poster — the LCP on each homepage
DEFAULT_W, DEFAULT_Q = 1500, 76   # anything declaring sizes="…100vw"
CARD_W,    CARD_Q    = 1100, 76   # grid cards and column images
VIDEO_MAX_BYTES = 1_400_000          # inline 360p only if under this

# ── Where the video files live once they are hosted ────────────────────────────
# Set this to the folder URL you uploaded the contents of assets/media/video/ to
# (GHL Media Library, S3, any CDN). Include the trailing slash. Example:
#     MEDIA_BASE_URL = "https://assets.example.com/kitchen/video/"
#
# Why this exists: the testimonial play buttons carry data-mp4="…mp4". Inlining
# them is not an option — they are 2.7–3.8 MB each and no small cut exists — so
# with no host they resolved to a RELATIVE path, which 404s inside GoHighLevel
# and left a play button that did nothing. avconvert cannot help; it has no
# bitrate control and re-encoding actually inflated the files.
#
#   set    -> hero + testimonial videos both point at real URLs, nothing is
#             inlined, and the homepages drop by roughly 0.9 MB each.
#   unset  -> hero still inlines (self-contained, 360p) and the testimonial
#             facades render as plain stills, so no dead control ever ships.
MEDIA_BASE_URL = ""

_img_cache = {}


def encode_image(basename, width, quality):
    """Re-encode from the largest available source to a capped-width WebP data URI."""
    key = (basename, width, quality)
    if key in _img_cache:
        return _img_cache[key]
    src = None
    # -2400 is the high-resolution master; the eight photos whose source CDN has
    # since delisted them have no -2400 and fall through to -1600 automatically.
    # -440 / -240 are the logo lockup and gem mark, which are vector-ish art shipped
    # at their display size rather than as photographic masters. Without them in the
    # ladder every logo silently fell out of the build as "skipped".
    for cand in (f"{basename}-2400.webp", f"{basename}-1600.webp",
                 f"{basename}-1200.jpg", f"{basename}-800.webp",
                 f"{basename}-440.webp", f"{basename}-240.webp"):
        p = os.path.join(MEDIA_IMG, cand)
        if os.path.exists(p):
            src = p
            break
    if src is None:
        return None
    im = Image.open(src)
    # Photographs flatten to RGB, but the logo is transparent line art — converting
    # that to RGB fills every transparent pixel with black, which put a black slab
    # behind the mark in the header. Keep the alpha channel when the source has one.
    has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA" if has_alpha else "RGB")
    w0, h0 = im.size
    if w0 > width:
        im = im.resize((width, max(1, round(h0 * width / w0))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6, **({"exact": True} if has_alpha else {}))
    uri = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    _img_cache[key] = (uri, im.size, len(buf.getvalue()))
    return _img_cache[key]


def encode_video(name):
    for cand in (f"{name}-sm.mp4", f"{name}.mp4"):   # prefer the small 360p cut
        p = os.path.join(MEDIA_VID, cand)
        if not os.path.exists(p):
            continue
        data = open(p, "rb").read()
        if len(data) > VIDEO_MAX_BYTES:
            return None, len(data)
        return "data:video/mp4;base64," + base64.b64encode(data).decode(), len(data)
    return None, 0


def pick_rule(tag, role):
    """Width/quality for one <img>. `role` comes from the wrapper sweep in step 3."""
    if role == "hero":
        return HERO_W, HERO_Q
    if role == "ba":
        return BA_W, BA_Q
    # sizes="…100vw" with no narrower breakpoint means it really does span the page
    if re.search(r'sizes="[^"]*100vw', tag) and "48vw" not in tag:
        return DEFAULT_W, DEFAULT_Q
    return CARD_W, CARD_Q


def build_page(src_path, site_dir, css, js):
    html = open(src_path, encoding="utf8").read()
    stats = {"img": 0, "bytes": 0, "vid": 0, "skipped": []}

    # ---- 1. inline CSS -------------------------------------------------
    # lambda replacements: CSS/JS/data-URIs must never be parsed for \ escapes
    html = re.sub(
        r'<link rel="stylesheet" href="assets/css/site\.css">',
        lambda _m: "<style>\n" + css + "\n</style>",
        html,
    )
    # ---- 2. inline JS (site.js plus any per-site module e.g. chamber.js) ----
    first_js = [True]

    def js_repl(m):
        name = m.group(1)
        path = os.path.join(os.path.dirname(src_path), "assets", "js", name + ".js")
        if not os.path.exists(path):
            stats["skipped"].append(name + ".js (not found)")
            return ""
        # the hero-video payload is injected at this marker in step 4, so that the
        # base64 lands AFTER all the markup but BEFORE the script that consumes it
        mark = "<!--__HERO_PAYLOAD__-->" if first_js[0] else ""
        first_js[0] = False
        return mark + "<script>\n" + open(path, encoding="utf8").read() + "\n</script>"

    # `defer` is optional in this pattern ON PURPOSE. It used to be required, and
    # a page that wrote <script src="assets/js/site.js"></script> silently kept an
    # external reference all the way into dist/ — a built page that looks finished
    # and is dead inside GHL, where that path does not exist. Same failure shape as
    # the \b ROLE_RULES bug: a regex that matches nothing reports nothing.
    html = re.sub(r'<script src="assets/js/([a-z0-9_-]+)\.js"(?: defer)?(?: async)?></script>',
                  js_repl, html)
    # and never let it fail quietly again
    leftover = re.findall(r'<script src="(assets/[^"]+)"', html)
    if leftover:
        raise SystemExit(f"!! {os.path.basename(src_path)}: script(s) not inlined -> {leftover}. "
                         f"dist pages must be self-contained.")

    # Deferred base64 payloads (hero video + every lazy image), emitted at the tail
    # of the document so markup reaches the parser first. See step 4 for the rationale.
    hero_payload = []

    # ---- 3. images -----------------------------------------------------
    def img_repl(m, role=None):
        tag = m.group(0)
        src_m = re.search(r'src="\.\./assets/media/(img|video)/([^"]+)"', tag)
        if not src_m:
            return tag
        kind, fname = src_m.group(1), src_m.group(2)
        if kind == "video":                      # a video poster frame (.jpg)
            p = os.path.join(MEDIA_VID, fname)
            if not os.path.exists(p):
                stats["skipped"].append(fname); return tag
            # the hero poster is the LCP and is only 1280px native, so it is kept at
            # full size and high quality; facade posters are card-sized thumbnails
            w, q = (POSTER_W, POSTER_Q) if role == "hero" else (CARD_W, CARD_Q)
            im = Image.open(p).convert("RGB")
            w0, h0 = im.size
            if w0 > w:
                im = im.resize((w, round(h0 * w / w0)), Image.LANCZOS)
            buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6)
            uri = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
            nbytes = len(buf.getvalue())
        else:
            base = re.sub(r"-\d+\.(webp|jpg)$", "", fname)
            w, q = pick_rule(tag, role)
            got = encode_image(base, w, q)
            if not got:
                stats["skipped"].append(base); return tag
            uri, _dim, nbytes = got
        stats["img"] += 1; stats["bytes"] += nbytes
        tag = re.sub(r'\s+srcset="[^"]*"', "", tag)
        tag = re.sub(r'\s+sizes="[^"]*"', "", tag)
        if 'loading="lazy"' in tag:
            slot = "__i%d" % len(hero_payload)
            hero_payload.append((slot, uri))
            # 1x1 transparent gif holds the box; width/height already reserve the space
            tag = re.sub(r'src="[^"]*"', lambda _m: 'src="data:image/gif;base64,'
                         'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" '
                         'data-lazysrc="#' + slot + '"', tag, count=1)
        else:
            tag = re.sub(r'src="[^"]*"', lambda _m: 'src="' + uri + '"', tag, count=1)
        return tag

    # Resolve the role from the wrapper first — the class that identifies a hero or a
    # before/after half lives on the surrounding <div>/<figure>, never on the <img>.
    def in_wrapper(role):
        return lambda m: re.sub(r"<img\b[^>]*>",
                                lambda t: img_repl(t, role), m.group(0), flags=re.S)

    html = re.sub(r'<div class="hero__media">.*?</div>',   in_wrapper("hero"), html, flags=re.S)
    html = re.sub(r'<figure class="ba[ "][^>]*>.*?</figure>', in_wrapper("ba"), html, flags=re.S)
    # whatever is left is a card or a full-width band; pick_rule reads its sizes attr
    html = re.sub(r"<img\b[^>]*>", img_repl, html)

    # ---- 4. hero video --------------------------------------------------
    # The base64 MP4 used to sit in the <video data-src> attribute, inside the hero.
    # That put 0.6–1.2 MB of base64 AHEAD of the hero's own markup in the byte stream,
    # so the parser could not reach the headline until the whole blob had arrived:
    # first paint measured 3.6s on throttled 4G, with a 0.77 layout shift as the hero
    # re-laid-out mid-parse. The payload now goes in a text/plain block at the end of
    # the document and a four-line resolver hands it back before site.js runs. Still
    # one self-contained file — the bytes simply arrive in a usable order.
    def vid_repl(m):
        tag = m.group(0)
        vm = re.search(r'data-src="\.\./assets/media/video/([^"]+)\.mp4"', tag)
        pm = re.search(r'poster="([^"]*)"', tag)
        if not vm:
            return tag
        if MEDIA_BASE_URL:
            # hosted: point at the real file and inline nothing. Prefer the
            # full-resolution cut — bytes no longer come out of the page budget.
            url = MEDIA_BASE_URL + vm.group(1) + ".mp4"
            stats["vid"] += 1
            tag = re.sub(r'data-src="[^"]*"', lambda _m: 'data-src="' + url + '"', tag)
            if pm and pm.group(1).startswith("../"):
                tag = re.sub(r'poster="[^"]*"', 'poster=""', tag)
            return tag
        uri, size = encode_video(vm.group(1))
        if not uri:
            # too heavy to inline — drop the video, poster carries the hero
            stats["skipped"].append(vm.group(1) + ".mp4 (too large to inline)")
            return ""
        stats["vid"] += 1; stats["bytes"] += size
        slot = "__v%d" % len(hero_payload)
        hero_payload.append((slot, uri))
        tag = re.sub(r'data-src="[^"]*"', lambda _m, s=slot: 'data-src="#' + s + '"', tag)
        if pm and pm.group(1).startswith("../"):
            tag = re.sub(r'poster="[^"]*"', 'poster=""', tag)
        return tag

    html = re.sub(r"<video\b[^>]*></video>", vid_repl, html)

    if hero_payload:
        blocks = "".join(
            '<script id="%s" type="text/plain">%s</script>' % (slot, uri)
            for slot, uri in hero_payload)
        # hands the payload back to the <video data-src="#id"> before site.js reads it
        resolver = ('<script>(function(){'
                    'function g(k){var n=document.getElementById(k.slice(1));return n&&n.textContent;}'
                    'var v=document.querySelectorAll(\'video[data-src^="#"]\');'
                    'for(var i=0;i<v.length;i++){var s=g(v[i].getAttribute("data-src"));'
                    'if(s)v[i].setAttribute("data-src",s);}'
                    'var m=document.querySelectorAll("img[data-lazysrc]");'
                    'for(var j=0;j<m.length;j++){var u=g(m[j].getAttribute("data-lazysrc"));'
                    'if(u){m[j].src=u;m[j].removeAttribute("data-lazysrc");}}'
                    '})();</script>')
        html = html.replace("<!--__HERO_PAYLOAD__-->", blocks + resolver, 1)
    html = html.replace("<!--__HERO_PAYLOAD__-->", "")

    # ---- 4b. Chamber swatches: data-surface="…" and inline background-image
    def attr_img_repl(m, width, quality):
        prefix, fname = m.group(1), m.group(2)
        base = re.sub(r"-\d+\.(webp|jpg)$", "", fname)
        got = encode_image(base, width, quality)
        if not got:
            stats["skipped"].append(base); return m.group(0)
        uri, _dim, nbytes = got
        stats["img"] += 1; stats["bytes"] += nbytes
        return prefix + uri + '"'

    html = re.sub(r'(data-surface=")\.\./assets/media/img/([^"]+)"',
                  lambda m: attr_img_repl(m, BA_W, BA_Q), html)
    html = re.sub(r"(background-image:url\(')\.\./assets/media/img/([^']+)'\)",
                  lambda m: attr_img_repl(m, 160, 72)[:-1] + "')", html)

    # ---- 5. testimonial facade videos -----------------------------------
    # These used to be rewritten to a RELATIVE path ("assets/media/video/x.mp4"),
    # which only resolved because dist/ carried a copy of the video folder next to
    # the HTML. PASTE-INTO-GHL ships the HTML alone, so in GoHighLevel the click
    # 404'd and the injected <video> failed with MEDIA_ERR_SRC_NOT_SUPPORTED —
    # a play button that silently did nothing on all three homepages.
    if MEDIA_BASE_URL:
        html = re.sub(r'data-mp4="\.\./assets/media/video/([^"]+)"',
                      lambda m: 'data-mp4="' + MEDIA_BASE_URL + m.group(1) + '"', html)
    else:
        # No host configured: strip the control rather than ship a dead one.
        # The still and its caption stay; only the play affordance goes.
        def defuse(m):
            block = m.group(0)
            stats["skipped"].append("facade video (no MEDIA_BASE_URL) — rendered as a still")
            block = re.sub(r'<span class="vfac__play".*?</span>', "", block, flags=re.S)
            block = re.sub(r'^<button\b', '<div', block)
            block = re.sub(r'</button>$', "</div>", block)
            block = re.sub(r'\s(?:type|data-mp4|data-video|data-title|aria-label)="[^"]*"', "", block)
            return block.replace('class="vfac"', 'class="vfac vfac--still"')

        html = re.sub(r'<button class="vfac".*?</button>', defuse, html, flags=re.S)

    # ---- 6. GHL full-bleed escape ---------------------------------------
    # A GHL Custom-HTML block sits inside a centred, padded column, so pasted markup
    # inherits that width no matter how the section is configured. Every top-level
    # band breaks out to the full viewport from wherever it is nested. `overflow-x:
    # clip` rather than `hidden` because `hidden` on an ancestor silently kills
    # `position: sticky` on the landing-page form.
    BLEED = """
<style id="ghl-fullbleed">
/* ── Paste-into-GoHighLevel full-bleed escape ───────────────────────────────
   Neutralises the width, padding and margin GHL's column wrapper imposes.
   Harmless when the file is opened directly as a normal web page.        */
/* Nesting-agnostic: GHL puts this markup several levels inside its own column,
   so these cannot be anchored to `body >`. calc(50% - 50vw) resolves against the
   parent's width, which makes the break-out correct at any depth. */
.hdr, .lphdr, .ftr, main, main > section, main > div.marq, .marq {
  width: 100vw; max-width: 100vw;
  margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw);
}
/* fixed/absolute chrome is already out of flow — leave it alone */
.mbar, .curtain, .drawer, .cur, .cur-dot {
  width: auto; max-width: none; margin-left: 0; margin-right: 0;
}
main > section { margin-left: 0; margin-right: 0; }   /* main already spans */
html, body { max-width: 100%; overflow-x: clip; }
img, video, canvas, svg, iframe { max-width: 100%; }
</style>
"""
    html = html.replace("</head>", BLEED + "</head>", 1)

    HOWTO = """<!--
  ════════════════════════════════════════════════════════════════════════════
  PASTE THIS FILE — NOT the one in site-*/ . This build has the CSS, the
  JavaScript and every photograph embedded; the source version links to
  ./assets/ files that do not exist inside GoHighLevel, which is why it
  renders unstyled there.

  In GHL:
    1. Add a Section, set its width to FULL WIDTH and its padding to 0.
    2. Drop in a Custom HTML / Code element.
    3. Paste this entire file.
  The stylesheet above makes every band span the viewport even if the
  section is left at its default width.
  ════════════════════════════════════════════════════════════════════════════
-->
"""
    html = HOWTO + html

    html = re.sub(r"<!--\s*\n\s*\u2588\u2588  DO NOT PASTE.*?-->\s*", "", html, flags=re.S)

    out = os.path.join(DIST, site_dir, os.path.basename(src_path))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf8").write(html)

    # A second copy under a name nobody can mistake for the editable source.
    paste = os.path.join(ROOT, "PASTE-INTO-GHL", site_dir, os.path.basename(src_path))
    os.makedirs(os.path.dirname(paste), exist_ok=True)
    open(paste, "w", encoding="utf8").write(html)
    return len(html.encode()), stats


def main():
    sites = sorted(d for d in os.listdir(ROOT)
                   if d.startswith("site-") and os.path.isdir(os.path.join(ROOT, d)))
    if not sites:
        print("no site-* directories found"); return
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    grand = 0
    for site in sites:
        sdir = os.path.join(ROOT, site)
        css_p = os.path.join(sdir, "assets", "css", "site.css")
        js_p = os.path.join(sdir, "assets", "js", "site.js")
        if not (os.path.exists(css_p) and os.path.exists(js_p)):
            print(f"!! {site}: missing site.css or site.js — skipped"); continue
        css = open(css_p, encoding="utf8").read()
        js = open(js_p, encoding="utf8").read()
        print(f"\n── {site} " + "─" * (58 - len(site)))
        # dist/ used to receive a copy of every .mp4 (~77 MB per site, 231 MB total)
        # purely so the relative data-mp4 refs resolved when previewing from dist/.
        # Those refs are now either hosted URLs or defused, and PASTE-INTO-GHL never
        # shipped the folder anyway — so copying it only ever hid the 404. Preview
        # the editable pages in site-*/ instead; dist/ is the paste artefact.
        for page in sorted(os.listdir(sdir)):
            if not page.endswith(".html"):
                continue
            size, st = build_page(os.path.join(sdir, page), site, css, js)
            grand += size
            flag = "  ⚠ HEAVY" if size > 4_000_000 else ""
            print(f"   {page:<28} {size/1_048_576:5.2f} MB   "
                  f"{st['img']:2d} img, {st['vid']} vid{flag}")
            for s in st["skipped"]:
                print(f"        ! skipped: {s}")
        # llms.txt through untouched
        for extra in ("llms.txt",):
            p = os.path.join(sdir, extra)
            if os.path.exists(p):
                shutil.copy2(p, os.path.join(DIST, site, extra))
    print(f"\n=== dist total: {grand/1_048_576:.2f} MB")
    print("Paste any file from dist/<site>/ straight into a GHL Custom HTML block.")


if __name__ == "__main__":
    main()
