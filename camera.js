/* 6주 커스텀 — 아카이브 시선 파트: 카메라 뷰파인더로 들어가기 (학생 요청)
   무대(화면 한 장)는 고정되고 스크롤 구간이 셋이다.
   ① 등장  — 흰 바탕에 카메라 뒷면이 아래에서 떠오르며 나타난다(아래에 '시선 / 4주 관점 한 문장').
   ② 들어감 — 스크롤할수록 카메라 뒷면 왼쪽 위 뷰파인더 접안부(고무 아이컵 안 유리, 3:2)로 다가가며 커지고, 창이 화면을 다 채우면 카메라는 사라진다.
             뷰파인더 창 안으로는 처음부터 첫 사진이 비쳐 보인다(창 모양 구멍).
   ③ 안에서 — 뷰파인더 표시(네 귀퉁이 · 가운데 초점 네모 · 묶음 · 번호) 너머로 사진 15장을 스크롤로 넘긴다.
             넘길 때 셔터처럼 아주 짧게 하얗게 번쩍이고, 묶음 첫 사진에서는 고른 이유 한 줄이 나온다.
   카메라는 찍는 사람 시점의 뒷면이고(학생 요청), SVG 에 금속·가죽 결·유리 반사·그림자를 겹쳐 실사처럼, 화면 전체를 원근으로 살짝 기울여 입체로 보이게 한다. */
(function () {
  var sec = document.querySelector(".cl-chapter.cam");
  if (!sec) return;
  var stage = sec.querySelector(".cam-stage"), svg = sec.querySelector(".cam-body");
  var imgA = sec.querySelector(".cam-img--a"), imgB = sec.querySelector(".cam-img--b");
  var cap = sec.querySelector(".cam-cap"), ui = sec.querySelector(".cam-ui"), flash = sec.querySelector(".cam-flash");
  var gEl = sec.querySelector(".cam-ui__group"), nEl = sec.querySelector(".cam-ui__count"), reasonEl = sec.querySelector(".cam-reason");
  var shots = [].slice.call(sec.querySelectorAll(".cam-list li")).map(function (li) {
    var im = li.querySelector("img");
    return { src: im.getAttribute("src"), alt: im.getAttribute("alt"), group: li.getAttribute("data-group"), reason: li.getAttribute("data-reason") };
  });
  var N = shots.length; if (!N) return;
  shots.forEach(function (s) { var p = new Image(); p.src = s.src; });

  var A = 0.7, B = 1.3, SEG = 0.45;     /* 등장 · 들어감 · 사진 한 장 (화면 높이 배수) */
  var rig = sec.querySelector(".cam-rig"), mx = 0, my = 0, camG = null, photo = sec.querySelector(".cam-photo"), NS = "http://www.w3.org/2000/svg", hole = { x: 0, y: 0, w: 0, h: 0 }, W = 0, H = 0;
  sec.classList.add("is-live");

  function el(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
  /* 카메라 그리기 — 찍는 사람 시점(카메라 뒷면) · 실사처럼 보이게 금속·가죽 결·유리 반사·그림자를 겹쳐 그린다.
     들어가는 창 = 왼쪽 위 뷰파인더 접안부(고무 아이컵 안 유리). 뒷면 화면(LCD)에는 지금 사진이 실시간 화면처럼 비친다. */
  var lcdImg = null;
  function build() {
    W = stage.clientWidth; H = stage.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.innerHTML = "";
    var cw = Math.min(W * 0.6, 820, H * 1.15), ch = cw * 0.6;
    var x = (W - cw) / 2, y = (H - ch) / 2 + ch * 0.1;
    function X(v) { return x + v * cw; } function Y(v) { return y + v * ch; }
    hole.w = cw * 0.105; hole.h = hole.w / 1.5; hole.x = X(0.38) - hole.w / 2; hole.y = Y(-0.035) - hole.h / 2;

    var big = { x: -W * 0.5, y: -H * 0.5, width: W * 2, height: H * 2 };   /* 화면 근처만 — 너무 크면 창 가장자리가 흐리게 그려진다 */
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="cb-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B3B3D"/><stop offset=".08" stop-color="#2A2A2C"/><stop offset=".6" stop-color="#1A1A1B"/><stop offset="1" stop-color="#0E0E0F"/></linearGradient>' +
      '<linearGradient id="cb-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A4A4D"/><stop offset=".5" stop-color="#2C2C2E"/><stop offset="1" stop-color="#1C1C1D"/></linearGradient>' +
      '<linearGradient id="cb-edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>' +
      '<radialGradient id="cb-rub" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#1E1E1F"/><stop offset=".7" stop-color="#0E0E0F"/><stop offset="1" stop-color="#060606"/></radialGradient>' +
      '<radialGradient id="cb-metal" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9A9A9E"/><stop offset=".35" stop-color="#55555A"/><stop offset=".8" stop-color="#232325"/><stop offset="1" stop-color="#151516"/></radialGradient>' +
      '<radialGradient id="cb-btn" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#5A5A5E"/><stop offset=".6" stop-color="#2A2A2C"/><stop offset="1" stop-color="#111"/></radialGradient>' +
      '<linearGradient id="cb-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="cb-dial" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1A1A1B"/><stop offset=".3" stop-color="#6E6E72"/><stop offset=".5" stop-color="#A5A5A9"/><stop offset=".7" stop-color="#6E6E72"/><stop offset="1" stop-color="#1A1A1B"/></linearGradient>' +
      '<pattern id="cb-ridge" width="' + (cw * 0.008).toFixed(2) + '" height="10" patternUnits="userSpaceOnUse"><rect width="' + (cw * 0.004).toFixed(2) + '" height="10" fill="#000" opacity=".45"/></pattern>' +
      '<filter id="cb-leather" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="' + (2.4 / cw * 100).toFixed(3) + '" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 .08  0 0 0 0 .08  0 0 0 0 .085  0 0 0 1.2 -.35" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in"/></filter>' +
      '<filter id="cb-shadow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="' + (ch * 0.06).toFixed(1) + '"/></filter>' +
      '<filter id="cb-soft"><feGaussianBlur stdDeviation="' + (cw * 0.002).toFixed(2) + '"/></filter>' +
      '<clipPath id="cb-lcd"><rect x="' + X(0.075) + '" y="' + Y(0.27) + '" width="' + cw * 0.52 + '" height="' + cw * 0.52 / 1.5 + '" rx="' + cw * 0.008 + '"/></clipPath>' +
      '<mask id="cam-hole" maskUnits="userSpaceOnUse" x="' + big.x + '" y="' + big.y + '" width="' + big.width + '" height="' + big.height + '">' +
        '<rect x="' + big.x + '" y="' + big.y + '" width="' + big.width + '" height="' + big.height + '" fill="#fff"/>' +
        '<rect x="' + hole.x + '" y="' + hole.y + '" width="' + hole.w + '" height="' + hole.h + '" rx="' + hole.h * 0.12 + '" fill="#000"/></mask>' +
      '</defs>' +
      '<g mask="url(#cam-hole)">' +
        '<rect x="' + big.x + '" y="' + big.y + '" width="' + big.width + '" height="' + big.height + '" fill="#FFFFFF"/>' +
        '<g class="cb-cam">' +
          /* 바닥 그림자 */
          '<ellipse cx="' + X(0.5) + '" cy="' + Y(1.06) + '" rx="' + cw * 0.46 + '" ry="' + ch * 0.07 + '" fill="#000" opacity=".28" filter="url(#cb-shadow)"/>' +
          /* 위쪽 다이얼·셔터 (몸체 뒤로 살짝 솟음) */
          '<rect x="' + X(0.66) + '" y="' + Y(-0.1) + '" width="' + cw * 0.15 + '" height="' + ch * 0.13 + '" rx="' + ch * 0.02 + '" fill="url(#cb-dial)"/>' +
          '<rect x="' + X(0.66) + '" y="' + Y(-0.1) + '" width="' + cw * 0.15 + '" height="' + ch * 0.13 + '" rx="' + ch * 0.02 + '" fill="url(#cb-ridge)"/>' +
          '<ellipse cx="' + X(0.9) + '" cy="' + Y(-0.02) + '" rx="' + cw * 0.045 + '" ry="' + ch * 0.045 + '" fill="url(#cb-metal)"/>' +
          /* 몸체 */
          '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="' + ch * 0.09 + '" fill="url(#cb-body)"/>' +
          '<rect x="' + x + '" y="' + Y(0.16) + '" width="' + cw + '" height="' + ch * 0.8 + '" rx="' + ch * 0.06 + '" fill="#1C1C1D" filter="url(#cb-leather)"/>' +
          '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="' + ch * 0.09 + '" fill="url(#cb-edge)"/>' +
          '<rect x="' + X(0.02) + '" y="' + Y(0.012) + '" width="' + cw * 0.96 + '" height="' + Math.max(1, ch * 0.006) + '" rx="1" fill="#fff" opacity=".22"/>' +
          /* 손잡이(오른쪽 엄지 자리) */
          '<rect x="' + X(0.86) + '" y="' + Y(0.14) + '" width="' + cw * 0.14 + '" height="' + ch * 0.8 + '" rx="' + ch * 0.07 + '" fill="#121213"/>' +
          '<rect x="' + X(0.86) + '" y="' + Y(0.14) + '" width="' + cw * 0.14 + '" height="' + ch * 0.8 + '" rx="' + ch * 0.07 + '" fill="#1B1B1C" filter="url(#cb-leather)" opacity=".9"/>' +
          /* 뷰파인더 몸통 + 고무 아이컵 */
          '<rect x="' + X(0.26) + '" y="' + Y(-0.2) + '" width="' + cw * 0.24 + '" height="' + ch * 0.36 + '" rx="' + ch * 0.06 + '" fill="url(#cb-plate)"/>' +
          '<rect x="' + X(0.27) + '" y="' + Y(-0.188) + '" width="' + cw * 0.22 + '" height="' + Math.max(1, ch * 0.006) + '" fill="#fff" opacity=".25"/>' +
          '<rect x="' + X(0.295) + '" y="' + Y(-0.155) + '" width="' + cw * 0.17 + '" height="' + ch * 0.24 + '" rx="' + ch * 0.07 + '" fill="url(#cb-rub)" stroke="#000" stroke-width="' + cw * 0.003 + '"/>' +
          '<rect x="' + (hole.x - cw * 0.01) + '" y="' + (hole.y - cw * 0.01) + '" width="' + (hole.w + cw * 0.02) + '" height="' + (hole.h + cw * 0.02) + '" rx="' + hole.h * 0.2 + '" fill="#050505"/>' +
          /* 뒷면 화면(LCD) — 지금 사진이 실시간 화면처럼 */
          '<rect x="' + X(0.065) + '" y="' + (Y(0.27) - cw * 0.01) + '" width="' + cw * 0.54 + '" height="' + (cw * 0.52 / 1.5 + cw * 0.02) + '" rx="' + cw * 0.014 + '" fill="#070707" stroke="#333" stroke-width="' + Math.max(1, cw * 0.0015) + '"/>' +
          '<image class="cb-lcd-img" x="' + X(0.075) + '" y="' + Y(0.27) + '" width="' + cw * 0.52 + '" height="' + cw * 0.52 / 1.5 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#cb-lcd)" opacity=".9"/>' +
          '<g clip-path="url(#cb-lcd)" opacity=".55" stroke="#fff" stroke-width="1" fill="none">' +
            '<line x1="' + X(0.075 + 0.52 / 3) + '" y1="' + Y(0.27) + '" x2="' + X(0.075 + 0.52 / 3) + '" y2="' + (Y(0.27) + cw * 0.52 / 1.5) + '" opacity=".35"/>' +
            '<line x1="' + X(0.075 + 0.52 * 2 / 3) + '" y1="' + Y(0.27) + '" x2="' + X(0.075 + 0.52 * 2 / 3) + '" y2="' + (Y(0.27) + cw * 0.52 / 1.5) + '" opacity=".35"/>' +
            '<line x1="' + X(0.075) + '" y1="' + (Y(0.27) + cw * 0.52 / 4.5) + '" x2="' + X(0.595) + '" y2="' + (Y(0.27) + cw * 0.52 / 4.5) + '" opacity=".35"/>' +
            '<line x1="' + X(0.075) + '" y1="' + (Y(0.27) + cw * 0.52 * 2 / 4.5) + '" x2="' + X(0.595) + '" y2="' + (Y(0.27) + cw * 0.52 * 2 / 4.5) + '" opacity=".35"/>' +
            '<rect x="' + (X(0.335) - cw * 0.03) + '" y="' + (Y(0.27) + cw * 0.52 / 3 - cw * 0.02) + '" width="' + cw * 0.06 + '" height="' + cw * 0.04 + '" stroke-width="1.5"/>' +
          '</g>' +
          '<rect x="' + X(0.075) + '" y="' + Y(0.27) + '" width="' + cw * 0.52 + '" height="' + cw * 0.52 / 1.5 + '" fill="url(#cb-glass)" clip-path="url(#cb-lcd)"/>' +
          /* 오른쪽 버튼들 + 뒷 다이얼 */
          btn(0.72, 0.28, 0.026) + btn(0.8, 0.28, 0.026) + btn(0.72, 0.84, 0.022) + btn(0.92, 0.5, 0.02) +
          '<circle cx="' + X(0.78) + '" cy="' + Y(0.6) + '" r="' + cw * 0.075 + '" fill="url(#cb-metal)"/>' +
          '<circle cx="' + X(0.78) + '" cy="' + Y(0.6) + '" r="' + cw * 0.075 + '" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="' + cw * 0.008 + '" stroke-dasharray="' + (cw * 0.004).toFixed(2) + ' ' + (cw * 0.006).toFixed(2) + '"/>' +
          '<circle cx="' + X(0.78) + '" cy="' + Y(0.6) + '" r="' + cw * 0.04 + '" fill="url(#cb-btn)" stroke="#000" stroke-opacity=".5"/>' +
          /* 아이컵 유리 반사 (들어갈 때 사라짐) */
          '<rect class="cb-eyeglare" x="' + hole.x + '" y="' + hole.y + '" width="' + hole.w + '" height="' + hole.h + '" rx="' + hole.h * 0.12 + '" fill="url(#cb-glass)"/>' +
        '</g>' +
      '</g>';
    function btn(px, py, r) {
      return '<circle cx="' + X(px) + '" cy="' + Y(py) + '" r="' + cw * r + '" fill="url(#cb-btn)" stroke="#000" stroke-opacity=".6" stroke-width="' + Math.max(1, cw * 0.002) + '"/>' +
             '<circle cx="' + (X(px) - cw * r * 0.3) + '" cy="' + (Y(py) - cw * r * 0.35) + '" r="' + cw * r * 0.3 + '" fill="#fff" opacity=".12"/>';
    }
    camG = svg.querySelector(".cb-cam"); lcdImg = svg.querySelector(".cb-lcd-img"); glare = svg.querySelector(".cb-eyeglare");
    if (lcdImg && cur > -1) lcdImg.setAttribute("href", shots[Math.max(0, cur)].src);
    sec.style.height = ((A + B + N * SEG) * H + H) + "px";
  }
  var glare = null;

  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var cur = -1, useA = true;
  function show(i, withFlash) {
    if (i === cur) return;
    var s = shots[i], front = useA ? imgB : imgA, back = useA ? imgA : imgB;
    if (cur === -1) { imgA.src = s.src; imgA.alt = s.alt; imgA.classList.add("is-on"); imgB.classList.remove("is-on"); useA = true; }
    else { front.src = s.src; front.alt = s.alt; front.classList.add("is-on"); back.classList.remove("is-on"); useA = !useA; }
    if (withFlash && cur !== -1) { flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on"); }
    cur = i;
    if (lcdImg) lcdImg.setAttribute("href", s.src);
    gEl.textContent = s.group; nEl.textContent = String(i + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
    reasonEl.textContent = (i === 0 || shots[i - 1].group !== s.group) ? s.reason : "";
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = -sec.getBoundingClientRect().top / H;
    var hx = hole.x + hole.w / 2, hy = hole.y + hole.h / 2, cx = W / 2, cy = H / 2;
    var full = Math.max(W / hole.w, H / hole.h) * 1.08;
    var s = 1, tx = 0, ty = 0, camOp = 1, uiOp = 0, capOp = 0, appear = 1;
    if (y < A) {                                   /* ① 등장 */
      appear = ease(Math.max(0, Math.min(1, (y + 0.35) / (A + 0.35))));
      ty = (1 - appear) * H * 0.18; capOp = appear;
    } else if (y < A + B) {                        /* ② 들어감 */
      var t = ease((y - A) / B);
      s = 1 + (full - 1) * Math.pow(t, 2.2);
      var px = hx + (cx - hx) * t, py = hy + (cy - hy) * t;
      tx = px - s * hx; ty = py - s * hy;
      capOp = Math.max(0, 1 - t * 4);
      camOp = t > .94 ? 1 - (t - .94) / .06 : 1;
      uiOp = Math.max(0, (t - .82) / .18);
    } else { camOp = 0; uiOp = 1; s = full; }      /* ③ 안에서 */
    /* 3D 기울기 — 처음엔 카메라 뒷면을 살짝 내려다보는 각도(+마우스 따라 조금), 들어갈수록 정면으로 */
    var tilt = y < A ? 1 : (y < A + B ? Math.max(0, 1 - ease((y - A) / B) * 3) : 0);
    rig.style.transform = "perspective(1600px) rotateX(" + ((12 + my * 6) * tilt).toFixed(2) + "deg) rotateY(" + ((-8 + mx * 10) * tilt).toFixed(2) + "deg)";
    if (glare) glare.setAttribute("opacity", y < A ? "1" : Math.max(0, 1 - ((y - A) / B) * 5).toFixed(3));
    svg.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    svg.style.opacity = (y < A ? 1 : camOp).toFixed(3);
    if (camG) camG.setAttribute("opacity", (y < A ? appear : 1).toFixed(3));
    photo.style.opacity = (y < A ? appear : 1).toFixed(3);
    svg.style.visibility = camOp <= 0.001 && y >= A ? "hidden" : "visible";
    cap.style.opacity = capOp.toFixed(3);
    ui.style.opacity = uiOp.toFixed(3);
    /* 사진: 들어가는 동안엔 첫 장, 안에서는 스크롤만큼 */
    var i = y < A + B ? 0 : Math.min(N - 1, Math.floor((y - A - B) / SEG));
    show(i, true);
    var inside = y >= A + B;
    reasonEl.style.opacity = inside && reasonEl.textContent ? Math.min(1, ((y - A - B) / SEG - i) * 4).toFixed(3) : "0";
    stage.classList.toggle("is-inside", inside);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", function () { build(); update(); });
  stage.addEventListener("mousemove", function (e) { var r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = .5 - (e.clientY - r.top) / r.height; if (!ticking) { ticking = true; requestAnimationFrame(update); } });
  build(); update();
})();
