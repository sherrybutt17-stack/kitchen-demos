/* ============================================================================
   SAPPHIRE — smile-studio.js
   THE SMILE STUDIO: whitening simulated live, on real patient photography.

   Why this is photo-real rather than a drawn illustration:
     The practice publishes ten genuine before/after cases. Because each case is a
     PAIR, the tooth mask does not have to be hand-traced onto one photograph —
     it is derived offline from the before->after difference plus a luminance and
     redness gate, then shipped as a greyscale image beside the pair. So the mask
     is a measurement of the case, not an artist's guess about it, and re-shooting
     a case regenerates its mask rather than breaking it.

   What is simulated and what is real, kept strictly apart:
     · the whitening slider SHADES THE BEFORE PHOTO in the shader. It is labelled
       a simulation everywhere it appears and it never claims a VITA shade number,
       because you cannot honestly measure an absolute shade through an unknown
       white balance.
     · "the actual result" cross-fades to the REAL clinical after photograph.
       Nothing about that side is generated.
     A tool that blurred those two would be the one thing dental advertising rules
     exist to police. Keeping them separate is what makes the feature shippable.

   The canvas is aria-hidden and only ever DRAWS. Every piece of state lives in a
   real form control beside it, which is what makes the whole feature
   keyboard-operable with no parallel implementation.
   SOURCE OF TRUTH — inlined into every page by scripts/build.py
   ========================================================================= */
(function () {
  "use strict";

  var stage = document.getElementById("ss-stage");
  if (!stage) return;
  var cv = document.getElementById("ss-cv");
  if (!cv) return;
  var gl = null;
  try {
    gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false })
      || cv.getContext("experimental-webgl", { alpha: false, antialias: false, depth: false });
  } catch (e) { gl = null; }
  if (!gl) return;                    /* no WebGL -> the static fallback pair stays */

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- 1. Shaders ---------- */
  var VS =
    "attribute vec2 p;varying vec2 v;" +
    "void main(){v=p*0.5+0.5;gl_Position=vec4(p,0.0,1.0);}";

  /* The whitening transform is the same one that was validated offline against the
     real clinical after: pull the enamel toward neutral, then lift it toward white
     weighted by its own luminance so the shading and texture of the tooth survive
     instead of flattening into a white paste. */
  var FS =
    "precision mediump float;varying vec2 v;" +
    "uniform sampler2D uB,uA,uM;" +
    "uniform vec2 uSc;uniform float uWhiten,uReveal,uWipe,uSeat;" +
    "vec3 whiten(vec3 c,float amt){" +
      "float L=dot(c,vec3(0.2126,0.7152,0.0722));" +
      "float mx=max(max(c.r,c.g),c.b),mn=min(min(c.r,c.g),c.b);" +
      "float lum=(mx+mn)*0.5;" +
      "vec3 o=mix(c,vec3(L),0.72);" +
      "o=o+(1.0-o)*(0.62*(0.35+0.65*lum));" +
      "return clamp(mix(c,o,amt),0.0,1.0);}" +
    "void main(){" +
      "vec2 uv=(v-0.5)*uSc+0.5;" +
      "uv.y=1.0-uv.y;" +
      "if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){gl_FragColor=vec4(0.055,0.153,0.192,1.0);return;}" +
      "vec3 b=texture2D(uB,uv).rgb;" +
      "vec3 a=texture2D(uA,uv).rgb;" +
      "float m=texture2D(uM,uv).r;" +
      /* simulated side: shade the before photo inside the mask only */
      "vec3 sim=mix(b,whiten(b,uWhiten),m);" +
      /* then cross-fade the whole frame to the genuine clinical after */
      "vec3 live=mix(sim,a,uReveal);" +
      /* the divider: left of the seam is untouched today, right is the live state */
      "float w=step(uWipe,v.x);" +
      "vec3 col=mix(b,live,w);" +
      /* one-shot entrance: the frame lifts out of the deep sapphire ground */
      "col=mix(vec3(0.055,0.153,0.192),col,uSeat);" +
      "gl_FragColor=vec4(col,1.0);}";

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  var pLoc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(pLoc);
  gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ["uB","uA","uM","uSc","uWhiten","uReveal","uWipe","uSeat"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* ---------- 2. Textures ---------- */
  /* Non-power-of-two photographs: CLAMP_TO_EDGE + LINEAR, no mipmaps. Anything
     else and WebGL silently renders black. */
  function mkTex(unit) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
                  new Uint8Array([10, 20, 60]));
    return t;
  }
  var TEX = { B: mkTex(0), A: mkTex(1), M: mkTex(2) };
  gl.uniform1i(U.uB, 0); gl.uniform1i(U.uA, 1); gl.uniform1i(U.uM, 2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  function upload(tex, unit, img) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  }

  /* ---------- 3. Cases ---------- */
  /* Labels describe only what is VISIBLE in each photograph. They deliberately do
     not assert which procedure that patient received — the plan readout responds to
     the visitor's own selections instead, so nothing is claimed on a real patient's
     behalf. */
  var cases = $$("[data-ss-case]").map(function (n) {
    return { key: n.getAttribute("data-ss-case"),
             b: $("[data-ss-b]", n), a: $("[data-ss-a]", n), m: $("[data-ss-m]", n),
             ar: parseFloat(n.getAttribute("data-ss-ar")) || 1.6615 };
  });
  if (!cases.length) return;
  var current = cases[0];

  /* The case textures ship as loading="lazy" so the three cases nobody opens are
     never fetched. But they live in a 1px clipped box, which means the lazy loader
     has no viewport proximity to react to and would never start them at all. So the
     moment a case is actually needed, promote just that case's images to eager —
     which is what starts the fetch — and only then wait on them. Marking them eager
     in the markup instead would pull all twelve down on every visit. */
  function whenReady(imgs, cb) {
    var left = imgs.length;
    if (!left) return cb();
    imgs.forEach(function (im) {
      if (!im) { if (!--left) cb(); return; }
      if (im.complete && im.naturalWidth) { if (!--left) cb(); return; }
      im.addEventListener("load", function () { if (!--left) cb(); }, { once: true });
      im.addEventListener("error", function () { if (!--left) cb(); }, { once: true });
      if (im.getAttribute("loading") === "lazy") {
        im.loading = "eager";
        if (!im.complete) { var s = im.getAttribute("src"); if (s) im.src = s; }
      }
    });
  }

  function loadCase(c) {
    whenReady([c.b, c.a, c.m], function () {
      if (!c.b || !c.b.naturalWidth) return;
      upload(TEX.B, 0, c.b);
      upload(TEX.A, 1, c.a && c.a.naturalWidth ? c.a : c.b);
      upload(TEX.M, 2, c.m && c.m.naturalWidth ? c.m : c.b);
      current = c; fit(); dirty = true; kick();
      stage.setAttribute("data-ready", "true");
      if (controls) controls.removeAttribute("hidden");
    });
  }

  /* ---------- 4. Fit / DPR ---------- */
  var cw = 0, ch = 0, dpr = 1;
  function fit() {
    var r = stage.getBoundingClientRect();
    cw = Math.max(1, r.width); ch = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);   /* 3x phones cap at 2 */
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    /* cover-fit: scale the sampled UV rect so the photo fills the stage */
    var stageAR = cw / ch, imgAR = current.ar, sx = 1, sy = 1;
    if (stageAR > imgAR) { sy = imgAR / stageAR; } else { sx = stageAR / imgAR; }
    gl.uniform2f(U.uSc, sx, sy);
  }

  /* ---------- 5. State ---------- */
  var S = { wipe: 0.5, whiten: 0, reveal: 0, anx: false, seat: reduced ? 1 : 0 };
  var A = { wipe: 0.5, whiten: 0, reveal: 0, seat: reduced ? 1 : 0 };
  var dirty = true, running = false, onScreen = false, seated = reduced, demo = null;

  function converge() {
    var moving = false, k = 0.16, keys = ["wipe", "whiten", "reveal", "seat"];
    for (var i = 0; i < keys.length; i++) {
      var n = keys[i], d = S[n] - A[n];
      if (Math.abs(d) > 0.0008) { A[n] += d * k; moving = true; } else { A[n] = S[n]; }
    }
    return moving;
  }

  function draw() {
    gl.uniform1f(U.uWipe, A.wipe);
    gl.uniform1f(U.uWhiten, A.whiten);
    gl.uniform1f(U.uReveal, A.reveal);
    gl.uniform1f(U.uSeat, A.seat);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (seam) seam.style.setProperty("--p", (A.wipe * 100).toFixed(2) + "%");
  }

  function frame() {
    if (!running) return;
    var moving = converge();
    if (dirty || moving) { draw(); dirty = false; }
    if (moving) requestAnimationFrame(frame); else running = false;   /* park at rest */
  }
  function kick() {
    if (reduced) { A.wipe = S.wipe; A.whiten = S.whiten; A.reveal = S.reveal; A.seat = 1; draw(); return; }
    if (!running && onScreen) { running = true; requestAnimationFrame(frame); }
    else if (!onScreen) { draw(); }
  }

  /* ---------- 6. Controls — every one a real form element ---------- */
  var controls = document.getElementById("ss-controls");
  var seam   = $(".ss__seam", stage);
  var wipeEl = document.getElementById("ss-wipe");
  var whEl   = document.getElementById("ss-whiten");
  var rvEl   = document.getElementById("ss-reveal");
  var anxEl  = document.getElementById("ss-anx");
  var planEl = document.getElementById("ss-plan");
  var ctaEl  = document.getElementById("ss-cta");
  var resetEl= document.getElementById("ss-reset");

  function stopDemo() { if (demo) { clearTimeout(demo); demo = null; } }
  if (wipeEl) wipeEl.addEventListener("input", function () {
    stopDemo(); S.wipe = wipeEl.value / 100; dirty = true; kick();
  });
  if (whEl) whEl.addEventListener("input", function () {
    stopDemo(); S.whiten = whEl.value / 100; dirty = true; kick(); plan();
  });
  if (rvEl) rvEl.addEventListener("click", function () {
    stopDemo();
    var on = rvEl.getAttribute("aria-pressed") === "true";
    rvEl.setAttribute("aria-pressed", on ? "false" : "true");
    S.reveal = on ? 0 : 1; dirty = true; kick(); plan();
  });
  if (anxEl) anxEl.addEventListener("change", function () { S.anx = anxEl.checked; plan(); });
  $$(".ss__case").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".ss__case").forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      var k = b.getAttribute("data-case");
      for (var i = 0; i < cases.length; i++) if (cases[i].key === k) { loadCase(cases[i]); break; }
    });
  });
  if (resetEl) resetEl.addEventListener("click", function () {
    S.wipe = 0.5; S.whiten = 0; S.reveal = 0; S.anx = false;
    if (wipeEl) wipeEl.value = 50;
    if (whEl) whEl.value = 0;
    if (rvEl) rvEl.setAttribute("aria-pressed", "false");
    if (anxEl) anxEl.checked = false;
    dirty = true; kick(); plan();
  });

  /* ---------- 7. The plan readout ---------- */
  /* <output> is implicitly role="status" aria-live="polite", so this is announced
     without a hand-rolled live region. Debounced, because dragging a slider must
     not fire a hundred announcements. */
  var planT = null;
  function plan() { clearTimeout(planT); planT = setTimeout(writePlan, 260); }
  function writePlan() {
    if (!planEl) return;
    var wh = S.whiten > 0.08, rv = S.reveal > 0.5, name, who, body;
    if (rv && wh)      { name = "Porcelain veneers, with whitening first";
                         who  = "Dr. Yoo Jin Chung · Prosthodontist";
                         body = "Existing teeth are brightened first so the porcelain is matched to the shade you actually want to keep."; }
    else if (rv)       { name = "Porcelain veneers or bonded restorations";
                         who  = "Dr. Yoo Jin Chung · Prosthodontist";
                         body = "Shape, length and alignment are corrected together. This is the real outcome from a Sapphire Dental Studio case."; }
    else if (wh)       { name = "Professional whitening";
                         who  = "Dr. Yoo Jin Chung · Prosthodontist";
                         body = "In-office whitening lifts intrinsic staining that no toothpaste reaches. Usually one visit."; }
    else               { name = "Start with a full diagnostic exam";
                         who  = "Dr. Curtis Dugas · Board-certified Periodontist";
                         body = "Every plan starts with health: gums, bone and bite are assessed on CBCT before anything cosmetic is discussed."; }
    var extra = "";
    if (S.anx) {
      extra = '<p class="who">Plus: IV sedation — Dr. Michael Walbom</p>' +
              "<p>Sedation is handled in-house by a dentist anesthesiologist whose only job that day is your comfort — not by the dentist doing the treatment.</p>";
      if (ctaEl) { ctaEl.textContent = "Book a sedation consult"; ctaEl.setAttribute("href", "book-appointment.html?c=sedation"); }
    } else if (ctaEl) {
      ctaEl.textContent = "Book your smile consult"; ctaEl.setAttribute("href", "book-appointment.html");
    }
    planEl.innerHTML = "<b>" + name + '</b><p class="who">' + who + "</p><p>" + body + "</p>" + extra;
  }
  writePlan();

  /* ---------- 8. Run: IO gate, ResizeObserver, reduced motion ---------- */
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { fit(); dirty = true; kick(); }).observe(stage);
  } else {
    window.addEventListener("resize", function () { fit(); dirty = true; kick(); });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        onScreen = en.isIntersecting;
        if (onScreen && !seated) {
          seated = true; S.seat = 1;
          /* One-shot entrance: reveal the genuine result on its own. With nothing
             applied both halves of the divider are the same photograph, so the
             widget arrives looking inert and nobody touches it. Letting the real
             outcome fade in once demonstrates what the control does, and leaves the
             button in the pressed state it actually represents. */
          demo = setTimeout(function () {
            if (S.reveal) return;                 /* the visitor got there first */
            S.reveal = 1;
            if (rvEl) rvEl.setAttribute("aria-pressed", "true");
            dirty = true; kick(); plan();
          }, 900);
        }
        if (onScreen) { dirty = true; kick(); }
      });
    }, { threshold: 0.02 }).observe(stage);
  } else { onScreen = true; seated = true; S.seat = 1; }

  loadCase(cases[0]);
})();
