/* OBSIDIAN — kitchen3d.js
   A real WebGL 3D kitchen. No Three.js, no library, no model files: the room is
   built from procedural geometry and shaded with procedural stone/timber, so the
   whole thing is ~14KB and drops into a GHL Custom HTML block untouched.

   · perspective camera, orbits on drag / swipe, drifts on its own when idle
   · scroll drives a dolly + reveal so the room assembles as you descend
   · three selectable countertop materials, cross-faded in the fragment shader
   · falls back to a still photograph without WebGL or under reduced-motion
*/
(function () {
  "use strict";

  var host = document.getElementById("k3d");
  if (!host) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function bail() { host.setAttribute("data-fallback", "true"); }
  if (reduced) return bail();

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);

  var gl = canvas.getContext("webgl", { antialias: true, alpha: true, powerPreference: "high-performance" })
        || canvas.getContext("experimental-webgl");
  if (!gl) { canvas.remove(); return bail(); }

  /* ───────────────────────── matrix maths ───────────────────────── */
  function m4() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      o[i*4+j] = a[i*4]*b[j] + a[i*4+1]*b[4+j] + a[i*4+2]*b[8+j] + a[i*4+3]*b[12+j];
    }
    return o;
  }
  function persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function lookAt(e, c, u) {
    var z = norm([e[0]-c[0], e[1]-c[1], e[2]-c[2]]);
    var x = norm(cross(u, z)), y = cross(z, x);
    return new Float32Array([
      x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0,
      -(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]), -(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]), -(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]), 1
    ]);
  }
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];}
  function norm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
  function trs(tx,ty,tz,sx,sy,sz){
    var m = m4(); m[0]=sx; m[5]=sy; m[10]=sz; m[12]=tx; m[13]=ty; m[14]=tz; return m;
  }

  /* ───────────────────────── shaders ───────────────────────── */
  var VS = [
    "attribute vec3 aPos; attribute vec3 aNor;",
    "uniform mat4 uProj, uView, uModel;",
    "varying vec3 vN, vW;",
    "void main(){",
    "  vec4 w = uModel * vec4(aPos,1.0);",
    "  vW = w.xyz;",
    /* uniform scaling only, so the model matrix works for normals directly */
    "  vN = normalize(mat3(uModel) * aNor);",
    "  gl_Position = uProj * uView * w;",
    "}"
  ].join("\n");

  var FS = [
    "precision highp float;",
    "varying vec3 vN, vW;",
    "uniform vec3 uBase, uCam, uKey, uRim;",
    "uniform float uMat;",      /* 0 flat · 1 stone · 2 timber · 3 cabinetry · 4 emissive */
    "uniform float uBlend;",    /* stone variant cross-fade 0..1 */
    "uniform vec3 uStoneA, uStoneB;",
    "uniform vec3 uP1, uP2;",   /* the two pendants, as real point lights */
    "uniform vec2 uRes;",       /* drawing-buffer size, for the vignette */
    "uniform float uRough, uReveal, uT;",

    /* value noise + fbm */
    "float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }",
    "float n2(vec2 p){",
    "  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  for(int i=0;i<5;i++){ v += a*n2(p); p *= 2.03; a *= 0.5; }",
    "  return v;",
    "}",

    /* pick UVs from the dominant face axis so vertical panels don't stripe */
    "vec2 faceUV(vec3 p, vec3 n){",
    "  vec3 a = abs(n);",
    "  if(a.y > a.x && a.y > a.z) return p.xz;",   /* worktops, floor */
    "  if(a.x > a.z)              return p.zy;",   /* waterfall ends */
    "  return p.xy;",                              /* splashback, fronts */
    "}",

    /* one warm point light, inverse-square — this is what makes the pendants read */
    "vec3 pend(vec3 P, vec3 N, vec3 W){",
    "  vec3 D = P - W; float d = length(D);",
    "  return vec3(1.0,0.80,0.55) * max(dot(N, D/d), 0.0) * (1.85 / (1.0 + d*d*0.95));",
    "}",

    /* slab intersection — the one primitive the whole room is built from, so one test
       serves both the floor reflection and the shadowing below */
    "float boxHit(vec3 o, vec3 r, vec3 c, vec3 e){",
    "  vec3 inv = 1.0 / r;",
    "  vec3 t0 = (c - e - o) * inv, t1 = (c + e - o) * inv;",
    "  vec3 lo = min(t0,t1), hi = max(t0,t1);",
    "  float near = max(max(lo.x, lo.y), lo.z);",
    "  float far  = min(min(hi.x, hi.y), hi.z);",
    "  return (far > max(near, 0.0)) ? near : -1.0;",
    "}",
    "float hitIsland(vec3 o, vec3 r){ return boxHit(o, r, vec3(0.0,0.50,0.15), vec3(1.58,0.52,0.64)); }",

    /* Cast the key light back through the two big masses. Flat lighting is the single
       biggest reason a real-time room reads as a model rather than a photograph. */
    "float shade(vec3 p, vec3 N, vec3 L){",
    "  float s = 1.0;",
    "  vec3 o = p + N * 0.07 + L * 0.02;",
    "  if(boxHit(o, L, vec3(0.0, 0.50,  0.15), vec3(1.56,0.50,0.62)) > 0.0) s *= 0.52;",
    "  if(boxHit(o, L, vec3(0.0, 0.50, -2.16), vec3(2.18,0.43,0.31)) > 0.0) s *= 0.62;",
    "  if(boxHit(o, L, vec3(2.79, 1.16, -2.28), vec3(0.63,1.10,0.29)) > 0.0) s *= 0.62;",
    "  return s;",
    "}",

    /* filmic curve — raw linear output is what makes WebGL look flat and plasticky */
    "vec3 aces(vec3 x){",
    "  return clamp((x*(2.51*x + 0.03)) / (x*(2.43*x + 0.59) + 0.14), 0.0, 1.0);",
    "}",

    "void main(){",
    "  vec3 N = normalize(vN);",
    "  vec3 V = normalize(uCam - vW);",
    "  vec3 col = uBase;",
    "  float rough = uRough;",
    "  float emis = 0.0;",

    /* ---- procedural stone: fine directional veining, book-matched about x ---- */
    "  if(uMat > 0.5 && uMat < 1.5){",
    "    vec2 uv = faceUV(vec3(abs(vW.x), vW.y, vW.z), N);",
    /* Real Calacatta is a quiet field crossed by a few thin, near-parallel diagonals.
       Warping a banded coordinate only gently is what keeps it from going to camouflage. */
    "    float warp = fbm(uv*1.25)*0.62 + fbm(uv*3.1)*0.16;",
    "    float band = uv.x*0.80 + uv.y*0.42 + warp*1.25;",
    "    float v1   = abs(fract(band*1.35) - 0.5);",
    "    float vein = 1.0 - smoothstep(0.008, 0.055, v1);",
    "    float v2   = abs(fract(band*3.70 + 0.37) - 0.5);",
    "    float hair = (1.0 - smoothstep(0.004, 0.022, v2)) * 0.45;",
    "    float cloud = (fbm(uv*2.2) - 0.5) * 0.045;",
    "    float grain = (fbm(uv*30.0) - 0.5) * 0.012;",
    "    vec3 stone = mix(uStoneA, uStoneB, uBlend) + cloud + grain;",
    /* veins read as a tinted grey drawn over the field, never as a second colour */
    "    vec3 vc = mix(stone, stone*0.55 + vec3(0.055,0.050,0.044), 0.85);",
    "    col = mix(stone, vc, clamp(vein + hair, 0.0, 1.0) * 0.80);",
    "    rough = 0.14;",
    "  }",

    /* ---- procedural timber: fine stretched grain ---- */
    "  else if(uMat > 1.5 && uMat < 2.5){",
    "    vec2 uv = faceUV(vW, N);",
    "    float g = fbm(vec2(uv.x*30.0, uv.y*1.1));",
    "    float rings = fract(g*5.0);",
    "    float fine = n2(vec2(uv.x*190.0, uv.y*2.6))*0.05;",
    "    col = uBase * (0.80 + rings*0.26 + fine);",
    "    rough = 0.52;",
    "  }",

    /* ---- cabinetry: shadow gaps between doors + a copper bar pull ---- */
    "  else if(uMat > 2.5 && uMat < 3.5){",
    "    vec2 uv = faceUV(vW, N);",
    "    float seam = abs(fract(uv.x/0.62 + 0.5) - 0.5);",
    "    col = uBase * (1.0 - smoothstep(0.052, 0.0, seam)*0.78);",
    "    float bar = smoothstep(0.016, 0.004, abs(uv.y - 0.74)) * step(0.13, seam);",
    "    col = mix(col, vec3(0.62,0.38,0.17), bar*0.92);",
    "    rough = mix(0.30, 0.14, bar);",
    "  }",

    /* ---- emissive: the pendant shades themselves ---- */
    "  else if(uMat > 3.5){ emis = 1.0; }",

    /* ---- lighting: key + fill + two pendants + copper rim ---- */
    "  vec3 L = normalize(uKey);",
    "  float lam = max(dot(N, L), 0.0);",
    "  vec3 H = normalize(L + V);",
    "  float spec = pow(max(dot(N, H), 0.0), mix(160.0, 8.0, rough)) * (1.0 - rough);",
    "  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);",
    "  float fill = 0.34 + 0.26 * max(dot(N, vec3(-0.4, 0.7, 0.55)), 0.0);",
    "  vec3 pl = pend(uP1, N, vW) + pend(uP2, N, vW);",
    "  vec3 wd = vec3(3.80, 1.62, -0.35) - vW; float wl = length(wd);",
    "  pl += vec3(0.62,0.72,0.88) * max(dot(N, wd/wl), 0.0) * (3.4 / (1.0 + wl*wl*0.20));",

    /* contact occlusion — surfaces darken toward the floor and into the back corner */
    "  float ao = (0.62 + 0.38*smoothstep(0.0, 0.62, vW.y))",
    "           * (0.80 + 0.20*smoothstep(-2.62, -1.85, vW.z));",

    "  float sh = shade(vW, N, L);",
    "  vec3 lit = col * (fill + lam*1.15*sh + pl) * ao",
    "           + vec3(1.0,0.94,0.86)*spec*0.95*sh + uRim*fres*0.55;",

    /* polished floor: mirror the island back at the viewer */
    "  if(N.y > 0.92 && vW.y < 0.05){",
    "    vec3 R = reflect(-V, N);",
    "    float d = hitIsland(vW, R);",
    "    float sharp = smoothstep(7.0, 1.0, length(vW.xz - vec2(0.0,0.15)));",
    "    if(d > 0.0) lit += vec3(0.40,0.30,0.22) * sharp * 0.30;",
    "    lit += vec3(0.30,0.22,0.15) * pow(max(dot(R, normalize(uP1-vW)),0.0), 22.0) * 0.9;",
    "  }",

    "  lit = mix(lit, vec3(1.0,0.86,0.66)*1.45, emis);",

    /* the set fades toward black at distance so it reads as infinite, not as a box */
    "  float fog = smoothstep(12.0, 2.0, length(vW.xz));",
    "  lit *= mix(0.10, 1.0, fog);",

    /* scroll reveal: the room rises out of darkness */
    "  lit *= smoothstep(-0.2, 1.0, uReveal - (vW.y * -0.06));",

    /* grade: filmic curve, then a lens vignette. Both are what separate a render
       from a viewport, and together they cost about six instructions. */
    "  lit = aces(lit * 2.35);",
    "  vec2 q = gl_FragCoord.xy / uRes;",
    "  lit *= 0.80 + 0.20 * pow(16.0 * q.x * q.y * (1.0-q.x) * (1.0-q.y), 0.30);",

    "  gl_FragColor = vec4(lit, 1.0);",
    "}"
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { canvas.remove(); return bail(); }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return bail(); }
  gl.useProgram(prog);

  var A = {
    pos: gl.getAttribLocation(prog, "aPos"),
    nor: gl.getAttribLocation(prog, "aNor")
  };
  var U = {};
  ["uProj","uView","uModel","uBase","uCam","uKey","uRim","uMat","uBlend",
   "uStoneA","uStoneB","uRough","uReveal","uT","uP1","uP2","uRes"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* ───────────────────────── geometry: one unit cube ───────────────────────── */
  var F = [ /* +X */ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ];
  var CORNER = [
    [[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]],
    [[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]],
    [[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]],
    [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],
    [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],
    [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]
  ];
  var pos = [], nor = [];
  for (var f = 0; f < 6; f++) {
    var c = CORNER[f], n = F[f];
    [0,1,2, 0,2,3].forEach(function (k) {
      pos.push(c[k][0], c[k][1], c[k][2]);
      nor.push(n[0], n[1], n[2]);
    });
  }
  function buf(data) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return b;
  }
  var bPos = buf(pos), bNor = buf(nor), COUNT = pos.length / 3;

  /* ───────────────────────── the kitchen ─────────────────────────
     Units are metres. y = 0 is the floor.
     mat: 0 flat lacquer · 1 stone · 2 timber                              */
  var DARK   = [0.085, 0.083, 0.082];
  var DARKER = [0.058, 0.057, 0.057];
  var TIMBER = [0.20, 0.125, 0.072];
  var STEEL  = [0.34, 0.35, 0.36];

  var parts = [];
  function part(x,y,z, w,h,d, base, mat, rough) {
    parts.push({ m: trs(x,y,z, w,h,d), base: base, mat: mat, rough: rough === undefined ? 0.6 : rough });
  }

  /* the shell — floor, back wall, two returns and a ceiling. Without the enclosure
     the joinery floats in a void and the whole thing reads as a model, not a room. */
  part(0, -0.02, 0,      16, 0.04, 16, [0.075,0.055,0.040], 2, 0.30);
  part(0, 1.7, -2.62,    9.2, 3.4, 0.12, DARKER, 0, 0.85);
  part(-4.0, 1.7, -0.4,  0.12, 3.4, 4.6, DARKER, 0, 0.85);
  part( 4.0, 1.7, -0.4,  0.12, 3.4, 4.6, DARKER, 0, 0.85);
  part(0, 3.42, -0.4,    9.2, 0.12, 4.6, [0.055,0.054,0.054], 0, 0.9);

  /* run of base cabinets along the back wall, on a recessed plinth */
  part(0, 0.05, -2.20,   4.30, 0.10, 0.50, [0.03,0.03,0.03], 0, 0.9);
  for (var i = -3; i <= 3; i++) {
    part(i * 0.62, 0.50, -2.16, 0.60, 0.80, 0.62, DARK, 3, 0.34);
  }
  /* worktop over the run */
  part(0, 0.925, -2.16,  4.36, 0.05, 0.66, [1,1,1], 1, 0.1);
  /* splashback, full height to the wall cabinets */
  part(0, 1.30, -2.50,   4.36, 0.70, 0.03, [1,1,1], 1, 0.1);

  /* wall cabinets, split around the hood */
  for (var w2 = 0; w2 < 4; w2++) {
    var sx = (w2 < 2 ? -1 : 1) * (0.62 + (w2 % 2) * 0.62);
    part(sx, 2.06, -2.30, 0.60, 0.78, 0.36, DARK, 3, 0.34);
  }
  /* a slim shelf under the wall units catches the pendant light */
  part(-1.24, 1.65, -2.34, 1.86, 0.03, 0.30, [0.42,0.27,0.13], 0, 0.2);
  part( 1.24, 1.65, -2.34, 1.86, 0.03, 0.30, [0.42,0.27,0.13], 0, 0.2);

  /* extractor hood */
  part(0, 2.14, -2.32,   0.94, 0.46, 0.44, STEEL, 0, 0.18);
  part(0, 2.56, -2.44,   0.40, 0.62, 0.24, STEEL, 0, 0.18);
  /* range */
  part(0, 0.46, -2.16,   0.88, 0.84, 0.64, [0.11,0.11,0.12], 0, 0.26);
  part(0, 0.90, -1.90,   0.80, 0.04, 0.06, STEEL, 0, 0.14);   /* handle rail */

  /* tall units, right */
  part(2.48, 1.16, -2.28, 0.62, 2.24, 0.62, DARKER, 3, 0.34);
  part(3.10, 1.16, -2.28, 0.62, 2.24, 0.62, DARKER, 3, 0.34);

  /* the island — plinth, carcass, slab, waterfall ends */
  part(0, 0.05, 0.15,    2.70, 0.10, 0.92, [0.03,0.03,0.03], 0, 0.9);
  part(0, 0.50, 0.15,    2.90, 0.80, 1.05, DARK, 3, 0.34);
  part(0, 0.92, 0.15,    3.12, 0.09, 1.24, [1,1,1], 1, 0.06);
  part(-1.50, 0.46, 0.15, 0.09, 0.92, 1.24, [1,1,1], 1, 0.06);
  part( 1.50, 0.46, 0.15, 0.09, 0.92, 1.24, [1,1,1], 1, 0.06);

  /* three stools — seat, column, weighted base */
  for (var s = -1; s <= 1; s++) {
    part(s * 0.80, 0.66, 1.05, 0.36, 0.07, 0.36, TIMBER, 2, 0.45);
    part(s * 0.80, 0.34, 1.05, 0.05, 0.58, 0.05, STEEL, 0, 0.22);
    part(s * 0.80, 0.03, 1.05, 0.30, 0.03, 0.30, STEEL, 0, 0.22);
  }

  /* A window on the left return. Emissive, so it reads as the daylight source the
     key light implies — and it stops that wall being a dead black plane. */
  part( 3.93, 1.62, -0.35, 0.04, 1.86, 2.40, [0.90, 0.94, 1.00], 4, 0.1);
  part( 3.88, 1.62, -0.35, 0.06, 2.00, 2.56, [0.05,0.05,0.05], 0, 0.5);  /* reveal */
  part( 3.86, 1.62, -0.35, 0.05, 0.04, 2.40, [0.10,0.10,0.10], 0, 0.4);  /* glazing bar */

  /* Objects. A kitchen with nothing on the counters always looks like a showroom model. */
  part(-1.55, 0.905, -2.16, 0.62, 0.03, 0.42, [0.04,0.04,0.05], 0, 0.30);  /* sink basin */
  part(-1.55, 1.06,  -2.34, 0.03, 0.30, 0.03, STEEL, 0, 0.16);             /* tap column */
  part(-1.47, 1.20,  -2.28, 0.19, 0.03, 0.03, STEEL, 0, 0.16);             /* tap spout */
  part( 0.62, 0.98,   0.15, 0.30, 0.09, 0.30, [0.55,0.34,0.16], 0, 0.22);  /* copper bowl */
  part(-0.72, 1.00,   0.15, 0.09, 0.24, 0.09, [0.16,0.17,0.18], 0, 0.20);  /* bottle */
  part(-0.55, 0.97,   0.20, 0.22, 0.02, 0.34, TIMBER, 2, 0.5);             /* board */
  part( 1.72, 0.99,  -2.16, 0.16, 0.18, 0.16, [0.30,0.31,0.32], 0, 0.25);  /* canister */
  part( 1.94, 0.97,  -2.16, 0.13, 0.14, 0.13, [0.24,0.25,0.26], 0, 0.25);
  /* pendants over the island — the shades are emissive and light the slab */
  for (var p2 = -1; p2 <= 1; p2 += 2) {
    part(p2 * 0.62, 2.60, 0.15, 0.02, 0.92, 0.02, STEEL, 0, 0.3);
    part(p2 * 0.62, 2.06, 0.15, 0.28, 0.16, 0.28, [0.85,0.60,0.32], 4, 0.18);
  }

  /* ───────────────────────── surfaces the visitor can pick ───────────────── */
  var STONES = {
    calacatta: { a: [0.46,0.45,0.435], b: [0.55,0.54,0.52] },
    /* Nero Marquina — near-black with bright white veining. Replaced Rosso Bordeaux:
       the client wants no red anywhere on this site. */
    nero:      { a: [0.030,0.030,0.033], b: [0.055,0.056,0.062] },
    copperOre: { a: [0.155,0.088,0.050], b: [0.235,0.130,0.068] }
  };
  var stoneA = STONES.calacatta.a.slice(), stoneB = STONES.calacatta.b.slice();
  var stoneTargetA = stoneA.slice(), stoneTargetB = stoneB.slice();

  window.OBSIDIAN_SET_STONE = function (key) {
    var s = STONES[key] || STONES.calacatta;
    stoneTargetA = s.a.slice(); stoneTargetB = s.b.slice();
  };

  /* ───────────────────────── camera + input ───────────────────────── */
  var yaw = -0.62, pitch = 0.20, targetYaw = yaw, targetPitch = pitch;
  var dist = 7.4, reveal = 0, revealTarget = 0;
  var dragging = false, lastX = 0, lastY = 0, idle = 0;

  function down(e) {
    dragging = true; idle = 0;
    lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    lastY = (e.touches ? e.touches[0].clientY : e.clientY);
  }
  function move(e) {
    if (!dragging) return;
    var x = (e.touches ? e.touches[0].clientX : e.clientX);
    var y = (e.touches ? e.touches[0].clientY : e.clientY);
    targetYaw   += (x - lastX) * 0.006;
    targetPitch += (y - lastY) * 0.003;
    targetPitch = Math.max(-0.05, Math.min(0.55, targetPitch));
    lastX = x; lastY = y;
    if (e.touches) e.preventDefault();      /* only while actually dragging */
  }
  function up() { dragging = false; }

  canvas.addEventListener("mousedown", down);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  canvas.addEventListener("touchstart", down, { passive: true });
  canvas.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", up);

  /* keyboard orbit for accessibility */
  host.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft")  { targetYaw -= 0.12; e.preventDefault(); }
    if (e.key === "ArrowRight") { targetYaw += 0.12; e.preventDefault(); }
    if (e.key === "ArrowUp")    { targetPitch = Math.min(0.55, targetPitch + 0.06); e.preventDefault(); }
    if (e.key === "ArrowDown")  { targetPitch = Math.max(-0.05, targetPitch - 0.06); e.preventDefault(); }
  });

  /* ───────────────────────── resize ───────────────────────── */
  var W = 1, H = 1, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  /* ───────────────────────── scroll linkage ───────────────────────── */
  var onScreen = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; },
      { rootMargin: "15% 0px" }).observe(host);
  } else { onScreen = true; }

  function scrollDrive() {
    var r = host.getBoundingClientRect();
    var vh = window.innerHeight;
    /* 0 while entering, 1 once settled in view */
    revealTarget = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.75)));
    /* dolly in slightly as the section is traversed */
    var t = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / (r.height || 1)));
    dist = 7.6 - t * 1.9;
  }

  /* ───────────────────────── render ───────────────────────── */
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
  gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, bNor);
  gl.enableVertexAttribArray(A.nor); gl.vertexAttribPointer(A.nor, 3, gl.FLOAT, false, 0, 0);

  var t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!onScreen || !W || !H) return;

    var t = (now - t0) / 1000;
    scrollDrive();

    /* idle drift so the room is never completely static */
    if (!dragging) { idle += 0.016; targetYaw += Math.sin(t * 0.22) * 0.00035; }
    yaw   += (targetYaw - yaw) * 0.075;
    pitch += (targetPitch - pitch) * 0.075;
    reveal += (revealTarget - reveal) * 0.055;

    for (var c = 0; c < 3; c++) {
      stoneA[c] += (stoneTargetA[c] - stoneA[c]) * 0.06;
      stoneB[c] += (stoneTargetB[c] - stoneB[c]) * 0.06;
    }

    var ex = Math.sin(yaw) * Math.cos(pitch) * dist;
    var ey = 1.55 + Math.sin(pitch) * dist * 0.78;
    var ez = Math.cos(yaw) * Math.cos(pitch) * dist;

    var proj = persp(0.78, W / H, 0.1, 60);
    var view = lookAt([ex, ey, ez], [0, 1.12, -0.45], [0, 1, 0]);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniformMatrix4fv(U.uView, false, view);
    gl.uniform3f(U.uCam, ex, ey, ez);
    gl.uniform3f(U.uKey, -0.35, 0.9, 0.45);
    gl.uniform3f(U.uP1, -0.62, 1.92, 0.15);
    gl.uniform3f(U.uP2,  0.62, 1.92, 0.15);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform3f(U.uRim, 0.72, 0.45, 0.20);      /* copper rim */
    gl.uniform1f(U.uReveal, reveal);
    gl.uniform1f(U.uT, t);
    gl.uniform3fv(U.uStoneA, stoneA);
    gl.uniform3fv(U.uStoneB, stoneB);
    gl.uniform1f(U.uBlend, 0.5 + Math.sin(t * 0.15) * 0.12);

    for (var i2 = 0; i2 < parts.length; i2++) {
      var p = parts[i2];
      gl.uniformMatrix4fv(U.uModel, false, p.m);
      gl.uniform3fv(U.uBase, p.base);
      gl.uniform1f(U.uMat, p.mat);
      gl.uniform1f(U.uRough, p.rough);
      gl.drawArrays(gl.TRIANGLES, 0, COUNT);
    }
  }
  requestAnimationFrame(frame);

  host.setAttribute("data-live", "true");
})();
