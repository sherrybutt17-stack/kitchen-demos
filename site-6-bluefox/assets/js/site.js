/* ============================================================================
   BLUE FOX CLEANING — site.js
   No framework, no library, no animation dependency. Everything below is
   transform/opacity/filter only, and every effect short-circuits under
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── reveals ──────────────────────────────────────────────────────────────
     Observed elements are always UNCLIPPED. A clipped child (.cut, .fig, .card)
     never gets its own observer, because clip-path shrinks the intersection
     rectangle an observer measures — an element clipped to zero area never
     intersects anything and stays hidden forever. Instead the observed ancestor
     forwards data-in down to [data-rv-child] descendants. */
  function markIn(el) {
    el.setAttribute("data-in", "true");
    $$("[data-rv-child]", el).forEach(function (c) { c.setAttribute("data-in", "true"); });
  }

  if (RM) {
    $$(".rv, .rvt, .rvl, [data-rv-child]").forEach(function (el) { el.setAttribute("data-in", "true"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        markIn(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.04 });
    $$(".rv, .rvt, .rvl").forEach(function (el) { io.observe(el); });

    /* stagger siblings inside a group without writing a delay on every element */
    $$("[data-stagger]").forEach(function (g) {
      var step = parseFloat(g.getAttribute("data-stagger")) || 0.075;
      $$(".rv, .rvt", g).forEach(function (el, i) { el.style.setProperty("--d", (i * step) + "s"); });
    });
  }

  /* ── header: solidify past the hero, hide on downward scroll ─────────────── */
  var hdr = $(".hdr");
  if (hdr) {
    var last = 0, ticking = false;
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      hdr.setAttribute("data-solid", y > 40 ? "true" : "false");
      hdr.setAttribute("data-hide", (y > 420 && y > last + 4 && !$(".oc[data-open='true']")) ? "true" : "false");
      last = y;
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ── off-canvas navigation ────────────────────────────────────────────────── */
  var burger = $(".burger"), oc = $(".oc");
  if (burger && oc) {
    var setOpen = function (open) {
      oc.setAttribute("data-open", open ? "true" : "false");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) { var f = oc.querySelector("a, button"); if (f) f.focus(); }
      else burger.focus();
    };
    burger.addEventListener("click", function () {
      setOpen(oc.getAttribute("data-open") !== "true");
    });
    var x = $(".oc__x", oc);
    if (x) x.addEventListener("click", function () { setOpen(false); });
    oc.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && oc.getAttribute("data-open") === "true") setOpen(false);
    });
    /* focus trap */
    oc.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("a[href], button:not([disabled])", oc).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], lastN = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastN.focus(); }
      else if (!e.shiftKey && document.activeElement === lastN) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── scroll progress for the hero parallax ────────────────────────────────
     One custom property, --sp, on the hero itself. */
  var hero = $(".hero");
  if (hero && !RM) {
    var raf = false;
    var tick = function () {
      var r = hero.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      hero.style.setProperty("--sp", p.toFixed(4));
      raf = false;
    };
    window.addEventListener("scroll", function () {
      if (!raf) { raf = true; requestAnimationFrame(tick); }
    }, { passive: true });
    tick();
  }

  /* ── magnetic CTA ─────────────────────────────────────────────────────────
     --bfx/--bfy, never a bare --mx/--my. A custom property consumed by a
     transform is effectively global: any ancestor may set it, and a container
     that declared its own --mx once translated every magnetic button inside it
     by half its own size and pushed the CTAs clean off the page. Owner-prefix
     anything a transform reads. */
  if (!RM && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".magnet").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--bfx", ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(2) + "px");
        el.style.setProperty("--bfy", ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(2) + "px");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--bfx", "0px");
        el.style.setProperty("--bfy", "0px");
      });
    });
  }

  /* ── counters ─────────────────────────────────────────────────────────────── */
  var counters = $$(".count[data-to]");
  if (counters.length) {
    if (RM) {
      counters.forEach(function (el) { el.textContent = el.getAttribute("data-to"); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          cio.unobserve(el);
          var to = parseFloat(el.getAttribute("data-to"));
          var dec = (el.getAttribute("data-to").split(".")[1] || "").length;
          var t0 = null, dur = 1250;
          var step = function (t) {
            if (t0 === null) t0 = t;
            var k = Math.min(1, (t - t0) / dur);
            var e2 = 1 - Math.pow(1 - k, 3);
            el.textContent = (to * e2).toFixed(dec);
            if (k < 1) requestAnimationFrame(step);
            else el.textContent = el.getAttribute("data-to");
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ── marquee: duplicate the group so the -50% loop is seamless ───────────── */
  $$(".marq__t").forEach(function (t) {
    var g = t.firstElementChild;
    if (g && t.children.length === 1) t.appendChild(g.cloneNode(true));
  });

  /* ── FAQ: one open at a time within an .acc, keyboard native via <details> ── */
  $$(".acc").forEach(function (acc) {
    var all = $$("details", acc);
    all.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ── before/after slider: one custom property, --ba, off a real range ─────
     The input IS the control — it is a transparent full-bleed range on top of
     the figure, so pointer drag, touch and arrow keys all work with no
     synthetic event handling and no parallel keyboard implementation. */
  $$(".ba__range").forEach(function (r) {
    var fig = r.closest(".ba");
    var sync = function () { fig.style.setProperty("--ba", r.value + "%"); };
    r.addEventListener("input", sync);
    sync();
  });

  /* ── quote forms: carry the configuration through to thank-you.html ───────
     GHL replaces the action at real launch; until then the demo posts nothing
     and simply lands on the tracking URL where workflows and pixels fire. */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $("button[type=submit]", f);
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var d = new FormData(f), q = [];
      ["name", "zip", "service", "beds", "baths"].forEach(function (k) {
        var v = d.get(k);
        if (v) q.push(k + "=" + encodeURIComponent(v));
      });
      window.location.href = "thank-you.html" + (q.length ? "?" + q.join("&") : "");
    });
  });

  /* ── prefill the quote form from the querystring ──────────────────────────
     The Walkthrough and the service/city CTAs hand the configuration over in the
     URL. Asking for it again is the fastest way to make a visitor feel the first
     step was pointless. Values are matched against the options that already
     exist in the markup — nothing from the URL is ever injected as new content. */
  var pf = $("form[data-prefill]");
  if (pf) {
    var qp = new URLSearchParams(window.location.search);
    ["service", "beds", "baths", "zip", "name"].forEach(function (k) {
      var v = qp.get(k);
      if (!v) return;
      var f = pf.elements[k];
      if (!f) return;
      if (f.tagName === "SELECT") {
        var ok = Array.prototype.some.call(f.options, function (o) { return o.value === v || o.text === v; });
        if (ok) f.value = Array.prototype.filter.call(f.options, function (o) {
          return o.value === v || o.text === v; })[0].value;
      } else if (f.type === "text" || f.type === "tel") {
        f.value = v.replace(/[<>]/g, "").slice(0, 60);
      }
    });
    if (qp.get("pets")) {
      var note = pf.elements["note"];
      if (note && !note.value) note.value = "There are pets in the home.";
    }
  }

  /* ── thank-you: echo back what they told us, from the querystring only ────── */
  var echo = $("[data-echo]");
  if (echo) {
    var qs = new URLSearchParams(window.location.search);
    var nm = (qs.get("name") || "").trim().replace(/[<>]/g, "").slice(0, 40);
    var wrap = $("[data-echo-wrap]");
    if (nm) echo.textContent = nm.split(" ")[0];
    else if (wrap) wrap.remove();   /* no name in the URL -> no ", there" at all */
  }

  /* ── current-year stamps ──────────────────────────────────────────────────── */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
