/* 6주 커스텀 — 아카이브 공간 장: 회전 사진 휠 (학생 요청 · 참고: nickho-motorsports.nl 갤러리 화면)
   참고 화면 실측(2000 폭): 사진들이 큰 원(반지름 ≈ 폭의 36%) 위에 45° 간격으로 놓이고, 맨 위(가운데) 사진만 똑바로 선 컬러,
   옆 사진은 원을 따라 기울어진 흑백. 뒤에 아주 옅은 큰 글자, 원 호와 바큇살 같은 가는 선, 아래 눈금 다이얼, « » 버튼, DRAG 표시.
   여기서는 세 공간 사진 15장을 한 휠에 이어 두고, 가운데 사진의 공간에 따라 LAKE · LIBRARY · SUBWAY 버튼·배경 글자·설명이 바뀐다(버튼은 그 공간 첫 사진으로 이동). 끌기(마우스·손가락 가로)와 « » 로 돌리고, 놓으면 가까운 사진에 맞춰 선다. */
(function () {
  var sec = document.querySelector(".cl-chapter.sw");
  if (!sec) return;
  var stage = sec.querySelector(".sw-stage"), wheel = sec.querySelector(".sw-wheel"), word = sec.querySelector(".sw-word");
  var all = [].slice.call(sec.querySelectorAll(".sw-item"));
  var tabs = [].slice.call(sec.querySelectorAll(".sw-tab")), infos = [].slice.call(sec.querySelectorAll(".sw-info"));
  var svg = sec.querySelector(".sw-lines"), arc = sec.querySelector(".sw-arc"), spokes = sec.querySelector(".sw-spokes");
  var STEP = 45;                          /* 사진 사이 각도 */
  var space = "lake", items = [], pos = 0, target = 0, raf = 0;
  var G = { W: 0, H: 0, cx: 0, cy: 0, R: 0, S: 0 };

  function geom() {
    var W = stage.clientWidth, H = stage.clientHeight, mobile = W < 768;
    var S = mobile ? Math.min(W * 0.56, 260) : Math.max(200, Math.min(W * 0.175, 360));
    var R = mobile ? W * 0.95 : Math.min(W * 0.36, H * 0.95);
    var topY = H * (mobile ? 0.26 : 0.24);
    G = { W: W, H: H, S: S, R: R, cx: W / 2, cy: topY + S / 2 + R };
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    arc.setAttribute("cx", G.cx); arc.setAttribute("cy", G.cy); arc.setAttribute("r", G.R);
    fitWord();
  }
  /* 배경 큰 글자 — 참고 화면처럼 폭 98% · 높이 78%를 꽉 채우게 세로로 길게 늘린다.
     글자 실제 잉크 상자(위·아래 끝)를 재서 그 상자를 SVG 화면 전체에 맞춰 늘리므로 윗부분이 잘리지 않는다. */
  var wordSvg = sec.querySelector(".sw-word-svg"), mctx = document.createElement("canvas").getContext("2d");
  function fitWord() {
    if (!wordSvg) return;
    mctx.font = '400 200px "Anton", sans-serif';
    var m = mctx.measureText(word.textContent || "A");
    var L = m.actualBoundingBoxLeft || 0, Rr = m.actualBoundingBoxRight || m.width, A = m.actualBoundingBoxAscent || 150, D = m.actualBoundingBoxDescent || 0;
    wordSvg.setAttribute("viewBox", (-L).toFixed(2) + " " + (-A).toFixed(2) + " " + (L + Rr).toFixed(2) + " " + (A + D).toFixed(2));
  }


  /* 세 공간의 사진 15장을 한 휠에 이어 둔다 (학생 요청). 가운데 사진이 어느 공간인지에 따라 버튼·배경 글자·설명이 바뀐다.
     공간 버튼을 누르면 그 공간의 첫 사진으로 돌아간다. */
  items = all.slice();
  all.forEach(function (el) { el.classList.add("is-in"); });
  spokes.innerHTML = items.map(function () { return '<line class="sw-spoke"/>'; }).join("");
  /* 그 공간 첫 사진까지 가장 가까운 방향으로 */
  function firstOf(name) {
    var N = items.length, k = 0;
    for (var i = 0; i < N; i++) if (items[i].getAttribute("data-space") === name) { k = i; break; }
    var cur = Math.round(target), d = ((k - cur) % N + N) % N; if (d > N / 2) d -= N;
    return cur + d;
  }
  function showSpace(name) {
    if (name === space && word.textContent) return;
    space = name;
    tabs.forEach(function (t) { var on = t.getAttribute("data-space") === name; t.setAttribute("aria-selected", on ? "true" : "false"); t.classList.toggle("is-on", on); });
    infos.forEach(function (p) { p.hidden = p.getAttribute("data-space") !== name; });
    word.textContent = name.toUpperCase(); fitWord();
    stage.classList.remove("is-swap"); void stage.offsetWidth; stage.classList.add("is-swap");
  }
  function syncSpace() {
    var N = items.length, i = ((Math.round(pos) % N) + N) % N;
    showSpace(items[i].getAttribute("data-space"));
  }

  function render() {
    var lines = spokes.children, dialX = G.cx, dialY = G.cy - G.R * 0.42;
    items.forEach(function (el, i) {
      var N = items.length, d = ((i - pos) % N + N) % N; if (d >= N / 2) d -= N;   /* 무한 — 가장 가까운 쪽으로 감싼 거리 */
      var deg = d * STEP, rad = deg * Math.PI / 180, a = Math.abs(deg);
      var x = G.cx + G.R * Math.sin(rad), y = G.cy - G.R * Math.cos(rad);
      var sc = 1 - 0.3 * Math.min(1, a / STEP);
      el.style.width = G.S + "px";
      el.style.transform = "translate3d(" + (x - G.S / 2).toFixed(1) + "px," + (y - G.S / 2).toFixed(1) + "px,0) rotate(" + deg.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
      el.style.opacity = a > 100 ? 0 : (1 - Math.max(0, a - 60) / 40).toFixed(2);
      el.style.filter = "grayscale(" + Math.min(1, a / 30).toFixed(2) + ")";
      el.style.zIndex = 100 - Math.round(a);
      el.classList.toggle("is-center", a < STEP / 2);
      var ln = lines[i];
      if (ln) {
        ln.setAttribute("x1", dialX); ln.setAttribute("y1", dialY);
        ln.setAttribute("x2", x.toFixed(1)); ln.setAttribute("y2", (y + G.S * 0.5 * sc).toFixed(1));
        ln.style.opacity = a > 100 ? 0 : 1;
      }
    });
  }
  function tick() {
    raf = 0;
    if (!dragging) pos += (target - pos) * 0.14;
    render();
    syncSpace();
    if (dragging || Math.abs(target - pos) > 0.001) raf = requestAnimationFrame(tick); else { pos = target; render(); syncSpace(); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function go(i) { target = Math.round(i); kick(); }   /* 무한 — 끝이 없으므로 자르지 않는다 */

  /* 끌기 — 가로로 끈 길이(호의 길이)만큼 돈다. 세로 스크롤은 막지 않는다 */
  var dragging = false, sx = 0, sp = 0, moved = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    dragging = true; sx = e.clientX; sp = pos; moved = 0;
    stage.classList.add("is-drag"); stage.setPointerCapture && stage.setPointerCapture(e.pointerId); kick();
  });
  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
    var p = sp - (dx / G.R) * (180 / Math.PI) / STEP;
    pos = p; target = p;
  });
  function end(e) {
    if (!dragging) return;
    dragging = false; stage.classList.remove("is-drag");
    if (moved < 6 && e && e.target) {                                       /* 끌지 않고 누른 옆 사진이면 그 사진으로 */
      var f = e.target.closest && e.target.closest(".sw-item.is-in");
      if (f) { go(items.indexOf(f)); return; }
    }
    go(pos);
  }
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", function () { dragging = false; stage.classList.remove("is-drag"); go(pos); });

  sec.querySelector(".sw-prev").addEventListener("click", function () { go(target - 1); });
  sec.querySelector(".sw-next").addEventListener("click", function () { go(target + 1); });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(target - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(target + 1); e.preventDefault(); }
  });
  tabs.forEach(function (t) { t.addEventListener("click", function () { go(firstOf(t.getAttribute("data-space"))); }); });

  window.addEventListener("resize", function () { geom(); render(); });
  if (document.fonts && document.fonts.load) document.fonts.load('200px "Anton"').then(fitWord).catch(function () {}); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);
  word.textContent = ""; space = "";
  geom(); pos = -1.2; target = 0; showSpace("lake"); kick();
})();
