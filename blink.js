/* 6주 커스텀 — 아카이브 시선 파트 '깜빡임' (학생 요청 · 아이디어 1)
   스크롤이 곧 눈꺼풀이다. 무대(화면 한 장)는 고정되고, 스크롤하는 동안
   검은 눈꺼풀 곡선이 위아래에서 내려와 눈을 감았다가 → 눈을 뜨면 다음 사진이 화면 가득 보인다.
   맨 처음은 감은 눈(검정) 위에 4주 관점 한 문장, 눈을 뜨면 하늘 첫 사진. 묶음이 바뀌는 사진에서는 고른 이유 한 줄이 잠깐 비친다.
   사진 한 장 = 스크롤 SEG(화면 높이의 0.6배). 사진은 감은 순간에만 바뀌어 바뀌는 모습이 보이지 않는다. */
(function () {
  var sec = document.querySelector(".cl-chapter.bk");
  if (!sec) return;
  var img = sec.querySelector(".bk-img"), top = sec.querySelector(".bk-top"), bot = sec.querySelector(".bk-bot");
  var intro = sec.querySelector(".bk-intro"), groupEl = sec.querySelector(".bk-group"), countEl = sec.querySelector(".bk-count"), reasonEl = sec.querySelector(".bk-reason");
  var shots = [].slice.call(sec.querySelectorAll(".bk-list li")).map(function (li) {
    var im = li.querySelector("img");
    return { src: im.getAttribute("src"), alt: im.getAttribute("alt"), w: im.getAttribute("width"), h: im.getAttribute("height"), group: li.getAttribute("data-group"), reason: li.getAttribute("data-reason") };
  });
  var N = shots.length; if (!N) return;
  shots.forEach(function (s) { var p = new Image(); p.src = s.src; });   /* 미리 받아 두기 */

  var SEG = 0.6;                       /* 사진 한 장당 스크롤 길이(화면 높이 배수) */
  var INTRO = 0.7;                     /* 처음 감은 눈 + 문장 구간 */
  sec.classList.add("is-live");
  function layout() { sec.style.height = ((INTRO + N * SEG) * window.innerHeight + window.innerHeight) + "px"; }

  /* 눈꺼풀 모양: o = 0 감음(가운데 한 줄) · 1 완전히 뜸(눈꺼풀이 화면 밖) */
  function lids(o) {
    var ye = 50 - 56 * o, yc = 50 - 132 * o;
    top.setAttribute("d", "M-1,-2H101V" + ye.toFixed(2) + "Q50," + yc.toFixed(2) + " -1," + ye.toFixed(2) + "Z");
    var be = 50 + 56 * o, bc = 50 + 132 * o;
    bot.setAttribute("d", "M-1,102H101V" + be.toFixed(2) + "Q50," + bc.toFixed(2) + " -1," + be.toFixed(2) + "Z");
  }
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  var cur = -1;
  function show(i) {
    if (i === cur) return;
    cur = i; var s = shots[i];
    img.src = s.src; img.alt = s.alt; img.width = s.w; img.height = s.h;
    groupEl.textContent = s.group;
    countEl.textContent = String(i + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
    var newGroup = i === 0 || shots[i - 1].group !== s.group;
    reasonEl.textContent = newGroup ? s.reason : "";
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, y = -sec.getBoundingClientRect().top / vh;   /* 무대가 고정된 뒤 지나온 화면 수 */
    var o, i, tIn;
    if (y < INTRO) {                                    /* 처음: 감은 눈 → 뜨기 */
      i = 0; var t = Math.max(0, y) / INTRO;
      o = t < .45 ? 0 : ease((t - .45) / .55);
      intro.style.opacity = (1 - Math.min(1, t / .5)).toFixed(3);
      tIn = 1;
    } else {
      intro.style.opacity = 0;
      var k = (y - INTRO) / SEG; i = Math.min(N - 1, Math.floor(k)); var t2 = k - Math.floor(k);
      if (k >= N) { i = N - 1; t2 = 0.5; }              /* 마지막 사진은 뜬 채로 머문 뒤 지나감 */
      /* 한 장 안에서: 0~.62 뜬 채로 보기 · .62~.82 감기 · .82~1 다음 장으로 뜨기(다음 장 구간의 0 = 뜬 상태) */
      if (t2 < .62 || i === N - 1) { o = 1; tIn = t2 / .62; }
      else if (t2 < .82) { o = 1 - ease((t2 - .62) / .2); tIn = 1; }
      else { i = Math.min(N - 1, i + 1); o = ease((t2 - .82) / .18); tIn = 0; }
    }
    show(i);
    lids(o);
    sec.style.setProperty("--open", o.toFixed(3));
    reasonEl.style.opacity = (o > .95 ? Math.min(1, (tIn || 0) * 3) * (reasonEl.textContent ? 1 : 0) : 0).toFixed(3);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", function () { layout(); update(); });
  layout(); update();
})();
