# 🎉 PJ's Bachelor Blowout — Behind the Doors!

An interactive, game-show-style website that lets **PJ pick his own bachelor
trip** by opening mystery doors, trading them, and locking one in — instead of
a boring PowerPoint. A gift from PJ's two best men — it's all about hyping him up.

## ▶️ How to run it
It's a plain static site — no build step, no dependencies.

- **Easiest:** double-click `index.html` to open it in a browser.
- **Local server (recommended for sound/images):**
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
- **Share it for free:** push to GitHub and turn on **GitHub Pages** (Settings →
  Pages → Deploy from branch). The site will be live at a public URL you can text
  to PJ.

## 🎮 How it works
1. PJ hits **Let's Play** and sees **6 mystery doors**.
2. He opens a door → it swings open and reveals a trip card with price, lodging,
   food, drinks, billiards, beach, nightlife, a vibe-meter, and a funny AI-pic gallery.
   Each card shows real per-person costs, how to get there from **South Jersey**
   (drive vs fly), where you'd stay, food, drinks, the vibe, and an honest
   "real talk" catch.
3. He can peek behind as many doors as he likes. Use **◀ ▶** to jump between
   doors he's already opened, or **🎲 Dealer's choice** to open a random one.
   Then **Lock it in 😍** or head **Back to doors 👀**.
4. Locking in triggers a **confetti WINNER finale** with a printable/shareable
   summary and a "PJ Approved" stamp. His pick is remembered between visits.

Closed doors tease the trip with a **sneak-peek emoji** hint (e.g. 🌴 🌃 🍹).

## ✏️ Editing trips & prices
All trip content lives in **`js/data.js`** — edit text, prices, or the suggested
AI prompts there. To reorder/add doors, add an object to the `TRIPS` array.

## 🖼️ Adding photos
See **`images/README.md`**. Drop correctly-named files into `/images` and they
appear automatically; until then each slot shows a styled placeholder with its
suggested AI prompt. Add **`pj-face.png`** (PJ's caricature) for the logo/mascot.

## 🚪 The 6 options
1. **Miami, FL** — South Beach + elite nightlife
2. **Bahamas Cruise** — all-inclusive party on the water (budget sleeper)
3. **Key West, FL** — Duval Street crawl + island time
4. **Outer Banks, NC** — giant beach house with a pool-table game room (best value)
5. **Nashville, TN** — Broadway honky-tonks + hot chicken (nightlife king)
6. **Myrtle Beach, SC** — beach + nightlife for the lowest price

Rough prices are per-person estimates for a group of ~10 and are meant as
ballpark figures to compare options — confirm before booking.
