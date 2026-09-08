# Cyberpunk RED Character Manager & Game Master Command Center (v5.1.4)

> **A fully self-contained, offline-first web application for Cyberpunk RED tabletop RPG players and Game Masters.**

![Version](https://img.shields.io/badge/version-5.1.4-ff0055.svg)
![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-blue.svg)
![Cyberpunk RED](https://img.shields.io/badge/game-Cyberpunk%20RED-00f3ff.svg)

---

## ⚡ What's New in Version 5.1.4?

Version **5.1.4** introduces major performance optimizations, comprehensive code quality refactoring, and bug fixes across all layers:

- **⚡ Single-Pass Cyberware Summary & Caching**: Replaced 4 independent recursive traversals with a unified `getCyberwareSummary()`, executing 100,000 queries in ~14ms.
- **🔍 Expanded O(1) Item Lookup Indexes**: Instant constant-time lookups for Weapons (214), Armor (30), Gear (84), Vehicles (45), and Vehicle Upgrades (9) in `DATA._index`.
- **🚀 Render Loop Hoisting**: Eliminated 56 redundant effective stat computations per skills render cycle.
- **📜 Modal Scrolling & CSS Variable Fixes**: Fixed `var(--accent)` variable inheritance and restored vertical scrolling containers on catalog item pickers.
- **🔄 Complete Apple Version Synchronization**: All modules (`js/`, `css/`, `index_js.html`) are in 100% parity across platforms.

---

## 🦾 What's New in Version 5.1.3?

Version **5.1.3** revisits Cyberware installation logic: enforcing parent cyberware prerequisites for option items and introducing a dedicated uninstalled cyberware inventory:

- **🔒 Parent Cyberware Requirement Enforcement**: Cyberware options (e.g. *Teleoptics*, *Popup Grenade Launcher*, *Subdermal Pocket*, *Interface Plugs*) cannot be installed without an installed foundation parent cyberware (*Cybereye*, *Cyberarm*, *Cyberleg*, *Cyberaudio Suite*, *Neural Link*). Installation checks verify parent presence and available option slots.
- **📦 Uninstalled Cyberware Inventory Box**: Added a new UI box `📦 Uninstalled Cyberware Inventory` to manage cyberware owned by the character but not currently installed, equipped with **`⚡ Install`**, **`💰 Sell`**, and **`🗑️ Delete`** controls.
- **⚙️ Interactive Install & Uninstall Workflows**: Uninstalling installed cyberware or option slots gives players the choice to move items to uninstalled inventory or sell them for Eurobucks.

---

## 💻 What's New in Version 5.1.2?

Version **5.1.2** introduces a complete audit of all **Cyberdecks, Programs, Black ICE, Demons, and Cyberdeck Hardware** in accordance with the official Cyberpunk RED Core Rulebook (CRB) and *Midnight with the Upload* DLC:

- **📝 Full Rulebook Descriptions & Source Citations**: Fixed duplicate `desc` property keys in data structures, restoring complete official descriptions with source tags (`[CRB]`, `[DLC]`).
- **🧩 Expanded Program & Hardware Catalog**:
  - **Programs & ICE**: 31 options across Boosters (*Eraser*, *See-Ya*, *Speedy Gonzalvez*, *Targeting System*, *Worm*), Defenders (*Armor*, *Flak*, *Shield*), Attackers (*Banhammer*, *DeckKRASH*, *Hellbolt*, *Nervescrub*, *Poison Flatline*, *Superglue*, *Sword*, *Vrizzbolt*), Anti-Personnel Black ICE (*Asp*, *Giant*, *Hellhound*, *Kraken*, *Liche*, *Raven*, *Scorpion*, *Skunk*, *Wisp*), Anti-Program Black ICE (*Dragon*, *Killer*, *Sabertooth*), and Demons (*Imp*, *Efreet*, *Succubus*).
  - **Hardware**: 16 options including *Backup Drive*, *DNA Lock*, *Hardened Circuitry*, *Insulated Wiring*, *KRASH Barrier*, *Range Upgrade*, *Aerie*, *Bushido Accelerator*, *Combat Recorder*, *Defense Sequencer*, *Feline Instinct*, *Hangry Hangry Dragon*, *Perfume Shoppe*, *Smithy*, *Snaketrap*, and *Swamp Mist*.
- **⚡ Accurate Slot Calculations & Enforcers**: Correct slot costs for Cyberdecks (5, 7, 9 slots), Programs (1 or 2 slots), and Hardware (1, 2, or 3 slots) are strictly enforced in UI dropdowns and installation checks.

---

## 🎲 What's New in Version 5.1.1?

Version **5.1.1** updates the **Random Character Generator** to follow official Cyberpunk RED starting creation rules:

- **💰 2550 eb Creation Budget**: Randomly generated characters buy weapons, armor, cyberware, and essential gear out of a official 2550 eb creation budget.
- **🔫 500 eb Weapon Limit**: Purchased weapons are restricted to Standard/Cheap weapons costing **500 eb or less**.
- **💻 Netrunner Cyberdeck & Software Guarantee**: Generated Netrunners automatically receive the cheapest Cyberdeck (100 eb) and 1–2 software programs.
- **💵 Cash Deposit**: Any unspent starting budget balance is deposited into the character's Eurobucks (`currency_eb`).

---

## 🎨 What's New in Version 5.1.0?

Version **5.1.0** introduces **Customizable Color Schemes & Theme Customizer**, allowing players and Game Masters to personalize their UI with curated cyberpunk color presets or custom color pickers:

- **🎨 8 Preset Cyberpunk Color Palettes**:
  - **Cyber Cyan** (Default: Neon Cyan & Red Accent)
  - **Arasaka Red** (Crimson Main & Cyan Accent)
  - **Netrunner Yellow** (Cyber Yellow & Hot Pink Accent)
  - **Matrix Green** (Terminal Green & Cyan Accent)
  - **Tech Purple** (Neon Purple & Pink Accent)
  - **Edgerunner Orange** (Blaze Orange & Yellow Accent)
  - **Trauma Blue** (Cobalt Blue & Emergency Red Accent)
  - **Ghost White** (Ghost White & Cyan Accent)
- **🎛️ Custom Main & Accent Color Pickers**: Adjust main interface elements (headers, borders, buttons, focus rings, title glows) and accent highlights (badges, stat point bars, accent glows) using native color pickers (`<input type="color">`), hex code inputs, or quick color swatches.
- **💾 Automatic Persistence**: Selected themes save automatically to browser `localStorage` (`cpr_theme_settings`) and load instantly on boot before rendering (no visual screen flicker).
- **🔄 One-Click Reset**: Easily reset back to default Cyber Cyan anytime.

---

## 🎲 What's New in Version 5.0.0?

Version **5.0.0** introduces the **Game Master (GM) Command Center**, transforming the app into an all-in-one encounter runner and multi-sheet manager alongside its complete character creator.

### 🌟 Game Master Command Center Features
- **Side-by-Side Dynamic Sheet Field (1–5 Sheets)**: Load up to 5 character sheets simultaneously. The display field automatically scales responsive columns (`--gm-sheet-count`) based on the number of active cards.
- **On-Card Quick Controls**:
  - **HP Vitals Bar**: Color-coded percentage health bar with instant `-10`, `-5`, `-1`, `+1`, `+5`, `+10` HP adjustment buttons.
  - **Armor SP Steppers**: Track Head SP and Body SP abrasion directly on preview cards.
  - **Stat & Weapon Summaries**: Core 10 STAT grid, equipped weapons, and top 4 calculated skill bases.
- **Interactive Sheet Popup Modal**: Click `⚡ Open Interactive Sheet Modal` on any card to open a full popup with live tabs:
  - **❤️ Vitals & Stats**: Edit identity, role, rank, current/max HP, and core STATs with live preview updates.
  - **⚔️ Combat & Weapons**: Interactive weapon table with **🎲 Roll Attack** (1d10 + REF + Skill rank + exploding critical explosion / fumble calculation) and **💥 Roll Damage** (Xd6 sum and individual dice results).
  - **🎯 Skills & Rolls**: Searchable database of 70+ skills (including subskills like *Language: Streetslang*) with instant **🎲 Check** roll buttons.
  - **🎒 Armor & Gear**: Head/Body SP adjustment and full cyberware/gear lists.
  - **📝 GM Encounters & Session Notes**: Textarea for session notes + **💾 Export Updated JSON** download button.
- **Automatic Session Persistence**:
  - Active GM Screen sheets automatically persist to browser `localStorage` (`cpr_gm_active_session`) on any edit. Reopening or refreshing the page restores all active cards and notes.
  - Clicking **`🗑️ Clear All`** purges the saved session so opening the app anew boots into an empty GM Screen.
- **Per-Card Sheet Updating (`🔄 Update`)**: Update any card slot from a fresh `.json` file or re-sync from local storage while preserving GM encounter notes.
- **Global Session Export/Import (`💾 Session`)**: Save all active GM sheets into a single combined session file (`Cyberpunk_GM_Session.json`) to reload anytime.
- **Title-Cased Random Street Handles**: Character generator produces clean title-cased street names (e.g. *Karma Tiger*, *Flux Fox*, *Creed Eagle*).
- **Navbar Layout Refinement**: `🎲 GM Screen` tab is positioned on the far right of the navigation bar with `margin-left: auto` and a distinct red theme.

---

## 🛠️ Complete Character Manager Features

- **Stats & Point-Buy**: 62-point Complete Package system enforcing min 2 / max 8 limits.
- **10 Core Roles**: Full rank-by-rank descriptions for Rockerboy, Solo, Netrunner, Tech, Medtech, Media, Exec, Lawman, Courier, and Nomad, plus multiclassing (secondary role unlock at primary Rank 4).
- **Interactive Role Mechanics**:
  - **Exec**: Create and manage Team Members.
  - **Nomad**: Track Moto vehicles and family upgrades.
  - **Lawman**: Backup call stats and response times.
  - **Netrunner**: Interface abilities, cyberdeck slotting, and program memory.
  - **Medtech**: Pharmaceuticals and therapy trackers.
- **86 Skills**: Grouped by linked stat with search, ranks, IP cost calculations, and item bonus inputs.
- **Weapons & Armor Catalog**: 140+ Cyberpunk RED weapons mapped accurately to skill checks, including Black Chrome items. Track armor SP abrasion for Head and Body armor.
- **Gear & Cyberware**: Track inventory, Looted (0eb) vs Purchased items, currency (`eb`), ammunition, and cyberware humanity loss calculations.
- **Lifepath Generator**: Full generic and role-specific Lifepath rolling.
- **Print & Export**: One-click JSON backup export/import and smart selective print stylesheet.

---

## 🏗️ Project Architecture & Build Instructions

The project uses a clean source modular structure that compiles into single-file monolith HTML builds for offline portability.

### Directory Structure
```
Cyberpunk_Character_v5/
├── index_js.html          # HTML template for standard build
├── index.html             # Compiled standard single-file monolith
├── build.js               # Node.js concatenation compiler script
├── css/
│   └── base.css           # Core styling tokens, dark theme & GM layout rules
├── js/
│   ├── data.js            # STATS, Roles, Skills, Weapons, Armor & Cyberware database
│   ├── calculations.js    # Derived statistics, hits max, humanity, IP calculations
│   ├── storage.js         # LocalStorage character manager (Save/Load/Delete)
│   ├── export.js          # JSON export and import handlers
│   ├── ui.js             # UI rendering, tab navigation & event handlers
│   ├── gm.js             # GM Command Center state, cards, modal & session persistence
│   └── main.js           # Boot sequence initialization
├── Apple_Version/         # Optimized standalone build mirror for Safari & iOS devices
│   ├── index_js.html
│   ├── index.html
│   ├── build.js
│   ├── css/
│   └── js/
└── README.md
```

### Monolith Build Command

To compile changes made in `js/`, `css/`, or `index_js.html` into the single-file `index.html` monolith:

```bash
# Build standard root monolith
node build.js

# Build Apple/iOS monolith
cd Apple_Version
node build.js
```

---

## 💻 How to Run

1. Simply open **`index.html`** in any modern desktop or mobile web browser (Chrome, Firefox, Edge, Safari).
2. **No web server, build tools, or internet connection required.**

---

## 📜 License & Copyrights

- **Game Design & Content**: Cyberpunk RED © R. Talsorian Games. All game text and mechanics are property of their respective owners.
- **Codebase License**: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
