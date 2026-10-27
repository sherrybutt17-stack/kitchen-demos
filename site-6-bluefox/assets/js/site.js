/* ============================================================================
   BLUEFOX LANDSCAPE & SERVICES — site.js
   No framework, no library. Motion is transform/opacity/filter only and every
   effect short-circuits under prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── reveals ──────────────────────────────────────────────────────────────
     Observed elements are always UNCLIPPED. clip-path shrinks the intersection
     rectangle an observer measures, so a clipped element never intersects and
     stays hidden forever; the observed ancestor forwards data-in to
     [data-rv-child] descendants instead. */
  function markIn(el) {
    el.setAttribute("data-in", "true");
    $$("[data-rv-child]", el).forEach(function (c) { c.setAttribute("data-in", "true"); });
  }
  if (RM || !("IntersectionObserver" in window)) {
    $$(".rv, .rvt, .rvl, [data-rv-child]").forEach(markIn);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        markIn(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.04 });
    $$(".rv, .rvt, .rvl").forEach(function (el) { io.observe(el); });
    $$("[data-stagger]").forEach(function (g) {
      var step = parseFloat(g.getAttribute("data-stagger")) || 0.075;
      $$(".rv, .rvt", g).forEach(function (el, i) { el.style.setProperty("--d", (i * step) + "s"); });
    });
  }

  /* ── header: frost past 40px, hide on a fast downward scroll ──────────────── */
  var hdr = $(".hdr");
  var anyOpen = function () { return !!$(".nav__dd[data-open='true'], .oc[data-open='true']"); };
  if (hdr) {
    var last = 0, ticking = false;
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      hdr.setAttribute("data-solid", y > 40 ? "true" : "false");
      hdr.setAttribute("data-hide", (y > 520 && y > last + 4 && !anyOpen()) ? "true" : "false");
      last = y;
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ── dropdowns ────────────────────────────────────────────────────────────
     The label is a real link to the overview page; the chevron is a separate
     button that owns aria-expanded. Pointer hover opens the panel in CSS and
     flips the bar to its frosted state here, so the menu never reads over a
     photograph. */
  var dds = $$(".nav__dd");
  var setDD = function (li, open) {
    li.setAttribute("data-open", open ? "true" : "false");
    var b = $(".nav__tg", li);
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
  };
  dds.forEach(function (li) {
    var b = $(".nav__tg", li);
    b.addEventListener("click", function () {
      var open = li.getAttribute("data-open") !== "true";
      dds.forEach(function (o) { setDD(o, false); });
      setDD(li, open);
    });
    if (FINE && hdr) {
      li.addEventListener("pointerenter", function () { hdr.setAttribute("data-menu", "true"); });
      li.addEventListener("pointerleave", function () { hdr.removeAttribute("data-menu"); });
    }
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && li.getAttribute("data-open") === "true") { setDD(li, false); b.focus(); }
    });
    li.addEventListener("focusout", function (e) {
      if (!li.contains(e.relatedTarget)) setDD(li, false);
    });
  });
  document.addEventListener("click", function (e) {
    dds.forEach(function (li) { if (!li.contains(e.target)) setDD(li, false); });
  });

  /* ── off-canvas navigation ────────────────────────────────────────────────── */
  var burger = $(".burger"), oc = $(".oc");
  if (burger && oc) {
    var setOpen = function (open) {
      oc.setAttribute("data-open", open ? "true" : "false");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) { var f = oc.querySelector("a, button, summary"); if (f) f.focus(); }
      else burger.focus();
    };
    burger.addEventListener("click", function () { setOpen(oc.getAttribute("data-open") !== "true"); });
    $(".oc__x", oc).addEventListener("click", function () { setOpen(false); });
    oc.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && oc.getAttribute("data-open") === "true") setOpen(false);
    });
    oc.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("a[href], button, summary", oc).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], lastN = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastN.focus(); }
      else if (!e.shiftKey && document.activeElement === lastN) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── hero parallax: one custom property, --sp, on the hero itself ─────────── */
  var hero = $(".hero");
  if (hero && !RM) {
    var raf = false;
    var tick = function () {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--sp", Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))).toFixed(4));
      raf = false;
    };
    window.addEventListener("scroll", function () { if (!raf) { raf = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }

  /* ── magnetic CTA. --bfx/--bfy are owner-prefixed: a custom property read by a
     transform is effectively global, and a bare --mx on a container once pushed
     six CTAs off the page. ─────────────────────────────────────────────────── */
  if (!RM && FINE) {
    $$(".magnet").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--bfx", ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(2) + "px");
        el.style.setProperty("--bfy", ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(2) + "px");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--bfx", "0px"); el.style.setProperty("--bfy", "0px");
      });
    });
  }

  /* ── FAQ: one open at a time within an .acc ───────────────────────────────── */
  $$(".acc").forEach(function (acc) {
    var all = $$("details", acc);
    all.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ── before/after: the range input IS the control ─────────────────────────── */
  $$(".ba__range").forEach(function (r) {
    var fig = r.closest(".ba");
    var sync = function () { fig.style.setProperty("--ba", r.value + "%"); };
    r.addEventListener("input", sync);
    sync();
  });

  /* ── quote forms — PREVIEW. Nothing is sent: validate, say so, land on
     thank-you.html. At launch GHL replaces this (see each LAUNCH comment). */
  var MSG = { name: "Please add your name.", email: "Please add an email address we can reply to.",
              phone: "Please add a phone number with area code.", service: "Please choose at least one service.",
              zip: "ZIP codes are five digits — or leave it blank." };
  /* ── services multi-select: a native <select> (works with no script) made
     multiple and driven by a checkbox panel. The select stays the truth. */
  var msel = function (sel) {
    var id = sel.id, lab = $("label[for='" + id + "']"), w = document.createElement("div"),
        b = document.createElement("button"), p = document.createElement("div"), cs = [];
    sel.multiple = true;
    if (sel.options[0] && !sel.options[0].value) sel.remove(0);
    sel.id = id + "-x"; sel.hidden = true; sel._b = b;
    w.className = "msel"; b.type = "button"; b.className = "msel__b"; b.id = id;
    p.className = "msel__p"; p.id = id + "-p"; p.hidden = true;
    b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", p.id);
    if (lab) { lab.id = id + "-l"; b.setAttribute("aria-labelledby", lab.id + " " + id); }
    $$("optgroup, option", sel).forEach(function (o) {
      var g = o.tagName === "OPTGROUP", l = document.createElement(g ? "p" : "label");
      if (g) { l.className = "msel__g"; l.textContent = o.label; p.appendChild(l); return; }
      var c = document.createElement("input");
      c.type = "checkbox"; c._o = o; cs.push(c);
      c.addEventListener("change", function () { o.selected = c.checked; sync(); sel.dispatchEvent(new Event("change")); });
      l.appendChild(c); l.appendChild(document.createTextNode(o.value === "multiple" ? "Not sure yet" : o.textContent));
      p.appendChild(l);
    });
    var sync = sel._sync = function () {
      var on = cs.filter(function (c) { return (c.checked = c._o.selected); });
      b.textContent = !on.length ? "Choose services…" : on.length > 1 ? on.length + " services selected" : on[0].parentNode.textContent;
    };
    var set = function (o) { p.hidden = !o; b.setAttribute("aria-expanded", o); };
    b.addEventListener("click", function () { set(p.hidden); if (!p.hidden) cs[0].focus(); });
    w.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !p.hidden) { e.preventDefault(); e.stopPropagation(); set(false); b.focus(); }
    });
    ["click", "focusin"].forEach(function (t) { document.addEventListener(t, function (e) { if (!w.contains(e.target)) set(false); }); });
    sel.parentNode.insertBefore(w, sel); w.appendChild(b); w.appendChild(p); w.appendChild(sel);
    sync();
  };
  $$("form.qform select[name=service]").forEach(msel);

  var check = function (el) {
    var v = (el.value || "").trim(), ok = true;
    if (el.required && !v) ok = false;
    else if (el.type === "email" && v) ok = el.validity ? el.validity.valid : /\S+@\S+\.\S+/.test(v);
    else if (el.type === "tel" && v) ok = v.replace(/\D/g, "").length >= 10;
    else if (el.name === "zip" && v) ok = /^\d{5}$/.test(v);
    var f = el.closest(".field"); if (!f) return ok;
    var err = $(".field__err", f), t = el._b || el;
    if (ok) { f.removeAttribute("data-err"); t.removeAttribute("aria-invalid"); if (err) err.remove(); }
    else {
      f.setAttribute("data-err", ""); t.setAttribute("aria-invalid", "true");
      if (!err) {
        err = document.createElement("p"); err.className = "field__err"; err.id = el.id + "-err";
        f.appendChild(err); t.setAttribute("aria-describedby", err.id);
      }
      err.textContent = MSG[el.name] || "Please check this field.";
    }
    return ok;
  };
  $$("form.qform").forEach(function (f) {
    f.setAttribute("novalidate", "");
    var els = $$("input[name], select[name]", f).filter(function (el) { return el.type !== "checkbox" && el.type !== "hidden"; });
    els.forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value || el.hasAttribute("aria-invalid")) check(el); });
      el.addEventListener("change", function () { if ((el._b || el).hasAttribute("aria-invalid")) check(el); });
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = els.filter(function (el) { return !check(el); });
      var st = $(".form__status", f);
      if (bad.length) {
        (bad[0]._b || bad[0]).focus();
        if (st) { st.hidden = false; st.textContent = bad.length === 1 ? "One field needs a look before this can go." : bad.length + " fields need a look before this can go."; }
        return;
      }
      var btn = $("button[type=submit]", f);
      if (btn) btn.disabled = true;
      if (st) {
        st.hidden = false;
        st.textContent = "Preview only — nothing has been sent. Once the client's GoHighLevel connection is live, this goes straight to the BlueFox office. Taking you to the confirmation page…";
      }
      var d = new FormData(f), q = ["preview=1"];
      ["name", "service"].forEach(function (k) { var v = d.getAll(k).join(","); if (v) q.push(k + "=" + encodeURIComponent(v)); });
      setTimeout(function () { window.location.href = "thank-you.html?" + q.join("&"); }, 1700);
    });
  });

  /* select a service by value, only if that option exists; add keeps others */
  var pick = function (sel, v, add) {
    if (!sel || !v) return false;
    var o = Array.prototype.filter.call(sel.options, function (x) { return x.value === v; })[0];
    if (o) { if (add) o.selected = true; else sel.value = o.value; }
    if (sel._sync) sel._sync();
    return !!o;
  };

  /* ── the shared quote popup. Every [data-quote] trigger is a real link to
     free-quote.html, so it still works with no script or no <dialog>. ───── */
  var qm = $("#qm");
  if (qm && typeof qm.showModal === "function") {
    var qf = $("form", qm);
    $$("[data-quote]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (oc && oc.getAttribute("data-open") === "true") $(".oc__x", oc).click();
        var st = $(".form__status", qf); if (st) st.hidden = true;
        var sel = qf.elements.service;
        if (!pick(sel, a.getAttribute("data-quote"))) { sel.value = ""; if (sel._sync) sel._sync(); }
        qm.showModal();
        var first = qf.elements.name; if (first) first.focus();
      });
    });
    $(".qm__x", qm).addEventListener("click", function () { qm.close(); });
    qm.addEventListener("click", function (e) { if (e.target === qm) qm.close(); });
  }

  /* ── prefill from the querystring. Values are matched against options that
     already exist; nothing from the URL is ever injected as markup. ───────── */
  var pf = $("form[data-prefill]");
  if (pf) {
    var qp = new URLSearchParams(window.location.search);
    pick(pf.elements.service, qp.get("service"));
    var svc = (qp.get("services") || "").split(",").filter(Boolean)
      .map(function (s) { return s === "light" ? "lighting" : s; });
    var notes = [];
    if (svc.length === 1) pick(pf.elements.service, svc[0]);
    else if (svc.length > 1) {
      svc.forEach(function (v) { pick(pf.elements.service, v, true); });
      notes.push("Estimator scope: " + svc.join(", "));
    }
    var lot = parseInt(qp.get("lot"), 10);
    if (lot > 0 && lot < 1e6) notes.push("Lot size: about " + lot.toLocaleString() + " sq ft");
    var z = (qp.get("zip") || "").replace(/\D/g, "").slice(0, 5);
    if (z && pf.elements.zip) pf.elements.zip.value = z;
    var note = pf.elements.note;
    if (note && notes.length && !note.value) note.value = notes.join(". ") + ".";
  }

  /* ── carousel: 8s autoplay that stops for good once a visitor touches it ── */
  $$(".car").forEach(function (car) {
    var slides = $$(".car__slide", car), n = slides.length, i = 0, timer = null, stopped = RM;
    var out = $(".car__n", car), pz = $("[data-car='pause']", car), live = $(".car__track", car);
    var go = function (k) {
      i = (k + n) % n;
      car.style.setProperty("--car-i", i);
      slides.forEach(function (s, j) { s.setAttribute("aria-hidden", j === i ? "false" : "true"); });
      if (out) out.textContent = (i + 1) + " / " + n;
    };
    var stop = function () {
      stopped = true; clearInterval(timer); timer = null;
      car.setAttribute("data-paused", "true"); live.setAttribute("aria-live", "polite");
      if (pz) pz.setAttribute("aria-label", "Play slideshow");
    };
    var play = function () {
      stopped = false; clearInterval(timer);
      timer = setInterval(function () { go(i + 1); }, 8000);
      car.setAttribute("data-paused", "false"); live.setAttribute("aria-live", "off");
      if (pz) pz.setAttribute("aria-label", "Pause slideshow");
    };
    $$("[data-car]", car).forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-car");
        if (a === "pause") { if (stopped) play(); else stop(); return; }
        stop(); go(i + (a === "next" ? 1 : -1));
      });
    });
    var x0 = null;
    live.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    live.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { stop(); go(i + (dx < 0 ? 1 : -1)); }
    });
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { stop(); go(i + (e.key === "ArrowRight" ? 1 : -1)); }
    });
    go(0);
    if (stopped) stop();
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (stopped) return;
        if (es[0].isIntersecting) { if (!timer) play(); } else { clearInterval(timer); timer = null; }
      }, { threshold: 0.3 }).observe(car);
    } else play();
  });

  /* ── gallery: category filter + lightbox ──────────────────────────────────── */
  var mos = $(".mos");
  if (mos) {
    var items = $$(".mos__i", mos);
    $$(".flt button").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        all.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        items.forEach(function (it) {
          it.hidden = f !== "all" && (" " + it.getAttribute("data-cat") + " ").indexOf(" " + f + " ") < 0;
        });
      });
    });
    var lb = $(".lb");
    if (lb && typeof lb.showModal === "function") {
      var li = $("img", lb), lc = $("figcaption", lb), cur = 0, opener = null;
      var vis = function () { return items.filter(function (it) { return !it.hidden; }); };
      var show = function (k) {
        var v = vis(); cur = (k + v.length) % v.length;
        var im = $("img", v[cur]);
        li.src = im.currentSrc || im.src; li.alt = im.alt;
        lc.textContent = v[cur].getAttribute("data-cap") || im.alt;
      };
      items.forEach(function (it) {
        it.addEventListener("click", function () {
          opener = it; show(vis().indexOf(it)); lb.showModal();
        });
      });
      $$("[data-lb]", lb).forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-lb");
          if (a === "close") lb.close(); else show(cur + (a === "next" ? 1 : -1));
        });
      });
      lb.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") show(cur + 1);
        if (e.key === "ArrowLeft") show(cur - 1);
      });
      lb.addEventListener("close", function () { if (opener) opener.focus(); });
    }
  }

  /* ── the Google review feed ───────────────────────────────────────────────
     The company's own Elfsight widget (the same one the live site embeds), so
     every review is real and comes straight from Google. Third-party script, so
     it is fetched only as the feed nears the viewport. Once it renders, its
     header carries the live rating and count; [data-rating] slots elsewhere on
     the page are filled from it. Nothing is ever shown if it never loads. */
  var elf = $$("[data-elfsight]"), rated = $$("[data-rating]");
  var readRating = function (root) {
    var t = (root.textContent || "").replace(/\s+/g, " ");
    var r = t.match(/\b([1-5][.,]\d)\b/), c = t.match(/(\d[\d,]*)\s+reviews?/i);
    if (!r) return false;
    var s = r[1].replace(",", ".") + " out of 5 on Google" + (c ? " · " + c[1] + " reviews" : "");
    rated.forEach(function (el) { el.textContent = s; });
    return true;
  };
  var loadElf = function () {
    if (loadElf.done) return; loadElf.done = true;
    var sc = document.createElement("script");
    sc.src = "https://apps.elfsight.com/p/platform.js"; sc.defer = true;
    document.body.appendChild(sc);
    elf.forEach(function (box) {
      var mo = new MutationObserver(function () {
        var w = $(".elf__wait", box); if (w && box.children.length > 1) w.remove();
        if (readRating(box)) mo.disconnect();
      });
      mo.observe(box, { childList: true, subtree: true, characterData: true });
    });
  };
  if (elf.length) {
    if ("IntersectionObserver" in window) {
      var eio = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { eio.disconnect(); loadElf(); }
      }, { rootMargin: "900px 0px" });
      elf.forEach(function (b) { eio.observe(b); });
    } else loadElf();
  }

  /* ── thank-you: echo the first name, and flag the preview ─────────────────── */
  var tq = new URLSearchParams(window.location.search);
  var echo = $("[data-echo]");
  if (echo) {
    var nm = (tq.get("name") || "").trim().replace(/[<>]/g, "").slice(0, 40);
    var wrap = $("[data-echo-wrap]");
    if (nm) echo.textContent = nm.split(" ")[0];
    else if (wrap) wrap.remove();
  }
  var pv = $("[data-preview]");
  if (pv && tq.get("preview")) pv.hidden = false;

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
