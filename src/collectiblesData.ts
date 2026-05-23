// Generated from DTACat/Collectibles
export interface CollectibleItem {
  id: string;
  title: string;
  name: string; // compatibility with old fields
  desc: string;
  imgSrc: string;
  type: 'avatar-decoration' | 'profile-effect';
  price: number;
}

export const AVATAR_DECORATIONS: CollectibleItem[] = [
  {
    id: "border_chromawave",
    title: "Chromawave",
    name: "Chromawave",
    desc: "Never miss a beat.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_49c479e15533fb4c02eb320c9c137433.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 30
  },
  {
    id: "border_cozy_cat",
    title: "Cozy Cat",
    name: "Cozy Cat",
    desc: "Purrfectly cozy.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_77b7b6a740a9451e1ef39c0252154ef8.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 35
  },
  {
    id: "border_oasis",
    title: "Oasis",
    name: "Oasis",
    desc: "An island breeze.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_f740031cc97d1b7eb73c0d0ac1dd09f3.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 40
  },
  {
    id: "border_rainy_mood",
    title: "Rainy Mood",
    name: "Rainy Mood",
    desc: "Feel the calm.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_e8c11f139e55dac538cdaafb3caa2317.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 45
  },
  {
    id: "border_cozy_headphones",
    title: "Cozy Headphones",
    name: "Cozy Headphones",
    desc: "Perfect for any tune.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_bb71042ccd2ca277a69f086a4f3354d0.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 50
  },
  {
    id: "border_doodling",
    title: "Doodling",
    name: "Doodling",
    desc: "Draw your thoughts.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_5873ecaa76fb549654b40095293f902e.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 40
  },
  {
    id: "border_clove",
    title: "A Hint of Clove",
    name: "A Hint of Clove",
    desc: "Beautiful and fatal.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_98555e40cc6802bd3a4fed906af1d992.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 50
  },
  {
    id: "border_omen",
    title: "Omens Cowl",
    name: "Omens Cowl",
    desc: "The shadow envelopes you.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_c45abe8c7585fdb41b8d8d4d666f1588.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 55
  },
  {
    id: "border_reyna",
    title: "Reynas Leer",
    name: "Reynas Leer",
    desc: "See their fear.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_a87e3efa4de2956331831681231ce63b.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 60
  },
  {
    id: "border_frag_out",
    title: "FRAG OUT",
    name: "FRAG OUT",
    desc: "Watch out!",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_09de63526a45be1ddac70e84718ee04a.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 45
  },
  {
    id: "border_blade_storm",
    title: "Blade Storm",
    name: "Blade Storm",
    desc: "Think fast.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_f766e4a2e5842813df1ad8bd3ccfa80e.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 65
  },
  {
    id: "border_dandelion",
    title: "Dandelion Duo",
    name: "Dandelion Duo",
    desc: "Float away with the wind.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_76bcaf4183df50f3b5ddf906af46fe04.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 35
  },
  {
    id: "border_ki_energy",
    title: "Ki Energy",
    name: "Ki Energy",
    desc: "Unleash your true potential.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_e046efca46fb50f3b5ddf906af46fe04.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 75
  },
  {
    id: "border_sushi",
    title: "Sushi Mania",
    name: "Sushi Mania",
    desc: "Always room for sushi.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_bb82042ccd2ca277a69f086a4f3354d0.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 40
  },
  {
    id: "border_flaming_sword",
    title: "Flaming Sword",
    name: "Flaming Sword",
    desc: "Forged in deep magma.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_14e41fc76fb549654b40095293f902ea.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 80
  },
  {
    id: "border_runes",
    title: "Glowing Runes",
    name: "Glowing Runes",
    desc: "Whisper ancient spells.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_567aeeaa76fb549654b40095293f902f.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 70
  },
  {
    id: "border_potion",
    title: "Magical Potion",
    name: "Magical Potion",
    desc: "A brew of mysteries.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_e93fc76fb549654b40095293f902ecbc.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 45
  },
  {
    id: "border_shield",
    title: "Defensive Shield",
    name: "Defensive Shield",
    desc: "Full armor protocols active.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_ee2de76fb549654b40095293f902eccc.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 65
  },
  {
    id: "border_skull",
    title: "Skull Medallion",
    name: "Skull Medallion",
    desc: "Born of shadows.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_f823ecaa76fb549654b40095293f902edd.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 50
  },
  {
    id: "border_cat_ears",
    title: "Cat Ears",
    name: "Cat Ears",
    desc: "Nyan! Simply adorable.",
    imgSrc: "https://cdn.discordapp.com/avatar-decoration-presets/a_cc5d5ea76fb549654b40095293f902e12.webp?size=240&passthrough=false",
    type: "avatar-decoration",
    price: 60
  }
];

export const PROFILE_EFFECTS: CollectibleItem[] = [
  {
    id: "effect_study_spot",
    title: "Study Spot",
    name: "Study Spot",
    desc: "Time to hit the books.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-04-04/study-spot/thumbnail.png",
    type: "profile-effect",
    price: 50
  },
  {
    id: "effect_all_nighter",
    title: "All Nighter",
    name: "All Nighter",
    desc: "One more round.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-04-04/all-nighter/thumbnail.png",
    type: "profile-effect",
    price: 55
  },
  {
    id: "effect_watercolors",
    title: "Watercolors",
    name: "Watercolors",
    desc: "Art in fluid motion.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-04-04/watercolors/thumbnail.png",
    type: "profile-effect",
    price: 60
  },
  {
    id: "effect_cloves_ruse",
    title: "Cloves Ruse",
    name: "Cloves Ruse",
    desc: "Decieve and defeat.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-03-26/cloves-ruse/thumbnail.png",
    type: "profile-effect",
    price: 70
  },
  {
    id: "effect_dragon_dance",
    title: "Dragon Dance",
    name: "Dragon Dance",
    desc: "Prosperity and flames.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-02-06/dragon-dance/thumbnail.png",
    type: "profile-effect",
    price: 85
  },
  {
    id: "effect_koi_pond",
    title: "Koi Pond",
    name: "Koi Pond",
    desc: "Serenity in the waters.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-02-06/koi-pond/thumbnail.png",
    type: "profile-effect",
    price: 80
  },
  {
    id: "effect_lunar_lanterns",
    title: "Lunar Lanterns",
    name: "Lunar Lanterns",
    desc: "Lighting up the new year.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2024-02-06/lunar-lanterns/thumbnail.png",
    type: "profile-effect",
    price: 75
  },
  {
    id: "effect_digital_sunrise",
    title: "Digital Sunrise",
    name: "Digital Sunrise",
    desc: "Synthwave grid overload.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-11-21/cyberpunk-digital-sunrise/thumbnail.png",
    type: "profile-effect",
    price: 90
  },
  {
    id: "effect_implant",
    title: "Implant",
    name: "Implant",
    desc: "System diagnostics offline.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-11-21/cyberpunk-implant/thumbnail.png",
    type: "profile-effect",
    price: 95
  },
  {
    id: "effect_nightrunner",
    title: "Nightrunner",
    name: "Nightrunner",
    desc: "Blazing fast in the dark.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-11-21/cyberpunk-nightrunner/thumbnail.png",
    type: "profile-effect",
    price: 100
  },
  {
    id: "effect_uplink_error",
    title: "Uplink Error",
    name: "Uplink Error",
    desc: "Signal lost. Warning.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-11-21/cyberpunk-uplink-error/thumbnail.png",
    type: "profile-effect",
    price: 90
  },
  {
    id: "effect_graveyard_cat",
    title: "Graveyard Cat",
    name: "Graveyard Cat",
    desc: "Spooky pets playing.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-10-17/halloween-graveyard-cat/thumbnail.png",
    type: "profile-effect",
    price: 75
  },
  {
    id: "effect_ghosts",
    title: "Ghosts",
    name: "Ghosts",
    desc: "Cute spectral company.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-10-17/halloween-ghosts/thumbnail.png",
    type: "profile-effect",
    price: 70
  },
  {
    id: "effect_zombie_slime",
    title: "Zombie Slime",
    name: "Zombie Slime",
    desc: "Highly radioactive.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-10-17/halloween-zombie-slime/thumbnail.png",
    type: "profile-effect",
    price: 80
  },
  {
    id: "effect_fall_leaves",
    title: "Fall Leaves",
    name: "Fall Leaves",
    desc: "Autumn breeze embrace.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-09-26/fall-fall-leaves/thumbnail.png",
    type: "profile-effect",
    price: 65
  },
  {
    id: "effect_soul_leaving",
    title: "Soul Leaving Body",
    name: "Soul Leaving Body",
    desc: "Defeated completely.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-09-07/anime-soul-leaving-body/thumbnail.png",
    type: "profile-effect",
    price: 85
  },
  {
    id: "effect_starry_eyed",
    title: "Starry Eyed",
    name: "Starry Eyed",
    desc: "Mesmerized and amazed.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-09-07/anime-starry-eyed/thumbnail.png",
    type: "profile-effect",
    price: 70
  },
  {
    id: "effect_mokoko",
    title: "Mokoko",
    name: "Mokoko",
    desc: "Cute green seedling bloom.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-08-15/lost-ark-mokoko/thumbnail.png",
    type: "profile-effect",
    price: 65
  },
  {
    id: "effect_ice_cave",
    title: "Ice Cave",
    name: "Ice Cave",
    desc: "Frozen in everlasting ice.",
    imgSrc: "https://cdn.discordapp.com/assets/profile_effects/effects/2023-08-15/ice-cave/thumbnail.png",
    type: "profile-effect",
    price: 80
  }
];
