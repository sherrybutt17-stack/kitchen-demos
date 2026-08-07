/* NORTHSTONE — site.js
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

  /* ---------- Header: solid on scroll, hide on scroll-down ---------- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var lastY = 0, ticking = false;
    var updateHdr = function () {
      var y = window.scrollY;
      hdr.setAttribute("data-solid", y > 24 ? "true" : "false");
      /* only hide once well past the fold, and never while the drawer is open */
      var drawerOpen = document.getElementById("drawer");
      drawerOpen = drawerOpen && drawerOpen.getAttribute("data-open") === "true";
      hdr.setAttribute("data-hide", (!drawerOpen && y > 560 && y > lastY) ? "true" : "false");
      lastY = y;
      ticking = false;
    };
    updateHdr();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateHdr); }
    }, { passive: true });
  }

  /* ---------- Off-canvas nav ---------- */
  var drawer = document.getElementById("drawer");
  var lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    var burger = document.querySelector(".burger");
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    /* stagger the links in */
    var links = drawer.querySelectorAll("nav a");
    for (var i = 0; i < links.length; i++) {
      links[i].style.transitionDelay = open ? (90 + i * 55) + "ms" : "0ms";
    }
    if (open) {
      lastFocus = document.activeElement;
      var f = drawer.querySelector("a, button");
      if (f) f.focus();
    } else if (lastFocus) { lastFocus.focus(); }
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

  /* ---------- Hero video: attach on view, pause off-screen ---------- */
  var vids = document.querySelectorAll("video[data-src]");
  if (vids.length && !reduced && !saveData && !slowNet && hasIO) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.dataset.attached) {
            v.dataset.attached = "1";
            var s = document.createElement("source");
            s.src = v.dataset.src; s.type = "video/mp4";
            v.appendChild(s); v.load();
            v.addEventListener("playing", function () { v.setAttribute("data-ready", "true"); }, { once: true });
          }
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked — poster remains */ });
        } else if (v.dataset.attached) { v.pause(); }
      });
    }, { rootMargin: "220px" });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Before / after sliders (drag, touch, keyboard) ---------- */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba__range");
    if (!range) return;
    var apply = function () { ba.style.setProperty("--p", range.value + "%"); };
    range.addEventListener("input", apply);
    apply();
  });

  /* ---------- Video facade — nothing loads until clicked ---------- */
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
        f.title = btn.dataset.title || "Client story";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        f.allowFullscreen = true;
        btn.innerHTML = ""; btn.appendChild(f);
      }
    });
  });

  /* ---------- Reveal on scroll, with automatic stagger ---------- */
  function initReveal() {
    var rv = document.querySelectorAll(".rv, .rvt, .split, .clip");
    if (!rv.length) return;
    if (reduced || !hasIO) {
      rv.forEach(function (el) { el.setAttribute("data-in", "true"); });
      return;
    }
    /* siblings inside the same grid/row stagger in sequence */
    document.querySelectorAll(".grid, .mosaic, .steps, .stats, .btn-row").forEach(function (group) {
      var kids = group.querySelectorAll(":scope > .rv, :scope > * > .rv");
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].style.getPropertyValue("--d")) kids[i].style.setProperty("--d", (i * 90) + "ms");
      }
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute("data-in", "true");
        rio.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

    /* A .clip element starts at clip-path: inset(0 0 100% 0), which collapses its own
       intersection rectangle to zero area — so an observer watching the element itself
       can never fire, and the element stays clipped (invisible) forever. Watch an
       unclipped ancestor instead and forward the activation to the clipped children. */
    var hosts = new Map();
    rv.forEach(function (el) {
      var watch = el.classList.contains("clip") && el.parentElement ? el.parentElement : el;
      if (watch === el) { rio.observe(el); return; }
      if (!hosts.has(watch)) hosts.set(watch, []);
      hosts.get(watch).push(el);
    });
    if (hosts.size) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          (hosts.get(en.target) || []).forEach(function (t) { t.setAttribute("data-in", "true"); });
          cio.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -12%", threshold: 0 });
      hosts.forEach(function (_kids, watch) { cio.observe(watch); });
    }
  }
  initReveal();

  /* ---------- Masked headline reveal: wrap each .rvt in a span once ---------- */
  document.querySelectorAll(".rvt").forEach(function (el) {
    if (el.firstElementChild && el.firstElementChild.tagName === "SPAN") return;
    var span = document.createElement("span");
    while (el.firstChild) span.appendChild(el.firstChild);
    el.appendChild(span);
  });

  /* ---------- Count-up for stat numbers ---------- */
  if (!reduced && hasIO) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        nio.unobserve(el);
        var raw = el.textContent.trim();
        var m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
        if (!m) return;
        var pre = m[1], target = parseFloat(m[2].replace(/,/g, "")), post = m[3];
        if (!isFinite(target) || target === 0) return;
        var dec = (m[2].split(".")[1] || "").length;
        var t0 = null, dur = 1100;
        function tick(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (target * eased).toFixed(dec) + post;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".stats b, .hero__meta b").forEach(function (b) { nio.observe(b); });
  }

  /* ---------- Gentle parallax on marked figures ---------- */
  if (!reduced && hasIO && window.innerWidth > 860) {
    var pxEls = [];
    document.querySelectorAll(".px").forEach(function (el) {
      var img = el.querySelector("img");
      if (img) pxEls.push({ box: el, img: img });
    });
    if (pxEls.length) {
      var pxTick = false;
      var runPx = function () {
        var vh = window.innerHeight;
        pxEls.forEach(function (o) {
          var r = o.box.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          var progress = (r.top + r.height / 2 - vh / 2) / vh;   /* -1 … 1 */
          o.img.style.transform = "scale(1.12) translate3d(0," + (progress * -22).toFixed(2) + "px,0)";
        });
        pxTick = false;
      };
      window.addEventListener("scroll", function () {
        if (!pxTick) { pxTick = true; requestAnimationFrame(runPx); }
      }, { passive: true });
      runPx();
    }
  }

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

  /* ---------- Consultation form → thank-you ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      /* GHL replaces this with its native form handler. */
      var f = form.querySelector('[name="firstName"]');
      try { sessionStorage.setItem("ns_lead", f ? f.value : ""); } catch (err) {}
      window.location.href = form.getAttribute("data-lead");
    });
  });

  /* ---------- Thank-you personalisation ---------- */
  var slot = document.getElementById("leadName");
  if (slot) {
    try {
      var n = sessionStorage.getItem("ns_lead");
      if (n) slot.textContent = ", " + n;
    } catch (err) {}
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Respond live to reduced-motion changes ---------- */
  if (mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function (e) {
      reduced = e.matches;
      if (reduced) document.querySelectorAll(".rv, .rvt").forEach(function (el) { el.setAttribute("data-in", "true"); });
    });
  }
})();
