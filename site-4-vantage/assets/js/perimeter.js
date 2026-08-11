/* VANTAGE — perimeter.js
   THE PERIMETER: a live top-down coverage plan drawn in raw 2D canvas.
   No library, no model files, no images in the drawing itself.

   What makes it read as engineering rather than decoration:
     · every camera cone is ray-marched and CLIPPED against the building
       footprints, so structures cast real coverage shadows
     · the coverage percentage is measured, not written down — drag a camera
       and the number recomputes from the same ray field the cones are drawn from
     · the camera nodes are real <button>s layered over the canvas, so the whole
       feature is focusable, draggable, announced and keyboard-operable.
       The canvas only ever draws; it is never the control surface.

   prefers-reduced-motion renders one static night frame — no sweep, no walker —
   while keeping drag and keyboard interaction live.
   SOURCE OF TRUTH — inlined into every page by scripts/build.py */
(function () {
  "use strict";

  var stage = document.getElementById("perim-stage");
  if (!stage) return;
  var cv = document.getElementById("perim-cv");
  var ctx = cv && cv.getContext && cv.getContext("2d");
  if (!ctx) return;                       /* no canvas -> the static fallback stays */

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- World ---------- */
  /* Plan space is 100 x 70 units and is contain-fitted into the stage; the
     ground is painted across the whole canvas, so the letterbox reads as
     more lot rather than as empty space. */
  /* One plan unit is 2 ft, so the 90 x 62 lot inside the boundary is a 0.51-acre
     property and a 58-unit camera reach is a realistic 116 ft of IR. */
  var W = 100, H = 70;
  var LOT_SQFT = 22320;

  var BOX = [                             /* occluders: x1, y1, x2, y2 */
    { r: [30, 8, 70, 34], label: "house" },
    { r: [70, 12, 86, 30], label: "garage" },
    { r: [12, 48, 26, 62], label: "shop" }
  ];

  /* Defaults are a real 2.8 mm lens (110°) at 116 ft of IR reach, aimed to the
     best whole-lot figure that optics can actually deliver — about 76%. Starting
     at a plausible number rather than a perfect one is the point: there is real
     headroom, so dragging a camera earns you something instead of only ever
     spoiling a 99% that no five-camera plan could honestly claim. */
  var CAMS = [
    { id: "01", name: "Driveway",   x: 86.5, y: 31.5, dir: 45,  fov: 110, rng: 58 },
    { id: "02", name: "Front door", x: 50,   y: 35.2, dir: 95,  fov: 110, rng: 46 },
    { id: "03", name: "Side gate",  x: 29,   y: 35,   dir: 200, fov: 110, rng: 58 },
    { id: "04", name: "Back yard",  x: 50,   y: 7,    dir: 295, fov: 120, rng: 58 },
    { id: "05", name: "Shop",       x: 26.5, y: 47,   dir: 340, fov: 110, rng: 58 }
  ];

  var PATH = [                            /* the walker's route, in plan units */
    [97, 67], [81, 64], [78.5, 50], [77, 38], [66, 37], [55, 39], [50, 36.5]
  ];

  var RAYS = 88;
  var TAU = Math.PI * 2;
  var rad = function (d) { return d * Math.PI / 180; };

  /* ---------- Fit ---------- */
  var dpr = 1, sc = 1, ox = 0, oy = 0, cw = 0, ch = 0;
  function fit() {
    var r = stage.getBoundingClientRect();
    cw = Math.max(1, r.width); ch = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sc = Math.min(cw / W, ch / H);
    ox = (cw - W * sc) / 2; oy = (ch - H * sc) / 2;
    placeNodes();
  }
  var X = function (x) { return ox + x * sc; };
  var Y = function (y) { return oy + y * sc; };

  /* ---------- Ray vs axis-aligned box ---------- */
  /* Returns the nearest positive hit distance along (dx,dy) from (px,py), or
     Infinity. Hits closer than EPS are ignored: a camera sits ON the wall it is
     bolted to, and without that guard every cone would self-shadow at the source
     — the 2D analogue of the normal-offset trap in kitchen3d.js. */
  var EPS = 0.35;
  function hit(px, py, dx, dy, max) {
    var best = max;
    for (var i = 0; i < BOX.length; i++) {
      var b = BOX[i].r;
      var t1 = (b[0] - px) / dx, t2 = (b[2] - px) / dx;
      var t3 = (b[1] - py) / dy, t4 = (b[3] - py) / dy;
      var tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
      var tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
      if (tmax < tmin || tmax < 0) continue;
      var t = tmin > EPS ? tmin : (tmax > EPS ? tmax : Infinity);
      if (t < best) best = t;
    }
    return best;
  }

  /* ---------- Cone field ---------- */
  /* One array of marched distances per camera. The cone polygon, the coverage
     test and the blind-area figure all read from this same field, so what you
     see and what the readout claims can never disagree. */
  function march(c) {
    var half = c.fov / 2, d = new Float32Array(RAYS);
    for (var i = 0; i < RAYS; i++) {
      var a = rad(c.dir - half + (c.fov * i) / (RAYS - 1));
      d[i] = hit(c.x, c.y, Math.cos(a), Math.sin(a), c.rng);
    }
    c.field = d;
    return d;
  }

  function angDelta(a, b) {               /* signed smallest difference, degrees */
    var d = ((a - b) % 360 + 540) % 360 - 180;
    return d;
  }

  function covers(c, px, py) {
    var dx = px - c.x, dy = py - c.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > c.rng) return false;
    var dd = angDelta(Math.atan2(dy, dx) * 180 / Math.PI, c.dir);
    var half = c.fov / 2;
    if (Math.abs(dd) > half) return false;
    var idx = Math.round(((dd + half) / c.fov) * (RAYS - 1));
    return dist <= c.field[idx] + 0.25;
  }

  function inBox(x, y) {
    for (var i = 0; i < BOX.length; i++) {
      var b = BOX[i].r;
      if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return true;
    }
    return false;
  }

  var coverage = 0, uncovered = 0;
  function measure() {
    var tot = 0, cov = 0;
    for (var y = 5; y < 67; y += 2.2) {
      for (var x = 6; x < 95; x += 2.2) {
        if (inBox(x, y)) continue;
        tot++;
        for (var i = 0; i < CAMS.length; i++) {
          if (covers(CAMS[i], x, y)) { cov++; break; }
        }
      }
    }
    coverage = tot ? cov / tot : 0;
    uncovered = Math.round(LOT_SQFT * (1 - coverage) / 10) * 10;
    var pc = document.getElementById("perim-cov");
    var un = document.getElementById("perim-un");
    if (pc) pc.firstChild.nodeValue = Math.round(coverage * 100);
    if (un) un.firstChild.nodeValue = uncovered.toLocaleString("en-US");
  }

  function recompute() { CAMS.forEach(march); measure(); }

  /* ---------- Nodes ---------- */
  var nodes = [], selected = -1;
  var viewWrap = document.getElementById("perim-view");
  var views = viewWrap ? Array.prototype.slice.call(viewWrap.querySelectorAll("[data-view]")) : [];

  function placeNodes() {
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.left = X(CAMS[i].x) + "px";
      nodes[i].style.top = Y(CAMS[i].y) + "px";
    }
  }

  function select(i) {
    selected = i;
    var id = i >= 0 ? CAMS[i].id : null;
    nodes.forEach(function (n, k) { n.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    views.forEach(function (v) { v.hidden = v.getAttribute("data-view") !== id; });
    if (viewWrap) viewWrap.setAttribute("data-on", i >= 0 ? "true" : "false");
  }

  function clampCam(c) {
    c.x = Math.max(4, Math.min(96, c.x));
    c.y = Math.max(3, Math.min(67, c.y));
    /* A camera shoved inside a wall would shadow itself completely; push it out
       through the nearest face instead of letting the cone collapse. */
    for (var i = 0; i < BOX.length; i++) {
      var b = BOX[i].r;
      if (c.x < b[0] - 0.6 || c.x > b[2] + 0.6 || c.y < b[1] - 0.6 || c.y > b[3] + 0.6) continue;
      var dl = c.x - (b[0] - 0.8), dr = (b[2] + 0.8) - c.x;
      var dt = c.y - (b[1] - 0.8), db = (b[3] + 0.8) - c.y;
      var m = Math.min(dl, dr, dt, db);
      if (m === dl) c.x = b[0] - 0.8;
      else if (m === dr) c.x = b[2] + 0.8;
      else if (m === dt) c.y = b[1] - 0.8;
      else c.y = b[3] + 0.8;
    }
  }

  CAMS.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "perim__node";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label",
      "Camera " + c.id + ", " + c.name + ". Press to open its view. " +
      "Arrow keys reposition it; hold Shift to aim it.");
    b.innerHTML = '<span class="perim__tag" aria-hidden="true">' + c.id + '</span>';
    b.addEventListener("click", function (e) {
      if (b.dataset.moved === "1") { b.dataset.moved = "0"; return; }
      select(selected === i ? -1 : i);
      e.preventDefault();
    });
    /* Pointer drag */
    b.addEventListener("pointerdown", function (e) {
      b.setPointerCapture(e.pointerId);
      b.dataset.drag = "1"; b.dataset.moved = "0";
    });
    b.addEventListener("pointermove", function (e) {
      if (b.dataset.drag !== "1") return;
      var r = stage.getBoundingClientRect();
      c.x = (e.clientX - r.left - ox) / sc;
      c.y = (e.clientY - r.top - oy) / sc;
      clampCam(c); b.dataset.moved = "1";
      recompute(); placeNodes();
      if (reduced) draw(1);
    });
    b.addEventListener("pointerup", function (e) {
      b.dataset.drag = "0";
      try { b.releasePointerCapture(e.pointerId); } catch (_) {}
    });
    /* Keyboard: arrows move, Shift+arrows aim */
    b.addEventListener("keydown", function (e) {
      var k = e.key, step = 1.5;
      if (k !== "ArrowLeft" && k !== "ArrowRight" && k !== "ArrowUp" && k !== "ArrowDown") return;
      e.preventDefault();
      if (e.shiftKey) {
        c.dir += (k === "ArrowRight" || k === "ArrowDown") ? 6 : -6;
        c.dir = (c.dir + 360) % 360;
      } else {
        if (k === "ArrowLeft") c.x -= step;
        if (k === "ArrowRight") c.x += step;
        if (k === "ArrowUp") c.y -= step;
        if (k === "ArrowDown") c.y += step;
        clampCam(c);
      }
      recompute(); placeNodes();
      if (reduced) draw(1);
    });
    stage.appendChild(b);
    nodes.push(b);
  });

  /* ---------- Event feed ---------- */
  var feed = document.getElementById("perim-feed");
  var alertId = "", lastLog = -9999;
  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  function logEvent(who, what) {
    if (!feed) return;
    var li = document.createElement("li");
    li.innerHTML = "<b>" + stamp() + "</b><span>" + who + " · " + what + "</span>";
    feed.insertBefore(li, feed.firstChild);
    while (feed.children.length > 3) feed.removeChild(feed.lastChild);
  }

  /* ---------- Paint ---------- */
  var t0 = null, walkT = 0, carX = 108;

  function pathAt(u) {                    /* u in 0..1 along the polyline */
    var segs = PATH.length - 1, f = u * segs;
    var i = Math.min(segs - 1, Math.floor(f)), g = f - i;
    return [PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * g,
            PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * g];
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function box(b, fill, stroke) {
    var x = X(b[0]), y = Y(b[1]), w = (b[2] - b[0]) * sc, h = (b[3] - b[1]) * sc;
    roundRect(x, y, w, h, 2 * sc * 0.5);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  /* night = 0 at dusk, 1 at full dark; driven by scroll */
  function draw(night, tms) {
    var n = night;
    ctx.clearRect(0, 0, cw, ch);

    /* ground */
    var g = ctx.createRadialGradient(cw * .5, ch * .42, 0, cw * .5, ch * .42, Math.max(cw, ch) * .8);
    g.addColorStop(0, n > .5 ? "#0a1018" : "#141d28");
    g.addColorStop(1, "#04050a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);

    /* survey grid */
    ctx.strokeStyle = "rgba(232,234,237,.045)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 0; gx <= W; gx += 5) { ctx.moveTo(X(gx), Y(0)); ctx.lineTo(X(gx), Y(H)); }
    for (var gy = 0; gy <= H; gy += 5) { ctx.moveTo(X(0), Y(gy)); ctx.lineTo(X(W), Y(gy)); }
    ctx.stroke();

    /* lot boundary */
    ctx.strokeStyle = "rgba(232,234,237,.16)";
    ctx.setLineDash([4, 5]);
    ctx.strokeRect(X(5), Y(4), 90 * sc, 62 * sc);
    ctx.setLineDash([]);

    /* street + driveway + walk + pool */
    ctx.fillStyle = "#080b11";
    ctx.fillRect(0, Y(66), cw, ch - Y(66));
    ctx.fillStyle = "rgba(232,234,237,.05)";
    ctx.fillRect(X(72), Y(30), 12 * sc, 38 * sc);       /* driveway */
    ctx.fillRect(X(47), Y(34), 6 * sc, 32 * sc);        /* front walk */
    ctx.fillStyle = "rgba(77,141,255,.10)";              /* pool, clear of the walk */
    roundRect(X(33), Y(42), 14 * sc, 12 * sc, 2 * sc); ctx.fill();
    ctx.strokeStyle = "rgba(77,141,255,.28)"; ctx.lineWidth = 1; ctx.stroke();

    /* structures */
    BOX.forEach(function (b) { box(b.r, "#111820", "rgba(232,234,237,.22)"); });
    /* lit windows on the house front — the only warm light on the plan */
    ctx.fillStyle = "rgba(255,214,150," + (0.16 + n * 0.5) + ")";
    [[36, 33.2], [43, 33.2], [57, 33.2], [64, 33.2]].forEach(function (w) {
      ctx.fillRect(X(w[0]), Y(w[1]), 4 * sc, 1.4 * sc);
    });

    /* ---- coverage cones ---- */
    ctx.globalCompositeOperation = "lighter";
    CAMS.forEach(function (c, ci) {
      var half = c.fov / 2, f = c.field;
      ctx.beginPath();
      ctx.moveTo(X(c.x), Y(c.y));
      for (var i = 0; i < RAYS; i++) {
        var a = rad(c.dir - half + (c.fov * i) / (RAYS - 1));
        ctx.lineTo(X(c.x + Math.cos(a) * f[i]), Y(c.y + Math.sin(a) * f[i]));
      }
      ctx.closePath();
      var rg = ctx.createRadialGradient(X(c.x), Y(c.y), 0, X(c.x), Y(c.y), c.rng * sc);
      var hot = (ci === selected) ? 1.55 : 1;
      rg.addColorStop(0, "rgba(77,141,255," + (0.30 * hot * (0.55 + n * 0.45)) + ")");
      rg.addColorStop(0.55, "rgba(77,141,255," + (0.13 * hot * (0.55 + n * 0.45)) + ")");
      rg.addColorStop(1, "rgba(77,141,255,0)");
      ctx.fillStyle = rg; ctx.fill();
      /* cone edges */
      ctx.strokeStyle = "rgba(127,176,255," + (ci === selected ? .5 : .22) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      [0, RAYS - 1].forEach(function (i) {
        var a = rad(c.dir - half + (c.fov * i) / (RAYS - 1));
        ctx.moveTo(X(c.x), Y(c.y));
        ctx.lineTo(X(c.x + Math.cos(a) * f[i]), Y(c.y + Math.sin(a) * f[i]));
      });
      ctx.stroke();
    });
    ctx.globalCompositeOperation = "source-over";

    /* ---- sweep ---- */
    if (!reduced && tms != null) {
      var a0 = (tms / 7000) * TAU % TAU;
      var hx = X(50), hy = Y(21), R = Math.max(cw, ch);
      var sg = ctx.createConicGradient ? ctx.createConicGradient(a0, hx, hy) : null;
      if (sg) {
        sg.addColorStop(0, "rgba(127,176,255,.11)");
        sg.addColorStop(0.06, "rgba(127,176,255,0)");
        sg.addColorStop(1, "rgba(127,176,255,0)");
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(hx, hy, R, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = "rgba(127,176,255,.30)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(a0) * R, hy + Math.sin(a0) * R); ctx.stroke();
    }

    /* ---- moving subjects ---- */
    if (!reduced && tms != null) {
      var u = (walkT % 1);
      var p = pathAt(u);
      /* Attribute the subject to the camera looking most directly at it, not to
         whichever happens to be first in the array — otherwise every overlap
         flips the owner and the feed fills with duplicates of the same person. */
      var seen = null, bestOff = 1e9;
      for (var i = 0; i < CAMS.length; i++) {
        var c2 = CAMS[i];
        if (!covers(c2, p[0], p[1])) continue;
        var off = Math.abs(angDelta(
          Math.atan2(p[1] - c2.y, p[0] - c2.x) * 180 / Math.PI, c2.dir));
        if (off < bestOff) { bestOff = off; seen = c2; }
      }
      var seenId = seen ? seen.id : "";
      if (seenId !== alertId) {                 /* only touch the DOM on a change */
        nodes.forEach(function (n2, k) {
          n2.setAttribute("data-alert", CAMS[k].id === seenId ? "true" : "false");
        });
        alertId = seenId;
        if (seen && tms - lastLog > 5000) { lastLog = tms; logEvent(seen.name, "person detected"); }
      }

      /* detection box */
      var px = X(p[0]), py = Y(p[1]), s2 = 3.4 * sc;
      ctx.strokeStyle = seen ? "rgba(232,234,237,.95)" : "rgba(232,234,237,.34)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px - s2, py - s2, s2 * 2, s2 * 2);
      ctx.fillStyle = seen ? "rgba(232,234,237,.95)" : "rgba(232,234,237,.4)";
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, TAU); ctx.fill();
      if (seen) {
        ctx.font = "500 10px ui-monospace, monospace";
        ctx.fillText("PERSON 98%", px - s2, py - s2 - 6);
      }

      /* a vehicle on the street */
      carX -= 0.06;
      if (carX < -10) { carX = 112; logEvent("Street", "vehicle passed"); }
      ctx.fillStyle = "rgba(232,234,237,.30)";
      ctx.fillRect(X(carX), Y(67.4), 4.2 * sc, 1.9 * sc);
    }

    /* vignette */
    var vg = ctx.createRadialGradient(cw * .5, ch * .5, Math.min(cw, ch) * .28,
                                      cw * .5, ch * .5, Math.max(cw, ch) * .78);
    vg.addColorStop(0, "rgba(4,5,10,0)");
    vg.addColorStop(1, "rgba(4,5,10," + (0.45 + n * 0.3) + ")");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
  }

  /* ---------- Scroll -> dusk to night ---------- */
  var night = reduced ? 1 : 0;
  function scrollNight() {
    var r = stage.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var p = 1 - (r.top + r.height * 0.35) / vh;
    night = Math.max(0, Math.min(1, p * 1.35));
  }

  /* ---------- Run ---------- */
  var running = false;
  function frame(t) {
    if (!running) return;
    if (t0 == null) t0 = t;
    walkT += 0.00055;                       /* ~30s per pass up the drive */
    draw(night, t - t0);
    requestAnimationFrame(frame);
  }

  fit();
  recompute();
  stage.setAttribute("data-ready", "true");

  if (reduced) {
    draw(1);
  } else {
    scrollNight();
    window.addEventListener("scroll", scrollNight, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !running) { running = true; t0 = null; requestAnimationFrame(frame); }
        else if (!vis) running = false;
      }, { threshold: 0.02 }).observe(stage);
    } else {
      running = true; requestAnimationFrame(frame);
    }
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { fit(); if (reduced || !running) draw(night); }).observe(stage);
  } else {
    window.addEventListener("resize", function () { fit(); if (reduced) draw(night); });
  }

  /* Reset control */
  var reset = document.getElementById("perim-reset");
  if (reset) {
    var home = CAMS.map(function (c) { return { x: c.x, y: c.y, dir: c.dir }; });
    reset.addEventListener("click", function () {
      CAMS.forEach(function (c, i) { c.x = home[i].x; c.y = home[i].y; c.dir = home[i].dir; });
      recompute(); placeNodes(); select(-1);
      if (reduced || !running) draw(night);
    });
  }
})();
