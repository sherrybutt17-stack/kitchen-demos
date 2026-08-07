/* OBSIDIAN — site.js
   No dependencies. Everything degrades gracefully without JS.
   SOURCE OF TRUTH — inlined into every page by scripts/build.py */
(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mqReduce.matches;
  var conn = navigator.connection || {};
  var saveData = conn.saveData === true;
  var slowNet = /(^|-)2g$/.test(conn.effectiveType || "");
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Header ---------- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var lastY = 0, tick = false;
    var upd = function () {
      var y = window.scrollY;
      hdr.setAttribute("data-solid", y > 24 ? "true" : "false");
      var d = document.getElementById("drawer");
      var open = d && d.getAttribute("data-open") === "true";
      hdr.setAttribute("data-hide", (!open && y > 620 && y > lastY) ? "true" : "false");
      lastY = y; tick = false;
    };
    upd();
    window.addEventListener("scroll", function () {
      if (!tick) { tick = true; requestAnimationFrame(upd); }
    }, { passive: true });
  }

  /* ---------- Off-canvas ---------- */
  var drawer = document.getElementById("drawer");
  var lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    var b = document.querySelector(".burger");
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    var links = drawer.querySelectorAll("nav a");
    for (var i = 0; i < links.length; i++) {
      links[i].style.transitionDelay = open ? (90 + i * 60) + "ms" : "0ms";
    }
    if (open) { lastFocus = document.activeElement; var f = drawer.querySelector("a,button"); if (f) f.focus(); }
    else if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-drawer]") : null;
    if (!t) return;
    e.preventDefault();
    setDrawer(t.getAttribute("data-drawer") === "open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.getAttribute("data-open") === "true") setDrawer(false);
  });
  if (drawer) {
    drawer.addEventListener("click", function (e) { if (e.target.tagName === "A") setDrawer(false); });
    drawer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || drawer.getAttribute("data-open") !== "true") return;
      var f = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Hero video ---------- */
  var vids = document.querySelectorAll("video[data-src]");
  if (vids.length && !reduced && !saveData && !slowNet && hasIO) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.dataset.attached) {
            v.dataset.attached = "1";
            var s = document.createElement("source");
            s.src = v.dataset.src; s.type = "video/mp4";
            v.appendChild(s); v.load();
            v.addEventListener("playing", function () { v.setAttribute("data-ready", "true"); }, { once: true });
          }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.dataset.attached) { v.pause(); }
      });
    }, { rootMargin: "220px" });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Before / after ---------- */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var r = ba.querySelector(".ba__range");
    if (!r) return;
    var apply = function () { ba.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", apply); apply();
  });

  /* ---------- Video facade ---------- */
  document.querySelectorAll(".vfac").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mp4 = btn.dataset.mp4, id = btn.dataset.video;
      var img = btn.querySelector("img");
      var poster = img ? img.currentSrc || img.src : "";
      if (mp4) {
        var v = document.createElement("video");
        v.src = mp4; v.poster = poster; v.controls = true; v.autoplay = true;
        v.playsInline = true; v.setAttribute("playsinline", "");
        btn.innerHTML = ""; btn.appendChild(v);
      } else if (id) {
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        f.title = btn.dataset.title || "Client film";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        f.allowFullscreen = true;
        btn.innerHTML = ""; btn.appendChild(f);
      }
    });
  });

  /* ---------- Reveal with stagger ---------- */
  (function () {
    var rv = document.querySelectorAll(".rv, .rvt, .rvl");
    if (!rv.length) return;
    if (reduced || !hasIO) { rv.forEach(function (e) { e.setAttribute("data-in", "true"); }); return; }
    document.querySelectorAll(".grid, .chapters, .stats, .rail__track, .acc").forEach(function (g) {
      var kids = g.querySelectorAll(":scope > .rv");
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].style.getPropertyValue("--d")) kids[i].style.setProperty("--d", (i * 95) + "ms");
      }
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute("data-in", "true");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.05 });
    rv.forEach(function (e) { io.observe(e); });
  })();

  document.querySelectorAll(".rvt").forEach(function (el) {
    if (el.firstElementChild && el.firstElementChild.tagName === "SPAN") return;
    var s = document.createElement("span");
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
  });

  /* ---------- Character scramble on headline entry ----------
     Decodes text once, when it first scrolls into view. Purely decorative:
     the real text is in the DOM from the start for crawlers and screen readers. */
  if (!reduced && hasIO) {
    var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\|<>*+-";
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; sio.unobserve(el);
        var final = el.textContent, frame = 0;
        var queue = final.split("").map(function (c, i) {
          return { c: c, start: Math.floor(i * 1.6), end: Math.floor(i * 1.6) + 12 };
        });
        (function run() {
          var out = "", done = 0;
          for (var i = 0; i < queue.length; i++) {
            var q = queue[i];
            if (frame >= q.end) { out += q.c; done++; }
            else if (frame >= q.start) { out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
            else { out += " "; }
          }
          el.textContent = out;
          if (done === queue.length) { el.textContent = final; return; }
          frame++;
          requestAnimationFrame(run);
        })();
      });
    }, { threshold: 0.9 });
    document.querySelectorAll("[data-scramble]").forEach(function (el) { sio.observe(el); });
  }

  /* ---------- Count-up ---------- */
  if (!reduced && hasIO) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; nio.unobserve(el);
        var raw = el.textContent.trim();
        var m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
        if (!m) return;
        var pre = m[1], target = parseFloat(m[2].replace(/,/g, "")), post = m[3];
        if (!isFinite(target) || target === 0) return;
        var dec = (m[2].split(".")[1] || "").length, t0 = null, dur = 1200;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (target * e).toFixed(dec) + post;
          if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    document.querySelectorAll(".stats b, .hero__meta b").forEach(function (b) { nio.observe(b); });
  }

  /* ---------- Horizontal rail: wheel + drag ---------- */
  document.querySelectorAll(".rail__track").forEach(function (track) {
    /* vertical wheel scrolls the rail horizontally while the cursor is over it */
    track.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var atStart = track.scrollLeft <= 0 && e.deltaY < 0;
      var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;          /* let the page take over at the ends */
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }, { passive: false });

    /* click-drag on desktop */
    var down = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true; sx = e.clientX; sl = track.scrollLeft;
      track.style.cursor = "grabbing";
    });
    window.addEventListener("pointerup", function () { down = false; track.style.cursor = ""; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      track.scrollLeft = sl - (e.clientX - sx);
    });
  });

  /* ---------- 3D room: stone picker ---------- */
  var mats = document.querySelectorAll(".k3d__mat");
  mats.forEach(function (btn) {
    btn.addEventListener("click", function () {
      mats.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      if (typeof window.OBSIDIAN_SET_STONE === "function") {
        window.OBSIDIAN_SET_STONE(btn.dataset.stone);
      }
    });
  });

  /* ---------- Lead forms ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = form.querySelector('[name="firstName"]');
      try { sessionStorage.setItem("ob_lead", f ? f.value : ""); } catch (err) {}
      window.location.href = form.getAttribute("data-lead");
    });
  });

  var slot = document.getElementById("leadName");
  if (slot) {
    try { var n = sessionStorage.getItem("ob_lead"); if (n) slot.textContent = ", " + n; } catch (err) {}
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  if (mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function (e) {
      reduced = e.matches;
      if (reduced) document.querySelectorAll(".rv,.rvt,.rvl").forEach(function (el) { el.setAttribute("data-in", "true"); });
    });
  }
})();
