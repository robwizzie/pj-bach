/* =============================================================
   PJ'S BACHELOR BLOWOUT — App Logic
   ============================================================= */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const opened = new Set();
  let lockedId = null;
  let soundOn = true;
  const groupSize = DEFAULT_GROUP; // 10 paying — there are 11 of us but PJ's covered 🍻
  let votes = {};
  let currentTripId = null;
  let activeFilter = null;     // { matchIds:Set, topId, summary }

  const VIBE_EMOJI = { Beach: "🏖️", Nightlife: "🌃", Billiards: "🎱", Food: "🍔", Chill: "😎" };
  const CATCHPHRASES = [
    "Ohhh, now we're talkin'! 🔥", "The crowd goes WILD! 👏", "Spicy choice, PJ! 🌶️",
    "I like where your head's at! 🧠", "That's a vibe. 😎", "Big move, big man! 💪",
    "Could this be THE one?? 👀", "Somebody's getting married! 💍"
  ];

  /* ---------- Persistence ---------- */
  const SAVE_KEY = "pj-bach-state";
  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ opened: [...opened], lockedId, soundOn, musicOn, votes }));
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      (s.opened || []).forEach((id) => opened.add(id));
      lockedId = s.lockedId || null;
      if (typeof s.soundOn === "boolean") soundOn = s.soundOn;
      if (typeof s.musicOn === "boolean") musicOn = s.musicOn;
      if (s.votes) votes = s.votes;
    } catch (e) {}
  }

  /* ---------- Helpers ---------- */
  const tripById = (id) => TRIPS.find((t) => t.id === id);
  const r10 = (x) => Math.round(x / 10) * 10;
  const money = (x) => "$" + r10(x).toLocaleString();
  function tripCost(trip, n) {
    let lo = 0, hi = 0;
    trip.costs.perPerson.forEach((c) => { lo += c.lo; hi += c.hi; });
    trip.costs.shared.forEach((c) => { lo += c.lo / n; hi += c.hi / n; });
    return { lo, hi };
  }
  const costRange = (trip, n) => { if (trip.free) return "FREE"; const c = tripCost(trip, n); return money(c.lo) + " – " + money(c.hi); };

  function showScreen(name) {
    ["intro", "stage", "compare"].forEach((s) => $("#" + s).classList.toggle("hidden", s !== name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Image slots ---------- */
  function imageSlot(slot, label) {
    const wrap = document.createElement("div");
    wrap.className = "image-slot";
    const ph = () => {
      wrap.innerHTML = '<div class="ph"><span class="cam">📸</span><span class="lbl">' + (label || "Add a photo") +
        '</span><span class="prm">AI prompt: ' + (slot.prompt || "") + '</span></div>';
    };
    if (slot.img) {
      const img = new Image();
      img.alt = label || "";
      img.onload = () => { wrap.innerHTML = ""; wrap.appendChild(img); };
      img.onerror = ph; img.src = slot.img; ph();
    } else ph();
    return wrap;
  }

  /* ---------- Sound & music engine (all synthesized, no audio files) ---------- */
  let actx = null, master = null, musicGain = null;
  let musicOn = true, musicTimer = null, beatIx = 0;

  function ensureAudio() {
    if (actx) { if (actx.state === "suspended") actx.resume(); return; }
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 0.9; master.connect(actx.destination);
      musicGain = actx.createGain(); musicGain.gain.value = 0.0001; musicGain.connect(master);
    } catch (e) { actx = null; }
  }
  function tone(freq, dur, type, when, gain, dest) {
    if (!soundOn) return; ensureAudio(); if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "triangle"; o.frequency.value = freq;
    const t = actx.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05);
  }
  // shaped noise (claps / applause / whoosh)
  let noiseBuf = null;
  function noiseSrc() {
    if (!noiseBuf) {
      noiseBuf = actx.createBuffer(1, actx.sampleRate * 1.8, actx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = actx.createBufferSource(); s.buffer = noiseBuf; return s;
  }
  function applause(dur, peak) {
    if (!soundOn) return; ensureAudio(); if (!actx) return;
    dur = dur || 1.6; peak = peak || 0.45;
    const src = noiseSrc(), bp = actx.createBiquadFilter(), g = actx.createGain();
    bp.type = "bandpass"; bp.frequency.value = 1700; bp.Q.value = 0.5;
    const t = actx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + dur);
  }
  function whoosh() {
    if (!soundOn) return; ensureAudio(); if (!actx) return;
    const src = noiseSrc(), bp = actx.createBiquadFilter(), g = actx.createGain();
    bp.type = "bandpass"; bp.Q.value = 1.1;
    const t = actx.currentTime;
    bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + 0.4);
  }
  function fanfare() {
    [523, 659, 784].forEach((f, i) => tone(f, .16, "sawtooth", i * .1, .15));
    tone(1047, .55, "sawtooth", .32, .2); tone(784, .55, "sawtooth", .32, .11); tone(659, .55, "sawtooth", .32, .09);
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const sfx = {
    open: () => { whoosh(); tone(520, .12, "square", 0); tone(760, .14, "square", .08); },
    click: () => tone(660, .06, "square", 0, .12),
    vote: () => { tone(700, .07, "square", 0, .14); tone(950, .08, "square", .06, .12); },
    beep: () => tone(880, .09, "square", 0, .16),
    ding: () => { tone(1320, .2, "triangle", 0, .2); tone(1760, .2, "triangle", .04, .12); },
    bell: () => { tone(1568, .25, "triangle", 0, .22); tone(2093, .32, "triangle", .12, .18); },
    buzzer: () => { tone(220, .18, "sawtooth", 0, .2); tone(150, .3, "sawtooth", .13, .2); },
    suspense: () => { for (let i = 0; i < 16; i++) tone(110 + (i % 2) * 28, .07, "square", i * .082, .05); },
    fanfare: fanfare,
    win: () => { fanfare(); applause(1.9, .5); }
  };

  /* ---------- Background music loop (light, cheesy game-show vibe) ---------- */
  const PROG = [ { r: 48, maj: true }, { r: 45, maj: false }, { r: 41, maj: true }, { r: 43, maj: true } ];
  function musicTone(freq, dur, type, gain) {
    if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function musicTick() {
    const ch = PROG[Math.floor(beatIx / 4) % PROG.length], b = beatIx % 4;
    const ints = ch.maj ? [0, 4, 7, 12] : [0, 3, 7, 12];
    if (b === 0 || b === 2) musicTone(mtof(ch.r), .5, "triangle", .16);      // bouncy bass
    musicTone(mtof(ch.r + 12 + ints[b]), .34, "triangle", .11);              // arpeggio melody
    if (b % 2 === 1) musicTone(mtof(ch.r + 24 + ints[b]), .12, "square", .035); // sparkle
    beatIx++;
  }
  function startMusic() {
    if (!soundOn || !musicOn) return; ensureAudio(); if (!actx || musicTimer) return;
    musicGain.gain.setTargetAtTime(0.5, actx.currentTime, 0.4);
    beatIx = 0; musicTick(); musicTimer = setInterval(musicTick, 535);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (musicGain && actx) musicGain.gain.setTargetAtTime(0.0001, actx.currentTime, 0.25);
  }
  function kickAudio() { ensureAudio(); if (actx && actx.state === "suspended") actx.resume(); startMusic(); }

  /* ---------- Confetti ---------- */
  const canvas = $("#confetti-canvas"), ctx = canvas.getContext("2d");
  let confetti = [];
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  addEventListener("resize", resize); resize();
  function burst(amount) {
    const colors = ["#ffd54a", "#ff4d9d", "#21c7e8", "#2ecc71", "#a05cff", "#ff6a3d"];
    for (let i = 0; i < (amount || 140); i++) confetti.push({
      x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * .3,
      r: 4 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
      vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4, rot: Math.random() * 6.28, vr: -.2 + Math.random() * .4
    });
  }
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += .04; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.4); ctx.restore();
    });
    confetti = confetti.filter((p) => p.y < canvas.height + 40);
    requestAnimationFrame(draw);
  })();

  /* ---------- Host toast ---------- */
  let toastTimer = null;
  function showToast(msg) {
    const t = $("#host-toast");
    t.innerHTML = '<img src="images/pj-face.png" onerror="this.style.display=\'none\'"><span>' + msg + '</span>';
    t.classList.remove("hidden"); t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.classList.add("hidden"), 300); }, 2600);
  }
  const randCatch = () => CATCHPHRASES[(Math.random() * CATCHPHRASES.length) | 0];

  /* ---------- Doors ---------- */
  function renderDoors() {
    const wrap = $("#doors");
    wrap.innerHTML = "";
    TRIPS.forEach((trip) => {
      const door = document.createElement("button");
      door.className = "door";
      door.dataset.id = trip.id;
      door.setAttribute("aria-label", "Door " + trip.door);

      if (activeFilter) {
        if (activeFilter.matchIds.has(trip.id)) door.classList.add("door-match");
        else door.classList.add("door-dim");
        if (activeFilter.topId === trip.id) door.classList.add("door-top");
      }

      const reveal = document.createElement("div");
      reveal.className = "door-reveal";
      reveal.innerHTML =
        '<div class="r-emoji">' + trip.emoji + '</div>' +
        '<div class="r-name">' + trip.name + '</div>' +
        '<div class="r-tag">' + trip.tagline + '</div>' +
        '<div class="r-price">' + costRange(trip, groupSize) + '</div>' +
        '<div class="r-open">Tap for details</div>';

      const face = document.createElement("div");
      face.className = "door-face";
      face.innerHTML =
        '<div class="door-number">' + trip.door + '</div>' +
        '<div class="door-knob"></div>' +
        (trip.peek ? '<div class="door-peek"><span class="dp-label">sneak peek</span><span class="dp-emoji">' + trip.peek + '</span></div>' : "") +
        '<div class="door-hint">Tap to reveal</div>';

      door.appendChild(reveal); door.appendChild(face);

      if (opened.has(trip.id)) { face.classList.add("open"); door.classList.add("is-open"); }
      if (lockedId === trip.id) door.classList.add("is-locked");
      if (activeFilter && activeFilter.topId === trip.id) {
        const rib = document.createElement("div"); rib.className = "match-ribbon"; rib.textContent = "⭐ BEST FIT"; door.appendChild(rib);
      }
      if (votes[trip.id]) {
        const vb = document.createElement("div"); vb.className = "door-votes"; vb.textContent = "👍 " + votes[trip.id]; door.appendChild(vb);
      }

      door.addEventListener("click", () => onDoorClick(trip.id, face, door));
      wrap.appendChild(door);
    });
    updateCounter(); updateHostLine();
  }

  function onDoorClick(id, face, door) {
    if (!opened.has(id)) {
      countdown(() => {
        face.classList.add("open"); door.classList.add("is-open");
        sfx.open(); burst(50); showToast(randCatch());
        setTimeout(() => openModal(id), 350);
      });
    } else { sfx.click(); openModal(id); }
  }

  function markOpened(id) {
    if (!opened.has(id)) {
      opened.add(id); save(); updateCounter(); updateHostLine();
      const d = document.querySelector('.door[data-id="' + id + '"]');
      if (d) { d.classList.add("is-open"); d.querySelector(".door-face").classList.add("open"); }
    }
  }
  const updateCounter = () => { $("#opened-count").textContent = opened.size; const t = $("#total-doors"); if (t) t.textContent = TRIPS.length; };
  function updateHostLine() {
    const line = $("#host-line"); if (!line) return;
    if (lockedId) { line.innerHTML = "🔒 Locked in! Hit a door to keep browsing, or Restart to play again."; return; }
    const n = opened.size;
    if (n === 0) line.innerHTML = "Tap a door to reveal the trip behind it. Peek at as many as you want before you pick.";
    else if (n < TRIPS.length) line.innerHTML = "<b>" + n + "</b> door" + (n > 1 ? "s" : "") + " open — found your trip yet, PJ? Keep peeking 👀 or lock one in.";
    else line.innerHTML = "You've seen all " + TRIPS.length + ", PJ! 🔥 Time to <b>lock in your winner</b>.";
  }

  /* ---------- Reveal countdown ---------- */
  let cdTimers = [];
  function countdown(cb) {
    const ov = $("#countdown-overlay"), num = $("#countdown-num");
    let n = 3;
    const show = () => { num.textContent = n; num.classList.remove("pop"); void num.offsetWidth; num.classList.add("pop"); sfx.beep(); };
    const finish = () => { cdTimers.forEach(clearTimeout); cdTimers = []; ov.classList.add("hidden"); ov.onclick = null; cb(); };
    ov.onclick = finish;
    ov.classList.remove("hidden"); sfx.suspense(); show();
    const step = () => { n--; if (n >= 1) { show(); cdTimers.push(setTimeout(step, 480)); } else { ov.classList.add("hidden"); ov.onclick = null; sfx.ding(); cb(); } };
    cdTimers.push(setTimeout(step, 480));
  }

  /* ---------- Compare: cards + table ---------- */
  function renderCompare() { renderCompareCards(); renderTable(); }

  function renderCompareCards() {
    const grid = $("#compare-grid"); grid.innerHTML = "";
    TRIPS.forEach((trip) => {
      const card = document.createElement("div");
      card.className = "compare-card" + (lockedId === trip.id ? " is-locked" : "");
      card.style.setProperty("--accent", trip.color);
      card.innerHTML =
        '<div class="cc-top"><span class="cc-emoji">' + trip.emoji + '</span><span class="cc-door">Door ' + trip.door + '</span></div>' +
        '<h3 class="cc-name">' + trip.name + '</h3>' +
        '<p class="cc-tag">' + trip.tagline + '</p>' +
        '<p class="cc-price">' + costRange(trip, groupSize) + ' <span class="cc-per">/ person</span></p>' +
        '<p class="cc-travel">' + trip.travel.short + '</p>' +
        '<div class="cc-actions">' +
          '<button class="cc-details">Details</button>' +
          '<button class="vote-btn" title="Vote for this trip">👍 <b>' + (votes[trip.id] || 0) + '</b></button>' +
          '<button class="cc-lock">' + (lockedId === trip.id ? "✅" : "Lock in") + '</button>' +
        '</div>';
      card.querySelector(".cc-details").onclick = () => openModal(trip.id);
      card.querySelector(".cc-lock").onclick = () => lockIn(trip.id);
      card.querySelector(".vote-btn").onclick = () => vote(trip.id);
      grid.appendChild(card);
    });
  }

  const dots = (v) => '<span class="dots">' + "●".repeat(v) + '<span class="o">' + "●".repeat(5 - v) + '</span></span>';

  function renderTable() {
    const wrap = $("#compare-table-wrap");
    let rows = TRIPS.map((trip) =>
      '<tr data-id="' + trip.id + '"' + (lockedId === trip.id ? ' class="row-locked"' : "") + '>' +
        '<td class="t-name"><b>' + trip.emoji + " " + trip.name + '</b><span>' + trip.tagline + '</span></td>' +
        '<td class="t-price">' + costRange(trip, groupSize) + '</td>' +
        '<td class="t-travel">' + trip.travel.short + '</td>' +
        '<td>' + trip.nights.replace(" at sea", "") + '</td>' +
        '<td>' + dots(trip.vibe.Beach) + '</td>' +
        '<td>' + dots(trip.vibe.Nightlife) + '</td>' +
        '<td>' + dots(trip.vibe.Billiards) + '</td>' +
        '<td><button class="vote-btn" data-id="' + trip.id + '">👍 <b>' + (votes[trip.id] || 0) + '</b></button></td>' +
        '<td><button class="t-pick" data-id="' + trip.id + '">Pick</button></td>' +
      '</tr>').join("");
    wrap.innerHTML =
      '<table class="compare-table"><thead><tr>' +
        '<th>Trip</th><th>Price / person</th><th>Getting there</th><th>Nights</th>' +
        '<th>🏖️</th><th>🌃</th><th>🎱</th><th>Votes</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="table-foot">Prices recalc with crew size above • 🏖️ beach · 🌃 nightlife · 🎱 billiards (out of 5) • swipe sideways on phones →</p>';
    wrap.querySelectorAll(".t-name, .t-price").forEach((c) => { c.style.cursor = "pointer"; c.onclick = () => openModal(c.parentElement.dataset.id); });
    wrap.querySelectorAll(".t-pick").forEach((b) => (b.onclick = () => lockIn(b.dataset.id)));
    wrap.querySelectorAll(".vote-btn").forEach((b) => (b.onclick = () => vote(b.dataset.id)));
  }

  function setView(view) {
    $$("#view-toggle .seg-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
    $("#compare-grid").classList.toggle("hidden", view !== "cards");
    $("#compare-table-wrap").classList.toggle("hidden", view !== "table");
  }

  /* ---------- Voting ---------- */
  function vote(id) {
    votes[id] = (votes[id] || 0) + 1; save(); sfx.vote();
    showToast("Vote counted for " + tripById(id).name.split(",")[0] + "! 👍");
    renderDoors();
    if (!$("#compare").classList.contains("hidden")) { renderCompareCards(); renderTable(); }
    const mv = $("#modal-vote-count"); if (mv && currentTripId === id) mv.textContent = votes[id];
  }

  /* ---------- Trip modal ---------- */
  function openModal(id) {
    const trip = tripById(id); currentTripId = id; markOpened(id); updateNav();
    const body = $("#modal-body"); body.innerHTML = "";

    const hero = document.createElement("div"); hero.className = "trip-hero zoomable";
    hero.appendChild(imageSlot(trip.hero, trip.name + " hero shot"));
    const ov = document.createElement("div"); ov.className = "trip-hero-overlay";
    ov.innerHTML = '<span class="th-door">Door ' + trip.door + '</span><h2>' + trip.emoji + " " + trip.name + '</h2><div class="tag">' + trip.tagline + '</div>';
    hero.appendChild(ov); body.appendChild(hero);
    hero.onclick = () => openLightbox(trip, 0);

    const wrap = document.createElement("div"); wrap.className = "trip-body";
    const chips = Object.keys(trip.vibe).filter((k) => trip.vibe[k] >= 4)
      .map((k) => '<span class="chip">' + (VIBE_EMOJI[k] || "") + " " + k + "</span>").join("");
    const travel = trip.travel || {};

    wrap.innerHTML =
      '<div class="price-row"><div class="price-main"><span class="pm-amt">' + costRange(trip, groupSize) + '</span>' +
        '<span class="pm-note">' + trip.priceNote + '</span></div>' + (chips ? '<div class="chips">' + chips + '</div>' : "") + '</div>' +
      (travel.badge ? '<div class="travel-badge ' + (travel.drivable ? "is-drive" : "is-fly") + '">' + travel.badge + '</div>' : "") +
      '<details class="cost-box" open><summary>💰 Where the money goes <span class="cb-tag">per person</span></summary>' +
        '<ul class="cost-list" id="m-costlist">' + costRowsHTML(trip, groupSize) + '</ul>' +
        '<div class="cost-total"><span>Estimated total each</span><b id="m-total">' + costRange(trip, groupSize) + '</b></div>' +
        '<p class="cost-foot">' + (trip.free
          ? "It's free. It's South Jersey. The only real cost is your dignity. 🦅🍺"
          : "Ballpark per person, split across the <b>10 of us paying</b> (PJ's covered 🍻). Flights are book-early fares from Philly (PHL) — always confirm before booking.") + '</p>' +
      '</details>' +
      '<div class="rundown">' +
        rd("🏨", "Where we stay", trip.stay) + rd("🍔", "Food", trip.food) + rd("🍻", "Drinks & bars", trip.drinks) +
        rd("🎱", "Billiards & activities", trip.billiards) + rd("🏖️", "Beach", trip.beach) + rd("🌃", "Nightlife", trip.nightlife) +
      '</div>' +
      (trip.catch ? '<div class="catch"><b>🤙 Real talk:</b> ' + trip.catch + '</div>' : "");

    const vibe = document.createElement("div"); vibe.className = "vibe";
    vibe.innerHTML = "<h4>📊 Vibe check</h4>" + Object.keys(trip.vibe).map((k) =>
      '<div class="vibe-row"><span>' + (VIBE_EMOJI[k] || "") + " " + k + '</span><div class="vibe-bar"><div class="vibe-fill" data-pct="' + (trip.vibe[k] * 20) + '"></div></div></div>').join("");
    wrap.appendChild(vibe);

    const why = document.createElement("div"); why.className = "why";
    why.innerHTML = '<img src="images/pj-face.png" alt="PJ" onerror="this.style.display=\'none\'"><div><h4>Why PJ will love it</h4><p>' + trip.why + '</p></div>';
    wrap.appendChild(why);

    const gt = document.createElement("h4"); gt.className = "gallery-title"; gt.textContent = "📸 How it'd actually go down (tap to expand)";
    wrap.appendChild(gt);
    const gal = document.createElement("div"); gal.className = "gallery";
    trip.gallery.forEach((g, i) => {
      const slot = imageSlot(g, trip.name + " pic " + (i + 1));
      slot.classList.add("zoomable");
      slot.onclick = () => openLightbox(trip, i + 1);
      gal.appendChild(slot);
    });
    wrap.appendChild(gal);

    const actions = document.createElement("div"); actions.className = "modal-actions";
    actions.innerHTML =
      '<button class="btn-lock">😍 Lock in ' + trip.name.split(",")[0] + '</button>' +
      '<button class="btn-vote">👍 Vote <b id="modal-vote-count">' + (votes[id] || 0) + '</b></button>' +
      '<button class="btn-secondary">👀 Back to doors</button>';
    wrap.appendChild(actions); body.appendChild(wrap);

    actions.querySelector(".btn-lock").onclick = () => lockIn(id);
    actions.querySelector(".btn-vote").onclick = () => vote(id);
    actions.querySelector(".btn-secondary").onclick = closeModal;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      body.querySelectorAll(".vibe-fill").forEach((f) => (f.style.width = f.dataset.pct + "%"));
    }));

    const overlay = $("#modal-overlay"); overlay.classList.remove("hidden"); overlay.scrollTop = 0; $("#modal").scrollTop = 0;
  }

  function costRowsHTML(trip, n) {
    const pp = trip.costs.perPerson.map((c) => '<li><span>' + c.label + '</span><b>' + money(c.lo) + " – " + money(c.hi) + '</b></li>').join("");
    const sh = trip.costs.shared.map((c) => '<li><span>' + c.label + ' <i>(split ' + n + ')</i></span><b>' + money(c.lo / n) + " – " + money(c.hi / n) + '</b></li>').join("");
    return pp + sh;
  }
  /* ---------- Lightbox (expand + per-trip carousel) ---------- */
  let lbList = [], lbIndex = 0, lbName = "";
  function openLightbox(trip, idx) {
    lbList = [trip.hero].concat(trip.gallery);
    lbName = trip.emoji + " " + trip.name;
    lbIndex = idx || 0;
    lbRender();
    $("#lightbox").classList.remove("hidden");
  }
  function lbRender() {
    const it = lbList[lbIndex];
    const img = $("#lb-img");
    img.classList.remove("loaded");
    img.onload = () => img.classList.add("loaded");
    img.onerror = () => img.classList.add("loaded");
    img.src = it.img; img.alt = lbName;
    $("#lb-cap").textContent = lbName + " — " + (lbIndex === 0 ? "the vibe" : "moment " + lbIndex);
    $("#lb-counter").textContent = (lbIndex + 1) + " / " + lbList.length;
    const multi = lbList.length > 1;
    $("#lb-prev").style.display = multi ? "" : "none";
    $("#lb-next").style.display = multi ? "" : "none";
  }
  function lbNav(dir) { if (!lbList.length) return; lbIndex = (lbIndex + dir + lbList.length) % lbList.length; sfx.click(); lbRender(); }
  function closeLightbox() { $("#lightbox").classList.add("hidden"); }

  const rd = (icon, label, text) => '<div class="rd-item"><span class="rd-ic">' + icon + '</span><div class="rd-txt"><b>' + label + '</b><p>' + text + '</p></div></div>';
  function closeModal() { $("#modal-overlay").classList.add("hidden"); currentTripId = null; }

  const openedTripList = () => TRIPS.filter((t) => opened.has(t.id));
  function updateNav() {
    const list = openedTripList(), n = list.length, idx = list.findIndex((t) => t.id === currentTripId);
    $("#nav-label").textContent = n > 1 ? "Opened door " + (idx + 1) + " of " + n : "Only door open";
    const off = n <= 1;
    [$("#prev-trip"), $("#next-trip")].forEach((b) => { b.disabled = off; b.classList.toggle("nav-off", off); b.title = off ? "Open more doors to flip between them" : "Flip between opened doors"; });
  }
  function navTrip(dir) {
    const list = openedTripList(); if (list.length <= 1) return;
    let idx = list.findIndex((t) => t.id === currentTripId); if (idx < 0) return;
    idx = (idx + dir + list.length) % list.length; sfx.click(); openModal(list[idx].id);
  }

  function dealersChoice() {
    const un = TRIPS.filter((t) => !opened.has(t.id));
    const pool = un.length ? un : TRIPS;
    const pick = pool[(Math.random() * pool.length) | 0];
    const door = document.querySelector('.door[data-id="' + pick.id + '"]');
    const face = door ? door.querySelector(".door-face") : null;
    // Reveal exactly like tapping the door itself (countdown + swing on first open)
    if (door && face) onDoorClick(pick.id, face, door);
    else { sfx.click(); openModal(pick.id); }
  }

  /* ---------- Lock in → finale ---------- */
  function lockIn(id) {
    lockedId = id; save(); closeModal(); closeShowdown();
    sfx.win(); burst(260); setTimeout(() => burst(180), 400); setTimeout(() => burst(180), 800);
    renderDoors(); showFinale(id);
  }
  function showFinale(id) {
    const trip = tripById(id);
    $("#finale-title").innerHTML = "PJ is going to… " + trip.emoji + "<br>" + trip.name + "!";
    const card = $("#finale-card"); card.innerHTML = "";
    const sum = document.createElement("div"); sum.className = "finale-summary";
    const hw = document.createElement("div"); hw.className = "fs-hero"; hw.appendChild(imageSlot(trip.hero, trip.name + " hero shot")); sum.appendChild(hw);
    const fb = document.createElement("div"); fb.className = "fs-body";
    fb.innerHTML = "<h3>" + trip.emoji + " " + trip.name + "</h3>" +
      "<p><b>" + costRange(trip, groupSize) + "</b> <span style='opacity:.7'>per person · " + trip.priceNote.replace("per person · ", "") + " · crew of " + groupSize + "</span></p><ul>" +
      (trip.travel && trip.travel.badge ? "<li>🧭 <b>Getting there:</b> " + trip.travel.badge + "</li>" : "") +
      "<li>🏨 <b>Stay:</b> " + trip.stay + "</li><li>🍔 <b>Food:</b> " + trip.food + "</li><li>🍻 <b>Drinks:</b> " + trip.drinks +
      "</li><li>🎱 <b>Billiards:</b> " + trip.billiards + "</li><li>🏖️ <b>Beach:</b> " + trip.beach + "</li><li>🌃 <b>Nightlife:</b> " + trip.nightlife + "</li></ul>";
    sum.appendChild(fb); card.appendChild(sum); $("#finale").classList.remove("hidden");
  }
  const closeFinale = () => $("#finale").classList.add("hidden");

  /* ---------- Help me decide ---------- */
  function openDecide() { sfx.click(); $("#decide-overlay").classList.remove("hidden"); }
  function closeDecide() { $("#decide-overlay").classList.add("hidden"); }
  function applyDecide() {
    const budget = +$("#budget-range").value;
    const pref = $("#travel-pref .seg-btn.is-active").dataset.pref;
    const beachReq = $("#beach-req").checked;
    const nightReq = $("#night-req").checked;
    const matches = TRIPS.filter((t) => {
      const okBudget = tripCost(t, groupSize).lo <= budget;
      const okTravel = pref === "any" || t.travel.drivable;
      const okBeach = !beachReq || t.vibe.Beach >= 3;
      return okBudget && okTravel && okBeach;
    });
    const score = (t) => t.vibe.Beach + t.vibe.Nightlife + t.vibe.Billiards + t.vibe.Food + (nightReq ? t.vibe.Nightlife * 2 : 0) - tripCost(t, groupSize).lo / 250;
    matches.sort((a, b) => score(b) - score(a));
    const parts = ["≤ " + money(budget), pref === "drive" ? "drive-only 🚗" : "fly OK ✈️"];
    if (beachReq) parts.push("beach 🏖️"); if (nightReq) parts.push("nightlife 🌃");
    if (matches.length) {
      activeFilter = { matchIds: new Set(matches.map((t) => t.id)), topId: matches[0].id, summary: parts.join(" · ") };
      $("#filter-banner").innerHTML = "🧭 <b>Best fits</b> (" + parts.join(" · ") + "): " +
        matches.map((t) => t.name.split(",")[0]).join(", ") + ". Top pick: <b>" + matches[0].name.split(",")[0] + "</b> ⭐ " +
        '<button class="clear-filter">clear ✕</button>';
      showToast("Top fit: " + matches[0].name.split(",")[0] + "! ⭐");
    } else {
      activeFilter = { matchIds: new Set(), topId: null, summary: parts.join(" · ") };
      $("#filter-banner").innerHTML = "😬 Nothing matched <b>" + parts.join(" · ") + "</b>. Loosen the budget or travel rule. " +
        '<button class="clear-filter">clear ✕</button>';
    }
    $("#filter-banner").classList.remove("hidden");
    $("#filter-banner").querySelector(".clear-filter").onclick = clearFilter;
    if (matches.length) sfx.ding(); else sfx.buzzer();
    closeDecide(); renderDoors(); showScreen("stage");
  }
  function clearFilter() { activeFilter = null; $("#filter-banner").classList.add("hidden"); renderDoors(); }

  /* ---------- Trip showdown (king of the hill) ---------- */
  let sdPool = [], sdChampion = null, sdMatch = 0, sdTotal = 0;
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function startShowdown() {
    sfx.click(); sdPool = shuffle(TRIPS); sdChampion = sdPool.shift(); sdMatch = 0; sdTotal = TRIPS.length - 1;
    $("#showdown-overlay").classList.remove("hidden"); renderMatch();
  }
  function closeShowdown() { $("#showdown-overlay").classList.add("hidden"); }
  function sdCard(trip, side) {
    return '<button class="sd-card" data-side="' + side + '" style="--accent:' + trip.color + '">' +
      '<div class="sd-emoji">' + trip.emoji + '</div><div class="sd-name">' + trip.name + '</div>' +
      '<div class="sd-tag">' + trip.tagline + '</div><div class="sd-price">' + costRange(trip, groupSize) + ' / person</div>' +
      '<div class="sd-pick">Pick this 👊</div></button>';
  }
  function renderMatch() {
    if (sdPool.length === 0) return renderChampion();
    const challenger = sdPool[0];
    $("#sd-progress").textContent = "Matchup " + (sdMatch + 1) + " of " + sdTotal + " — which trip wins?";
    $("#sd-arena").innerHTML = sdCard(sdChampion, "champ") + '<div class="sd-vs">VS</div>' + sdCard(challenger, "challenger");
    $$("#sd-arena .sd-card").forEach((c) => (c.onclick = () => {
      if (c.dataset.side === "challenger") sdChampion = challenger;
      sdPool.shift(); sdMatch++; sfx.bell(); burst(40); renderMatch();
    }));
  }
  function renderChampion() {
    const t = sdChampion; sfx.win(); burst(220);
    $("#sd-progress").textContent = "👑 Your champion!";
    $("#sd-arena").innerHTML =
      '<div class="sd-winner" style="--accent:' + t.color + '"><div class="sd-emoji">' + t.emoji + '</div>' +
        '<div class="sd-name">' + t.name + '</div><div class="sd-price">' + costRange(t, groupSize) + ' / person</div>' +
        '<div class="sd-winbtns"><button class="btn-lock" id="sd-lock">😍 Lock it in!</button>' +
        '<button class="btn-secondary" id="sd-again">🔁 Run it back</button>' +
        '<button class="btn-secondary" id="sd-details">See details</button></div></div>';
    $("#sd-lock").onclick = () => lockIn(t.id);
    $("#sd-again").onclick = startShowdown;
    $("#sd-details").onclick = () => { closeShowdown(); openModal(t.id); };
  }

  /* ---------- Confirm ---------- */
  let confirmCb = null;
  function askConfirm(text, cb) { $("#confirm-text").textContent = text; confirmCb = cb; $("#confirm-overlay").classList.remove("hidden"); }
  function closeConfirm(run) { $("#confirm-overlay").classList.add("hidden"); const cb = confirmCb; confirmCb = null; if (run && cb) cb(); }

  function fullReset() {
    opened.clear(); lockedId = null; currentTripId = null; activeFilter = null; votes = {}; save();
    $("#filter-banner").classList.add("hidden"); closeFinale(); closeModal(); closeShowdown();
    renderDoors(); showScreen("stage");
  }

  /* ---------- Share ---------- */
  function share() {
    const url = location.href.split("#")[0];
    const data = { title: "PJ's Bachelor Blowout", text: "Help PJ pick his bachelor trip — behind the doors! 🎉🦅", url };
    if (navigator.share) { navigator.share(data).catch(() => {}); }
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(() => showToast("Link copied — send it to the crew! 📋")).catch(() => showToast(url)); }
    else { showToast(url); }
  }

  /* ---------- Controls ---------- */
  $("#start-btn").addEventListener("click", () => { kickAudio(); sfx.fanfare(); showScreen("stage"); });
  $("#browse-btn").addEventListener("click", () => { kickAudio(); sfx.click(); renderCompare(); showScreen("compare"); });
  $("#share-btn").addEventListener("click", () => { sfx.click(); share(); });
  $("#home-btn").addEventListener("click", () => { sfx.click(); showScreen("intro"); });
  $("#seeall-btn").addEventListener("click", () => { renderCompare(); showScreen("compare"); });
  $("#stage-seeall").addEventListener("click", () => { renderCompare(); showScreen("compare"); });
  $("#dealer-btn").addEventListener("click", dealersChoice);
  $("#decide-btn").addEventListener("click", openDecide);
  $("#showdown-btn").addEventListener("click", startShowdown);
  $("#compare-back").addEventListener("click", () => showScreen("stage"));

  $$("#view-toggle .seg-btn").forEach((b) => (b.onclick = () => setView(b.dataset.view)));

  $("#modal-close").addEventListener("click", closeModal);
  $("#prev-trip").addEventListener("click", () => navTrip(-1));
  $("#next-trip").addEventListener("click", () => navTrip(1));
  $("#modal-overlay").addEventListener("click", (e) => { if (e.target.id === "modal-overlay") closeModal(); });

  $("#decide-close").addEventListener("click", closeDecide);
  $("#decide-overlay").addEventListener("click", (e) => { if (e.target.id === "decide-overlay") closeDecide(); });
  $("#decide-go").addEventListener("click", applyDecide);
  $("#budget-range").addEventListener("input", (e) => ($("#budget-val").textContent = money(+e.target.value)));
  $$("#travel-pref .seg-btn").forEach((b) => (b.onclick = () => $$("#travel-pref .seg-btn").forEach((x) => x.classList.toggle("is-active", x === b))));

  $("#showdown-close").addEventListener("click", closeShowdown);

  $("#lb-close").addEventListener("click", closeLightbox);
  $("#lb-prev").addEventListener("click", () => lbNav(-1));
  $("#lb-next").addEventListener("click", () => lbNav(1));
  $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox" || e.target.id === "lb-img") closeLightbox(); });
  (function () {
    let tx = null;
    const lb = $("#lightbox");
    lb.addEventListener("touchstart", (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) lbNav(dx < 0 ? 1 : -1); tx = null; }, { passive: true });
  })();

  $("#finale-back").addEventListener("click", () => { lockedId = null; save(); closeFinale(); renderDoors(); showScreen("stage"); });
  $("#finale-restart").addEventListener("click", () => askConfirm("Wipe everything and play the whole game again from scratch?", fullReset));
  $("#finale-print").addEventListener("click", () => window.print());

  function syncMuteBtn() {
    $("#mute-btn").querySelector(".pi").textContent = soundOn ? "🔊" : "🔇";
    $("#mute-btn").querySelector(".pl").textContent = soundOn ? "Sound" : "Muted";
  }
  function syncMusicBtn() {
    $("#music-btn").querySelector(".pi").textContent = musicOn ? "🎵" : "🎵";
    $("#music-btn").classList.toggle("is-off", !musicOn);
    $("#music-btn").querySelector(".pl").textContent = musicOn ? "Music" : "Music off";
  }
  $("#mute-btn").addEventListener("click", () => {
    soundOn = !soundOn; save(); syncMuteBtn();
    if (soundOn) { kickAudio(); sfx.click(); } else { stopMusic(); }
  });
  $("#music-btn").addEventListener("click", () => {
    musicOn = !musicOn; save(); syncMusicBtn();
    if (musicOn && soundOn) { kickAudio(); sfx.click(); } else { stopMusic(); }
  });
  $("#reset-btn").addEventListener("click", () => askConfirm("Start the whole game over for PJ? (Clears opened doors and votes.)", fullReset));
  $("#confirm-yes").addEventListener("click", () => closeConfirm(true));
  $("#confirm-no").addEventListener("click", () => closeConfirm(false));
  $("#confirm-overlay").addEventListener("click", (e) => { if (e.target.id === "confirm-overlay") closeConfirm(false); });

  document.addEventListener("keydown", (e) => {
    // Lightbox takes priority when open
    if (!$("#lightbox").classList.contains("hidden")) {
      if (e.key === "Escape") return closeLightbox();
      if (e.key === "ArrowLeft") return lbNav(-1);
      if (e.key === "ArrowRight") return lbNav(1);
      return;
    }
    if (e.key === "Escape") {
      if (!$("#confirm-overlay").classList.contains("hidden")) return closeConfirm(false);
      if (!$("#countdown-overlay").classList.contains("hidden")) return;
      if (!$("#decide-overlay").classList.contains("hidden")) return closeDecide();
      if (!$("#showdown-overlay").classList.contains("hidden")) return closeShowdown();
      if (!$("#modal-overlay").classList.contains("hidden")) return closeModal();
      return;
    }
    if (!$("#modal-overlay").classList.contains("hidden")) {
      if (e.key === "ArrowLeft") navTrip(-1);
      if (e.key === "ArrowRight") navTrip(1);
    }
  });

  $$('img[src="images/pj-face.png"]').forEach((img) => {
    img.onerror = function () {
      this.onerror = null;
      this.src = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="%23ffd54a"/><text x="60" y="74" font-size="46" text-anchor="middle" font-family="Arial" font-weight="bold" fill="%231a1030">PJ</text></svg>');
    };
  });

  /* ---------- Boot ---------- */
  load();
  syncMuteBtn(); syncMusicBtn();
  renderDoors();
  // Start music on the first interaction anywhere (browsers block autoplay until a gesture)
  document.addEventListener("pointerdown", function once() { document.removeEventListener("pointerdown", once); kickAudio(); }, { once: true });
  if (lockedId) { showScreen("stage"); showFinale(lockedId); }
  else if (opened.size > 0) showScreen("stage");
  else showScreen("intro");
})();
