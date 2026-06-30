# Cyberpunk RED Character Generator

A highly-optimised, fully self-contained interactive character manager for **Cyberpunk RED** by R. Talsorian Games. 

No server, no build tools, no internet required. Just open `index.html` on your desktop or mobile browser and start playing. 

## Features

- **10 Stats** — Point-buy system (62 points, min 2 / max 8) with +/- controls
- **10 Roles** — All core roles with rank-by-rank ability descriptions (1–10)
- **Multiclassing** — Add a secondary role once your primary reaches Rank 4
- **86 Skills** — Grouped by linked stat, with search, rank input, and item bonuses
- **Weapons** — 140+ weapons correctly mapped to their canonical Cyberpunk RED skills (Shoulder Arms, Handgun, Archery, Heavy Weapons, Melee Weapon)
- **Armor, Cyberware, Gear** — Add/remove management with cost deduction/refund per item
- **Currency Tracking** — Automatic deduction on purchase, refund on removal or qty change
- **Ammunition Consumption** — Purchase ammo as gear, track rounds, auto-remove from gear list when depleted (no refund)
- **Custom Items** — Add your own entries to any item category
- **Lifepath Generator** — Randomise or manually select background, motivation, style, and life events
- **Save/Load** — localStorage-based character manager with named saves
- **JSON Export/Import** — Transfer characters between devices easily
- **Print** — Combined character + gear sheet optimised for printing
- **Random Character** — One-click generation of a complete, playable character
- **Dark/Light Theme** — Toggle between themes instantly
- **Categorised Selectors** — Weapons, gear, and cyberware pickers grouped logically
- **Mobile-Friendly** — Touch-optimised controls, responsive layout, works beautifully on phones and tablets

## How to Use

1. Open `index.html` in a browser (desktop or mobile).
2. Select a **Role** and set your **Role Ability Rank** (default 4 for starting characters).
3. Distribute **Stat points** (62 total, default 6 each).
4. Add **Skill ranks** by typing in the rank column.
5. Switch to the **Gear tab** to add weapons, armor, cyberware, fashion, gear, and ammunition.
6. Use the **Ammunition Tracker** (inside the Gear tab) to consume rounds.
7. Generate a **Lifepath** (manual or random).
8. **Save** your character or **Print** a physical sheet.

## About the Build

The app ships in two equivalent formats to suit your preference:

- **`index.html`** — The monolithic single-file edition. Designed specifically for mobile (e.g. iOS) where loading local `.js` files can be blocked. Everything is inlined.
- **`index_js.html`** — The modern modular edition. Loads JavaScript and CSS from separate files. Great for PC use and development.

Both formats share the same core codebase. The `.js` files in `js/` act as the canonical source, and `index.html` is kept strictly in sync.

### v2.0 Highlights

- **Complete ES6 Modernisation**: Migrated from legacy `var` declarations to block-scoped `const`/`let`, arrow functions, and template literals.
- **Extreme Performance**: Renders are now batched via `DocumentFragment` and O(N) loops have been converted to O(1) dictionary lookups for instant responsiveness.
- **Canonical Accuracy**: Conducted a full audit of the 140+ weapons to correctly map them to their rulebook skills (e.g. mapping Assault Rifles to Shoulder Arms).
- **UI Enhancements**: Added search debouncing, polished the CSS cascade, and updated viewport metadata.

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
└── README.md
```

## Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari — desktop or mobile)
- IE11 is strictly unsupported due to modern ES6 features.

## Source Material

- Cyberpunk RED Core Rulebook v1.24
- Black Chrome v1.0
- Black Chrome+ v1.0
- Hornet's Pharmacy (R. Talsorian DLC)
- Must Have Cyberware Deals (R. Talsorian DLC)
- Weapons List Update for CPRED
- Toggle's Temple (R. Talsorian DLC)
- Woodchipper's Garage (R. Talsorian DLC)
- 12 Days of Cutiemas (R. Talsorian DLC)
- 12 Days of Cybermas, REDmas, Gearmas, Gunmas

*This is a fan-made tool for personal table use. All game text and mechanics are property of R. Talsorian Games.*
