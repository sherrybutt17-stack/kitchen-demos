/* HEARTH & HOLLIS — site.js
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
      hdr.setAttribute("data-solid", y > 20 ? "true" : "false");
      var d = document.getElementById("drawer");
      var open = d && d.getAttribute("data-open") === "true";
      hdr.setAttribute("data-hide", (!open && y > 560 && y > lastY) ? "true" : "false");
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
      links[i].style.transitionDelay = open ? (80 + i * 55) + "ms" : "0ms";
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
        f.title = btn.dataset.title || "Family story";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        f.allowFullscreen = true;
        btn.innerHTML = ""; btn.appendChild(f);
      }
    });
  });

  /* ---------- Reveal with stagger ---------- */
  (function () {
    var rv = document.querySelectorAll(".rv, .rv-l, .rvt, .split, .clip");
    if (!rv.length) return;
    if (reduced || !hasIO) { rv.forEach(function (e) { e.setAttribute("data-in", "true"); }); return; }
    document.querySelectorAll(".grid, .steps, .stats, .acc, .ticks").forEach(function (g) {
      var kids = g.querySelectorAll(":scope > .rv, :scope > .rv-l");
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].style.getPropertyValue("--d")) kids[i].style.setProperty("--d", (i * 85) + "ms");
      }
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute("data-in", "true");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

    /* A .clip element starts at clip-path: inset(0 0 100% 0), which collapses its own
       intersection rectangle to zero area — so an observer watching the element itself
       can never fire, and the element stays clipped (invisible) forever. Watch an
       unclipped ancestor instead and forward the activation to the clipped children. */
    var hosts = new Map();
    rv.forEach(function (e) {
      var watch = e.classList.contains("clip") && e.parentElement ? e.parentElement : e;
      if (watch === e) { io.observe(e); return; }
      if (!hosts.has(watch)) hosts.set(watch, []);
      hosts.get(watch).push(e);
    });
    if (hosts.size) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          (hosts.get(en.target) || []).forEach(function (t) { t.setAttribute("data-in", "true"); });
          cio.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -12%", threshold: 0 });
      hosts.forEach(function (_kids, watch) { cio.observe(watch); });
    }
  })();

  document.querySelectorAll(".rvt").forEach(function (el) {
    if (el.firstElementChild && el.firstElementChild.tagName === "SPAN") return;
    var s = document.createElement("span");
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
  });

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
        var dec = (m[2].split(".")[1] || "").length, t0 = null, dur = 1150;
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

  /* ---------- Multi-step "Design Your Kitchen" quiz ----------
     One question per screen. Falls back to a plain long form without JS,
     because every step is visible until this runs. */
  document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll(".quiz__step"));
    if (steps.length < 2) return;
    var bar = quiz.querySelector(".quiz__bar i");
    var next = quiz.querySelector("[data-quiz-next]");
    var prev = quiz.querySelector("[data-quiz-prev]");
    var submit = quiz.querySelector("[data-quiz-submit]");
    var i = 0;

    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.setAttribute("data-active", k === i ? "true" : "false"); });
      if (bar) bar.style.width = Math.round(((i + 1) / steps.length) * 100) + "%";
      if (prev) prev.style.visibility = i === 0 ? "hidden" : "visible";
      if (next) next.hidden = i === steps.length - 1;
      if (submit) submit.hidden = i !== steps.length - 1;
      var h = steps[i].querySelector("h3, legend");
      if (h) h.setAttribute("tabindex", "-1"), h.focus({ preventScroll: true });
    }
    function valid() {
      var req = steps[i].querySelectorAll("input[required], select[required], textarea[required]");
      for (var k = 0; k < req.length; k++) {
        if (!req[k].checkValidity()) { req[k].reportValidity(); return false; }
      }
      var groups = {};
      steps[i].querySelectorAll('input[type="radio"][data-required]').forEach(function (r) { groups[r.name] = true; });
      for (var name in groups) {
        if (!steps[i].querySelector('input[name="' + name + '"]:checked')) {
          var note = steps[i].querySelector("[data-quiz-error]");
          if (note) note.hidden = false;
          return false;
        }
      }
      return true;
    }
    if (next) next.addEventListener("click", function () { if (valid()) show(i + 1); });
    if (prev) prev.addEventListener("click", function () { show(i - 1); });
    quiz.addEventListener("change", function (e) {
      var note = quiz.querySelector("[data-quiz-error]");
      if (note) note.hidden = true;
      /* radio choice advances automatically — feels like a conversation */
      if (e.target.type === "radio" && i < steps.length - 1 && next && !next.hidden) {
        setTimeout(function () { if (valid()) show(i + 1); }, 260);
      }
    });
    show(0);
  });

  /* ═══════════════════ PREMIUM MOTION LAYER ═══════════════════ */

  /* Split headlines into words so each can rise behind its own mask.
     Runs before the reveal observer sees them; the text stays in the DOM
     as real words, so crawlers and screen readers are unaffected. */
  document.querySelectorAll(".split").forEach(function (el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    var walk = function (node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            var w = document.createElement("span"); w.className = "w";
            var inner = document.createElement("span"); inner.textContent = tok;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains("w")) { walk(n); }
      });
    };
    walk(el);
    var words = el.querySelectorAll(".w > span");
    for (var i = 0; i < words.length; i++) words[i].style.setProperty("--wd", (i * 55) + "ms");
  });

  /* Magnetic CTAs — desktop pointers only */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    document.querySelectorAll(".mag").forEach(function (el) {
      var raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.28 + "px)";
        });
      });
      el.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = "";
      });
    });

    /* Hairline cursor */
    var ring = document.createElement("div"); ring.className = "cur";
    var dot = document.createElement("div"); dot.className = "cur-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      ring.setAttribute("data-on", "true"); dot.setAttribute("data-on", "true");
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      var t = e.target.closest ? e.target.closest("a,button,.ba,summary,input,select,textarea") : null;
      ring.setAttribute("data-hot", t ? "true" : "false");
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      ring.setAttribute("data-on", "false"); dot.setAttribute("data-on", "false");
    });
    (function ringLoop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(ringLoop);
    })();
  }

  /* Pinned statement — scales gently as it passes through the viewport */
  var pins = document.querySelectorAll(".pin");
  if (pins.length && !reduced) {
    var pinTick = false;
    var runPins = function () {
      pins.forEach(function (pin) {
        var t = pin.querySelector(".pin__t");
        if (!t) return;
        var r = pin.getBoundingClientRect();
        var span = (pin.offsetHeight - window.innerHeight) || 1;
        var p = Math.max(0, Math.min(1, -r.top / span));
        t.style.setProperty("--ps", (0.86 + p * 0.24).toFixed(3));
      });
      pinTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!pinTick) { pinTick = true; requestAnimationFrame(runPins); }
    }, { passive: true });
    runPins();
  }

  /* ---------- Lead forms ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = form.querySelector('[name="firstName"]');
      try { sessionStorage.setItem("hh_lead", f ? f.value : ""); } catch (err) {}
      window.location.href = form.getAttribute("data-lead");
    });
  });

  var slot = document.getElementById("leadName");
  if (slot) {
    try { var n = sessionStorage.getItem("hh_lead"); if (n) slot.textContent = ", " + n; } catch (err) {}
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  if (mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function (e) {
      reduced = e.matches;
      if (reduced) document.querySelectorAll(".rv,.rv-l,.rvt").forEach(function (el) { el.setAttribute("data-in", "true"); });
    });
  }
})();
