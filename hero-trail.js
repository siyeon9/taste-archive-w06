/* 6주 커스텀 — 첫 화면 커서 이미지 트레일 (학생 요청 · 참고: jingjinghan.com 첫 화면)
   참고 사이트 실측: 작은 사진(약 245×170) 여러 장을 미리 깔아 두고, 커서가 일정 거리 움직일 때마다 한 장을 커서 자리에 띄웠다가 흐리게 지운다.
   사진은 이 페이지 사진 판에 있는 것만 쓴다(새 이미지 없음). 터치 기기·움직임 줄이기 설정에서는 동작하지 않는다. */
(function () {
  var hero = document.querySelector(".cs-hero");
  if (!hero || !window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var srcs = [];
  [].forEach.call(document.querySelectorAll(".cl-img img"), function (im) {
    var s = im.getAttribute("src"); if (s && srcs.indexOf(s) < 0) srcs.push(s);
  });
  if (!srcs.length) return;
  /* 장이 여러 개면 고르게 섞이도록 건너뛰며 고른다 (최대 14장) */
  var MAX = 14, picked = [];
  if (srcs.length <= MAX) picked = srcs;
  else for (var i = 0; i < MAX; i++) picked.push(srcs[Math.floor(i * srcs.length / MAX)]);

  var layer = document.createElement("div");
  layer.className = "ht-layer"; layer.setAttribute("aria-hidden", "true");
  var title = hero.querySelector(".cs-title");
  hero.insertBefore(layer, title || null);

  var POOL = 10, pool = [], pi = 0, si = 0, z = 1;
  for (var k = 0; k < POOL; k++) {
    var el = document.createElement("img");
    el.className = "ht-img"; el.alt = ""; el.decoding = "async";
    layer.appendChild(el); pool.push(el);
  }
  picked.forEach(function (s) { var pre = new Image(); pre.src = s; });   /* 미리 받아 둠 */

  var lastX = null, lastY = null, STEP = 110;
  /* 한 번에 보이는 사진은 최대 VISIBLE 장 — 새 사진이 나오면 가장 오래된 사진부터 바로 흐려 지운다 */
  var VISIBLE = 5, active = [];
  function fadeOut(el) {
    var op = parseFloat(getComputedStyle(el).opacity) || 0, tr = getComputedStyle(el).transform;
    if (el._a) el._a.cancel();
    el._a = el.animate([{ opacity: op, transform: tr }, { opacity: 0, transform: tr }], { duration: 260, easing: "ease-out", fill: "forwards" });
  }
  function spawn(x, y) {
    var el = pool[pi]; pi = (pi + 1) % POOL;
    var at = active.indexOf(el); if (at > -1) active.splice(at, 1);
    active.push(el);
    while (active.length > VISIBLE) fadeOut(active.shift());
    el.src = picked[si]; si = (si + 1) % picked.length;
    el.style.zIndex = ++z;
    el.style.left = x + "px"; el.style.top = y + "px";
    if (el._a) el._a.cancel();
    el._a = el.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.82)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.18 },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.55 },
      { opacity: 0, transform: "translate(-50%, -46%) scale(.96)" }
    ], { duration: 1500, easing: "cubic-bezier(.165,.84,.44,1)", fill: "forwards" });
    var a = el._a;
    a.onfinish = function () { if (el._a === a) { var i = active.indexOf(el); if (i > -1) active.splice(i, 1); } };
  }
  window.addEventListener("mousemove", function (e) {
    if (window.scrollY > window.innerHeight * 0.35) { lastX = null; return; }   /* 카드가 올라오면 멈춤 */
    var r = hero.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) { lastX = null; return; }
    if (lastX === null) { lastX = x; lastY = y; return; }
    var dx = x - lastX, dy = y - lastY;
    if (dx * dx + dy * dy < STEP * STEP) return;
    lastX = x; lastY = y; spawn(x, y);
  }, { passive: true });
})();
