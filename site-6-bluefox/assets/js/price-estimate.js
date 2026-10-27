/* ============================================================================
   PRICE ESTIMATE — BlueFox Landscape & Services (estimator.html only)

   Window cleaning per pane by frequency, sod per sq ft (bare ground or old sod
   to remove), Paver Sand & Seal per sq ft — checklist 6.3. The rates live in
   #bx-prices on the page, not here, and start null: a null rate says "being
   finalised", never a number. Either way the scope rides into the quote request.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.getElementById("price-estimate");
  if (!root) return;

  var P = {};
  try { P = JSON.parse(document.getElementById("bx-prices").textContent) || {}; } catch (e) { P = {}; }
  var W = P.window || {}, S = P.sod || {}, Z = P.seal || {};

  var $ = function (id) { return document.getElementById(id); };
  var qty = function (id, max) { var v = Math.round(parseFloat($(id).value)); return v > 0 ? Math.min(v, max) : 0; };
  var pick = function (n) { var r = root.querySelector("input[name='" + n + "']:checked"); return r ? r.value : ""; };
  var usd = function (v) { return "$" + Math.round(v).toLocaleString("en-US"); };
  var n = function (v) { return v.toLocaleString("en-US"); };
  var FREQ = { oneTime: "one-time", quarterly: "quarterly", monthly: "monthly" };
  var GROUND = { bare: "bare ground", remove: "existing sod to remove" };

  /* one figure, or a range once the office sets a spread; never below a minimum */
  var fig = function (q, rate, min) {
    var m = +min || 0, t = Math.max(q * rate, m), s = +P.spread || 0;
    return s > 0 ? usd(Math.max(t * (1 - s), m)) + "–" + usd(t * (1 + s)) : usd(t);
  };
  /* only computed numbers and fixed strings reach innerHTML — never visitor input */
  var say = function (out, q, rate, min, unit, name) {
    if (!q) { out.innerHTML = ""; return; }
    out.innerHTML = typeof rate === "number" && rate > 0
      ? '<span class="wt__fig"><b>' + fig(q, rate, min) + "</b><span>" + unit + "</span></span>"
      : '<span class="pe__tbc">' + name + " rates are being finalised — send the details and we will price it for you.</span>";
  };

  var deb;
  var update = function () {
    var panes = qty("pe-panes", 999), freq = pick("pe-freq") || "oneTime", inside = $("pe-inside").checked,
        sod = qty("pe-sod", 99999), ground = pick("pe-ground") || "bare", seal = qty("pe-seal", 99999),
        svc = [], scope = [];
    if (panes) {
      svc.push("window-ext"); if (inside) svc.push("window-int");
      scope.push("Window cleaning: " + n(panes) + " panes, " + FREQ[freq] + (inside ? ", inside and out" : ""));
    }
    if (sod) { svc.push("sod"); scope.push("Sod: " + n(sod) + " sq ft, " + GROUND[ground]); }
    if (seal) { svc.push("sandseal"); scope.push("Paver Sand & Seal: " + n(seal) + " sq ft"); }

    $("pe-cta").href = "free-quote.html" + (svc.length
      ? "?services=" + svc.join(",") + "&scope=" + encodeURIComponent("Price estimate — " + scope.join("; "))
      : "");

    /* inside glass is an add-on rate (0 if a pane price covers both sides);
       while it is unset the figure says it is outside only */
    var wr = W[freq], wu = freq === "oneTime" ? "estimated, one visit" : "estimated, per " + FREQ[freq] + " visit";
    if (inside) {
      if (typeof W.inside === "number" && typeof wr === "number") { wr += W.inside; wu += " · inside and out"; }
      else wu += " · outside glass; inside priced at the visit";
    }

    clearTimeout(deb);
    deb = setTimeout(function () {
      say($("pe-o-window"), panes, wr, W.min, wu, "Window cleaning");
      say($("pe-o-sod"), sod, S[ground], S.min, "estimated · " + GROUND[ground], "Sod");
      say($("pe-o-seal"), seal, Z.rate, Z.min, "estimated", "Paver Sand & Seal");
    }, 300);
  };
  root.addEventListener("input", update);
  root.addEventListener("change", update);
  update();
})();
