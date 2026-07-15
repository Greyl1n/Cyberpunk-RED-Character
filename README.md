# Cyberpunk RED Character Generator (Playtest Build v4.0)

A fully self-contained, highly-optimized interactive character manager for **Cyberpunk RED** by R. Talsorian Games. Create, customize, save, and print characters with full support for stats, skills, role abilities, gear, cyberware, lifepath generation, and multiclassing. 

**No server, no build tools, no internet required.** Just open the single monolith `index.html` file in any modern web browser.

---

## 🚀 Playtest Build Features
This version introduces massive updates across the board, moving beyond a simple character sheet into a full character management suite.

* **Interactive Role Abilities:** 
  * Create and manage **Exec** Team Members (with full auto-rolled stats).
  * Track **Nomad** Family Vehicles & Upgrades.
  * Handle **Lawman** Backup stats and response times.
  * Manage **Netrunner** Interface abilities.
  * Track **Medtech** Pharmaceuticals.
* **Dynamic Cyberware Tracking:** Automatically handles humanity loss, maximum humanity reduction, and custom slot constraints (e.g., limits you to 7 slots for a Cyberarm).
* **Comprehensive Lifepath Generation:** Randomize generic and **Role-specific** Lifepaths instantly.
* **Ammunition Tracking:** Track your remaining rounds and ammo types directly on your sheet.
* **Seamless Local State Management:** Your character state is saved automatically to your browser's local storage.

## 🌟 Core Features
* **10 Stats** with a point-buy system (62 points, min 2 / max 8).
* **All 10 Roles** with detailed rank-by-rank ability descriptions and deeply integrated mechanical trackers.
* **Multiclass Support** — take a secondary role once your primary reaches Rank 4.
* **86 Skills** grouped by linked stat with search, ranks, and item bonuses.
* **140+ Weapons** mapped accurately to their Cyberpunk RED skills.
* **Add/Remove Management** with Eurobuck cost deduction for Armor, Cyberware, Fashion & Gear.
* **Custom Item Entry** for all gear categories.
* **JSON Export/Import** for sharing characters or backing them up safely.
* **Print-Friendly Layout:** Optimized for physical character sheets with customizable background dimming.
* **Mobile-Responsive:** Touch-optimized controls and seamless skill adjustments.

---

## 🛠️ How to Use (For Players)
1. Download the `index.html` file.
2. Double-click to open it in Chrome, Firefox, Edge, Safari, or any modern web browser.
3. Start creating your Edgerunner!

## 💻 How to Build (For Developers)
Because this app is designed to be a single, easily-sharable monolith HTML file, the source code is broken down into modular JS, CSS, and HTML files for easy editing. 

To compile your changes into the final `index.html` file:
1. Ensure you have [Node.js](https://nodejs.org) installed on your system.
2. Make your edits in the `js/`, `css/`, or `html/` folders (specifically `index_js.html`).
3. Run the build script in the terminal:
   ```bash
   node build.js
   ```
4. The script will bundle everything into a fresh `index.html` file in the root directory!

---

*Disclaimer: This is a fan-made project for Cyberpunk RED. Cyberpunk RED is a tabletop roleplaying game created by R. Talsorian Games.*

---

## License
**Creative Commons Attribution-NonCommercial 4.0 International**

This license requires that reusers give credit to the creator. It allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, for noncommercial purposes only.

* **BY**: Credit must be given to you, the creator.
* **NC**: Only noncommercial use of your work is permitted. Noncommercial means not primarily intended for or directed towards commercial advantage or monetary compensation.
