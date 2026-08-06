// ============================================================
// GAME MASTER (GM) SCREEN & MULTI-SHEET MANAGEMENT (v5.0.0)
// ============================================================

/**
 * gmState object holds the up to 5 loaded character sheets in memory,
 * along with modal navigation state.
 */
let gmState = {
  loadedSheets: [], // Array of character objects (max 5)
  maxSheets: 5,
  activeModalIndex: null,
  currentModalTab: "vitals",
  skillSearchQuery: ""
};

/**
 * initGMScreen()
 * Sets up event listeners for GM screen buttons, file input, session persistence, and modals.
 */
function initGMScreen() {
  autoLoadGMSessionFromStorage();

  const loadJsonBtn = document.getElementById("gmLoadJsonBtn");
  const loadSavedBtn = document.getElementById("gmLoadSavedBtn");
  const exportSessionBtn = document.getElementById("gmExportSessionBtn");
  const importSessionBtn = document.getElementById("gmImportSessionBtn");
  const refreshAllBtn = document.getElementById("gmRefreshAllBtn");
  const diceRollerBtn = document.getElementById("gmDiceRollerBtn");
  const clearAllBtn = document.getElementById("gmClearAllBtn");
  const importFile = document.getElementById("gm_import_file");
  const importSessionFile = document.getElementById("gm_import_session_file");
  const updateSlotFile = document.getElementById("gm_update_slot_file");

  if (loadJsonBtn && importFile) {
    loadJsonBtn.addEventListener("click", () => {
      if (gmState.loadedSheets.length >= gmState.maxSheets) {
        alert(`Maximum limit of ${gmState.maxSheets} side-by-side sheets reached. Please close a sheet first.`);
        return;
      }
      importFile.click();
    });

    importFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        loadGMCharacterFiles(e.target.files);
      }
      this.value = "";
    });
  }

  if (exportSessionBtn) {
    exportSessionBtn.addEventListener("click", exportGMSessionFile);
  }

  if (importSessionBtn && importSessionFile) {
    importSessionBtn.addEventListener("click", () => importSessionFile.click());
    importSessionFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        importGMSessionFile(e.target.files[0]);
      }
      this.value = "";
    });
  }

  if (updateSlotFile) {
    updateSlotFile.addEventListener("change", function(e) {
      if (e.target.files && e.target.files.length > 0) {
        const slotIdx = parseInt(this.dataset.slotIndex);
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data.stats) {
              alert(`File "${file.name}" is not a valid Cyberpunk RED character.`);
              return;
            }
            updateGMSheetWithData(slotIdx, data, file.name);
          } catch (err) {
            alert(`Failed to parse file: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
      this.value = "";
    });
  }

  if (refreshAllBtn) {
    refreshAllBtn.addEventListener("click", refreshAllGMSheetsFromStorage);
  }

  if (loadSavedBtn) {
    loadSavedBtn.addEventListener("click", openGMSavedCharPicker);
  }

  if (diceRollerBtn) {
    diceRollerBtn.addEventListener("click", openGMDiceRollerModal);
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", async () => {
      if (gmState.loadedSheets.length === 0) return;
      if (typeof customConfirm === "function") {
        if (!await customConfirm("Clear all loaded character sheets from GM view?")) return;
      } else {
        if (!confirm("Clear all loaded character sheets from GM view?")) return;
      }
      gmState.loadedSheets = [];
      try {
        localStorage.removeItem("cpr_gm_active_session");
      } catch(e) {}
      renderGMSheets();
    });
  }

  renderGMSheets();
}

/**
 * loadGMCharacterFiles(files)
 * Reads one or multiple JSON files uploaded by the GM.
 */
function loadGMCharacterFiles(files) {
  const remainingSlots = gmState.maxSheets - gmState.loadedSheets.length;
  if (remainingSlots <= 0) {
    alert(`Maximum ${gmState.maxSheets} sheets allowed side-by-side.`);
    return;
  }

  const filesToRead = Array.from(files).slice(0, remainingSlots);
  let loadedCount = 0;

  filesToRead.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.stats) {
          alert(`File "${file.name}" is not a valid Cyberpunk RED character (missing stats).`);
          return;
        }
        // Normalize loaded sheet structure
        const normalized = sanitizeGMCharacterData(data, file.name);
        gmState.loadedSheets.push(normalized);
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          renderGMSheets();
        }
      } catch (err) {
        alert(`Failed to parse "${file.name}": ${err.message}`);
      }
    };
    reader.readAsText(file);
  });
}

/**
 * sanitizeGMCharacterData(data, fallbackName)
 * Ensures missing optional fields have safe defaults.
 */
function sanitizeGMCharacterData(data, fallbackName = "Character") {
  const copy = JSON.parse(JSON.stringify(data));
  copy._id = Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  copy.handle = copy.handle || copy.name || fallbackName.replace(/\.json$/i, "");
  copy.name = copy.name || "";
  copy.role = copy.role || "Rockerboy";
  copy.roleAbilityRank = copy.roleAbilityRank || 4;
  copy.stats = copy.stats || { int: 6, ref: 6, dex: 6, tech: 6, cool: 6, will: 6, luck: 6, move: 6, body: 6, emp: 6 };
  copy.skillRanks = copy.skillRanks || {};
  copy.weapons = copy.weapons || [];
  copy.armor = copy.armor || [];
  copy.cyberware = copy.cyberware || [];
  copy.gear = copy.gear || [];
  copy.ammo = copy.ammo || {};
  copy.gmNotes = copy.gmNotes || "";
  copy.status = copy.status || { wounded: false, critInjury: false, dead: false };

  // Calculate HP if needed
  const body = copy.stats.body || 6;
  const will = copy.stats.will || 6;
  const calculatedMaxHp = typeof calcHitsMax === "function" ? calcHitsMax(body, will) : 10 + (5 * Math.ceil((body + will) / 2));
  copy.hpMax = calculatedMaxHp;
  if (copy.hpCurrent === undefined || copy.hpCurrent === null) {
    copy.hpCurrent = calculatedMaxHp;
  }
  return copy;
}

/**
 * openGMSavedCharPicker()
 * Opens a modal allowing the GM to select a character saved in localStorage.
 */
function openGMSavedCharPicker() {
  if (gmState.loadedSheets.length >= gmState.maxSheets) {
    alert(`Maximum limit of ${gmState.maxSheets} side-by-side sheets reached. Please close a sheet first.`);
    return;
  }

  const savedNames = typeof listCharacters === "function" ? listCharacters() : [];
  if (savedNames.length === 0) {
    alert("No saved characters found in local storage.");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "450px";

  box.innerHTML = `
    <h2>📂 Load Saved Character into GM View</h2>
    <p style="margin-bottom:1rem;color:var(--text-secondary)">Select a character from your local saved list:</p>
    <div id="gmSavedList" class="char-list-panel" style="margin-bottom:1rem"></div>
    <div style="display:flex;justify-content:flex-end;gap:0.5rem">
      <button class="btn-action" style="background:#333;color:#fff" id="gmSavedCancel">Cancel</button>
    </div>
  `;

  const listDiv = box.querySelector("#gmSavedList");
  savedNames.forEach(name => {
    const item = document.createElement("div");
    item.className = "char-list-item";
    item.textContent = name;
    item.onclick = () => {
      const data = typeof loadCharacter === "function" ? loadCharacter(name) : null;
      if (data) {
        const normalized = sanitizeGMCharacterData(data, name);
        gmState.loadedSheets.push(normalized);
        renderGMSheets();
        document.body.removeChild(overlay);
      } else {
        alert(`Could not load character "${name}".`);
      }
    };
    listDiv.appendChild(item);
  });

  box.querySelector("#gmSavedCancel").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * renderGMSheets()
 * Dynamically draws the loaded character cards side-by-side (1 to 5 sheets).
 * Adjusts container CSS variable --gm-sheet-count for dynamic scaling.
 */
function renderGMSheets() {
  const container = document.getElementById("gm_sheets_container");
  const countBadge = document.getElementById("gm_count_badge");
  const emptyState = document.getElementById("gm_empty_state");

  if (!container) return;

  const total = gmState.loadedSheets.length;
  if (countBadge) countBadge.textContent = `${total} / ${gmState.maxSheets} Sheets`;

  // Set grid column CSS variable dynamically
  container.style.setProperty("--gm-sheet-count", Math.max(1, total));

  if (total === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = "";

  gmState.loadedSheets.forEach((char, idx) => {
    const card = document.createElement("div");
    card.className = "gm-sheet-card";
    card.dataset.index = idx;

    // Calculate core totals for preview
    const body = char.stats.body || 6;
    const will = char.stats.will || 6;
    const maxHp = char.hpMax || (typeof calcHitsMax === "function" ? calcHitsMax(body, will) : 40);
    const curHp = char.hpCurrent !== undefined ? char.hpCurrent : maxHp;
    const hpPct = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));

    // HP Bar Color Logic
    let hpColor = "#10b981"; // green
    if (hpPct <= 25) hpColor = "#ef4444"; // red
    else if (hpPct <= 50) hpColor = "#f59e0b"; // yellow

    // Armor SP
    const headArmor = char.armor.find(a => a.slots === "Head") || { sp: 0 };
    const bodyArmor = char.armor.find(a => a.slots === "Body") || { sp: 0 };

    // Death save threshold
    const deathSave = body;

    // Build equipped weapons list summary
    let weaponsSummary = char.weapons.slice(0, 3).map(w => `
      <div class="gm-card-item-row">
        <span><strong>${escapeHtml(w.name)}</strong> (${w.dmg || '1d6'})</span>
        <span class="gm-sub-badge">ROF ${w.rof || 1}</span>
      </div>
    `).join("");
    if (!weaponsSummary) weaponsSummary = `<div style="opacity:0.6;font-size:0.8rem">No weapons equipped</div>`;

    // Calculate top 4 skills for quick preview
    const topSkills = getTopGMSkills(char, 4);
    let skillsSummary = topSkills.map(s => `
      <div class="gm-card-item-row">
        <span>${escapeHtml(s.name)}</span>
        <strong style="color:var(--primary)">+${s.total}</strong>
      </div>
    `).join("");
    if (!skillsSummary) skillsSummary = `<div style="opacity:0.6;font-size:0.8rem">No skills leveled</div>`;

    card.innerHTML = `
      <div class="gm-card-header">
        <div class="gm-card-title-box">
          <h3 class="gm-card-handle">${escapeHtml(char.handle)}</h3>
          <div class="gm-card-role-badge">${escapeHtml(char.role)} (Rank ${char.roleAbilityRank})</div>
        </div>
        <div class="gm-card-actions">
          <button class="gm-card-btn gm-update-btn" title="Update / Reload Sheet Data" onclick="promptUpdateGMSheet(${idx}); event.stopPropagation();">🔄</button>
          <button class="gm-card-btn gm-inspect-btn" title="Inspect & Edit Sheet (Interactive Popup)" onclick="openGMInteractiveModal(${idx}); event.stopPropagation();">🔍</button>
          <button class="gm-card-btn gm-remove-btn" title="Remove Sheet from GM View" onclick="removeGMSheet(${idx}); event.stopPropagation();">✕</button>
        </div>
      </div>

      <!-- HEALTH & VITALS -->
      <div class="gm-card-vitals">
        <div class="gm-hp-header">
          <span><strong>HP:</strong> ${curHp} / ${maxHp}</span>
          <span style="font-size:0.75rem;opacity:0.8">Death Save &le; ${deathSave}</span>
        </div>
        <div class="gm-hp-bar-bg">
          <div class="gm-hp-bar-fill" style="width:${hpPct}%; background:${hpColor};"></div>
        </div>
        <div class="gm-quick-steppers">
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, -5); event.stopPropagation();">-5 HP</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, -1); event.stopPropagation();">-1 HP</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, 1); event.stopPropagation();">+1 HP</button>
          <button class="gm-step-btn" onclick="adjustGMHealth(${idx}, 5); event.stopPropagation();">+5 HP</button>
        </div>
      </div>

      <!-- ARMOR SP -->
      <div class="gm-card-armor-grid">
        <div class="gm-armor-box">
          <span class="gm-armor-label">HEAD SP</span>
          <span class="gm-armor-val">${headArmor.sp || 0}</span>
          <div class="gm-mini-steppers">
            <button onclick="adjustGMArmorSP(${idx}, 'Head', -1); event.stopPropagation();">-</button>
            <button onclick="adjustGMArmorSP(${idx}, 'Head', 1); event.stopPropagation();">+</button>
          </div>
        </div>
        <div class="gm-armor-box">
          <span class="gm-armor-label">BODY SP</span>
          <span class="gm-armor-val">${bodyArmor.sp || 0}</span>
          <div class="gm-mini-steppers">
            <button onclick="adjustGMArmorSP(${idx}, 'Body', -1); event.stopPropagation();">-</button>
            <button onclick="adjustGMArmorSP(${idx}, 'Body', 1); event.stopPropagation();">+</button>
          </div>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="gm-card-stats-grid">
        <div class="gm-stat-cell"><span>INT</span><strong>${char.stats.int || 6}</strong></div>
        <div class="gm-stat-cell"><span>REF</span><strong>${char.stats.ref || 6}</strong></div>
        <div class="gm-stat-cell"><span>DEX</span><strong>${char.stats.dex || 6}</strong></div>
        <div class="gm-stat-cell"><span>TECH</span><strong>${char.stats.tech || 6}</strong></div>
        <div class="gm-stat-cell"><span>COOL</span><strong>${char.stats.cool || 6}</strong></div>
        <div class="gm-stat-cell"><span>WILL</span><strong>${char.stats.will || 6}</strong></div>
        <div class="gm-stat-cell"><span>LUCK</span><strong>${char.stats.luck || 6}</strong></div>
        <div class="gm-stat-cell"><span>MOVE</span><strong>${char.stats.move || 6}</strong></div>
        <div class="gm-stat-cell"><span>BODY</span><strong>${char.stats.body || 6}</strong></div>
        <div class="gm-stat-cell"><span>EMP</span><strong>${char.stats.emp || 6}</strong></div>
      </div>

      <!-- WEAPONS SUMMARY -->
      <div class="gm-card-sec-title">Equipped Weapons</div>
      <div class="gm-card-sec-box">${weaponsSummary}</div>

      <!-- TOP SKILLS SUMMARY -->
      <div class="gm-card-sec-title">Key Skills</div>
      <div class="gm-card-sec-box">${skillsSummary}</div>

      <!-- CLICK TO OPEN OVERLAY FOOTER -->
      <button class="gm-card-footer-btn" onclick="openGMInteractiveModal(${idx});">
        ⚡ Open Interactive Sheet Modal
      </button>
    `;

    container.appendChild(card);
  });

  saveGMSessionToStorage();
}

/**
 * getAllGMSkillsFlatForChar(char)
 * Flattens DATA.skills object into a single array of skill objects,
 * attaching stat key and resolving subskill instances (e.g. Language: Streetslang).
 */
function getAllGMSkillsFlatForChar(char) {
  if (typeof DATA === "undefined" || !DATA.skills) return [];
  let all = [];
  for (let statKey in DATA.skills) {
    if (Array.isArray(DATA.skills[statKey])) {
      DATA.skills[statKey].forEach(sk => {
        if (sk.subs) {
          const count = sk.subs || 1;
          for (let i = 1; i <= count; i++) {
            const subId = `${sk.id}_${i}`;
            const subName = (char && char.subSkillNames && char.subSkillNames[subId])
              ? `${sk.name} (${char.subSkillNames[subId]})`
              : `${sk.name} #${i}`;
            all.push({
              ...sk,
              id: subId,
              baseId: sk.id,
              name: subName,
              stat: statKey
            });
          }
        } else {
          all.push({
            ...sk,
            baseId: sk.id,
            stat: statKey
          });
        }
      });
    }
  }
  return all;
}

/**
 * getTopGMSkills(char, count)
 * Calculates total bases (Stat + Rank) and returns top N highest skills.
 */
function getTopGMSkills(char, count = 4) {
  const allSkills = getAllGMSkillsFlatForChar(char);
  if (allSkills.length === 0) return [];
  const results = [];
  allSkills.forEach(sk => {
    const rank = char.skillRanks[sk.id] || 0;
    if (rank > 0) {
      const statVal = (char.stats && char.stats[sk.stat]) ? char.stats[sk.stat] : 0;
      results.push({ name: sk.name, total: statVal + rank });
    }
  });
  results.sort((a, b) => b.total - a.total);
  return results.slice(0, count);
}

/**
 * adjustGMHealth(index, delta)
 * Adjusts HP for sheet at index.
 */
function adjustGMHealth(index, delta) {
  const char = gmState.loadedSheets[index];
  if (!char) return;
  const maxHp = char.hpMax || 40;
  char.hpCurrent = Math.max(0, Math.min(maxHp, (char.hpCurrent !== undefined ? char.hpCurrent : maxHp) + delta));
  renderGMSheets();
  if (gmState.activeModalIndex === index) {
    const hpInput = document.getElementById("gmModalHpCur");
    if (hpInput) hpInput.value = char.hpCurrent;
  }
}

/**
 * adjustGMArmorSP(index, slot, delta)
 * Adjusts armor SP for Head or Body armor piece.
 */
function adjustGMArmorSP(index, slot, delta) {
  const char = gmState.loadedSheets[index];
  if (!char) return;
  let armor = char.armor.find(a => a.slots === slot);
  if (!armor) {
    armor = { id: `custom_${slot.toLowerCase()}`, name: `${slot} Armor`, sp: 0, slots: slot, enc: 0, cost: 0 };
    char.armor.push(armor);
  }
  armor.sp = Math.max(0, (armor.sp || 0) + delta);
  renderGMSheets();
}

/**
 * removeGMSheet(index)
 * Closes and removes sheet from GM view.
 */
function removeGMSheet(index) {
  gmState.loadedSheets.splice(index, 1);
  if (gmState.activeModalIndex === index) {
    closeGMInteractiveModal();
  } else if (gmState.activeModalIndex > index) {
    gmState.activeModalIndex--;
  }
  renderGMSheets();
}

/**
 * openGMInteractiveModal(index)
 * Opens full interactive popup modal for selected sheet.
 */
function openGMInteractiveModal(index) {
  const char = gmState.loadedSheets[index];
  if (!char) return;

  gmState.activeModalIndex = index;
  gmState.currentModalTab = "vitals";

  const modal = document.getElementById("gmSheetModal");
  if (!modal) return;

  modal.classList.add("active");
  modal.style.display = "flex";
  renderGMModalContent();
}

/**
 * closeGMInteractiveModal()
 */
function closeGMInteractiveModal() {
  const modal = document.getElementById("gmSheetModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
  gmState.activeModalIndex = null;
}

/**
 * renderGMModalContent()
 * Draws inside of interactive GM modal for selected character.
 */
function renderGMModalContent() {
  const char = gmState.loadedSheets[gmState.activeModalIndex];
  const bodyContainer = document.getElementById("gmModalBody");
  const titleContainer = document.getElementById("gmModalTitle");

  if (!char || !bodyContainer) return;

  if (titleContainer) {
    titleContainer.innerHTML = `🎲 Interactive Sheet: <strong>${escapeHtml(char.handle)}</strong> <span style="font-size:0.85rem;opacity:0.8">(${escapeHtml(char.role)} Rank ${char.roleAbilityRank})</span>`;
  }

  // Draw Modal Navigation Tabs
  let html = `
    <div class="gm-modal-tabs">
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'vitals' ? 'active' : ''}" onclick="switchGMModalTab('vitals')">❤️ Vitals & Stats</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'combat' ? 'active' : ''}" onclick="switchGMModalTab('combat')">⚔️ Combat & Weapons</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'skills' ? 'active' : ''}" onclick="switchGMModalTab('skills')">🎯 Skills & Rolls</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'inventory' ? 'active' : ''}" onclick="switchGMModalTab('inventory')">🎒 Armor & Gear</button>
      <button class="gm-modal-tab-btn ${gmState.currentModalTab === 'notes' ? 'active' : ''}" onclick="switchGMModalTab('notes')">📝 GM Notes</button>
    </div>
    <div id="gmModalRollResult" class="gm-roll-result-banner" style="display:none"></div>
    <div class="gm-modal-tab-content">
  `;

  if (gmState.currentModalTab === 'vitals') {
    html += renderGMModalVitalsTab(char);
  } else if (gmState.currentModalTab === 'combat') {
    html += renderGMModalCombatTab(char);
  } else if (gmState.currentModalTab === 'skills') {
    html += renderGMModalSkillsTab(char);
  } else if (gmState.currentModalTab === 'inventory') {
    html += renderGMModalInventoryTab(char);
  } else if (gmState.currentModalTab === 'notes') {
    html += renderGMModalNotesTab(char);
  }

  html += `</div>`;
  bodyContainer.innerHTML = html;
}

/**
 * switchGMModalTab(tabName)
 */
function switchGMModalTab(tabName) {
  gmState.currentModalTab = tabName;
  renderGMModalContent();
}

/**
 * renderGMModalVitalsTab(char)
 */
function renderGMModalVitalsTab(char) {
  const maxHp = char.hpMax || 40;
  const curHp = char.hpCurrent !== undefined ? char.hpCurrent : maxHp;
  const body = char.stats.body || 6;
  const deathSave = body;

  return `
    <div class="grid-2 mt-1">
      <label>Handle <input type="text" value="${escapeHtml(char.handle)}" onchange="updateGMCharProp('handle', this.value)"></label>
      <label>Real Name <input type="text" value="${escapeHtml(char.name)}" onchange="updateGMCharProp('name', this.value)"></label>
      <label>Role <input type="text" value="${escapeHtml(char.role)}" onchange="updateGMCharProp('role', this.value)"></label>
      <label>Role Rank <input type="number" value="${char.roleAbilityRank}" min="1" max="10" onchange="updateGMCharProp('roleAbilityRank', parseInt(this.value)||1)"></label>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Health & Death Save</h3>
      <div class="grid-3">
        <label>Current HP <input id="gmModalHpCur" type="number" value="${curHp}" onchange="updateGMCharProp('hpCurrent', parseInt(this.value)||0)"></label>
        <label>Max HP <input type="number" value="${maxHp}" onchange="updateGMCharProp('hpMax', parseInt(this.value)||1)"></label>
        <label>Death Save &le; <input type="number" value="${deathSave}" readonly class="readonly-input"></label>
      </div>
      <div class="gm-quick-steppers mt-1">
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -10)">-10 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -5)">-5 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, -1)">-1 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 1)">+1 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 5)">+5 HP</button>
        <button class="btn-action" onclick="adjustGMHealth(${gmState.activeModalIndex}, 10)">+10 HP</button>
      </div>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Core STATS</h3>
      <div class="stat-grid">
        ${Object.keys(char.stats).map(statKey => `
          <div class="stat-row">
            <span class="stat-name">${statKey.toUpperCase()}</span>
            <input type="number" value="${char.stats[statKey]}" min="1" max="10" onchange="updateGMCharStat('${statKey}', parseInt(this.value)||1)">
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * renderGMModalCombatTab(char)
 */
function renderGMModalCombatTab(char) {
  if (!char.weapons || char.weapons.length === 0) {
    return `<p style="padding:1rem;opacity:0.7">No weapons equipped on this character sheet.</p>`;
  }

  return `
    <div class="section-card mt-1">
      <h3 class="section-title">Equipped Weapons & Attack Rolls</h3>
      <table class="premium-table">
        <thead>
          <tr>
            <th>Weapon</th>
            <th>Damage</th>
            <th>ROF</th>
            <th>Mag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${char.weapons.map((w, wIdx) => `
            <tr>
              <td><strong>${escapeHtml(w.name)}</strong><br><span style="font-size:0.75rem;opacity:0.7">${w.type || 'Weapon'}</span></td>
              <td>${w.dmg || '1d6'}</td>
              <td>${w.rof || 1}</td>
              <td>${w.mag !== undefined ? w.mag : '-'}</td>
              <td>
                <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem" onclick="rollGMWeaponAttack(${wIdx})">🎲 Roll Attack</button>
                <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem;background:var(--accent)" onclick="rollGMWeaponDamage('${escapeHtml(w.dmg || '3d6')}', '${escapeHtml(w.name)}')">💥 Roll Damage</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * renderGMModalSkillsTab(char)
 */
function renderGMModalSkillsTab(char) {
  const allSkills = getAllGMSkillsFlatForChar(char);
  if (allSkills.length === 0) return "<p>Skills database missing.</p>";

  const query = (gmState.skillSearchQuery || "").toLowerCase();
  const filtered = allSkills.filter(sk =>
    sk.name.toLowerCase().includes(query) || (sk.stat && sk.stat.toLowerCase().includes(query))
  );

  return `
    <div class="skills-header mt-1">
      <input type="text" class="skill-search" placeholder="Search skills..." value="${escapeHtml(gmState.skillSearchQuery)}" oninput="gmState.skillSearchQuery = this.value; renderGMModalContent();">
    </div>
    <div style="max-height:350px; overflow-y:auto; margin-top:0.5rem">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Stat</th>
            <th>Rank</th>
            <th>Total Base</th>
            <th>Roll 1d10 Check</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(sk => {
            const rank = (char.skillRanks && char.skillRanks[sk.id]) ? char.skillRanks[sk.id] : 0;
            const statVal = (char.stats && sk.stat && char.stats[sk.stat]) ? char.stats[sk.stat] : 0;
            const total = statVal + rank;
            const statDisplay = (sk.stat || '').toUpperCase();
            return `
              <tr>
                <td><strong>${escapeHtml(sk.name)}</strong></td>
                <td>${statDisplay} (${statVal})</td>
                <td>${rank}</td>
                <td><strong style="color:var(--primary)">+${total}</strong></td>
                <td>
                  <button class="btn-action" style="font-size:0.75rem;padding:0.2rem 0.5rem" onclick="rollGMSkillCheck('${sk.id}', '${escapeHtml(sk.name)}', ${total})">🎲 Check (+${total})</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * renderGMModalInventoryTab(char)
 */
function renderGMModalInventoryTab(char) {
  const headArmor = char.armor.find(a => a.slots === "Head") || { name: "Head Armor", sp: 0 };
  const bodyArmor = char.armor.find(a => a.slots === "Body") || { name: "Body Armor", sp: 0 };

  return `
    <div class="section-card mt-1">
      <h3 class="section-title">Armor Stopping Power (SP)</h3>
      <div class="grid-2">
        <label>Head Armor SP (${headArmor.name})
          <input type="number" value="${headArmor.sp || 0}" min="0" onchange="updateGMArmorSPDirect('Head', parseInt(this.value)||0)">
        </label>
        <label>Body Armor SP (${bodyArmor.name})
          <input type="number" value="${bodyArmor.sp || 0}" min="0" onchange="updateGMArmorSPDirect('Body', parseInt(this.value)||0)">
        </label>
      </div>
    </div>

    <div class="section-card mt-1">
      <h3 class="section-title">Gear & Cyberware</h3>
      <div style="font-size:0.85rem">
        <strong>Cyberware (${char.cyberware.length} items):</strong>
        <p style="opacity:0.8">${char.cyberware.map(c => escapeHtml(c.name)).join(", ") || "None"}</p>
        <br>
        <strong>Gear (${char.gear.length} items):</strong>
        <p style="opacity:0.8">${char.gear.map(g => `${escapeHtml(g.name)} (x${g.qty||1})`).join(", ") || "None"}</p>
      </div>
    </div>
  `;
}

/**
 * renderGMModalNotesTab(char)
 */
function renderGMModalNotesTab(char) {
  return `
    <div class="section-card mt-1">
      <h3 class="section-title">GM Encounters & Session Notes</h3>
      <textarea style="width:100%;height:150px;font-family:inherit;padding:0.5rem" placeholder="Enter GM specific notes for this character..." onchange="updateGMCharProp('gmNotes', this.value)">${escapeHtml(char.gmNotes || "")}</textarea>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="btn-action" onclick="exportGMCharacterJSON(${gmState.activeModalIndex})">💾 Export Updated JSON</button>
    </div>
  `;
}

/**
 * updateGMCharProp(prop, val)
 */
function updateGMCharProp(prop, val) {
  const char = gmState.loadedSheets[gmState.activeModalIndex];
  if (!char) return;
  char[prop] = val;
  renderGMSheets();
}

/**
 * updateGMCharStat(statKey, val)
 */
function updateGMCharStat(statKey, val) {
  const char = gmState.loadedSheets[gmState.activeModalIndex];
  if (!char || !char.stats) return;
  char.stats[statKey] = val;
  renderGMSheets();
}

/**
 * updateGMArmorSPDirect(slot, val)
 */
function updateGMArmorSPDirect(slot, val) {
  const char = gmState.loadedSheets[gmState.activeModalIndex];
  if (!char) return;
  let armor = char.armor.find(a => a.slots === slot);
  if (!armor) {
    armor = { id: `custom_${slot.toLowerCase()}`, name: `${slot} Armor`, sp: val, slots: slot, enc: 0, cost: 0 };
    char.armor.push(armor);
  } else {
    armor.sp = val;
  }
  renderGMSheets();
}

/**
 * rollGMSkillCheck(skillId, skillName, totalBase)
 * Executes a Cyberpunk RED 1d10 roll with explosion/fumble rules.
 */
function rollGMSkillCheck(skillId, skillName, totalBase) {
  const d10 = Math.floor(Math.random() * 10) + 1;
  let finalRoll = d10 + totalBase;
  let detail = `1d10 (${d10}) + Base (${totalBase})`;

  if (d10 === 10) {
    const extra = Math.floor(Math.random() * 10) + 1;
    finalRoll += extra;
    detail += ` + CRITICAL EXPLOSION! (+${extra})`;
  } else if (d10 === 1) {
    const fumble = Math.floor(Math.random() * 10) + 1;
    finalRoll -= fumble;
    detail += ` - FUMBLE! (-${fumble})`;
  }

  showGMRollResult(`🎯 <strong>${skillName} Check:</strong> Total = <strong style="font-size:1.2rem;color:var(--primary)">${finalRoll}</strong><br><span style="font-size:0.8rem;opacity:0.8">${detail}</span>`);
}

/**
 * rollGMWeaponAttack(wIdx)
 */
function rollGMWeaponAttack(wIdx) {
  const char = gmState.loadedSheets[gmState.activeModalIndex];
  if (!char || !char.weapons[wIdx]) return;
  const w = char.weapons[wIdx];
  const ref = char.stats.ref || 6;
  const skillName = w.skill || "Handgun";
  const skillRank = char.skillRanks[skillName] || 0;
  const totalBase = ref + skillRank;

  rollGMSkillCheck("weapon", w.name, totalBase);
}

/**
 * rollGMWeaponDamage(dmgDiceStr, weaponName)
 * Parses e.g. "3d6", "4d6", "5d6" and rolls them.
 */
function rollGMWeaponDamage(dmgDiceStr, weaponName) {
  const match = dmgDiceStr.match(/(\d+)d(\d+)/i);
  let count = 3;
  let sides = 6;
  if (match) {
    count = parseInt(match[1]) || 3;
    sides = parseInt(match[2]) || 6;
  }

  const rolls = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }

  showGMRollResult(`💥 <strong>${weaponName} Damage (${dmgDiceStr}):</strong> Total = <strong style="font-size:1.2rem;color:var(--accent)">${total}</strong><br><span style="font-size:0.8rem;opacity:0.8">Dice: [${rolls.join(", ")}]</span>`);
}

/**
 * showGMRollResult(msgHtml)
 */
function showGMRollResult(msgHtml) {
  const banner = document.getElementById("gmModalRollResult");
  if (banner) {
    banner.innerHTML = msgHtml;
    banner.style.display = "block";
  }
}

/**
 * exportGMCharacterJSON(index)
 */
function exportGMCharacterJSON(index) {
  const char = gmState.loadedSheets[index];
  if (!char) return;
  const handle = char.handle || "character";
  const filename = `${handle.replace(/[^a-zA-Z0-9_-]/g, "_")}_gm_export.json`;
  const blob = new Blob([JSON.stringify(char, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * openGMDiceRollerModal()
 * Quick standalone dice roller dialog for GM.
 */
function openGMDiceRollerModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "400px";

  box.innerHTML = `
    <h2>🎲 GM Quick Dice Roller</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:1rem 0">
      <button class="btn-action" onclick="this.nextElementSibling.textContent = Math.floor(Math.random()*10)+1">Roll 1d10</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
      <button class="btn-action" onclick="this.nextElementSibling.textContent = Math.floor(Math.random()*6)+1">Roll 1d6</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
      <button class="btn-action" onclick="this.nextElementSibling.textContent = (Math.floor(Math.random()*6)+1)+(Math.floor(Math.random()*6)+1)+(Math.floor(Math.random()*6)+1)">Roll 3d6</button>
      <div style="font-weight:bold;font-size:1.2rem;align-self:center">--</div>
    </div>
    <div style="display:flex;justify:flex-end">
      <button class="btn-action" style="background:#333;color:#fff" id="gmCloseDiceModal">Close</button>
    </div>
  `;

  box.querySelector("#gmCloseDiceModal").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * saveGMSessionToStorage()
 * Auto-saves current gmState.loadedSheets into localStorage so that refreshing
 * or returning to the app restores all side-by-side sheets automatically.
 */
function saveGMSessionToStorage() {
  try {
    if (gmState.loadedSheets.length === 0) {
      localStorage.removeItem("cpr_gm_active_session");
    } else {
      localStorage.setItem("cpr_gm_active_session", JSON.stringify(gmState.loadedSheets));
    }
  } catch (e) {
    console.error("Failed to auto-save GM session:", e);
  }
}

/**
 * autoLoadGMSessionFromStorage()
 * Restores active sheets from localStorage on app boot.
 */
function autoLoadGMSessionFromStorage() {
  try {
    const raw = localStorage.getItem("cpr_gm_active_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        gmState.loadedSheets = parsed.map(c => sanitizeGMCharacterData(c, c.handle));
      }
    }
  } catch (e) {
    console.error("Failed to auto-load GM session:", e);
  }
}

/**
 * exportGMSessionFile()
 * Exports all loaded GM sheets into a single combined JSON session file.
 */
function exportGMSessionFile() {
  if (gmState.loadedSheets.length === 0) {
    alert("No active sheets on GM Screen to export.");
    return;
  }
  const data = {
    _gmSessionVersion: "5.0.0",
    savedAt: new Date().toISOString(),
    sheets: gmState.loadedSheets
  };
  const filename = `Cyberpunk_GM_Session_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * importGMSessionFile(file)
 * Imports a full GM session JSON file.
 */
function importGMSessionFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const sheetsArr = data.sheets || (Array.isArray(data) ? data : null);
      if (!sheetsArr || !Array.isArray(sheetsArr)) {
        alert(`File "${file.name}" is not a valid GM session file.`);
        return;
      }
      if (gmState.loadedSheets.length > 0) {
        if (typeof customConfirm === "function") {
          if (!await customConfirm("Replace active GM Screen sheets with imported session?")) return;
        } else {
          if (!confirm("Replace active GM Screen sheets with imported session?")) return;
        }
      }
      gmState.loadedSheets = sheetsArr.slice(0, gmState.maxSheets).map(c => sanitizeGMCharacterData(c, c.handle));
      renderGMSheets();
      alert(`Loaded ${gmState.loadedSheets.length} sheet(s) from GM session!`);
    } catch (err) {
      alert(`Failed to import GM session: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * promptUpdateGMSheet(index)
 * Opens an options popup to update a specific loaded sheet card.
 */
function promptUpdateGMSheet(index) {
  const char = gmState.loadedSheets[index];
  if (!char) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";

  const box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "450px";

  box.innerHTML = `
    <h2>🔄 Update Sheet: ${escapeHtml(char.handle)}</h2>
    <p style="margin-bottom:1rem;color:var(--text-secondary)">Choose how you would like to update this character sheet with new data:</p>
    <div style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem">
      <button class="btn-action" id="gmUpdateFromFileBtn" style="padding:0.6rem;text-align:left">
        <strong>📂 Update from JSON File...</strong><br>
        <span style="font-size:0.8rem;opacity:0.8">Pick a new exported character .json file from your computer</span>
      </button>
      <button class="btn-action" id="gmUpdateFromStorageBtn" style="padding:0.6rem;text-align:left">
        <strong>💾 Re-sync from Local Storage</strong><br>
        <span style="font-size:0.8rem;opacity:0.8">Fetch latest saved version from your browser's saved characters</span>
      </button>
    </div>
    <div style="display:flex;justify:flex-end">
      <button class="btn-action" style="background:#333;color:#fff" id="gmUpdateCancel">Cancel</button>
    </div>
  `;

  box.querySelector("#gmUpdateFromFileBtn").onclick = () => {
    document.body.removeChild(overlay);
    const updateInput = document.getElementById("gm_update_slot_file");
    if (updateInput) {
      updateInput.dataset.slotIndex = index;
      updateInput.click();
    }
  };

  box.querySelector("#gmUpdateFromStorageBtn").onclick = () => {
    document.body.removeChild(overlay);
    refreshGMSheetFromStorage(index);
  };

  box.querySelector("#gmUpdateCancel").onclick = () => document.body.removeChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * updateGMSheetWithData(index, newData, filename)
 * Merges updated character sheet data into slot index, preserving existing GM notes.
 */
function updateGMSheetWithData(index, newData, filename = "") {
  const existing = gmState.loadedSheets[index];
  if (!existing) return;

  const gmNotes = existing.gmNotes || "";
  const normalized = sanitizeGMCharacterData(newData, filename || existing.handle);
  normalized.gmNotes = gmNotes; // Retain GM encounter notes!
  normalized._id = existing._id; // Retain card ID

  gmState.loadedSheets[index] = normalized;
  renderGMSheets();
  alert(`Sheet "${normalized.handle}" updated successfully!`);
}

/**
 * refreshGMSheetFromStorage(index)
 * Finds character in localStorage and updates the slot.
 */
function refreshGMSheetFromStorage(index) {
  const char = gmState.loadedSheets[index];
  if (!char) return;
  const lookupName = char._saveName || char.handle || char.name;
  const savedData = typeof loadCharacter === "function" ? loadCharacter(lookupName) : null;

  if (savedData) {
    updateGMSheetWithData(index, savedData, lookupName);
  } else {
    alert(`No saved character matching "${lookupName}" found in local storage.`);
  }
}

/**
 * refreshAllGMSheetsFromStorage()
 * Re-syncs all loaded GM sheets against their corresponding character entries in local storage.
 */
function refreshAllGMSheetsFromStorage() {
  if (gmState.loadedSheets.length === 0) {
    alert("No active sheets on GM Screen to refresh.");
    return;
  }
  let updatedCount = 0;

  gmState.loadedSheets.forEach((char, index) => {
    const lookupName = char._saveName || char.handle || char.name;
    const savedData = typeof loadCharacter === "function" ? loadCharacter(lookupName) : null;
    if (savedData) {
      const gmNotes = char.gmNotes || "";
      const normalized = sanitizeGMCharacterData(savedData, lookupName);
      normalized.gmNotes = gmNotes;
      normalized._id = char._id;
      gmState.loadedSheets[index] = normalized;
      updatedCount++;
    }
  });

  renderGMSheets();
  alert(`Re-synced ${updatedCount} sheet(s) from local storage!`);
}
