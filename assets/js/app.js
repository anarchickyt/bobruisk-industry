(function () {
  "use strict";
  const C = window.COMPANIES, IND = window.INDUSTRIES, COL = window.COLLEGES;
  C.forEach((c, i) => c.n = i + 1);
  const byId = Object.fromEntries(C.map(c => [c.id, c]));
  const NO_LOGO = new Set(["masla", "fandok"]);
  const img = (c, f) => `assets/img/${c.id}/${f}`;
  const logo = c => NO_LOGO.has(c.id) ? null : img(c, "logo.png");
  const D = f => `assets/deco/${f}`;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const fmt = n => n.toLocaleString("ru-RU").replace(/ /g, " ");
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; };
  const pay = v => v.min && v.max ? (v.min === v.max ? fmt(v.min) : `${fmt(v.min)}–${fmt(v.max)}`) : v.min ? `от ${fmt(v.min)}` : v.max ? `до ${fmt(v.max)}` : null;
  const titleName = c => c.name.replace(/^(ОАО|ЗАО|СООО)\s+/, "");

  /* профессии: общий индекс */
  const ALIAS = { "инженер-сметчик": "Инженер по сметной работе" };
  const profMap = new Map();
  C.forEach(c => c.specialties.forEach(s => {
    const name = ALIAS[s.toLowerCase()] || s, key = name.toLowerCase();
    if (!profMap.has(key)) profMap.set(key, { name, companies: [] });
    const p = profMap.get(key); if (!p.companies.includes(c)) p.companies.push(c);
  }));
  const profs = [...profMap.values()].sort((a, b) => b.companies.length - a.companies.length || a.name.localeCompare(b.name, "ru"));
  const hasVacancy = (c, prof) => c.vacancies.some(v => v.title.toLowerCase().includes(prof.toLowerCase()));

  /* ================= HOME: все заводы ================= */
  let filter = "all";
  function home() {
    const staff = C.reduce((s, c) => s + c.staff, 0), vac = C.reduce((s, c) => s + c.vacancies.length, 0);
    const inds = Object.keys(IND).filter(k => C.some(c => c.industry === k));
    const list = C.filter(c => filter === "all" || c.industry === filter);
    return `<section class="slide fade-in">
      <h1 class="slide-title">Бобруйск промышленный<br>и инженерия: как, где, сколько</h1>
      <p class="slide-sub">Выберите предприятие, чтобы узнать, каких инженеров оно ищет, сколько платит и где этому учиться.</p>
      <div class="totals">
        <div class="total"><b>${C.length}</b><span>предприятий</span></div>
        <div class="total"><b>≈${fmt(Math.round(staff / 100) * 100)}</b><span>работающих</span></div>
        <div class="total"><b>${profs.length}</b><span>инженерных профессий</span></div>
        <div class="total"><b>${vac}</b><span>открытых вакансий</span></div>
      </div>
      <div class="filters" role="toolbar" aria-label="Отрасль">
        <button class="chip" data-f="all" aria-pressed="${filter === "all"}">Все</button>
        ${inds.map(k => `<button class="chip" data-f="${k}" aria-pressed="${filter === k}"><span class="dot" style="background:${IND[k].color}"></span>${IND[k].name}</button>`).join("")}
      </div>
      <div class="board">
        ${list.map((c, i) => `<a class="card" href="#/c/${c.id}" style="--i:${i}">
          <img class="card__pin" src="${D("pin.png")}" alt="">
          <div class="card__photo"><img src="${img(c, "cover.jpg")}" alt="" loading="lazy"></div>
          <span class="card__num">${c.n}</span>
          <div class="card__name">${esc(c.name)}</div>
          <div class="card__meta">${IND[c.industry].name} · с ${c.founded} г.</div>
        </a>`).join("")}
      </div>
      <p class="foot">По материалам презентации «Бобруйск промышленный и инженерия: как, где, сколько». Вакансии — из открытых источников на ноябрь 2026 г.</p>
    </section>`;
  }
  app.addEventListener("click", e => {
    const f = e.target.closest("[data-f]"); if (!f) return;
    filter = f.dataset.f; render();
  });

  /* ================= COMPANY DECK ================= */

  function slideMain(c) {
    const lg = logo(c);
    const facts = [
      ["i-pin.svg", `г. Бобруйск, ${c.address}`],
      ["i-gear.svg", c.foundedNote],
      ["i-globe.svg", c.facts[0]],
      ["i-map.svg", c.facts[1]],
      ["i-people.svg", `Численность работающих — ${c.staffLabel} человек`]
    ];
    return `<div class="chero"><div class="chero__info"><div class="deck-head">
        <div class="deck-logo">${lg ? `<img src="${lg}" alt="Логотип">` : `<span>${esc(c.short)}</span>`}</div>
        <h1 class="deck-title"><small>${esc(c.form)}</small>«${esc(titleName(c).replace(/^«|»$/g, ""))}»${c.fullName ? `<small style="margin:8px 0 0">${esc(c.fullName)}</small>` : ""}</h1>
      </div>
      <ul class="facts">${facts.map(([i, t]) => `<li><img src="${D(i)}" alt="">${esc(t)}</li>`).join("")}</ul>
      <div class="rounds">
        <a class="round" href="#/c/${c.id}/spec"><span class="round__img"><img src="${D("worker.png")}" alt=""><span class="round__badge">${c.specialties.length}</span></span><span class="round__label">Специальности</span></a>
        <a class="round" href="#/c/${c.id}/edu"><span class="round__img"><img src="${D("study.png")}" alt=""></span><span class="round__label">Где учиться?</span></a>
        <a class="round" href="#/c/${c.id}/vac"><span class="round__img"><img src="${D("search.png")}" alt="">${c.vacancies.length ? `<span class="round__badge">${c.vacancies.length}</span>` : ""}</span><span class="round__label">Вакансии</span></a>
      </div></div>
      <div class="strip">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-photo="${img(c, `photo${i}.jpg`)}" aria-label="Фото ${i}"><img class="clip" src="${D("clip.png")}" alt=""><img class="ph" src="${img(c, `photo${i}.jpg`)}" alt="" loading="lazy"></button>`).join("")}</div></div>`;
  }

  function slideSpec(c) {
    return `<h2 class="slide-title">Направления инженерного профиля<small>${esc(c.name)}</small></h2>
      <div class="deck-grid">
        <div class="note"><b>${c.specialties.length}</b><span class="lbl">${plural(c.specialties.length, "специальность", "специальности", "специальностей")}</span><p>${esc(c.demand)}</p></div>
        <div class="paper"><ul class="speclist">${c.specialties.map(s => `<li>${esc(s)}${hasVacancy(c, s) ? "<em>есть вакансия</em>" : ""}</li>`).join("")}</ul></div>
      </div>`;
  }

  function slideVac(c) {
    if (!c.vacancies.length) return `<h2 class="slide-title">Актуальные вакансии<small>${esc(c.name)}</small></h2>
      <div class="paper paper--note novac"><img class="paperclip" src="${D("clip.png")}" alt="">
        <h3>Актуальных вакансий инженерной направленности нет</h3>
        <p>Но предприятию нужны специалисты ${c.specialties.length} инженерных направлений — смотрите <a href="#/c/${c.id}/spec">специальности</a> и <a href="#/c/${c.id}/edu">где учиться</a>.</p></div>`;
    return `<h2 class="slide-title">Актуальные вакансии<small>${esc(c.name)}</small></h2>
      <div class="paper vacs"><img class="paperclip" src="${D("clip.png")}" alt="">
        ${c.vacancies.map(v => { const p = pay(v); return `<div class="vac"><div class="vac__top">
          <span class="vac__t">${esc(v.title)}${v.tech ? '<span class="tag">рабочие / мастера</span>' : ""}</span>
          <span class="vac__pay${p ? "" : " none"}">${p ? p + " BYN" : "зарплата по собеседованию"}</span></div>
          ${v.note ? `<p>${esc(v.note)}</p>` : ""}
          ${v.phone ? `<p>Тел.: ${v.phone.split(", ").map(t => `<a href="tel:+375225${t.replace(/-/g, "")}">${t}</a>`).join(", ")}</p>` : ""}</div>`; }).join("")}
        <p class="src">Источник: ${esc(c.vacancySource || "открытые данные")}, ноябрь 2026. Уточняйте актуальность в отделе кадров.</p>
      </div>`;
  }

  function slideEdu(c) {
    const e = c.edu;
    return `<h2 class="slide-title">Где учиться?<small>${esc(c.name)}</small></h2>
      <p class="edu-req">${esc(e.requirement)}</p>
      ${e.directions ? `<div class="paper" style="max-width:1000px;margin:18px auto 0"><ul class="directions">${e.directions.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div>` : ""}
      <div class="edu-cols">
        <div class="paper edu-col"><h3>Высшее образование</h3>
          ${[e.university, e.university2].filter(Boolean).map(u => `<div class="edu-item"><b>${u.short}</b><p>${esc(u.text)}</p></div>`).join("")}
        </div>
        <div class="paper edu-col"><h3>Среднее специальное образование</h3>
          ${e.colleges.map(x => `<div class="edu-item"><b>${COL[x.id].short}</b> <span style="font-size:14px;color:var(--muted)">${esc(COL[x.id].name)}</span><p>${esc(x.text)}</p></div>`).join("")}
          ${(e.otherColleges || []).map(s => { const [n, d] = s.split(" — "); return `<div class="edu-item"><b style="font-size:18px">${esc(n)}</b>${d ? `<p>${esc(d)}</p>` : ""}</div>`; }).join("")}
          ${e.path ? `<div class="edu-path">${esc(e.path)}</div>` : ""}
          ${e.important ? `<div class="important"><b>Важно!</b> ${esc(e.important)}</div>` : ""}
        </div>
      </div>
      <details class="paper regions"><summary>Где получить высшее инженерное образование?</summary>${regionsHtml()}</details>`;
  }

  function regionsHtml() {
    return `<div class="region-grid">${window.UNIVERSITIES.map(r => `<div><h4>${r.region}</h4><ul>${r.items.map(([s, n]) => `<li><b>${s}</b> — ${esc(n)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  }

  function deck(c) {
    const ci = C.indexOf(c), prevC = C[(ci - 1 + C.length) % C.length], nextC = C[(ci + 1) % C.length];
    const np = (x, dir) => `<a class="np np--${dir}" href="#/c/${x.id}">
        <img src="${img(x, "cover.jpg")}" alt="">
        <span><small>${dir === "prev" ? "← Предыдущий завод" : "Следующий завод →"}</small>${esc(x.name)}</span></a>`;
    return `<div class="cpage fade-in" data-id="${c.id}" data-prev="#/c/${prevC.id}" data-next="#/c/${nextC.id}">
      <section class="slide cslide" id="s-main">
        <a class="backlink" href="#/"><img src="${D("back.png")}" alt="">Все заводы</a>
        ${slideMain(c)}
      </section>
      <section class="slide cslide" id="s-spec">${slideSpec(c)}</section>
      <section class="slide cslide" id="s-vac">${slideVac(c)}</section>
      <section class="slide cslide" id="s-edu">${slideEdu(c)}</section>
      <nav class="nextprev slide" aria-label="Другие заводы">${np(prevC, "prev")}${np(nextC, "next")}</nav>
    </div>`;
  }

  /* ================= MAP (Яндекс Карты) ================= */
  // Ключ JavaScript API Яндекс Карт (https://developer.tech.yandex.ru). Сейчас карта работает и без него;
  // если Яндекс начнёт требовать ключ — впишите его сюда.
  const YANDEX_API_KEY = "";
  let map = null, ymapsLoading = null;
  function loadYmaps() {
    if (window.ymaps) return Promise.resolve(window.ymaps);
    if (!ymapsLoading) ymapsLoading = new Promise((ok, fail) => {
      const s = document.createElement("script");
      s.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU" + (YANDEX_API_KEY ? "&apikey=" + encodeURIComponent(YANDEX_API_KEY) : "");
      s.onload = () => window.ymaps ? window.ymaps.ready(() => ok(window.ymaps)) : fail();
      s.onerror = () => { ymapsLoading = null; fail(); };
      document.head.appendChild(s);
    });
    return ymapsLoading;
  }
  function mapPage() {
    return `<section class="slide fade-in">
      <h1 class="slide-title">Где находятся предприятия</h1>
      <div class="mapwrap">
        <div class="paper mapframe"><div id="ymap" role="region" aria-label="Яндекс Карта Бобруйска"></div></div>
        <ol class="maplist">${C.map(c => `<li><a href="#/c/${c.id}" data-id="${c.id}"><span class="n">${c.n}</span><span><b>${esc(c.short)}</b><small>${esc(c.address)}</small></span></a></li>`).join("")}</ol>
      </div></section>`;
  }
  function initMap() {
    const box = $("#ymap");
    loadYmaps().then(ym => {
      if (!document.body.contains(box)) return; // пользователь уже ушёл со страницы карты
      map = new ym.Map(box, { center: [53.15, 29.21], zoom: 12, controls: ["zoomControl", "typeSelector", "fullscreenControl"] }, { autoFitToViewport: "always" });
      map.behaviors.disable("scrollZoom");
      const mk = {};
      C.forEach(c => {
        const pm = new ym.Placemark(c.coords,
          { iconContent: String(c.n), hintContent: `<b>${esc(c.short)}</b><br>${esc(c.address)}` },
          { preset: "islands#redCircleIcon" });
        pm.events.add("click", () => location.hash = `#/c/${c.id}`)
          .add("mouseenter", () => hl(c.id, true)).add("mouseleave", () => hl(c.id, false));
        map.geoObjects.add(pm); mk[c.id] = pm;
      });
      function hl(id, on) {
        mk[id].options.set("preset", on ? "islands#blackCircleIcon" : "islands#redCircleIcon");
        const a = $(`.maplist [data-id="${id}"]`); if (a) a.classList.toggle("is-hot", on);
      }
      app.querySelectorAll(".maplist [data-id]").forEach(a => { a.onmouseenter = () => hl(a.dataset.id, true); a.onmouseleave = () => hl(a.dataset.id, false); });
      map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
      map.events.add("click", () => map.behaviors.enable("scrollZoom"));
    }).catch(() => { box.innerHTML = '<p style="padding:20px">Яндекс Карта не загрузилась — проверьте подключение к интернету.</p>'; });
  }

  /* ================= PROFESSIONS ================= */
  let profQ = "";
  function profPage() {
    return `<section class="slide fade-in">
      <h1 class="slide-title">Какие инженеры нужны городу</h1>
      <p class="slide-sub">${profs.length} инженерных направлений на ${C.length} предприятиях. Число — сколько заводов ищут такого специалиста. Нажмите, чтобы увидеть где.</p>
      <label class="search"><img src="${D("search.png")}" alt=""><input id="profSearch" type="search" placeholder="технолог, энергетик, КИПиА…" value="${esc(profQ)}" aria-label="Поиск профессии"></label>
      <div class="paper" style="margin-top:26px"><ul class="proflist" id="profList"></ul></div>
    </section>`;
  }
  function renderProfs() {
    const q = profQ.trim().toLowerCase(), max = profs[0].companies.length;
    const list = profs.filter(p => !q || p.name.toLowerCase().includes(q));
    $("#profList").innerHTML = list.length ? list.map(p => `<li class="prof"><button type="button" aria-expanded="false">
      <span class="prof__n">${esc(p.name)}</span><span class="prof__bar"><i style="width:${p.companies.length / max * 100}%"></i></span><span class="prof__c">${p.companies.length}</span></button>
      <div class="prof__who">${p.companies.map(c => { const v = hasVacancy(c, p.name); return `<a href="#/c/${c.id}/${v ? "vac" : "spec"}"${v ? ' class="has"' : ""}>${esc(c.short)}${v ? " · вакансия" : ""}</a>`; }).join("")}</div></li>`).join("")
      : `<li style="padding:16px 0">Ничего не нашлось. Попробуйте «технолог», «механик» или «качеству».</li>`;
  }

  /* ================= SALARIES ================= */
  let salTech = true;
  function salPage() {
    const lo = 1000, hi = 4000, X = v => (v - lo) / (hi - lo) * 100, ticks = [1000, 1500, 2000, 2500, 3000, 3500, 4000];
    const rows = C.flatMap(c => c.vacancies.filter(v => (v.min || v.max) && (salTech || !v.tech)).map(v => Object.assign({ c }, v)))
      .sort((a, b) => (b.max || b.min) - (a.max || a.min) || (b.min || 0) - (a.min || 0));
    const grid = ticks.map(t => `<span class="sal__grid" style="left:${X(t)}%"></span>`).join("");
    return `<section class="slide fade-in">
      <h1 class="slide-title">Сколько платят</h1>
      <p class="slide-sub">Вилки зарплат в открытых вакансиях бобруйских предприятий, BYN в месяц (ноябрь 2026). Нажмите на строку, чтобы открыть вакансии завода.</p>
      <div class="filters"><button class="chip" id="salTech" aria-pressed="${!salTech}">Только инженерные должности</button></div>
      <div class="paper salchart">
        <div class="sal__axis"><div></div><div class="sal__ticks">${ticks.map(t => `<span style="left:${X(t)}%">${fmt(t)}</span>`).join("")}</div></div>
        ${rows.map(v => {
          let a, b, cls = v.tech ? "tech" : "";
          if (v.min && v.max) { a = v.min; b = v.max; }
          else if (v.min) { a = v.min; b = Math.min(v.min + 700, hi); cls += " open-r"; }
          else { a = Math.max(v.max - 900, lo); b = v.max; cls += " open-l"; }
          const right = X(b) > 78;
          return `<a class="sal__row" href="#/c/${v.c.id}/vac"><div class="sal__lab"><b>${esc(v.title)}</b><span>${esc(v.c.short)}</span><span class="sal__m">${pay(v)} BYN</span></div>
            <div class="sal__track">${grid}<span class="sal__bar ${cls}" style="left:${X(a)}%;width:${X(b) - X(a)}%"></span>
            <span class="sal__val" style="${right ? `right:${100 - X(a)}%;margin-right:8px` : `left:${X(b)}%;margin-left:${a === b ? 20 : 8}px`}">${pay(v)}</span></div></a>`;
        }).join("")}
        <div class="legend"><span><i></i>инженеры</span><span><i class="t"></i>техники, мастера, рабочие</span><span>бледный край — «от …» или «до …»</span></div>
      </div></section>`;
  }
  app.addEventListener("click", e => { if (e.target.closest("#salTech")) { salTech = !salTech; render(); } });

  /* ================= STUDY ================= */
  const UNI_INFO = {
    "БГТУ": { name: "Белорусский государственный технологический университет", city: "Минск", about: "Химия, шины и полимеры, деревообработка, пластмассы" },
    "БНТУ": { name: "Белорусский национальный технический университет", city: "Минск", about: "Машиностроение, тракторостроение, строительство" },
    "БГУТ": { name: "Белорусский государственный университет пищевых и химических технологий", city: "Могилёв", about: "Пищевая отрасль" },
    "БРУ":  { name: "Белорусско-Российский университет", city: "Могилёв", about: "Один из самых сильных машиностроительных факультетов страны" },
    "ВГТУ": { name: "Витебский государственный технологический университет", city: "Витебск", about: "Лёгкая промышленность, автоматизация, 3D-технологии" }
  };
  const unisOf = c => [c.edu.university, c.edu.university2].filter(Boolean);
  let studyId = C[0].id, studyRegion = 0;
  const logoChip = (c, cls = "") => {
    const lg = logo(c);
    return `<span class="lchip ${cls}">${lg ? `<img src="${lg}" alt="">` : `<b>${esc(c.short.slice(0, 2))}</b>`}</span>`;
  };

  function routeHtml(c) {
    const e = c.edu;
    const cols = e.colleges.map(x => ({ t: COL[x.id].short, s: COL[x.id].name, d: x.text }))
      .concat((e.otherColleges || []).map(s => { const [n, d] = s.split(" — "); return { t: n, s: "", d: d || "" }; }));
    return `<div class="route fade-in">
      <div class="route__col">
        <div class="route__tag">1 · Колледж</div>
        ${cols.length ? cols.map(x => `<div class="paper route__card"><b>${esc(x.t)}</b>${x.s ? `<small>${esc(x.s)}</small>` : ""}${x.d ? `<p>${esc(x.d)}</p>` : ""}</div>`).join("")
          : `<div class="paper route__card"><p>Профильный колледж в презентации не указан</p></div>`}
      </div>
      <div class="route__arrow" aria-hidden="true">→</div>
      <div class="route__col">
        <div class="route__tag">2 · Завод</div>
        <a class="paper route__card route__factory" href="#/c/${c.id}">
          <img class="route__photo" src="${img(c, "cover.jpg")}" alt="">
          <b>${esc(c.name)}</b>
          <p>${c.specialties.length} инженерных направлений${c.vacancies.length ? ` · ${c.vacancies.length} ${plural(c.vacancies.length, "вакансия", "вакансии", "вакансий")}` : ""}</p>
          <span class="route__more">Открыть страницу завода →</span>
        </a>
      </div>
      <div class="route__arrow" aria-hidden="true">→</div>
      <div class="route__col">
        <div class="route__tag">3 · Вуз (можно заочно)</div>
        ${unisOf(c).map(u => `<div class="paper route__card route__uni"><b>${u.short}</b><small>${UNI_INFO[u.short] ? UNI_INFO[u.short].city : ""}</small><p>${esc(u.text)}</p></div>`).join("")}
      </div>
    </div>
    <div class="route__req paper paper--note"><img class="paperclip" src="${D("clip.png")}" alt="">
      <b>Что нужно, чтобы стать инженером на «${esc(c.short)}»:</b>
      <p>${esc(e.requirement)}</p>
      ${e.directions ? `<ul>${e.directions.map(d => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
      ${e.important ? `<p class="route__imp"><b>Важно!</b> ${esc(e.important)}</p>` : ""}
    </div>`;
  }

  function regionTabs() {
    const U = window.UNIVERSITIES, r = U[studyRegion];
    return `<div class="tabs" role="tablist">${U.map((x, i) => `<button class="chip" role="tab" data-region="${i}" aria-selected="${i === studyRegion}" aria-pressed="${i === studyRegion}">${x.region}</button>`).join("")}</div>
      <div class="unigrid">${r.items.map(([s, n]) => `<div class="paper unicard${UNI_INFO[s] ? " is-key" : ""}"><b>${s}</b><p>${esc(n)}</p>${UNI_INFO[s] ? `<span class="unicard__tag">профильный для заводов Бобруйска</span>` : ""}</div>`).join("")}</div>`;
  }

  function studyPage() {
    const keyUnis = Object.keys(UNI_INFO).map(k => Object.assign({ k }, UNI_INFO[k], { for: C.filter(c => unisOf(c).some(u => u.short === k)) }));
    return `<section class="slide fade-in study">
      <div class="study__hero">
        <img src="${D("study.png")}" alt="">
        <div><h1 class="slide-title">Где учиться на инженера</h1>
        <p class="slide-sub">Выберите завод — и увидите весь путь: в какой колледж поступить, где работать и какой вуз закончить.</p></div>
      </div>

      <h2 class="h-sec">Построй свой маршрут</h2>
      <div class="picker" role="toolbar" aria-label="Выберите завод">${C.map(c => `<button type="button" class="pick" data-route="${c.id}" aria-pressed="${c.id === studyId}" title="${esc(c.name)}">${logoChip(c)}<span>${esc(c.short)}</span></button>`).join("")}</div>
      <div id="routeBox">${routeHtml(byId[studyId])}</div>

      <h2 class="h-sec">Путь к диплому без отрыва от работы</h2>
      <ol class="road">
        <li><span class="road__n">1</span><h3>Колледж в Бобруйске</h3><p>Квалификация техника: техник-технолог, техник-механик, техник-электроник. Заводы проводят в колледжах ярмарки вакансий и заключают договоры на целевую подготовку.</p></li>
        <li><span class="road__n">2</span><h3>Работа на заводе</h3><p>После колледжа — на предприятие техником. Стаж идёт, зарплата тоже.</p></li>
        <li><span class="road__n">3</span><h3>Заочно — в университет</h3><p>Сокращённая заочная форма в БНТУ, БРУ, БГТУ или БГУТ — и диплом инженера.</p></li>
        <li class="road__goal"><span class="road__n">★</span><h3>Инженер</h3><p>На «Белшине» инженером можно стать и со средним специальным образованием — при стаже техником 1-й категории от 3 лет.</p></li>
      </ol>

      <h2 class="h-sec">Профильные вузы</h2>
      <div class="keyunis">${keyUnis.map(u => `<div class="paper keyuni">
        <div class="keyuni__top"><b>${u.k}</b><span>${u.city}</span></div>
        <p class="keyuni__name">${esc(u.name)}</p>
        <p class="keyuni__about">${esc(u.about)}</p>
        <div class="keyuni__for"><small>Главный вуз для:</small><div>${u.for.map(c => `<a href="#/c/${c.id}/edu" title="${esc(c.name)}">${logoChip(c, "lchip--sm")}</a>`).join("")}</div></div>
      </div>`).join("")}</div>

      <h2 class="h-sec">Колледжи Бобруйска</h2>
      <div class="keyunis">${Object.entries(COL).map(([id, col]) => { const fs = C.filter(c => c.edu.colleges.some(x => x.id === id)); return `<div class="paper keyuni keyuni--col">
        <div class="keyuni__top"><b>${col.short}</b><span>${col.city}</span></div>
        <p class="keyuni__name">${esc(col.name)}</p>
        <div class="keyuni__for"><small>Готовит кадры для:</small><div>${fs.map(c => `<a href="#/c/${c.id}/edu" title="${esc(c.name)}">${logoChip(c, "lchip--sm")}</a>`).join("")}</div></div>
      </div>`; }).join("")}</div>

      <h2 class="h-sec">Все технические вузы страны</h2>
      <div class="paper regions-box" id="regionBox">${regionTabs()}</div>
    </section>`;
  }
  app.addEventListener("click", e => {
    const p = e.target.closest("[data-route]");
    if (p) { studyId = p.dataset.route; document.querySelectorAll("[data-route]").forEach(b => b.setAttribute("aria-pressed", b === p)); $("#routeBox").innerHTML = routeHtml(byId[studyId]); return; }
    const r = e.target.closest("[data-region]");
    if (r) { studyRegion = +r.dataset.region; $("#regionBox").innerHTML = regionTabs(); }
  });

  /* ================= ROUTER ================= */
  function route() {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    if (p[0] === "c" && byId[p[1]]) return { v: "deck", c: byId[p[1]], s: p[2] || "main" };
    if (["map", "professions", "salaries", "study"].includes(p[0])) return { v: p[0] };
    return { v: "home" };
  }
  let lastKey = "";
  function scrollToSection(sec, smooth) {
    const el = sec && sec !== "main" ? document.getElementById("s-" + sec) : null;
    if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    else window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }
  function render() {
    const r = route();
    const cp = $(".cpage");
    if (r.v === "deck" && cp && cp.dataset.id === r.c.id) { scrollToSection(r.s, true); lastKey = location.hash; return; }
    if (map) { map.destroy(); map = null; }
    app.innerHTML = r.v === "deck" ? deck(r.c) : r.v === "map" ? mapPage() : r.v === "professions" ? profPage() : r.v === "salaries" ? salPage() : r.v === "study" ? studyPage() : home();
    document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("is-on", a.dataset.nav === (r.v === "deck" ? "home" : r.v)));
    document.title = r.v === "deck" ? `${r.c.short} — Бобруйск промышленный` : "Бобруйск промышленный";
    if (r.v === "map") initMap();
    if (r.v === "professions") { renderProfs(); }
    const key = location.hash;
    if (key !== lastKey) { r.v === "deck" ? scrollToSection(r.s, false) : window.scrollTo(0, 0); lastKey = key; }
  }
  window.addEventListener("hashchange", render);

  app.addEventListener("input", e => { if (e.target.id === "profSearch") { profQ = e.target.value; renderProfs(); } });
  app.addEventListener("click", e => {
    const b = e.target.closest(".prof > button");
    if (b) { const li = b.parentElement, o = li.classList.toggle("is-open"); b.setAttribute("aria-expanded", o); return; }
    const ph = e.target.closest("[data-photo]");
    if (ph) { const lb = $("#lightbox"); lb.querySelector("img").src = ph.dataset.photo; lb.showModal(); }
  });
  $("#lightbox").addEventListener("click", () => $("#lightbox").close());

  /* клавиатура: ←/→ — соседний завод, Esc — все заводы */
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea, select") || $("#lightbox").open || e.altKey || e.ctrlKey || e.metaKey) return;
    const cp = $(".cpage"); if (!cp) return;
    if (e.key === "ArrowRight") location.hash = cp.dataset.next;
    else if (e.key === "ArrowLeft") location.hash = cp.dataset.prev;
    else if (e.key === "Escape") location.hash = "#/";
  });

  render();
})();
