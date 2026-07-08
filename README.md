# Cyberpunk RED Character Generator v2.1

A fully self-contained, highly-optimized interactive character manager for **Cyberpunk RED** by R. Talsorian Games. Create, customize, save, and print characters with full support for stats, skills, role abilities, gear, cyberware, lifepath generation, and multiclassing. No server, no build tools, no internet required — just open the `index.html` file in your browser.

## What's New in v2.1
- **Character Creation Mode**: Added a toggle to handle Character Creation logic, enforcing linear point costs for basic and master skills, and tracking creation IP budgets separately.
- **Cyberdeck & Netrunning Enhancements**: Full Cyberdeck integration in the UI. Cyberdeck buying and equipping is now fully tied to the currency (eurobucks) manager. Installed hardware and programs accurately reflect slot consumption and Eurobuck balances.
- **Cyberware Database Auditing & Fixes**: 
  - Overhauled internal cyberware categories (properly separating Cyberarm, Cyberleg, Cybereye, Cyberaudio, Internal Body, etc. from generic Fashionware).
  - Fixed pricing and humanity loss for Neural Link and its dependent options.
  - Added missing core rulebook Neuralware options like Interface Plugs, Braindance Recorder, Chemical Analyzer, and Machine/Tech Link.
- **Printing Enhancements**: Adjusted the print CSS so the Cyberdeck layout appears logically inserted after the Gear table and before the Skills page break.

## Key Features
*   **Zero Dependencies**: The `index.html` file works fully offline.
*   **10 Stats**: Point-buy system support (62 points, min 2 / max 8).
*   **Automated Derived Stats**: HP, Humanity, EMP, and Death Saves update automatically as stats change or cyberware is installed.
*   **86 Canonical Skills**: Pre-calculated bases (STAT + Rank), including basic skill categorization.
*   **Full Gear & Cyberware System**: Tracking Eurobucks, slot requirements (for limbs and neural links), and armor SP.
*   **Lifepath Generator**: Completely randomized 1-click Lifepath tables straight from the core rules.
*   **LocalStorage Support**: Save and manage an infinite number of characters locally.
*   **JSON Export/Import**: Easily backup and transfer character JSON files.
*   **Print-Friendly Layout**: Seamless print styling to generate physical sheets.

## How to Develop
This project uses a monolith compilation step to keep development clean while ensuring the final product remains a single, portable HTML file.

1. **Source Files**: Edit the modular files located in `js/` (e.g. `data.js`, `ui.js`, `main.js`, `export.js`) or `css/`.
2. **Build**: Run `node build.js` in the root directory.
3. **Deploy**: The script compiles all styles and scripts into a single, offline-ready `index.html`.

## Legal
Cyberpunk RED is a registered trademark of R. Talsorian Games, Inc. This project is an unofficial fan-made tool and is not affiliated with, endorsed, or sponsored by R. Talsorian Games, Inc.
