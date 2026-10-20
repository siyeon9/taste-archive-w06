/* 6주 커스텀 — 아카이브 첫 화면: 흰 바탕 위 사진 구 (학생 요청 · 참고: gionatannese.com 첫 화면)
   참고 사이트 실측: 흰 바탕 · 작은 사진들이 구 표면에 놓여 늘 정면을 보고, 뒤쪽 사진은 작게 보이며, 끌면 구가 돈다.
   학생 요청대로 스크롤로는 돌지 않는다(스크롤은 그대로 아래 카드로 내려감). 놓은 뒤에는 관성으로 조금 돌다가 아주 느린 회전으로 돌아온다.
   사진은 이 페이지 사진 판에 있는 것만 쓴다(최대 32장, 원래 비율). */
(function () {
  var hero = document.querySelector(".cs-hero--sphere"), stage = hero && hero.querySelector(".sp-stage");
  if (!stage) return;
  var srcs = [];
  [].forEach.call(document.querySelectorAll(".src-list img, .cl-img img, .sw-item img, .bk-list img, .cam-list img, .al-list img"), function (im) {
    var s = im.getAttribute("src"); if (s && srcs.indexOf(s) < 0) srcs.push(s);
  });
  var MAX = 32, picked = [];
  if (srcs.length <= MAX) picked = srcs;
  else for (var i = 0; i < MAX; i++) picked.push(srcs[Math.floor(i * srcs.length / MAX)]);
  var N = picked.length; if (!N) return;

  /* 구 표면에 고르게 (피보나치 점) */
  var GOLD = Math.PI * (3 - Math.sqrt(5)), items = [];
  picked.forEach(function (src, i) {
    var y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * GOLD;
    var el = document.createElement("div"); el.className = "sp-item";
    var im = document.createElement("img"); im.src = src; im.alt = ""; im.draggable = false; im.decoding = "async";
    el.appendChild(im); stage.appendChild(el);
    items.push({ el: el, x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
  });

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = reduce ? 0 : 0.0015;            /* 가만히 있을 때 아주 느린 회전 (이전 0.0022) */
  var yaw = 0, pitch = -0.18, vYaw = BASE, vPitch = 0, drag = false, lx = 0, ly = 0, SENS = 0.006;

  function render() {
    var w = stage.clientWidth, h = stage.clientHeight, R = Math.min(w, h) * 0.28, P = R * 3.4;   /* 구 반지름 — 화면 짧은 변의 28% (이전 36% → 26%) */
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var x1 = it.x * cy + it.z * sy, z1 = -it.x * sy + it.z * cy;
      var y2 = it.y * cp - z1 * sp, z2 = it.y * sp + z1 * cp;     /* z2: +1 앞 · -1 뒤 */
      var s = P / (P - z2 * R);
      it.el.style.transform = "translate(" + (w / 2 + x1 * R * s).toFixed(1) + "px," + (h / 2 + y2 * R * s).toFixed(1) + "px) translate(-50%,-50%) scale(" + s.toFixed(3) + ")";
      it.el.style.zIndex = Math.round((z2 + 1) * 100);
      it.el.style.opacity = (0.45 + 0.55 * (z2 + 1) / 2).toFixed(2);
    }
  }
  function tick() {
    if (window.scrollY < window.innerHeight * 1.1) {           /* 첫 화면이 보일 때만 계산 */
      if (!drag) {
        yaw += vYaw; pitch += vPitch;
        vYaw += (BASE - vYaw) * 0.03; vPitch *= 0.93;
        pitch += (-0.18 - pitch) * 0.01;                         /* 놓으면 기울기가 천천히 제자리로 */
      }
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      render();
    }
    requestAnimationFrame(tick);
  }

  var downItem = null, downX = 0, downY = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    downItem = e.target.closest ? e.target.closest(".sp-item") : null; downX = e.clientX; downY = e.clientY;
    drag = true; lx = e.clientX; ly = e.clientY; vYaw = 0; vPitch = 0;
    stage.classList.add("is-drag"); stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    yaw += dx * SENS; pitch += dy * SENS; vYaw = dx * SENS; vPitch = dy * SENS;
  });
  function end() { drag = false; stage.classList.remove("is-drag"); }
  /* 끌지 않고 사진 하나를 누르면 그 원본 사진을 크게 (학생 요청) — 닫기: 클릭 · Esc */
  var box = document.createElement("div"); box.className = "vf-box sp-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<img alt=""><button class="vf-box__close" type="button" aria-label="닫기">×</button>';
  document.body.appendChild(box);
  var bImg = box.querySelector("img");
  box.addEventListener("click", function () { box.classList.remove("is-open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") box.classList.remove("is-open"); });
  stage.addEventListener("pointerup", function (e) {
    var moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
    if (downItem && moved < 6) {
      var im = downItem.querySelector("img");
      bImg.src = im.getAttribute("src"); bImg.alt = altOf(im.getAttribute("src"));
      box.classList.add("is-open");
    }
    downItem = null; end();
  });
  function altOf(src) { var el = document.querySelector('.src-list img[src="' + src + '"]'); return el ? el.getAttribute("alt") : ""; }
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("lostpointercapture", end);

  render(); requestAnimationFrame(tick);
})();
