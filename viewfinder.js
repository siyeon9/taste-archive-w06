/* 6주 커스텀 — 아카이브 시선 장의 SKY 묶음 '뷰파인더' (학생 요청 · SKY 구간에만)
   사진 판은 흐리고 흑백으로 가라앉아 있고, 마우스를 따라다니는 3:2 네모 창(카메라 뷰파인더) 안만 선명한 원래 색으로 보인다.
   창 왼쪽 위에는 지금 창 가운데 있는 사진의 묶음·번호가 뜨고, 클릭하면 화면이 한 번 하얗게 깜빡인 뒤 그 사진이 크게 열린다.
   흐림은 사진 위에 깐 한 장의 막(backdrop-filter)에 창 모양 구멍(mask)을 뚫어 만든다. 마우스가 있는 기기에서만. */
(function () {
  var ch = document.querySelector('.cl-chapter[aria-label="시선"]');
  if (!ch || !window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  /* SKY 묶음 구간에만 (학생 요청) — SKY 칸들의 위아래 끝을 재서 그 띠에만 흐림 막을 깐다 */
  /* data-vf="all" 이면 시선 파트 사진 전체(밀착 인화지 한 장), 아니면 SKY 묶음만 */
  var ALL = ch.getAttribute("data-vf") === "all", GROUP = "SKY";
  var skyItems = [].slice.call(ch.querySelectorAll(ALL ? "figure.cl-item" : '[data-group="' + GROUP + '"]'));
  if (!skyItems.length) return;
  ch.classList.add("vf");
  /* 옆으로 흐르는 시선 파트(.hz)에서는 흐림 막을 고정 무대 안에 둔다 — 무대와 함께 화면에 붙어 있게 */
  var box = ch.querySelector(".hz-stage") || ch;
  var veil = document.createElement("div"); veil.className = "vf-veil"; veil.setAttribute("aria-hidden", "true");
  box.appendChild(veil);
  var FEATHER = 140, band = { top: 0, bottom: 0 };
  function measure() {
    var cr = box.getBoundingClientRect(), t = Infinity, b = -Infinity;
    skyItems.forEach(function (el) { var r = el.getBoundingClientRect(); t = Math.min(t, r.top - cr.top); b = Math.max(b, r.bottom - cr.top); });
    band.top = Math.max(0, t - FEATHER); band.bottom = b + FEATHER;
    veil.style.top = band.top + "px"; veil.style.height = (band.bottom - band.top) + "px";
    veil.style.setProperty("--feather", FEATHER + "px");
  }
  measure();
  [].forEach.call(ch.querySelectorAll("img"), function (im) { if (!im.complete) im.addEventListener("load", measure, { once: true }); });
  window.addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); draw(); });
  var frame = document.createElement("div"); frame.className = "vf-frame"; frame.setAttribute("aria-hidden", "true");
  frame.innerHTML = '<span class="vf-label"></span><span class="vf-cross"></span>';
  document.body.appendChild(frame);
  var label = frame.querySelector(".vf-label");

  function size() {
    var w = Math.min(Math.max(window.innerWidth * 0.26, 220), 420);
    return { w: w, h: w * 2 / 3 };
  }
  var S = size(), mx = -9999, my = -9999, inside = false, raf = 0;
  window.addEventListener("resize", function () { S = size(); measure(); draw(); });

  function draw() {
    raf = 0;
    var r = veil.getBoundingClientRect();
    ch.style.setProperty("--vw", S.w + "px"); ch.style.setProperty("--vh", S.h + "px");
    if (inside) {
      ch.style.setProperty("--vx", (mx - r.left - S.w / 2).toFixed(1) + "px");
      ch.style.setProperty("--vy", (my - r.top - S.h / 2).toFixed(1) + "px");
      frame.style.width = S.w + "px"; frame.style.height = S.h + "px";
      frame.style.transform = "translate3d(" + (mx - S.w / 2).toFixed(1) + "px," + (my - S.h / 2).toFixed(1) + "px,0)";
    } else {
      ch.style.setProperty("--vx", "-9999px"); ch.style.setProperty("--vy", "-9999px");
    }
  }
  function req() { if (!raf) raf = requestAnimationFrame(draw); }

  /* 창 가운데에 있는 사진 찾기 */
  function photoAt(x, y) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < els.length; i++) { var f = els[i].closest && els[i].closest("figure.cl-item"); if (f && ch.contains(f) && (ALL || f.getAttribute("data-group") === GROUP)) return f; }
    return null;
  }
  function updateLabel() {
    var f = photoAt(mx, my);
    if (!f) { label.textContent = ""; return; }
    var num = f.querySelector(".cl-num"), g = f.getAttribute("data-group") || "";
    label.textContent = g + (num ? " · " + num.textContent : "");
  }

  function inBand(y) { var r = box.getBoundingClientRect(); var yy = y - r.top; return yy >= band.top + FEATHER * 0.5 && yy <= band.bottom - FEATHER * 0.5; }
  function sync() {
    measure();                               /* 사진이 늦게 뜨거나 옆으로 흘러도 막 위치를 늘 다시 잰다 */
    var on = inBand(my);
    if (on !== inside) { inside = on; frame.classList.toggle("is-on", on); ch.classList.toggle("vf-in", on); }
    req(); if (inside) updateLabel();
  }
  ch.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; sync(); });
  ch.addEventListener("mouseleave", function () { inside = false; frame.classList.remove("is-on"); ch.classList.remove("vf-in"); req(); });
  window.addEventListener("scroll", function () { if (mx > -9999) sync(); }, { passive: true });
  ch.addEventListener("hz-move", function () { if (mx > -9999) sync(); });

  /* 클릭 — 하얗게 한 번 깜빡이고 그 사진을 크게 */
  var flash = document.createElement("div"); flash.className = "vf-flash"; flash.setAttribute("aria-hidden", "true");
  document.body.appendChild(flash);
  var box = document.createElement("div"); box.className = "vf-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<img alt=""><p class="vf-box__cap"></p><button class="vf-box__close" type="button" aria-label="닫기">×</button>';
  document.body.appendChild(box);
  var bImg = box.querySelector("img"), bCap = box.querySelector(".vf-box__cap");
  function closeBox() { box.classList.remove("is-open"); }
  box.addEventListener("click", closeBox);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBox(); });

  ch.addEventListener("click", function (e) {
    if (!inside) return;
    var f = photoAt(e.clientX, e.clientY);
    if (!f) return;
    var im = f.querySelector("img"); if (!im) return;
    flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on");
    setTimeout(function () {
      bImg.src = im.getAttribute("src"); bImg.alt = im.getAttribute("alt") || "";
      var lab = f.querySelector(".cl-label"), num = f.querySelector(".cl-num");
      bCap.textContent = (num ? num.textContent + "  " : "") + (lab ? lab.innerHTML.replace(/<br\s*\/?>/gi, " · ").replace(/<[^>]+>/g, "").trim() : "");
      box.classList.add("is-open");
    }, 140);
  });

  draw();
})();
