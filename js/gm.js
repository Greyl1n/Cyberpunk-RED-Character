// ============================================================
// GAME MASTER (GM) SCREEN, 6-SLOT PLAYERS & QUICK NPC GENERATOR
// ============================================================

/**
 * gmState holds up to 6 loaded Player sheets and up to 6 Quick NPC sheets,
 * along with sub-tab and interactive modal navigation state.
 */
var gmState = {
  loadedSheets: [], // Player character objects (max 6)
  maxSheets: 6,
  npcSheets: [],    // Quick NPC character objects (max 6)
  maxNpcSheets: 6,
  activeSubTab: "players", // "players" | "npcs"
  npcBuilderMode: "archetype", // "archetype" | "role" | "cn"
  npcBuilderVisible: true,
  activeModalPool: "players", // "players" | "npcs"
  activeModalIndex: null,
  currentModalTab: "vitals",
  skillSearchQuery: ""
};

// ============================================================
// OFFICIAL RULEBOOK & DLC NPC ARCHETYPE TEMPLATES
// ============================================================
var GM_NPC_ARCHETYPES = [
  // --- MOOKS / GRUNTS (CRB p.412-413) ---
  {
    id: "mook_boosterganger",
    category: "Mooks & Grunts (CRB p.412)",
    name: "Boosterganger",
    role: "Boosterganger (Mook)",
    roleAbilityRank: 1,
    tier: "Mook",
    hpMax: 20,
    stats: { int: 2, ref: 6, dex: 5, tech: 2, cool: 4, will: 2, luck: 0, move: 4, body: 4, emp: 3 },
    armor: [
      { id: "leathers_head", name: "Leathers (Head)", sp: 4, slots: "Head", enc: 0, cost: 20 },
      { id: "leathers", name: "Leathers (Body)", sp: 4, slots: "Body", enc: 0, cost: 20 }
    ],
    weapons: [
      { id: "very_heavy_pistol", name: "Poor Quality Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 100 },
      { id: "rippers", name: "Rippers (Cyberweapon)", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 500 }
    ],
    cyberware: [
      { id: "neural_link", name: "Neural Link", type: "Neuralware", hc: 7, cost: 500 },
      { id: "rippers", name: "Rippers", type: "Cyberlimb", hc: 3, cost: 500 }
    ],
    gear: [{ id: "agent", name: "Disposable Cell Phone", qty: 1, cost: 50 }],
    skillRanks: {
      athletics: 4, brawling: 4, concentration: 2, conceal_reveal_object: 2, conversation: 2,
      drive_land_vehicle: 4, education: 2, endurance: 4, evasion: 2, first_aid: 2,
      handgun: 6, human_perception: 2, interrogation: 2, language_1: 2, local_expert_1: 2,
      melee_weapon: 6, perception: 4, persuasion: 2, resist_torture_drugs: 2, stealth: 2
    },
    gmNotes: "[CRB p.412] Mook / Street Boosterganger. Violent street gang member enhanced with Rippers."
  },
  {
    id: "mook_bodyguard",
    category: "Mooks & Grunts (CRB p.412)",
    name: "Bodyguard",
    role: "Bodyguard (Mook)",
    roleAbilityRank: 1,
    tier: "Mook",
    hpMax: 35,
    stats: { int: 3, ref: 6, dex: 5, tech: 2, cool: 4, will: 5, luck: 0, move: 4, body: 6, emp: 3 },
    armor: [
      { id: "kevlar_head", name: "Kevlar (Head)", sp: 7, slots: "Head", enc: 0, cost: 50 },
      { id: "kevlar", name: "Kevlar (Body)", sp: 7, slots: "Body", enc: 0, cost: 50 }
    ],
    weapons: [
      { id: "shotgun_pump", name: "Poor Quality Shotgun", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 4, cost: 100 },
      { id: "very_heavy_pistol", name: "Poor Quality Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 100 },
      { id: "baseball_bat", name: "Baseball Bat (Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 20 }
    ],
    cyberware: [],
    gear: [{ id: "radio_communicator", name: "Radio Communicator", qty: 1, cost: 100 }],
    skillRanks: {
      athletics: 4, brawling: 4, concentration: 2, conversation: 2, education: 2,
      endurance: 4, evasion: 2, first_aid: 2, handgun: 4, human_perception: 2,
      interrogation: 2, language_1: 2, local_expert_1: 2, melee_weapon: 4,
      perception: 4, persuasion: 2, resist_torture_drugs: 2, shoulder_arms: 4, stealth: 2
    },
    gmNotes: "[CRB p.412] Mook / Hired Muscle Bodyguard equipped with Kevlar, Shotgun, and VH Pistol."
  },
  {
    id: "mook_road_ganger",
    category: "Mooks & Grunts (CRB p.412)",
    name: "Road Ganger",
    role: "Nomad (Mook)",
    roleAbilityRank: 2,
    tier: "Mook",
    hpMax: 35,
    stats: { int: 3, ref: 6, dex: 5, tech: 4, cool: 5, will: 5, luck: 0, move: 4, body: 5, emp: 4 },
    armor: [
      { id: "leathers_head", name: "Leathers (Head)", sp: 4, slots: "Head", enc: 0, cost: 20 },
      { id: "leathers", name: "Leathers (Body)", sp: 4, slots: "Body", enc: 0, cost: 20 }
    ],
    weapons: [
      { id: "crossbow", name: "Poor Quality Crossbow", type: "Archery", skill: "archery", dmg: "4d6", rof: 1, mag: 1, cost: 100 },
      { id: "heavy_pistol", name: "Poor Quality Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 100 },
      { id: "machete", name: "Machete", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 50 }
    ],
    cyberware: [],
    gear: [{ id: "rope", name: "Rope (60m)", qty: 1, cost: 20 }],
    skillRanks: {
      archery: 4, athletics: 4, brawling: 4, concentration: 2, conversation: 2,
      drive_land_vehicle: 4, education: 2, endurance: 4, evasion: 2, first_aid: 2,
      handgun: 4, human_perception: 2, language_1: 2, land_vehicle_tech: 4,
      local_expert_1: 2, melee_weapon: 4, perception: 4, persuasion: 2,
      resist_torture_drugs: 4, stealth: 2, wilderness_survival: 4
    },
    gmNotes: "[CRB p.413] Mook / Badlands Road Ganger on a bike or outrigger."
  },
  {
    id: "mook_security_operative",
    category: "Mooks & Grunts (CRB p.412)",
    name: "Security Operative",
    role: "Security Operative (Mook)",
    roleAbilityRank: 1,
    tier: "Mook",
    hpMax: 30,
    stats: { int: 3, ref: 7, dex: 4, tech: 3, cool: 4, will: 4, luck: 0, move: 4, body: 5, emp: 3 },
    armor: [
      { id: "kevlar_head", name: "Kevlar (Head)", sp: 7, slots: "Head", enc: 0, cost: 50 },
      { id: "kevlar", name: "Kevlar (Body)", sp: 7, slots: "Body", enc: 0, cost: 50 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Poor Quality Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 100 },
      { id: "very_heavy_pistol", name: "Poor Quality Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 100 },
      { id: "knife", name: "Combat Knife", type: "Melee Weapon", skill: "melee_weapon", dmg: "1d6", rof: 2, cost: 50 }
    ],
    cyberware: [],
    gear: [{ id: "radio_communicator", name: "Radio Communicator", qty: 1, cost: 100 }],
    skillRanks: {
      athletics: 4, autofire: 3, brawling: 4, concentration: 2, conversation: 2,
      education: 2, evasion: 2, first_aid: 2, handgun: 3, human_perception: 2,
      interrogation: 2, language_1: 2, local_expert_1: 2, melee_weapon: 2,
      perception: 2, persuasion: 2, resist_torture_drugs: 2, shoulder_arms: 3, stealth: 2
    },
    gmNotes: "[CRB p.413] Mook / Corporate Guard & Facility Patrol Operative."
  },

  // --- LIEUTENANTS (CRB p.414-415) ---
  {
    id: "lt_netrunner",
    category: "Lieutenants (CRB p.414)",
    name: "Netrunner",
    role: "Netrunner",
    roleAbilityRank: 4,
    tier: "Lieutenant",
    hpMax: 35,
    stats: { int: 6, ref: 5, dex: 5, tech: 7, cool: 5, will: 4, luck: 0, move: 6, body: 5, emp: 5 },
    armor: [
      { id: "bodyweight_suit_head", name: "Bodyweight Suit (Head)", sp: 11, slots: "Head", enc: 0, cost: 1000 },
      { id: "bodyweight_suit", name: "Bodyweight Suit (Body)", sp: 11, slots: "Body", enc: 0, cost: 1000 }
    ],
    weapons: [
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 }
    ],
    cyberware: [
      { id: "neural_link", name: "Neural Link", type: "Neuralware", hc: 7, cost: 500 },
      { id: "interface_plugs", name: "Interface Plugs", type: "Neuralware", hc: 7, cost: 500 },
      { id: "cybereye", name: "Cybereyes (Paired w/ Virtuality)", type: "Cybereye", hc: 18, cost: 400 }
    ],
    gear: [{ id: "agent", name: "Agent + Cyberdeck (7 Slots: Sword, Banhammer, Worm, Armor)", qty: 1, cost: 500 }],
    skillRanks: {
      athletics: 2, basic_tech: 4, brawling: 2, concentration: 2, conceal_reveal_object: 4,
      conversation: 2, cryptography: 5, cybertech: 4, education: 4, electronics_security_tech: 6,
      evasion: 4, first_aid: 2, handgun: 6, human_perception: 2, language_1: 2,
      library_search: 6, local_expert_1: 2, perception: 4, persuasion: 2, pick_lock: 2, stealth: 4
    },
    gmNotes: "[CRB p.414] Lieutenant / Combat Netrunner (Interface Rank 4, 3 NET Actions/turn)."
  },
  {
    id: "lt_reclaimer_chief",
    category: "Lieutenants (CRB p.414)",
    name: "Reclaimer Chief",
    role: "Nomad",
    roleAbilityRank: 4,
    tier: "Lieutenant",
    hpMax: 40,
    stats: { int: 5, ref: 7, dex: 6, tech: 5, cool: 6, will: 5, luck: 0, move: 5, body: 7, emp: 4 },
    armor: [
      { id: "light_armorjack_head", name: "Light Armorjack (Head)", sp: 11, slots: "Head", enc: 0, cost: 100 },
      { id: "light_armorjack", name: "Light Armorjack (Body)", sp: 11, slots: "Body", enc: 0, cost: 100 }
    ],
    weapons: [
      { id: "shotgun_pump", name: "Shotgun (Slug / Shells)", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 4, cost: 500 },
      { id: "heavy_pistol", name: "Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 500 },
      { id: "big_knucks", name: "Big Knucks (Medium Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 100 }
    ],
    cyberware: [
      { id: "cyberarm", name: "Cyberarm w/ Big Knucks", type: "Cyberlimb", hc: 10, cost: 600 },
      { id: "subdermal_pocket", name: "Subdermal Pocket", type: "External", hc: 3, cost: 100 }
    ],
    gear: [{ id: "medscanner", name: "Binoculars & Tool Kit", qty: 1, cost: 150 }],
    skillRanks: {
      animal_handling: 4, athletics: 4, basic_tech: 6, brawling: 4, concentration: 2,
      conversation: 2, cybertech: 4, drive_land_vehicle: 6, education: 2, endurance: 4,
      evasion: 4, first_aid: 6, handgun: 6, human_perception: 2, language_1: 2,
      land_vehicle_tech: 6, local_expert_1: 6, melee_weapon: 6, perception: 4, persuasion: 2,
      resist_torture_drugs: 4, riding: 4, shoulder_arms: 6, stealth: 2, tracking: 4,
      weaponstech: 4, wilderness_survival: 6
    },
    gmNotes: "[CRB p.414] Lieutenant / Reclaimer Chief & Pack Leader (Moto Rank 4)."
  },
  {
    id: "lt_security_officer",
    category: "Lieutenants (CRB p.414)",
    name: "Security Officer",
    role: "Solo",
    roleAbilityRank: 3,
    tier: "Lieutenant",
    hpMax: 40,
    stats: { int: 4, ref: 8, dex: 6, tech: 4, cool: 6, will: 5, luck: 0, move: 5, body: 7, emp: 3 },
    armor: [
      { id: "light_armorjack_head", name: "Subdermal Armor (Head)", sp: 11, slots: "Head", enc: 0, cost: 0 },
      { id: "light_armorjack", name: "Subdermal Armor (Body)", sp: 11, slots: "Body", enc: 0, cost: 1000 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "heavy_pistol", name: "Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 500 },
      { id: "rippers", name: "Rippers (Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 500 }
    ],
    cyberware: [
      { id: "subdermal_armor", name: "Subdermal Armor (SP 11)", type: "External", hc: 14, cost: 1000 },
      { id: "cyberaudio_suite", name: "Cyberaudio Suite w/ Internal Agent", type: "Cyberaudio", hc: 10, cost: 600 },
      { id: "rippers", name: "Rippers", type: "Cyberlimb", hc: 3, cost: 500 }
    ],
    gear: [{ id: "radio_communicator", name: "Encrypted Comms & Handcuffs", qty: 1, cost: 150 }],
    skillRanks: {
      athletics: 6, autofire: 4, brawling: 4, concentration: 2, conversation: 2,
      drive_land_vehicle: 2, education: 2, endurance: 4, evasion: 4, first_aid: 4,
      handgun: 6, human_perception: 2, interrogation: 4, language_1: 2, local_expert_1: 4,
      martial_arts: 4, melee_weapon: 6, perception: 4, persuasion: 2,
      resist_torture_drugs: 6, shoulder_arms: 4, stealth: 2, tactics: 4
    },
    gmNotes: "[CRB p.415] Lieutenant / Elite Corporate Security Officer (Combat Awareness Rank 3)."
  },

  // --- MINI-BOSSES & BOSSES (CRB p.416-417) ---
  {
    id: "miniboss_cyberpsycho",
    category: "Mini-Bosses & Bosses (CRB p.416)",
    name: "Cyberpsycho",
    role: "Solo",
    roleAbilityRank: 6,
    tier: "Mini-Boss",
    hpMax: 55,
    stats: { int: 5, ref: 8, dex: 8, tech: 4, cool: 6, will: 7, luck: 0, move: 8, body: 10, emp: 0 },
    armor: [
      { id: "subdermal_armor_head", name: "Subdermal Armor (Head)", sp: 11, slots: "Head", enc: 0, cost: 0 },
      { id: "subdermal_armor", name: "Subdermal Armor (Body)", sp: 11, slots: "Body", enc: 0, cost: 1000 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "grenade_frag", name: "Popup Grenade Launcher (AP)", type: "Heavy Weapons", skill: "heavy_weapons", dmg: "6d6", rof: 1, mag: 2, cost: 500 },
      { id: "wolvers", name: "Wolvers (Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "3d6", rof: 2, cost: 500 },
      { id: "cybersnake", name: "Cybersnake (Very Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "4d6", rof: 1, cost: 1000 }
    ],
    cyberware: [
      { id: "linear_frame_sigma", name: "Implanted Linear Frame Sigma (BODY 10)", type: "Borgware", hc: 14, cost: 1000 },
      { id: "subdermal_armor", name: "Subdermal Armor (SP 11)", type: "External", hc: 14, cost: 1000 },
      { id: "neural_link", name: "Neural Link w/ Kerenzikov (+2 Init)", type: "Neuralware", hc: 21, cost: 1000 },
      { id: "cybereye", name: "Cybereyes w/ Targeting Scope & Low Light/IR/UV", type: "Cybereye", hc: 21, cost: 1500 },
      { id: "cyberarm", name: "Cyberarm w/ Popup Grenade Launcher & Wolvers", type: "Cyberlimb", hc: 21, cost: 1500 },
      { id: "cyberleg", name: "Cyberlegs w/ Jump Boosters & Skate Foot", type: "Cyberlimb", hc: 20, cost: 1200 },
      { id: "cybersnake", name: "Cybersnake", type: "Internal", hc: 14, cost: 1000 }
    ],
    gear: [{ id: "black_lace", name: "Black Lace Dose", qty: 2, cost: 100 }],
    skillRanks: {
      athletics: 8, autofire: 6, brawling: 6, concentration: 4, evasion: 6,
      endurance: 6, first_aid: 2, handgun: 6, heavy_weapons: 6, human_perception: 2,
      interrogation: 4, language_1: 2, local_expert_1: 2, martial_arts: 6,
      melee_weapon: 8, perception: 6, persuasion: 2, resist_torture_drugs: 6,
      shoulder_arms: 6, stealth: 4, tactics: 5
    },
    gmNotes: "[CRB p.416] Mini-Boss / Rampaging Cyberpsycho (Solo Rank 6, Linear Frame Sigma, Kerenzikov, Wolvers, Popup GL)."
  },
  {
    id: "miniboss_outrider",
    category: "Mini-Bosses & Bosses (CRB p.416)",
    name: "Outrider",
    role: "Nomad",
    roleAbilityRank: 6,
    tier: "Mini-Boss",
    hpMax: 45,
    stats: { int: 5, ref: 8, dex: 8, tech: 5, cool: 6, will: 6, luck: 0, move: 6, body: 6, emp: 4 },
    armor: [
      { id: "light_armorjack_head", name: "Light Armorjack (Head)", sp: 11, slots: "Head", enc: 0, cost: 100 },
      { id: "light_armorjack", name: "Light Armorjack (Body)", sp: 11, slots: "Body", enc: 0, cost: 100 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "wolvers", name: "Wolvers (Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "3d6", rof: 2, cost: 500 }
    ],
    cyberware: [
      { id: "neural_link", name: "Neural Link w/ Interface Plugs", type: "Neuralware", hc: 14, cost: 1000 },
      { id: "cyberarm", name: "Cyberarm w/ Wolvers", type: "Cyberlimb", hc: 14, cost: 1000 },
      { id: "radar_sonar_implant", name: "Radar/Sonar Implant", type: "Internal", hc: 7, cost: 500 }
    ],
    gear: [{ id: "roadbike", name: "Combat Roadbike (Armored Chassis + Machine Gun)", qty: 1, cost: 20000 }],
    skillRanks: {
      athletics: 5, autofire: 5, brawling: 4, concentration: 4, drive_land_vehicle: 8,
      endurance: 5, evasion: 6, first_aid: 4, handgun: 6, heavy_weapons: 4,
      land_vehicle_tech: 8, melee_weapon: 6, perception: 6, resist_torture_drugs: 5,
      shoulder_arms: 6, stealth: 4, tracking: 5
    },
    gmNotes: "[CRB p.416] Mini-Boss / Nomad Outrider (Moto Rank 6) with Armored Roadbike."
  },
  {
    id: "miniboss_pyro",
    category: "Mini-Bosses & Bosses (CRB p.416)",
    name: "Pyro",
    role: "Solo",
    roleAbilityRank: 5,
    tier: "Mini-Boss",
    hpMax: 50,
    stats: { int: 6, ref: 8, dex: 7, tech: 7, cool: 6, will: 8, luck: 0, move: 6, body: 7, emp: 2 },
    armor: [
      { id: "heavy_armorjack_head", name: "Heavy Armorjack (Head)", sp: 13, slots: "Head", enc: 2, cost: 500 },
      { id: "heavy_armorjack", name: "Heavy Armorjack (Body)", sp: 13, slots: "Body", enc: 2, cost: 500 }
    ],
    weapons: [
      { id: "flamethrower", name: "Flamethrower (Strong Burn 4HP/turn)", type: "Heavy Weapons", skill: "heavy_weapons", dmg: "3d6", rof: 1, mag: 4, cost: 500 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol (Incendiary Ammo)", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "machete", name: "Heavy Melee Blade", type: "Melee Weapon", skill: "melee_weapon", dmg: "3d6", rof: 2, cost: 100 },
      { id: "grenade_incendiary", name: "Incendiary Grenades (x3)", type: "Heavy Weapons", skill: "athletics", dmg: "4d6", rof: 1, cost: 300 }
    ],
    cyberware: [
      { id: "nasal_filters", name: "Nasal Filters & Toxin Binders", type: "Internal", hc: 7, cost: 600 },
      { id: "subdermal_armor", name: "Subdermal Armor (SP 11)", type: "External", hc: 14, cost: 1000 },
      { id: "neural_link", name: "Neural Link w/ Pain Editor", type: "Neuralware", hc: 21, cost: 1500 }
    ],
    gear: [{ id: "grenade_incendiary", name: "Incendiary Grenades", qty: 3, cost: 300 }],
    skillRanks: {
      athletics: 5, brawling: 5, concentration: 4, demolitions: 7, endurance: 5,
      evasion: 6, first_aid: 2, handgun: 6, heavy_weapons: 7, interrogation: 5,
      melee_weapon: 6, perception: 5, resist_torture_drugs: 6, shoulder_arms: 7,
      stealth: 3, weaponstech: 5
    },
    gmNotes: "[CRB p.417] Mini-Boss / Pyro Demolitionist (Solo Rank 5, Flamethrower, Incendiary Arsenal, Pain Editor)."
  },

  // --- HARDENED MOOKS & LIEUTENANTS (DLC) ---
  {
    id: "hardened_boosterganger",
    category: "Hardened Mooks & Lts (DLC)",
    name: "Hardened Boosterganger",
    role: "Boosterganger (Hardened Mook)",
    roleAbilityRank: 2,
    tier: "Hardened Mook",
    hpMax: 35,
    stats: { int: 3, ref: 7, dex: 6, tech: 2, cool: 5, will: 5, luck: 0, move: 5, body: 6, emp: 2 },
    armor: [
      { id: "kevlar_head", name: "Kevlar (Head)", sp: 7, slots: "Head", enc: 0, cost: 50 },
      { id: "kevlar", name: "Kevlar (Body)", sp: 7, slots: "Body", enc: 0, cost: 50 }
    ],
    weapons: [
      { id: "heavy_smg", name: "Heavy SMG", type: "Shoulder Arms", skill: "handgun", dmg: "3d6", rof: 1, mag: 40, cost: 100 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "wolvers", name: "Wolvers (Heavy Melee)", type: "Melee Weapon", skill: "melee_weapon", dmg: "3d6", rof: 2, cost: 500 }
    ],
    cyberware: [
      { id: "neural_link", name: "Neural Link w/ Kerenzikov (+2 Init)", type: "Neuralware", hc: 21, cost: 1000 },
      { id: "wolvers", name: "Wolvers", type: "Cyberlimb", hc: 7, cost: 500 }
    ],
    gear: [{ id: "smash", name: "Smash / Boost", qty: 2, cost: 50 }],
    skillRanks: {
      athletics: 5, autofire: 5, brawling: 5, drive_land_vehicle: 5, endurance: 5,
      evasion: 6, handgun: 6, melee_weapon: 6, perception: 4, resist_torture_drugs: 5, stealth: 3
    },
    gmNotes: "[Hardened Mooks DLC] Chromed-up Boosterganger with Wolvers, Kerenzikov, and Evasion +12."
  },
  {
    id: "hardened_security_operative",
    category: "Hardened Mooks & Lts (DLC)",
    name: "Hardened Security Operative",
    role: "Security Operative (Hardened Mook)",
    roleAbilityRank: 2,
    tier: "Hardened Mook",
    hpMax: 35,
    stats: { int: 4, ref: 7, dex: 6, tech: 4, cool: 5, will: 5, luck: 0, move: 5, body: 6, emp: 3 },
    armor: [
      { id: "light_armorjack_head", name: "Light Armorjack (Head)", sp: 11, slots: "Head", enc: 0, cost: 100 },
      { id: "light_armorjack", name: "Light Armorjack (Body)", sp: 11, slots: "Body", enc: 0, cost: 100 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "grenade_flashbang", name: "Flashbang Grenade", type: "Heavy Weapons", skill: "athletics", dmg: "0", rof: 1, cost: 100 }
    ],
    cyberware: [
      { id: "cybereye", name: "Cybereye w/ Targeting Scope", type: "Cybereye", hc: 10, cost: 600 },
      { id: "cyberaudio_suite", name: "Cyberaudio w/ Internal Agent", type: "Cyberaudio", hc: 10, cost: 600 }
    ],
    gear: [{ id: "radio_communicator", name: "Tactical Comms & Flashbang", qty: 1, cost: 200 }],
    skillRanks: {
      athletics: 6, autofire: 5, brawling: 5, concentration: 4, endurance: 4,
      evasion: 5, handgun: 5, interrogation: 4, melee_weapon: 4, perception: 5,
      resist_torture_drugs: 4, shoulder_arms: 5, stealth: 4, tactics: 4
    },
    gmNotes: "[Hardened Mooks DLC] Tactical Corporate Security Operative in Light Armorjack (SP 11) with Assault Rifle."
  },
  {
    id: "hardened_militech_lt",
    category: "Hardened Mooks & Lts (DLC)",
    name: "Hardened Militech Enforcer",
    role: "Solo (Hardened Lt.)",
    roleAbilityRank: 4,
    tier: "Hardened Lieutenant",
    hpMax: 45,
    stats: { int: 5, ref: 8, dex: 7, tech: 5, cool: 6, will: 6, luck: 0, move: 6, body: 8, emp: 3 },
    armor: [
      { id: "heavy_armorjack_head", name: "Heavy Armorjack (Head)", sp: 13, slots: "Head", enc: 2, cost: 500 },
      { id: "heavy_armorjack", name: "Heavy Armorjack (Body)", sp: 13, slots: "Body", enc: 2, cost: 500 }
    ],
    weapons: [
      { id: "assault_rifle", name: "EQ Assault Rifle (Smartgun)", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 1000 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol (AP Ammo)", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "katana", name: "Heavy Combat Blade", type: "Melee Weapon", skill: "melee_weapon", dmg: "3d6", rof: 2, cost: 500 }
    ],
    cyberware: [
      { id: "neural_link", name: "Neural Link, Subdermal Grip & Pain Editor", type: "Neuralware", hc: 24, cost: 1600 },
      { id: "subdermal_armor", name: "Subdermal Armor (SP 11 Backup)", type: "External", hc: 14, cost: 1000 }
    ],
    gear: [{ id: "medtech_bag", name: "Trauma Kit & Smoke Grenades x2", qty: 1, cost: 200 }],
    skillRanks: {
      athletics: 6, autofire: 6, brawling: 6, concentration: 5, endurance: 6,
      evasion: 6, first_aid: 4, handgun: 6, heavy_weapons: 5, interrogation: 5,
      martial_arts: 6, melee_weapon: 6, perception: 6, resist_torture_drugs: 6,
      shoulder_arms: 6, stealth: 5, tactics: 6
    },
    gmNotes: "[Hardened Lieutenants DLC] Veteran Corporate Strike Team Leader (Solo Rank 4, Pain Editor, Smart Assault Rifle)."
  },

  // --- LAWMAN BACKUP & EXEC RETINUE (CRB p.155-159) ---
  {
    id: "backup_corp_sec",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Corporate Security Guard",
    role: "Lawman Backup (Rank 1-2)",
    roleAbilityRank: 2,
    tier: "Backup (CN 8)",
    combatNumber: 8,
    hpMax: 20,
    stats: { int: 4, ref: 5, dex: 5, tech: 3, cool: 4, will: 4, luck: 0, move: 4, body: 4, emp: 4 },
    armor: [
      { id: "kevlar_head", name: "Kevlar (Head)", sp: 7, slots: "Head", enc: 0, cost: 50 },
      { id: "kevlar", name: "Kevlar (Body)", sp: 7, slots: "Body", enc: 0, cost: 50 }
    ],
    weapons: [
      { id: "heavy_pistol", name: "Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 500 }
    ],
    cyberware: [],
    gear: [],
    skillRanks: { handgun: 3, brawling: 3, evasion: 3, perception: 4, athletics: 3 },
    gmNotes: "[CRB p.159] Lawman Rank 1-2 Backup: Combat Number 8 | SP 7 | HP 20 | MOVE & BODY 4."
  },
  {
    id: "backup_beat_cop",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Local Beat Cop",
    role: "Lawman Backup (Rank 3-4)",
    roleAbilityRank: 4,
    tier: "Backup (CN 10)",
    combatNumber: 10,
    hpMax: 25,
    stats: { int: 5, ref: 6, dex: 6, tech: 4, cool: 5, will: 5, luck: 0, move: 5, body: 5, emp: 5 },
    armor: [
      { id: "kevlar_head", name: "Kevlar (Head)", sp: 7, slots: "Head", enc: 0, cost: 50 },
      { id: "kevlar", name: "Kevlar (Body)", sp: 7, slots: "Body", enc: 0, cost: 50 }
    ],
    weapons: [
      { id: "heavy_pistol", name: "Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 500 },
      { id: "tonfa", name: "Police Tonfa", type: "Melee Weapon", skill: "melee_weapon", dmg: "2d6", rof: 2, cost: 50 }
    ],
    cyberware: [],
    gear: [{ id: "radio_communicator", name: "Badge, Handcuffs & Cruiser Radio", qty: 1, cost: 100 }],
    skillRanks: { handgun: 4, melee_weapon: 4, brawling: 4, evasion: 4, perception: 5, athletics: 4 },
    gmNotes: "[CRB p.159] Lawman Rank 3-4 Backup: Combat Number 10 | SP 7 | HP 25 | MOVE & BODY 5."
  },
  {
    id: "backup_sheriff",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Sheriff's Dept Deputy",
    role: "Lawman Backup (Rank 5-7)",
    roleAbilityRank: 6,
    tier: "Backup (CN 14)",
    combatNumber: 14,
    hpMax: 35,
    stats: { int: 5, ref: 8, dex: 7, tech: 5, cool: 6, will: 6, luck: 0, move: 4, body: 4, emp: 5 },
    armor: [
      { id: "heavy_armorjack_head", name: "Heavy Armorjack (Head)", sp: 13, slots: "Head", enc: 2, cost: 500 },
      { id: "heavy_armorjack", name: "Heavy Armorjack (Body)", sp: 13, slots: "Body", enc: 2, cost: 500 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "heavy_pistol", name: "Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "3d6", rof: 2, mag: 8, cost: 500 }
    ],
    cyberware: [],
    gear: [],
    skillRanks: { shoulder_arms: 6, handgun: 6, autofire: 6, evasion: 7, perception: 6, brawling: 6 },
    gmNotes: "[CRB p.159] Lawman Rank 5-7 Backup: Combat Number 14 | SP 13 | HP 35 | MOVE & BODY 4."
  },
  {
    id: "backup_zone_marshal",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Recovery Zone Marshal",
    role: "Lawman Backup (Rank 8)",
    roleAbilityRank: 8,
    tier: "Backup (CN 16)",
    combatNumber: 16,
    hpMax: 50,
    stats: { int: 6, ref: 8, dex: 8, tech: 6, cool: 7, will: 8, luck: 0, move: 6, body: 6, emp: 5 },
    armor: [
      { id: "flak_head", name: "Flak Armor (Head)", sp: 15, slots: "Head", enc: 4, cost: 500 },
      { id: "flak", name: "Flak Armor (Body)", sp: 15, slots: "Body", enc: 4, cost: 500 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 },
      { id: "grenade_frag", name: "Grenade Launcher", type: "Heavy Weapons", skill: "heavy_weapons", dmg: "6d6", rof: 1, mag: 2, cost: 500 }
    ],
    cyberware: [],
    gear: [{ id: "superbike", name: "Superbike", qty: 1, cost: 50000 }],
    skillRanks: { shoulder_arms: 8, handgun: 8, heavy_weapons: 8, evasion: 8, perception: 8, brawling: 8 },
    gmNotes: "[CRB p.159] Lawman Rank 8 Backup: Combat Number 16 | SP 15 | HP 50 | MOVE & BODY 6."
  },
  {
    id: "backup_cswat",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "C-SWAT Psycho Squad",
    role: "Lawman Backup (Rank 9)",
    roleAbilityRank: 9,
    tier: "Backup (CN 15)",
    combatNumber: 15,
    hpMax: 35,
    stats: { int: 6, ref: 8, dex: 8, tech: 6, cool: 8, will: 6, luck: 0, move: 4, body: 4, emp: 4 },
    armor: [
      { id: "metalgear_head", name: "Metalgear (Head)", sp: 18, slots: "Head", enc: 4, cost: 5000 },
      { id: "metalgear", name: "Metalgear (Body)", sp: 18, slots: "Body", enc: 4, cost: 5000 }
    ],
    weapons: [
      { id: "assault_rifle", name: "Assault Rifle", type: "Shoulder Arms", skill: "shoulder_arms", dmg: "5d6", rof: 1, mag: 25, cost: 500 },
      { id: "rocket_launcher", name: "Rocket Launcher", type: "Heavy Weapons", skill: "heavy_weapons", dmg: "8d6", rof: 1, mag: 1, cost: 500 }
    ],
    cyberware: [],
    gear: [{ id: "av4", name: "AV-4 Tactical Transport", qty: 1, cost: 100000 }],
    skillRanks: { shoulder_arms: 7, heavy_weapons: 7, autofire: 7, evasion: 7, perception: 7, tactics: 7 },
    gmNotes: "[CRB p.159] Lawman Rank 9 MAX-TAC / C-SWAT Backup: Combat Number 15 | SP 18 | HP 35 | MOVE & BODY 4."
  },
  {
    id: "exec_company_bodyguard",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Company Bodyguard",
    role: "Exec Team Member",
    roleAbilityRank: 3,
    tier: "Exec Team",
    hpMax: 40,
    stats: { int: 4, ref: 8, dex: 7, tech: 3, cool: 7, will: 7, luck: 0, move: 5, body: 7, emp: 4 },
    armor: [
      { id: "light_armorjack_head", name: "Light Armorjack / Subdermal (Head)", sp: 11, slots: "Head", enc: 0, cost: 100 },
      { id: "light_armorjack", name: "Light Armorjack / Subdermal (Body)", sp: 11, slots: "Body", enc: 0, cost: 100 }
    ],
    weapons: [
      { id: "very_heavy_pistol", name: "Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 }
    ],
    cyberware: [
      { id: "enhanced_antibodies", name: "Enhanced Antibodies", type: "Internal", hc: 2, cost: 500 },
      { id: "subdermal_armor", name: "Subdermal Armor (SP 11)", type: "External", hc: 14, cost: 1000 },
      { id: "cyberaudio_suite", name: "Cyberaudio Suite (Internal Agent & Homing Tracer)", type: "Cyberaudio", hc: 12, cost: 700 }
    ],
    gear: [{ id: "agent", name: "Agent & VH Pistol Ammo x50", qty: 1, cost: 150 }],
    skillRanks: {
      handgun: 6, brawling: 6, athletics: 4, evasion: 4, interrogation: 4,
      perception: 4, resist_torture_drugs: 4, tactics: 4, concentration: 2,
      conversation: 2, education: 2, first_aid: 2, human_perception: 2,
      language_1: 2, local_expert_1: 2, persuasion: 2, stealth: 2
    },
    gmNotes: "[CRB p.155] Exec Team Member: Company Bodyguard. Starting Loyalty = 1d6+1."
  },
  {
    id: "exec_covert_operative",
    category: "Lawman Backup & Exec Team (CRB p.155)",
    name: "Company Covert Operative",
    role: "Exec Team Member",
    roleAbilityRank: 3,
    tier: "Exec Team",
    hpMax: 35,
    stats: { int: 5, ref: 8, dex: 6, tech: 4, cool: 7, will: 7, luck: 0, move: 5, body: 6, emp: 4 },
    armor: [
      { id: "light_armorjack_head", name: "Light Armorjack (Head)", sp: 11, slots: "Head", enc: 0, cost: 100 },
      { id: "light_armorjack", name: "Light Armorjack (Body)", sp: 11, slots: "Body", enc: 0, cost: 100 }
    ],
    weapons: [
      { id: "very_heavy_pistol", name: "Popup Very Heavy Pistol", type: "Handgun", skill: "handgun", dmg: "4d6", rof: 1, mag: 8, cost: 500 }
    ],
    cyberware: [
      { id: "cybereye", name: "Cybereyes (Paired Low Light/IR/UV & Color Shift)", type: "Cybereye", hc: 20, cost: 1500 },
      { id: "cyberarm", name: "Cyberarm (Grapple Hand, Popup VH Pistol, Realskinn)", type: "Cyberlimb", hc: 18, cost: 1500 }
    ],
    gear: [{ id: "agent", name: "Agent & VH Pistol Ammo x50", qty: 1, cost: 150 }],
    skillRanks: {
      handgun: 6, stealth: 6, bribery: 4, bureaucracy: 4, business: 4,
      evasion: 4, human_perception: 4, pick_lock: 4, streetwise: 4, trading: 4,
      wardrobe_style: 4, athletics: 2, brawling: 2, concentration: 2, conversation: 2,
      education: 2, first_aid: 2, language_1: 2, local_expert_1: 2, perception: 2, persuasion: 2
    },
    gmNotes: "[CRB p.156] Exec Team Member: Company Covert Operative."
  }
];

// ============================================================
// STREETRAT / FAST & DIRTY ROLE TEMPLATES (CRB p.74-89)
// ============================================================
var GM_ROLE_STREETRAT_TEMPLATES = {
  solo: {
    roleName: "Solo",
    statPriority: ["ref", "dex", "body", "will", "move", "cool", "int", "tech", "emp", "luck"],
    coreSkills: ["handgun", "shoulder_arms", "melee_weapon", "brawling", "evasion", "athletics", "perception", "resist_torture_drugs", "tactics", "stealth", "autofire", "interrogation", "first_aid", "concentration"],
    weaponsByTier: {
      mook: ["heavy_pistol", "knife"],
      lieutenant: ["assault_rifle", "very_heavy_pistol", "machete"],
      miniboss: ["assault_rifle", "shotgun_pump", "katana"],
      boss: ["assault_rifle", "sniper_rifle", "katana", "grenade_frag"]
    },
    cyberware: ["Neural Link", "Kerenzikov (+2 Init)", "Cybereye w/ Targeting Scope", "Subdermal Armor (SP 11)"]
  },
  rockerboy: {
    roleName: "Rockerboy",
    statPriority: ["cool", "emp", "ref", "dex", "will", "move", "int", "body", "tech", "luck"],
    coreSkills: ["persuasion", "play_instrument_1", "conversation", "human_perception", "wardrobe_style", "personal_grooming", "handgun", "melee_weapon", "brawling", "evasion", "streetwise", "composition", "athletics", "perception"],
    weaponsByTier: {
      mook: ["medium_pistol", "knife"],
      lieutenant: ["very_heavy_pistol", "machete"],
      miniboss: ["very_heavy_pistol", "heavy_smg", "katana"],
      boss: ["assault_rifle", "very_heavy_pistol", "katana"]
    },
    cyberware: ["Cyberaudio Suite w/ Voice Stress Analyzer", "Light Tattoo", "Chemskin & Techhair"]
  },
  netrunner: {
    roleName: "Netrunner",
    statPriority: ["int", "tech", "ref", "dex", "will", "cool", "move", "body", "emp", "luck"],
    coreSkills: ["electronics_security_tech", "cryptography", "cybertech", "basic_tech", "library_search", "handgun", "evasion", "stealth", "conceal_reveal_object", "perception", "education", "concentration", "first_aid", "athletics"],
    weaponsByTier: {
      mook: ["light_pistol", "knife"],
      lieutenant: ["very_heavy_pistol", "knife"],
      miniboss: ["very_heavy_pistol", "smg"],
      boss: ["assault_rifle", "very_heavy_pistol"]
    },
    cyberware: ["Neural Link", "Interface Plugs", "Cybereyes w/ Virtuality", "Shift Tacts"]
  },
  tech: {
    roleName: "Tech",
    statPriority: ["tech", "int", "ref", "dex", "will", "body", "cool", "move", "emp", "luck"],
    coreSkills: ["basic_tech", "cybertech", "electronics_security_tech", "weaponstech", "land_vehicle_tech", "shoulder_arms", "handgun", "melee_weapon", "evasion", "athletics", "perception", "education", "science_1", "first_aid"],
    weaponsByTier: {
      mook: ["heavy_pistol", "lead_pipe"],
      lieutenant: ["shotgun_pump", "heavy_pistol"],
      miniboss: ["assault_rifle", "shotgun_pump", "chainsaw"],
      boss: ["assault_rifle", "shotgun_auto", "grenade_frag"]
    },
    cyberware: ["Cyberarm w/ Tool Hand", "Cybereye w/ MicroOptics", "Internal Agent"]
  },
  medtech: {
    roleName: "Medtech",
    statPriority: ["tech", "int", "will", "ref", "dex", "emp", "body", "move", "cool", "luck"],
    coreSkills: ["paramedic", "first_aid", "cybertech", "science_1", "deduction", "resist_torture_drugs", "shoulder_arms", "handgun", "evasion", "perception", "human_perception", "conversation", "education", "concentration"],
    weaponsByTier: {
      mook: ["heavy_pistol", "knife"],
      lieutenant: ["shotgun_pump", "heavy_pistol"],
      miniboss: ["assault_rifle", "very_heavy_pistol"],
      boss: ["assault_rifle", "shotgun_auto", "very_heavy_pistol"]
    },
    cyberware: ["Cybereye w/ TeleOptics", "Cyberarm w/ Medscanner", "Nasal Filters & Toxin Binders"]
  },
  media: {
    roleName: "Media",
    statPriority: ["int", "cool", "emp", "ref", "dex", "will", "tech", "move", "body", "luck"],
    coreSkills: ["composition", "photography_film", "persuasion", "conversation", "human_perception", "deduction", "library_search", "bribery", "streetwise", "handgun", "evasion", "stealth", "perception", "local_expert_1"],
    weaponsByTier: {
      mook: ["light_pistol", "knife"],
      lieutenant: ["heavy_pistol", "stun_baton"],
      miniboss: ["very_heavy_pistol", "smg"],
      boss: ["assault_rifle", "very_heavy_pistol"]
    },
    cyberware: ["Cyberaudio Suite w/ Amplified Hearing & Audio Recorder", "Cybereye w/ MicroVideo"]
  },
  exec: {
    roleName: "Exec",
    statPriority: ["cool", "int", "emp", "will", "ref", "dex", "tech", "move", "body", "luck"],
    coreSkills: ["business", "bureaucracy", "accounting", "persuasion", "bribery", "conversation", "human_perception", "personal_grooming", "wardrobe_style", "handgun", "evasion", "deduction", "perception", "education"],
    weaponsByTier: {
      mook: ["medium_pistol", "knife"],
      lieutenant: ["very_heavy_pistol", "stun_baton"],
      miniboss: ["very_heavy_pistol", "heavy_smg"],
      boss: ["assault_rifle", "very_heavy_pistol", "katana"]
    },
    cyberware: ["Cyberaudio Suite w/ Internal Agent", "Toxin Binders", "Subdermal Armor (SP 11)"]
  },
  lawman: {
    roleName: "Lawman",
    statPriority: ["ref", "dex", "will", "body", "int", "cool", "move", "tech", "emp", "luck"],
    coreSkills: ["handgun", "shoulder_arms", "autofire", "brawling", "melee_weapon", "interrogation", "criminology", "deduction", "tracking", "evasion", "athletics", "perception", "resist_torture_drugs", "tactics"],
    weaponsByTier: {
      mook: ["heavy_pistol", "tonfa"],
      lieutenant: ["shotgun_pump", "heavy_pistol", "tonfa"],
      miniboss: ["assault_rifle", "shotgun_pump", "very_heavy_pistol"],
      boss: ["assault_rifle", "shotgun_auto", "grenade_frag"]
    },
    cyberware: ["Cyberaudio Suite w/ Radio Communicator", "Cybereye w/ Targeting Scope", "Subdermal Armor (SP 11)"]
  },
  fixer: {
    roleName: "Fixer",
    statPriority: ["cool", "int", "emp", "ref", "dex", "will", "tech", "move", "body", "luck"],
    coreSkills: ["trading", "streetwise", "bribery", "persuasion", "conversation", "human_perception", "forgery", "pick_lock", "handgun", "brawling", "evasion", "stealth", "local_expert_1", "perception"],
    weaponsByTier: {
      mook: ["heavy_pistol", "knife"],
      lieutenant: ["very_heavy_pistol", "smg"],
      miniboss: ["heavy_smg", "very_heavy_pistol", "machete"],
      boss: ["assault_rifle", "very_heavy_pistol", "katana"]
    },
    cyberware: ["Cyberaudio Suite w/ Voice Stress Analyzer & Bug Detector", "Subdermal Pocket", "Internal Agent"]
  },
  nomad: {
    roleName: "Nomad",
    statPriority: ["ref", "dex", "tech", "body", "will", "move", "int", "cool", "emp", "luck"],
    coreSkills: ["drive_land_vehicle", "pilot_air_vehicle", "pilot_sea_vehicle", "land_vehicle_tech", "handgun", "shoulder_arms", "melee_weapon", "brawling", "athletics", "endurance", "evasion", "tracking", "wilderness_survival", "perception"],
    weaponsByTier: {
      mook: ["heavy_pistol", "machete"],
      lieutenant: ["shotgun_pump", "heavy_pistol", "machete"],
      miniboss: ["assault_rifle", "very_heavy_pistol", "katana"],
      boss: ["assault_rifle", "shotgun_auto", "grenade_frag"]
    },
    cyberware: ["Neural Link", "Interface Plugs", "Radar/Sonar Implant"]
  }
};

/**
 * initGMScreen()
 * Sets up event listeners for GM screen sub-tabs, player buttons, Quick NPC generator,
 * file inputs, session persistence, and modals.
 */
function initGMScreen() {
  autoLoadGMSessionFromStorage();
  initGMQuickNpcControls();

  const loadJsonBtn = document.getElementById("gmLoadJsonBtn");
  const loadSavedBtn = document.getElementById("gmLoadSavedBtn");
  const exportSessionBtn = document.getElementById("gmExportSessionBtn");
  const importSessionBtn = document.getElementById("gmImportSessionBtn");
  const refreshAllBtn = document.getElementById("gmRefreshAllBtn");
  const diceRollerBtn = document.getElementById("gmDiceRollerBtn");
  const clearAllBtn = document.getElementById("gmClearAllBtn");
  const importFile = document.getElementById("gm_import_file");
  const importSessionFile = document.getElementById("gm_import_session_file");
  const updateSlotFile = document.getElementById("gm_update_slot_file");

  const npcLoadJsonBtn = document.getElementById("gmNpcLoadJsonBtn");
  const npcLoadSavedBtn = document.getElementById("gmNpcLoadSavedBtn");
  const npcImportFile = document.getElementById("gm_npc_import_file");
  const clearAllNpcsBtn = document.getElementById("gmClearAllNpcsBtn");

  if (loadJsonBtn && importFile) {
    loadJsonBtn.addEventListener("click", () => {
      if (gmState.loadedSheets.length >= gmState.maxSheets) {
        alert(`Maximum limit of ${gmState.maxSheets} side-by-side Player sheets reached. Please close a sheet first.`);
        return;
      }
      importFile.click();
    });

    importFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        loadGMCharacterFiles(e.target.files, "players");
      }
      this.value = "";
    });
  }

  if (npcLoadJsonBtn && npcImportFile) {
    npcLoadJsonBtn.addEventListener("click", () => {
      if (gmState.npcSheets.length >= gmState.maxNpcSheets) {
        alert(`Maximum limit of ${gmState.maxNpcSheets} side-by-side NPCs reached. Please remove an NPC first.`);
        return;
      }
      npcImportFile.click();
    });

    npcImportFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        loadGMCharacterFiles(e.target.files, "npcs");
      }
      this.value = "";
    });
  }

  if (exportSessionBtn) {
    exportSessionBtn.addEventListener("click", exportGMSessionFile);
  }

  if (importSessionBtn && importSessionFile) {
    importSessionBtn.addEventListener("click", () => importSessionFile.click());
    importSessionFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        importGMSessionFile(e.target.files[0]);
      }
      this.value = "";
    });
  }

  if (updateSlotFile) {
    updateSlotFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        const slotIdx = parseInt(this.dataset.slotIndex);
        const pool = this.dataset.pool || "players";
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data.stats) {
              alert(`File "${file.name}" is not a valid Cyberpunk RED character.`);
              return;
            }
            updateGMSheetWithData(slotIdx, data, file.name, pool);
          } catch (err) {
            alert(`Failed to parse file: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
      this.value = "";
    });
  }

  if (refreshAllBtn) {
    refreshAllBtn.addEventListener("click", refreshAllGMSheetsFromStorage);
  }

  if (loadSavedBtn) {
    loadSavedBtn.addEventListener("click", () => openGMSavedCharPicker("players"));
  }

  if (npcLoadSavedBtn) {
    npcLoadSavedBtn.addEventListener("click", () => openGMSavedCharPicker("npcs"));
  }

  if (diceRollerBtn) {
    diceRollerBtn.addEventListener("click", openGMDiceRollerModal);
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
      if (gmState.loadedSheets.length === 0) return;
      const ok = typeof customConfirm === "function"
        ? await customConfirm("Clear all loaded Player character sheets from GM view?")
        : confirm("Clear all loaded Player character sheets from GM view?");
      if (!ok) return;
      gmState.loadedSheets = [];
      saveGMSessionToStorage();
      renderGMSheets();
    });
  }

  if (clearAllNpcsBtn) {
    clearAllNpcsBtn.addEventListener("click", async () => {
      if (gmState.npcSheets.length === 0) return;
      const ok = typeof customConfirm === "function"
        ? await customConfirm("Clear all active Quick NPCs from the encounter?")
        : confirm("Clear all active Quick NPCs from the encounter?");
      if (!ok) return;
      gmState.npcSheets = [];
      saveGMSessionToStorage();
      renderGMNpcs();
    });
  }

  renderGMSheets();
  renderGMNpcs();
}

/**
 * switchGMSubTab(subTab)
 * Switches between "players" (6 slots) and "npcs" (Quick NPC generator + 6 slots).
 */
function switchGMSubTab(subTab) {
  gmState.activeSubTab = subTab === "npcs" ? "npcs" : "players";
  const playersPanel = document.getElementById("gm-subpanel-players");
  const npcsPanel = document.getElementById("gm-subpanel-npcs");
  const playersBtn = document.getElementById("gmSubTabPlayersBtn");
  const npcsBtn = document.getElementById("gmSubTabNpcsBtn");

  if (playersPanel && npcsPanel) {
    playersPanel.style.display = gmState.activeSubTab === "players" ? "block" : "none";
    npcsPanel.style.display = gmState.activeSubTab === "npcs" ? "block" : "none";
  }
  if (playersBtn && npcsBtn) {
    playersBtn.classList.toggle("active", gmState.activeSubTab === "players");
    npcsBtn.classList.toggle("active", gmState.activeSubTab === "npcs");
  }
}

/**
 * initGMQuickNpcControls()
 * Populates dropdowns for the 3 Quick NPC creation modes.
 */
function initGMQuickNpcControls() {
  const catSel = document.getElementById("gm_arch_category");
  if (catSel) {
    const categories = [];
    GM_NPC_ARCHETYPES.forEach(a => {
      if (!categories.includes(a.category)) categories.push(a.category);
    });
    catSel.innerHTML = `<option value="ALL">All Rulebook Categories (${GM_NPC_ARCHETYPES.length})</option>` +
      categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    populateGMArchetypeOptions();
  }

  // Populate Combat Number Weapon dropdowns
  const w1Sel = document.getElementById("gm_cn_weapon1");
  const w2Sel = document.getElementById("gm_cn_weapon2");
  if (w1Sel && w2Sel && typeof DATA !== "undefined" && Array.isArray(DATA.weapons)) {
    const commonIds = [
      "heavy_pistol", "very_heavy_pistol", "medium_pistol", "light_pistol",
      "smg", "heavy_smg", "shotgun_pump", "shotgun_auto", "assault_rifle",
      "sniper_rifle", "bow", "crossbow", "grenade_frag", "knife", "machete",
      "katana", "baseball_bat", "lead_pipe", "tonfa", "stun_baton", "chainsaw"
    ];
    const sorted = [];
    commonIds.forEach(id => {
      const found = DATA.weapons.find(w => w.id === id);
      if (found) sorted.push(found);
    });
    DATA.weapons.forEach(w => {
      if (!commonIds.includes(w.id)) sorted.push(w);
    });

    const optsHtml = `<option value="">-- None --</option>` + sorted.map(w =>
      `<option value="${escapeHtml(w.id)}">${escapeHtml(w.name)} (${w.dmg || '1d6'}, ROF ${w.rof || 1})</option>`
    ).join("");
    w1Sel.innerHTML = optsHtml;
    w2Sel.innerHTML = optsHtml;
    w1Sel.value = "heavy_pistol";
    w2Sel.value = "knife";
  }
}

/**
 * populateGMArchetypeOptions()
 */
function populateGMArchetypeOptions() {
  const catSel = document.getElementById("gm_arch_category");
  const tplSel = document.getElementById("gm_arch_template");
  if (!tplSel) return;

  const selectedCat = catSel ? catSel.value : "ALL";
  const filtered = selectedCat === "ALL"
    ? GM_NPC_ARCHETYPES
    : GM_NPC_ARCHETYPES.filter(a => a.category === selectedCat);

  tplSel.innerHTML = filtered.map(a =>
    `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)} — ${escapeHtml(a.tier)} (HP ${a.hpMax}${a.combatNumber ? `, CN ${a.combatNumber}` : ''})</option>`
  ).join("");

  updateGMArchetypePreview();
}

/**
 * updateGMArchetypePreview()
 */
function updateGMArchetypePreview() {
  const tplSel = document.getElementById("gm_arch_template");
  const previewEl = document.getElementById("gm_arch_preview");
  if (!tplSel || !previewEl) return;

  const arch = GM_NPC_ARCHETYPES.find(a => a.id === tplSel.value) || GM_NPC_ARCHETYPES[0];
  if (!arch) return;

  const bodyArmor = arch.armor.find(x => x.slots === "Body") || { sp: 0, name: "None" };
  const weapList = arch.weapons.map(w => `${w.name} (${w.dmg})`).join(", ") || "Unarmed";
  const cnBadge = arch.combatNumber ? ` | <strong>⚔️ Combat Number:</strong> +${arch.combatNumber}` : "";

  previewEl.innerHTML = `
    <div>
      <strong>${escapeHtml(arch.name)}</strong> <span style="color:var(--primary)">[${escapeHtml(arch.tier)}]</span> —
      <strong>HP:</strong> ${arch.hpMax} | <strong>Armor SP:</strong> ${bodyArmor.sp} (${escapeHtml(bodyArmor.name)})${cnBadge} |
      <strong>Weapons:</strong> ${escapeHtml(weapList)}
      <div style="opacity:0.8;margin-top:0.2rem">${escapeHtml(arch.gmNotes || "")}</div>
    </div>
  `;
}

/**
 * toggleGMNpcBuilderPanel()
 */
function toggleGMNpcBuilderPanel() {
  gmState.npcBuilderVisible = !gmState.npcBuilderVisible;
  const panel = document.getElementById("gm_npc_builder_panel");
  const btn = document.getElementById("gmToggleNpcBuilderBtn");
  if (panel) panel.style.display = gmState.npcBuilderVisible ? "block" : "none";
  if (btn) btn.textContent = gmState.npcBuilderVisible ? "⚡ Hide Builder" : "⚡ Show Quick NPC Builder";
}

/**
 * switchGMNpcBuilderMode(mode)
 */
function switchGMNpcBuilderMode(mode) {
  gmState.npcBuilderMode = mode;
  const modes = ["archetype", "role", "cn"];
  modes.forEach(m => {
    const bodyEl = document.getElementById(`gm_npc_mode_${m}`);
    if (bodyEl) bodyEl.style.display = m === mode ? "block" : "none";
  });
  const btnMap = {
    archetype: "gmNpcModeArchetypeBtn",
    role: "gmNpcModeRoleBtn",
    cn: "gmNpcModeCnBtn"
  };
  Object.keys(btnMap).forEach(k => {
    const b = document.getElementById(btnMap[k]);
    if (b) b.classList.toggle("active", k === mode);
  });
}

/**
 * generateGMStreetHandle()
 */
function generateGMStreetHandle() {
  const prefixes = ["Blitz", "Cipher", "Dash", "Echo", "Flux", "Ghost", "Havoc", "Jinx", "Karma", "Locke", "Morph", "Nyx", "Onyx", "Pixel", "Quake", "Razor", "Shade", "Trigger", "Vex", "Whisper", "Zero", "Chrome", "Volt", "Fang", "Hex", "Spike", "brick", "Ash"];
  const suffixes = ["Dog", "Wolf", "Fox", "Hawk", "Rat", "Viper", "Shark", "Raven", "Panther", "Tiger", "Hound", "Jackal", "Coyote", "Lynx", "Striker", "Runner", "Skull", "Blade", "Ghost", "Wire"];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  return (p.charAt(0).toUpperCase() + p.slice(1)) + " " + s;
}

/**
 * getNextNumberedNpcHandle(baseName)
 */
function getNextNumberedNpcHandle(baseName) {
  const cleanBase = (baseName || "NPC").trim();
  const existing = gmState.npcSheets.filter(n =>
    n.handle === cleanBase || n.handle.startsWith(cleanBase + " #")
  );
  if (existing.length === 0) return `${cleanBase} #1`;
  let maxNum = 0;
  existing.forEach(n => {
    const m = n.handle.match(/#(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1]) || 0);
    else maxNum = Math.max(maxNum, 1);
  });
  return `${cleanBase} #${maxNum + 1}`;
}

/**
 * addGMNpcToEncounter(npcObj)
 */
function addGMNpcToEncounter(npcObj) {
  if (gmState.npcSheets.length >= gmState.maxNpcSheets) {
    alert(`Maximum of ${gmState.maxNpcSheets} side-by-side NPCs reached. Remove an NPC first.`);
    return false;
  }
  const normalized = sanitizeGMCharacterData(npcObj, npcObj.handle || "Quick NPC");
  normalized.isQuickNpc = true;
  if (npcObj.combatNumber !== undefined && npcObj.combatNumber !== null) {
    normalized.combatNumber = parseInt(npcObj.combatNumber) || 10;
  }
  if (npcObj.hpMax) {
    normalized.hpMax = npcObj.hpMax;
    normalized.hpCurrent = npcObj.hpCurrent !== undefined ? npcObj.hpCurrent : npcObj.hpMax;
  }
  gmState.npcSheets.push(normalized);
  switchGMSubTab("npcs");
  renderGMNpcs();
  return true;
}

/**
 * spawnGMArchetypeNPC()
 * Mode 1: Spawns an official Rulebook / DLC Archetype NPC.
 */
function spawnGMArchetypeNPC() {
  const tplSel = document.getElementById("gm_arch_template");
  const handleInput = document.getElementById("gm_arch_handle");
  const archId = tplSel ? tplSel.value : GM_NPC_ARCHETYPES[0].id;
  quickSpawnArchetypeById(archId, handleInput ? handleInput.value.trim() : "");
  if (handleInput) handleInput.value = "";
}

/**
 * quickSpawnArchetypeById(archId, customHandle)
 */
function quickSpawnArchetypeById(archId, customHandle = "") {
  const arch = GM_NPC_ARCHETYPES.find(a => a.id === archId) || GM_NPC_ARCHETYPES[0];
  if (!arch) return;

  const clone = JSON.parse(JSON.stringify(arch));
  clone.handle = customHandle || getNextNumberedNpcHandle(arch.name);
  clone.name = arch.name;
  clone.hpCurrent = clone.hpMax;
  clone.subSkillNames = { language_1: "Streetslang", local_expert_1: "Your Home" };

  addGMNpcToEncounter(clone);
}

/**
 * spawnGMRoleGeneratedNPC()
 * Mode 2: Streetrat / Fast & Dirty (Edgerunner) Role-based NPC Generator (CRB p.74-89).
 */
function spawnGMRoleGeneratedNPC() {
  if (gmState.npcSheets.length >= gmState.maxNpcSheets) {
    alert(`Maximum of ${gmState.maxNpcSheets} side-by-side NPCs reached. Remove an NPC first.`);
    return;
  }

  const roleSel = document.getElementById("gm_role_npc_role");
  const tierSel = document.getElementById("gm_role_npc_tier");
  const handleInput = document.getElementById("gm_role_npc_handle");

  const roleKeys = Object.keys(GM_ROLE_STREETRAT_TEMPLATES);
  let chosenRoleKey = (roleSel && roleSel.value && roleSel.value !== "random")
    ? roleSel.value
    : roleKeys[Math.floor(Math.random() * roleKeys.length)];

  const tpl = GM_ROLE_STREETRAT_TEMPLATES[chosenRoleKey] || GM_ROLE_STREETRAT_TEMPLATES.solo;
  const tierKey = (tierSel && tierSel.value) ? tierSel.value : "lieutenant";

  const tierConfig = {
    mook:       { label: "Mook",       roleRank: 2, statPools: [7, 6, 6, 5, 5, 5, 4, 4, 4, 0], topRank: 4, midRank: 2, sp: 7,  armorName: "Kevlar" },
    lieutenant: { label: "Lieutenant", roleRank: 4, statPools: [8, 7, 7, 6, 6, 6, 5, 5, 5, 0], topRank: 6, midRank: 4, sp: 11, armorName: "Light Armorjack" },
    miniboss:   { label: "Mini-Boss",  roleRank: 6, statPools: [8, 8, 7, 7, 6, 6, 6, 5, 5, 0], topRank: 7, midRank: 5, sp: 13, armorName: "Heavy Armorjack" },
    boss:       { label: "Boss",       roleRank: 8, statPools: [8, 8, 8, 8, 7, 7, 6, 6, 5, 0], topRank: 8, midRank: 6, sp: 15, armorName: "Flak / Subdermal" }
  }[tierKey] || { label: "Lieutenant", roleRank: 4, statPools: [8, 7, 7, 6, 6, 6, 5, 5, 5, 0], topRank: 6, midRank: 4, sp: 11, armorName: "Light Armorjack" };

  // Build Stats from priority + slight 1d10 Streetrat variance
  const stats = {};
  tpl.statPriority.forEach((statId, idx) => {
    let baseVal = tierConfig.statPools[idx] !== undefined ? tierConfig.statPools[idx] : 5;
    if (statId !== "luck" && idx > 1 && idx < 8) {
      const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      baseVal = Math.max(3, Math.min(8, baseVal + jitter));
    }
    stats[statId] = baseVal;
  });

  // Build Skill Ranks according to Role Streetrat template
  const skillRanks = {
    athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2,
    evasion: 2, first_aid: 2, human_perception: 2, language_1: 4, local_expert_1: 2,
    perception: 2, persuasion: 2, stealth: 2
  };
  tpl.coreSkills.forEach((skId, idx) => {
    skillRanks[skId] = idx < 5 ? tierConfig.topRank : tierConfig.midRank;
  });

  // Equip Role Weapons for Tier
  const weaponIds = (tpl.weaponsByTier && tpl.weaponsByTier[tierKey]) || ["heavy_pistol", "knife"];
  const weapons = [];
  weaponIds.forEach(wId => {
    const wData = (typeof DATA !== "undefined" && DATA._index && DATA._index.weaponById && DATA._index.weaponById[wId])
      || (typeof DATA !== "undefined" && DATA.weapons && DATA.weapons.find(x => x.id === wId));
    if (wData) {
      const skillId = mapWeaponTypeToSkillId(wData.type);
      weapons.push({
        id: wData.id,
        name: wData.name,
        type: wData.type,
        skill: skillId,
        dmg: wData.dmg || "3d6",
        rof: wData.rof || 1,
        mag: wData.mag,
        cost: wData.cost || 0
      });
      if (!skillRanks[skillId] || skillRanks[skillId] < tierConfig.topRank) {
        skillRanks[skillId] = tierConfig.topRank;
      }
    }
  });

  const armor = [
    { id: `npc_head_${tierKey}`, name: `${tierConfig.armorName} (Head)`, sp: tierConfig.sp, slots: "Head", enc: 0, cost: 100 },
    { id: `npc_body_${tierKey}`, name: `${tierConfig.armorName} (Body)`, sp: tierConfig.sp, slots: "Body", enc: 0, cost: 100 }
  ];

  const cyberCount = tierKey === "mook" ? 1 : (tierKey === "lieutenant" ? 2 : tpl.cyberware.length);
  const cyberware = tpl.cyberware.slice(0, cyberCount).map((cName, i) => ({
    id: `npc_cw_${i}`,
    name: cName,
    type: "Cyberware",
    hc: 7,
    cost: 500
  }));

  const body = stats.body || 6;
  const will = stats.will || 6;
  const hpMax = typeof calcHitsMax === "function" ? calcHitsMax(body, will) : 10 + (5 * Math.ceil((body + will) / 2));

  const customHandle = handleInput ? handleInput.value.trim() : "";
  const handle = customHandle || `${generateGMStreetHandle()} (${tpl.roleName})`;
  if (handleInput) handleInput.value = "";

  const npcObj = {
    handle: handle,
    name: `${tpl.roleName} (${tierConfig.label})`,
    role: `${tpl.roleName} (${tierConfig.label})`,
    roleAbilityRank: tierConfig.roleRank,
    stats: stats,
    hpMax: hpMax,
    hpCurrent: hpMax,
    skillRanks: skillRanks,
    subSkillNames: { language_1: "Streetslang", local_expert_1: "Your Home", play_instrument_1: "Guitar", science_1: "Chemistry" },
    weapons: weapons,
    armor: armor,
    cyberware: cyberware,
    gear: [{ id: "agent", name: "Agent", qty: 1, cost: 100 }],
    gmNotes: `[Streetrat / Fast & Dirty Role NPC] ${tpl.roleName} Rank ${tierConfig.roleRank} (${tierConfig.label} Tier).`
  };

  addGMNpcToEncounter(npcObj);
}

/**
 * applyGMCombatNumberPreset(presetKey)
 */
function applyGMCombatNumberPreset(presetKey) {
  const presets = {
    easy:  { role: "Street Ganger (Easy Mook)",      cn: 8,  hp: 25, sp: 7,  move: 4, body: 4, w1: "heavy_pistol",      w2: "knife" },
    avg:   { role: "Corporate Guard (Average Lt.)",  cn: 11, hp: 35, sp: 11, move: 5, body: 6, w1: "assault_rifle",     w2: "heavy_pistol" },
    tough: { role: "Solo Enforcer (Tough Elite)",    cn: 14, hp: 45, sp: 13, move: 6, body: 8, w1: "assault_rifle",     w2: "very_heavy_pistol" },
    boss:  { role: "Cyber-Boss (Boss Threat)",       cn: 16, hp: 55, sp: 15, move: 7, body: 10, w1: "shotgun_auto",     w2: "katana" }
  };
  const p = presets[presetKey];
  if (!p) return;

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal("gm_cn_role", p.role);
  setVal("gm_cn_val", p.cn);
  setVal("gm_cn_hp", p.hp);
  setVal("gm_cn_sp", p.sp);
  setVal("gm_cn_move", p.move);
  setVal("gm_cn_body", p.body);
  setVal("gm_cn_weapon1", p.w1);
  setVal("gm_cn_weapon2", p.w2);
}

/**
 * spawnGMCombatNumberNPC()
 * Mode 3: Spawns a Combat Number (CN) NPC (Lawman Backup / 3-Goon rulebook method).
 */
function spawnGMCombatNumberNPC() {
  const handleEl = document.getElementById("gm_cn_handle");
  const roleEl = document.getElementById("gm_cn_role");
  const cnEl = document.getElementById("gm_cn_val");
  const hpEl = document.getElementById("gm_cn_hp");
  const spEl = document.getElementById("gm_cn_sp");
  const moveEl = document.getElementById("gm_cn_move");
  const bodyEl = document.getElementById("gm_cn_body");
  const w1El = document.getElementById("gm_cn_weapon1");
  const w2El = document.getElementById("gm_cn_weapon2");

  const cn = Math.max(1, parseInt(cnEl && cnEl.value) || 10);
  const hpMax = Math.max(1, parseInt(hpEl && hpEl.value) || 30);
  const sp = Math.max(0, parseInt(spEl && spEl.value) || 7);
  const move = Math.max(1, parseInt(moveEl && moveEl.value) || 5);
  const body = Math.max(1, parseInt(bodyEl && bodyEl.value) || 6);
  const roleLabel = (roleEl && roleEl.value.trim()) || `CN ${cn} Combatant`;
  const customHandle = handleEl ? handleEl.value.trim() : "";
  const handle = customHandle || getNextNumberedNpcHandle(roleLabel.split("(")[0].trim());

  const refStat = Math.min(8, Math.max(4, Math.round(cn * 0.55)));
  const skillRank = Math.max(1, cn - refStat);

  const weapons = [];
  [w1El ? w1El.value : "", w2El ? w2El.value : ""].forEach(wId => {
    if (!wId) return;
    const wData = (typeof DATA !== "undefined" && DATA._index && DATA._index.weaponById && DATA._index.weaponById[wId])
      || (typeof DATA !== "undefined" && DATA.weapons && DATA.weapons.find(x => x.id === wId));
    if (wData) {
      weapons.push({
        id: wData.id,
        name: wData.name,
        type: wData.type,
        skill: mapWeaponTypeToSkillId(wData.type),
        dmg: wData.dmg || "3d6",
        rof: wData.rof || 1,
        mag: wData.mag,
        cost: wData.cost || 0
      });
    }
  });

  const npcObj = {
    handle: handle,
    name: roleLabel,
    role: roleLabel,
    roleAbilityRank: Math.max(1, Math.min(10, Math.round(cn / 3))),
    combatNumber: cn,
    hpMax: hpMax,
    hpCurrent: hpMax,
    stats: {
      int: Math.max(3, refStat - 1),
      ref: refStat,
      dex: refStat,
      tech: Math.max(3, refStat - 1),
      cool: Math.max(4, refStat - 1),
      will: Math.max(4, Math.min(8, Math.round((hpMax - 10) / 5))),
      luck: 0,
      move: move,
      body: body,
      emp: 4
    },
    armor: [
      { id: "cn_head", name: `Armor (Head SP ${sp})`, sp: sp, slots: "Head", enc: 0, cost: 0 },
      { id: "cn_body", name: `Armor (Body SP ${sp})`, sp: sp, slots: "Body", enc: 0, cost: 0 }
    ],
    weapons: weapons,
    cyberware: [],
    gear: [],
    skillRanks: {
      handgun: skillRank, shoulder_arms: skillRank, autofire: skillRank,
      melee_weapon: skillRank, brawling: skillRank, evasion: skillRank,
      athletics: skillRank, perception: skillRank, resist_torture_drugs: skillRank
    },
    gmNotes: `[Combat Number Quick NPC] Combat Number (CN) +${cn} for all attacks & skill checks | HP ${hpMax} | SP ${sp} | MOVE ${move} | BODY ${body}.`
  };

  if (addGMNpcToEncounter(npcObj) && handleEl) {
    handleEl.value = "";
  }
}

/**
 * mapWeaponTypeToSkillId(typeStr)
 */
function mapWeaponTypeToSkillId(typeStr) {
  if (!typeStr) return "handgun";
  const t = typeStr.toLowerCase();
  if (t.includes("shoulder")) return "shoulder_arms";
  if (t.includes("archery") || t.includes("bow")) return "archery";
  if (t.includes("heavy")) return "heavy_weapons";
  if (t.includes("melee")) return "melee_weapon";
  if (t.includes("brawl")) return "brawling";
  if (t.includes("martial")) return "martial_arts";
  if (t.includes("autofire")) return "autofire";
  return "handgun";
}

/**
 * getGMPoolArray(pool)
 */
function getGMPoolArray(pool) {
  return pool === "npcs" ? gmState.npcSheets : gmState.loadedSheets;
}

/**
 * getGMPoolMax(pool)
 */
function getGMPoolMax(pool) {
  return pool === "npcs" ? gmState.maxNpcSheets : gmState.maxSheets;
}

/**
 * renderBothGMPools()
 */
function renderBothGMPools() {
  renderGMSheets();
  renderGMNpcs();
}

/**
 * loadGMCharacterFiles(files, pool)
 * Reads one or multiple JSON files uploaded by the GM into either "players" or "npcs".
 */
function loadGMCharacterFiles(files, pool = "players") {
  const targetArr = getGMPoolArray(pool);
  const maxLimit = getGMPoolMax(pool);
  const remainingSlots = maxLimit - targetArr.length;
  if (remainingSlots <= 0) {
    alert(`Maximum ${maxLimit} sheets allowed side-by-side.`);
    return;
  }

  const filesToRead = Array.from(files).slice(0, remainingSlots);
  let loadedCount = 0;

  filesToRead.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.stats) {
          alert(`File "${file.name}" is not a valid Cyberpunk RED character (missing stats).`);
          return;
        }
        const normalized = sanitizeGMCharacterData(data, file.name);
        if (pool === "npcs") normalized.isQuickNpc = true;
        targetArr.push(normalized);
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          renderBothGMPools();
        }
      } catch (err) {
        alert(`Failed to parse "${file.name}": ${err.message}`);
      }
    };
    reader.readAsText(file);
  });
}

/**
 * sanitizeGMCharacterData(data, fallbackName)
 * Ensures missing optional fields have safe defaults.
 */
function sanitizeGMCharacterData(data, fallbackName = "Character") {
  const copy = JSON.parse(JSON.stringify(data));
  copy._id = copy._id || (Date.now() + "_" + Math.random().toString(36).substring(2, 7));
  copy.handle = copy.handle || copy.name || fallbackName.replace(/\.json$/i, "");
  copy.name = copy.name || "";
  copy.role = copy.role || "Rockerboy";
  copy.roleAbilityRank = copy.roleAbilityRank || 4;
  copy.stats = copy.stats || { int: 6, ref: 6, dex: 6, tech: 6, cool: 6, will: 6, luck: 6, move: 6, body: 6, emp: 6 };
  copy.skillRanks = copy.skillRanks || {};
  copy.weapons = copy.weapons || [];
  copy.armor = copy.armor || [];
  copy.cyberware = copy.cyberware || [];
  copy.gear = copy.gear || [];
  copy.ammo = copy.ammo || {};
  copy.gmNotes = copy.gmNotes || "";
  copy.status = copy.status || { wounded: false, critInjury: false, dead: false };

  const body = copy.stats.body !== undefined ? copy.stats.body : 6;
  const will = copy.stats.will !== undefined ? copy.stats.will : 6;
  const calculatedMaxHp = typeof calcHitsMax === "function" ? calcHitsMax(body, will) : 10 + (5 * Math.ceil((body + will) / 2));
  copy.hpMax = copy.hpMax || calculatedMaxHp;
  if (copy.hpCurrent === undefined || copy.hpCurrent === null) {
    copy.hpCurrent = copy.hpMax;
  }
  return copy;
}

/**
 * openGMSavedCharPicker(pool)
 * Opens a modal allowing the GM to select a character saved in localStorage.
 */
function openGMSavedCharPicker(pool = "players") {
  const targetArr = getGMPoolArray(pool);
  const maxLimit = getGMPoolMax(pool);
  if (targetArr.length >= maxLimit) {
    alert(`Maximum limit of ${maxLimit} side-by-side sheets reached. Please close a sheet first.`);
    return;
  }

  const savedNames = typeof listCharacters === "function" ? listCharacters() : [];
  if (savedNames.length === 0) {
    alert("No saved characters found in local storage.");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "450px";

  const label = pool === "npcs" ? "Quick NPCs View" : "Player Party View";
  box.innerHTML = `
    <h2>📂 Load Saved Character into ${label}</h2>
    <p style="margin-bottom:1rem;color:var(--text-secondary)">Select a character from your local saved list:</p>
    <div id="gmSavedList" class="char-list-panel" style="margin-bottom:1rem"></div>
    <div style="display:flex;justify-content:flex-end;gap:0.5rem">
      <button class="btn-action" style="background:#333;color:#fff" id="gmSavedCancel">Cancel</button>
    </div>
  `;

  const listDiv = box.querySelector("#gmSavedList");
  savedNames.forEach(name => {
    const item = document.createElement("div");
    item.className = "char-list-item";
    item.textContent = name;
    item.onclick = () => {
      const data = typeof loadCharacter === "function" ? loadCharacter(name) : null;
      if (data) {
        const normalized = sanitizeGMCharacterData(data, name);
        if (pool === "npcs") normalized.isQuickNpc = true;
        targetArr.push(normalized);
        renderBothGMPools();
        document.body.removeChild(overlay);
      } else {
        alert(`Could not load character "${name}".`);
      }
    };
    listDiv.appendChild(item);
  });

  box.querySelector("#gmSavedCancel").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * renderGMSheets()
 * Draws the loaded Player character cards side-by-side (1 to 6 sheets).
 */
function renderGMSheets() {
  renderGMCardPool(
    "players",
    gmState.loadedSheets,
    gmState.maxSheets,
    "gm_sheets_container",
    "gm_count_badge",
    "gm_subtab_players_count",
    "gm_empty_state",
    "Sheets"
  );
  saveGMSessionToStorage();
}

/**
 * renderGMNpcs()
 * Draws the active Quick NPC cards side-by-side (1 to 6 NPCs).
 */
function renderGMNpcs() {
  renderGMCardPool(
    "npcs",
    gmState.npcSheets,
    gmState.maxNpcSheets,
    "gm_npcs_container",
    "gm_npc_count_badge",
    "gm_subtab_npcs_count",
    "gm_npc_empty_state",
    "NPCs"
  );
  saveGMSessionToStorage();
}

/**
 * renderGMCardPool(pool, sheetsArray, maxLimit, containerId, badgeId, subtabPillId, emptyId, unitLabel)
 */
function renderGMCardPool(pool, sheetsArray, maxLimit, containerId, badgeId, subtabPillId, emptyId, unitLabel) {
  const container = document.getElementById(containerId);
  const countBadge = document.getElementById(badgeId);
  const subtabPill = document.getElementById(subtabPillId);
  const emptyState = document.getElementById(emptyId);

  const total = sheetsArray.length;
  if (countBadge) countBadge.textContent = `${total} / ${maxLimit} ${unitLabel}`;
  if (subtabPill) subtabPill.textContent = `${total} / ${maxLimit}`;

  if (!container) return;

  container.style.setProperty("--gm-sheet-count", Math.max(1, total));

  if (total === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = "";

  sheetsArray.forEach((char, idx) => {
    const card = document.createElement("div");
    card.className = "gm-sheet-card";
    card.dataset.index = idx;
    card.dataset.pool = pool;

    const body = char.stats.body !== undefined ? char.stats.body : 6;
    const will = char.stats.will !== undefined ? char.stats.will : 6;
    const maxHp = char.hpMax || (typeof calcHitsMax === "function" ? calcHitsMax(body, will) : 40);
    const curHp = char.hpCurrent !== undefined ? char.hpCurrent : maxHp;
    const hpPct = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));
    const seriouslyWounded = Math.ceil(maxHp / 2);

    let hpColor = "#10b981"; // green
    if (hpPct <= 25) hpColor = "#ef4444"; // red
    else if (hpPct <= 50) hpColor = "#f59e0b"; // yellow

    const headArmor = char.armor.find(a => a.slots === "Head") || { sp: 0 };
    const bodyArmor = char.armor.find(a => a.slots === "Body") || { sp: 0 };
    const deathSave = body;

    // Combat Number Box (if CN is set on NPC or character)
    let cnBoxHtml = "";
    if (char.combatNumber !== undefined && char.combatNumber !== null && char.combatNumber !== "") {
      const cnVal = parseInt(char.combatNumber) || 10;
      cnBoxHtml = `
        <div class="gm-cn-card-box">
          <span><strong>⚔️ Combat Number:</strong> +${cnVal}</span>
          <button class="btn-action" style="font-size:0.72rem;padding:0.15rem 0.45rem;background:var(--accent);color:#fff;border-color:var(--accent)" onclick="rollGMCardQuickCheck('${pool}', ${idx}, 'Combat Number', ${cnVal}); event.stopPropagation();">🎲 Roll 1d10+${cnVal}</button>
        </div>
      `;
    }

    // Equipped Weapons Summary with quick attack & damage buttons
    let weaponsSummary = char.weapons.slice(0, 3).map((w, wIdx) => {
      const atkBase = getGMWeaponAttackBase(char, w);
      return `
        <div class="gm-card-item-row" style="gap:0.25rem;flex-wrap:wrap">
          <span style="font-size:0.74rem"><strong>${escapeHtml(w.name)}</strong> (${escapeHtml(w.dmg || '1d6')})</span>
          <span style="display:flex;gap:0.2rem">
            <button class="gm-card-btn" title="Roll Attack (+${atkBase})" style="font-size:0.68rem;padding:0.1rem 0.3rem" onclick="rollGMCardWeaponAttack('${pool}', ${idx}, ${wIdx}); event.stopPropagation();">🎯+${atkBase}</button>
            <button class="gm-card-btn" title="Roll Damage (${escapeHtml(w.dmg || '1d6')})" style="font-size:0.68rem;padding:0.1rem 0.3rem;border-color:var(--accent)" onclick="rollGMCardWeaponDamage('${pool}', ${idx}, '${escapeHtml(w.dmg || '3d6')}', '${escapeHtml(w.name)}'); event.stopPropagation();">💥</button>
          </span>
        </div>
      `;
    }).join("");
    if (!weaponsSummary) weaponsSummary = `<div style="opacity:0.6;font-size:0.8rem">No weapons equipped</div>`;

    // Top 4 Skills Summary
    const topSkills = getTopGMSkills(char, 4);
    let skillsSummary = topSkills.map(s => `
      <div class="gm-card-item-row">
        <span>${escapeHtml(s.name)}</span>
        <button class="gm-card-btn" style="font-size:0.68rem;padding:0.08rem 0.32rem;color:var(--primary);font-weight:700" title="Roll ${escapeHtml(s.name)} Check" onclick="rollGMCardQuickCheck('${pool}', ${idx}, '${escapeHtml(s.name)}', ${s.total}); event.stopPropagation();">🎲 +${s.total}</button>
      </div>
    `).join("");
    if (!skillsSummary) skillsSummary = `<div style="opacity:0.6;font-size:0.8rem">No skills leveled</div>`;

    const npcExtraActions = pool === "npcs" ? `
      <button class="gm-card-btn" title="Duplicate / Clone this NPC" onclick="duplicateGMNpc(${idx}); event.stopPropagation();">📋</button>
      <button class="gm-card-btn" title="Save NPC to Saved Characters list" onclick="saveGMCardToCharacters('${pool}', ${idx}); event.stopPropagation();">💾</button>
    ` : `
      <button class="gm-card-btn gm-update-btn" title="Update / Reload Sheet Data" onclick="promptUpdateGMSheet(${idx}, '${pool}'); event.stopPropagation();">🔄</button>
    `;

    card.innerHTML = `
      <div class="gm-card-header">
        <div class="gm-card-title-box">
          <h3 class="gm-card-handle">${escapeHtml(char.handle)}</h3>
          <div class="gm-card-role-badge">${escapeHtml(char.role)} (Rank ${char.roleAbilityRank})</div>
        </div>
        <div class="gm-card-actions">
          ${npcExtraActions}
          <button class="gm-card-btn gm-inspect-btn" title="Inspect & Edit Sheet (Interactive Popup)" onclick="openGMInteractiveModal(${idx}, '${pool}'); event.stopPropagation();">🔍</button>
          <button class="gm-card-btn gm-remove-btn" title="Remove from GM View" onclick="removeGMSheet(${idx}, '${pool}'); event.stopPropagation();">✕</button>
        </div>
      </div>

      ${cnBoxHtml}

      <!-- HEALTH & VITALS -->
      <div class="gm-card-vitals">
        <div class="gm-hp-header">
          <span><strong>HP:</strong> ${curHp} / ${maxHp} ${curHp < seriouslyWounded && curHp > 0 ? '<span style="color:#f59e0b;font-size:0.7rem">(Wounded -2)</span>' : (curHp <= 0 ? '<span style="color:#ef4444;font-size:0.7rem">(MORTAL)</span>' : '')}</span>
          <span style="font-size:0.72rem;opacity:0.8">DS &le; ${deathSave}</span>
        </div>
        <div class="gm-hp-bar-bg">
          <div class="gm-hp-bar-fill" style="width:${hpPct}%; background:${hpColor};"></div>
        </div>
        <div class="gm-quick-steppers">
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, -5, '${pool}'); event.stopPropagation();">-5</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, -1, '${pool}'); event.stopPropagation();">-1</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, 1, '${pool}'); event.stopPropagation();">+1</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, 5, '${pool}'); event.stopPropagation();">+5</button>
        </div>
      </div>

      <!-- ARMOR SP -->
      <div class="gm-card-armor-grid">
        <div class="gm-armor-box">
          <span class="gm-armor-label">HEAD SP</span>
          <span class="gm-armor-val">${headArmor.sp || 0}</span>
          <div class="gm-mini-steppers">
            <button onclick="adjustGMArmorSP(${idx}, 'Head', -1, '${pool}'); event.stopPropagation();">-</button>
            <button onclick="adjustGMArmorSP(${idx}, 'Head', 1, '${pool}'); event.stopPropagation();">+</button>
          </div>
        </div>
        <div class="gm-armor-box">
          <span class="gm-armor-label">BODY SP</span>
          <span class="gm-armor-val">${bodyArmor.sp || 0}</span>
          <div class="gm-mini-steppers">
            <button onclick="adjustGMArmorSP(${idx}, 'Body', -1, '${pool}'); event.stopPropagation();">-</button>
            <button onclick="adjustGMArmorSP(${idx}, 'Body', 1, '${pool}'); event.stopPropagation();">+</button>
          </div>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="gm-card-stats-grid">
        <div class="gm-stat-cell"><span>INT</span><strong>${char.stats.int ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>REF</span><strong>${char.stats.ref ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>DEX</span><strong>${char.stats.dex ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>TECH</span><strong>${char.stats.tech ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>COOL</span><strong>${char.stats.cool ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>WILL</span><strong>${char.stats.will ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>LUCK</span><strong>${char.stats.luck ?? 0}</strong></div>
        <div class="gm-stat-cell"><span>MOVE</span><strong>${char.stats.move ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>BODY</span><strong>${char.stats.body ?? 6}</strong></div>
        <div class="gm-stat-cell"><span>EMP</span><strong>${char.stats.emp ?? 6}</strong></div>
      </div>

      <!-- WEAPONS SUMMARY -->
      <div class="gm-card-sec-title">Equipped Weapons</div>
      <div class="gm-card-sec-box">${weaponsSummary}</div>

      <!-- TOP SKILLS SUMMARY -->
      <div class="gm-card-sec-title">Key Skills</div>
      <div class="gm-card-sec-box">${skillsSummary}</div>

      <!-- CLICK TO OPEN OVERLAY FOOTER -->
      <button class="gm-card-footer-btn" onclick="openGMInteractiveModal(${idx}, '${pool}');">
        ⚡ Open Interactive Sheet Modal
      </button>
    `;

    container.appendChild(card);
  });
}

/**
 * getGMWeaponAttackBase(char, w)
 */
function getGMWeaponAttackBase(char, w) {
  if (char.combatNumber !== undefined && char.combatNumber !== null && char.combatNumber !== "") {
    return parseInt(char.combatNumber) || 10;
  }
  const skillId = w.skill || mapWeaponTypeToSkillId(w.type);
  const statKey = (skillId === "melee_weapon" || skillId === "brawling" || skillId === "martial_arts" || skillId === "athletics") ? "dex" : "ref";
  const statVal = (char.stats && char.stats[statKey] !== undefined) ? char.stats[statKey] : (char.stats.ref || 6);
  const rank = (char.skillRanks && (char.skillRanks[skillId] || char.skillRanks[w.skill])) || 0;
  return statVal + rank;
}

/**
 * duplicateGMNpc(index)
 */
function duplicateGMNpc(index) {
  const src = gmState.npcSheets[index];
  if (!src) return;
  if (gmState.npcSheets.length >= gmState.maxNpcSheets) {
    alert(`Maximum of ${gmState.maxNpcSheets} side-by-side NPCs reached.`);
    return;
  }
  const copy = JSON.parse(JSON.stringify(src));
  const baseHandle = copy.handle.replace(/\s*#\d+$/, "").trim();
  copy.handle = getNextNumberedNpcHandle(baseHandle);
  copy._id = Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  copy.hpCurrent = copy.hpMax;
  gmState.npcSheets.push(copy);
  renderGMNpcs();
}

/**
 * saveGMCardToCharacters(pool, index)
 */
function saveGMCardToCharacters(pool, index) {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;
  const saveName = prompt("Save NPC to your Saved Characters roster under name:", char.handle || "Quick NPC");
  if (!saveName || !saveName.trim()) return;
  const trimmed = saveName.trim();
  try {
    const payload = JSON.parse(JSON.stringify(char));
    payload._saveName = trimmed;
    payload._savedAt = new Date().toISOString();
    localStorage.setItem(`cpr_char_${trimmed}`, JSON.stringify(payload));
    alert(`Saved "${trimmed}" to your Saved Characters! You can load it anytime via 📂 Characters.`);
  } catch (e) {
    alert(`Failed to save character: ${e.message}`);
  }
}

/**
 * getAllGMSkillsFlatForChar(char)
 */
function getAllGMSkillsFlatForChar(char) {
  if (typeof DATA === "undefined" || !DATA.skills) return [];
  let all = [];
  for (let statKey in DATA.skills) {
    if (Array.isArray(DATA.skills[statKey])) {
      DATA.skills[statKey].forEach(sk => {
        if (sk.subs) {
          const count = sk.subs || 1;
          for (let i = 1; i <= count; i++) {
            const subId = `${sk.id}_${i}`;
            const subName = (char && char.subSkillNames && char.subSkillNames[subId])
              ? `${sk.name} (${char.subSkillNames[subId]})`
              : `${sk.name} #${i}`;
            all.push({
              ...sk,
              id: subId,
              baseId: sk.id,
              name: subName,
              stat: statKey
            });
          }
        } else {
          all.push({
            ...sk,
            baseId: sk.id,
            stat: statKey
          });
        }
      });
    }
  }
  return all;
}

/**
 * getTopGMSkills(char, count)
 */
function getTopGMSkills(char, count = 4) {
  const allSkills = getAllGMSkillsFlatForChar(char);
  if (allSkills.length === 0) return [];
  const results = [];
  allSkills.forEach(sk => {
    const rank = (char.skillRanks && char.skillRanks[sk.id]) || 0;
    if (rank > 0) {
      const statVal = (char.stats && char.stats[sk.stat] !== undefined) ? char.stats[sk.stat] : 0;
      results.push({ name: sk.name, total: statVal + rank });
    }
  });
  results.sort((a, b) => b.total - a.total);
  return results.slice(0, count);
}

/**
 * adjustGMHealth(index, delta, pool)
 */
function adjustGMHealth(index, delta, pool = gmState.activeModalPool || "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;
  const maxHp = char.hpMax || 40;
  char.hpCurrent = Math.max(0, Math.min(maxHp, (char.hpCurrent !== undefined ? char.hpCurrent : maxHp) + delta));
  renderBothGMPools();
  if (gmState.activeModalIndex === index && gmState.activeModalPool === pool) {
    const hpInput = document.getElementById("gmModalHpCur");
    if (hpInput) hpInput.value = char.hpCurrent;
  }
}

/**
 * adjustGMArmorSP(index, slot, delta, pool)
 */
function adjustGMArmorSP(index, slot, delta, pool = gmState.activeModalPool || "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;
  let armor = char.armor.find(a => a.slots === slot);
  if (!armor) {
    armor = { id: `custom_${slot.toLowerCase()}`, name: `${slot} Armor`, sp: 0, slots: slot, enc: 0, cost: 0 };
    char.armor.push(armor);
  }
  armor.sp = Math.max(0, (armor.sp || 0) + delta);
  renderBothGMPools();
}

/**
 * removeGMSheet(index, pool)
 */
function removeGMSheet(index, pool = "players") {
  const arr = getGMPoolArray(pool);
  arr.splice(index, 1);
  if (gmState.activeModalPool === pool) {
    if (gmState.activeModalIndex === index) {
      closeGMInteractiveModal();
    } else if (gmState.activeModalIndex > index) {
      gmState.activeModalIndex--;
    }
  }
  renderBothGMPools();
}

/**
 * openGMInteractiveModal(index, pool)
 */
function openGMInteractiveModal(index, pool = "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;

  gmState.activeModalPool = pool;
  gmState.activeModalIndex = index;
  gmState.currentModalTab = "vitals";

  const modal = document.getElementById("gmSheetModal");
  if (!modal) return;

  modal.classList.add("active");
  modal.style.display = "flex";
  renderGMModalContent();
}

/**
 * closeGMInteractiveModal()
 */
function closeGMInteractiveModal() {
  const modal = document.getElementById("gmSheetModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
  gmState.activeModalIndex = null;
}

/**
 * getActiveGMModalChar()
 */
function getActiveGMModalChar() {
  const arr = getGMPoolArray(gmState.activeModalPool);
  return arr ? arr[gmState.activeModalIndex] : null;
}

/**
 * renderGMModalContent()
 */
function renderGMModalContent() {
  const char = getActiveGMModalChar();
  const bodyContainer = document.getElementById("gmModalBody");
  const titleContainer = document.getElementById("gmModalTitle");

  if (!char || !bodyContainer) return;

  if (titleContainer) {
    const tag = gmState.activeModalPool === "npcs" ? "🤖 NPC Sheet" : "👥 Player Sheet";
    titleContainer.innerHTML = `${tag}: <strong>${escapeHtml(char.handle)}</strong> <span style="font-size:0.85rem;opacity:0.8">(${escapeHtml(char.role)} Rank ${char.roleAbilityRank})</span>`;
  }

  let html = `
    <div class="gm-modal-tabs">
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'vitals' ? 'active' : ''}" onclick="switchGMModalTab('vitals')">❤️ Vitals &amp; Stats</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'combat' ? 'active' : ''}" onclick="switchGMModalTab('combat')">⚔️ Combat &amp; Weapons</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'skills' ? 'active' : ''}" onclick="switchGMModalTab('skills')">🎯 Skills &amp; Rolls</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'inventory' ? 'active' : ''}" onclick="switchGMModalTab('inventory')">🎒 Armor &amp; Gear</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'notes' ? 'active' : ''}" onclick="switchGMModalTab('notes')">📝 GM Notes</button>
    </div>
    <div id="gmModalRollResult" class="gm-roll-result-banner" style="display:none"></div>
    <div class="gm-modal-tab-content">
  `;

  if (gmState.currentModalTab === 'vitals') {
    html += renderGMModalVitalsTab(char);
  } else if (gmState.currentModalTab === 'combat') {
    html += renderGMModalCombatTab(char);
  } else if (gmState.currentModalTab === 'skills') {
    html += renderGMModalSkillsTab(char);
  } else if (gmState.currentModalTab === 'inventory') {
    html += renderGMModalInventoryTab(char);
  } else if (gmState.currentModalTab === 'notes') {
    html += renderGMModalNotesTab(char);
  }

  html += `</div>`;
  bodyContainer.innerHTML = html;
}

/**
 * switchGMModalTab(tabName)
 */
function switchGMModalTab(tabName) {
  gmState.currentModalTab = tabName;
  renderGMModalContent();
}

/**
 * renderGMModalVitalsTab(char)
 */
function renderGMModalVitalsTab(char) {
  const maxHp = char.hpMax || 40;
  const curHp = char.hpCurrent !== undefined ? char.hpCurrent : maxHp;
  const body = char.stats.body !== undefined ? char.stats.body : 6;
  const deathSave = body;
  const cnVal = (char.combatNumber !== undefined && char.combatNumber !== null) ? char.combatNumber : "";

  return `
    <div class="grid-3 mt-1">
      <label>Handle <input type="text" value="${escapeHtml(char.handle)}" onchange="updateGMCharProp('handle', this.value)"></label>
      <label>Real Name / Archetype <input type="text" value="${escapeHtml(char.name)}" onchange="updateGMCharProp('name', this.value)"></label>
      <label>Role <input type="text" value="${escapeHtml(char.role)}" onchange="updateGMCharProp('role', this.value)"></label>
      <label>Role Rank <input type="number" value="${char.roleAbilityRank}" min="1" max="10" onchange="updateGMCharProp('roleAbilityRank', parseInt(this.value)||1)"></label>
      <label title="Optional Combat Number (STAT + Skill Base) for simplified NPC rolls">⚔️ Combat Number (CN)
        <div style="display:flex;gap:0.35rem">
          <input type="number" value="${cnVal}" placeholder="None" min="0" max="25" onchange="updateGMCharProp('combatNumber', this.value === '' ? null : (parseInt(this.value)||0))">
          ${cnVal !== "" ? `<button type="button" class="btn-action" onclick="rollGMSkillCheck('cn', 'Combat Number', ${parseInt(cnVal)||10})">🎲 Roll CN</button>` : ""}
        </div>
      </label>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Health &amp; Death Save</h3>
      <div class="grid-3">
        <label>Current HP <input id="gmModalHpCur" type="number" value="${curHp}" onchange="updateGMCharProp('hpCurrent', parseInt(this.value)||0)"></label>
        <label>Max HP <input type="number" value="${maxHp}" onchange="updateGMCharProp('hpMax', parseInt(this.value)||1)"></label>
        <label>Death Save &le; <input type="number" value="${deathSave}" readonly class="readonly-input"></label>
      </div>
      <div class="gm-quick-steppers mt-1">
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -10, '${gmState.activeModalPool}')">-10 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -5, '${gmState.activeModalPool}')">-5 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -1, '${gmState.activeModalPool}')">-1 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 1, '${gmState.activeModalPool}')">+1 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 5, '${gmState.activeModalPool}')">+5 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 10, '${gmState.activeModalPool}')">+10 HP</button>
      </div>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Core STATS</h3>
      <div class="stat-grid">
        ${Object.keys(char.stats).map(statKey => `
          <div class="stat-row">
            <span class="stat-name">${statKey.toUpperCase()}</span>
            <input type="number" value="${char.stats[statKey]}" min="0" max="15" onchange="updateGMCharStat('${statKey}', parseInt(this.value)||0)">
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * renderGMModalCombatTab(char)
 */
function renderGMModalCombatTab(char) {
  const cnBanner = (char.combatNumber !== undefined && char.combatNumber !== null && char.combatNumber !== "")
    ? `<div class="gm-cn-card-box" style="margin-bottom:0.75rem">
         <span><strong>⚔️ Active Combat Number (CN): +${char.combatNumber}</strong> (Used for all attack &amp; defense checks)</span>
         <button class="btn-action" onclick="rollGMSkillCheck('cn', 'Combat Number Check', ${parseInt(char.combatNumber)||10})">🎲 Roll 1d10 + ${char.combatNumber}</button>
       </div>`
    : "";

  if (!char.weapons || char.weapons.length === 0) {
    return `${cnBanner}<p style="padding:1rem;opacity:0.7">No weapons equipped on this sheet.</p>`;
  }

  return `
    ${cnBanner}
    <div class="section-card mt-1">
      <h3 class="section-title">Equipped Weapons &amp; Attack Rolls</h3>
      <table class="premium-table">
        <thead>
          <tr>
            <th>Weapon</th>
            <th>Base</th>
            <th>Damage</th>
            <th>ROF</th>
            <th>Mag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${char.weapons.map((w, wIdx) => {
            const atkBase = getGMWeaponAttackBase(char, w);
            return `
            <tr>
              <td><strong>${escapeHtml(w.name)}</strong><br><span style="font-size:0.75rem;opacity:0.7">${escapeHtml(w.type || 'Weapon')}</span></td>
              <td><strong style="color:var(--primary)">+${atkBase}</strong></td>
              <td>${escapeHtml(w.dmg || '1d6')}</td>
              <td>${w.rof || 1}</td>
              <td>${w.mag !== undefined && w.mag !== null ? w.mag : '-'}</td>
              <td>
                <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem" onclick="rollGMWeaponAttack(${wIdx})">🎲 Roll Attack (+${atkBase})</button>
                <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem;background:var(--accent);color:#fff" onclick="rollGMWeaponDamage('${escapeHtml(w.dmg || '3d6')}', '${escapeHtml(w.name)}')">💥 Roll Damage</button>
              </td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * renderGMModalSkillsTab(char)
 */
function renderGMModalSkillsTab(char) {
  const allSkills = getAllGMSkillsFlatForChar(char);
  if (allSkills.length === 0) return "<p>Skills database missing.</p>";

  const query = (gmState.skillSearchQuery || "").toLowerCase();
  const filtered = allSkills.filter(sk =>
    sk.name.toLowerCase().includes(query) || (sk.stat && sk.stat.toLowerCase().includes(query))
  );

  return `
    <div class="skills-header mt-1">
      <input type="text" class="skill-search" placeholder="Search skills..." value="${escapeHtml(gmState.skillSearchQuery)}" oninput="gmState.skillSearchQuery = this.value; renderGMModalContent();">
    </div>
    <div style="max-height:350px; overflow-y:auto; margin-top:0.5rem">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Stat</th>
            <th>Rank</th>
            <th>Total Base</th>
            <th>Roll 1d10 Check</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(sk => {
            const rank = (char.skillRanks && char.skillRanks[sk.id]) ? char.skillRanks[sk.id] : 0;
            const statVal = (char.stats && sk.stat && char.stats[sk.stat] !== undefined) ? char.stats[sk.stat] : 0;
            const total = statVal + rank;
            const statDisplay = (sk.stat || '').toUpperCase();
            return `
              <tr>
                <td><strong>${escapeHtml(sk.name)}</strong></td>
                <td>${statDisplay} (${statVal})</td>
                <td>${rank}</td>
                <td><strong style="color:var(--primary)">+${total}</strong></td>
                <td>
                  <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem" onclick="rollGMSkillCheck('${sk.id}', '${escapeHtml(sk.name)}', ${total})">🎲 Check (+${total})</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * renderGMModalInventoryTab(char)
 */
function renderGMModalInventoryTab(char) {
  const headArmor = char.armor.find(a => a.slots === "Head") || { name: "Head Armor", sp: 0 };
  const bodyArmor = char.armor.find(a => a.slots === "Body") || { name: "Body Armor", sp: 0 };

  return `
    <div class="section-card mt-1">
      <h3 class="section-title">Armor Stopping Power (SP)</h3>
      <div class="grid-2">
        <label>Head Armor SP (${escapeHtml(headArmor.name)})
          <input type="number" value="${headArmor.sp || 0}" min="0" onchange="updateGMArmorSPDirect('Head', parseInt(this.value)||0)">
        </label>
        <label>Body Armor SP (${escapeHtml(bodyArmor.name)})
          <input type="number" value="${bodyArmor.sp || 0}" min="0" onchange="updateGMArmorSPDirect('Body', parseInt(this.value)||0)">
        </label>
      </div>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Gear &amp; Cyberware</h3>
      <div style="font-size:0.85rem">
        <strong>Cyberware (${char.cyberware.length} items):</strong>
        <p style="opacity:0.8">${char.cyberware.map(c => escapeHtml(c.name)).join(", ") || "None"}</p>
        <br>
        <strong>Gear (${char.gear.length} items):</strong>
        <p style="opacity:0.8">${char.gear.map(g => `${escapeHtml(g.name)} (x${g.qty||1})`).join(", ") || "None"}</p>
      </div>
    </div>
  `;
}

/**
 * renderGMModalNotesTab(char)
 */
function renderGMModalNotesTab(char) {
  return `
    <div class="section-card mt-1">
      <h3 class="section-title">GM Encounters &amp; Session Notes</h3>
      <textarea style="width:100%;height:150px;font-family:inherit;padding:0.5rem" placeholder="Enter GM specific notes for this combatant..." onchange="updateGMCharProp('gmNotes', this.value)">${escapeHtml(char.gmNotes || "")}</textarea>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="btn-action" onclick="exportGMCharacterJSON(${gmState.activeModalIndex}, '${gmState.activeModalPool}')">💾 Export Updated JSON</button>
      <button class="btn-action" onclick="saveGMCardToCharacters('${gmState.activeModalPool}', ${gmState.activeModalIndex})">📂 Save to Characters Roster</button>
    </div>
  `;
}

/**
 * updateGMCharProp(prop, val)
 */
function updateGMCharProp(prop, val) {
  const char = getActiveGMModalChar();
  if (!char) return;
  char[prop] = val;
  renderBothGMPools();
  if (prop === "combatNumber") renderGMModalContent();
}

/**
 * updateGMCharStat(statKey, val)
 */
function updateGMCharStat(statKey, val) {
  const char = getActiveGMModalChar();
  if (!char || !char.stats) return;
  char.stats[statKey] = val;
  renderBothGMPools();
}

/**
 * updateGMArmorSPDirect(slot, val)
 */
function updateGMArmorSPDirect(slot, val) {
  const char = getActiveGMModalChar();
  if (!char) return;
  let armor = char.armor.find(a => a.slots === slot);
  if (!armor) {
    armor = { id: `custom_${slot.toLowerCase()}`, name: `${slot} Armor`, sp: val, slots: slot, enc: 0, cost: 0 };
    char.armor.push(armor);
  } else {
    armor.sp = val;
  }
  renderBothGMPools();
}

/**
 * computeGMD10Check(totalBase)
 */
function computeGMD10Check(totalBase) {
  const d10 = Math.floor(Math.random() * 10) + 1;
  let finalRoll = d10 + totalBase;
  let detail = `1d10 (${d10}) + Base (${totalBase})`;

  if (d10 === 10) {
    const extra = Math.floor(Math.random() * 10) + 1;
    finalRoll += extra;
    detail += ` + CRITICAL EXPLOSION! (+${extra})`;
  } else if (d10 === 1) {
    const fumble = Math.floor(Math.random() * 10) + 1;
    finalRoll -= fumble;
    detail += ` - FUMBLE! (-${fumble})`;
  }
  return { finalRoll, detail };
}

/**
 * rollGMSkillCheck(skillId, skillName, totalBase)
 * Executes a Cyberpunk RED 1d10 roll with explosion/fumble rules inside the modal.
 */
function rollGMSkillCheck(skillId, skillName, totalBase) {
  const res = computeGMD10Check(totalBase);
  showGMRollResult(`🎯 <strong>${skillName}:</strong> Total = <strong style="font-size:1.2rem;color:var(--primary)">${res.finalRoll}</strong><br><span style="font-size:0.8rem;opacity:0.8">${res.detail}</span>`);
}

/**
 * rollGMCardQuickCheck(pool, idx, checkName, totalBase)
 * Executes a 1d10 check directly from an encounter card and displays the result in the top GM banner.
 */
function rollGMCardQuickCheck(pool, idx, checkName, totalBase) {
  const arr = getGMPoolArray(pool);
  const char = arr[idx];
  const actor = char ? char.handle : "Combatant";
  const res = computeGMD10Check(totalBase);
  showGMCardRollToast(`🎲 <strong>${escapeHtml(actor)} — ${escapeHtml(checkName)}:</strong> Total = <strong style="font-size:1.2rem;color:var(--primary)">${res.finalRoll}</strong> <span style="font-size:0.82rem;opacity:0.85">(${res.detail})</span>`);
}

/**
 * rollGMCardWeaponAttack(pool, idx, wIdx)
 */
function rollGMCardWeaponAttack(pool, idx, wIdx) {
  const arr = getGMPoolArray(pool);
  const char = arr[idx];
  if (!char || !char.weapons[wIdx]) return;
  const w = char.weapons[wIdx];
  const atkBase = getGMWeaponAttackBase(char, w);
  rollGMCardQuickCheck(pool, idx, `${w.name} Attack`, atkBase);
}

/**
 * rollGMCardWeaponDamage(pool, idx, dmgDiceStr, weaponName)
 */
function rollGMCardWeaponDamage(pool, idx, dmgDiceStr, weaponName) {
  const arr = getGMPoolArray(pool);
  const char = arr[idx];
  const actor = char ? char.handle : "Combatant";
  const { total, rolls } = computeGMDamageRoll(dmgDiceStr);
  showGMCardRollToast(`💥 <strong>${escapeHtml(actor)} — ${escapeHtml(weaponName)} Damage (${escapeHtml(dmgDiceStr)}):</strong> Total = <strong style="font-size:1.2rem;color:var(--accent)">${total}</strong> <span style="font-size:0.82rem;opacity:0.85">[Dice: ${rolls.join(", ")}${rolls.filter(r => r === 6).length >= 2 ? " — ⚠️ CRITICAL INJURY! (2+ Sixes)" : ""}]</span>`);
}

/**
 * rollGMWeaponAttack(wIdx)
 */
function rollGMWeaponAttack(wIdx) {
  const char = getActiveGMModalChar();
  if (!char || !char.weapons[wIdx]) return;
  const w = char.weapons[wIdx];
  const totalBase = getGMWeaponAttackBase(char, w);
  rollGMSkillCheck("weapon", `${w.name} Attack`, totalBase);
}

/**
 * computeGMDamageRoll(dmgDiceStr)
 */
function computeGMDamageRoll(dmgDiceStr) {
  const match = String(dmgDiceStr || "3d6").match(/(\d+)d(\d+)(\+\d+)?/i);
  let count = 3;
  let sides = 6;
  let flatBonus = 0;
  if (match) {
    count = parseInt(match[1]) || 3;
    sides = parseInt(match[2]) || 6;
    if (match[3]) flatBonus = parseInt(match[3]) || 0;
  }

  const rolls = [];
  let total = flatBonus;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  return { total, rolls };
}

/**
 * rollGMWeaponDamage(dmgDiceStr, weaponName)
 */
function rollGMWeaponDamage(dmgDiceStr, weaponName) {
  const { total, rolls } = computeGMDamageRoll(dmgDiceStr);
  const critWarning = rolls.filter(r => r === 6).length >= 2 ? ` <strong style="color:#ef4444">⚠️ CRITICAL INJURY! (2+ Sixes)</strong>` : "";
  showGMRollResult(`💥 <strong>${weaponName} Damage (${dmgDiceStr}):</strong> Total = <strong style="font-size:1.2rem;color:var(--accent)">${total}</strong>${critWarning}<br><span style="font-size:0.8rem;opacity:0.8">Dice: [${rolls.join(", ")}]</span>`);
}

/**
 * showGMRollResult(msgHtml)
 */
function showGMRollResult(msgHtml) {
  const banner = document.getElementById("gmModalRollResult");
  if (banner) {
    banner.innerHTML = msgHtml;
    banner.style.display = "block";
  }
}

/**
 * showGMCardRollToast(msgHtml)
 */
function showGMCardRollToast(msgHtml) {
  const banner = document.getElementById("gmCardRollToast");
  if (banner) {
    banner.innerHTML = `${msgHtml} <button class="gm-card-btn" style="margin-left:0.6rem;font-size:0.7rem" onclick="this.parentElement.style.display='none'">✕</button>`;
    banner.style.display = "block";
  }
}

/**
 * exportGMCharacterJSON(index, pool)
 */
function exportGMCharacterJSON(index, pool = gmState.activeModalPool || "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;
  const handle = char.handle || "character";
  const filename = `${handle.replace(/[^a-zA-Z0-9_-]/g, "_")}_gm_export.json`;
  const jsonStr = JSON.stringify(char, null, 2);
  if (window.AndroidBridge && typeof window.AndroidBridge.saveJsonFile === 'function') {
    window.AndroidBridge.saveJsonFile(filename, jsonStr);
    return;
  }
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * openGMDiceRollerModal()
 */
function openGMDiceRollerModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "400px";

  box.innerHTML = `
    <h2>🎲 GM Quick Dice Roller</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:1rem 0">
      <button class="btn-action" onclick="this.nextElementSibling.textContent = Math.floor(Math.random()*10)+1">Roll 1d10</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
      <button class="btn-action" onclick="this.nextElementSibling.textContent = Math.floor(Math.random()*6)+1">Roll 1d6</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
      <button class="btn-action" onclick="this.nextElementSibling.textContent = (Math.floor(Math.random()*6)+1)+(Math.floor(Math.random()*6)+1)+(Math.floor(Math.random()*6)+1)">Roll 3d6</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
    </div>
    <div style="display:flex;justify-content:flex-end">
      <button class="btn-action" style="background:#333;color:#fff" id="gmCloseDiceModal">Close</button>
    </div>
  `;

  box.querySelector("#gmCloseDiceModal").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * saveGMSessionToStorage()
 * Auto-saves both loaded Player sheets and Quick NPC sheets into localStorage.
 */
function saveGMSessionToStorage() {
  try {
    if (gmState.loadedSheets.length === 0) {
      localStorage.removeItem("cpr_gm_active_session");
    } else {
      localStorage.setItem("cpr_gm_active_session", JSON.stringify(gmState.loadedSheets));
    }
    if (gmState.npcSheets.length === 0) {
      localStorage.removeItem("cpr_gm_active_npcs");
    } else {
      localStorage.setItem("cpr_gm_active_npcs", JSON.stringify(gmState.npcSheets));
    }
  } catch (e) {
    console.error("Failed to auto-save GM session:", e);
  }
}

/**
 * autoLoadGMSessionFromStorage()
 * Restores active Player sheets and Quick NPCs from localStorage on app boot.
 */
function autoLoadGMSessionFromStorage() {
  try {
    const rawPlayers = localStorage.getItem("cpr_gm_active_session");
    if (rawPlayers) {
      const parsed = JSON.parse(rawPlayers);
      if (Array.isArray(parsed)) {
        gmState.loadedSheets = parsed.slice(0, gmState.maxSheets).map(c => sanitizeGMCharacterData(c, c.handle));
      }
    }
    const rawNpcs = localStorage.getItem("cpr_gm_active_npcs");
    if (rawNpcs) {
      const parsedNpcs = JSON.parse(rawNpcs);
      if (Array.isArray(parsedNpcs)) {
        gmState.npcSheets = parsedNpcs.slice(0, gmState.maxNpcSheets).map(c => sanitizeGMCharacterData(c, c.handle));
      }
    }
  } catch (e) {
    console.error("Failed to auto-load GM session:", e);
  }
}

/**
 * exportGMSessionFile()
 * Exports all loaded Player sheets and Quick NPC sheets into a single combined JSON session file.
 */
function exportGMSessionFile() {
  if (gmState.loadedSheets.length === 0 && gmState.npcSheets.length === 0) {
    alert("No active Player sheets or Quick NPCs on GM Screen to export.");
    return;
  }
  const data = {
    _gmSessionVersion: "5.5.0",
    savedAt: new Date().toISOString(),
    sheets: gmState.loadedSheets,
    npcSheets: gmState.npcSheets
  };
  const filename = `Cyberpunk_GM_Session_${new Date().toISOString().slice(0, 10)}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  if (window.AndroidBridge && typeof window.AndroidBridge.saveJsonFile === 'function') {
    window.AndroidBridge.saveJsonFile(filename, jsonStr);
    return;
  }
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * importGMSessionFile(file)
 * Imports a full GM session JSON file (supporting both Player sheets and Quick NPCs).
 */
function importGMSessionFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const sheetsArr = data.sheets || (Array.isArray(data) ? data : null);
      const npcsArr = Array.isArray(data.npcSheets) ? data.npcSheets : [];
      if (!sheetsArr || !Array.isArray(sheetsArr)) {
        alert(`File "${file.name}" is not a valid GM session file.`);
        return;
      }
      if (gmState.loadedSheets.length > 0 || gmState.npcSheets.length > 0) {
        const ok = typeof customConfirm === "function"
          ? await customConfirm("Replace active GM Screen sheets and NPCs with imported session?")
          : confirm("Replace active GM Screen sheets and NPCs with imported session?");
        if (!ok) return;
      }
      gmState.loadedSheets = sheetsArr.slice(0, gmState.maxSheets).map(c => sanitizeGMCharacterData(c, c.handle));
      gmState.npcSheets = npcsArr.slice(0, gmState.maxNpcSheets).map(c => sanitizeGMCharacterData(c, c.handle));
      renderBothGMPools();
      alert(`Loaded ${gmState.loadedSheets.length} Player sheet(s) and ${gmState.npcSheets.length} Quick NPC(s) from GM session!`);
    } catch (err) {
      alert(`Failed to import GM session: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * promptUpdateGMSheet(index, pool)
 */
function promptUpdateGMSheet(index, pool = "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "450px";

  box.innerHTML = `
    <h2>🔄 Update Sheet: ${escapeHtml(char.handle)}</h2>
    <p style="margin-bottom:1rem;color:var(--text-secondary)">Choose how you would like to update this character sheet with new data:</p>
    <div style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem">
      <button class="btn-action" id="gmUpdateFromFileBtn" style="padding:0.6rem;text-align:left">
        <strong>📂 Update from JSON File...</strong><br>
        <span style="font-size:0.8rem;opacity:0.8">Pick a new exported character .json file from your computer</span>
      </button>
      <button class="btn-action" id="gmUpdateFromStorageBtn" style="padding:0.6rem;text-align:left">
        <strong>💾 Re-sync from Local Storage</strong><br>
        <span style="font-size:0.8rem;opacity:0.8">Fetch latest saved version from your browser's saved characters</span>
      </button>
    </div>
    <div style="display:flex;justify-content:flex-end">
      <button class="btn-action" style="background:#333;color:#fff" id="gmUpdateCancel">Cancel</button>
    </div>
  `;

  box.querySelector("#gmUpdateFromFileBtn").onclick = () => {
    document.body.removeChild(overlay);
    const updateInput = document.getElementById("gm_update_slot_file");
    if (updateInput) {
      updateInput.dataset.slotIndex = index;
      updateInput.dataset.pool = pool;
      updateInput.click();
    }
  };

  box.querySelector("#gmUpdateFromStorageBtn").onclick = () => {
    document.body.removeChild(overlay);
    refreshGMSheetFromStorage(index, pool);
  };

  box.querySelector("#gmUpdateCancel").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * updateGMSheetWithData(index, newData, filename, pool)
 */
function updateGMSheetWithData(index, newData, filename = "", pool = "players") {
  const arr = getGMPoolArray(pool);
  const existing = arr[index];
  if (!existing) return;

  const gmNotes = existing.gmNotes || "";
  const normalized = sanitizeGMCharacterData(newData, filename || existing.handle);
  normalized.gmNotes = gmNotes;
  normalized._id = existing._id;

  arr[index] = normalized;
  renderBothGMPools();
  alert(`Sheet "${normalized.handle}" updated successfully!`);
}

/**
 * refreshGMSheetFromStorage(index, pool)
 */
function refreshGMSheetFromStorage(index, pool = "players") {
  const arr = getGMPoolArray(pool);
  const char = arr[index];
  if (!char) return;
  const lookupName = char._saveName || char.handle || char.name;
  const savedData = typeof loadCharacter === "function" ? loadCharacter(lookupName) : null;

  if (savedData) {
    updateGMSheetWithData(index, savedData, lookupName, pool);
  } else {
    alert(`No saved character matching "${lookupName}" found in local storage.`);
  }
}

/**
 * refreshAllGMSheetsFromStorage()
 */
function refreshAllGMSheetsFromStorage() {
  if (gmState.loadedSheets.length === 0) {
    alert("No active Player sheets on GM Screen to refresh.");
    return;
  }
  let updatedCount = 0;

  gmState.loadedSheets.forEach((char, index) => {
    const lookupName = char._saveName || char.handle || char.name;
    const savedData = typeof loadCharacter === "function" ? loadCharacter(lookupName) : null;
    if (savedData) {
      const gmNotes = char.gmNotes || "";
      const normalized = sanitizeGMCharacterData(savedData, lookupName);
      normalized.gmNotes = gmNotes;
      normalized._id = char._id;
      gmState.loadedSheets[index] = normalized;
      updatedCount++;
    }
  });

  renderGMSheets();
  alert(`Re-synced ${updatedCount} sheet(s) from local storage!`);
}
