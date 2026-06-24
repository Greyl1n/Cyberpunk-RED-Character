# Cyberpunk RED Character Generator

A fully self-contained, browser-based character manager for **Cyberpunk RED** by R. Talsorian Games. No server, no build tools, no external dependencies — open `index.html` in any modern browser, including mobile.

## Features

- **10 Stats** — Point-buy system (62 points, min 2 / max 8) with +/- controls
- **10 Roles** — All core roles with rank-by-rank ability descriptions (1–10)
- **Multiclassing** — Add a secondary role once your primary reaches Rank 4
- **86 Skills** — Grouped by linked stat, with search, rank input, and item bonuses
- **Weapons** — 140+ weapons across all categories (melee, handguns, SMGs, shotguns, assault rifles, snipers, machineguns, heavy weapons, grenade launchers, rocket launchers, exotic, bows, borg weapons)
- **Armor, Cyberware, Gear** — Add/remove management with cost deduction/refund per item
- **Currency Tracking** — Automatic deduction on purchase, refund on removal or qty change
- **Ammunition Consumption** — Purchase ammo as gear, track rounds, auto-remove from gear list when depleted (no refund)
- **Description Column** — Gear table shows item descriptions inline
- **Custom Items** — Add your own entries to any item category
- **Lifepath Generator** — Randomise or manually select background, motivation, style, and life events
- **Save/Load** — localStorage-based character manager with named saves
- **JSON Export/Import** — Transfer characters between devices
- **Print** — Combined character + gear sheet optimised for printing
- **Random Character** — One-click generation of a complete, playable character
- **Dark/Light Theme** — Toggle between themes
- **Categorised Selectors** — Weapons, gear, and cyberware pickers grouped by type/category
- **Mobile-Friendly** — Touch-optimised controls, responsive layout, works on phones and tablets
- **About Tab** — Feature overview and credits

## How to Use

1. Open `index.html` in a browser (desktop or mobile — the page adapts).
2. Select a **Role** and set your **Role Ability Rank** (default 4 for starting characters).
3. Distribute **Stat points** (62 total, default 6 each).
4. Add **Skill ranks** by typing in the rank column.
5. Switch to the **Gear tab** to add weapons, armor, cyberware, fashion, gear, and ammunition.
6. Use the **Ammunition Tracker** (inside the Gear tab) to consume rounds — the gear entry is removed automatically at 0 rounds with no refund.
7. Generate a **Lifepath** (manual or random).
8. **Save** your character or **Print** a physical sheet.

## About the Build

The app ships in two equivalent formats:

- **`index.html`** — Single-file edition with all JavaScript and CSS inlined.
- **`index_js.html`** — Modular edition that loads JavaScript and CSS from separate files (`js/*.js`). Functionally identical to `index.html`.

Both formats share the same codebase — the `.js` files in `js/` are the canonical source, and the inline `<script>` in `index.html` is kept in sync.

### v1.5 Highlights

- All game data and logic extracted into six `.js` modules (`data.js`, `calculations.js`, `ui.js`, `storage.js`, `export.js`, `main.js`)
- `index_js.html` added as a modular alternative to the single-file build
- Black Chrome standard ammunition (13 types) added as gear items with rounds-per-bundle tracking
- Ammunition consumption tracker integrated into the Gear tab
- Currency automatically deducted/refunded when adding, removing, or changing quantity of any item
- Paired cyberware (e.g. `romanova_cyberlegs`, `skydrivers`) split into Left/Right with pre-filled option slots
- Description column added to the gear table
- `parentType` fallback for cyberware slot-option inheritance

## File Structure

```
Cyberpunk_Character/
├── index.html            — Single-file app (all CSS/JS inlined)
├── index_js.html         — Modular alternative (loads from js/ + css/)
├── css/                  — External stylesheets
├── js/                   — Source JS modules (synced with index.html)
│   ├── data.js           — Game content definitions
│   ├── calculations.js   — Derived-stat helpers
│   ├── ui.js             — State, rendering, user interaction
│   ├── storage.js        — localStorage save/load
│   ├── export.js         — JSON export/import, printing
│   └── main.js           — Initialisation, tabs, themes
├── src/                  — Source PDFs (not required to run)
└── README.md
```

## Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari — desktop or mobile)
- No build tools, no server, no internet connection needed

## Source Material

- Cyberpunk RED Core Rulebook v1.24
- Black Chrome v1.0
- Black Chrome+ v1.0
- Hornet's Pharmacy — Street drugs, pharmaceuticals, additives, drone, and cyberware (R. Talsorian DLC)
- Must Have Cyberware Deals — 12 cyberware items (R. Talsorian DLC)
- Weapons List Update for CPRED — Fan-compiled weapons compendium (100+ weapons)
- Toggle's Temple — Gun range armory with themed weapon variants (R. Talsorian DLC)
- Woodchipper's Garage — Exotic heavy weapons and unique boomsticks (R. Talsorian DLC)
- 12 Days of Cutiemas — Hello Cutie branded weapons, cyberware, gear (R. Talsorian DLC)
- 12 Days of Cybermas — Cyberware collection (ChainRipp, MonoVision, Fleshweave, etc.)
- 12 Days of REDmas — Mixed weapons, cyberware, armor, and gear
- 12 Days of Gearmas — Utility gear, tools, scanners, and the Zonda Metrocar
- 12 Days of Gunmas — Classic 2020-era exotic firearms

This is a fan-made tool for personal table use. All game text and mechanics are property of R. Talsorian Games.
