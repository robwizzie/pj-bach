/* =============================================================
   PJ'S BACHELOR BLOWOUT — Trip Data
   -------------------------------------------------------------
   Everything that shows up behind the doors lives here.

   COSTS MODEL (powers the live group-size slider + comparison table):
   - costs.perPerson : costs that DON'T change with group size
                       (flights, food, drinks, cruise fare, etc.)
   - costs.shared    : whole-group TOTALS that get split across everyone
                       (beach house, Airbnb, rental van, hotel rooms).
   Per-person total at group size N =
       sum(perPerson) + sum(shared) / N
   Each line is { label, lo, hi } in dollars.

   To add a photo: drop the file in /images and set the "img" path on
   any slot. Missing files show a labeled placeholder with the AI prompt.
   ============================================================= */

const DEFAULT_GROUP = 10;
const MIN_GROUP = 6;
const MAX_GROUP = 16;

const TRIPS = [
  {
    id: "miami",
    door: 1,
    name: "Miami, Florida",
    emoji: "🌴",
    tagline: "South Beach, neon nights & Cuban food",
    color: "#ff4d9d",
    peek: "🌴 🌃 🍹",
    priceNote: "per person · 4 nights · all-in",
    travel: { drivable: false, short: "✈️ ~3 hr", badge: "✈️ Fly from Philly (PHL) — ~3 hr nonstop. Way too far to drive (~18 hr from South Jersey)." },
    catch: "Priciest nightlife on the board and Philly→Miami flights aren't cheap — but you get the full beach-by-day, clubs-by-night package.",
    nights: "4 nights",
    costs: {
      perPerson: [
        { label: "✈️ Flights (PHL → Miami, round-trip)", lo: 200, hi: 450 },
        { label: "🍔 Food", lo: 150, hi: 250 },
        { label: "🍻 Bars, clubs & covers", lo: 200, hi: 350 },
        { label: "🚕 Rideshares & activities", lo: 100, hi: 150 }
      ],
      shared: [
        { label: "🏨 South Beach stay (4 nts)", lo: 2500, hi: 4000 }
      ]
    },
    stay: "South Beach Airbnb or a boutique Art-Deco hotel within walking distance of Ocean Drive — split a big place and the per-head cost drops fast.",
    food: "Cuban feasts at Versailles, fresh stone crab, late-night Latin brunches, and Wynwood food halls.",
    drinks: "Rooftop bars, beach clubs, Wynwood breweries, and a big night out in the South Beach club district.",
    billiards: "Pool tables in the Wynwood dive bars & sports bars — perfect for a pre-game tournament.",
    beach: "South Beach — the iconic one. Cabanas, volleyball, and people-watching all day.",
    nightlife: "Top-tier. This is the nightlife heavyweight of the list.",
    why: "PJ gets the full package — world-class beach by day, legendary bars and clubs by night, and food that'll ruin every other city for him.",
    vibe: { Beach: 5, Nightlife: 5, Billiards: 3, Food: 5, Chill: 2 },
    hero: { img: "images/miami-hero.jpg", prompt: "PJ's cartoon face photoshopped onto a guy in sunglasses lounging on a flamingo float in the South Beach surf, neon Art-Deco hotels behind, golden hour, hyper-real" },
    gallery: [
      { img: "images/miami-1.jpg", prompt: "PJ riding a jet ski past the Miami skyline, way too confident, action movie poster style" },
      { img: "images/miami-2.jpg", prompt: "PJ in a white linen suit ordering a giant tower of stone crab, Cuban restaurant, laughing" },
      { img: "images/miami-3.jpg", prompt: "PJ on a glowing nightclub dance floor surrounded by confetti, disco lights, having the time of his life" }
    ]
  },
  {
    id: "cruise",
    door: 2,
    name: "Bahamas Cruise",
    emoji: "🚢",
    tagline: "All-inclusive party on the water",
    color: "#21c7e8",
    peek: "🚢 🎰 🏝️",
    priceNote: "per person · 4 nights · incl. flights to the port",
    travel: { drivable: false, short: "✈️ to port", badge: "✈️ Fly ~3 hr to a Florida port (Miami/Orlando) for a 4-night Bahamas sailing. 💡 Money-saver: drive just ~1½ hr to Cape Liberty in Bayonne, NJ and cruise from home with zero flights — but those sailings run longer (7+ nights)." },
    catch: "You're on the ship's schedule, cabins are cozy (read: small), and the flights to Florida are the real cost — the cruise fare itself is the cheap part.",
    nights: "4 nights at sea",
    costs: {
      perPerson: [
        { label: "✈️ Flights to FL port (PHL → MCO/MIA)", lo: 180, hi: 400 },
        { label: "🚢 Cruise cabin (4 nts, interior, dbl)", lo: 350, hi: 500 },
        { label: "💵 Gratuities + port taxes", lo: 130, hi: 180 },
        { label: "🍹 Drink package (optional, ~$80/day)", lo: 0, hi: 320 }
      ],
      shared: [
        { label: "🏨 Pre-cruise hotel night near port", lo: 600, hi: 1000 }
      ]
    },
    stay: "Cabins on a Royal Caribbean / Carnival ship — book a block of rooms together. Heads up: the cruise fare is cheap, but you still have to fly to the Florida port (and likely grab a hotel the night before sailing), so those are baked into the price above.",
    food: "Endless buffets, 24-hour pizza, steakhouse & sushi specialty nights — eat like kings, all included.",
    drinks: "Grab a drink package (≈ $80/day) and the bars never close. Onboard clubs, casino, and deck parties.",
    billiards: "Self-leveling pool tables on deck (yes, they fight the waves), plus arcade, casino, and mini golf.",
    beach: "Beach days at Nassau and the private island (CocoCay / Half Moon Cay) — crystal water, free.",
    nightlife: "Floating party — nightclub, live music, casino, and a deck party under the stars.",
    why: "Food and entertainment are included once you're aboard — beach, buffets, casino, and nightlife all in one. Just remember the flights to Florida are the real cost here, not the cruise itself.",
    vibe: { Beach: 4, Nightlife: 4, Billiards: 3, Food: 5, Chill: 5 },
    hero: { img: "images/cruise-hero.jpg", prompt: "PJ as the captain of a massive cruise ship steering with one hand and holding a tropical drink, crew saluting, sunny ocean, cartoon-realistic" },
    gallery: [
      { img: "images/cruise-1.jpg", prompt: "PJ winning big at the ship's casino, chips flying everywhere, tuxedo, James Bond pose" },
      { img: "images/cruise-2.jpg", prompt: "PJ on a private island hammock between two palm trees, turquoise water, fruity drink, total bliss" },
      { img: "images/cruise-3.jpg", prompt: "PJ at the all-you-can-eat buffet with a plate stacked to the ceiling, eyes wide with joy" }
    ]
  },
  {
    id: "keywest",
    door: 3,
    name: "Key West, Florida",
    emoji: "🏝️",
    tagline: "Duval Street crawl & island time",
    color: "#ffb020",
    peek: "🏝️ 🍹 🎣",
    priceNote: "per person · 4 nights · the splurge island",
    travel: { drivable: false, short: "✈️ + drive", badge: "✈️ Fly to Miami (~3 hr from PHL) then a scenic 3½-hr drive down the Keys — or fly straight into Key West (EYW, pricier). Not drivable from NJ (~21 hr)." },
    catch: "The most expensive option — it's a remote island, so both flights and lodging run high. Worth it for the all-walkable Duval party.",
    nights: "4 nights",
    costs: {
      perPerson: [
        { label: "✈️ Flights (PHL → Miami, round-trip)", lo: 250, hi: 500 },
        { label: "🍤 Food", lo: 200, hi: 300 },
        { label: "🍻 Duval Street bar crawl", lo: 200, hi: 300 }
      ],
      shared: [
        { label: "🏨 Old Town stay (4 nts)", lo: 3500, hi: 5500 },
        { label: "🚗 Rental van for the Keys drive", lo: 400, hi: 800 }
      ]
    },
    stay: "An Old Town guesthouse or Airbnb steps from Duval Street — roll out of bed and into the action.",
    food: "Fresh-off-the-boat seafood, conch fritters, Cuban mix sandwiches, and the original Key lime pie.",
    drinks: "The legendary Duval Street bar crawl — Sloppy Joe's, Hog's Breath, Captain Tony's. A bachelor rite of passage.",
    billiards: "Pool tables in the Duval dive bars — challenge the locals, lose gracefully.",
    beach: "Smathers Beach plus snorkeling/sandbar boat trips to the reef.",
    nightlife: "Wild, walkable, and non-stop — Duval Street is one big party from sunset on.",
    why: "The most quintessentially 'bachelor' island vibe — walk everywhere, drink everywhere, and the whole crew stays together with zero planning.",
    vibe: { Beach: 4, Nightlife: 5, Billiards: 3, Food: 4, Chill: 4 },
    hero: { img: "images/keywest-hero.jpg", prompt: "PJ at the Key West southernmost-point buoy wearing a captain's hat and floral shirt, holding a key lime pie, sunset, cartoon-realistic" },
    gallery: [
      { img: "images/keywest-1.jpg", prompt: "PJ leading a conga line of buddies down Duval Street at night, neon bar signs, chaos and joy" },
      { img: "images/keywest-2.jpg", prompt: "PJ snorkeling and shaking hands with a friendly fish, crystal reef water, comically calm" },
      { img: "images/keywest-3.jpg", prompt: "PJ at sunset on Mallory Square toasting with a giant tropical drink, street performers behind" }
    ]
  },
  {
    id: "obx",
    door: 4,
    name: "Outer Banks, NC",
    emoji: "🏖️",
    tagline: "Giant beach house & a game room",
    color: "#2ecc71",
    peek: "🏖️ 🎱 🔥",
    priceNote: "per person · 5 nights · best value",
    travel: { drivable: true, short: "🚗 ~6½ hr", badge: "🚗 Totally drivable! ~6½ hr straight down from South Jersey. Pile into a couple cars — no airport, no flights, no baggage fees." },
    catch: "Nightlife is house-party and bonfire vibes, not a club scene. If PJ wants wild bars every night, this isn't the one.",
    nights: "5 nights",
    costs: {
      perPerson: [
        { label: "🚗 Gas & tolls (your share of the drive)", lo: 30, hi: 55 },
        { label: "🍔 Groceries & cookouts", lo: 100, hi: 150 },
        { label: "🍻 Drinks & breweries", lo: 80, hi: 150 }
      ],
      shared: [
        { label: "🏖️ Beach house (5 nts)", lo: 2500, hi: 4000 }
      ]
    },
    stay: "A massive oceanfront beach house with a private pool, hot tub, AND a game room with its own pool table. Whole crew under one roof.",
    food: "Big group cookouts on the deck, fresh local seafood shacks, and a low-country boil one night.",
    drinks: "House party HQ — stock the fridge, plus local breweries and a few chill beach bars.",
    billiards: "Built right in — the rental's game room means pool tournaments every single night, no cover charge.",
    beach: "Miles of wide-open, uncrowded Atlantic beach right out the back door.",
    nightlife: "More house-party / bonfire than club scene — relaxed, but the crew makes its own fun.",
    why: "The best bang-for-buck on the board and the easiest for a big group. Beach out front, pool table inside, everyone together — pure low-stress fun.",
    vibe: { Beach: 5, Nightlife: 2, Billiards: 5, Food: 4, Chill: 5 },
    hero: { img: "images/obx-hero.jpg", prompt: "PJ grilling on the deck of a giant beach house in an apron that says 'Grill Sergeant', crew cheering, ocean behind, sunny, cartoon-realistic" },
    gallery: [
      { img: "images/obx-1.jpg", prompt: "PJ lining up a serious pool shot in a beach-house game room, sweatband on, tongue out in concentration" },
      { img: "images/obx-2.jpg", prompt: "PJ riding a boogie board down a huge wave, total wipeout incoming, action shot" },
      { img: "images/obx-3.jpg", prompt: "PJ in a hot tub at sunset surrounded by buddies and floating drinks, beach house glowing" }
    ]
  },
  {
    id: "nashville",
    door: 5,
    name: "Nashville, Tennessee",
    emoji: "🤠",
    tagline: "Broadway honky-tonks & hot chicken",
    color: "#a05cff",
    peek: "🤠 🎸 🍗",
    priceNote: "per person · 3 nights · bachelor-party capital",
    travel: { drivable: false, short: "✈️ ~2½ hr", badge: "✈️ Fly from Philly (PHL) — ~2½ hr nonstop. It's a ~12-hr drive, so flying's the move." },
    catch: "No beach and no ocean — this one's purely bars, live music, and food. If a beach is non-negotiable for PJ, skip it.",
    nights: "3 nights",
    costs: {
      perPerson: [
        { label: "✈️ Flights (PHL → Nashville, round-trip)", lo: 160, hi: 400 },
        { label: "🍗 Food", lo: 120, hi: 180 },
        { label: "🍻 Broadway bars + pedal tavern", lo: 200, hi: 350 }
      ],
      shared: [
        { label: "🏨 Downtown Airbnb (3 nts)", lo: 1500, hi: 2500 }
      ]
    },
    stay: "A downtown Airbnb within stumbling distance of Broadway — the heart of the bachelor-party capital of America.",
    food: "Nashville hot chicken, smoked BBQ, and a boozy biscuit brunch to recover.",
    drinks: "Broadway's honky-tonks (live music on every floor), rooftop bars, and a pedal-tavern party on wheels.",
    billiards: "Pool tables in the honky-tonks and dive bars off Broadway — between live bands.",
    beach: "No ocean — but a pool, the river, and zero shortage of things to do.",
    nightlife: "Elite. Nashville is THE bachelor-party city for a reason — non-stop live music and bars.",
    why: "If the trip is really about bars, nightlife, and food with the crew, nothing beats Nashville. Walkable, legendary, and built for exactly this.",
    vibe: { Beach: 0, Nightlife: 5, Billiards: 4, Food: 5, Chill: 3 },
    hero: { img: "images/nashville-hero.jpg", prompt: "PJ on a Nashville pedal tavern leading the crew down Broadway, cowboy hat, holding a beer, neon honky-tonk signs glowing, cartoon-realistic" },
    gallery: [
      { img: "images/nashville-1.jpg", prompt: "PJ on stage at a honky-tonk grabbing the mic from the band, full cowboy outfit, crowd loving it" },
      { img: "images/nashville-2.jpg", prompt: "PJ demolishing a giant plate of Nashville hot chicken, face on fire, sweating, thumbs up" },
      { img: "images/nashville-3.jpg", prompt: "PJ riding a mechanical bull in a bar, one hand up rodeo-style, buddies cheering" }
    ]
  },
  {
    id: "myrtle",
    door: 6,
    name: "Myrtle Beach, SC",
    emoji: "⛳",
    tagline: "Beach + nightlife on a budget",
    color: "#ff6a3d",
    peek: "⛱️ 🎢 ⛳",
    priceNote: "per person · 4 nights · cheapest beach + nightlife",
    travel: { drivable: true, short: "🚗 ~9 hr / ✈️", badge: "🚗 Drivable in ~9 hr from South Jersey — or grab a cheap nonstop from Philly (PHL → MYR, often under $150 round-trip). Your call." },
    catch: "A bit more low-key and family-friendly than Miami. The long drive (or a budget flight) is the trade-off for the lowest price here.",
    nights: "4 nights",
    costs: {
      perPerson: [
        { label: "🚗 Drive (gas) or ✈️ budget PHL→MYR flight", lo: 40, hi: 250 },
        { label: "🍤 Food", lo: 100, hi: 150 },
        { label: "🍻 Bars & nightlife", lo: 100, hi: 200 }
      ],
      shared: [
        { label: "🏨 Oceanfront condo (4 nts)", lo: 1500, hi: 2500 }
      ]
    },
    stay: "An oceanfront condo or resort tower — big units, pools, and a balcony over the sand for not much money.",
    food: "Calabash-style seafood buffets, local breweries, and classic beach-town eats.",
    drinks: "Broadway at the Beach and the Market Common bars — solid nightlife without the big-city price tag.",
    billiards: "Arcades, sports bars, and bar-arcade combos packed with pool tables.",
    beach: "Wide sandy beach right out front, plus a boardwalk and the SkyWheel.",
    nightlife: "Good and affordable — bars, breweries, and a lively boardwalk scene.",
    why: "Beach AND nightlife AND billiards for the lowest price on the board — the option where everyone can afford to say yes. Optional golf day for the crew.",
    vibe: { Beach: 5, Nightlife: 4, Billiards: 4, Food: 3, Chill: 4 },
    hero: { img: "images/myrtle-hero.jpg", prompt: "PJ teeing off on a beachfront golf course in loud golf pants while holding a beer, SkyWheel and ocean behind, cartoon-realistic" },
    gallery: [
      { img: "images/myrtle-1.jpg", prompt: "PJ on the Myrtle Beach SkyWheel gondola flexing like he conquered it, ocean and boardwalk below" },
      { img: "images/myrtle-2.jpg", prompt: "PJ at a seafood buffet with a mountain of crab legs, bib on, claws as trophies" },
      { img: "images/myrtle-3.jpg", prompt: "PJ sinking the 8-ball at a beach bar arcade, crowd of buddies erupting behind him" }
    ]
  },
  {
    id: "southjersey",
    door: 7,
    name: "South Jersey",
    emoji: "🦅",
    tagline: "Why leave? It's all right here, baby.",
    color: "#7cb342",
    peek: "🍺 🎱 🎡",
    free: true,
    priceNote: "per person · however long you want · gloriously FREE",
    travel: { drivable: true, short: "🚗 ~0 min", badge: "🚗 You're already here. Roll off the couch (~0–30 min). Zero flights, zero packing, zero excuses, zero dollars." },
    catch: "Real talk: it's... South Jersey. The 'trip' is technically just a regular weekend. But the boys are together, the Wilson's pool table is open, and it costs absolutely nothing. Undefeated. 🏆",
    nights: "as many as you can handle",
    costs: {
      free: true,
      perPerson: [
        { label: "🛋️ Lodging (your own bed)", lo: 0, hi: 0 },
        { label: "🎱 Pool table at Wilson's Pub", lo: 0, hi: 0 },
        { label: "🍺 Drinks (someone owes you anyway)", lo: 0, hi: 0 },
        { label: "⛽ Gas (you're literally already here)", lo: 0, hi: 0 }
      ],
      shared: []
    },
    stay: "Your own bed. Or PJ's couch. Or the corner booth at Wilson's Pub if things get weird. Five-star familiarity for exactly $0.",
    food: "Wawa hoagies, pork roll egg & cheese, and whatever's left in the fridge. Pizza if we're feeling fancy.",
    drinks: "Wilson's Pub in Gibbstown, The Pic-A-Lilli Inn, and a cooler in the garage. The bartender already knows your order.",
    billiards: "The pool table at Wilson's Pub — PJ's actual home turf. He has, allegedly, never lost on it. This is the real reason this door exists.",
    beach: "Wildwood. Free beach, the boardwalk, Mack's pizza, and the tram car. 'Watch the tram car, please.'",
    nightlife: "It's a Tuesday at Wilson's. It's everything PJ already knows and loves. Legendary in its own beautifully low-key way.",
    why: "Because deep down, PJ's happiest with the boys, a cold one, and the Wilson's pool table under his command. No flights, no budget, no stress — just South Jersey doing what it does best. The people's champion. 🏆🦅",
    vibe: { Beach: 3, Nightlife: 2, Billiards: 5, Food: 3, Chill: 5 },
    hero: { img: "images/sj-hero.jpg", prompt: "MEME: PJ on his couch in a Wawa shirt holding a hoagie and a beer, TV remote in hand, looking like he just won the lottery, 'Welcome to South Jersey' road sign vibes (or drop a real funny pic here)" },
    gallery: [
      { img: "images/sj-wilsons.jpg", prompt: "Photo of the pool / billiards bar at Wilson's Pub in Gibbstown, NJ — PJ's home turf (drop a real pic here)" },
      { img: "images/sj-picalilli.jpg", prompt: "Photo of The Pic-A-Lilli Inn dive bar in South Jersey (drop a real pic here)" },
      { img: "images/sj-wildwood.jpg", prompt: "Photo of the Wildwood, NJ boardwalk and beach (drop a real pic here)" }
    ]
  }
];
