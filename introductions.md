# Cyberpunk RED Character Manager & GM Command Center: User Guide & Architecture Manual

> **Version:** 5.4.2  
> **Target Audience:** Tabletop Players, Game Masters (GMs), and Developers  
> **Supported Environments:** Modern Web Browsers (Chrome, Firefox, Safari, Edge) and Android Devices (APK)

---

## 📑 Table of Contents
1. [Overview & Core Philosophy](#1-overview--core-philosophy)
2. [How to Run the Application](#2-how-to-run-the-application)
3. [Top Navigation & Global Controls](#3-top-navigation--global-controls)
4. [User Guide: The 6 Functional Modules (Tabs)](#4-user-guide-the-6-functional-modules-tabs)
   - [Module 1: Character (Stats, Identity, Skills & Lifepath)](#module-1-character-stats-identity-skills--lifepath)
   - [Module 2: Gear (Weapons, Armor, Cyberware & Vehicles)](#module-2-gear-weapons-armor-cyberware--vehicles)
   - [Module 3: Cyberdeck (Netrunning, Programs & Hardware)](#module-3-cyberdeck-netrunning-programs--hardware)
   - [Module 4: Notes (Campaign Scratchpad)](#module-4-notes-campaign-scratchpad)
   - [Module 5: About (Documentation & Credits)](#module-5-about-documentation--credits)
   - [Module 6: GM Screen (Encounter Command Center)](#module-6-gm-screen-encounter-command-center)
5. [Codebase Architecture: What Under-the-Hood Modules Do](#5-codebase-architecture-what-under-the-hood-modules-do)
6. [Best Practices & Pro-Tips](#6-best-practices--pro-tips)

---

## 1. Overview & Core Philosophy

The **Cyberpunk RED Character Manager & GM Command Center** is an interactive, rules-enforced companion tool built for the *Cyberpunk RED* tabletop roleplaying game (R. Talsorian Games).

### Key Design Pillars:
* **100% Offline-First:** Runs completely client-side in the browser or via a native Android APK. No servers, accounts, cloud databases, or internet connections are required.
* **Single-File Monolith (`index.html`):** The entire application (HTML structure, CSS stylesheets, game data, rule calculation engine, and SVG/base64 assets) compiles into one standalone file.
* **Strict Rulebook Fidelity:** Directly enforces the Cyberpunk RED Core Rulebook (v1.24) and official DLCs (*Black Chrome*, *Midnight with the Upload*, *Interface RED*, *Danger Gal Dossier*).
* **Dual-Role Utility:** Serves as both an in-depth **Character Creator / Sheet** for players and a high-speed **Multi-Sheet Combat Tracker** for Game Masters.
* **Zero-Flicker Persistence:** All edits, themes, character sheets, and GM encounter cards are preserved automatically in browser local storage (`localStorage`).

---

## 2. How to Run the Application

### Option A: In Any Web Browser (Desktop, Laptop, or Tablet)
1. Double-click or open **`index.html`** in your favorite browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, Brave, Opera).
2. No installation, build process, or web server is needed. You can run it directly from a local folder, a USB thumb drive, or an offline laptop.

### Option B: On Android Devices (Phones & Tablets)
1. Transfer **`CyberpunkRED_v5.4.2.apk`** to your Android device (or download it directly).
2. Tap the APK file to install (allow "Install unknown apps" if prompted).
3. The app launches full-screen with touch-optimized controls, locked horizontal scaling, and hardware GPU acceleration.

---

## 3. Top Navigation & Global Controls

The fixed header bar provides quick-access tools across all tabs:

| Control | Description |
| :--- | :--- |
| **🎨 Theme** | Opens the **Color Scheme Customizer**. Choose from 8 curated cyberpunk presets (*Cyber Cyan, Arasaka Red, Netrunner Yellow, Matrix Green, Tech Purple, Edgerunner Orange, Trauma Blue, Ghost White*) or use native color pickers for custom Main & Accent colors. Saves instantly without reloading. |
| **📂 Characters** | Opens the **Character Manager Modal**. Save your active character into browser memory under a custom name, switch between saved characters, or delete obsolete rosters. |
| **📥 Import** | Uploads an exported `.json` character file from your computer or device storage and loads it into the editor. |
| **📤 Export** | Downloads your current character as a human-readable `.json` file. Backs up identity, stats, skills, role abilities, gear, cyberware (installed + uninstalled), vehicles, cyberdeck with programs/hardware, ammo, and notes. |
| **🖨️ Print** | Launches **Smart Selective Printing**. A modal lets you check/uncheck specific sections (Identity, Stats, Lifepath, Weapons, Cyberware, Cyberdeck, Vehicles, Notes, Skills) and compiles them into a printer-friendly sheet that automatically formats for standard A4 / Letter paper. |
| **🎲 Random** | Instantly generates a complete, rules-compliant starting character with title-cased street handle, rolled stats (62-point distribution), 86 starting skill points, realistic lifepath, and shopping budget (&le;2550 eb). Netrunners automatically receive a cyberdeck and programs. |
| **✨ New** | Resets the character sheet to a clean slate, clearing all stats, inventory, cyberdeck programs, and notes. |

---

## 4. User Guide: The 6 Functional Modules (Tabs)

---

### Module 1: Character (Stats, Identity, Skills & Lifepath)

The **Character Tab** manages the foundational mechanics of your edgerunner.

#### 1. Identity & Role
* **Handle, Legal Name & Age:** Basic biographical information.
* **Role Selection:** Choose from all 10 core roles:
  * *Rockerboy (Charismatic Impact)*
  * *Solo (Combat Awareness)* — Interactive point distribution across 6 combat abilities (*Damage Deflection, Fumble Recovery, Initiative Reaction, Precision Attack, Spot Weakness, Threat Detection*).
  * *Netrunner (Interface)* — Access to Net Actions, Scanner, and Deck operations.
  * *Tech (Maker)* — Specialized expertise pools (*Field, Upgrade, Fabrication, Invention*).
  * *Medtech (Medicine)* — Point distribution (*Surgery, Pharmaceuticals, Cryosystem Operation*).
  * *Media (Credibility)* — Rumor and story verification.
  * *Exec (Team Member Management)* — Select, hire, and track loyalty of your corporate retinue (*Bodyguard, Covert Operative, Driver, Netrunner, Technician*).
  * *Lawman (Backup)* — Dynamic squad response tables, threat levels, and DVs.
  * *Fixer (Operator)* — Dealmaking, contact networks, and market sourcing.
  * *Nomad (Moto)* — Vehicle allocation, fleet upgrades, and clan logistics.
* **Multiclassing Support:** Checking **Multiclass** allows adding a secondary role and rank once your primary role reaches Rank 4.
* **Improvement Points (IP):** Track accumulated experience points earned during missions.

#### 2. Stats & Point-Buy Allocation
* Tracks the 10 core Cyberpunk RED statistics: **INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP**.
* Features the official **62-Point Complete Package** budget bar. Points range from 2 (minimum) to 8 (starting maximum).

#### 3. Health & Humanity Calculations
* **Max Hit Points:** Calculated automatically as:
  $$\text{Max HP} = 10 + 5 \times \left\lceil \frac{\text{BODY} + \text{WILL}}{2} \right\rceil$$
* **Current HP:** Live counter with automatic injury triggers.
* **Seriously Wounded Threshold:** Automatically calculated as $\lceil \text{Max HP} / 2 \rceil$. When Current HP drops below this value, a -2 penalty to all actions is indicated.
* **Death Save:** Calculated directly from base **BODY**.
* **Humanity & EMP:** Tracks maximum Humanity ($10 \times \text{Base EMP}$), total Humanity Cost (HC) from all installed cyberware, current Humanity, and actual effective **EMP** ($\lfloor \text{Current Humanity} / 10 \rfloor$).

#### 4. Skills & Creation Mode
* Contains all **86 Cyberpunk RED skills** categorized by their governing attribute.
* **Creation Mode Toggle:** Enforces the official 86 starting skill point allocation during character generation.
* **Search Filter:** Type into the search bar to instantly isolate skills (e.g. "evasion", "cyberdeck", "handgun").
* **Sub-Skill Support:** Enter custom specializations for open-ended skills like *Language*, *Local Expert*, *Science*, and *Play Instrument*.
* **Live Mathematical Breakdown:** Displays `Stat Bonus + Ranks + Item Modifiers + Cyberware Modifiers = Total Skill Base`.

#### 5. Lifepath Generator
* Generates detailed backgrounds across 13 cultural and personal categories (*Cultural Origin, Personality, Clothing Style, Hairstyle, Affectation, Value Most, Feelings About People, Valued Person, Valued Possession, Family Background, Childhood Environment, Family Crisis, Life Goals*).
* Interactive sub-tables to add, edit, or remove **Friends**, **Enemies**, and **Tragic Love Affairs**.
* Dynamic **Role-Based Lifepath** section tailored specifically to your chosen primary role.
* One-click **🎲 Randomise Entire Lifepath** button to roll a full backstory in seconds.

---

### Module 2: Gear (Weapons, Armor, Cyberware & Vehicles)

The **Gear Tab** handles physical possessions, armory, body modifications, and transport.

#### 1. Weapons Arsenal
* **Catalog of 214+ Weapons:** Includes standard Core Rulebook weapons and expansion items from *Black Chrome* and DLC releases.
* Displays damage dice (e.g. `3d6`, `4d6`, `5d6`), Rate of Fire (RoF), Magazine capacity, required Skill, and weapon descriptions.
* **Attack & Damage Rolling:** Live roll buttons calculate $1\text{d}10 + \text{REF} + \text{Skill}$ with critical explosion (rolling a 10 rolls an extra d10) or fumble (rolling a 1 subtracts an extra d10).

#### 2. Armor & SP Abrasion Tracking
* Equips armor for **Head** and **Body** (e.g. Leathers, Kevlar, Light Armorjack, Heavy Armorjack, Flak, MetalGear).
* **Combat Abrasion Tracking:** Directly edit Head SP and Body SP on the card as armor gets abraded in firefights. Total SP recalculates in real time.
* **Encumbrance Penalties:** Automatically applies REF and DEX penalties when wearing heavy armor (e.g. -2 for Heavy Armorjack, -4 for MetalGear).

#### 3. Cyberware Architecture & Foundation Enforcement
* **Prerequisite Validation:** Option cyberware strictly requires its foundation parent piece to be installed first:
  * Cybereye options (*Teleoptics, MicroVideo, Dartgun*) require an installed **Cybereye**.
  * Cyberarm options (*Popup Gun, Big Knucks, Tool Hand*) require an installed **Cyberarm**.
  * Cyberaudio options (*Amplified Hearing, Bug Detector*) require a **Cyberaudio Suite**.
  * Neuralware options (*Kerenzikov, Sandevistan, Interface Plugs*) require a **Neural Link**.
* **Slot Capacity Check:** Enforces slot limits for all foundation limbs and neuralware.
* **📦 Uninstalled Cyberware Inventory:** Items purchased or uninstalled are placed in this dedicated storage box. From here, you can:
  * **⚡ Install:** Mount the item into an open slot on an installed parent piece.
  * **💰 Sell:** Sell the item and reimburse Eurobucks to your wallet.
  * **🗑️ Delete:** Discard unwanted chrome.

#### 4. Fashion, Gear & Ammunition
* Catalog of 84+ everyday gear, tools, surveillance devices, and lifestyle fashion.
* **Ammunition Tracker:** Tracks specialized ammunition (Basic, Armor Piercing, Incendiary, EMP, Smart, Expansive) mapped to specific weapons, with individual round tracking and bundle purchasing.
* **Eurobucks (eb) Cashbox:** Real-time wallet tracking with a quick **Modify eb** (+ / -) adjuster for mission payouts and expenditures.

#### 5. Vehicles & Upgrades
* Track personal and Nomad family vehicles (Cars, Gyrocopters, Aerodynes, Motorcycles, Combat Vans).
* Displays Structural Damage Points (SDP), seating capacity, cost, and installed vehicle upgrades (*Armor Plates, Heavy Chassis, Mounted Weapon Pods, Smuggling Compartments*).

---

### Module 3: Cyberdeck (Netrunning, Programs & Hardware)

The **Cyberdeck Tab** is a dedicated virtual workspace designed for Netrunners.

* **Deck Selection:** Equip standard, superior, or exotic cyberdecks with 5, 7, or 9 memory slots.
* **Live Slot Dashboard:** Displays currently installed program and hardware slot consumption against total deck capacity.
* **31 Programs, Black ICE & Demons:**
  * **Booster Programs:** *Eraser, See-Ya, Speedy Gonzalvez, Targeting System, Worm*.
  * **Defender Programs:** *Armor, Flak, Shield*.
  * **Attacker Programs:** *Banhammer, DeckKRASH, Hellbolt, Nervescrub, Poison Flatline, Superglue, Sword, Vrizzbolt*.
  * **Anti-Personnel Black ICE:** *Asp, Giant, Hellhound, Kraken, Liche, Raven, Scorpion, Skunk, Wisp*.
  * **Anti-Program Black ICE:** *Dragon, Killer, Sabertooth*.
  * **Demons:** *Imp, Efreet, Succubus*.
* **16 Hardware Upgrades:** Complete support for *Backup Drive, DNA Lock, Hardened Circuitry, Insulated Wiring, KRASH Barrier, Range Upgrade, Bushido Accelerator, Snaketrap, Swamp Mist*, and more.
* **Full Official Descriptions:** Verified against the Core Rulebook and *Midnight with the Upload* DLC.

---

### Module 4: Notes (Campaign Scratchpad)

The **Notes Tab** provides a large, distraction-free markdown-capable text scratchpad.
* Store mission briefings, NPC contact details, safehouse locations, syndicate debts, or personal roleplay logs.
* Automatically saved in local storage and included in JSON character exports.

---

### Module 5: About (Documentation & Credits)

The **About Tab** contains technical documentation, changelogs, rulebook citations, and legal credits:
* Details version changes (including v5.4.2 complete save data persistence and mobile optimizations).
* Lists official source material citations (*[CRB], [BC], [TotR], [DGD], [IR]*).
* Attribution and CC BY-NC 4.0 licensing information.

---

### Module 6: GM Screen (Encounter Command Center)

The **GM Screen Tab** is a purpose-built tactical combat dashboard allowing Game Masters to run combat encounters with up to 5 characters or NPCs simultaneously without juggling sheets.

#### 1. Dynamic Side-by-Side Encounter Grid
* Displays **1 to 5 character sheets** side-by-side in responsive columns that automatically scale across desktop monitors, laptops, and tablets.
* Load combatants directly from **Exported JSON files** or your browser's **Saved Characters** roster.

#### 2. On-Card Instant Combat Controls
Each combatant card on the field displays:
* **Interactive Health Bar:** Color-coded HP percentage bar with instant adjustment buttons (`+1`, `+5`, `+10`, `-1`, `-5`, `-10`).
* **Armor SP Steppers:** Directly step Head SP and Body SP up or down as hits connect and armor abrades.
* **Quick Reference Strip:** Instant visibility of core STATs (REF, DEX, MOVE, BODY, WILL, EMP), currently equipped weapons, and top 4 calculated skill bases.

#### 3. Interactive Sheet Popup Modal
Clicking anywhere on an encounter card opens a deep-inspection command modal with 5 specialized sub-tabs:
1. **❤️ Vitals & STATs:** Live modification of Handle, Role, Rank, HP, and all 10 core attributes with automatic parent card re-rendering.
2. **⚔️ Combat & Weapons:** Instant **🎲 Roll Attack** ($1\text{d}10 + \text{REF} + \text{Skill}$ with critical explosion and fumble math) and **💥 Roll Damage** ($X\text{d}6$ sum and individual dice results).
3. **🎯 Skills & Checks:** Searchable list of all 70+ skills with one-click **🎲 Check** rolls.
4. **🎒 Armor & Gear:** Manage equipment, review cyberware, and adjust armor abrasion.
5. **📝 Encounter Notes:** GM scratchpad to record conditions, status effects, and cover states, with a one-click **💾 Export Updated JSON** button.

#### 4. Session Persistence & Backup
* **Automatic Encounter Save:** The active combat encounter automatically persists to `localStorage` (`cpr_gm_active_session`). Accidental tab closures or browser refreshes will not lose encounter progress.
* **💾 Export Session / 📂 Import Session:** Save the entire active encounter (including all 5 sheets, current damage, abraded armor, and combat notes) into a single `Cyberpunk_GM_Session.json` file.
* **🔄 Refresh All & Slot Re-Sync:** Re-sync combatants against updated character files while preserving GM encounter notes.
* **🎲 Quick GM Dice Roller:** Standalone d10, d6, and 3d6 roller available directly in the GM header bar.

---

## 5. Codebase Architecture: What Under-the-Hood Modules Do

The project follows a modular, decoupled architecture where source files in `js/` and `css/` are compiled into the single-file distribution via `build.js`.

```
Cyberpunk_Character_v5/
├── index_js.html          # Modular development HTML template
├── index.html             # Production single-file standalone monolith
├── build.js               # Node.js compiler script
├── css/
│   ├── base.css           # Styling tokens, responsive layout, print rules
│   └── theme-dark.css     # Dark mode variables & palette definitions
├── js/
│   ├── data.js            # Core rulebook database & O(1) indexed maps
│   ├── calculations.js    # Mathematical logic & performance-cached summaries
│   ├── storage.js         # LocalStorage persistence abstraction layer
│   ├── export.js          # JSON serialization & selective printing engine
│   ├── ui.js              # DOM rendering, event controllers & modal handlers
│   ├── gm.js              # GM Screen engine, multi-sheet state & dice math
│   └── main.js            # Bootloader & application initialization
├── android-app/           # Android Studio project for APK generation
└── introductions.md       # This manual
```

### Detailed Breakdown of Core Code Modules:

| Module | File | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **Data Engine** | [`js/data.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/data.js) | Acts as the static relational database for the application. Contains data arrays for all 10 Roles, 86 Skills, 214+ Weapons, 30+ Armors, 84+ Gear items, 45 Vehicles, Cyberware catalog, 31 Programs/Black ICE, and Lifepath roll tables. Builds $O(1)$ fast-lookup indexes in `DATA._index` during initialization. |
| **Calculation Engine** | [`js/calculations.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/calculations.js) | Pure mathematical calculation functions: calculates Max HP, Seriously Wounded threshold, Death Saves, Humanity Loss, and effective EMP. Features a single-pass cyberware summary cache (`calculateCyberwareSummary()`) capable of executing 100,000 lookups in ~14ms. |
| **Storage Engine** | [`js/storage.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/storage.js) | Safely abstracts `window.localStorage`. Handles character saving, named slot retrieval, loading, deletion, active GM session storage, and instant theme preference loading. |
| **Export & Print Engine** | [`js/export.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/export.js) | Manages character portability. Serializes full character objects into standardized `.json` format and handles schema parsing on import. Manages **Selective Smart Printing**, restructuring DOM elements for paper layouts. |
| **UI & View Controller** | [`js/ui.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/ui.js) | Largest UI controller: handles tab switching, DOM generation, table rendering for skills, weapons, armor, cyberware, ammunition, and vehicles. Handles creation mode points, item selection modals, and color theme customizers. |
| **GM Screen Engine** | [`js/gm.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/gm.js) | Drives the Game Master Command Center: manages multi-sheet arrays (1–5 cards), column grid recalculation, damage/healing steppers, interactive inspection modals, exploding d10 attack rolls, d6 damage rolls, and session export/import. |
| **Bootloader** | [`js/main.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/js/main.js) | Application lifecycle initiator: runs on `DOMContentLoaded`. Pre-applies stored themes, populates dropdowns, registers global event listeners, runs initial calculation passes, and triggers the welcome overlay. |
| **Build Compiler** | [`build.js`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/build.js) | Offline build script: inlines CSS stylesheets, JavaScript files, and assets from `index_js.html` into the zero-dependency standalone monolith `index.html`. |
| **Android Wrapper** | [`android-app/`](file:///c:/Users/marku/Python_codes_trusted/RPG/Cyberpunk_Character_v5/android-app) | Native Android wrapper using Kotlin and Android WebView. Features hardware GPU acceleration (`LAYER_TYPE_HARDWARE`), strict viewport locking, and local asset bundling for the standalone `.apk`. |

---

## 6. Best Practices & Pro-Tips

### For Players:
* **Always Export Your Character:** Use **📤 Export** after leveling up or buying new gear. Storing `.json` files in your campaign folder ensures you always have a permanent backup.
* **Keep Uninstalled Cyberware in Inventory:** When visiting a ripperdoc to swap cyberware, use the **Uninstall** action to move chrome into your **📦 Uninstalled Inventory** instead of deleting it. You can reinstall or sell it later.
* **Check Your Netrunner Memory Slots:** Always verify your Cyberdeck's available slots before buying expensive Black ICE programs.
* **Smart Printing for Sessions:** If playing in-person with paper, use **🖨️ Print** and uncheck sections you don't need (e.g. Lifepath or Notes) to keep your printed sheet to 1 or 2 high-contrast pages.

### For Game Masters:
* **Pre-Build Combat Rosters:** Create your NPC enemies or mooks in the character creator, export them as `.json` files (e.g. `Boostergang_Grunt.json`, `Arasaka_Sniper.json`), and load them into the GM Screen before session night.
* **Save Encounter Sessions:** If a combat encounter pauses mid-firefight at the end of a session, click **💾 Export Session**. At the start of next week's session, click **📂 Import Session** to restore all HP, abraded armor, and tactical notes exactly where you left off.
* **Use Direct Attack & Damage Rolls:** In the interactive combat modal, click **🎲 Roll Attack** and **💥 Roll Damage** to immediately roll dice with correct skill bases and explosive critical calculations, saving time at the table.
