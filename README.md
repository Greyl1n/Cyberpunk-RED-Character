# Cyberpunk RED Character Generator v3.2

A fully self-contained, highly-optimized interactive character manager for **Cyberpunk RED** by R. Talsorian Games. Create, customize, save, and print characters with full support for stats, skills, role abilities, gear, cyberware, lifepath generation, and multiclassing. No server, no external build tools during runtime, no internet required — just open the compiled `index.html` file in your browser.

## What's New in v3.2
- **Recursive Cyberware Options**: Deep nesting support for complex cyberware like the Modular Finger Cyberhand and its Cyberfingers, appearing neatly tucked inside your Cyberarm.
- **Accurate Nested HC Calculations**: The math engine now recursively sums the Humanity Cost (HC) from deeply nested options.
- **Creation Point Fixes**: Addressed calculation bugs where points were incorrectly subtracted for free basic skills and corrected language skill rank assignments.

## What's New in v3.1
- **Random Humanity Cost (HC) Rolls**: Implemented support for random d6 Humanity Cost rolls when installing cyberware based on standard Cyberpunk RED rules.
- **Mobile Optimizations**: Seamless skill adjustments and localized DOM rendering to improve focus retention and performance on mobile browsers.
- **Improved Print Layout**: Adjusted the print-friendly layout to display notes before skills and optimized it for physical character sheets with black and white readability.
- **Stats UI Refinements**: The "points remaining" red bar gracefully vanishes when stats are fully allocated for a cleaner look on ready character sheets.

## What's New in v3.0
- **Neon Cyberpunk Aesthetic**: A complete visual overhaul introducing a dark theme with vibrant neon highlights, glowing focus rings, and custom monospaced fonts for a truly immersive Cyberpunk feel.
- **Background Dimming**: Fixed background image support with custom dimming layers to ensure high contrast and readability of the text.

## Key Features
*   **Zero Dependencies**: The `index.html` file works fully offline.
*   **10 Stats**: Point-buy system support (62 points, min 2 / max 8).
*   **Automated Derived Stats**: HP, Humanity, EMP, and Death Saves update automatically as stats change or cyberware is installed.
*   **86 Canonical Skills**: Pre-calculated bases (STAT + Rank), including basic skill categorization.
*   **Full Gear & Cyberware System**: Tracking Eurobucks, slot requirements (for limbs and neural links), and armor SP.
*   **Ammunition Consumption**: Track remaining rounds directly on your sheet.
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
