# Cyberpunk RED Character Generator

A standalone, browser-based character manager for **Cyberpunk RED** by R. Talsorian Games. No server required — just open `index.html` in any modern browser.

## Features

- **10 Stats** — Point-buy system (62 points, min 2 / max 8) with +/- controls
- **10 Roles** — All core roles with rank-by-rank ability descriptions (1–10)
- **Multiclassing** — Add a secondary role once your primary reaches Rank 4
- **86 Skills** — Grouped by linked stat, with search, rank input, and item bonuses
- **Weapons** — 120+ weapons across all categories (melee, handguns, SMGs, shotguns, assault rifles, snipers, machineguns, heavy weapons, grenade launchers, rocket launchers, exotic, bows, borg weapons)
- **Armor, Cyberware, Gear** — Add/remove management with data from core rulebook and DLCs
- **Custom Items** — Add your own entries to any item category
- **Lifepath Generator** — Randomise or manually select background, motivation, style, and life events
- **Save/Load** — localStorage-based character manager with named saves
- **JSON Export/Import** — Transfer characters between devices
- **Print** — Combined character + gear sheet optimised for printing
- **Random Character** — One-click generation of a complete, playable character
- **Dark/Light Theme** — Toggle between themes
- **Categorised Selectors** — Weapons, gear, and cyberware pickers grouped by type/category
- **About Tab** — Feature overview and credits

## How to Use

1. Open `index.html` in a browser.
2. Select a **Role** and set your **Role Ability Rank** (default 4 for starting characters).
3. Distribute **Stat points** (62 total, default 6 each).
4. Add **Skill ranks** by typing in the rank column.
5. Switch to the **Gear tab** to add weapons, armor, cyberware, and equipment.
6. Generate a **Lifepath** (manual or random).
7. **Save** your character or **Print** a physical sheet.

## Source Material

- Cyberpunk RED Core Rulebook v1.24
- Black Chrome v1.0
- Black Chrome+ v1.0
- Hornet's Pharmacy — Street drugs, pharmaceuticals, additives, drone, and cyberware (R. Talsorian DLC)
- Must Have Cyberware Deals — 12 cyberware items (R. Talsorian DLC)
- Weapons List Update for CPRED — Fan-compiled weapons compendium (melee, bows, pistols, SMGs, shotguns, assault rifles, sniper rifles, machineguns, grenade launchers, heavy weapons, rocket launchers, exotic & borg weapons)

This is a fan-made tool for personal table use. All game text and mechanics are property of R. Talsorian Games.

## File Structure

```
Cyberpunk_Character/
├── index.html            — Main app entry point
├── css/
│   ├── base.css          — Core layout, responsive, print styles
│   ├── theme-light.css   — Light theme variables
│   └── theme-dark.css    — Dark theme variables
├── js/
│   ├── data.js           — All game data (roles, skills, items, lifepath tables)
│   ├── calculations.js   — Game mechanics (HP, Humanity, stat bonuses)
│   ├── ui.js             — Rendering, event handlers, state management
│   ├── storage.js        — localStorage save/load/delete
│   ├── export.js         — JSON export/import and print
│   └── main.js           — Initialisation and wiring
├── src/                  — Source PDFs (not required for the app to run)
└── README.md
```

## Requirements

- A modern browser (Chrome, Firefox, Edge, Safari)
- No build tools, no server, no dependencies
