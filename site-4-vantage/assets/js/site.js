/* VANTAGE — site.js
   No dependencies. Everything degrades gracefully without JS.
   SOURCE OF TRUTH — inlined into every page by scripts/build.py */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header: solidify on scroll, hide on scroll-down ---------- */
  var hdr = $(".hdr");
  if (hdr) {
    var lastY = 0, tick = false;
    var upd = function () {
      var y = window.scrollY;
      hdr.setAttribute("data-solid", y > 20 ? "true" : "false");
      var d = $("#drawer");
      var open = d && d.getAttribute("data-open") === "true";
      hdr.setAttribute("data-hide", (!open && y > 640 && y > lastY) ? "true" : "false");
      lastY = y; tick = false;
    };
    upd();
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; requestAnimationFrame(upd); }
    }, { passive: true });
  }

  /* ---------- Off-canvas drawer ---------- */
  var drawer = $("#drawer"), burger = $(".burger"), lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    $$("nav a", drawer).forEach(function (a, i) {
      a.style.transitionDelay = open ? (80 + i * 55) + "ms" : "0ms";
    });
    if (open) {
      lastFocus = document.activeElement;
      var first = $("nav a", drawer);
      if (first) setTimeout(function () { first.focus(); }, 340);
    } else if (lastFocus) { lastFocus.focus(); }
  }
  if (burger) burger.addEventListener("click", function () {
    setDrawer(drawer.getAttribute("data-open") !== "true");
  });
  if (drawer) {
    $$("a", drawer).forEach(function (a) {
      a.addEventListener("click", function () { setDrawer(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (drawer.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") { setDrawer(false); return; }
      if (e.key !== "Tab") return;
      var f = $$("a, button", drawer).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Line-mask reveals ---------- */
  /* .rvt wraps its own text so the mask has something to translate. */
  $$(".rvt").forEach(function (el) {
    if (el.firstElementChild && el.firstElementChild.tagName === "SPAN") return;
    var s = document.createElement("span");
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
  });

  /* ---------- Reveal on enter, with per-group stagger ---------- */
  /* Never observe a clip-path-ed element: its intersection rectangle has zero
     area, so the callback never fires and it stays hidden forever. Observe an
     unclipped ancestor and forward data-in down. See CLAUDE.md. */
  (function () {
    var rv = $$(".rv, .rvt, .rvl");
    if (!rv.length) return;
    if (reduced || !hasIO) {
      rv.forEach(function (e) { e.setAttribute("data-in", "true"); });
      return;
    }
    $$(".grid, .steps, .stats, .plans, .acc, .trust").forEach(function (g) {
      $$(":scope > .rv", g).forEach(function (k, i) {
        if (!k.style.getPropertyValue("--d")) k.style.setProperty("--d", (i * 85) + "ms");
      });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute("data-in", "true");
        $$("[data-rvchild]", en.target).forEach(function (c) {
          c.setAttribute("data-in", "true");
        });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.05 });
    rv.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- Before / after sliders ---------- */
  $$(".ba").forEach(function (fig) {
    var r = $(".ba__range", fig);
    if (!r) return;
    var set = function () { fig.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  /* ---------- Count-up on the stats band ---------- */
  (function () {
    var els = $$("[data-count]");
    if (!els.length) return;
    if (reduced || !hasIO) {
      els.forEach(function (e) { e.textContent = e.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = parseFloat(el.getAttribute("data-count"));
        var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
        var t0 = null, dur = 1100;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- Live stamp (hero + perimeter chrome) ---------- */
  (function () {
    var els = $$("[data-clock]");
    if (!els.length) return;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var run = function () {
      var d = new Date();
      var s = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
      els.forEach(function (e) { e.textContent = s; });
    };
    run();
    if (!reduced) setInterval(run, 1000);
  })();

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- Forms ---------- */
  /* Client-side only: validate, then hand off to the thank-you URL so GHL
     workflows and conversion pixels have a real page to fire on. */
  $$("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      $$("[required]", form).forEach(function (f) {
        var wrap = f.closest(".field") || f.closest(".consent");
        var good = f.type === "checkbox" ? f.checked : String(f.value).trim() !== "";
        if (good && f.type === "email") good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value);
        if (good && f.type === "tel") good = (f.value.replace(/\D/g, "").length >= 10);
        if (wrap) wrap.classList.toggle("field--err", !good);
        var msg = wrap && wrap.querySelector(".field__e");
        if (msg) msg.hidden = good;
        f.setAttribute("aria-invalid", good ? "false" : "true");
        if (!good) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      window.location.href = form.getAttribute("data-lead");
    });
  });

  /* Clear the error state as soon as the visitor starts fixing it */
  $$(".field input, .field select, .field textarea").forEach(function (f) {
    f.addEventListener("input", function () {
      var wrap = f.closest(".field");
      if (wrap && wrap.classList.contains("field--err")) {
        wrap.classList.remove("field--err");
        var msg = wrap.querySelector(".field__e");
        if (msg) msg.hidden = true;
        f.setAttribute("aria-invalid", "false");
      }
    });
  });

  /* ---------- Accordion: one open at a time inside a group ---------- */
  $$(".acc").forEach(function (acc) {
    var all = $$("details", acc);
    all.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });
})();
