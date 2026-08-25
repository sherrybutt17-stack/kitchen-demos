/* ============================================================================
   THE WALKTHROUGH — Blue Fox Cleaning
   Raw 2D canvas. No library. DPR-aware, ResizeObserver, ~13KB.

   WHY IT EXISTS
   Blue Fox bills an honest hourly rate for a two-person crew, which is more
   transparent than a flat quote and much harder to shop. The published site
   said "$100/hr" and then "no appointment is scheduled until we reach out",
   so a visitor could not answer the only question they came with: what will
   this cost ME. This answers it from the practice's own published rate card
   and its own published room checklist, and nothing else.

   THE RULE THE WHOLE THING RESTS ON
   The tally is derived from the SAME room array the canvas draws. Rooms are
   laid out by squarified treemap, each carries its own crew-minutes, and the
   readout sums that array. So what you see on the plan and what the number
   claims cannot disagree — drag "bedrooms" and a room appears, and the figure
   moves because that room is in the sum.

   ACCESSIBILITY
   The canvas is aria-hidden and only ever draws. Every control is a real form
   element beside it, and the readout is a native <output> — implicitly
   role="status" aria-live="polite" — debounced 300ms so dragging a range does
   not fire fifty announcements. No parallel keyboard implementation exists
   because none is needed.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("walkthrough");
  if (!root) return;

  var cv = root.querySelector(".wt__canvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var RM  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── published rate card. The homepage ladder, not the older per-service
        pages, which still show the previous $90/$100/$110 tier. ───────────── */
  var RATE = { basic: 100, deep: 110, move: 115 };
  var MULT = { basic: 1,   deep: 1.85, move: 2.2 };
  var LABEL= { basic: "Basic clean", deep: "Deep clean", move: "Move in / move out" };

  /* crew-minutes per room for a basic clean, from the published checklist.
     A "crew minute" is one minute of the two-person team, which is the unit
     the hourly rate is actually billed in. */
  var MIN = { kitchen: 26, living: 18, dining: 10, bed: 12, bath: 17, hall: 6, laundry: 7 };
  var PET = 1.08;               /* pets add coat and dander passes throughout  */

  var COL = {
    ink:   "#041A27",
    wall:  "#0C3D57",
    room:  "#0B3348",
    roomA: "#12496A",
    done:  "rgba(0,171,255,.30)",
    sky:   "#00ABFF",
    skyLt: "#5CC0FF",
    text:  "#A8CFE4",
    textB: "#E8F4FB"
  };

  /* ── controls ─────────────────────────────────────────────────────────────── */
  var elBeds  = root.querySelector("#wt-beds");
  var elBaths = root.querySelector("#wt-baths");
  var elPets  = root.querySelector("#wt-pets");
  var outBeds = root.querySelector("#wt-beds-v");
  var outBaths= root.querySelector("#wt-baths-v");
  var out     = root.querySelector("#wt-out");
  var cta     = root.querySelector("#wt-cta");
  var badge   = root.querySelector("#wt-badge");

  function svc() {
    var r = root.querySelector("input[name=wt-svc]:checked");
    return r ? r.value : "basic";
  }

  /* ── the room model. Build once per change; the canvas and the tally both
        read this array and nothing else. ─────────────────────────────────── */
  function buildRooms() {
    var beds = parseInt(elBeds.value, 10);
    var baths = parseInt(elBaths.value, 10);
    var r = [];
    r.push({ k: "kitchen", n: "Kitchen",  w: 1.45 });
    r.push({ k: "living",  n: "Living",   w: 1.6  });
    if (beds >= 3) r.push({ k: "dining", n: "Dining", w: .95 });
    for (var i = 0; i < beds; i++) {
      r.push({ k: "bed", n: i === 0 ? "Primary bed" : "Bedroom " + (i + 1), w: i === 0 ? 1.25 : .95 });
    }
    for (var j = 0; j < baths; j++) {
      r.push({ k: "bath", n: j === 0 ? "Primary bath" : "Bath " + (j + 1), w: j === 0 ? .72 : .55 });
    }
    r.push({ k: "hall", n: "Hall + entry", w: .6 });
    if (beds >= 3) r.push({ k: "laundry", n: "Laundry", w: .5 });

    var m = MULT[svc()] * (elPets.checked ? PET : 1);
    r.forEach(function (x) { x.min = MIN[x.k] * m; });
    return r;
  }

  /* ── squarified treemap. Deterministic, always fills the footprint, never
        overlaps — which is what makes it read as a plan rather than as boxes. */
  function layout(rooms, x, y, w, h) {
    var items = rooms.map(function (r) { return r; });
    function worst(row, len, scale) {
      var s = 0, mn = Infinity, mx = 0;
      row.forEach(function (r) { var a = r.w * scale; s += a; if (a < mn) mn = a; if (a > mx) mx = a; });
      return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
    }
    function place(row, x0, y0, w0, h0, horiz, scale) {
      var s = 0;
      row.forEach(function (r) { s += r.w * scale; });
      var off = 0;
      row.forEach(function (r) {
        var a = r.w * scale;
        if (horiz) {
          var hh = a / (s / h0);
          r.x = x0; r.y = y0 + off; r.w2 = s / h0; r.h2 = hh; off += hh;
        } else {
          var ww = a / (s / w0);
          r.x = x0 + off; r.y = y0; r.w2 = ww; r.h2 = s / w0; off += ww;
        }
      });
      return horiz ? { x: x0 + s / h0, y: y0, w: w0 - s / h0, h: h0 }
                   : { x: x0, y: y0 + s / w0, w: w0, h: h0 - s / w0 };
    }
    var total = 0;
    items.forEach(function (r) { total += r.w; });
    var rect = { x: x, y: y, w: w, h: h };
    var scale = (w * h) / total;
    var row = [];
    while (items.length) {
      var horiz = rect.h < rect.w;
      var len = horiz ? rect.h : rect.w;
      var next = items[0];
      if (!row.length || worst(row.concat([next]), len, scale) <= worst(row, len, scale)) {
        row.push(items.shift());
      } else {
        rect = place(row, rect.x, rect.y, rect.w, rect.h, horiz, scale);
        row = [];
      }
    }
    if (row.length) place(row, rect.x, rect.y, rect.w, rect.h, rect.h < rect.w, scale);
    return rooms;
  }

  /* ── the tally, summed off the very same array ────────────────────────────── */
  function tally(rooms) {
    var mins = 0;
    rooms.forEach(function (r) { mins += r.min; });
    var hrs = mins / 60;
    var lo = Math.max(2, Math.round((hrs * 0.90) * 4) / 4);   /* 2h published minimum */
    var hi = Math.round((hrs * 1.14) * 4) / 4;
    if (hi <= lo) hi = lo + 0.5;
    var rate = RATE[svc()];
    return { lo: lo, hi: hi, rate: rate, loP: Math.round(lo * rate), hiP: Math.round(hi * rate),
             rooms: rooms.length, mins: Math.round(mins) };
  }

  function fmtH(h) { return (h % 1 === 0) ? String(h) : h.toFixed(2).replace(/0$/, ""); }

  /* ── drawing ──────────────────────────────────────────────────────────────── */
  var W = 0, H = 0, dpr = 1, rooms = [], prog = 0, running = false, t0 = 0;

  function resize() {
    var r = cv.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    relayout();
    draw();
  }

  function relayout() {
    /* Asymmetric on purpose: the badge chips sit over the top-left of the stage
       and the "estimate only" line over the bottom, so the footprint has to
       clear both. One symmetric pad put rooms underneath each of them. */
    var pad = Math.max(18, Math.min(34, W * 0.042));
    var top = pad + 26, bot = pad + 20;
    rooms = layout(buildRooms(), pad, top, W - pad * 2, H - top - bot);
  }

  function fixture(r) {
    /* a couple of strokes per room type. An empty plan reads as a diagram;
       a plan with fittings reads as a house. */
    var s = Math.min(r.w2, r.h2);
    if (s < 34) return;
    ctx.strokeStyle = "rgba(168,207,228,.32)";
    ctx.lineWidth = 1;
    var m = 7;
    if (r.k === "bed") {
      var bw = Math.min(r.w2 - m * 2, s * 0.62), bh = bw * 1.15;
      if (bh > r.h2 - m * 2) { bh = r.h2 - m * 2; bw = bh / 1.15; }
      ctx.strokeRect(r.x + m, r.y + m, bw, bh);
      ctx.beginPath();
      ctx.moveTo(r.x + m, r.y + m + bh * 0.26);
      ctx.lineTo(r.x + m + bw, r.y + m + bh * 0.26);
      ctx.stroke();
    } else if (r.k === "bath") {
      var tw = Math.min(r.w2 - m * 2, s * 0.7), th = Math.min(r.h2 - m * 2, tw * 0.5);
      ctx.strokeRect(r.x + m, r.y + r.h2 - m - th, tw, th);
      ctx.beginPath();
      ctx.arc(r.x + r.w2 - m - 6, r.y + m + 6, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (r.k === "kitchen") {
      ctx.beginPath();
      ctx.moveTo(r.x + m, r.y + r.h2 * 0.55);
      ctx.lineTo(r.x + r.w2 * 0.62, r.y + r.h2 * 0.55);
      ctx.lineTo(r.x + r.w2 * 0.62, r.y + r.h2 - m);
      ctx.stroke();
    } else if (r.k === "living" || r.k === "dining") {
      var cw = Math.min(r.w2 - m * 2, s * 0.55);
      ctx.strokeRect(r.x + r.w2 / 2 - cw / 2, r.y + r.h2 / 2 - cw * 0.3, cw, cw * 0.6);
    }
  }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = COL.ink;
    ctx.fillRect(0, 0, W, H);

    /* drafting grid */
    ctx.strokeStyle = "rgba(0,171,255,.07)";
    ctx.lineWidth = 1;
    for (var g = 0; g < W; g += 26) { ctx.beginPath(); ctx.moveTo(g + .5, 0); ctx.lineTo(g + .5, H); ctx.stroke(); }
    for (var g2 = 0; g2 < H; g2 += 26) { ctx.beginPath(); ctx.moveTo(0, g2 + .5); ctx.lineTo(W, g2 + .5); ctx.stroke(); }

    var sweepX = rooms.length ? (rooms[0].x - 14) + prog * (W - (rooms[0].x - 14) * 2) : 0;

    rooms.forEach(function (r, i) {
      var cx = r.x + r.w2 / 2;
      var done = cx < sweepX;
      ctx.fillStyle = (i % 2) ? COL.roomA : COL.room;
      ctx.fillRect(r.x, r.y, r.w2, r.h2);
      if (done) { ctx.fillStyle = COL.done; ctx.fillRect(r.x, r.y, r.w2, r.h2); }

      fixture(r);

      /* interior wall */
      ctx.strokeStyle = done ? "rgba(0,171,255,.55)" : COL.wall;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x + 1, r.y + 1, r.w2 - 2, r.h2 - 2);

      /* label + its own minute cost, so the plan states what the sum is made of */
      if (r.w2 > 62 && r.h2 > 34) {
        ctx.fillStyle = done ? COL.textB : COL.text;
        ctx.font = "600 " + (r.w2 > 108 ? 11 : 9.5) + "px Figtree, system-ui, sans-serif";
        ctx.textBaseline = "top";
        var name = r.n;
        while (ctx.measureText(name).width > r.w2 - 14 && name.length > 3) name = name.slice(0, -1);
        ctx.fillText(name, r.x + 7, r.y + 6);
        if (r.h2 > 48) {
          ctx.fillStyle = done ? COL.skyLt : "rgba(168,207,228,.6)";
          ctx.font = "700 9.5px Figtree, system-ui, sans-serif";
          ctx.fillText(Math.round(r.min) + " min", r.x + 7, r.y + 20);
        }
      }
    });

    /* outer wall */
    if (rooms.length) {
      var x0 = rooms[0].x, y0 = rooms[0].y;
      var x1 = x0, y1 = y0;
      rooms.forEach(function (r) {
        if (r.x < x0) x0 = r.x; if (r.y < y0) y0 = r.y;
        if (r.x + r.w2 > x1) x1 = r.x + r.w2;
        if (r.y + r.h2 > y1) y1 = r.y + r.h2;
      });
      ctx.strokeStyle = COL.skyLt;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 - 1.5, y0 - 1.5, x1 - x0 + 3, y1 - y0 + 3);
    }

    /* the sweep — a mop pass, not a radar */
    if (prog > 0 && prog < 1) {
      var grd = ctx.createLinearGradient(sweepX - 46, 0, sweepX + 6, 0);
      grd.addColorStop(0, "rgba(0,171,255,0)");
      grd.addColorStop(1, "rgba(0,171,255,.28)");
      ctx.fillStyle = grd;
      ctx.fillRect(sweepX - 46, 0, 52, H);
      ctx.strokeStyle = COL.sky;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sweepX, 0); ctx.lineTo(sweepX, H); ctx.stroke();
    }
  }

  function loop(t) {
    if (!running) return;
    if (!t0) t0 = t;
    prog = Math.min(1, (t - t0) / 2600);
    draw();
    if (prog < 1) requestAnimationFrame(loop);
    else running = false;
  }

  function restart() {
    if (RM) { prog = 1; draw(); return; }
    t0 = 0; prog = 0; running = true;
    requestAnimationFrame(loop);
  }

  /* ── readout ──────────────────────────────────────────────────────────────── */
  var deb = null;
  function update(replay) {
    relayout();
    var t = tally(rooms);
    var s = svc();

    if (outBeds)  outBeds.textContent  = elBeds.value;
    if (outBaths) outBaths.textContent = elBaths.value;

    if (badge) {
      badge.innerHTML = '<span class="chip chip--sky">' + t.rooms + ' rooms</span>' +
        '<span class="chip">' + LABEL[s] + '</span>' +
        (elPets.checked ? '<span class="chip">Pets in home</span>' : '');
    }

    if (cta) {
      cta.href = "free-quote.html?service=" + s + "&beds=" + elBeds.value +
                 "&baths=" + elBaths.value + (elPets.checked ? "&pets=1" : "");
    }

    clearTimeout(deb);
    deb = setTimeout(function () {
      if (!out) return;
      out.innerHTML =
        '<span class="wt__fig"><b>$' + t.loP + '–$' + t.hiP + '</b>' +
        '<span>' + fmtH(t.lo) + '–' + fmtH(t.hi) + ' hrs · two-person crew</span></span>' +
        '<span class="wt__break">' +
          '<span><span>' + LABEL[s] + ' rate</span><b>$' + t.rate + '/hr</b></span>' +
          '<span><span>Rooms on the plan</span><b>' + t.rooms + '</b></span>' +
          '<span><span>Crew minutes counted</span><b>' + t.mins + '</b></span>' +
          (s === "deep" ? '<span><span>First deep clean offer</span><b>−$100</b></span>' : '') +
        '</span>';
    }, 300);

    if (replay) restart();
  }

  [elBeds, elBaths].forEach(function (el) {
    el.addEventListener("input", function () { update(false); draw(); });
    el.addEventListener("change", function () { update(true); });
  });
  root.querySelectorAll("input[name=wt-svc]").forEach(function (r) {
    r.addEventListener("change", function () { update(true); });
  });
  elPets.addEventListener("change", function () { update(true); });

  /* ── lifecycle: never animate off-screen ──────────────────────────────────── */
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(cv);
  else window.addEventListener("resize", resize);

  resize();
  update(false);

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
