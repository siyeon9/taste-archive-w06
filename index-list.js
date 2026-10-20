/* 6주 커스텀 — 아카이브 맨 아래 '세 장' 목차 (학생 요청 · 참고: aventuradentalarts.com)
   스크롤 연출: 목차 화면이 고정되고, 스크롤하는 만큼 제목 목록이 한 칸씩 위로 올라간다.
   맨 위 자리를 지나간 제목은 위로 흐려지며 사라지고, 그 자리에 온 제목이 진해지며 가운데 사진과 왼쪽 번호(01 / 03)가 바뀐다.
   제목을 누르면 그 상세 페이지로 (Learn More 없음). 호버로는 바뀌지 않는다(학생 요청). */
(function () {
  var sec = document.querySelector(".cs-related.ix");
  if (!sec) return;
  var pin = sec.querySelector(".ix-pin"), list = sec.querySelector(".ix-rows");
  var rows = [].slice.call(sec.querySelectorAll(".ix-row")), img = sec.querySelector(".ix-img"), num = sec.querySelector(".ix-count__n");
  var N = rows.length, STEP = 0.8, cur = 0, rowH = 0, ticking = false;   /* 한 칸 넘기는 데 화면 높이의 0.8배 */
  rows.forEach(function (r) { var p = new Image(); p.src = r.getAttribute("data-img"); });
  sec.classList.add("is-live");
  function layout() {
    sec.style.height = (window.innerHeight * (1 + STEP * (N - 1) + 0.3)) + "px";
    rowH = rows[0].getBoundingClientRect().height;
    update();
  }
  function setCur(i) {
    if (i === cur) return; cur = i;
    num.textContent = String(i + 1).padStart(2, "0");
    img.classList.add("is-swap");
    setTimeout(function () { img.src = rows[i].getAttribute("data-img"); img.alt = rows[i].getAttribute("data-alt"); img.classList.remove("is-swap"); }, 180);
  }
  function update() {
    ticking = false;
    var vh = window.innerHeight, r = sec.getBoundingClientRect();
    var pos = Math.max(0, Math.min(N - 1, (-r.top / vh) / STEP));          /* 0 → 1 → 2 */
    list.style.transform = "translate3d(0," + (-pos * rowH).toFixed(1) + "px,0)";
    rows.forEach(function (row, i) {
      var d = i - pos;                                                      /* 0 = 맨 위 자리 · 음수 = 이미 위로 지나감 */
      row.style.opacity = d < 0 ? Math.max(0, 1 + d * 1.6).toFixed(3) : "1";
      row.classList.toggle("is-on", Math.abs(d) < 0.5);
    });
    setCur(Math.round(pos));
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
