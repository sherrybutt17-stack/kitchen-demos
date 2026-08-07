/* OBSIDIAN — chamber.js
   The Transformation Chamber: one pinned viewport stage driven by a single
   scroll-progress value. Layered real photography, not WebGL — ~4KB, 60fps
   on a mid-range phone, and it degrades to a finished still with no JS.

   Scroll progress p (0 → 1) maps to five beats:
     0.00–0.20  dated room, desaturated, underlit
     0.20–0.40  lighting sweeps across; brightness + saturation ramp up
     0.40–0.60  clip-path wipe cross-fades the finished cabinetry in
     0.60–0.80  interactive — three surfaces the visitor can swap
     0.80–1.00  full reveal, headline settles, CTA lands
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var chamber = document.querySelector(".chamber");
  if (!chamber) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    root.classList.add("no-chamber");   /* show the finished state, drop the tall scroll */
    return;
  }

  var stage = chamber.querySelector(".chamber__stage");
  var beats = Array.prototype.slice.call(chamber.querySelectorAll(".ch-beat"));
  var swatchWrap = chamber.querySelector(".swatches");
  var swatches = Array.prototype.slice.call(chamber.querySelectorAll(".swatch"));
  var surface = chamber.querySelector(".ch-surface");

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  /* normalise v within [a,b] → 0..1 */
  var span = function (v, a, b) { return clamp((v - a) / (b - a), 0, 1); };

  var visible = false;
  var ticking = false;

  function render() {
    ticking = false;
    var rect = chamber.getBoundingClientRect();
    var scrollable = chamber.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var p = clamp(-rect.top / scrollable, 0, 1);

    stage.style.setProperty("--p", p.toFixed(4));

    /* beat 2 — the light sweeps across */
    var sweep = span(p, 0.18, 0.44);
    stage.style.setProperty("--sweep", sweep.toFixed(4));
    /* fade the sweep in and back out so it reads as a pass of light */
    stage.style.setProperty("--sweepO", (Math.sin(sweep * Math.PI) * 0.95).toFixed(4));

    /* beat 3 — cabinetry wipes in */
    stage.style.setProperty("--wipe", (span(p, 0.38, 0.62) * 100).toFixed(2) + "%");

    /* beat copy */
    var idx = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.62 ? 2 : p < 0.82 ? 3 : 4;
    for (var i = 0; i < beats.length; i++) {
      beats[i].setAttribute("data-on", i === idx ? "true" : "false");
    }

    /* beat 4 — surfaces become choosable */
    if (swatchWrap) swatchWrap.setAttribute("data-on", (p >= 0.58 && p <= 0.9) ? "true" : "false");
  }

  function onScroll() {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  /* only listen while the chamber is actually on screen */
  var io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) render();
  }, { rootMargin: "10% 0px" });
  io.observe(chamber);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { if (visible) render(); }, { passive: true });
  render();

  /* ---------- Surface swatches ---------- */
  swatches.forEach(function (btn) {
    btn.addEventListener("click", function () {
      swatches.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var src = btn.getAttribute("data-surface");
      var label = btn.getAttribute("data-label") || "";
      if (surface && src) {
        var img = surface.querySelector("img");
        if (img) {
          img.src = src;
          img.alt = label ? "Kitchen island shown in " + label : "";
        }
        surface.style.setProperty("--surface", "1");
      }
      var out = chamber.querySelector("[data-surface-name]");
      if (out) out.textContent = label;
    });
  });
})();
