// mock1 — shared scripts
// nav + progress + geo animations + TOC tracking
// Optimized: DOM attribute updates instead of innerHTML, visibility-aware rAF loops

(function() {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ─── nav + progress ───
  var nav = document.getElementById('site-nav');
  var prog = document.getElementById('read-progress');
  var tocProg = document.getElementById('toc-progress-bar');
  var cachedScrollHeight = 0;
  var cachedInnerHeight = 0;

  function updateScrollCache() {
    cachedScrollHeight = document.body.scrollHeight;
    cachedInnerHeight = window.innerHeight;
  }
  updateScrollCache();

  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        if (nav && window.innerWidth >= 768) nav.classList.toggle('scrolled', window.scrollY > 60);
        if (prog) {
          if (cachedScrollHeight > cachedInnerHeight) {
            var pct = window.scrollY / (cachedScrollHeight - cachedInnerHeight);
            prog.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
          }
        }
        if (tocProg) {
          if (cachedScrollHeight > cachedInnerHeight) {
            var pct2 = window.scrollY / (cachedScrollHeight - cachedInnerHeight);
            tocProg.style.height = (Math.min(100, Math.max(0, pct2 * 100))) + '%';
          }
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Re-cache on resize
  var resizeTicking = false;
  window.addEventListener('resize', function() {
    if (!resizeTicking) {
      requestAnimationFrame(function() {
        updateScrollCache();
        resizeTicking = false;
      });
      resizeTicking = true;
    }
  }, { passive: true });

  // ─── Adaptive quality: monitor fps, degrade effects if frame budget exceeded ───
  var qualityLevel = 0; // 0=none, 1=light, 2=medium, 3=heavy, 4=minimal
  var frameTimes = [];
  var lastPerfCheck = 0;
  var FPS_TARGET = 16; // ms per frame (60fps)

  function recordFrameTime(ms) {
    frameTimes.push(ms);
    if (frameTimes.length > 60) frameTimes.shift();
    var now = performance.now();
    if (now - lastPerfCheck < 1500) return;
    lastPerfCheck = now;
    var avg = frameTimes.reduce(function(a, b) { return a + b; }, 0) / frameTimes.length;
    if (avg > FPS_TARGET * 1.25 && qualityLevel < 4) qualityLevel++;
    else if (avg < FPS_TARGET * 1.05 && qualityLevel > 0) qualityLevel--;
  }

  // ─── geo helpers ───
  function lissajous(cx, cy, rx, ry, a, b, delta, steps, phase) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * Math.PI * 2;
      pts.push([
        cx + rx * Math.sin(a * t + delta),
        cy + ry * Math.sin(b * t + phase)
      ]);
    }
    return 'M' + pts.map(function(p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z';
  }

  function modCircle(cx, cy, r, n, k) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    var d = '';
    for (var i = 0; i < n; i++) {
      var j = (i * k) % n;
      d += 'M' + pts[i][0].toFixed(1) + ',' + pts[i][1].toFixed(1) +
           'L' + pts[j][0].toFixed(1) + ',' + pts[j][1].toFixed(1);
    }
    return d;
  }

  function sinSpiral(cx, cy, r0, r1, turns, n) {
    var d = '';
    for (var i = 0; i <= n; i++) {
      var t = (i / n) * turns * Math.PI * 2;
      var r = r0 + (r1 - r0) * (i / n);
      var w = Math.sin(t * 6) * r * 0.06;
      d += (i === 0 ? 'M' : 'L') +
           (cx + (r + w) * Math.cos(t)).toFixed(1) + ',' +
           (cy + (r + w) * Math.sin(t)).toFixed(1);
    }
    return d;
  }

  function project3D(x, y, z, focal) {
    var scale = focal / (focal + z);
    return { x: x * scale, y: y * scale, scale: scale };
  }

  // ─── detect page type ───
  var isHome = !!document.querySelector('.home-hero');
  var isSingle = !!document.querySelector('.article-hero');
  var mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // ═══════════════════════════════════════════
  // DOM ELEMENT CACHE HELPERS
  // ═══════════════════════════════════════════
  function elSVG(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function setAttrs(el, attrs) {
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k)) {
        el.setAttribute(k, attrs[k]);
      }
    }
  }

  // ═══════════════════════════════════════════
  // HOME PAGE
  // ═══════════════════════════════════════════
  if (isHome) {
    var gLime = document.getElementById('geo-group');
    var gDim  = document.getElementById('geo-group-dim');
    var gMid  = document.getElementById('geo-group-mid');
    var pGroup = document.getElementById('geo-particles');

    var CX = 350, CY = 280;
    var COMBOS = [[3,2,0],[4,3,0.5],[5,3,1.0],[7,4,1.5]];
    var COMBOS_MID = [[3,2,0.6],[6,5,0.8]];
    var COMBOS_DIM = [[7,3,0.1],[2,7,1.4]];

    var geoPhase = 0, scrollPhase = 0;
    var homeFrameCount = 0;

    // ─── Pre-create DOM elements ───
    var homeCache = {};

    function initHomeGeo() {
      // gLime: 4 lissajous paths
      homeCache.limePaths = COMBOS.map(function(c, i) {
        var path = elSVG('path');
        setAttrs(path, {
          fill: 'none',
          stroke: '#c8ff00',
          'stroke-width': '0.35',
          opacity: (0.55 + i * 0.05).toFixed(2)
        });
        gLime.appendChild(path);
        return { el: path, combo: c, index: i };
      });

      // gLime: 3 hexagons
      homeCache.limeHexagons = [];
      for (var ring = 0; ring < 3; ring++) {
        var poly = elSVG('polygon');
        setAttrs(poly, {
          stroke: '#c8ff00',
          fill: 'none',
          'stroke-width': (0.5 + ring * 0.15).toFixed(2),
          opacity: (0.55 - ring * 0.12).toFixed(2)
        });
        gLime.appendChild(poly);
        homeCache.limeHexagons.push({ el: poly, ring: ring });
      }

      // gMid: paths
      homeCache.midPaths = [];
      COMBOS_MID.forEach(function(c, i) {
        var path = elSVG('path');
        setAttrs(path, {
          fill: 'none',
          stroke: '#8baf00',
          'stroke-width': '0.28',
          opacity: '0.18'
        });
        gMid.appendChild(path);
        homeCache.midPaths.push({ el: path, combo: c, index: i });
      });

      // gMid: 2 modCircle paths with rotate
      homeCache.midMods = [];
      for (var i = 0; i < 2; i++) {
        var path = elSVG('path');
        setAttrs(path, {
          fill: 'none',
          stroke: '#8baf00',
          'stroke-width': '0.28',
          opacity: '0.18'
        });
        gMid.appendChild(path);
        homeCache.midMods.push({ el: path, r: i === 0 ? 140 : 100, n: i === 0 ? 60 : 48, k: i === 0 ? 11 : 7, dir: i === 0 ? 1 : -1 });
      }

      // gDim: 3 modCircle paths
      homeCache.dimPaths = [];
      for (var i = 0; i < 3; i++) {
        var path = elSVG('path');
        setAttrs(path, {
          fill: 'none',
          stroke: '#ede9e0',
          'stroke-width': '0.2',
          opacity: '0.07'
        });
        gDim.appendChild(path);
        homeCache.dimPaths.push(path);
      }

      // geo-particles: circles
      homeCache.particles = [];
      // 3 rings: 6 + 10 + 14 = 30 circles + 1 center = 31
      for (var ring = 0; ring < 3; ring++) {
        var count = 6 + ring * 4;
        for (var ci = 0; ci < count; ci++) {
          var circle = elSVG('circle');
          setAttrs(circle, {
            fill: '#c8ff00',
            r: (1.2 + ring * 0.3).toFixed(1),
            opacity: (0.4 - ring * 0.08).toFixed(2)
          });
          pGroup.appendChild(circle);
          homeCache.particles.push({ el: circle, ring: ring, idx: ci, count: count });
        }
      }
      // center node
      var centerCircle = elSVG('circle');
      setAttrs(centerCircle, { fill: '#c8ff00', r: '2.8', opacity: '0.5' });
      pGroup.appendChild(centerCircle);
      homeCache.centerParticle = centerCircle;
    }

    function updateHomeGeo(phase, mx, my) {
      var ox = mx ? (mx / window.innerWidth - 0.5) * 30 : 0;
      var oy = my ? (my / window.innerHeight - 0.5) * 20 : 0;
      var cx = CX + ox, cy = CY + oy;

      // gLime: update lissajous paths
      for (var i = 0; i < homeCache.limePaths.length; i++) {
        var p = homeCache.limePaths[i];
        var c = p.combo;
        var d = lissajous(cx, cy, 240 - p.index * 15, 200 - p.index * 12, c[0], c[1], c[2] + phase, 280, p.index * 0.5 + phase * 0.3);
        p.el.setAttribute('d', d);
      }

      // gLime: update hexagons
      for (var i = 0; i < homeCache.limeHexagons.length; i++) {
        var h = homeCache.limeHexagons[i];
        var r = 90 - h.ring * 20 + Math.sin(phase * 0.7 + h.ring) * 6;
        var rot = phase * 0.4 + h.ring * Math.PI / 6;
        var pts = [];
        for (var s = 0; s < 6; s++) {
          var a = (s / 6) * Math.PI * 2 - Math.PI / 2 + rot;
          pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
        }
        h.el.setAttribute('points', pts.join(' '));
      }

      // gMid: update lissajous paths
      for (var i = 0; i < homeCache.midPaths.length; i++) {
        var mp = homeCache.midPaths[i];
        var mc = mp.combo;
        var d = lissajous(cx, cy, 200 - mp.index * 20, 170 - mp.index * 15, mc[0], mc[1], mc[2] - phase * 0.5, 220, mp.index * 0.8);
        mp.el.setAttribute('d', d);
      }

      // gMid: update modCircle paths
      for (var i = 0; i < homeCache.midMods.length; i++) {
        var mm = homeCache.midMods[i];
        var d = modCircle(cx, cy, mm.r, mm.n, mm.k);
        mm.el.setAttribute('d', d);
        mm.el.setAttribute('transform', 'rotate(' + (phase * 30 * mm.dir).toFixed(0) + ',' + cx + ',' + cy + ')');
      }

      // gDim: update modCircle paths
      var dimData = [[170,90,7],[120,72,13],[80,45,11]];
      for (var i = 0; i < homeCache.dimPaths.length; i++) {
        homeCache.dimPaths[i].setAttribute('d', modCircle(cx, cy, dimData[i][0], dimData[i][1], dimData[i][2]));
      }

      // geo-particles: update circles (throttled every 2nd frame)
      if (homeFrameCount % 2 === 0 && homeCache.particles.length > 0) {
        var t = Date.now() * 0.001;
        for (var i = 0; i < homeCache.particles.length; i++) {
          var pc = homeCache.particles[i];
          var radius = 130 + pc.ring * 40 + Math.sin(phase + pc.ring) * 12;
          var a = (pc.idx / pc.count) * Math.PI * 2 + phase * 0.3 * (pc.ring + 1);
          var x = cx + Math.cos(a) * radius;
          var y = cy + Math.sin(a) * radius;
          var pulse = 0.7 + 0.3 * Math.sin(t * 2 + pc.idx * 0.5 + pc.ring);
          var r = (1.2 + pc.ring * 0.3) * pulse;
          pc.el.setAttribute('cx', x.toFixed(1));
          pc.el.setAttribute('cy', y.toFixed(1));
          pc.el.setAttribute('r', r.toFixed(1));
        }
        // center
        homeCache.centerParticle.setAttribute('cx', cx.toFixed(1));
        homeCache.centerParticle.setAttribute('cy', cy.toFixed(1));
      }
    }

    initHomeGeo();
    updateHomeGeo(0);

    // ─── corner geo (static, set once) ───
    var cornerGeo = document.getElementById('corner-geo');
    if (cornerGeo) {
      var cornerHTML = '';
      for (var ci = 0; ci < 12; ci++) {
        cornerHTML += '<path d="' + modCircle(140, 140, 130 - ci * 8, 72, ci + 2) +
               '" stroke="#ede9e0" stroke-width="0.3"/>';
      }
      cornerGeo.innerHTML = cornerHTML;
    }

    // ─── Animation loop (pauses when tab is hidden) ───
    var homeRunning = true;

    document.addEventListener('visibilitychange', function() {
      homeRunning = !document.hidden;
      if (homeRunning) requestAnimationFrame(tickHomeGeo);
    });

    function tickHomeGeo() {
      if (!homeRunning) return;
      homeFrameCount++;
      geoPhase += 0.005;
      updateHomeGeo(geoPhase + scrollPhase, mouseX, mouseY);
      requestAnimationFrame(tickHomeGeo);
    }
    tickHomeGeo();

    window.addEventListener('scroll', function() {
      if (cachedScrollHeight > cachedInnerHeight) {
        var pct = window.scrollY / (cachedScrollHeight - cachedInnerHeight);
        scrollPhase = pct * Math.PI * 2;
      }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════
  // ARTICLE PAGE
  // ═══════════════════════════════════════════
  if (isSingle) {
    // ─── TOC tracking ───
    var tocLinks = document.querySelectorAll('#toc a');
    var tocSections = [];
    tocLinks.forEach(function(a) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        tocSections.push(href.substring(1));
      }
    });

    function updateToc() {
      if (tocSections.length === 0) return;
      var active = tocSections[0];
      for (var i = 0; i < tocSections.length; i++) {
        var el = document.getElementById(tocSections[i]);
        if (el && el.getBoundingClientRect().top < 160) {
          active = tocSections[i];
        }
      }
      tocLinks.forEach(function(a) {
        var href = a.getAttribute('href');
        a.classList.toggle('active', href === '#' + active);
      });
    }

    window.addEventListener('scroll', updateToc, { passive: true });
    updateToc();

    // ─── article hero geo init ───
    var alg = document.getElementById('art-geo-lime');
    var adg = document.getElementById('art-geo-dim');
    var artParticles = document.getElementById('art-geo-particles');
    var sbg = document.getElementById('sb-geo-g');
    var sbd = document.getElementById('sb-geo-d');

    // ─── hash function ───
    function hashStr(s) {
      var h = 0;
      for (var i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    }

    // ─── shared geometry data ───
    var phi = (1 + Math.sqrt(5)) / 2;
    var iphi = 1 / phi;
    var dodecVerts = [
      [-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1],
      [0,-iphi,-phi],[0,-iphi,phi],[0,iphi,-phi],[0,iphi,phi],
      [-iphi,-phi,0],[-iphi,phi,0],[iphi,-phi,0],[iphi,phi,0],
      [-phi,0,-iphi],[-phi,0,iphi],[phi,0,-iphi],[phi,0,iphi]
    ];
    var edgeLen2 = 4 / (phi * phi);
    var dodecEdges = [];
    for (var i = 0; i < dodecVerts.length; i++) {
      for (var j = i + 1; j < dodecVerts.length; j++) {
        var dx = dodecVerts[i][0] - dodecVerts[j][0];
        var dy = dodecVerts[i][1] - dodecVerts[j][1];
        var dz = dodecVerts[i][2] - dodecVerts[j][2];
        if (Math.abs(dx*dx + dy*dy + dz*dz - edgeLen2) < 0.01) {
          dodecEdges.push([i, j]);
        }
      }
    }

    var icoVerts = [
      [0,1,phi],[0,1,-phi],[0,-1,phi],[0,-1,-phi],
      [1,phi,0],[1,-phi,0],[-1,phi,0],[-1,-phi,0],
      [phi,0,1],[phi,0,-1],[-phi,0,1],[-phi,0,-1]
    ];
    var icoEdges = [
      [0,2],[0,4],[0,6],[0,8],[0,10],[1,3],[1,5],[1,7],[1,9],[1,11],
      [2,4],[2,7],[2,8],[2,11],[3,5],[3,6],[3,9],[3,10],
      [4,5],[4,8],[4,9],[5,8],[5,9],[6,7],[6,10],[6,11],[7,10],[7,11]
    ];

    var octVerts = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    var octEdges = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];

    var FOCAL = 500;

    // ─── Exotic shape helpers ───

    // Tesseract (4D hypercube): 16 vertices, 32 edges, rotating in two 4D planes
    var tessVerts = [];
    for (var ti = 0; ti < 16; ti++) tessVerts.push([(ti&8)?1:-1, (ti&4)?1:-1, (ti&2)?1:-1, (ti&1)?1:-1]);
    var tessEdges = [];
    for (var ti = 0; ti < 16; ti++) for (var b = 1; b < 16; b <<= 1) { var tj = ti ^ b; if (tj > ti) tessEdges.push([ti, tj]); }

    function projectTesseract(time, cx, cy, scl) {
      var th1 = time * 0.4, th2 = time * 0.55;
      var c1 = Math.cos(th1), s1 = Math.sin(th1), c2 = Math.cos(th2), s2 = Math.sin(th2);
      var p3 = [];
      for (var i = 0; i < 16; i++) {
        var v = tessVerts[i];
        var nx = v[0]*c1 - v[1]*s1, ny = v[0]*s1 + v[1]*c1;
        var nz = v[2]*c2 - v[3]*s2, nw = v[2]*s2 + v[3]*c2;
        var s4 = FOCAL / (FOCAL + nw * scl * 0.6);
        var p = project3D(nx*scl*s4, ny*scl*s4, nz*scl*s4 + 120, FOCAL);
        p3.push([cx + p.x, cy + p.y]);
      }
      var d = '';
      for (var e = 0; e < tessEdges.length; e++) {
        var a = p3[tessEdges[e][0]], b = p3[tessEdges[e][1]];
        d += 'M'+a[0].toFixed(1)+','+a[1].toFixed(1)+'L'+b[0].toFixed(1)+','+b[1].toFixed(1);
      }
      return d;
    }

    // Möbius strip: twisted one-sided surface, parametric wireframe
    function projectMobius(time, cx, cy) {
      var R = 80, w = 35, d = '';
      var rx = time * 0.3, ry = time * 0.45;
      var cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry);
      // 3 longitudinal bands
      for (var oi = 0; oi < 3; oi++) {
        var off = (oi - 1) * w * 0.35;
        for (var i = 0; i <= 100; i++) {
          var t = (i / 100) * Math.PI * 2;
          var x = (R + off * Math.cos(t/2)) * Math.cos(t);
          var y = (R + off * Math.cos(t/2)) * Math.sin(t);
          var z = off * Math.sin(t/2);
          var ty = y*cX - z*sX, tz = y*sX + z*cX;
          var tx = x*cY - tz*sY; tz = x*sY + tz*cY;
          var p = project3D(tx, ty, tz + 105, FOCAL);
          d += (i===0?'M':'L') + (cx+p.x).toFixed(1)+','+(cy+p.y).toFixed(1);
        }
      }
      // Cross-section ribs
      for (var ri = 0; ri < 10; ri++) {
        var t = (ri / 10) * Math.PI * 2;
        for (var si = 0; si <= 12; si++) {
          var s = (si / 12 - 0.5) * w;
          var x = (R + s * Math.cos(t/2)) * Math.cos(t);
          var y = (R + s * Math.cos(t/2)) * Math.sin(t);
          var z = s * Math.sin(t/2);
          var ty = y*cX - z*sX, tz = y*sX + z*cX;
          var tx = x*cY - tz*sY; tz = x*sY + tz*cY;
          var p = project3D(tx, ty, tz + 105, FOCAL);
          d += (si===0?'M':'L')+(cx+p.x).toFixed(1)+','+(cy+p.y).toFixed(1);
        }
      }
      return d;
    }

    // Clifford torus: flat torus in 4D — the big outer filler
    function projectCliffordTorus(time, cx, cy) {
      var R = 290, grid = 16, d = '';
      var th1 = time * 0.35, th2 = time * 0.5;
      var c1 = Math.cos(th1), s1 = Math.sin(th1), c2 = Math.cos(th2), s2 = Math.sin(th2);
      var pts = [];
      for (var i = 0; i < grid; i++) {
        pts[i] = [];
        for (var j = 0; j < grid; j++) {
          var th = (i/grid)*Math.PI*2, ph = (j/grid)*Math.PI*2;
          var x = Math.cos(th)*R, y = Math.sin(th)*R, z = Math.cos(ph)*R, w = Math.sin(ph)*R;
          var nx = x*c1 - y*s1, ny = x*s1 + y*c1, nz = z*c2 - w*s2, nw = z*s2 + w*c2;
          var s4 = FOCAL / (FOCAL + nw * 0.4);
          var p = project3D(nx*s4, ny*s4, nz*s4 + 110, FOCAL);
          pts[i][j] = [cx + p.x, cy + p.y];
        }
      }
      for (var i = 0; i < grid; i++) for (var j = 0; j < grid; j++) {
        var nj = (j+1)%grid, ni = (i+1)%grid;
        d += 'M'+pts[i][j][0].toFixed(1)+','+pts[i][j][1].toFixed(1)+'L'+pts[i][nj][0].toFixed(1)+','+pts[i][nj][1].toFixed(1);
        d += 'M'+pts[i][j][0].toFixed(1)+','+pts[i][j][1].toFixed(1)+'L'+pts[ni][j][0].toFixed(1)+','+pts[ni][j][1].toFixed(1);
      }
      return d;
    }

    // ─── Pre-create article geo DOM elements ───
    var artCache = {};

    function initArticleGeoElements() {
      // ═══ art-geo-lime: bold foreground shapes ═══
      // Möbius strip
      artCache.mobiusPath = elSVG('path');
      setAttrs(artCache.mobiusPath, { fill: 'none', stroke: '#c8ff00', 'stroke-width': '0.5', opacity: '0.45' });
      alg.appendChild(artCache.mobiusPath);

      // Tesseract (4D hypercube) in lime
      artCache.tesseractPath = elSVG('path');
      setAttrs(artCache.tesseractPath, { fill: 'none', stroke: '#c8ff00', 'stroke-width': '0.45', opacity: '0.4' });
      alg.appendChild(artCache.tesseractPath);

      // central hexagons
      var hex1 = elSVG('polygon');
      setAttrs(hex1, { stroke: '#c8ff00', 'stroke-width': '0.8', fill: 'none', opacity: '0.7' });
      alg.appendChild(hex1);
      artCache.algHex1 = hex1;

      var hex2 = elSVG('polygon');
      setAttrs(hex2, { stroke: '#c8ff00', 'stroke-width': '0.55', fill: 'none', opacity: '0.5' });
      alg.appendChild(hex2);
      artCache.algHex2 = hex2;

      // ═══ art-geo-dim: subtle background ═══
      // Clifford torus (4D)
      artCache.cliffordPath = elSVG('path');
      setAttrs(artCache.cliffordPath, { fill: 'none', stroke: '#ede9e0', 'stroke-width': '0.22', opacity: '0.1' });
      adg.appendChild(artCache.cliffordPath);

      // Constellation web lines pool
      artCache.webLines = [];
      artCache.webLinePool = [];
      for (var i = 0; i < 80; i++) {
        var line = elSVG('line');
        setAttrs(line, { stroke: '#ede9e0', 'stroke-width': '0.25' });
        line.setAttribute('opacity', '0');
        adg.appendChild(line);
        artCache.webLinePool.push(line);
      }

      // modCircle networks: 2 bold rings
      artCache.modCircles = [];
      [180, 280].forEach(function(cr, r) {
        var path = elSVG('path');
        setAttrs(path, { fill: 'none', stroke: '#ede9e0', 'stroke-width': '0.25', opacity: '0.08' });
        adg.appendChild(path);
        artCache.modCircles.push({ el: path, r: cr, n: 60 + r * 20, k: 7 + r * 4, index: r });
      });

      // ═══ art-geo-particles ═══
      artCache.particleEls = [];

      // Helper: create shape elements (lines + vertex circles)
      function createShapeElements(verts, edges, strokeColor, strokeW, opacity, dotR, dotOp, parent) {
        var lines = [], dots = [];
        for (var e = 0; e < edges.length; e++) {
          var line = elSVG('line');
          setAttrs(line, { stroke: strokeColor, 'stroke-width': strokeW, opacity: opacity });
          parent.appendChild(line);
          lines.push({ el: line, e: edges[e] });
        }
        for (var v = 0; v < verts.length; v++) {
          var circle = elSVG('circle');
          setAttrs(circle, { fill: strokeColor, r: dotR, opacity: dotOp });
          parent.appendChild(circle);
          dots.push({ el: circle, v: v });
        }
        return { lines: lines, dots: dots, verts: verts, edges: edges };
      }

      artCache.dodec = createShapeElements(dodecVerts, dodecEdges, '#c8ff00', '0.75', '0.6', '2.0', '0.7', artParticles);
      artCache.icos = createShapeElements(icoVerts, icoEdges, '#ede9e0', '0.55', '0.4', '1.8', '0.5', artParticles);
      artCache.octa = createShapeElements(octVerts, octEdges, '#8baf00', '0.5', '0.38', '1.2', '0.45', artParticles);

      // Torus knot paths
      artCache.torusKnot1 = elSVG('path');
      setAttrs(artCache.torusKnot1, { stroke: '#c8ff00', 'stroke-width': '0.65', fill: 'none', opacity: '0.55' });
      artParticles.appendChild(artCache.torusKnot1);

      artCache.torusKnot2 = elSVG('path');
      setAttrs(artCache.torusKnot2, { stroke: '#ede9e0', 'stroke-width': '0.5', fill: 'none', opacity: '0.35' });
      artParticles.appendChild(artCache.torusKnot2);

      // Pre-compute torus knot base vertices (without rotation, saved 3600 trig/frame)
      var tkSteps = 250;
      var R1=48,r1=15,p1=2,q1=3, R2=30,r2=10,p2=3,q2=5;
      artCache.tk1Base = []; artCache.tk2Base = [];
      for (var ti = 0; ti <= tkSteps; ti++) {
        var tt = (ti / tkSteps) * Math.PI * 2;
        var rCos1 = R1 + r1 * Math.cos(q1 * tt), rCos2 = R2 + r2 * Math.cos(q2 * tt);
        artCache.tk1Base.push([rCos1 * Math.cos(p1 * tt), rCos1 * Math.sin(p1 * tt), r1 * Math.sin(q1 * tt)]);
        artCache.tk2Base.push([rCos2 * Math.cos(p2 * tt), rCos2 * Math.sin(p2 * tt), r2 * Math.sin(q2 * tt)]);
      }
      artCache.tkSteps = tkSteps;

      // Constellation nodes (18 nodes + 18 glows)
      artCache.constellationNodes = [];
      artCache.constellationGlows = [];
      for (var i = 0; i < 18; i++) {
        var glow = elSVG('circle');
        artParticles.appendChild(glow);
        artCache.constellationGlows.push(glow);

        var node = elSVG('circle');
        artParticles.appendChild(node);
        artCache.constellationNodes.push(node);
      }
    }

    initArticleGeoElements();

    // ─── Article particle node data ───
    var artNodes = [];
    for (var i = 0; i < 18; i++) {
      artNodes.push({
        rx: 140 + Math.sin(i * 1.9) * 70 + i * 14,
        ry: 100 + Math.cos(i * 2.1) * 55 + i * 10,
        rz: 80 + Math.sin(i * 2.7) * 45 + i * 8,
        sx: 0.12 + i * 0.04,
        sy: 0.09 + i * 0.03,
        sz: 0.06 + i * 0.02,
        phase: i * 0.8,
        size: 1.0 + Math.sin(i * 1.8) * 0.7,
        hue: i % 3 === 0 ? '#c8ff00' : (i % 3 === 1 ? '#ede9e0' : '#8baf00')
      });
    }

    // ─── Sidebar 3D geo ───
    var sbElements = null;
    var sbFocal = 180, sbCX = 80, sbCY = 80;
    var sbModBg = null;
    var sbCache = null;

    if (sbg && sbd) {
      var title = (document.title || '').split(' \u2014 ')[0];
      var h = hashStr(title);

      function makeRng(seed) {
        var s = seed | 0;
        return function() {
          s |= 0; s = s + 0x6D2B79F5 | 0;
          var t = Math.imul(s ^ s >>> 15, 1 | s);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
      var rng = makeRng(h);

      function polyEdges(n) { var e=[]; for(var i=0;i<n;i++)e.push([i,(i+1)%n]); return e; }

      var systems = [0,1,2,3,4,5];
      for (var si = systems.length - 1; si > 0; si--) {
        var sj = Math.floor(rng() * (si + 1));
        var tmp = systems[si]; systems[si] = systems[sj]; systems[sj] = tmp;
      }
      var count = 2 + Math.floor(rng() * 2);
      var chosen = systems.slice(0, count);

      sbElements = [];

      for (var ci = 0; ci < chosen.length; ci++) {
        var sys = chosen[ci];
        var hue = ci === 0 ? '#c8ff00' : (ci === 1 ? '#ede9e0' : '#8baf00');
        var baseOp = 0.45 + ci * 0.12;

        if (sys === 0) {
          var starN = 5 + Math.floor(rng() * 8);
          var starK = 2 + Math.floor(rng() * (Math.floor((starN-1)/2) - 1));
          var starCount = 2 + Math.floor(rng() * 3);
          for (var sc = 0; sc < starCount; sc++) {
            var sr = 35 + sc * 14;
            var pts = [];
            for (var i = 0; i < starN; i++) {
              var a = (i / starN) * Math.PI * 2 - Math.PI / 2;
              var j = (i * starK) % starN;
              var ja = (j / starN) * Math.PI * 2 - Math.PI / 2;
              pts.push([Math.cos(ja) * sr, Math.sin(ja) * sr, sc * 5]);
            }
            sbElements.push({
              points: pts, edges: polyEdges(starN),
              rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
              sx: (rng()-0.5)*1.8, sy: (rng()-0.5)*1.8, sz: (rng()-0.5)*1.5,
              zOff: 35 + sc * 18, color: hue, strokeW: 0.5 + sc*0.15, opacity: baseOp - sc*0.07, mode: 'lines'
            });
          }
        } else if (sys === 1) {
          var ringCount = 3 + Math.floor(rng() * 3);
          for (var rc = 0; rc < ringCount; rc++) {
            var sides = 3 + Math.floor(rng() * 7);
            var radius = 25 + rc * (55 / ringCount) + rng() * 8;
            var pts = [];
            for (var i = 0; i < sides; i++) {
              var a = (i / sides) * Math.PI * 2 - Math.PI / 2;
              pts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
            }
            sbElements.push({
              points: pts, edges: polyEdges(sides),
              rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
              sx: (rng()-0.5)*1.5, sy: (rng()-0.5)*1.5, sz: (rng()-0.5)*2.2,
              zOff: 40 + rc * 12, color: hue, strokeW: 0.4 + rc*0.12, opacity: baseOp - rc*0.05, mode: 'lines'
            });
          }
        } else if (sys === 2) {
          var circleCount = 4 + Math.floor(rng() * 5);
          for (var cc = 0; cc < circleCount; cc++) {
            var cxOff = (rng() - 0.5) * 50;
            var cyOff = (rng() - 0.5) * 50;
            var cr = 12 + rng() * 28;
            var cSteps = 48;
            var pts = [];
            for (var i = 0; i < cSteps; i++) {
              var a = (i / cSteps) * Math.PI * 2;
              pts.push([cxOff + Math.cos(a) * cr, cyOff + Math.sin(a) * cr, 0]);
            }
            sbElements.push({
              points: pts, edges: polyEdges(cSteps),
              rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
              sx: (rng()-0.5)*1.5, sy: (rng()-0.5)*1.5, sz: (rng()-0.5)*1.0,
              zOff: 50 + rng() * 30, color: hue, strokeW: 0.35, opacity: 0.2 + rng()*0.2, mode: 'lines'
            });
          }
        } else if (sys === 3) {
          var spokes = 8 + Math.floor(rng() * 11);
          var innerR = 10, outerR = 55 + rng() * 20;
          var pts = [];
          var edges = [];
          for (var sp = 0; sp < spokes; sp++) {
            var a = (sp / spokes) * Math.PI * 2 - Math.PI / 2;
            pts.push([Math.cos(a) * innerR, Math.sin(a) * innerR, 0]);
            pts.push([Math.cos(a) * outerR, Math.sin(a) * outerR, 0]);
            edges.push([sp*2, sp*2+1]);
          }
          sbElements.push({
            points: pts, edges: edges,
            rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
            sx: (rng()-0.5)*2.0, sy: (rng()-0.5)*2.0, sz: (rng()-0.5)*2.5,
            zOff: 45, color: hue, strokeW: 0.4, opacity: baseOp, mode: 'lines'
          });
          var arcCount = 2 + Math.floor(rng() * 2);
          for (var ac = 0; ac < arcCount; ac++) {
            var ar = innerR + (outerR - innerR) * (ac + 1) / (arcCount + 1);
            var aSteps = 60;
            var apts = [];
            for (var i = 0; i < aSteps; i++) {
              var a = (i / aSteps) * Math.PI * 2;
              apts.push([Math.cos(a) * ar, Math.sin(a) * ar, 0]);
            }
            sbElements.push({
              points: apts, edges: polyEdges(aSteps),
              rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
              sx: (rng()-0.5)*1.0, sy: (rng()-0.5)*1.0, sz: (rng()-0.5)*0.8,
              zOff: 40 + ac * 8, color: hue, strokeW: 0.25, opacity: baseOp*0.5, mode: 'dashed'
            });
          }
        } else if (sys === 4) {
          var shapes3d = [
            { v: [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]], e: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]] },
            { v: (function(){var v=[];for(var x=0;x<2;x++)for(var y=0;y<2;y++)for(var z=0;z<2;z++)v.push([x*2-1,y*2-1,z*2-1]);return v;})(), e: [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]] },
            { v: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], e: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]] },
            { v: dodecVerts, e: dodecEdges }
          ];
          var shapeIdx = Math.floor(rng() * 4);
          var sv = shapes3d[shapeIdx];
          var s3dScale = 35 + rng() * 22;
          sbElements.push({
            points: sv.v.map(function(v){ return [v[0]*s3dScale, v[1]*s3dScale, v[2]*s3dScale]; }),
            edges: sv.e,
            rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
            sx: (rng()-0.5)*2.2, sy: (rng()-0.5)*2.2, sz: (rng()-0.5)*2.0,
            zOff: 90, color: hue, strokeW: 0.6, opacity: baseOp+0.1, mode: 'solid3d'
          });
        } else if (sys === 5) {
          var cn = 6 + Math.floor(rng() * 7);
          var cR = 45 + rng() * 25;
          var pts = [];
          for (var i = 0; i < cn; i++) {
            var a = (i / cn) * Math.PI * 2 - Math.PI / 2;
            pts.push([Math.cos(a) * cR, Math.sin(a) * cR, 0]);
          }
          var edges = [];
          for (var i = 0; i < cn; i++) edges.push([i, (i+1)%cn]);
          var maxDiag = cn * 2;
          var diagCount = 0;
          for (var i = 0; i < cn; i++) {
            for (var j = i + 2; j < cn; j++) {
              if (diagCount >= maxDiag) break;
              if (rng() < 0.5) { edges.push([i, j]); diagCount++; }
            }
          }
          sbElements.push({
            points: pts, edges: edges,
            rx: rng()*Math.PI*2, ry: rng()*Math.PI*2, rz: rng()*Math.PI*2,
            sx: (rng()-0.5)*2.0, sy: (rng()-0.5)*2.0, sz: (rng()-0.5)*1.8,
            zOff: 50, color: hue, strokeW: 0.45, opacity: baseOp, mode: 'lines'
          });
        }
      }

      sbModBg = [];
      for (var bi = 0; bi < 3; bi++) {
        sbModBg.push({
          r: 50 + rng() * 30, n: 35 + Math.floor(rng() * 45), k: 4 + Math.floor(rng() * 15)
        });
      }

      // ─── Pre-create sidebar DOM elements ───
      sbCache = { elements: [], dimPaths: [] };

      for (var ei = 0; ei < sbElements.length; ei++) {
        var el = sbElements[ei];
        var lines = [], dots = [];
        for (var eidx = 0; eidx < el.edges.length; eidx++) {
          var line = elSVG('line');
          setAttrs(line, { stroke: el.color, 'stroke-width': el.strokeW, opacity: el.opacity });
          if (el.mode === 'dashed') line.setAttribute('stroke-dasharray', '3,4');
          sbg.appendChild(line);
          lines.push(line);
        }
        for (var pi = 0; pi < el.points.length; pi++) {
          var circle = elSVG('circle');
          setAttrs(circle, { fill: el.color, opacity: '0.5' });
          sbg.appendChild(circle);
          dots.push(circle);
        }
        sbCache.elements.push({ elData: el, lines: lines, dots: dots });
      }

      for (var bi = 0; bi < sbModBg.length; bi++) {
        var path = elSVG('path');
        setAttrs(path, { stroke: '#ede9e0', 'stroke-width': '0.2', fill: 'none', opacity: '0.06' });
        sbd.appendChild(path);
        sbCache.dimPaths.push(path);
      }
    }

    // ─── Scroll tracking ───
    var geoTime = 0;
    var scrollOffset = 0;
    var frameCount = 0;

    window.addEventListener('scroll', function() {
      scrollOffset = window.scrollY * 0.004;
    }, { passive: true });

    // ─── Project shape helper (returns projected vertices + edges data) ───
    function projectShapeData(verts, edges, cx, cy, scale, rx, ry, zOffset, focal) {
      var cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
      var pv = [];
      for (var v = 0; v < verts.length; v++) {
        var tx = verts[v][0] * cosY - verts[v][2] * sinY;
        var tz = verts[v][0] * sinY + verts[v][2] * cosY;
        var ty = verts[v][1] * cosX - tz * sinX;
        tz = verts[v][1] * sinX + tz * cosX;
        var finalZ = tz * scale + zOffset;
        var sp = project3D(tx * scale, ty * scale, finalZ, focal);
        pv.push({ x: cx + sp.x, y: cy + sp.y, z: finalZ, s: sp.scale });
      }
      return { verts: pv, edges: edges };
    }

    function updateShapeElements(cache, pData, blurVal) {
      // Build depth-sorted edge indices
      var sorted = cache.lines.map(function(l, i) {
        var a = pData.verts[l.e[0]], b = pData.verts[l.e[1]];
        return { idx: i, z: (a.z !== undefined && b.z !== undefined) ? (a.z + b.z) / 2 : 0, a: a, b: b };
      });
      sorted.sort(function(x, y) { return x.z - y.z; });
      for (var i = 0; i < sorted.length; i++) {
        var s = sorted[i];
        cache.lines[s.idx].el.setAttribute('x1', s.a.x.toFixed(1));
        cache.lines[s.idx].el.setAttribute('y1', s.a.y.toFixed(1));
        cache.lines[s.idx].el.setAttribute('x2', s.b.x.toFixed(1));
        cache.lines[s.idx].el.setAttribute('y2', s.b.y.toFixed(1));
        if (blurVal) setBlur(cache.lines[s.idx].el, blurVal);
      }
      for (var v = 0; v < cache.dots.length; v++) {
        cache.dots[v].el.setAttribute('cx', pData.verts[v].x.toFixed(1));
        cache.dots[v].el.setAttribute('cy', pData.verts[v].y.toFixed(1));
        if (blurVal) setBlur(cache.dots[v].el, blurVal);
      }
    }

    // ─── Combined geo update (DOM-based) ───
    function updateArticleGeo(ph, mx, my) {
      var cx = 400 + (mx ? (mx / window.innerWidth - 0.5) * 30 : 0);
      var cy = 350 + (my ? (my / window.innerHeight - 0.5) * 20 : 0);
      var breath = 1 + Math.sin(geoTime * 0.2) * 0.12;

      // Blur spotlight: cycles through elements one at a time, smooth transitions
      // Only 1-2 elements blurred at any moment
      var shapes = [
        { z: 90 },  // hexagons
        { z: 105 }, // mobius
        { z: 120 }, // tesseract
        { z: 140 }, // clifford torus
        { z: 105 }, // dodecahedron
        { z: 130 }, // icosahedron
        { z: 145 }, // octahedron
        { z: 115 }, // torus knot 1
        { z: 140 }, // torus knot 2
        { z: 155 }, // constellation nodes
        { z: 150 }, // modCircle
        { z: 155 }, // web lines
        { z: 180 }  // sidebar
      ];
      var cyclePos = (geoTime * 0.06) % shapes.length;
      var active = Math.floor(cyclePos);
      var next = (active + 1) % shapes.length;
      var t = cyclePos - active; // 0→1 fade between active and next

      function blurAt(z, slot) {
        if (slot === undefined) return '';
        var strength = 0;
        if (slot === active) strength = t < 0.5 ? 1 - t * 2 : 0;
        if (slot === next)   strength = t > 0.5 ? (t - 0.5) * 2 : 0;
        if (strength < 0.05) return '';
        return 'blur(' + (strength * 6).toFixed(1) + 'px)';
      }
      // Apply blur only if value changed (avoids redundant style recalc)
      function setBlur(el, blurVal) {
        if (el._lastBlur === blurVal) return;
        el._lastBlur = blurVal;
        el.style.filter = blurVal || '';
      }

      // ═══ ART-GEO-LIME: exotic 3D/4D shapes + hexagons ═══
      if (alg) {
        // Möbius strip
        artCache.mobiusPath.setAttribute('d', projectMobius(geoTime, cx, cy));
        setBlur(artCache.mobiusPath, blurAt(105, 1));

        // Tesseract (4D hypercube) — medium-large
        artCache.tesseractPath.setAttribute('d', projectTesseract(geoTime, cx, cy, 150));
        setBlur(artCache.tesseractPath, blurAt(120, 2));

        // Central hexagons — medium anchor
        var sr = (100 + Math.sin(geoTime * 0.3) * 24) * breath;
        var pts1 = [], pts2 = [];
        for (var i = 0; i < 6; i++) {
          var a = (i / 6) * Math.PI * 2 - Math.PI / 2 + ph * 1.3;
          pts1.push((cx + Math.cos(a) * sr).toFixed(1) + ',' + (cy + Math.sin(a) * sr).toFixed(1));
          pts2.push((cx + Math.cos(a + Math.PI / 6) * sr * 0.5).toFixed(1) + ',' + (cy + Math.sin(a + Math.PI / 6) * sr * 0.5).toFixed(1));
        }
        artCache.algHex1.setAttribute('points', pts1.join(' '));
        artCache.algHex2.setAttribute('points', pts2.join(' '));
        setBlur(artCache.algHex1, blurAt(90, 0));
        setBlur(artCache.algHex2, blurAt(90, 0));
      }

      // ═══ ART-GEO-DIM: Clifford torus + web lines + modCircle ═══
      if (adg) {
        // Clifford torus (4D flat torus)
        artCache.cliffordPath.setAttribute('d', projectCliffordTorus(geoTime, cx, cy));
        setBlur(artCache.cliffordPath, blurAt(140, 3));
        // Constellation web lines
        var projected = [];
        for (var i = 0; i < artNodes.length; i++) {
          var n = artNodes[i];
          var ax = n.phase + geoTime * n.sx * breath + ph * 0.4;
          var ay = n.phase + geoTime * n.sy * breath + ph * 0.3;
          var az = n.phase + geoTime * n.sz * breath + ph * 0.2;
          var x3 = Math.cos(ax) * (n.rx + Math.sin(geoTime * 0.35 + i) * 6);
          var y3 = Math.sin(ay) * (n.ry + Math.cos(geoTime * 0.3 + i) * 5);
          var z3 = Math.sin(az) * n.rz + 80;
          var p = project3D(x3, y3, z3, FOCAL);
          projected.push({ x: cx + p.x, y: cy + p.y, z: z3, scale: p.scale, size: n.size, idx: i, hue: n.hue });
        }
        projected.sort(function(a, b) { return a.z - b.z; });

        // Web lines: throttled to every 3rd frame — skip if quality degraded
        if (qualityLevel < 1 && frameCount % 3 === 0) {
        var lineIdx = 0;
        for (var i = 0; i < projected.length; i++) {
          for (var j = i + 1; j < projected.length; j++) {
            var dx = projected[i].x - projected[j].x;
            var dy = projected[i].y - projected[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 240) {
              var alpha = (1 - dist / 240) * 0.18;
              alpha *= (0.4 + 0.6 * (projected[i].scale + projected[j].scale) / 2);
              if (lineIdx < artCache.webLinePool.length) {
                var line = artCache.webLinePool[lineIdx];
                line.setAttribute('x1', projected[i].x.toFixed(1));
                line.setAttribute('y1', projected[i].y.toFixed(1));
                line.setAttribute('x2', projected[j].x.toFixed(1));
                line.setAttribute('y2', projected[j].y.toFixed(1));
                line.setAttribute('opacity', alpha.toFixed(2));
                setBlur(line, blurAt(155, 11));
              }
              lineIdx++;
            }
          }
        }
        // Hide unused lines
        for (var i = lineIdx; i < artCache.webLinePool.length; i++) {
          artCache.webLinePool[i].setAttribute('opacity', '0');
        }
        } // end web lines throttle

        // ModCircle networks — skip at quality 3+
        if (qualityLevel < 3) {
        artCache.modCircles.forEach(function(mc) {
          mc.el.setAttribute('d', modCircle(cx, cy, mc.r, mc.n, mc.k));
          mc.el.setAttribute('transform', 'rotate(' + (ph * 3 * (mc.index + 1)).toFixed(0) + ',' + cx + ',' + cy + ')');
          setBlur(mc.el, blurAt(150, 10));
        });
        } // end modCircle
      }

      // ═══ ART-GEO-PARTICLES ═══
      if (artParticles) {
        var mod2 = frameCount % 2 === 0;

        // 3D shapes: throttled to every 2nd frame, skip at quality 4
        if (qualityLevel < 4 && mod2) {
        // Dodecahedron — large
        var dZ = 105 + Math.sin(ph * 0.3) * 35;
        var dData = projectShapeData(dodecVerts, dodecEdges, cx, cy - 10, 100, ph * 0.9, ph * 1.1, dZ, FOCAL);
        updateShapeElements(artCache.dodec, dData, blurAt(dZ, 4));

        // Icosahedron — small
        var iZ = 130 + Math.cos(ph * 0.25) * 30;
        var iData = projectShapeData(icoVerts, icoEdges, cx + 30, cy + 40, 48, ph * 0.55, ph * 0.75, iZ, FOCAL);
        updateShapeElements(artCache.icos, iData, blurAt(iZ, 5));

        // Octahedron — tiny
        var oZ = 145 + Math.sin(ph * 0.5) * 20;
        var oData = projectShapeData(octVerts, octEdges, cx - 40, cy - 20, 28, ph * 1.6, ph * 1.0, oZ, FOCAL);
        updateShapeElements(artCache.octa, oData, blurAt(oZ, 6));
        } // end 3D shapes throttle

        // Torus knots: skip at quality 4 (knot 1), quality 3 (knot 2)
        if (qualityLevel < 4 && mod2) {
        var tkSteps = artCache.tkSteps;

        // Torus knot 1
        var tkRY = ph * 0.8, tkRX = ph * 0.6, tkOffZ = 115 + Math.sin(ph * 0.35) * 25;
        var cRY = Math.cos(tkRY), sRY = Math.sin(tkRY), cRX = Math.cos(tkRX), sRX = Math.sin(tkRX);
        var tkD = '', tkPrev = null;
        for (var ti = 0; ti <= tkSteps; ti++) {
          var kv = artCache.tk1Base[ti];
          var tx = kv[0] * cRY - kv[2] * sRY, tz = kv[0] * sRY + kv[2] * cRY, ty = kv[1] * cRX - tz * sRX;
          tz = kv[1] * sRX + tz * cRX;
          var kp = project3D(tx, ty, tz + tkOffZ, FOCAL);
          var px = cx + kp.x, py = cy + kp.y;
          if (tkPrev) { tkD += 'M' + tkPrev[0].toFixed(1) + ',' + tkPrev[1].toFixed(1) + 'L' + px.toFixed(1) + ',' + py.toFixed(1); }
          tkPrev = [px, py];
        }
        artCache.torusKnot1.setAttribute('d', tkD);
        setBlur(artCache.torusKnot1, blurAt(115, 7));

        // Torus knot 2
        var tkRY2 = ph * 0.5, tkRX2 = ph * 0.9, tkOffZ2 = 140 + Math.cos(ph * 0.28) * 20;
        var cRY2 = Math.cos(tkRY2), sRY2 = Math.sin(tkRY2), cRX2 = Math.cos(tkRX2), sRX2 = Math.sin(tkRX2);
        var tkD2 = '', tkPrev2 = null;
        for (var ti = 0; ti <= tkSteps; ti++) {
          var kv = artCache.tk2Base[ti];
          var tx = kv[0] * cRY2 - kv[2] * sRY2, tz = kv[0] * sRY2 + kv[2] * cRY2, ty = kv[1] * cRX2 - tz * sRX2;
          tz = kv[1] * sRX2 + tz * cRX2;
          var kp = project3D(tx, ty, tz + tkOffZ2, FOCAL);
          var px = cx + 30 + kp.x, py = cy - 30 + kp.y;
          if (tkPrev2) { tkD2 += 'M' + tkPrev2[0].toFixed(1) + ',' + tkPrev2[1].toFixed(1) + 'L' + px.toFixed(1) + ',' + py.toFixed(1); }
          tkPrev2 = [px, py];
        }
        artCache.torusKnot2.setAttribute('d', tkD2);
        setBlur(artCache.torusKnot2, blurAt(140, 8));
        } // end torus knots throttle

        // Constellation glows — skip at quality 2+
        if (qualityLevel < 2) {
        for (var i = 0; i < projected.length; i++) {
          var p = projected[i];
          var fog = Math.max(0.1, 1 - (p.z - 30) / 280);
          var na = (0.12 + fog * 0.55).toFixed(2);
          var nr = (p.size * p.scale * 2.2).toFixed(1);
          var pulse = 0.7 + 0.3 * Math.sin(geoTime * 2.5 + p.idx);

          if (fog > 0.35) {
            artCache.constellationGlows[i].setAttribute('cx', p.x.toFixed(1));
            artCache.constellationGlows[i].setAttribute('cy', p.y.toFixed(1));
            artCache.constellationGlows[i].setAttribute('r', (nr * 1.8).toFixed(1));
            artCache.constellationGlows[i].setAttribute('fill', p.hue);
            artCache.constellationGlows[i].setAttribute('opacity', (na * 0.2).toFixed(2));
            setBlur(artCache.constellationGlows[i], blurAt(p.z, 9));
          } else {
            artCache.constellationGlows[i].setAttribute('opacity', '0');
          }
        }
        } // end glows

        // Constellation nodes — always show (cheap)
        for (var i = 0; i < projected.length; i++) {
          var p = projected[i];
          var fog = Math.max(0.1, 1 - (p.z - 30) / 280);
          var na = (0.12 + fog * 0.55).toFixed(2);
          var nr = (p.size * p.scale * 2.2).toFixed(1);
          var pulse = 0.7 + 0.3 * Math.sin(geoTime * 2.5 + p.idx);
          artCache.constellationNodes[i].setAttribute('cx', p.x.toFixed(1));
          artCache.constellationNodes[i].setAttribute('cy', p.y.toFixed(1));
          artCache.constellationNodes[i].setAttribute('r', (nr * pulse).toFixed(1));
          artCache.constellationNodes[i].setAttribute('fill', p.hue);
          artCache.constellationNodes[i].setAttribute('opacity', na);
          setBlur(artCache.constellationNodes[i], blurAt(p.z, 9));
        }
      }

      // ═══ SIDEBAR 3D GEO (throttled every 3rd frame) ═══
      if (frameCount % 3 === 0 && sbCache && sbg) {
        for (var ei = 0; ei < sbCache.elements.length; ei++) {
          var data = sbCache.elements[ei];
          var el = data.elData;
          var srx = el.rx + geoTime * el.sx;
          var sry = el.ry + geoTime * el.sy;
          var srz = el.rz + geoTime * el.sz;
          var cX = Math.cos(srx), sX = Math.sin(srx);
          var cY = Math.cos(sry), sY = Math.sin(sry);
          var cZ = Math.cos(srz), sZ = Math.sin(srz);

          var proj = [];
          for (var pi = 0; pi < el.points.length; pi++) {
            var vx = el.points[pi][0], vy = el.points[pi][1], vz = el.points[pi][2] || 0;
            var tx = vx * cZ - vy * sZ;
            var ty = vx * sZ + vy * cZ;
            vx = tx; vy = ty;
            tx = vx * cY + vz * sY;
            var tz = -vx * sY + vz * cY;
            vx = tx; vz = tz;
            ty = vy * cX - vz * sX;
            tz = vy * sX + vz * cX;
            vz = tz;
            var sp = project3D(vx, vy, vz + el.zOff, sbFocal);
            proj.push({ x: sbCX + sp.x, y: sbCY + sp.y, z: vz + el.zOff, s: sp.scale });
          }

          // Depth-sort edges then update
          var sortedEdges = [];
          for (var eidx = 0; eidx < el.edges.length; eidx++) {
            var edge = el.edges[eidx];
            var a = proj[edge[0]], b = proj[edge[1]];
            sortedEdges.push({ idx: eidx, z: (a.z + b.z) / 2, a: a, b: b });
          }
          sortedEdges.sort(function(x, y) { return x.z - y.z; });

          for (var si = 0; si < sortedEdges.length; si++) {
            var se = sortedEdges[si];
            if (se.idx < data.lines.length) {
              var dz = Math.max(0, 1 - (se.z - 25) / 200);
              var sw = (el.strokeW * (0.35 + 0.65 * dz)).toFixed(2);
              var op = (el.opacity * (0.35 + 0.65 * dz)).toFixed(2);
              data.lines[se.idx].setAttribute('x1', se.a.x.toFixed(1));
              data.lines[se.idx].setAttribute('y1', se.a.y.toFixed(1));
              data.lines[se.idx].setAttribute('x2', se.b.x.toFixed(1));
              data.lines[se.idx].setAttribute('y2', se.b.y.toFixed(1));
              data.lines[se.idx].setAttribute('stroke-width', sw);
              data.lines[se.idx].setAttribute('opacity', op);
              setBlur(data.lines[se.idx], blurAt(el.zOff, 12));
            }
          }

          // Update vertex dots
          for (var pi = 0; pi < proj.length; pi++) {
            var v = proj[pi];
            if (pi < data.dots.length) {
              if (v.z > 20 && v.s > 0.3) {
                data.dots[pi].setAttribute('cx', v.x.toFixed(1));
                data.dots[pi].setAttribute('cy', v.y.toFixed(1));
                data.dots[pi].setAttribute('r', (1.3 * v.s).toFixed(1));
                data.dots[pi].setAttribute('opacity', '0.5');
                setBlur(data.dots[pi], blurAt(el.zOff, 12));
              } else {
                data.dots[pi].setAttribute('opacity', '0');
              }
            }
          }
        }

        // Background modCircle
        for (var bi = 0; bi < sbModBg.length; bi++) {
          var bg = sbModBg[bi];
          if (bi < sbCache.dimPaths.length) {
            sbCache.dimPaths[bi].setAttribute('d', modCircle(sbCX, sbCY, bg.r, bg.n, bg.k));
            setBlur(sbCache.dimPaths[bi], blurAt(180, 12));
          }
        }
      }
    }

    // ─── Animation loop (pauses when tab is hidden) ───
    var articleRunning = true;

    document.addEventListener('visibilitychange', function() {
      articleRunning = !document.hidden;
      if (articleRunning) requestAnimationFrame(tickArticleGeo);
    });

    function tickArticleGeo() {
      if (!articleRunning) return;
      var frameStart = performance.now();
      frameCount++;
      geoTime += 0.007;
      var ph = geoTime + scrollOffset;
      updateArticleGeo(ph, mouseX, mouseY);
      requestAnimationFrame(tickArticleGeo);
      recordFrameTime(performance.now() - frameStart);
    }
    tickArticleGeo();
  }

  // ═══════════════════════════════════════════
  // CODE BLOCK COPY BUTTONS
  // ═══════════════════════════════════════════
  document.querySelectorAll('.article-content .highlight').forEach(function(block) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.addEventListener('click', function() {
      var code = block.querySelector('code');
      if (code) {
        var text = code.textContent || code.innerText || '';
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = 'copied';
          btn.classList.add('copied');
          setTimeout(function() {
            btn.textContent = 'copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      }
    });
    block.appendChild(btn);
  });

})();
