/* 사례형 — sig.js (classic script · 의존성 0 · file:// 동작)
   1) my-style.css 의 --my-* 를 읽어 <html> 클래스와 파생 색을 정한다
   2) 제목 폭 맞춤(폰트 로드 후 실제 폭을 잰다 · 넘치면 어절 경계에서 두 줄)
   3) 정보 카드가 바닥에 닿으면 멈추도록 sticky top 을 계산한다 (레퍼런스 ScrollTrigger pin 을 CSS sticky 로)
   4) 이미지 줄이 화면 아래 15% 선을 넘으면 한 번 떠오른다 (레퍼런스 IntersectionObserver 규칙)
   5) 관련 작업 타일: 캡션 높이를 재서 hover 때 사진이 그만큼 걷히게 한다
   스크롤을 가로채지 않는다(레퍼런스의 ScrollSmoother 관성 스크롤은 옮기지 않음). 숫자는 tokens.css 에서 읽는다. */
(function () {
  "use strict";
  var root = document.documentElement;
  var cs = getComputedStyle(root);
  function v(name) { return cs.getPropertyValue(name).trim(); }
  function pick(val, list, fb) { return list.indexOf(val) > -1 ? val : fb; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ── 1. 커스텀 항목 ─────────────────────────────── */
  var my = {
    bg: v("--my-bg") || v("--c-page"),
    point: v("--my-point") || "none",
    type: pick(v("--my-type"), ["sans", "serif", "mono", "hand"], "sans"),
    motion: pick(v("--my-motion"), ["0", "1", "2"], "1"),
    density: pick(v("--my-density"), ["0", "1", "2"], "1"),
    image: pick(v("--my-image"), ["native", "original", "mono", "tint"], "native")
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) my.motion = "0";

  function rgb(str) {
    var c = document.createElement("canvas").getContext("2d");
    c.fillStyle = "#010203"; c.fillStyle = str;
    var h = c.fillStyle;
    if (h === "#010203" && str.toLowerCase() !== "#010203") return null;
    if (h.charAt(0) === "#") return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
    var m = h.match(/\d+(\.\d+)?/g); return m ? [+m[0], +m[1], +m[2]] : null;
  }
  function lum(c) {
    var a = c.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  function css(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }
  function set(k, c) { root.style.setProperty(k, css(c)); }

  var bgRGB = rgb(my.bg) || rgb(v("--c-page"));
  var darkBg = contrast(bgRGB, [255, 255, 255]) > contrast(bgRGB, [0, 0, 0]);
  var inkRGB = rgb(v(darkBg ? "--c-ink-inverse" : "--c-ink"));
  var stageRGB = rgb(v("--c-stage"));
  set("--bg", bgRGB);
  set("--ink", inkRGB);
  /* 레퍼런스 비율: 칩 바탕 #EDEDED = 흰 바탕에서 먹 쪽 7% · 칩 글자 #808080 = 50% · 글 카드 #F9F9FB ≈ 2.5% */
  set("--tag-bg", mix(bgRGB, inkRGB, 0.07));
  var tagInk = mix(bgRGB, inkRGB, 0.5), t0 = 0.5;
  while (contrast(tagInk, mix(bgRGB, inkRGB, 0.07)) < 3 && t0 < 1) { t0 += 0.05; tagInk = mix(bgRGB, inkRGB, t0); }
  set("--tag-ink", tagInk);
  set("--note-bg", mix(bgRGB, inkRGB, 0.025));

  var pointRGB = my.point !== "none" ? rgb(my.point) : null;
  var pointFace = pointRGB || rgb(v(darkBg ? "--c-ink-inverse" : "--c-button"));
  set("--point", pointFace);
  /* 버튼 글자: 포인트 면 위에서 더 잘 읽히는 쪽 */
  var light = rgb(v("--c-ink-inverse")), dark = rgb(v("--c-ink"));
  set("--on-point", contrast(pointFace, light) >= contrast(pointFace, dark) ? light : dark);
  /* 의뢰인 이름 글자: 포인트를 바탕 대비 4.5:1 이 될 때까지 먹 쪽으로 (면 색은 그대로) */
  var pInk = pointRGB || inkRGB, t = 0;
  while (contrast(pInk, bgRGB) < 4.5 && t < 1) { t += 0.05; pInk = mix(pointRGB || inkRGB, inkRGB, t); }
  set("--point-ink", pInk);
  if (t > 0) root.setAttribute("data-point-adjusted", t.toFixed(2));
  /* 푸터 화살표: 검정 무대 위 포인트 (4.5:1 미만이면 흰 쪽으로) */
  if (pointRGB) {
    var pS = pointRGB, u = 0;
    while (contrast(pS, stageRGB) < 4.5 && u < 1) { u += 0.05; pS = mix(pointRGB, light, u); }
    set("--point-on-stage", pS);
  }
  set("--tint", pointRGB || mix(bgRGB, inkRGB, 0.35));

  var cls = ["t-" + my.type, "m-" + my.motion, "d-" + my.density, "i-" + my.image];
  if (my.motion !== "0") cls.push("m-on");
  if (darkBg) cls.push("is-dark");
  cls.forEach(function (c) { root.classList.add(c); });

  /* ── 2. 콘텐츠 준비 ─────────────────────────────── */
  var heroImg = $(".cs-hero__img");
  if (heroImg && !heroImg.getAttribute("src")) { var f = heroImg.closest("figure"); if (f) f.parentNode.removeChild(f); heroImg = null; }
  $$(".cs-card").forEach(function (card) { if (!$(".cs-card__clip img[src]:not([src=''])", card)) { var c = $(".cs-card__clip", card); if (c) c.parentNode.removeChild(c); card.classList.add("no-img"); } });
  /* 모바일: 처음으로 버튼을 목록 아래에 한 번 더 (레퍼런스와 같은 자리) */
  var home = $(".cs-related__head .cs-home"), rel = $(".cs-related");
  if (home && rel && !$(".cs-related > .cs-home")) { var h2 = home.cloneNode(true); rel.appendChild(h2); }

  /* ── 3. 제목 폭 맞춤 ─────────────────────────────── */
  var title = $(".cs-title"), text = $(".cs-title__text");
  var original = text ? text.textContent.replace(/\s+/g, " ").trim() : "";
  function px(name) { return parseFloat(v(name)) || 0; }
  function fitTitle() {
    if (!title || !text) return;
    var maxF = px("--fs-title-max"), minF = px("--fs-title-min");
    var pad = parseFloat(getComputedStyle(title).paddingLeft) || 0;
    var avail = title.clientWidth - pad * 2, availH = title.clientHeight * 0.62;
    /* 한 줄로 잰 크기 */
    title.classList.remove("is-wrap");
    title.style.setProperty("--title-fs", "100px");
    var fs1 = Math.min(maxF, 100 * avail / (text.getBoundingClientRect().width || 1));
    /* 여러 줄(어절 경계에서만, 줄 길이 균형, 최대 4줄)로 잰 크기: 가장 긴 어절이 폭 안 · 전체 높이가 화면 62% 안 */
    title.classList.add("is-wrap");
    var lo = minF, hi = maxF, fsN = minF;
    for (var k = 0; k < 14; k++) {
      var mid = (lo + hi) / 2;
      title.style.setProperty("--title-fs", mid + "px");
      var hh = text.getBoundingClientRect().height;
      var ok = text.scrollWidth <= text.clientWidth + 1 && hh <= availH && hh <= mid * 1.02 * 4.3;   /* 최대 4줄 */
      if (ok) { fsN = mid; lo = mid; } else hi = mid;
    }
    /* 여러 줄이 한 줄보다 1.3배 이상 클 때만 줄을 나눈다 (레퍼런스 로고는 한 줄) */
    if (fsN > fs1 * 1.3) { title.style.setProperty("--title-fs", Math.floor(fsN) + "px"); }
    else { title.classList.remove("is-wrap"); title.style.setProperty("--title-fs", Math.max(minF, Math.floor(fs1)) + "px"); }
  }

  /* 푸터 연락 한 줄: 화면 폭(여백 제외)을 넘지 않게 */
  var cta = $(".cs-cta");
  function fitCta() {
    if (!cta) return;
    var max = px("--fs-cta"), avail = cta.parentNode.clientWidth - 60;
    var floor = Math.min(max, Math.max(32, avail * 0.11));   /* 이보다 작아지면 한 줄을 포기하고 어절 경계에서 접는다 */
    cta.classList.remove("is-wrap");
    cta.style.setProperty("--cta-fs", "100px");
    var fs = Math.min(max, 100 * avail / cta.scrollWidth);
    if (fs < floor) { cta.classList.add("is-wrap"); fs = floor; }
    cta.style.setProperty("--cta-fs", Math.floor(fs) + "px");
  }

  /* ── 4. 카드 멈춤 위치 · 캡션 높이 ─────────────────── */
  var intro = $(".cs-intro");
  function layout() {
    if (intro) root.style.setProperty("--intro-top", Math.min(0, window.innerHeight - intro.offsetHeight) + "px");
    $$(".cs-card").forEach(function (card) {
      var cap = $(".cs-card__cap", card);
      if (cap) card.style.setProperty("--cap-h", cap.offsetHeight + "px");
    });
  }

  function all() { fitTitle(); fitCta(); layout(); }
  all();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(all, 120); });

  /* ── 5. 떠오름 (한 번만) ─────────────────────────── */
  var targets = $$(".cs-row, .cs-related");
  if (my.motion !== "0" && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { root: null, rootMargin: "0px 0px " + (v("--reveal-margin") || "-15%") + " 0px", threshold: 0 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* 로드 등장 */
  function ready() { root.classList.add("is-ready"); }
  if (heroImg && !heroImg.complete) { heroImg.addEventListener("load", ready); heroImg.addEventListener("error", ready); setTimeout(ready, 1500); }
  else requestAnimationFrame(function () { requestAnimationFrame(ready); });
})();
