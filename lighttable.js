/* 6주 커스텀 — 아카이브 시선 파트 '라이트 테이블' (학생 요청 · 독특하고 감각적인 한 화면 배치)
   · 깊이 흔들림: 마우스 위치에 따라 사진마다 깊이(data-depth)만큼 따로 움직인다 → 테이블 위에 겹겹이 놓인 느낌
   · 집어 옮기기: 사진을 누른 채 끌면 집어 든 것처럼 살짝 커지고 그림자가 깊어지며 맨 위로 온다. 놓으면 그 자리에 내려놓는다.
   · 끌고 난 직후의 클릭은 뷰파인더 '크게 보기'로 넘기지 않는다. 터치 기기에서는 흔들림·끌기를 끄고(스크롤을 막지 않게) 그대로 둔다. */
(function () {
  var ch = document.querySelector(".cl-chapter.lt");
  if (!ch) return;
  var table = ch.querySelector(".lt-table");
  var prints = [].slice.call(ch.querySelectorAll(".lt-print"));
  if (!window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var z = prints.length + 1, state = prints.map(function (p, i) { p.style.zIndex = i + 1; return { el: p, d: parseFloat(p.getAttribute("data-depth")) || .6, dx: 0, dy: 0 }; });
  var mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0;

  function frame() {
    raf = 0;
    mx += (tmx - mx) * .08; my += (tmy - my) * .08;
    state.forEach(function (s) {
      var amp = reduce ? 0 : 26 * s.d;
      s.el.style.setProperty("--px", (-mx * amp).toFixed(2) + "px");
      s.el.style.setProperty("--py", (-my * amp).toFixed(2) + "px");
      s.el.style.setProperty("--dx", s.dx.toFixed(1) + "px");
      s.el.style.setProperty("--dy", s.dy.toFixed(1) + "px");
    });
    if (Math.abs(tmx - mx) > .001 || Math.abs(tmy - my) > .001) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  table.addEventListener("mousemove", function (e) {
    var r = table.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width - .5; tmy = (e.clientY - r.top) / r.height - .5; kick();
  });
  table.addEventListener("mouseleave", function () { tmx = 0; tmy = 0; kick(); });

  var drag = null, justDragged = false;
  state.forEach(function (s) {
    s.el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      drag = { s: s, x: e.clientX, y: e.clientY, ox: s.dx, oy: s.dy, moved: 0 };
      s.el.style.zIndex = ++z; s.el.classList.add("is-lift");
      s.el.setPointerCapture && s.el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    s.el.addEventListener("pointermove", function (e) {
      if (!drag || drag.s !== s) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
      s.dx = drag.ox + dx; s.dy = drag.oy + dy; kick();
    });
    function up() {
      if (!drag || drag.s !== s) return;
      justDragged = drag.moved > 5; s.el.classList.remove("is-lift"); drag = null;
      if (justDragged) setTimeout(function () { justDragged = false; }, 0);
    }
    s.el.addEventListener("pointerup", up); s.el.addEventListener("pointercancel", up);
  });
  ch.addEventListener("click", function (e) { if (justDragged) { e.stopImmediatePropagation(); e.preventDefault(); justDragged = false; } }, true);
  kick();
})();
