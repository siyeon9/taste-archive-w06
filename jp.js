/* 6주 커스텀 — 아카이브 두 번째 화면 (학생 요청 · 참고: julienpianetti.com 첫 화면)
   참고 사이트 실측: 큰 제목 글자들이 처음에 일그러진 모양에서 제 모양으로 바뀌고, 글자에 마우스를 올리면 그 글자만 다른 모양으로 바뀐다.
   원 커서("Discover")가 제목 위에서 따라다니고, 오른쪽 아래 작은 화면에서 영상이 돈다.
   여기서는: 글자 서체는 바꾸지 않고(학생 요청), 원 커서를 유리 렌즈로 만들어 글씨가 비쳐 보이게 하고, 작은 화면은 사진 판 사진을 차례로 넘긴다. */
(function () {
  var sec = document.querySelector(".jp");
  if (!sec) return;
  var title = sec.querySelector(".jp-title");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 1. 글자 쪼개기 — 등장 효과용. (명조 겹 .jp-b 는 지금 쓰지 않음 · 호버 서체 변경은 학생 요청으로 뺌) */
  var chars = [];
  [].forEach.call(title.querySelectorAll(".jp-line"), function (line) {
    var t = line.textContent; line.textContent = "";
    for (var i = 0; i < t.length; i++) {
      var c = document.createElement("span");
      c.setAttribute("aria-hidden", "true");
      if (t[i] === " ") { c.className = "jp-ch jp-sp"; c.textContent = "\u00a0"; line.appendChild(c); continue; }
      c.className = "jp-ch";
      c.innerHTML = '<span class="jp-a"></span><span class="jp-b"></span>';
      c.firstChild.textContent = t[i]; c.lastChild.textContent = t[i];
      line.appendChild(c); chars.push(c);
    }
  });

  /* 2. 처음 등장 — 납작하고 흐린 글자가 하나씩 제 모양으로 (화면에 들어올 때 한 번) */
  function enter() {
    chars.forEach(function (c, i) { setTimeout(function () { c.classList.add("is-in"); }, reduce ? 0 : 200 + i * 70); });
  }
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { enter(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(title);
  } else enter();

  /* 3·4. 유리 원 커서 (학생 요청 — 글자 호버 서체 변경은 뺌)
     원 안에는 제목을 한 벌 더 복제해 1.3배로 키워 넣고, 원 자체는 뒤를 흐리게 비추는 유리 면이라
     글씨 위를 지나면 글씨가 유리에 굴절되어 비치는 것처럼 보인다. 마우스가 있는 기기에서만. */
  if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var lens = document.createElement("div"); lens.className = "jp-glass"; lens.setAttribute("aria-hidden", "true");
    /* 겉(.jp-glass)은 자리만 옮기고, 속(.jp-glass__body)이 유리 모양과 커지고 작아짐을 맡는다.
       (한 요소에 크기 변화(scale)와 이동(transform)을 같이 주면 작아질 때 이동 거리까지 줄어 마우스와 어긋났다 — 학생 지적으로 수정) */
    var body = document.createElement("div"); body.className = "jp-glass__body";
    var inner = document.createElement("div"); inner.className = "jp-glass__in";
    body.appendChild(inner); lens.appendChild(body); document.body.appendChild(lens);
    var clone = null, R = 58, ZOOM = 1.3;   /* 유리 지름 116px (이전 132px) */
    function makeClone() {
      if (clone) inner.removeChild(clone);
      clone = title.cloneNode(true);
      clone.removeAttribute("href"); clone.removeAttribute("aria-label");
      [].forEach.call(clone.querySelectorAll(".jp-b"), function (n) { n.parentNode.removeChild(n); });
      clone.className = "jp-title jp-glass__text";
      inner.appendChild(clone);
    }
    /* 움직임을 자연스럽게 (학생 요청) — 마우스 자리(tx,ty)를 목표로 두고 매 프레임 조금씩 따라가게(관성) 하며,
       위치는 left/top 대신 transform 으로만 옮겨 끊김을 줄인다 */
    var tx = 0, ty = 0, cx = 0, cy = 0, follow = 1, running = false, rect = null;   /* follow 1 = 마우스 자리에 정확히 (학생 요청 · 이전 0.32 관성) */
    function apply() {
      lens.style.transform = "translate3d(" + (cx - R).toFixed(2) + "px," + (cy - R).toFixed(2) + "px,0)";
      if (clone && rect) {
        clone.style.transformOrigin = (cx - rect.left).toFixed(2) + "px " + (cy - rect.top).toFixed(2) + "px";
        clone.style.transform = "translate3d(" + (rect.left - (cx - R)).toFixed(2) + "px," + (rect.top - (cy - R)).toFixed(2) + "px,0) scale(" + ZOOM + ")";
      }
    }
    function loop() {
      cx += (tx - cx) * follow; cy += (ty - cy) * follow;
      apply();
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) requestAnimationFrame(loop); else { cx = tx; cy = ty; apply(); running = false; }
    }
    function place(e, snap) {
      tx = e.clientX; ty = e.clientY; rect = title.getBoundingClientRect();
      if (clone) clone.style.width = rect.width + "px";
      if (snap) { cx = tx; cy = ty; apply(); return; }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    /* 두 번째 화면 안에서는 늘 작은 유리 점으로 따라다니고, 글자 위에 올라가면 커진다 (학생 요청) */
    sec.classList.add("has-glass");
    sec.addEventListener("mouseenter", function (e) { makeClone(); place(e, true); lens.classList.add("is-on"); });
    sec.addEventListener("mousemove", function (e) {
      if (!lens.classList.contains("is-on")) { makeClone(); place(e, true); lens.classList.add("is-on"); }
      place(e);
      var onChar = e.target.closest && e.target.closest(".jp-title .jp-ch:not(.jp-sp)");
      lens.classList.toggle("is-big", !!onChar);
    });
    sec.addEventListener("mouseleave", function () { lens.classList.remove("is-on", "is-big"); });
    window.addEventListener("scroll", function () { lens.classList.remove("is-on", "is-big"); }, { passive: true });
  }

  /* 5. 오른쪽 아래 작은 화면 — 사진 판 사진을 차례로 */
  var thumb = sec.querySelector(".jp-thumb img"), list = [];
  [].forEach.call(document.querySelectorAll(".src-list img, .cl-img img, .sw-item img, .bk-list img, .cam-list img, .al-list img"), function (im) { var s = im.getAttribute("src"); if (s && list.indexOf(s) < 0) list.push(s); });
  /* 일정한 속도로 (학생 요청): 사진을 모두 미리 받아 두고, 다 받은 사진만 0.7초마다 차례로 넘긴다.
     (전에는 넘길 때마다 큰 사진을 새로 받느라 받는 시간만큼 들쭉날쭉했다 · 이전 간격 0.9초) */
  if (thumb && list.length > 1 && !reduce) {
    var ready = list.map(function () { return false; });
    list.forEach(function (src, i) {
      var im = new Image();
      im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { ready[i] = true; }); };
      im.src = src;
    });
    ready[0] = true;
    var k = 0, INTERVAL = 800;   /* 0.8초 (학생 요청 · 이전 0.7초) */
    setInterval(function () {
      /* 화면에 보일 때만 넘김 — 실제 화면 위치(getBoundingClientRect)로 판단.
         (전에는 offsetTop 으로 판단했는데, 이 화면이 다른 상자 안에 있어 값이 0 근처라
          조금만 스크롤해도 '안 보임'으로 잘못 판단해 멈췄다 — 학생 지적으로 수정) */
      var r = sec.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) return;
      for (var step = 1; step <= list.length; step++) {
        var n = (k + step) % list.length;
        if (ready[n]) { k = n; thumb.src = list[k]; break; }
      }
    }, INTERVAL);
  }

  /* 6. 스크롤 연출 (학생 요청) — ① 첫 화면에서 내려오면 소개 문단이 먼저 올라와 위쪽에 고정되고
        ② 그다음 스크롤하는 만큼 큰 제목과 작은 사진이 아래에서 올라와 제자리에 선다.
        이 화면은 높이가 화면 2.3배라, 처음 1배는 문단 고정 + 제목 올라오기, 남은 만큼은 완성된 모습으로 잠시 머문다. */
  var pin = sec.querySelector(".jp-pin"), foot = sec.querySelector(".jp-foot"), lead = sec.querySelector(".jp-lead");
  if (pin && foot) {
    sec.classList.add("is-scrolly");
    var ticking = false;
    function scrolly() {
      ticking = false;
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, -r.top / vh));                    /* 0: 고정 시작 · 1: 제목이 제자리 */
      var e = 1 - Math.pow(1 - p, 3);                                    /* 끝으로 갈수록 부드럽게 멈춤 */
      foot.style.transform = "translate3d(0," + ((1 - e) * vh * 0.95).toFixed(1) + "px,0)";
      if (lead) lead.style.transform = r.top > 0 ? "translate3d(0," + (Math.min(r.top, vh) * 0.22).toFixed(1) + "px,0)" : "none";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(scrolly); } }, { passive: true });
    window.addEventListener("resize", scrolly);
    scrolly();
  }
})();
