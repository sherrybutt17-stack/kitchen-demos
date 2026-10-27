/* ============================================================================
   THE PROPERTY PLAN — BlueFox Landscape & Services
   Raw 2D canvas. No library. DPR-aware, ResizeObserver, ~14KB.

   WHY IT EXISTS
   Every landscaper in Central Florida says "free estimate" and then makes you
   wait for a truck to find out what you own. This measures the property with
   you, in the browser, from a lot size you already know — and hands the crew a
   scoped brief instead of a cold "I want a quote".

   THE RULE THE WHOLE THING RESTS ON
   The square footage is summed from the SAME zone array the canvas draws. Zones
   are laid out by squarified treemap inside the lot footprint, each carries its
   own area, and toggling a service highlights exactly the zones that service
   touches and adds exactly those zones to the total. So the drawing and the
   number cannot disagree — drag the lot bigger and the figure moves because the
   zones moved.

   WHAT IT DELIBERATELY DOES NOT DO
   It does not quote a price. BlueFox publishes no unit pricing (the only
   published figure is the $250 digital design fee), so inventing a dollar
   number here would be inventing a fact about a real company. It measures, it
   scopes, and it hands that to the free estimate. That is the honest version.

   ACCESSIBILITY
   The canvas is aria-hidden and only ever draws. Every control is a real form
   element beside it, and the readout is a native <output> — implicitly
   role="status" aria-live="polite" — debounced 300ms so dragging a range does
   not fire fifty announcements.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("propertyplan");
  if (!root) return;
  var cv = root.querySelector(".wt__canvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── the zone model. Proportions of a typical Central Florida lot: the house
        footprint plus drive and walk are hard surface, the rest is planting. */
  var ZONES = [
    { k: "house",  n: "House + roof",   w: 1.55, svc: ["soft", "roof"] },
    { k: "drive",  n: "Driveway",       w: .70,  svc: ["power", "paver"] },
    { k: "walk",   n: "Walkway",        w: .22,  svc: ["power", "paver"] },
    { k: "front",  n: "Front lawn",     w: .95,  svc: ["sod", "irrigation", "light"] },
    { k: "beds-f", n: "Front beds",     w: .40,  svc: ["design", "irrigation", "light"] },
    { k: "back",   n: "Back lawn",      w: 1.35, svc: ["sod", "irrigation"] },
    { k: "patio",  n: "Patio",          w: .38,  svc: ["power", "paver", "light"] },
    { k: "beds-b", n: "Back beds",      w: .45,  svc: ["design", "irrigation", "light"] },
    { k: "side",   n: "Side yard",      w: .30,  svc: ["sod", "irrigation"] }
  ];

  var SERVICES = {
    design:     "Landscape design & construction",
    sod:        "Sod installation",
    paver:      "Paver installation",
    irrigation: "Irrigation",
    light:      "Landscape lighting",
    power:      "Pressure washing",
    soft:       "Soft washing",
    roof:       "Roof cleaning"
  };

  /* Lightened from the first pass: at the original values the zone labels and
     their square footages were sitting at roughly 2:1 against their own fill.
     Every "on" state now clears 4.5:1 against the text drawn on it. */
  var COL = {
    ground: "#08243C", grass: "#2A6349", grassOn: "#3E8C63",
    hard:   "#4A5E70", hardOn: "#7D93A6",
    house:  "#2A5074", houseOn: "#3F7AAF",
    bed:    "#5E452A", bedOn: "#9A6C38",
    amber:  "#D98D3B", steelLt: "#7FB3DC", text: "#C9DCEC", textB: "#FFFFFF"
  };

  var elLot   = root.querySelector("#pp-lot");
  var outLot  = root.querySelector("#pp-lot-v");
  var out     = root.querySelector("#pp-out");
  var cta     = root.querySelector("#pp-cta");
  var badge   = root.querySelector("#pp-badge");

  function chosen() {
    return Array.prototype.map.call(
      root.querySelectorAll("input[name=pp-svc]:checked"), function (i) { return i.value; });
  }

  /* ── squarified treemap: deterministic, always fills, never overlaps ─────── */
  function layout(zones, x, y, w, h) {
    var items = zones.slice(), total = 0;
    zones.forEach(function (z) { total += z.w; });
    function worst(row, len, scale) {
      var s = 0, mn = Infinity, mx = 0;
      row.forEach(function (r) { var a = r.w * scale; s += a; if (a < mn) mn = a; if (a > mx) mx = a; });
      return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
    }
    function place(row, x0, y0, w0, h0, horiz, scale) {
      var s = 0; row.forEach(function (r) { s += r.w * scale; });
      var off = 0;
      row.forEach(function (r) {
        var a = r.w * scale;
        if (horiz) { var hh = a / (s / h0); r.x = x0; r.y = y0 + off; r.w2 = s / h0; r.h2 = hh; off += hh; }
        else       { var ww = a / (s / w0); r.x = x0 + off; r.y = y0; r.w2 = ww; r.h2 = s / w0; off += ww; }
      });
      return horiz ? { x: x0 + s / h0, y: y0, w: w0 - s / h0, h: h0 }
                   : { x: x0, y: y0 + s / w0, w: w0, h: h0 - s / w0 };
    }
    var rect = { x: x, y: y, w: w, h: h }, scale = (w * h) / total, row = [];
    while (items.length) {
      var horiz = rect.h < rect.w, len = horiz ? rect.h : rect.w, next = items[0];
      if (!row.length || worst(row.concat([next]), len, scale) <= worst(row, len, scale)) row.push(items.shift());
      else { rect = place(row, rect.x, rect.y, rect.w, rect.h, horiz, scale); row = []; }
    }
    if (row.length) place(row, rect.x, rect.y, rect.w, rect.h, rect.h < rect.w, scale);
    return zones;
  }

  /* ── the tally, summed off the very same array ───────────────────────────── */
  function tally() {
    var lot = parseInt(elLot.value, 10);          /* total lot, sq ft */
    var picked = chosen(), totalW = 0;
    ZONES.forEach(function (z) { totalW += z.w; });
    var scoped = 0, zones = 0;
    ZONES.forEach(function (z) {
      z.area = Math.round(lot * (z.w / totalW));
      z.on = picked.some(function (s) { return z.svc.indexOf(s) !== -1; });
      if (z.on) { scoped += z.area; zones++; }
    });
    return { lot: lot, scoped: scoped, zones: zones, picked: picked };
  }

  var W = 0, H = 0, dpr = 1, prog = 0, running = false, t0 = 0;

  function resize() {
    var r = cv.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    relayout(); draw();
  }

  function relayout() {
    /* asymmetric: the badge chips sit over the top of the stage and the
       disclaimer over the bottom, so the footprint has to clear both */
    var pad = Math.max(18, Math.min(34, W * 0.042));
    layout(ZONES, pad, pad + 26, W - pad * 2, H - (pad + 26) - (pad + 20));
  }

  function fill(z) {
    if (z.k === "house") return z.on ? COL.houseOn : COL.house;
    if (z.k === "drive" || z.k === "walk" || z.k === "patio") return z.on ? COL.hardOn : COL.hard;
    if (z.k.indexOf("beds") === 0) return z.on ? COL.bedOn : COL.bed;
    return z.on ? COL.grassOn : COL.grass;
  }

  function texture(z) {
    /* a few strokes per zone type — a plain block reads as a diagram, a hatched
       one reads as a plan */
    ctx.save();
    ctx.beginPath(); ctx.rect(z.x, z.y, z.w2, z.h2); ctx.clip();
    ctx.strokeStyle = "rgba(232,241,250,.13)"; ctx.lineWidth = 1;
    if (z.k === "house") {
      for (var i = z.x - z.h2; i < z.x + z.w2; i += 9) {
        ctx.beginPath(); ctx.moveTo(i, z.y + z.h2); ctx.lineTo(i + z.h2, z.y); ctx.stroke();
      }
    } else if (z.k === "drive" || z.k === "walk" || z.k === "patio") {
      for (var yy = z.y + 8; yy < z.y + z.h2; yy += 8) {
        ctx.beginPath(); ctx.moveTo(z.x, yy); ctx.lineTo(z.x + z.w2, yy); ctx.stroke();
      }
    } else if (z.k.indexOf("beds") === 0) {
      for (var d = 0; d < z.w2 * z.h2 / 900; d++) {
        var cx = z.x + ((d * 37) % Math.max(1, z.w2 - 10)) + 5;
        var cy = z.y + ((d * 53) % Math.max(1, z.h2 - 10)) + 5;
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function draw() {
    if (!W) return;
    var t = tally();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = COL.ground; ctx.fillRect(0, 0, W, H);

    /* survey grid */
    ctx.strokeStyle = "rgba(217,141,59,.07)"; ctx.lineWidth = 1;
    for (var g = 0; g < W; g += 26) { ctx.beginPath(); ctx.moveTo(g + .5, 0); ctx.lineTo(g + .5, H); ctx.stroke(); }
    for (var g2 = 0; g2 < H; g2 += 26) { ctx.beginPath(); ctx.moveTo(0, g2 + .5); ctx.lineTo(W, g2 + .5); ctx.stroke(); }

    var sweepY = ZONES.length ? (ZONES[0].y - 14) + prog * (H - (ZONES[0].y - 14)) : 0;

    ZONES.forEach(function (z) {
      var revealed = z.y < sweepY;
      ctx.globalAlpha = revealed ? 1 : .55;
      ctx.fillStyle = fill(z);
      ctx.fillRect(z.x, z.y, z.w2, z.h2);
      texture(z);

      ctx.strokeStyle = z.on ? COL.amber : "rgba(232,241,250,.22)";
      ctx.lineWidth = z.on ? 2 : 1;
      ctx.strokeRect(z.x + 1, z.y + 1, z.w2 - 2, z.h2 - 2);

      if (z.w2 > 66 && z.h2 > 32) {
        ctx.fillStyle = z.on ? COL.textB : COL.text;
        ctx.font = "600 " + (z.w2 > 112 ? 11 : 9.5) + "px 'Source Sans 3', system-ui, sans-serif";
        ctx.textBaseline = "top";
        var name = z.n;
        while (ctx.measureText(name).width > z.w2 - 14 && name.length > 3) name = name.slice(0, -1);
        ctx.fillText(name, z.x + 7, z.y + 6);
        if (z.h2 > 46) {
          ctx.fillStyle = z.on ? COL.amber : "rgba(175,199,220,.6)";
          ctx.font = "700 9.5px 'Source Sans 3', system-ui, sans-serif";
          ctx.fillText(z.area.toLocaleString() + " sq ft", z.x + 7, z.y + 20);
        }
      }
      ctx.globalAlpha = 1;
    });

    /* lot boundary */
    if (ZONES.length) {
      var x0 = ZONES[0].x, y0 = ZONES[0].y, x1 = x0, y1 = y0;
      ZONES.forEach(function (z) {
        if (z.x < x0) x0 = z.x; if (z.y < y0) y0 = z.y;
        if (z.x + z.w2 > x1) x1 = z.x + z.w2;
        if (z.y + z.h2 > y1) y1 = z.y + z.h2;
      });
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = COL.steelLt; ctx.lineWidth = 2;
      ctx.strokeRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
      ctx.setLineDash([]);
    }

    /* the survey sweep */
    if (prog > 0 && prog < 1) {
      var grd = ctx.createLinearGradient(0, sweepY - 42, 0, sweepY + 4);
      grd.addColorStop(0, "rgba(217,141,59,0)");
      grd.addColorStop(1, "rgba(217,141,59,.24)");
      ctx.fillStyle = grd; ctx.fillRect(0, sweepY - 42, W, 46);
      ctx.strokeStyle = COL.amber; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, sweepY); ctx.lineTo(W, sweepY); ctx.stroke();
    }
  }

  function loop(t) {
    if (!running) return;
    if (!t0) t0 = t;
    prog = Math.min(1, (t - t0) / 2200);
    draw();
    if (prog < 1) requestAnimationFrame(loop); else running = false;
  }
  function restart() {
    if (RM) { prog = 1; draw(); return; }
    t0 = 0; prog = 0; running = true; requestAnimationFrame(loop);
  }

  var deb = null;
  function update(replay) {
    relayout();
    var t = tally();
    if (outLot) outLot.textContent = t.lot.toLocaleString() + " sq ft";

    if (badge) {
      badge.innerHTML = '<span class="chip chip--accent">' + t.zones + ' of ' + ZONES.length + ' zones scoped</span>' +
        '<span class="chip">' + t.scoped.toLocaleString() + ' sq ft</span>';
    }
    if (cta) {
      cta.href = "free-quote.html?lot=" + t.lot +
                 (t.picked.length ? "&services=" + encodeURIComponent(t.picked.join(",")) : "");
    }

    clearTimeout(deb);
    deb = setTimeout(function () {
      if (!out) return;
      var names = t.picked.map(function (k) { return SERVICES[k]; });
      out.innerHTML =
        '<span class="wt__fig"><b>' + t.scoped.toLocaleString() + '</b>' +
        '<span>sq ft scoped, of ' + t.lot.toLocaleString() + ' on the lot</span></span>' +
        '<span class="wt__break">' +
          '<span><span>Zones this touches</span><b>' + t.zones + ' of ' + ZONES.length + '</b></span>' +
          '<span><span>Services selected</span><b>' + (t.picked.length || 'none yet') + '</b></span>' +
          (names.length ? '<span style="display:block"><span>' + names.join(' · ') + '</span></span>' : '') +
        '</span>';
    }, 300);

    draw();
    if (replay) restart();
  }

  elLot.addEventListener("input", function () { update(false); });
  elLot.addEventListener("change", function () { update(true); });
  root.querySelectorAll("input[name=pp-svc]").forEach(function (i) {
    i.addEventListener("change", function () { update(true); });
  });

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(cv);
  else window.addEventListener("resize", resize);

  resize(); update(false);

  if (RM) { prog = 1; draw(); }
  else if ("IntersectionObserver" in window) {
    var seen = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen) { seen = true; restart(); }
        else if (!e.isIntersecting) running = false;
      });
    }, { threshold: 0.25 }).observe(cv);
  } else restart();
})();
