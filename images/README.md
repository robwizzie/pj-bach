# 📸 Image drop zone

Every image on the site is a **smart slot**: if the file below is missing, the
site shows a labeled placeholder *with a suggested AI prompt* — so it always
looks intentional. Drop a file with the exact name and it appears instantly.

## The logo (most important)
- **`pj-face.png`** — PJ's caricature face (the one attached in chat). Used as
  the site logo, the bouncing host, the "Why PJ will love it" badge, and the
  "PJ Approved" finale stamp. Until you add it, a gold "PJ" circle stands in.

## Per-trip images (PNG or JPG — match the name, change the extension in `js/data.js` if needed)

| Door | Hero shot | Gallery 1 | Gallery 2 | Gallery 3 |
|------|-----------|-----------|-----------|-----------|
| 1 Miami | `miami-hero.jpg` | `miami-1.jpg` | `miami-2.jpg` | `miami-3.jpg` |
| 2 Cruise | `cruise-hero.jpg` | `cruise-1.jpg` | `cruise-2.jpg` | `cruise-3.jpg` |
| 3 Key West | `keywest-hero.jpg` | `keywest-1.jpg` | `keywest-2.jpg` | `keywest-3.jpg` |
| 4 Outer Banks | `obx-hero.jpg` | `obx-1.jpg` | `obx-2.jpg` | `obx-3.jpg` |
| 5 Nashville | `nashville-hero.jpg` | `nashville-1.jpg` | `nashville-2.jpg` | `nashville-3.jpg` |
| 6 Myrtle Beach | `myrtle-hero.jpg` | `myrtle-1.jpg` | `myrtle-2.jpg` | `myrtle-3.jpg` |

> The exact AI-image prompt for each slot is shown right in the placeholder on
> the site, and lives in `js/data.js` under each trip's `prompt` field — tweak
> them however you like.

## 📐 Sizes so images fit perfectly (no stretching)
Every slot uses `object-fit: cover`, so images are **center-cropped to fill** —
they never stretch or distort, but the edges may be trimmed. For best results,
keep the important stuff (PJ!) near the center and use these shapes:

- **Hero images** (`*-hero.png`): wide / landscape — **1600 × 900** (16:9) is ideal.
- **Gallery images** (`*-1/2/3.png`): square — **1000 × 1000** works great.
- **`pj-face.png` / favicon**: already handled — the round logo and the favicon
  (`favicon.png`) are generated to fit without stretching.

**Tip for the funny AI pics:** upload the `pj-face.png` to your image generator
and ask it to put PJ's face on the character described in each prompt. Keep the
style consistent ("cartoon-realistic") so the whole site feels like one bit.
