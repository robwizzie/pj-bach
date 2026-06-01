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
| 1 Miami | `miami-hero.png` | `miami-1.png` | `miami-2.png` | `miami-3.png` |
| 2 Cruise | `cruise-hero.png` | `cruise-1.png` | `cruise-2.png` | `cruise-3.png` |
| 3 Key West | `keywest-hero.png` | `keywest-1.png` | `keywest-2.png` | `keywest-3.png` |
| 4 Outer Banks | `obx-hero.png` | `obx-1.png` | `obx-2.png` | `obx-3.png` |
| 5 Nashville | `nashville-hero.png` | `nashville-1.png` | `nashville-2.png` | `nashville-3.png` |
| 6 Myrtle Beach | `myrtle-hero.png` | `myrtle-1.png` | `myrtle-2.png` | `myrtle-3.png` |

> The exact AI-image prompt for each slot is shown right in the placeholder on
> the site, and lives in `js/data.js` under each trip's `prompt` field — tweak
> them however you like.

**Tip for the funny AI pics:** upload the `pj-face.png` to your image generator
and ask it to put PJ's face on the character described in each prompt. Keep the
style consistent ("cartoon-realistic") so the whole site feels like one bit.
