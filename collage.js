/* 6주 커스텀 — 사진 판의 큰 타이틀: 화면 가운데 선을 지난 마지막 사진(또는 글)의 묶음 이름으로 바꾼다 (SKY → HAND → ROAD) */
(function () {
  var chapters = [].slice.call(document.querySelectorAll(".cl-chapter:not(.hz):not(.al)"));
  if (!chapters.length) return;
  var data = chapters.map(function (ch) {
    return { ch: ch, sticky: ch.querySelector(".cl-sticky"), big: ch.querySelector(".cl-big"), items: [].slice.call(ch.querySelectorAll("[data-group]")), cur: null };
  });
  /* 글자가 화면 양옆에서 잘리지 않게 — 기본 크기에서 넘치면 폭에 맞춰 줄인다 */
  function fit(d) {
    if (!d.big || !d.sticky) return;
    d.big.style.fontSize = "";
    var avail = d.sticky.clientWidth - 2 * Math.max(16, window.innerWidth * 0.04);
    var w = d.big.scrollWidth;
    if (w > avail) d.big.style.fontSize = Math.floor(parseFloat(getComputedStyle(d.big).fontSize) * avail / w) + "px";
  }
  function setText(d, g) {
    if (!d.big || d.cur === g) return;
    var first = d.cur === null;
    d.cur = g;
    if (first) { d.big.textContent = g; fit(d); return; }
    d.big.classList.add("is-swap");
    setTimeout(function () { d.big.textContent = g; fit(d); d.big.classList.remove("is-swap"); }, 180);
  }
  var ticking = false;
  function update() {
    ticking = false;
    var line = window.innerHeight * 0.6;
    data.forEach(function (d) {
      var g = d.items.length ? d.items[0].getAttribute("data-group") : null;
      d.items.forEach(function (el) { if (el.getBoundingClientRect().top < line) g = el.getAttribute("data-group"); });
      if (g) setText(d, g);
      /* 장의 끝이 화면 아래 85% 선 위로 올라오면 타이틀을 숨긴다 — 다음 장·'세 장' 카드 영역까지 따라오지 않게 */
      if (d.sticky) d.sticky.classList.toggle("is-out", d.ch.getBoundingClientRect().bottom < window.innerHeight * 0.85);
    });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", function () { data.forEach(fit); update(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { data.forEach(fit); });
  update();
})();
