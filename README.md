# Cyberpunk RED Character Generator (v4.6.3)

A fully self-contained, highly-optimized interactive character manager for **Cyberpunk RED** by R. Talsorian Games. Create, customize, save, and print characters with full support for stats, skills, role abilities, gear, cyberware, lifepath generation, and multiclassing. 

**No server, no build tools, no internet required.** Just open the single monolith `index.html` file in any modern web browser.

The project also includes a dedicated **Apple-Optimized Edition** (`Apple_Version/index.html`) specifically tailored for Safari on iOS/iPadOS, fixing WebKit-specific flexbox printing quirks, native checkbox styling, and touch inputs.

---

## 🚀 What's New in v4.6.2

Version **4.6.2** incorporates extensive playtester feedback and complete UI refinements:

* **Tab-Persistent In-Page DOM Modals:** Replaced all browser `prompt()` dialogs with styled, non-blocking in-page DOM modals for catalog item additions, slot option installations, custom items, and item sales/removals. Switching browser tabs to copy stats or names no longer interrupts or resets your work.
* **Editable Armor SP (Abrasion Tracking):** Armor Stopping Power (SP) is now an editable field directly on the character sheet. Track combat damage and armor degradation on the fly with real-time recalculations for Total Body SP and Head SP.
* **Looted & Purchased Quantity Management:** Easily increase item quantities for free when looted in combat (0eb) or at listed EB cost with the `➕ Add Quantity` modal. Reducing item quantities (consuming/using items) updates stock without unwanted EB refunds.
* **Categorised Ammunition & Weapon Mapping:** Select specific weapon types for ammo with equipped weapon dropdowns and combined EB cost fields in a unified popup.
* **Grenade & Explosive Bundles:** Grenades and explosive consumables are now purchased and tracked in individual 1-unit bundles instead of 10-packs.
* **Custom Slot Options for Cyberware & Gear:** Custom cyberware automatically links parent categories (`cybereye`, `cyberarm`, `cyberleg`, `cyberaudio`, `neural_link`, etc.) to expose appropriate slot options dynamically.
* **Dynamic QTY Input Width:** Expanded quantity input boxes to gracefully display multi-digit amounts without truncation.

---

## 🌟 Core Features

* **10 Stats Point-Buy System:** 62 points, min 2 / max 8, with automated stat point tracking.
* **All 10 Roles Integrated:** Rank-by-rank ability descriptions and deeply integrated mechanical trackers for:
  * **Exec:** Team Members & auto-rolled stats.
  * **Nomad:** Family Vehicles & Upgrades tracking.
  * **Lawman:** Backup stats and response times.
  * **Netrunner:** Interface abilities and Cyberdeck program tracking.
  * **Medtech:** Pharmaceuticals and Cryo-tank management.
* **Multiclass Support:** Take a secondary role once your primary role reaches Rank 4.
* **86 Skills:** Grouped by linked stat with instant search, rank inputs, base totals, and item bonuses.
* **140+ Weapons:** Mapped accurately to Cyberpunk RED skills, including *Black Chrome* selections.
* **Dynamic Cyberware Tracking:** Automatically handles humanity loss, maximum humanity reduction, and custom slot constraints (e.g., 7 slots for a Cyberarm).
* **Smart Selective Printing:** Selectively exclude empty sections of your character sheet before printing. The app restructures the DOM layout for clean 1-to-2 page physical printouts.
* **Full Lifepath Generation:** Generic and Role-specific Lifepaths with a single-click randomizer.
* **Custom Eurobuck Management:** Quick accounting for payouts, bribes, loot, and custom transactions.
* **JSON Export/Import:** Easily save, backup, or transfer your characters across devices.
* **Netrunner Dark Theme:** Sleek dark-mode aesthetic with vibrant cyberpunk accent styling and high contrast.

---

## 📱 Apple / Safari Optimized Version

If you are using Safari on macOS, iOS (iPhone), or iPadOS (iPad), use `Apple_Version/index.html`. This edition provides:
* WebKit-specific print fixes so borders and background cards print cleanly.
* Touch-optimized number steppers and checkbox styling.
* Full feature parity with the main release.

---

## 🛠️ How to Use (For Players)

1. Download `index.html` from the repository (or `Apple_Version/index.html` if using an Apple device).
2. Double-click to open it in Chrome, Firefox, Edge, Safari, or any modern web browser.
3. Start building your Edgerunner!

---

## 💻 Developer Setup & Build Instructions

To keep the application modular while delivering a zero-dependency single-file HTML app, source files are organized into modular directories:

```
Cyberpunk_Character_v4/
├── index_js.html          # HTML structure & templates
├── css/                   # Stylesheets & themes
│   ├── base.css           # Core styling tokens & layout rules
│   └── theme-dark.css     # Dark theme styles
├── js/                    # Modular JavaScript files
│   ├── state.js           # State management & persistence
│   ├── data.js            # Game databases (weapons, armor, cyberware, vehicles)
│   ├── ui.js              # DOM rendering, event listeners, & modals
│   └── main.js            # App initialization
└── build.js               # Bundler script
```

### Compiling Changes
1. Ensure [Node.js](https://nodejs.org) (v16+) is installed.
2. Edit source files in `js/`, `css/`, or `index_js.html`.
3. Run the build script in the terminal:
   ```bash
   node build.js
   ```
4. The script will bundle all CSS, JavaScript, and HTML templates into a compiled `index.html` monolith in the root directory.
5. *(Optional)* To build the Apple-optimized version, run `node build.js` inside the `Apple_Version/` directory.

---

## 📚 Source Material & Reference

* **Cyberpunk RED Core Rulebook** (v1.24) by R. Talsorian Games
* **Black Chrome** (v1.0) & **Black Chrome+**
* DLCs & Expansions: *Hornet's Pharmacy*, *Must Have Cyberware Deals*, *Toggle's Temple*, *Woodchipper's Garage*, *12 Days of Cybermas / REDmas / Gearmas / Gunmas*

---

## 📜 License & Legal

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

* **Attribution (BY):** Credit must be given to the creator.
* **NonCommercial (NC):** Only noncommercial use of this work is permitted.

*Disclaimer: This is an unofficial, fan-made character manager for Cyberpunk RED. Cyberpunk RED is a tabletop roleplaying game created by R. Talsorian Games. All game text and mechanics are property of their respective owners.*
