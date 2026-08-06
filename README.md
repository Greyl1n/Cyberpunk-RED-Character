# Cyberpunk RED Character Manager & Game Master Command Center (v5.0.0)

> **A fully self-contained, offline-first web application for Cyberpunk RED tabletop RPG players and Game Masters.**

![Version](https://img.shields.io/badge/version-5.0.0-ff0055.svg)
![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-blue.svg)
![Cyberpunk RED](https://img.shields.io/badge/game-Cyberpunk%20RED-00f3ff.svg)

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
- **10 Core Roles**: Full rank-by-rank descriptions for Rockerboy, Solo, Netrunner, Tech, Medtech, Media, Exec, Lawman, Fixer, and Nomad, plus multiclassing (secondary role unlock at primary Rank 4).
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
