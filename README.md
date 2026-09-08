# Cyberpunk RED Character Manager & Game Master Command Center (v5.4.1)

> **A fully self-contained, offline-first web application for Cyberpunk RED tabletop RPG players and Game Masters.**

![Version](https://img.shields.io/badge/version-5.4.1-ff0055.svg)
![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-blue.svg)
![Cyberpunk RED](https://img.shields.io/badge/game-Cyberpunk%20RED-00f3ff.svg)
![Offline](https://img.shields.io/badge/offline-100%25-brightgreen.svg)

---

## 🌟 Overview of Version 5

Version 5 delivers a complete, unified suite for Cyberpunk RED, pairing a rich **Character Creator & Manager** with an interactive multi-sheet **Game Master (GM) Command Center**. 

The application is built to be 100% self-contained in a single file (`index.html`). It requires no backend server, no database, no build step to run, and works completely offline in any modern web browser on desktop, tablet, or mobile.

---

## 🎲 Game Master (GM) Command Center

Run fast-paced Cyberpunk RED encounters and manage your entire party simultaneously without juggling tabs or character sheets:

* **Side-by-Side Dynamic Encounter Field (1–5 Sheets)**: Load up to 5 full character sheets side-by-side. The responsive display field automatically balances column widths (`1 to 5 columns`) according to active cards.
* **On-Card Quick Controls**:
  * **Interactive Vitals**: Color-coded percentage health bar with instant `+1`, `+5`, `+10`, `-1`, `-5`, `-10` HP adjustment buttons.
  * **Armor SP Steppers**: Track Head SP and Body SP combat abrasion directly on each card with live recalculation.
  * **Quick Reference Summary**: Instant visibility of core 10 STATs, equipped weapons, and top 4 calculated skill bases.
* **Interactive Sheet Popup Modal**: Click any combatant card to open an interactive command modal with 5 specialized tabs:
  * **❤️ Vitals & STATs**: Adjust identity, role, rank, current/max HP, and core STATs with live parent card updates.
  * **⚔️ Combat & Weapons**: Weapon arsenal with **🎲 Roll Attack** (1d10 + REF + Skill check with exploding critical explosion / fumble calculation) and **💥 Roll Damage** (Xd6 sum and individual dice results).
  * **🎯 Skills & Checks**: Searchable database of all 70+ skills with one-click **🎲 Check** rolls.
  * **🎒 Armor & Gear**: Manage Head/Body SP abrasion and view complete cyberware and gear inventories.
  * **📝 Encounter Notes**: Dedicated GM scratchpad for combat status, conditions, and notes, with an instant **💾 Export Updated JSON** button.
* **Automatic Session Persistence**: The active GM encounter automatically persists to `localStorage` (`cpr_gm_active_session`). Refreshing or reopening the browser instantly restores all active cards, notes, and damage states.
* **Standalone GM Dice Roller**: Quick d10, d6, and 3d6 roll dialog accessible anytime directly from the top navigation bar.
* **Per-Card Re-syncing & Global Session Backup**: Update individual combatants from fresh JSON files or export/import the entire multi-sheet encounter session via `Cyberpunk_GM_Session.json`.

---

## 🦾 Cyberware & Inventory Architecture

Full Cyberpunk RED cyberware mechanics with strict foundation parent validation and physical storage tracking:

* **Parent Cyberware Requirement Enforcement**:
  * Option cyberware (*Teleoptics*, *Popup Weapons*, *Interface Plugs*, *Amplified Hearing*, *Subdermal Pocket*, etc.) strictly requires an installed foundation parent cyberware (*Cybereye*, *Cyberarm*, *Cyberleg*, *Cyberaudio Suite*, *Neural Link*, *Modular Finger Cyberhand*).
  * Installation logic verifies prerequisite presence and ensures open option slots are available before mounting.
* **📦 Uninstalled Cyberware Inventory**:
  * Dedicated container for cyberware owned by the character but not currently installed.
  * Features **`⚡ Install`** (mounts into an available parent option slot), **`💰 Sell`** (reimbursing Eurobucks), and **`🗑️ Delete`** controls.
* **Unequip & Sell Workflows**: Uninstalling installed foundation cyberware or options allows players to store the hardware in uninstalled inventory or sell it for cash.
* **High-Performance Calculation Engine**: A single-pass summary engine aggregates Humanity Cost (HC), STAT bonuses, skill bonuses, and status flags (e.g. *Kerenzikov* +2 initiative) with $O(1)$ cached lookups (**100,000 queries in ~14ms**).

---

## 💻 Cyberdeck, Programs & Hardware Suite

Complete digital architecture audited against the Cyberpunk RED Core Rulebook and *Midnight with the Upload* DLC:

* **31 Programs, Black ICE & Demons**:
  * **Boosters**: *Eraser*, *See-Ya*, *Speedy Gonzalvez*, *Targeting System*, *Worm*.
  * **Defenders**: *Armor*, *Flak*, *Shield*.
  * **Attackers**: *Banhammer*, *DeckKRASH*, *Hellbolt*, *Nervescrub*, *Poison Flatline*, *Superglue*, *Sword*, *Vrizzbolt*.
  * **Anti-Personnel Black ICE**: *Asp*, *Giant*, *Hellhound*, *Kraken*, *Liche*, *Raven*, *Scorpion*, *Skunk*, *Wisp*.
  * **Anti-Program Black ICE**: *Dragon*, *Killer*, *Sabertooth*.
  * **Demons**: *Imp*, *Efreet*, *Succubus*.
* **16 Hardware Options**:
  * Complete catalog: *Backup Drive*, *DNA Lock*, *Hardened Circuitry*, *Insulated Wiring*, *KRASH Barrier*, *Range Upgrade*, *Aerie*, *Bushido Accelerator*, *Combat Recorder*, *Defense Sequencer*, *Feline Instinct*, *Hangry Hangry Dragon*, *Perfume Shoppe*, *Smithy*, *Snaketrap*, and *Swamp Mist*.
* **Strict Slot Enforcement**: Memory and slot costs for Cyberdecks (5, 7, 9 slots), Programs (1 or 2 slots), and Hardware (1, 2, or 3 slots) are strictly verified during selection and installation.

---

## ⚔️ Complete Character Creation & Management

* **Point-Buy STAT Allocation**: 62-point Complete Package system enforcing min 2 / max 8 limits.
* **All 10 Core Roles**:
  * Detailed rank-by-rank ability descriptions for **Rockerboy**, **Solo**, **Netrunner**, **Tech**, **Medtech**, **Media**, **Exec**, **Lawman**, **Fixer**, and **Nomad**.
  * **Interactive Role Mechanics**:
    * **Solo**: Allocate Combat Awareness points across 6 abilities (*Damage Deflection*, *Fumble Recovery*, *Initiative Reaction*, *Precision Attack*, *Spot Weakness*, *Threat Detection*).
    * **Exec**: Select and manage Team Members (*Bodyguard*, *Covert Operative*, *Driver*, *Netrunner*, *Technician*) with persistent highlight tracking across saves and exports.
    * **Tech**: Distribute Maker points across *Field*, *Upgrade*, *Fabrication*, and *Invention Expertise*.
    * **Medtech**: Distribute Medicine points across *Surgery*, *Pharmaceuticals*, and *Cryosystem Operation*.
    * **Nomad**: Track Moto Family vehicles and vehicle upgrades directly on the character sheet.
    * **Lawman**: Dynamic Backup call tables with response unit stats and arrival DVs.
  * **Multiclassing Support**: Unlock and level a secondary role once your primary role reaches Rank 4.
* **86 Skills with Improvement Points (IP)**: Filterable and searchable database with linked STAT bonuses, rank inputs, sub-skills (*Language*, *Local Expert*, *Science*, *Play Instrument*), and automatic IP cost calculation.
* **Weapons, Armor & Gear**:
  * 214+ Weapons mapped accurately to skill checks, including Black Chrome items.
  * 30+ Armor options with Head/Body SP abrasion tracking and encumbrance calculations.
  * Ammunition tracking by weapon type and grenade bundle purchasing.
  * Custom item creator for homebrew weapons, armor, cyberware, vehicles, and gear.
* **Lifepath Generator**: Full generic and role-specific Lifepath generator with random rolling or manual selection.
* **Rules-Compliant Random Character Generator**:
  * One-click generation of fully playable characters.
  * Adheres to the official **2550 eb creation budget** with weapons costing &le;500 eb.
  * Guaranteed Netrunner cyberdeck and software.
  * Installs foundation parent cyberware first before mounting options, depositing unspent starting cash into Eurobucks (`currency_eb`).

---

## 🎨 Customizable Themes & Color Schemes

Personalize your interface with instant visual customization:

* **8 Curated Cyberpunk Palettes**:
  * **Cyber Cyan** (Default: Neon Cyan & Red Accent)
  * **Arasaka Red** (Crimson Main & Cyan Accent)
  * **Netrunner Yellow** (Cyber Yellow & Hot Pink Accent)
  * **Matrix Green** (Terminal Green & Cyan Accent)
  * **Tech Purple** (Neon Purple & Pink Accent)
  * **Edgerunner Orange** (Blaze Orange & Yellow Accent)
  * **Trauma Blue** (Cobalt Blue & Emergency Red Accent)
  * **Ghost White** (Ghost White & Cyan Accent)
* **Custom Color Pickers**: Native color pickers (`<input type="color">`), hex inputs, and quick swatches for Main and Accent colors.
* **Zero-Flicker Persistence**: Preferences save to `localStorage` and load prior to DOM render, preventing visual flash on boot.

---

## 🖨️ Smart Selective Printing & Data Portability

* **Selective Smart Printing**:
  * Checkbox modal allows selecting which sections to include in printouts (Identity, Stats, Lifepath, Weapons, Cyberware, Cyberdeck, Vehicles, Notes, Skills).
  * Auto-expands active Exec team member details with high-contrast borders and `✔ (SELECTED)` badges for grayscale and color printing.
  * Restacks elements into a clean print layout that bypasses browser flex ordering bugs.
* **JSON Export & Import**: Save characters to disk as human-readable `.json` files to easily back up, share, or import into the GM Command Center.

---

## 🏗️ Architecture & How to Run

### How to Run
1. Open **`index.html`** in any modern desktop or mobile web browser (Chrome, Firefox, Safari, Edge).
2. **No internet connection, web server, or Node.js runtime required.**

### Project Structure
```
Cyberpunk_Character_v5/
├── index_js.html          # Modular source HTML template
├── index.html             # Compiled standalone single-file monolith
├── build.js               # Node.js build & compiler script
├── css/
│   ├── base.css           # Core styling tokens, responsive grid & print stylesheet
│   └── theme-dark.css     # Dark mode theme & custom palette variables
├── js/
│   ├── data.js            # STATS, Roles, Skills, Weapons, Armor, Gear & O(1) Index maps
│   ├── calculations.js    # Single-pass cyberware summary, derived stats & IP math
│   ├── storage.js         # LocalStorage character management (Save/Load/Delete)
│   ├── export.js          # JSON export/import and smart selective printing
│   ├── ui.js             # UI rendering, tab navigation, modals & event controllers
│   ├── gm.js             # GM Command Center multi-sheet manager & session state
│   └── main.js           # Boot sequence initialization
├── Apple_Version/         # 100% synchronized build mirror for Safari & iOS devices
└── README.md
```

### Building Monoliths
To recompile source modules into the single-file `index.html` distribution:
```bash
# Build standard root monolith
node build.js

# Build Apple / iOS monolith
cd Apple_Version
node build.js
```

---

## 📜 License & Acknowledgments

- **Rules & Setting**: Based on **Cyberpunk RED** &copy; R. Talsorian Games. This is an unofficial, community-made companion tool for personal tabletop use.
- **License**: Creative Commons Attribution-NonCommercial 4.0 ([CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)).
