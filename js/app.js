/* =============================================================
   PJ'S BACHELOR BLOWOUT — App Logic
   ============================================================= */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const opened = new Set();        // door ids PJ has peeked behind
  let lockedId = null;             // the final pick
  let soundOn = true;

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
      // If it hasn't resolved instantly, show placeholder meanwhile
      placeholder();
    } else {
      placeholder();
    }
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
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 6.28,
        vr: -0.2 + Math.random() * 0.4
      });
    }
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.4);
      ctx.restore();
    });
    confetti = confetti.filter((p) => p.y < canvas.height + 40);
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();

  /* ---------- Render the doors ---------- */
  function tripById(id) { return TRIPS.find((t) => t.id === id); }

  function renderDoors() {
    const wrap = $("#doors");
    wrap.innerHTML = "";
    TRIPS.forEach((trip) => {
      const door = document.createElement("button");
      door.className = "door";
      door.dataset.id = trip.id;

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
        '<div class="door-hint">Door #' + trip.door + '</div>';

      door.appendChild(reveal);
      door.appendChild(face);

      if (opened.has(trip.id)) { face.classList.add("open"); door.classList.add("is-open"); }
      if (lockedId === trip.id) door.classList.add("is-locked");

      door.addEventListener("click", () => onDoorClick(trip.id, face, door));
      wrap.appendChild(door);
    });
    updateCounter();
  }

  function onDoorClick(id, face, door) {
    const firstTime = !opened.has(id);
    if (firstTime) {
      opened.add(id);
      face.classList.add("open");
      door.classList.add("is-open");
      sfx.open();
      burst(40);
      save();
      updateCounter();
      setTimeout(() => openModal(id), 450);
    } else {
      sfx.click();
      openModal(id);
    }
  }

  function updateCounter() { $("#opened-count").textContent = opened.size; }

  /* ---------- Trip modal ---------- */
  function openModal(id) {
    const trip = tripById(id);
    const body = $("#modal-body");
    body.innerHTML = "";

    // Hero
    const hero = document.createElement("div");
    hero.className = "trip-hero";
    hero.appendChild(imageSlot(trip.hero, trip.name + " hero shot"));
    const ov = document.createElement("div");
    ov.className = "trip-hero-overlay";
    ov.innerHTML = '<h2>' + trip.emoji + " " + trip.name + '</h2><div class="tag">' + trip.tagline + '</div>';
    hero.appendChild(ov);
    body.appendChild(hero);

    // Body
    const wrap = document.createElement("div");
    wrap.className = "trip-body";
    wrap.innerHTML =
      '<div class="price-banner">' +
        '<span class="big">' + trip.price + '</span>' +
        '<span class="note">' + trip.priceNote + '</span>' +
      '</div>' +
      '<div class="detail-grid">' +
        detail("🏨", "Where we stay", trip.stay) +
        detail("🍔", "Food", trip.food) +
        detail("🍻", "Drinks & bars", trip.drinks) +
        detail("🎱", "Billiards & activities", trip.billiards) +
        detail("🏖️", "Beach", trip.beach) +
        detail("🌃", "Nightlife", trip.nightlife) +
      '</div>';

    // Vibe meter
    const vibe = document.createElement("div");
    vibe.className = "vibe";
    vibe.innerHTML = "<h4>The vibe-o-meter 📊</h4>" +
      Object.keys(trip.vibe).map((k) =>
        '<div class="vibe-row"><span>' + k + '</span>' +
        '<div class="vibe-bar"><div class="vibe-fill" data-pct="' + (trip.vibe[k] * 20) + '"></div></div></div>'
      ).join("");
    wrap.appendChild(vibe);

    // Why PJ
    const why = document.createElement("div");
    why.className = "why";
    why.innerHTML =
      '<img src="images/pj-face.png" alt="PJ" onerror="this.style.display=\'none\'">' +
      '<div><h4>Why PJ will love it</h4><p>' + trip.why + '</p></div>';
    wrap.appendChild(why);

    // Gallery
    const gt = document.createElement("h4");
    gt.className = "gallery-title";
    gt.textContent = "📸 How the trip would actually go (add your AI pics here):";
    wrap.appendChild(gt);
    const gal = document.createElement("div");
    gal.className = "gallery";
    trip.gallery.forEach((g, i) => gal.appendChild(imageSlot(g, trip.name + " pic " + (i + 1))));
    wrap.appendChild(gal);

    // Actions
    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.innerHTML =
      '<button class="btn-lock">😍 Lock it in!</button>' +
      '<button class="btn-trade">🔄 Trade — show another</button>' +
      '<button class="btn-secondary">👀 Keep looking</button>';
    wrap.appendChild(actions);

    body.appendChild(wrap);

    actions.querySelector(".btn-lock").onclick = () => lockIn(id);
    actions.querySelector(".btn-trade").onclick = () => tradeDoor(id);
    actions.querySelector(".btn-secondary").onclick = closeModal;

    // animate vibe bars after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.querySelectorAll(".vibe-fill").forEach((f) => { f.style.width = f.dataset.pct + "%"; });
      });
    });

    $("#modal-overlay").classList.remove("hidden");
  }

  function detail(icon, title, text) {
    return '<div class="detail"><h4>' + icon + " " + title + '</h4><p>' + text + '</p></div>';
  }

  function closeModal() { $("#modal-overlay").classList.add("hidden"); }

  /* ---------- Trade: close this door, suggest an unopened one ---------- */
  function tradeDoor(currentId) {
    sfx.trade();
    closeModal();
    const unopened = TRIPS.filter((t) => !opened.has(t.id));
    const pool = unopened.length ? unopened : TRIPS.filter((t) => t.id !== currentId);
    const pick = pool[(Math.random() * pool.length) | 0];
    // Flash the chosen door, then open it
    setTimeout(() => {
      const doorEl = document.querySelector('.door[data-id="' + pick.id + '"]');
      if (doorEl) {
        doorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        doorEl.querySelector(".door-face").classList.add("open");
        doorEl.classList.add("is-open");
      }
      opened.add(pick.id);
      sfx.open(); burst(40); save(); updateCounter();
      setTimeout(() => openModal(pick.id), 500);
    }, 300);
  }

  /* ---------- Lock in → finale ---------- */
  function lockIn(id) {
    lockedId = id;
    save();
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

  /* ---------- Wire up controls ---------- */
  function startGame() {
    sfx.click();
    $("#intro").classList.add("hidden");
    $("#stage").classList.remove("hidden");
    $("#stage").scrollIntoView({ behavior: "smooth" });
  }

  $("#start-btn").addEventListener("click", startGame);

  $("#modal-close").addEventListener("click", closeModal);
  $("#modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });

  $("#finale-back").addEventListener("click", () => {
    lockedId = null; save();
    $("#finale").classList.add("hidden");
    renderDoors();
  });
  $("#finale-print").addEventListener("click", () => window.print());

  $("#mute-btn").addEventListener("click", () => {
    soundOn = !soundOn; save();
    $("#mute-btn").textContent = soundOn ? "🔊" : "🔇";
    if (soundOn) sfx.click();
  });

  $("#reset-btn").addEventListener("click", () => {
    if (!confirm("Start the whole game over for PJ?")) return;
    opened.clear(); lockedId = null; save();
    $("#finale").classList.add("hidden");
    closeModal();
    renderDoors();
  });

  // Logo fallback if pj-face.png isn't added yet
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
  $("#mute-btn").textContent = soundOn ? "🔊" : "🔇";
  renderDoors();

  // If PJ already locked something in a previous visit, jump back to the stage
  if (opened.size > 0 || lockedId) {
    $("#intro").classList.add("hidden");
    $("#stage").classList.remove("hidden");
    if (lockedId) showFinale(lockedId);
  }
})();
