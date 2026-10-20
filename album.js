/* 6주 커스텀 — 아카이브 사람 파트 '앨범 패키지' (학생 요청 · 아이디어 4)
   트랙(이유 셋)이나 BONUS 사진에 마우스를 올리면(또는 누르면) CD 가 케이스 밖으로 미끄러져 나와 돌고,
   CD 표면에 그 트랙의 사진이 비친다. 돌아가는 CD 를 누르면 그 원본 사진이 크게 열린다(닫기: 클릭 · Esc). 트랙은 펼쳐져 본 것 · 해석이 보인다. 목록 밖으로 나가면 CD 가 케이스로 돌아간다. */
(function () {
  var sec = document.querySelector(".cl-chapter.al");
  if (!sec) return;
  var pack = sec.querySelector(".al-pack"), art = sec.querySelector(".al-disc__art"), back = sec.querySelector(".al-back");
  var tracks = [].slice.call(sec.querySelectorAll(".al-track")), bonus = [].slice.call(sec.querySelectorAll(".al-b"));
  var timer = 0, curSrc = "", curCap = "", playing = false;
  function play(src, el) {
    clearTimeout(timer);
    if (src) { art.style.backgroundImage = "url('" + src + "')"; curSrc = src;
      var nm = el && el.querySelector(".al-name"), no = el && el.querySelector(".al-no");
      /* 크게 볼 때 아래 표시는 번호만 (학생 요청) — 트랙 01–03, BONUS 는 BONUS 안의 순서 01–06 */
      curCap = no ? no.textContent : String(bonus.indexOf(el) + 1).padStart(2, "0"); }
    pack.classList.add("is-out");
    tracks.forEach(function (t) { t.classList.toggle("is-on", t === el); });
    bonus.forEach(function (b) { b.classList.toggle("is-on", b === el); });
  }
  function stop() { timer = setTimeout(function () { if (playing) return; pack.classList.remove("is-out"); tracks.forEach(function (t) { t.classList.remove("is-on"); }); bonus.forEach(function (b) { b.classList.remove("is-on"); }); }, 350); }
  tracks.forEach(function (t) {
    var src = t.getAttribute("data-art"), btn = t.querySelector(".al-track__btn");
    t.addEventListener("mouseenter", function () { play(src, t); });
    btn.addEventListener("focus", function () { play(src, t); });
    btn.addEventListener("click", function () { if (t.classList.contains("is-on") && !matchMedia("(hover: hover)").matches) stop(); else play(src, t); });
  });
  bonus.forEach(function (b) {
    var src = b.getAttribute("data-art");
    b.addEventListener("mouseenter", function () { play(src, b); });
    b.addEventListener("focus", function () { play(src, b); });
    b.addEventListener("click", function () { play(src, b); });
  });
  back.addEventListener("mouseleave", stop);
  /* 목록에서 CD 쪽으로 마우스를 옮기는 동안 CD 가 들어가 버리지 않게 */
  pack.addEventListener("mouseenter", function () { if (pack.classList.contains("is-out")) clearTimeout(timer); });
  pack.addEventListener("mouseleave", stop);

  /* 돌아가는 CD 를 누르면 그 원본 사진을 크게 (학생 요청) */
  var disc = sec.querySelector(".al-disc");
  var box = document.createElement("div"); box.className = "vf-box al-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<img alt=""><p class="vf-box__cap"></p><button class="vf-box__close" type="button" aria-label="닫기">×</button>';
  document.body.appendChild(box);
  var bImg = box.querySelector("img"), bCap = box.querySelector(".vf-box__cap");
  function alt(src) { var im = sec.querySelector('.al-list img[src="' + src + '"]'); return im ? im.getAttribute("alt") : ""; }
  disc.addEventListener("click", function () {
    if (!pack.classList.contains("is-out") || !curSrc) return;
    bImg.src = curSrc; bImg.alt = alt(curSrc); bCap.textContent = curCap;
    box.classList.add("is-open");
  });
  box.addEventListener("click", function () { box.classList.remove("is-open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") box.classList.remove("is-open"); });
  /* 앨범 커버를 누르면 CD 여섯 장(BONUS 사진)이 3개씩 두 줄로 펼쳐진다 (학생 요청) — CD 를 누르면 그 원본 사진(번호 01–06) */
  var caseEl = sec.querySelector(".al-case");
  var grid = document.createElement("div"); grid.className = "al-grid"; grid.setAttribute("role", "dialog"); grid.setAttribute("aria-modal", "true"); grid.setAttribute("aria-label", "CD 여섯 장");
  grid.innerHTML = '<div class="al-grid__in"></div><button class="al-grid__close" type="button" aria-label="닫기">×</button>';
  var gin = grid.querySelector(".al-grid__in");
  bonus.forEach(function (b, i) {
    var src = b.getAttribute("data-art"), n = String(i + 1).padStart(2, "0");
    var d = document.createElement("button"); d.type = "button"; d.className = "al-gdisc"; d.style.setProperty("--i", i);
    d.setAttribute("aria-label", "CD " + n + " 크게 보기");
    d.innerHTML = '<span class="al-gdisc__art" style="background-image:url(\'' + src + '\')"></span><span class="al-gdisc__hole"></span>';   /* CD 위 번호는 뺌 (학생 요청) — 크게 볼 때만 번호 */
    d.addEventListener("click", function (e) { e.stopPropagation(); bImg.src = src; bImg.alt = alt(src); bCap.textContent = n; box.classList.add("is-open"); });
    gin.appendChild(d);
  });
  document.body.appendChild(grid);
  function closeGrid() { grid.classList.remove("is-open"); }
  caseEl.setAttribute("role", "button"); caseEl.setAttribute("tabindex", "0"); caseEl.setAttribute("aria-label", "CD 여섯 장 펼쳐 보기");
  caseEl.addEventListener("click", function () { grid.classList.add("is-open"); });
  caseEl.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); grid.classList.add("is-open"); } });
  grid.addEventListener("click", function (e) { if (e.target === grid || e.target.classList.contains("al-grid__close") || e.target === gin) closeGrid(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.classList.contains("is-open")) closeGrid(); });

  /* 재생 버튼 (학생 요청 · KiiiKiii 'Pop Off Pop Off') — 소리는 나지 않고 '재생되는 것처럼'만 보인다:
     누르면 ▶ → ❚❚, 옆 막대(이퀄라이저)가 움직이고 CD 가 케이스 밖으로 나와 돈다. 다시 누르면 멈춘다.
     (이전: 유튜브 공식 MV 를 플레이어로 재생 — 내 컴퓨터에서 파일로 열면 유튜브가 막아서 학생 요청으로 뺌) */
  var playBtn = sec.querySelector(".al-playbtn"), icon = sec.querySelector(".al-playbtn__icon");
  function setPlaying(on) {
    playing = on; icon.textContent = on ? "❚❚" : "▶"; playBtn.setAttribute("aria-label", on ? "일시정지" : "KiiiKiii Pop Off Pop Off 재생");
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.classList.toggle("is-on", on); pack.classList.toggle("is-playing", on);
    if (on) { clearTimeout(timer); pack.classList.add("is-out"); } else stop();
  }
  playBtn.addEventListener("click", function () { setPlaying(!playing); });

  /* 사진 미리 받아 두기 — CD 그림이 바뀔 때 비지 않게 */
  tracks.concat(bonus).forEach(function (el) { var i = new Image(); i.src = el.getAttribute("data-art"); });
})();
