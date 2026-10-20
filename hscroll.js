/* 6주 커스텀 — 아카이브 시선 파트: 옆으로 흐르는 사진 띠 (학생 요청 · 시선 파트만)
   구역 높이를 '띠 길이만큼' 늘리고 무대(화면 한 장)를 고정해, 세로로 굴린 만큼 띠를 왼쪽으로 옮긴다.
   트랙패드 가로 밀기도 같은 방향으로 받는다. 뒤의 큰 반전 타이틀은 화면 가운데를 지나는 사진의 묶음(SKY·HAND·ROAD)으로 바뀐다. */
(function () {
  var sec = document.querySelector(".cl-chapter.hz");
  if (!sec) return;
  var stage = sec.querySelector(".hz-stage"), track = sec.querySelector(".hz-track");
  var big = sec.querySelector(".cl-big"), sticky = sec.querySelector(".cl-sticky");
  var items = [].slice.call(sec.querySelectorAll(".hz-item[data-group]"));
  sec.classList.add("is-live");
  var maxX = 0;
  function layout() {
    maxX = Math.max(0, track.scrollWidth - stage.clientWidth);
    sec.style.height = (maxX + window.innerHeight) + "px";
    fitBig();
  }
  function fitBig() {
    if (!big) return;
    big.style.fontSize = "";
    var avail = stage.clientWidth * 0.92, w = big.scrollWidth;
    if (w > avail) big.style.fontSize = Math.floor(parseFloat(getComputedStyle(big).fontSize) * avail / w) + "px";
  }
  var cur = "", ticking = false;
  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect(), span = sec.offsetHeight - window.innerHeight;
    var p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
    track.style.transform = "translate3d(" + (-p * maxX).toFixed(1) + "px,0,0)";
    /* 화면 가운데를 지난 마지막 칸의 묶음 */
    var line = window.innerWidth * 0.5, g = items.length ? items[0].getAttribute("data-group") : "";
    items.forEach(function (el) { if (el.getBoundingClientRect().left < line) g = el.getAttribute("data-group"); });
    if (big && g && g !== cur) {
      var first = cur === ""; cur = g;
      if (first) { big.textContent = g; fitBig(); }
      else { big.classList.add("is-swap"); setTimeout(function () { big.textContent = g; fitBig(); big.classList.remove("is-swap"); }, 180); }
    }
    if (sticky) sticky.classList.toggle("is-out", r.bottom < window.innerHeight * 0.85);
    sec.dispatchEvent(new Event("hz-move"));
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { layout(); update(); });
  /* 트랙패드 가로 밀기 → 같은 방향으로 */
  sec.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { window.scrollBy(0, e.deltaX); e.preventDefault(); }
  }, { passive: false });
  [].forEach.call(sec.querySelectorAll("img"), function (im) { if (!im.complete) im.addEventListener("load", function () { layout(); update(); }, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); update(); });
  layout(); update();
})();
