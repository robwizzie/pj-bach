/* =============================================================
   PJ'S BACHELOR BLOWOUT — App Logic
   ============================================================= */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const opened = new Set();        // door ids PJ has peeked behind
  let lockedId = null;             // the final pick
  let soundOn = true;
  let currentTripId = null;        // trip currently shown in the modal

  /* ---------- Persistence ---------- */
  const SAVE_KEY = "pj-bach-state";
  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      opened: [...opened], lockedId, soundOn
    }));
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      (s.opened || []).forEach((id) => opened.add(id));
      lockedId = s.lockedId || null;
      if (typeof s.soundOn === "boolean") soundOn = s.soundOn;
    } catch (e) { /* ignore */ }
  }

  /* ---------- Helpers ---------- */
  const tripById = (id) => TRIPS.find((t) => t.id === id);
  const tripIndex = (id) => TRIPS.findIndex((t) => t.id === id);

  /* ---------- Screen switching ---------- */
  function showScreen(name) {
    ["intro", "stage", "compare"].forEach((s) => {
      $("#" + s).classList.toggle("hidden", s !== name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Image slot with smart placeholder ---------- */
  function imageSlot(slot, label) {
    const wrap = document.createElement("div");
    wrap.className = "image-slot";
    const placeholder = () => {
      wrap.innerHTML =
        '<div class="ph">' +
          '<span class="cam">📸</span>' +
          '<span class="lbl">' + (label || "Add a photo") + '</span>' +
          '<span class="prm">AI prompt: ' + (slot.prompt || "") + '</span>' +
        '</div>';
    };
    if (slot.img) {
      const img = new Image();
      img.alt = label || "PJ bachelor trip";
      img.onload = () => { wrap.innerHTML = ""; wrap.appendChild(img); };
      img.onerror = placeholder;
      img.src = slot.img;
      placeholder();
    } else { placeholder(); }
    return wrap;
  }

  /* ---------- Sound (Web Audio, no files needed) ---------- */
  let actx = null;
  function tone(freq, dur, type, when, gain) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || "triangle";
      o.frequency.value = freq;
      const t = actx.currentTime + (when || 0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* audio not available */ }
  }
  const sfx = {
    open:  () => { tone(520, .12, "square", 0); tone(760, .14, "square", .08); },
    trade: () => { tone(400, .1, "sawtooth", 0); tone(300, .12, "sawtooth", .07); },
    win:   () => { [523,659,784,1047].forEach((f,i)=>tone(f,.22,"triangle",i*0.12,.22)); },
    click: () => { tone(660, .06, "square", 0, .12); }
  };

  /* ---------- Confetti ---------- */
  const canvas = $("#confetti-canvas");
  const ctx = canvas.getContext("2d");
  let confetti = [];
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener("resize", resize); resize();
  function burst(amount) {
    const colors = ["#ffd54a","#ff4d9d","#21c7e8","#2ecc71","#a05cff","#ff6a3d"];
    for (let i = 0; i < (amount || 140); i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        r: 4 + Math.random() * 6,
        c: colors[(Math.random() * colors.length) | 0],
        vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4,
        rot: Math.random() * 6.28, vr: -0.2 + Math.random() * 0.4
      });
    }
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.4);
      ctx.restore();
    });
    confetti = confetti.filter((p) => p.y < canvas.height + 40);
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();

  /* ---------- Doors ---------- */
  function renderDoors() {
    const wrap = $("#doors");
    wrap.innerHTML = "";
    TRIPS.forEach((trip) => {
      const door = document.createElement("button");
      door.className = "door";
      door.dataset.id = trip.id;
      door.setAttribute("aria-label", "Door " + trip.door + " — open to reveal a trip");

      const reveal = document.createElement("div");
      reveal.className = "door-reveal";
      reveal.innerHTML =
        '<div class="r-emoji">' + trip.emoji + '</div>' +
        '<div class="r-name">' + trip.name + '</div>' +
        '<div class="r-tag">' + trip.tagline + '</div>' +
        '<div class="r-price">' + trip.price + '</div>' +
        '<div class="r-open">Tap for details</div>';

      const face = document.createElement("div");
      face.className = "door-face";
      face.innerHTML =
        '<div class="door-number">' + trip.door + '</div>' +
        '<div class="door-knob"></div>' +
        (trip.peek ? '<div class="door-peek"><span class="dp-label">sneak peek</span><span class="dp-emoji">' + trip.peek + '</span></div>' : "") +
        '<div class="door-hint">Tap to reveal</div>';

      door.appendChild(reveal);
      door.appendChild(face);

      if (opened.has(trip.id)) { face.classList.add("open"); door.classList.add("is-open"); }
      if (lockedId === trip.id) door.classList.add("is-locked");

      door.addEventListener("click", () => onDoorClick(trip.id, face, door));
      wrap.appendChild(door);
    });
    updateCounter();
    updateHostLine();
  }

  function onDoorClick(id, face, door) {
    const firstTime = !opened.has(id);
    if (firstTime) {
      face.classList.add("open");
      door.classList.add("is-open");
      sfx.open(); burst(40);
      setTimeout(() => openModal(id), 450);
    } else {
      sfx.click();
      openModal(id);
    }
  }

  function markOpened(id) {
    if (!opened.has(id)) {
      opened.add(id); save(); updateCounter(); updateHostLine();
      const doorEl = document.querySelector('.door[data-id="' + id + '"]');
      if (doorEl) {
        doorEl.classList.add("is-open");
        doorEl.querySelector(".door-face").classList.add("open");
      }
    }
  }

  function updateCounter() { $("#opened-count").textContent = opened.size; }

  function updateHostLine() {
    const line = $("#host-line");
    if (!line) return;
    if (lockedId) { line.innerHTML = "🔒 Locked in! Hit a door to keep browsing, or Restart to play again."; return; }
    const n = opened.size;
    if (n === 0) line.innerHTML = "Tap a door to reveal the trip behind it. Peek at as many as you want before you pick.";
    else if (n < TRIPS.length) line.innerHTML = "<b>" + n + "</b> door" + (n>1?"s":"") + " open — found your trip yet, PJ? Keep peeking 👀 or lock one in.";
    else line.innerHTML = "You've seen all 6, PJ! 🔥 Time to <b>lock in your winner</b>.";
  }

  /* ---------- Compare / browse-all ---------- */
  function renderCompare() {
    const grid = $("#compare-grid");
    grid.innerHTML = "";
    TRIPS.forEach((trip) => {
      const card = document.createElement("div");
      card.className = "compare-card" + (lockedId === trip.id ? " is-locked" : "");
      card.style.setProperty("--accent", trip.color);
      card.innerHTML =
        '<div class="cc-top">' +
          '<span class="cc-emoji">' + trip.emoji + '</span>' +
          '<span class="cc-door">Door ' + trip.door + '</span>' +
        '</div>' +
        '<h3 class="cc-name">' + trip.name + '</h3>' +
        '<p class="cc-tag">' + trip.tagline + '</p>' +
        '<p class="cc-price">' + trip.price + '</p>' +
        '<div class="cc-actions">' +
          '<button class="cc-details">Full details</button>' +
          '<button class="cc-lock">' + (lockedId === trip.id ? "✅ Picked" : "Lock in") + '</button>' +
        '</div>';
      card.querySelector(".cc-details").onclick = () => openModal(trip.id);
      card.querySelector(".cc-lock").onclick = () => lockIn(trip.id);
      grid.appendChild(card);
    });
  }

  /* ---------- Trip modal ---------- */
  const VIBE_EMOJI = { Beach: "🏖️", Nightlife: "🌃", Billiards: "🎱", Food: "🍔", Chill: "😎" };

  function openModal(id) {
    const trip = tripById(id);
    currentTripId = id;
    markOpened(id);
    updateNav();

    const body = $("#modal-body");
    body.innerHTML = "";

    // Hero
    const hero = document.createElement("div");
    hero.className = "trip-hero";
    hero.appendChild(imageSlot(trip.hero, trip.name + " hero shot"));
    const ov = document.createElement("div");
    ov.className = "trip-hero-overlay";
    ov.innerHTML =
      '<span class="th-door">Door ' + trip.door + '</span>' +
      '<h2>' + trip.emoji + " " + trip.name + '</h2>' +
      '<div class="tag">' + trip.tagline + '</div>';
    hero.appendChild(ov);
    body.appendChild(hero);

    const wrap = document.createElement("div");
    wrap.className = "trip-body";

    const chips = Object.keys(trip.vibe)
      .filter((k) => trip.vibe[k] >= 4)
      .map((k) => '<span class="chip">' + (VIBE_EMOJI[k] || "") + " " + k + "</span>")
      .join("");

    const costRows = (trip.breakdown || [])
      .map((b) => '<li><span>' + b.label + '</span><b>' + b.cost + '</b></li>')
      .join("");

    const travel = trip.travel || {};
    wrap.innerHTML =
      '<div class="price-row">' +
        '<div class="price-main"><span class="pm-amt">' + trip.price + '</span>' +
        '<span class="pm-note">' + trip.priceNote + '</span></div>' +
        (chips ? '<div class="chips">' + chips + '</div>' : "") +
      '</div>' +
      (travel.badge ? '<div class="travel-badge ' + (travel.drivable ? "is-drive" : "is-fly") + '">' + travel.badge + '</div>' : "") +
      '<details class="cost-box" open>' +
        '<summary>💰 Where the money goes <span class="cb-tag">est. per person</span></summary>' +
        '<ul class="cost-list">' + costRows + '</ul>' +
        '<p class="cost-foot">Ballpark for a crew of ~10 — the more guys come, the cheaper it gets. Flights are book-early estimates from Philly (PHL); always confirm before booking.</p>' +
      '</details>' +
      '<div class="rundown">' +
        rd("🏨", "Where we stay", trip.stay) +
        rd("🍔", "Food", trip.food) +
        rd("🍻", "Drinks & bars", trip.drinks) +
        rd("🎱", "Billiards & activities", trip.billiards) +
        rd("🏖️", "Beach", trip.beach) +
        rd("🌃", "Nightlife", trip.nightlife) +
      '</div>' +
      (trip.catch ? '<div class="catch"><b>🤙 Real talk:</b> ' + trip.catch + '</div>' : "");

    const vibe = document.createElement("div");
    vibe.className = "vibe";
    vibe.innerHTML = "<h4>📊 Vibe check</h4>" +
      Object.keys(trip.vibe).map((k) =>
        '<div class="vibe-row"><span>' + (VIBE_EMOJI[k] || "") + " " + k + '</span>' +
        '<div class="vibe-bar"><div class="vibe-fill" data-pct="' + (trip.vibe[k] * 20) + '"></div></div></div>'
      ).join("");
    wrap.appendChild(vibe);

    const why = document.createElement("div");
    why.className = "why";
    why.innerHTML =
      '<img src="images/pj-face.png" alt="PJ" onerror="this.style.display=\'none\'">' +
      '<div><h4>Why PJ will love it</h4><p>' + trip.why + '</p></div>';
    wrap.appendChild(why);

    const gt = document.createElement("h4");
    gt.className = "gallery-title";
    gt.textContent = "📸 How it'd actually go down";
    wrap.appendChild(gt);
    const gal = document.createElement("div");
    gal.className = "gallery";
    trip.gallery.forEach((g, i) => gal.appendChild(imageSlot(g, trip.name + " pic " + (i + 1))));
    wrap.appendChild(gal);

    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.innerHTML =
      '<button class="btn-lock">😍 Lock in ' + trip.name + '</button>' +
      '<button class="btn-secondary">👀 Back to doors</button>';
    wrap.appendChild(actions);
    body.appendChild(wrap);

    actions.querySelector(".btn-lock").onclick = () => lockIn(id);
    actions.querySelector(".btn-secondary").onclick = closeModal;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      body.querySelectorAll(".vibe-fill").forEach((f) => { f.style.width = f.dataset.pct + "%"; });
    }));

    const overlay = $("#modal-overlay");
    overlay.classList.remove("hidden");
    overlay.scrollTop = 0;
    $("#modal").scrollTop = 0;
  }

  function rd(icon, label, text) {
    return '<div class="rd-item"><span class="rd-ic">' + icon + '</span>' +
           '<div class="rd-txt"><b>' + label + '</b><p>' + text + '</p></div></div>';
  }

  function closeModal() { $("#modal-overlay").classList.add("hidden"); currentTripId = null; }

  // Navigation only cycles through doors PJ has already opened.
  function openedTripList() { return TRIPS.filter((t) => opened.has(t.id)); }

  function updateNav() {
    const list = openedTripList();
    const n = list.length;
    const idx = list.findIndex((t) => t.id === currentTripId);
    $("#nav-label").textContent = n > 1 ? ("Opened door " + (idx + 1) + " of " + n) : "Only door open";
    const off = n <= 1;
    [$("#prev-trip"), $("#next-trip")].forEach((btn) => {
      btn.disabled = off;
      btn.classList.toggle("nav-off", off);
      btn.title = off ? "Open more doors to flip between them" : "Flip between opened doors";
    });
  }

  function navTrip(dir) {
    const list = openedTripList();
    if (list.length <= 1) return;
    let idx = list.findIndex((t) => t.id === currentTripId);
    if (idx < 0) return;
    idx = (idx + dir + list.length) % list.length;
    sfx.click();
    openModal(list[idx].id);
  }

  /* ---------- Dealer's choice: open a random un-opened door ---------- */
  function dealersChoice() {
    const unopened = TRIPS.filter((t) => !opened.has(t.id));
    const pool = unopened.length ? unopened : TRIPS;
    const pick = pool[(Math.random() * pool.length) | 0];
    const doorEl = document.querySelector('.door[data-id="' + pick.id + '"]');
    if (doorEl) {
      doorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      doorEl.classList.add("trade-flash");
      doorEl.querySelector(".door-face").classList.add("open");
      doorEl.classList.add("is-open");
    }
    sfx.open(); burst(40);
    setTimeout(() => openModal(pick.id), 550);
  }

  /* ---------- Lock in → finale ---------- */
  function lockIn(id) {
    lockedId = id; save();
    closeModal();
    sfx.win();
    burst(260);
    setTimeout(() => burst(180), 400);
    setTimeout(() => burst(180), 800);
    renderDoors();
    showFinale(id);
  }

  function showFinale(id) {
    const trip = tripById(id);
    $("#finale-title").innerHTML = "PJ is going to… " + trip.emoji + "<br>" + trip.name + "!";
    const card = $("#finale-card");
    card.innerHTML = "";
    const sum = document.createElement("div");
    sum.className = "finale-summary";
    const heroWrap = document.createElement("div");
    heroWrap.className = "fs-hero";
    heroWrap.appendChild(imageSlot(trip.hero, trip.name + " hero shot"));
    sum.appendChild(heroWrap);
    const fb = document.createElement("div");
    fb.className = "fs-body";
    fb.innerHTML =
      "<h3>" + trip.emoji + " " + trip.name + "</h3>" +
      "<p><b>" + trip.price + "</b> — <span style='opacity:.7'>" + trip.priceNote + "</span></p>" +
      "<ul>" +
        (trip.travel && trip.travel.badge ? "<li>🧭 <b>Getting there:</b> " + trip.travel.badge + "</li>" : "") +
        "<li>🏨 <b>Stay:</b> " + trip.stay + "</li>" +
        "<li>🍔 <b>Food:</b> " + trip.food + "</li>" +
        "<li>🍻 <b>Drinks:</b> " + trip.drinks + "</li>" +
        "<li>🎱 <b>Billiards:</b> " + trip.billiards + "</li>" +
        "<li>🏖️ <b>Beach:</b> " + trip.beach + "</li>" +
        "<li>🌃 <b>Nightlife:</b> " + trip.nightlife + "</li>" +
      "</ul>";
    sum.appendChild(fb);
    card.appendChild(sum);
    $("#finale").classList.remove("hidden");
  }

  function closeFinale() { $("#finale").classList.add("hidden"); }

  /* ---------- Styled confirm ---------- */
  let confirmCb = null;
  function askConfirm(text, cb) {
    $("#confirm-text").textContent = text;
    confirmCb = cb;
    $("#confirm-overlay").classList.remove("hidden");
  }
  function closeConfirm(run) {
    $("#confirm-overlay").classList.add("hidden");
    const cb = confirmCb; confirmCb = null;
    if (run && cb) cb();
  }

  /* ---------- Reset / restart ---------- */
  function fullReset() {
    opened.clear(); lockedId = null; currentTripId = null; save();
    closeFinale(); closeModal();
    renderDoors();
    showScreen("stage");
  }

  /* ---------- Controls ---------- */
  $("#start-btn").addEventListener("click", () => { sfx.click(); showScreen("stage"); });
  $("#browse-btn").addEventListener("click", () => { sfx.click(); renderCompare(); showScreen("compare"); });
  $("#home-btn").addEventListener("click", () => { sfx.click(); showScreen("intro"); });

  $("#seeall-btn").addEventListener("click", () => { renderCompare(); showScreen("compare"); });
  $("#stage-seeall").addEventListener("click", () => { renderCompare(); showScreen("compare"); });
  $("#dealer-btn").addEventListener("click", dealersChoice);
  $("#compare-back").addEventListener("click", () => showScreen("stage"));

  $("#modal-close").addEventListener("click", closeModal);
  $("#prev-trip").addEventListener("click", () => navTrip(-1));
  $("#next-trip").addEventListener("click", () => navTrip(1));
  $("#modal-overlay").addEventListener("click", (e) => { if (e.target.id === "modal-overlay") closeModal(); });

  $("#finale-back").addEventListener("click", () => {
    lockedId = null; save(); closeFinale(); renderDoors(); renderCompare(); showScreen("stage");
  });
  $("#finale-restart").addEventListener("click", () => {
    askConfirm("Wipe everything and play the whole game again from scratch?", fullReset);
  });
  $("#finale-print").addEventListener("click", () => window.print());

  $("#mute-btn").addEventListener("click", () => {
    soundOn = !soundOn; save();
    $("#mute-btn").querySelector(".pi").textContent = soundOn ? "🔊" : "🔇";
    $("#mute-btn").querySelector(".pl").textContent = soundOn ? "Sound" : "Muted";
    if (soundOn) sfx.click();
  });

  $("#reset-btn").addEventListener("click", () => {
    askConfirm("Start the whole game over for PJ? (This clears every door he's opened.)", fullReset);
  });

  $("#confirm-yes").addEventListener("click", () => closeConfirm(true));
  $("#confirm-no").addEventListener("click", () => closeConfirm(false));
  $("#confirm-overlay").addEventListener("click", (e) => { if (e.target.id === "confirm-overlay") closeConfirm(false); });

  // Keyboard: Esc closes things; arrows flip trips in the modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#confirm-overlay").classList.contains("hidden")) return closeConfirm(false);
      if (!$("#modal-overlay").classList.contains("hidden")) return closeModal();
      if (!$("#finale").classList.contains("hidden")) return; // keep finale until a choice
    }
    if (!$("#modal-overlay").classList.contains("hidden")) {
      if (e.key === "ArrowLeft") navTrip(-1);
      if (e.key === "ArrowRight") navTrip(1);
    }
  });

  // Logo / face fallback if pj-face.png isn't added yet
  document.querySelectorAll('img[src="images/pj-face.png"]').forEach((img) => {
    img.onerror = function () {
      this.onerror = null;
      this.src = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
        '<rect width="120" height="120" rx="60" fill="%23ffd54a"/>' +
        '<text x="60" y="74" font-size="46" text-anchor="middle" font-family="Arial" font-weight="bold" fill="%231a1030">PJ</text></svg>'
      );
    };
  });

  /* ---------- Boot ---------- */
  load();
  $("#mute-btn").querySelector(".pi").textContent = soundOn ? "🔊" : "🔇";
  $("#mute-btn").querySelector(".pl").textContent = soundOn ? "Sound" : "Muted";
  renderDoors();

  if (lockedId) {
    showScreen("stage");
    showFinale(lockedId);
  } else if (opened.size > 0) {
    showScreen("stage");
  } else {
    showScreen("intro");
  }
})();
