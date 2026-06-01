/* =============================================================
   PJ'S BACHELOR BLOWOUT — Trip Data
   -------------------------------------------------------------
   Everything that shows up behind the doors lives here.
   To edit a trip: change the text below.
   To add a photo: drop the file in /images and set the "img"
   path on any slot. If the file is missing, the site shows a
   labeled placeholder with the suggested AI-image prompt so it
   still looks great. Add as many gallery images as you want.
   ============================================================= */

const TRIPS = [
  {
    id: "miami",
    door: 1,
    name: "Miami, Florida",
    emoji: "🌴",
    tagline: "South Beach, neon nights & Cuban food",
    color: "#ff4d9d",
    price: "$900 – $1,300 / person",
    priceNote: "≈ 4 nights, group of 10, flights + stay + going out",
    nights: "4 nights",
    stay: "South Beach Airbnb or a boutique Art-Deco hotel within walking distance of Ocean Drive — split a big place and the per-head cost drops fast.",
    food: "Cuban feasts at Versailles, fresh stone crab, late-night Latin brunches, and Wynwood food halls.",
    drinks: "Rooftop bars, beach clubs, Wynwood breweries, and a big night out in the South Beach club district.",
    billiards: "Pool tables in the Wynwood dive bars & sports bars — perfect for a pre-game tournament.",
    beach: "South Beach — the iconic one. Cabanas, volleyball, and people-watching all day.",
    nightlife: "Top-tier. This is the nightlife heavyweight of the list.",
    why: "PJ gets the full package — world-class beach by day, legendary bars and clubs by night, and food that'll ruin every other city for him.",
    vibe: { Beach: 5, Nightlife: 5, Billiards: 3, Food: 5, Chill: 2 },
    hero: { img: "images/miami-hero.png", prompt: "PJ's cartoon face photoshopped onto a guy in sunglasses lounging on a flamingo float in the South Beach surf, neon Art-Deco hotels behind, golden hour, hyper-real" },
    gallery: [
      { img: "images/miami-1.png", prompt: "PJ riding a jet ski past the Miami skyline, way too confident, action movie poster style" },
      { img: "images/miami-2.png", prompt: "PJ in a white linen suit ordering a giant tower of stone crab, Cuban restaurant, laughing" },
      { img: "images/miami-3.png", prompt: "PJ on a glowing nightclub dance floor surrounded by confetti, disco lights, having the time of his life" }
    ]
  },
  {
    id: "cruise",
    door: 2,
    name: "Bahamas Cruise",
    emoji: "🚢",
    tagline: "All-inclusive party on the water",
    color: "#21c7e8",
    price: "$600 – $950 / person",
    priceNote: "≈ 3–4 night cruise from Miami / Port Canaveral, food included",
    nights: "3–4 nights at sea",
    stay: "Cabins on a Royal Caribbean / Carnival ship — book a block of rooms together. Food is basically free, so it's the budget sleeper hit.",
    food: "Endless buffets, 24-hour pizza, steakhouse & sushi specialty nights — eat like kings, all included.",
    drinks: "Grab a drink package (≈ $80/day) and the bars never close. Onboard clubs, casino, and deck parties.",
    billiards: "Self-leveling pool tables on deck (yes, they fight the waves), plus arcade, casino, and mini golf.",
    beach: "Beach days at Nassau and the private island (CocoCay / Half Moon Cay) — crystal water, free.",
    nightlife: "Floating party — nightclub, live music, casino, and a deck party under the stars.",
    why: "Pay basically once and everything's covered — beach, food, drinks, billiards, casino, nightlife. Easiest sell for a big group and a wallet-friendly winner.",
    vibe: { Beach: 4, Nightlife: 4, Billiards: 3, Food: 5, Chill: 5 },
    hero: { img: "images/cruise-hero.png", prompt: "PJ as the captain of a massive cruise ship steering with one hand and holding a tropical drink, crew saluting, sunny ocean, cartoon-realistic" },
    gallery: [
      { img: "images/cruise-1.png", prompt: "PJ winning big at the ship's casino, chips flying everywhere, tuxedo, James Bond pose" },
      { img: "images/cruise-2.png", prompt: "PJ on a private island hammock between two palm trees, turquoise water, fruity drink, total bliss" },
      { img: "images/cruise-3.png", prompt: "PJ at the all-you-can-eat buffet with a plate stacked to the ceiling, eyes wide with joy" }
    ]
  },
  {
    id: "keywest",
    door: 3,
    name: "Key West, Florida",
    emoji: "🏝️",
    tagline: "Duval Street crawl & island time",
    color: "#ffb020",
    price: "$1,000 – $1,400 / person",
    priceNote: "≈ 4 nights, group of 10, stay + going out (it's a splurge island)",
    nights: "4 nights",
    stay: "An Old Town guesthouse or Airbnb steps from Duval Street — roll out of bed and into the action.",
    food: "Fresh-off-the-boat seafood, conch fritters, Cuban mix sandwiches, and the original Key lime pie.",
    drinks: "The legendary Duval Street bar crawl — Sloppy Joe's, Hog's Breath, Captain Tony's. A bachelor rite of passage.",
    billiards: "Pool tables in the Duval dive bars — challenge the locals, lose gracefully.",
    beach: "Smathers Beach plus snorkeling/sandbar boat trips to the reef.",
    nightlife: "Wild, walkable, and non-stop — Duval Street is one big party from sunset on.",
    why: "The most quintessentially 'bachelor' island vibe — walk everywhere, drink everywhere, and the whole crew stays together with zero planning.",
    vibe: { Beach: 4, Nightlife: 5, Billiards: 3, Food: 4, Chill: 4 },
    hero: { img: "images/keywest-hero.png", prompt: "PJ at the Key West southernmost-point buoy wearing a captain's hat and floral shirt, holding a key lime pie, sunset, cartoon-realistic" },
    gallery: [
      { img: "images/keywest-1.png", prompt: "PJ leading a conga line of buddies down Duval Street at night, neon bar signs, chaos and joy" },
      { img: "images/keywest-2.png", prompt: "PJ snorkeling and shaking hands with a friendly fish, crystal reef water, comically calm" },
      { img: "images/keywest-3.png", prompt: "PJ at sunset on Mallory Square toasting with a giant tropical drink, street performers behind" }
    ]
  },
  {
    id: "obx",
    door: 4,
    name: "Outer Banks, NC",
    emoji: "🏖️",
    tagline: "Giant beach house & a game room",
    color: "#2ecc71",
    price: "$500 – $750 / person",
    priceNote: "≈ 5 nights, group of 10 — splitting one big house = huge value",
    nights: "5 nights",
    stay: "A massive oceanfront beach house with a private pool, hot tub, AND a game room with its own pool table. Whole crew under one roof.",
    food: "Big group cookouts on the deck, fresh local seafood shacks, and a low-country boil one night.",
    drinks: "House party HQ — stock the fridge, plus local breweries and a few chill beach bars.",
    billiards: "Built right in — the rental's game room means pool tournaments every single night, no cover charge.",
    beach: "Miles of wide-open, uncrowded Atlantic beach right out the back door.",
    nightlife: "More house-party / bonfire than club scene — relaxed, but the crew makes its own fun.",
    why: "The best bang-for-buck on the board and the easiest for a big group. Beach out front, pool table inside, everyone together — pure low-stress fun.",
    vibe: { Beach: 5, Nightlife: 2, Billiards: 5, Food: 4, Chill: 5 },
    hero: { img: "images/obx-hero.png", prompt: "PJ grilling on the deck of a giant beach house in an apron that says 'Grill Sergeant', crew cheering, ocean behind, sunny, cartoon-realistic" },
    gallery: [
      { img: "images/obx-1.png", prompt: "PJ lining up a serious pool shot in a beach-house game room, sweatband on, tongue out in concentration" },
      { img: "images/obx-2.png", prompt: "PJ riding a boogie board down a huge wave, total wipeout incoming, action shot" },
      { img: "images/obx-3.png", prompt: "PJ in a hot tub at sunset surrounded by buddies and floating drinks, beach house glowing" }
    ]
  },
  {
    id: "nashville",
    door: 5,
    name: "Nashville, Tennessee",
    emoji: "🤠",
    tagline: "Broadway honky-tonks & hot chicken",
    color: "#a05cff",
    price: "$700 – $1,000 / person",
    priceNote: "≈ 3 nights, group of 10, flights + downtown stay + going out",
    nights: "3 nights",
    stay: "A downtown Airbnb within stumbling distance of Broadway — the heart of the bachelor-party capital of America.",
    food: "Nashville hot chicken, smoked BBQ, and a boozy biscuit brunch to recover.",
    drinks: "Broadway's honky-tonks (live music on every floor), rooftop bars, and a pedal-tavern party on wheels.",
    billiards: "Pool tables in the honky-tonks and dive bars off Broadway — between live bands.",
    beach: "No ocean — but a pool, the river, and zero shortage of things to do.",
    nightlife: "Elite. Nashville is THE bachelor-party city for a reason — non-stop live music and bars.",
    why: "If the trip is really about bars, nightlife, and food with the crew, nothing beats Nashville. Walkable, legendary, and built for exactly this.",
    vibe: { Beach: 0, Nightlife: 5, Billiards: 4, Food: 5, Chill: 3 },
    hero: { img: "images/nashville-hero.png", prompt: "PJ on a Nashville pedal tavern leading the crew down Broadway, cowboy hat, holding a beer, neon honky-tonk signs glowing, cartoon-realistic" },
    gallery: [
      { img: "images/nashville-1.png", prompt: "PJ on stage at a honky-tonk grabbing the mic from the band, full cowboy outfit, crowd loving it" },
      { img: "images/nashville-2.png", prompt: "PJ demolishing a giant plate of Nashville hot chicken, face on fire, sweating, thumbs up" },
      { img: "images/nashville-3.png", prompt: "PJ riding a mechanical bull in a bar, one hand up rodeo-style, buddies cheering" }
    ]
  },
  {
    id: "myrtle",
    door: 6,
    name: "Myrtle Beach, SC",
    emoji: "⛳",
    tagline: "Beach + nightlife on a budget",
    color: "#ff6a3d",
    price: "$450 – $650 / person",
    priceNote: "≈ 4 nights, group of 10 — the cheapest beach + nightlife combo",
    nights: "4 nights",
    stay: "An oceanfront condo or resort tower — big units, pools, and a balcony over the sand for not much money.",
    food: "Calabash-style seafood buffets, local breweries, and classic beach-town eats.",
    drinks: "Broadway at the Beach and the Market Common bars — solid nightlife without the big-city price tag.",
    billiards: "Arcades, sports bars, and bar-arcade combos packed with pool tables.",
    beach: "Wide sandy beach right out front, plus a boardwalk and the SkyWheel.",
    nightlife: "Good and affordable — bars, breweries, and a lively boardwalk scene.",
    why: "Beach AND nightlife AND billiards for the lowest price on the board — the option where everyone can afford to say yes. Optional golf day for the crew.",
    vibe: { Beach: 5, Nightlife: 4, Billiards: 4, Food: 3, Chill: 4 },
    hero: { img: "images/myrtle-hero.png", prompt: "PJ teeing off on a beachfront golf course in loud golf pants while holding a beer, SkyWheel and ocean behind, cartoon-realistic" },
    gallery: [
      { img: "images/myrtle-1.png", prompt: "PJ on the Myrtle Beach SkyWheel gondola flexing like he conquered it, ocean and boardwalk below" },
      { img: "images/myrtle-2.png", prompt: "PJ at a seafood buffet with a mountain of crab legs, bib on, claws as trophies" },
      { img: "images/myrtle-3.png", prompt: "PJ sinking the 8-ball at a beach bar arcade, crowd of buddies erupting behind him" }
    ]
  }
];
