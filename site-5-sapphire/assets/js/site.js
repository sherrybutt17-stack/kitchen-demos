/* ============================================================================
   SAPPHIRE DENTAL STUDIO — site.js
   No dependencies. ES5 only, so it survives GoHighLevel's editor untouched.
   SOURCE OF TRUTH — inlined into every page by scripts/build.py
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO   = "IntersectionObserver" in window;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  document.documentElement.classList.remove("no-js");

  /* ---------- 1. Header: solidify, hide on scroll down ---------- */
  var hdr = $(".hdr"), lastY = 0, hTick = false;
  function headerScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hdr) {
      hdr.setAttribute("data-solid", y > 20 ? "true" : "false");
      var open = drawer && drawer.getAttribute("data-open") === "true";
      hdr.setAttribute("data-hide", (!open && y > 620 && y > lastY) ? "true" : "false");
    }
    lastY = y; hTick = false;
  }

  /* ---------- 2. Off-canvas drawer, with a real focus trap ---------- */
  var drawer = $(".drawer"), burger = $(".burger"), lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
    var links = $$("a, button", drawer);
    for (var i = 0; i < links.length; i++) {
      links[i].style.transitionDelay = open ? (70 + i * 50) + "ms" : "0ms";
    }
    if (open) { lastFocus = document.activeElement;
      setTimeout(function () { if (links[0]) links[0].focus(); }, 320); }
    else if (lastFocus) { lastFocus.focus(); }
  }
  if (burger) burger.addEventListener("click", function () {
    setDrawer(drawer.getAttribute("data-open") !== "true");
  });
  var dclose = $(".drawer__x");
  if (dclose) dclose.addEventListener("click", function () { setDrawer(false); });
  if (drawer) {
    $$("nav a", drawer).forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
    document.addEventListener("keydown", function (e) {
      if (drawer.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") { setDrawer(false); return; }
      if (e.key !== "Tab") return;
      var f = $$("a, button, input", drawer).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 3. .rvt needs an inner span to slide inside its mask ---------- */
  $$(".rvt").forEach(function (el) {
    if (el.firstElementChild && el.firstElementChild.tagName === "SPAN") return;
    var s = document.createElement("span");
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
  });

  /* ---------- 4. Split one h1 per page into per-character spans ---------- */
  $$(".chars").forEach(function (el) {
    if ($(".w", el)) return;
    var words = (el.textContent || "").split(/\s+/).filter(Boolean), n = 0, out = "";
    for (var w = 0; w < words.length; w++) {
      out += '<span class="w">';
      for (var c = 0; c < words[w].length; c++) {
        out += '<span class="c" style="--i:' + (n++) + '">' + words[w].charAt(c).replace("&", "&amp;").replace("<", "&lt;") + "</span>";
      }
      out += "</span>" + (w < words.length - 1 ? " " : "");
    }
    el.innerHTML = out;
  });

  /* ---------- 5. Reveal on enter, with per-group stagger ---------- */
  /* NEVER observe a clip-path-ed element: its intersection rectangle has zero area,
     so the observer never fires and it stays clipped forever. That silently hid
     every before/after slider on Sites 1 and 2. Clipped children are marked
     [data-rvchild] and the observer watches an unclipped ancestor instead. */
  $$(".grid, .steps, .stats, .plans, .acc, .trust, .ss__shades").forEach(function (g) {
    var kids = $$(":scope > .rv", g);
    for (var i = 0; i < kids.length; i++) {
      if (!kids[i].style.getPropertyValue("--d")) kids[i].style.setProperty("--d", (i * 80) + "ms");
    }
  });
  var revealTargets = $$(".rv, .rvt, .rvl, .bloom, .sheen, .chars, .shine, .seam");
  function markIn(el) {
    el.setAttribute("data-in", "true");
    $$("[data-rvchild]", el).forEach(function (k) { k.setAttribute("data-in", "true"); });
  }
  if (reduced || !hasIO) {
    revealTargets.forEach(markIn);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        markIn(en.target); io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.05 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 6. Before / after sliders ---------- */
  $$(".ba__range").forEach(function (r) {
    var fig = r.closest(".ba");
    if (!fig) return;
    var set = function () { fig.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", set); set();
  });

  /* ---------- 7. Count-up ---------- */
  $$("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var raw = el.getAttribute("data-count");
    var dp = raw.indexOf(".") > -1 ? raw.length - raw.indexOf(".") - 1 : 0;
    if (reduced || !hasIO) { el.textContent = target.toFixed(dp); return; }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        o.unobserve(en.target);
        var t0 = null, dur = 1200;
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * e).toFixed(dp);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* ---------- 8. ONE rAF-batched scroll driver for every scroll-linked element ---------- */
  /* One listener for the whole page. Never one per element — that is how a light
     site ends up jankier than a dark one. */
  var PLL = $$(".pll, .pll--slow, .pll-src"), rail = $(".rail i"), sTick = false;
  function writeAll() {
    var vh = window.innerHeight || 1, i, r;
    for (i = 0; i < PLL.length; i++) {
      r = PLL[i].getBoundingClientRect();
      var sp = (vh * 0.5 - (r.top + r.height * 0.5)) / vh;
      PLL[i].style.setProperty("--sp", Math.max(-1, Math.min(1, sp)).toFixed(3));
    }
    if (rail) {
      var d = document.documentElement;
      rail.style.setProperty("--read",
        Math.max(0, Math.min(1, d.scrollTop / ((d.scrollHeight - vh) || 1))).toFixed(4));
    }
    sTick = false;
  }
  window.addEventListener("scroll", function () {
    if (!hTick) { hTick = true; requestAnimationFrame(headerScroll); }
    if (!reduced && !sTick) { sTick = true; requestAnimationFrame(writeAll); }
  }, { passive: true });
  headerScroll(); if (!reduced) writeAll();

  /* ---------- 9. Magnetic primary CTA (fine pointer, desktop, motion allowed) ---------- */
  if (!reduced && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    $$(".magnet").forEach(function (b) {
      var mTick = false, mx = 0, my = 0;
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 10;
        my = ((e.clientY - r.top) / r.height - 0.5) * 8;
        if (!mTick) { mTick = true; requestAnimationFrame(function () {
          b.style.setProperty("--mx", mx.toFixed(2) + "px");
          b.style.setProperty("--my", my.toFixed(2) + "px"); mTick = false; }); }
      });
      b.addEventListener("pointerleave", function () {
        b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- 10. Accordion exclusivity ---------- */
  $$(".acc").forEach(function (acc) {
    var ds = $$("details", acc);
    ds.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        ds.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- 11. Footer year ---------- */
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- 12. Lead forms ---------- */
  /* On success the browser NAVIGATES to the thank-you page rather than swapping in
     an inline state: that distinct URL is where GHL workflows trigger and where the
     conversion pixels fire. An inline post-submit state cannot do that cleanly. */
  $$("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      $$("[required]", form).forEach(function (f) {
        var wrap = f.closest(".field") || f.closest(".check"), ok = true;
        var v = (f.value || "").trim();
        if (f.type === "checkbox") ok = f.checked;
        else if (f.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        else if (f.type === "tel")   ok = v.replace(/\D/g, "").length >= 10;
        else ok = v.length > 0;
        if (wrap) wrap.classList.toggle("field--err", !ok);
        var msg = wrap && wrap.querySelector(".field__e");
        if (msg) { if (ok) msg.setAttribute("hidden", ""); else msg.removeAttribute("hidden"); }
        f.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !bad) bad = f;
      });
      if (bad) { bad.focus(); return; }
      var btn = form.querySelector('button[type="submit"], .btn[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      window.location.href = form.getAttribute("data-lead");
    });
    $$("input, select, textarea", form).forEach(function (f) {
      f.addEventListener("input", function () {
        var wrap = f.closest(".field") || f.closest(".check");
        if (!wrap) return;
        wrap.classList.remove("field--err");
        var msg = wrap.querySelector(".field__e");
        if (msg) msg.setAttribute("hidden", "");
      });
    });
  });

  /* ---------- 13. Pointer spotlight on the dark bands ---------- */
  /* A large flat navy section reads as dead space; a light that tracks the cursor
     across it does not. Desktop + fine pointer only, one rAF write per move. */
  if (!reduced && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    $$(".gem").forEach(function (g) {
      var t = false, mx = 0, my = 0;
      g.addEventListener("pointermove", function (e) {
        var r = g.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
        if (t) return;
        t = true;
        requestAnimationFrame(function () {
          g.style.setProperty("--gx", mx.toFixed(0) + "px");
          g.style.setProperty("--gy", my.toFixed(0) + "px");
          g.setAttribute("data-lit", "true"); t = false;
        });
      });
      g.addEventListener("pointerleave", function () { g.setAttribute("data-lit", "false"); });
    });

    /* ---------- 14. Card tilt ---------- */
    $$(".tilt").forEach(function (c) {
      var t = false, rx = 0, ry = 0;
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        rx = -((e.clientY - r.top) / r.height - 0.5) * 6;
        if (t) return;
        t = true;
        requestAnimationFrame(function () {
          c.setAttribute("data-tilting", "true");
          c.style.setProperty("--rx", rx.toFixed(2) + "deg");
          c.style.setProperty("--ry", ry.toFixed(2) + "deg");
          c.style.setProperty("--ty", "-5px"); t = false;
        });
      });
      c.addEventListener("pointerleave", function () {
        c.setAttribute("data-tilting", "false");
        c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg");
        c.style.setProperty("--ty", "0px");
      });
    });
  }
})();
