// ============================================================
// UI AND STATE MANAGEMENT
// ============================================================
// This is the largest file in the application. It acts as the "Controller" and "View".
// It contains the `state` object (which holds your character's current stats, items, etc.)
// and all the `render...()` functions that take that state and draw HTML on the screen.

// The 'state' object is the live memory of your character. Everything you do updates this.
let state = {
  stats: {},
  skillRanks: {},
  subSkillNames: {},
  skillItem: {},
  weapons: [],
  armor: [],
  cyberware: [],
  gear: [],
  vehicles: [],
  ammo: {},
  roleSubRanks: {},
  lifepath: { friends: [], enemies: [], lovers: [] },
  roleLifepath: {},
  currentTab: "tab-character"
};

/**
 * initState()
 * Sets up the default values for a brand new character.
 */
function initState() {
  for (let i = 0; i < DATA.stats.length; i++) {
    let s = DATA.stats[i];
    state.stats[s.id] = 6;
  }
}

function getStatPointsRemaining() {
  let used = 0;
  for (let i = 0; i < DATA.stats.length; i++) {
    used += state.stats[DATA.stats[i].id];
  }
  return STAT_POINTS_TOTAL - used;
}

function customConfirm(message, yesText="Yes", noText="No") {
  return new Promise(resolve => {
    let overlay = document.createElement('div');
    overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;';
    let box = document.createElement('div');
    box.style = 'background:#1a1a1a; border:2px solid #ff003c; padding:2rem; max-width:400px; width:100%; display:flex; flex-direction:column; gap:1.5rem;';
    let msg = document.createElement('div');
    msg.style = 'color:#fff; font-size:1.1rem; white-space:pre-wrap;';
    msg.textContent = message;
    let btns = document.createElement('div');
    btns.style = 'display:flex; gap:1rem; justify-content:flex-end;';
    let noBtn = document.createElement('button');
    noBtn.className = 'btn-action';
    noBtn.style.background = '#333';
    noBtn.style.color = '#fff';
    noBtn.textContent = noText;
    noBtn.onclick = () => { document.body.removeChild(overlay); resolve(false); };
    let yesBtn = document.createElement('button');
    yesBtn.className = 'btn-action';
    yesBtn.textContent = yesText;
    yesBtn.onclick = () => { document.body.removeChild(overlay); resolve(true); };
    btns.appendChild(noBtn);
    btns.appendChild(yesBtn);
    box.appendChild(msg);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

function updateSecondaryRoleOptions() {
  let sel = document.getElementById("role_select");
  let sel2 = document.getElementById("role_secondary_select");
  let currentVal = sel2.value;
  let html = '<option value="">-- None --</option>';
  for (let i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id !== sel.value) {
      html += '<option value="' + DATA.roles[i].id + '">' + DATA.roles[i].name + '</option>';
    }
  }
  sel2.innerHTML = html;
  sel2.value = currentVal;
}

function initRoleSelect() {
  let sel = document.getElementById("role_select");
  let sel2 = document.getElementById("role_secondary_select");
  let html = '<option value="">-- Select Role --</option>';
  for (let i = 0; i < DATA.roles.length; i++) {
    html += '<option value="' + DATA.roles[i].id + '">' + DATA.roles[i].name + '</option>';
  }
  sel.innerHTML = html;
  sel2.innerHTML = '<option value="">-- None --</option>' + html;
  sel.onchange = function() {
    updateSecondaryRoleOptions();
    updateRoleInfo();
    state.roleLifepath = {}; // reset on role change
    renderRoleLifepath();
  };
  sel2.onchange = function() { updateRoleInfo(); };
  document.getElementById("multiclass_enabled").onchange = function() {
    document.getElementById("multiclass_fields").style.display = this.checked ? "grid" : "none";
    updateRoleInfo();
  };
  document.getElementById("role_secondary_rank").oninput = function() { updateRoleInfo(); };
  setUpRoleRankCost();
}

function setUpRoleRankCost() {
  let roleRankEl = document.getElementById("role_ability_rank");
  let roleRank2El = document.getElementById("role_secondary_rank");
  roleRankEl.dataset.oldVal = roleRankEl.value;
  roleRank2El.dataset.oldVal = roleRank2El.value;
  roleRankEl.oninput = function() {
    let oldVal = parseInt(this.dataset.oldVal) || 0;
    let newVal = parseInt(this.value) || 0;
    if (newVal === oldVal) { updateRoleInfo(); return; }
    let cost = ipCostBetween(oldVal, newVal, 60);
    if (cost > 0 && !payIpCost(cost)) {
      alert("Not enough Improvement Points! Need " + cost + " IP.");
      this.value = oldVal;
      return;
    }
    if (cost < 0) payIpCost(cost);
    this.dataset.oldVal = newVal;
    updateRoleInfo();
  };
  roleRank2El.oninput = function() {
    let oldVal = parseInt(this.dataset.oldVal) || 0;
    let newVal = parseInt(this.value) || 0;
    if (newVal === oldVal) { updateRoleInfo(); return; }
    let cost = ipCostBetween(oldVal, newVal, 60);
    if (cost > 0 && !payIpCost(cost)) {
      alert("Not enough Improvement Points! Need " + cost + " IP.");
      this.value = oldVal;
      return;
    }
    if (cost < 0) payIpCost(cost);
    this.dataset.oldVal = newVal;
    updateRoleInfo();
  };
}

function getMotoRank() {
  let rank = 0;
  if (document.getElementById("role_select").value === "nomad") {
    rank += parseInt(document.getElementById("role_ability_rank").value) || 0;
  }
  if (document.getElementById("multiclass_enabled").checked && document.getElementById("role_secondary_select").value === "nomad") {
    rank += parseInt(document.getElementById("role_secondary_rank").value) || 0;
  }
  return rank;
}

function getUsedMotoVehicles() {
  let count = 0;
  for (let v of state.vehicles) {
    if (v.isMoto) count++;
  }
  return count;
}

function getUsedMotoUpgrades() {
  let count = 0;
  for (let v of state.vehicles) {
    if (v.upgrades) {
      for (let u of v.upgrades) {
        if (u.isMoto) count++;
      }
    }
  }
  return count;
}

function getUsedMotoCount() {
  let count = 0;
  for (let v of state.vehicles) {
    if (v.isMoto) count++;
    if (v.upgrades) {
      for (let u of v.upgrades) {
        if (u.isMoto) count++;
      }
    }
  }
  return count;
}

function renderRoleSubSkills(role, rank) {
  if (!role.subSkills) return "";
  let totalPts = rank * role.subSkillsPointsPerRank;
  let usedPts = 0;
  for (let s of role.subSkills) {
    let skId = role.id + "_" + s.id;
    usedPts += state.roleSubRanks[skId] || 0;
  }
  let remaining = totalPts - usedPts;
  
  let html = '<div style="margin-top:0.5rem; font-size:0.85rem; border: 1px solid var(--border); padding: 5px; border-radius: 4px; background: rgba(0,0,0,0.3);">';
  html += '<div style="margin-bottom: 5px; font-weight: bold; color: var(--accent);">Sub-Skills (Points Remaining: <span style="color:' + (remaining === 0 ? 'var(--text)' : 'var(--error)') + '">' + remaining + '</span>)</div>';
  
  for (let s of role.subSkills) {
    let skId = role.id + "_" + s.id;
    let r = state.roleSubRanks[skId] || 0;
    html += '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 3px;">';
    html += '<div><span style="font-weight:bold; color:var(--text)" title="' + s.desc + '">' + s.name + '</span><br><span style="font-size:0.75rem; opacity:0.8;">' + s.desc + '</span></div>';
    html += '<div style="white-space: nowrap; margin-left: 10px;">';
    html += '<button class="role-sub-dec btn" style="padding: 2px 6px;" data-sub="' + skId + '">-</button> ';
    html += '<span style="display: inline-block; width: 1.5rem; text-align: center; font-family:var(--font-mono); font-weight:bold;">' + r + '</span> ';
    html += '<button class="role-sub-inc btn" style="padding: 2px 6px;" data-sub="' + skId + '" data-rem="' + remaining + '">+</button>';
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}

function attachRoleSubSkillEvents() {
  let info = document.getElementById("role_info");
  let decBtns = info.querySelectorAll(".role-sub-dec");
  let incBtns = info.querySelectorAll(".role-sub-inc");
  
  for (let i = 0; i < decBtns.length; i++) {
    decBtns[i].addEventListener("click", function(e) {
      e.preventDefault();
      let sub = this.getAttribute("data-sub");
      if (state.roleSubRanks[sub] && state.roleSubRanks[sub] > 0) {
        state.roleSubRanks[sub]--;
        updateRoleInfo();
      }
    });
  }
  
  for (let i = 0; i < incBtns.length; i++) {
    incBtns[i].addEventListener("click", function(e) {
      e.preventDefault();
      let sub = this.getAttribute("data-sub");
      let rem = parseInt(this.getAttribute("data-rem"));
      if (rem > 0) {
        state.roleSubRanks[sub] = (state.roleSubRanks[sub] || 0) + 1;
        updateRoleInfo();
      }
    });
  }
  
  }

function updateRoleInfo() {
  let roleId = document.getElementById("role_select").value;
  let info = document.getElementById("role_info");
  if (!roleId) { info.innerHTML = ""; return; }
  let role = null, role2 = null;
  for (let i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id === roleId) role = DATA.roles[i];
  }
  let mcEnabled = document.getElementById("multiclass_enabled").checked;
  let role2Id = mcEnabled ? document.getElementById("role_secondary_select").value : "";
  if (role2Id) {
    for (let i = 0; i < DATA.roles.length; i++) {
      if (DATA.roles[i].id === role2Id) role2 = DATA.roles[i];
    }
  }
  let html = "";
  let abilityRank = parseInt(document.getElementById("role_ability_rank").value) || 4;
  let rd = (role && role.rankDesc && role.rankDesc[abilityRank]) ? role.rankDesc[abilityRank] : "";
  html += '<div class="role-ability">Primary: ' + role.ability + ' (Rank ' + abilityRank + ')</div>' +
    '<div style="margin-top:2px;font-size:0.82rem">' + role.desc + '</div>' +
    '<div style="margin-top:1px;font-size:0.78rem;opacity:0.85">' + rd + '</div>';
  if (role && role.subSkills) {
    html += renderRoleSubSkills(role, abilityRank);
  }
  if (role && role.id === "nomad") {
    let veh = getUsedMotoVehicles();
    let upg = getUsedMotoUpgrades();
    let mRank = getMotoRank();
    html += '<div style="margin-top: 5px; font-size: 0.85rem; padding: 5px; border: 1px solid var(--border); border-radius: 4px; background: rgba(0,0,0,0.3);">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:4px;">' +
      '<span>Family Vehicles:</span>' +
      '<span style="font-weight:bold; font-family:var(--font-mono);">' + veh + '</span>' +
      '</div>' +
      '<div style="display: flex; justify-content: space-between; align-items: center;">' +
      '<span>Upgrades:</span>' +
      '<span style="font-weight:bold; font-family:var(--font-mono);">' + upg + '</span>' +
      '</div>' +
      '<div style="text-align:right; margin-top:4px; font-size:0.75rem; color:' + ((veh + upg) === mRank ? 'var(--accent)' : 'var(--text)') + ';">Total Allocated: ' + (veh + upg) + ' / ' + mRank + '</div>' +
      '</div>';
  }
  
  if (role2) {
    let rank2 = parseInt(document.getElementById("role_secondary_rank").value) || 1;
    let rd2 = (role2.rankDesc && role2.rankDesc[rank2]) ? role2.rankDesc[rank2] : "";
    html += '<div class="role-ability" style="margin-top:0.5rem;border-top:1px dashed var(--border);padding-top:0.4rem">Secondary: ' + role2.ability + ' (Rank ' + rank2 + ')</div>' +
      '<div style="margin-top:2px;font-size:0.82rem">' + role2.desc + '</div>' +
      '<div style="margin-top:1px;font-size:0.78rem;opacity:0.85">' + rd2 + '</div>';
    if (role2.subSkills) {
      html += renderRoleSubSkills(role2, rank2);
    }
    if (role2.id === "nomad") {
    let veh = getUsedMotoVehicles();
    let upg = getUsedMotoUpgrades();
    let mRank = getMotoRank();
    html += '<div style="margin-top: 5px; font-size: 0.85rem; padding: 5px; border: 1px solid var(--border); border-radius: 4px; background: rgba(0,0,0,0.3);">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:4px;">' +
      '<span>Family Vehicles:</span>' +
      '<span style="font-weight:bold; font-family:var(--font-mono);">' + veh + '</span>' +
      '</div>' +
      '<div style="display: flex; justify-content: space-between; align-items: center;">' +
      '<span>Upgrades:</span>' +
      '<span style="font-weight:bold; font-family:var(--font-mono);">' + upg + '</span>' +
      '</div>' +
      '<div style="text-align:right; margin-top:4px; font-size:0.75rem; color:' + ((veh + upg) === mRank ? 'var(--accent)' : 'var(--text)') + ';">Total Allocated: ' + (veh + upg) + ' / ' + mRank + '</div>' +
      '</div>';
  }
  }
  info.innerHTML = html;
  attachRoleSubSkillEvents();
}

// ============================================================
// RENDER — All DOM rendering functions
// ============================================================
/**
 * renderStats()
 * Loops through the 10 core stats in DATA.stats and builds the input boxes you see on screen.
 * It also attaches an "onchange" event so that when you type a new number, it saves it
 * to `state.stats` and immediately recalculates your derived stats (like HP and Humanity).
 */
function renderStats() {
  let container = document.getElementById("stats_container");
  container.innerHTML = "";
  for (let i = 0; i < DATA.stats.length; i++) {
    let s = DATA.stats[i];
    let baseVal = state.stats[s.id] || 2;
    let cyberBonus = calcCyberStatBonus(s.id);
    let effVal = baseVal + cyberBonus;
    let bonus = calcStatBonus(effVal);
    let row = document.createElement("div");
    row.className = "stat-row";
    let cyberStr = cyberBonus > 0 ? ' <span class="cyber-stat-bonus">(+' + cyberBonus + ' chrome)</span>' : '';
    row.innerHTML = '<span class="stat-name" title="' + s.desc + '">' + s.name + '</span>' +
      '<button class="stat-dec" data-stat="' + s.id + '">-</button>' +
      '<input type="number" class="stat-input" data-stat="' + s.id + '" value="' + baseVal + '" min="' + STAT_MIN + '" max="' + STAT_MAX + '">' +
      '<button class="stat-inc" data-stat="' + s.id + '">+</button>' +
      '<span class="stat-bonus">(' + (bonus >= 0 ? "+" : "") + bonus + ')</span>' + cyberStr;
    container.appendChild(row);
  }
  updateStatPointsBar();
  attachStatEvents();
}

function attachStatEvents() {
  let incs = document.querySelectorAll(".stat-inc");
  let decs = document.querySelectorAll(".stat-dec");
  let inputs = document.querySelectorAll(".stat-input");
  for (let i = 0; i < incs.length; i++) {
    incs[i].onclick = function() { statChange(this.dataset.stat, 1); };
  }
  for (let i = 0; i < decs.length; i++) {
    decs[i].onclick = function() { statChange(this.dataset.stat, -1); };
  }
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].onchange = function() {
      let id = this.dataset.stat;
      let v = parseInt(this.value) || STAT_MIN;
      if (v < STAT_MIN) v = STAT_MIN;
      if (v > STAT_MAX) v = STAT_MAX;
      state.stats[id] = v;
      renderStats();
      updateAllDerived();
    };
  }
}

function statChange(id, delta) {
  let cur = state.stats[id] || 2;
  let newVal = cur + delta;
  if (newVal < STAT_MIN) return;
  if (newVal > STAT_MAX) return;
  if (delta > 0 && getStatPointsRemaining() <= 0) return;
  state.stats[id] = newVal;
  renderStats();
  updateAllDerived();
}

function updateStatPointsBar() {
  let rem = getStatPointsRemaining();
  document.getElementById("stat_points_remaining").textContent = rem;
  let bar = document.getElementById("stat_points_bar");
  bar.style.opacity = rem < 0 ? "0.6" : "1";
  if (rem === 0) {
    bar.style.display = "none";
  } else {
    bar.style.display = "";
  }
}

/**
 * renderSkills()
 * This massive function builds the entire Skills table. It groups skills by their linked STAT,
 * calculates your total skill base (Stat + Ranks + Cyberware), and builds the + and - buttons.
 */
function renderSkills() {
  let tbody = document.getElementById("skills_body");
  let search = (document.getElementById("skillSearch").value || "").toLowerCase();
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  let statKeys = Object.keys(DATA.skills);
  for (let si = 0; si < statKeys.length; si++) {
    let statId = statKeys[si];
    let skillList = DATA.skills[statId];
    for (let j = 0; j < skillList.length; j++) {
        let skill = skillList[j];
        let name = skill.name;
        if (skill.ipMult === 2) name += ' <span style="color:var(--accent);font-size:0.75rem;font-weight:bold">(x2)</span>';
        if (search && name.toLowerCase().indexOf(search) === -1) continue;
        
        let statVal = getEffectiveStat(statId);
        let cyber = calcSkillCyberBonus(skill.id);
        
        if (skill.subs) {
          let trHeader = document.createElement("tr");
          trHeader.innerHTML = '<td><strong>' + name + '</strong></td>' +
            '<td>' + statId.toUpperCase() + '</td>' +
            '<td colspan="5"></td>';
          frag.appendChild(trHeader);
          
          for (let s = 1; s <= skill.subs; s++) {
            let subId = skill.id + "_" + s;
            let subName = state.subSkillNames ? (state.subSkillNames[subId] || "") : "";
            let ranks = state.skillRanks[subId] || 0;
            let item = state.skillItem[subId] || 0;
            let total = calcSkillTotal(statVal, ranks, item, cyber);
            let tr = document.createElement("tr");
            tr.innerHTML = '<td style="padding-left: 20px;"><input type="text" class="subskill-name" data-sub="' + subId + '" value="' + subName + '" placeholder="Specify..." style="width:120px"></td>' +
              '<td></td>' +
              '<td>' + calcStatBonus(statVal) + '</td>' +
              '<td><input type="number" class="skill-rank" data-skill="' + subId + '" value="' + ranks + '" min="0" max="10" style="width:50px"></td>' +
              '<td><input type="number" class="skill-item" data-skill="' + subId + '" value="' + item + '" style="width:50px"></td>' +
              '<td>' + (cyber > 0 ? '+' + cyber : '0') + '</td>' +
              '<td><strong>' + (total >= 0 ? "+" : "") + total + '</strong></td>';
            frag.appendChild(tr);
          }
        } else {
          let ranks = state.skillRanks[skill.id] || 0;
          let item = state.skillItem[skill.id] || 0;
          let total = calcSkillTotal(statVal, ranks, item, cyber);
          let tr = document.createElement("tr");
          tr.innerHTML = '<td>' + name + '</td>' +
            '<td>' + statId.toUpperCase() + '</td>' +
            '<td>' + calcStatBonus(statVal) + '</td>' +
            '<td><input type="number" class="skill-rank" data-skill="' + skill.id + '" value="' + ranks + '" min="0" max="10" style="width:50px"></td>' +
            '<td><input type="number" class="skill-item" data-skill="' + skill.id + '" value="' + item + '" style="width:50px"></td>' +
            '<td>' + (cyber > 0 ? '+' + cyber : '0') + '</td>' +
            '<td><strong>' + (total >= 0 ? "+" : "") + total + '</strong></td>';
          frag.appendChild(tr);
        }
      }
  }
  tbody.appendChild(frag);
  attachSkillEvents();
}

function getSkillIpBase(skillId) {
  let idxItem = DATA._index.skillById[skillId];
  if (idxItem) {
    return (idxItem.skill.ipMult || 1) * 20;
  }
  return 20;
}

function ipCostBetween(oldRank, newRank, baseCost) {
  return baseCost * (newRank * (newRank + 1) / 2 - oldRank * (oldRank + 1) / 2);
}

function payIpCost(cost) {
  let ipEl = document.getElementById("char_ip");
  let cur = parseInt(ipEl.value) || 0;
  if (cur - cost < 0) return false;
  ipEl.value = cur - cost;
  return true;
}

function calcCreationPointsUsed() {
    let total = 0;
    let languageFreePointsUsed = 0;
    
    for (let sid in state.skillRanks) {
      let baseId = sid;
      let match = sid.match(/^(.+)_(\d+)$/);
      if (match) baseId = match[1];
      
      let item = DATA._index.skillById[baseId];
      if (!item) continue;
      
      let r = parseInt(state.skillRanks[sid]) || 0;
      let mult = item.skill.ipMult || 1;
      
      if (baseId === "language") {
        let freeAvailable = Math.max(0, 4 - languageFreePointsUsed);
        let freeUsed = Math.min(r, freeAvailable);
        languageFreePointsUsed += freeUsed;
        
        let chargeableRanks = r - freeUsed;
        total += chargeableRanks * mult;
      } else {
        total += r * mult;
      }
    }
    return total;
}

function updateCreationPoints() {
  const el = document.getElementById("creation_points_val");
  if (el) {
    let used = calcCreationPointsUsed();
    el.textContent = 86 - used;
  }
}

function toggleCreationMode(enabled) {
  state.creationMode = enabled;
  const disp = document.getElementById("creation_points_display");
  if (disp) disp.style.display = enabled ? "inline-block" : "none";
  
  if (enabled) {
      for (const group in DATA.skills) {
        for (const skill of DATA.skills[group]) {
          if (skill.basic) {
            let targetId = skill.subs ? skill.id + "_1" : skill.id;
            if ((state.skillRanks[targetId] || 0) < 2) {
              state.skillRanks[targetId] = 2;
            }
          }
          if (skill.id === "language") {
            if ((state.skillRanks["language_1"] || 0) < 4) {
              state.skillRanks["language_1"] = 4;
            }
          }
        }
      }
    updateCreationPoints();
    renderSkills();
  } else {
    renderSkills();
  }
}

function updateSkillRow(id) {
  let baseId = id;
  let match = id.match(/^(.+)_(\d+)$/);
  if (match) baseId = match[1];
  
  let idxItem = DATA._index.skillById[baseId];
  if (!idxItem) return;
  let statId = idxItem.statId;
  let ranks = state.skillRanks[id] || 0;
  let item = state.skillItem[id] || 0;
  let statVal = getEffectiveStat(statId);
  let cyber = calcSkillCyberBonus(baseId);
  let total = calcSkillTotal(statVal, ranks, item, cyber);
  
  let input = document.querySelector('.skill-rank[data-skill="' + id + '"]');
  if (input) {
    let tr = input.closest('tr');
    if (tr) {
      let tds = tr.querySelectorAll('td');
      if (tds.length >= 7) {
        tds[6].innerHTML = '<strong>' + (total >= 0 ? "+" : "") + total + '</strong>';
      }
    }
  }
  try {
    renderWeapons();
  } catch(e) {
    console.error("renderWeapons in updateSkillRow crashed", e);
  }
}

function attachSkillEvents() {
    let subnames = document.querySelectorAll(".subskill-name");
    for (let i = 0; i < subnames.length; i++) {
      subnames[i].oninput = function() {
        if (!state.subSkillNames) state.subSkillNames = {};
        state.subSkillNames[this.dataset.sub] = this.value;
      };
      subnames[i].onchange = function() {
        if (!state.subSkillNames) state.subSkillNames = {};
        state.subSkillNames[this.dataset.sub] = this.value;
      };
    }
    let ranks = document.querySelectorAll(".skill-rank");
  let items = document.querySelectorAll(".skill-item");
  for (let i = 0; i < ranks.length; i++) {
    let input = ranks[i];
    input.dataset.oldVal = input.value;
    input.onchange = function() {
      let id = this.dataset.skill;
      let oldVal = parseInt(this.dataset.oldVal) || 0;
      let newVal = parseInt(this.value) || 0;
      if (newVal === oldVal) return;
      
      if (state.creationMode) {
        let baseId = id;
          let match = id.match(/^(.+)_(\d+)$/);
          if (match) baseId = match[1];
          let idxItem = DATA._index.skillById[baseId];
          let isBasic = idxItem && idxItem.skill && idxItem.skill.basic;
        
        if (newVal > 6) {
          alert("Skills cannot exceed Rank 6 during character creation.");
          this.value = oldVal;
          return;
        }
        if (isBasic && newVal < 2 && (!match || id.endsWith("_1"))) {
          alert("Basic skills must be at least Rank 2.");
          this.value = oldVal;
          return;
        }
        if (baseId === "language" && id === "language_1" && newVal < 4) {
          alert("Language skill gets 4 free ranks and cannot be below 4.");
          this.value = oldVal;
          return;
        }
        
        state.skillRanks[id] = newVal;
        if (calcCreationPointsUsed() > 86) {
          alert("Not enough Starting Points! (Max 86)");
          state.skillRanks[id] = oldVal;
          this.value = oldVal;
          return;
        }
        
        this.dataset.oldVal = newVal;
        updateCreationPoints();
        updateSkillRow(id);
        return;
      }
      
      let base = getSkillIpBase(id);
      let cost = ipCostBetween(oldVal, newVal, base);
      if (cost > 0 && !payIpCost(cost)) {
        alert("Not enough Improvement Points! Need " + cost + " IP.");
        this.value = oldVal;
        return;
      }
      if (cost < 0) payIpCost(cost);
      state.skillRanks[id] = newVal;
      this.dataset.oldVal = newVal;
      updateSkillRow(id);
    };
  }
  for (let i = 0; i < items.length; i++) {
    items[i].onchange = function() {
      let id = this.dataset.skill;
      state.skillItem[id] = parseInt(this.value) || 0;
      updateSkillRow(id);
    };
  }
}

/**
 * renderHealth()
 * Recalculates and displays your Hit Points based on your BODY and WILL stats.
 * It also determines your "Seriously Wounded" threshold and Death Save number.
 */
function renderHealth() {
  let body = state.stats.body || 2;
  let will = state.stats.will || 2;
  let hpMax = calcHitsMax(body, will);
  document.getElementById("hp_max").value = hpMax;
  document.getElementById("hp_seriously").value = calcSeriouslyWounded(hpMax);
  document.getElementById("hp_death").value = calcDeathSave(body);
  let cur = document.getElementById("hp_current");
  if (!cur.value || parseInt(cur.value) === 0) cur.value = hpMax;
}

function renderHumanity() {
  let emp = state.stats.emp || 2;
  let humMax = calcHumanityMax(emp);
  let hcTotal = totalCyberwareHC(state.cyberware);
  let humCur = calcCurrentHumanity(humMax, hcTotal);
  let empFromHum = calcEmpFromHumanity(humCur);
  document.getElementById("hum_max").value = humMax;
  document.getElementById("hum_hc_total").value = hcTotal;
  document.getElementById("hum_current").value = humCur;
  document.getElementById("hum_emp").value = empFromHum;
}

function renderWeapons() {
  let tbody = document.getElementById("weapons_body");
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();

  const weaponSkillMapping = {
    "Handgun": { stat: "ref", skill: "handgun" },
    "Shoulder Arms": { stat: "ref", skill: "shoulder_arms" },
    "Heavy Weapons": { stat: "ref", skill: "heavy_weapons" },
    "Archery": { stat: "ref", skill: "archery" },
    "Autofire": { stat: "ref", skill: "autofire" },
    "Melee Weapon": { stat: "dex", skill: "melee_weapon" },
    "Brawling": { stat: "dex", skill: "brawling" },
    "Martial Arts": { stat: "dex", skill: "martial_arts" },
    "Athletics": { stat: "dex", skill: "athletics" }
  };

  for (let i = 0; i < state.weapons.length; i++) {
    let w = state.weapons[i];
    let tr = document.createElement("tr");
    let isGrenade = /grenade|molotov|smoke_pellet/.test(w.id);
    let actionBtns;
    if (isGrenade) {
      actionBtns = '<button class="btn-action weapon-sell" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">Sell</button> <button class="btn-action weapon-use" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">Use</button>';
    } else {
      actionBtns = '<button class="btn-action weapon-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button>';
    }
    
    let skillTotal = "-";
    if (w.type && weaponSkillMapping[w.type]) {
      let map = weaponSkillMapping[w.type];
      let statVal = getEffectiveStat(map.stat);
      let ranks = state.skillRanks[map.skill] || 0;
      let item = state.skillItem[map.skill] || 0;
      let cyber = calcSkillCyberBonus(map.skill);
      let total = calcSkillTotal(statVal, ranks, item, cyber);
      skillTotal = (total >= 0 ? "+" : "") + total;
    }

    tr.innerHTML = '<td>' + w.name + '</td><td>' + w.dmg + '</td><td>' + (w.rof || "-") + '</td><td>' + (w.mag || "-") + '</td><td>' + (w.type || "") + '</td><td style="text-align:center; font-weight:bold">' + skillTotal + '</td><td>' + actionBtns + '</td>';
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
  attachWeaponEvents();
}

function attachWeaponEvents() {
  let removes = document.querySelectorAll(".weapon-remove");
  for (let i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let w = state.weapons[idx];
      let sellInput = prompt("Sell price in eb (0 = discard):", w.cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.weapons.splice(idx, 1);
      renderWeapons();
    };
  }
  let sells = document.querySelectorAll(".weapon-sell");
  for (let i = 0; i < sells.length; i++) {
    sells[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let w = state.weapons[idx];
      let sellInput = prompt("Sell price in eb:", w.cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.weapons.splice(idx, 1);
      renderWeapons();
    };
  }
  let uses = document.querySelectorAll(".weapon-use");
  for (let i = 0; i < uses.length; i++) {
    uses[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      state.weapons.splice(idx, 1);
      renderWeapons();
    };
  }
}

function renderArmor() {
  let tbody = document.getElementById("armor_body");
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  let bodySP = 0;
  let headSP = 0;
  for (let i = 0; i < state.armor.length; i++) {
    let a = state.armor[i];
    let tr = document.createElement("tr");
    tr.innerHTML = '<td>' + a.name + '</td><td>' + a.sp + '</td><td>' + a.slots + '</td><td>' + a.enc + '</td><td><button class="btn-action armor-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
    frag.appendChild(tr);
    if (a.slots === "Body") bodySP = Math.max(bodySP, a.sp);
    if (a.slots === "Head") headSP = Math.max(headSP, a.sp);
    if (a.slots === "Shield") bodySP = Math.max(bodySP, a.sp);
  }
  tbody.appendChild(frag);
  document.getElementById("armor_total_sp_body").textContent = bodySP;
  document.getElementById("armor_total_sp_head").textContent = headSP;
  let removes = document.querySelectorAll(".armor-remove");
  for (let i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let sellInput = prompt("Sell price in eb (0 = discard):", state.armor[idx].cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.armor.splice(idx, 1);
      renderArmor();
      renderHumanity();
    };
  }
}

/**
 * renderCyberware()
 * Builds the Cyberware table. This function is particularly complex because it 
 * handles "slots" (e.g., a Cybereye has 3 slots for options like Anti-Dazzle or Infrared).
 * It uses a recursive helper function `renderCyberwareSlot` to draw options inside options.
 */
function renderCyberware() {
  let tbody = document.getElementById("cyberware_body");
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  for (let i = 0; i < state.cyberware.length; i++) {
    let c = state.cyberware[i];
    if (c.slots) {
      renderCyberwareRow(frag, c, i, true);
      for (let s = 0; s < c.slots; s++) {
        renderCyberwareSlot(frag, c, i.toString(), s, 0);
      }
    } else {
      renderCyberwareRow(frag, c, i, false);
    }
  }
  tbody.appendChild(frag);
  attachCyberwareEvents();
}

function renderCyberwareRow(tbody, c, idx) {
  let tr = document.createElement("tr");
  let bonusHtml = formatCyberBonus(c.bonus);
  let displayName = c.name;
  if (c.location && !displayName.includes('(' + c.location + ')')) {
    displayName += ' (' + c.location + ')';
  }
  tr.innerHTML = '<td>' + displayName + '</td><td>' + c.type + '</td><td>' + (c.hc || 0) + '</td><td>' + (c.cost || 0) + 'eb</td><td><small>' + bonusHtml + '</small></td><td><small>' + (c.desc || '') + '</small></td><td><button class="btn-action cyberware-remove" data-idx="' + idx + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
  tbody.appendChild(tr);
}

function renderCyberwareSlot(tbody, parent, parentPath, slotIdx, depth) {
  let option = (parent.options && parent.options[slotIdx]) || null;
  let available = getOptionsForParent(parent.id);
  if (available.length === 0) {
    let parentDataItem = getDataItemById(parent.id);
    if (parentDataItem && parentDataItem.parentType) {
      available = getOptionsForParent(parentDataItem.parentType);
    }
  }
  let tr = document.createElement("tr");
  tr.style.background = "rgba(128,128,128,0.05)";
  tr.style.fontSize = "0.85rem";
  if (!option) tr.className = "cyber-slot-empty";
  
  let currentPath = parentPath + "_" + slotIdx;
  
  let selectHtml = '<select class="cyber-slot-select" data-path="' + currentPath + '" style="width:100%;font-size:0.8rem">';
  selectHtml += '<option value="">-- Empty --</option>';
  for (let oi = 0; oi < available.length; oi++) {
    let opt = available[oi];
    let sel = (option && option.id === opt.id) ? ' selected' : '';
    selectHtml += '<option value="' + opt.id + '"' + sel + '>' + opt.name + ' (' + opt.cost + 'eb, ' + (opt.hc || 0) + 'HC)' + '</option>';
  }
  
  // Custom option if it's already selected as custom or to allow selecting custom
  let customSel = (option && option.id && option.id.startsWith("custom_")) ? ' selected' : '';
  if (option && option.id && option.id.startsWith("custom_")) {
    selectHtml += '<option value="' + option.id + '"' + customSel + '>' + option.name + ' (' + option.cost + 'eb, ' + (option.hc || 0) + 'HC) [Custom]</option>';
  }
  selectHtml += '<option value="custom">-- Custom Option --</option>';
  
  selectHtml += '</select>';
  
  let indent = 1.5 + (depth * 1.5);
  tr.innerHTML = '<td style="padding-left:' + indent + 'rem;border-top:none" colspan="6">Slot ' + (slotIdx + 1) + ': ' + selectHtml + '</td><td style="border-top:none"></td>';
  tbody.appendChild(tr);

  if (option) {
    let optBase = getDataItemById(option.id);
    if (optBase && optBase.slots > 0) {
      for (let s = 0; s < optBase.slots; s++) {
        renderCyberwareSlot(tbody, option, currentPath, s, depth + 1);
      }
    }
  }
}

function getOptionsForParent(parentId) {
  return DATA._index.cyberwareByParent[parentId] || [];
}

function attachCyberwareEvents() {
  let removes = document.querySelectorAll(".cyberware-remove");
  for (let i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let sellInput = prompt("Sell price in eb (0 = discard):", state.cyberware[idx].cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.cyberware.splice(idx, 1);
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
    };
  }
  let selects = document.querySelectorAll(".cyber-slot-select");
  for (let i = 0; i < selects.length; i++) {
    selects[i].onclick = function(e) { e.stopPropagation(); };
    selects[i].onchange = function() {
      let path = this.dataset.path.split('_');
      let rootIdx = parseInt(path[0]);
      let optionId = this.value;
      
      let parentObj = state.cyberware[rootIdx];
      if (!parentObj) return;
      
      let currentObj = parentObj;
      for (let p = 1; p < path.length - 1; p++) {
        let sIdx = parseInt(path[p]);
        if (!currentObj.options) currentObj.options = [];
        if (!currentObj.options[sIdx]) currentObj.options[sIdx] = {};
        currentObj = currentObj.options[sIdx];
      }
      
      let slotIdx = parseInt(path[path.length - 1]);
      if (!currentObj.options) currentObj.options = [];
      
      let oldOption = currentObj.options[slotIdx] || null;
      let oldCost = oldOption ? (oldOption.cost || 0) : 0;
      
      if (optionId === "custom") {
        let name = prompt("Custom Option Name:");
        if (!name) { this.value = oldOption ? oldOption.id : ''; return; }
        let cType = prompt("Type (Fashion, Internal, Neuralware, etc.):") || "Option";
        let hc = parseInt(prompt("Humanity Cost:") || "0");
        let cost = parseInt(prompt("Cost in eb:") || "0");
        let desc = prompt("Description:") || "";
        let slots = parseInt(prompt("Does this option have slots itself? (0 for none):") || "0");
        currentObj.options[slotIdx] = { id: "custom_" + Date.now(), name: name, type: cType, hc: hc, cost: cost, desc: desc, bonus: null, slots: slots > 0 ? slots : undefined };
      } else if (optionId && !optionId.startsWith("custom_")) {
        let item = getDataItemById(optionId);
        if (item) {
          let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
          if (costInput === null) { this.value = oldOption ? oldOption.id : ''; return; }
          let actualCost = parseInt(costInput) || 0;
          let actualHc = item.hc || 0;
          if (actualHc > 0) {
            let hcInput = prompt("Humanity Cost for " + item.name + "\n(Enter value, or 'r' to roll randomly)", actualHc);
            if (hcInput !== null) {
              if (hcInput.toLowerCase().trim() === 'r') {
                actualHc = rollCyberwareHC(item.hc);
                alert("Rolled Humanity Cost: " + actualHc);
              } else {
                actualHc = parseInt(hcInput) || 0;
              }
            }
          }
          currentObj.options[slotIdx] = { id: item.id, name: item.name, hc: actualHc, cost: actualCost, desc: item.desc || '', bonus: item.bonus || null, parentType: item.parentType, slots: item.slots };
        }
      } else if (optionId && optionId.startsWith("custom_")) {
        // If they just selected the existing custom option from the list (which shouldn't happen naturally unless we are re-rendering)
        // We don't need to do anything, because it was already set.
      } else {
        let sellInput = prompt("Sell price in eb (0 = discard):", oldCost);
        if (sellInput === null) { this.value = oldOption ? oldOption.id : ''; return; }
        let sellPrice = parseInt(sellInput) || 0;
        let el = document.getElementById("currency_eb");
        el.value = (parseInt(el.value) || 0) + sellPrice;
        oldCost = 0;
        currentObj.options[slotIdx] = null;
      }
      
      let newOption = currentObj.options[slotIdx] || null;
      let newCost = newOption ? (newOption.cost || 0) : 0;
      let diff = newCost - oldCost;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - diff;
      
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
      updateAllDerived();
    };
  }
}

function rollCyberwareHC(avgHc) {
  if (!avgHc) return 0;
  function r() { return Math.floor(Math.random() * 6) + 1; }
  if (avgHc === 14 || avgHc === 4) return r() + r() + r() + r();
  if (avgHc === 7) return r() + r();
  if (avgHc === 3) return r();
  if (avgHc === 2) return Math.ceil(r() / 2);
  if (avgHc === 1) return 1;
  return avgHc;
}

function getDataItemById(id) {
  return DATA._index.cyberwareById[id] || null;
}


function renderVehicles() {
  let tbody = document.getElementById("vehicles_body");
  if (!tbody) return;
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  for (let i = 0; i < state.vehicles.length; i++) {
    let v = state.vehicles[i];
    let tr = document.createElement("tr");
    tr.innerHTML = "<td>" + v.name + "</td>" +
                   "<td>" + v.sdp + "</td>" +
                   "<td>" + v.seats + "</td>" +
                   "<td>" + v.cost + "eb</td>" +
                   "<td style='font-size:0.8rem'>" + v.desc + "</td>" +
                   "<td><button class='btn-action add-v-upgrade' data-idx='" + i + "' style='font-size:0.75rem;padding:0.2rem 0.4rem;margin-right:0.3rem'>+ Upg</button>" +
                   "<button class='btn-action sell-vehicle' data-idx='" + i + "' style='font-size:0.75rem;padding:0.2rem 0.4rem;margin-right:0.3rem'>Sell</button>" +
                   "<button class='btn-action remove-vehicle' data-idx='" + i + "' style='font-size:0.75rem;padding:0.2rem 0.4rem'>X</button></td>";
    frag.appendChild(tr);
    if (v.upgrades && v.upgrades.length > 0) {
      for (let j = 0; j < v.upgrades.length; j++) {
        let u = v.upgrades[j];
        let utr = document.createElement("tr");
        utr.style.background = "rgba(128,128,128,0.05)";
        utr.style.fontSize = "0.85rem";
        utr.innerHTML = "<td style='padding-left:2rem;border-top:none'>↳ " + u.name + "</td>" +
                        "<td style='border-top:none' colspan='2'></td>" +
                        "<td style='border-top:none'>" + u.cost + "eb</td>" +
                        "<td style='border-top:none'>" + u.desc + "</td>" +
                        "<td style='border-top:none'><button class='btn-action sell-v-upgrade' data-vidx='" + i + "' data-uidx='" + j + "' style='font-size:0.75rem;padding:0.2rem 0.4rem;margin-right:0.3rem'>Sell</button>" +
                        "<button class='btn-action remove-v-upgrade' data-vidx='" + i + "' data-uidx='" + j + "' style='font-size:0.75rem;padding:0.2rem 0.4rem'>X</button></td>";
        frag.appendChild(utr);
      }
    }
  }
  tbody.appendChild(frag);

  let vSells = tbody.querySelectorAll(".sell-vehicle");
  for (let i = 0; i < vSells.length; i++) {
    vSells[i].onclick = async function() {
      let idx = parseInt(this.dataset.idx);
      let v = state.vehicles[idx];
      let sellInput = prompt("Sell price in eb (0 = discard):", v.cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.vehicles.splice(idx, 1);
      renderVehicles();
      updateRoleInfo();
      updateRoleInfo();
    };
  }

  let uSells = tbody.querySelectorAll(".sell-v-upgrade");
  for (let i = 0; i < uSells.length; i++) {
    uSells[i].onclick = async function() {
      let vIdx = parseInt(this.dataset.vidx);
      let uIdx = parseInt(this.dataset.uidx);
      let u = state.vehicles[vIdx].upgrades[uIdx];
      let sellInput = prompt("Sell price in eb (0 = discard):", u.cost || 0);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      state.vehicles[vIdx].upgrades.splice(uIdx, 1);
      renderVehicles();
      updateRoleInfo();
      updateRoleInfo();
    };
  }

  let rms = tbody.querySelectorAll(".remove-vehicle");
  for (let i = 0; i < rms.length; i++) {
    rms[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      state.vehicles.splice(idx, 1);
      renderVehicles();
      updateRoleInfo();
    };
  }

  let rmUs = tbody.querySelectorAll(".remove-v-upgrade");
  for (let i = 0; i < rmUs.length; i++) {
    rmUs[i].onclick = function() {
      let vIdx = parseInt(this.dataset.vidx);
      let uIdx = parseInt(this.dataset.uidx);
      state.vehicles[vIdx].upgrades.splice(uIdx, 1);
      renderVehicles();
      updateRoleInfo();
    };
  }

  let addUpgs = tbody.querySelectorAll(".add-v-upgrade");
  for (let i = 0; i < addUpgs.length; i++) {
    addUpgs[i].onclick = function() {
      let vIdx = parseInt(this.dataset.idx);
      showItemSelector("vehicleUpgrade", DATA.vehicleUpgrades, async function(item) {
        let isFree = false;
        let motoRank = getMotoRank();
        let usedMoto = getUsedMotoCount();
        if (motoRank > 0 && usedMoto < motoRank) {
          isFree = await customConfirm(`Is this upgrade free (from Nomad Moto ability)?\nYou have used ${usedMoto}/${motoRank} Moto choices.`);
        }
        let cost = 0;
        if (!isFree) {
          let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
          if (costInput === null) return;
          cost = parseInt(costInput) || 0;
        }
        if (!state.vehicles[vIdx].upgrades) state.vehicles[vIdx].upgrades = [];
        state.vehicles[vIdx].upgrades.push({ id: item.id, name: item.name, cost: cost, isMoto: isFree, desc: item.desc });
        if (!isFree) {
          let cel = document.getElementById("currency_eb");
          cel.value = (parseInt(cel.value) || 0) - cost;
        }
        renderVehicles();
        updateRoleInfo();
      });
    };
  }
}

function renderGear() {
  let tbody = document.getElementById("gear_body");
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  let consumableCats = ["Street Drug", "Pharmaceutical", "Additive", "Medical"];
  for (let i = 0; i < state.gear.length; i++) {
    let g = state.gear[i];
    let tr = document.createElement("tr");
    let isConsumable = consumableCats.indexOf(g.cat) !== -1 || g.ammo;
    let actionBtns;
    if (isConsumable) {
      actionBtns = '<button class="btn-action gear-sell" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">Sell</button> <button class="btn-action gear-use" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">Use</button>';
    } else {
      actionBtns = '<button class="btn-action gear-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button>';
    }
    tr.innerHTML = '<td>' + g.name + '</td><td>' + (g.cat || "-") + '</td><td>' + g.cost + 'eb</td><td><input type="number" class="gear-qty" data-idx="' + i + '" value="' + (g.qty || 1) + '" min="1" style="width:45px"></td><td><small>' + (g.desc || "") + '</small></td><td>' + actionBtns + '</td>';
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
  let removes = document.querySelectorAll(".gear-remove");
  let qtys = document.querySelectorAll(".gear-qty");
  for (let i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let g = state.gear[idx];
      let totalCost = (g.cost || 0) * (g.qty || 1);
      let sellInput = prompt("Sell price in eb (0 = discard):", totalCost);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      if (g.ammo && state.ammo[g.id]) {
        state.ammo[g.id].total -= g.ammo * (g.qty || 1);
        if (state.ammo[g.id].total <= 0) delete state.ammo[g.id];
      }
      state.gear.splice(idx, 1);
      renderGear();
      renderAmmoTracker();
    };
  }
  let gearSells = document.querySelectorAll(".gear-sell");
  for (let i = 0; i < gearSells.length; i++) {
    gearSells[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let g = state.gear[idx];
      let totalCost = (g.cost || 0) * (g.qty || 1);
      let sellInput = prompt("Sell price in eb:", totalCost);
      if (sellInput === null) return;
      let sellPrice = parseInt(sellInput) || 0;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) + sellPrice;
      if (g.ammo && state.ammo[g.id]) {
        state.ammo[g.id].total -= g.ammo * (g.qty || 1);
        if (state.ammo[g.id].total <= 0) delete state.ammo[g.id];
      }
      state.gear.splice(idx, 1);
      renderGear();
      renderAmmoTracker();
    };
  }
  let gearUses = document.querySelectorAll(".gear-use");
  for (let i = 0; i < gearUses.length; i++) {
    gearUses[i].onclick = function() {
      let idx = parseInt(this.dataset.idx);
      let g = state.gear[idx];
      if (g.ammo && state.ammo[g.id]) {
        state.ammo[g.id].total -= g.ammo * (g.qty || 1);
        if (state.ammo[g.id].total <= 0) delete state.ammo[g.id];
      }
      state.gear.splice(idx, 1);
      renderGear();
      renderAmmoTracker();
    };
  }
  for (let i = 0; i < qtys.length; i++) {
    qtys[i].onchange = function() {
      let idx = parseInt(this.dataset.idx);
      let g = state.gear[idx];
      let oldQty = g.qty || 1;
      let newQty = parseInt(this.value) || 1;
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - (newQty - oldQty) * (g.cost || 0);
      if (g.ammo && state.ammo[g.id]) {
        state.ammo[g.id].total += g.ammo * (newQty - oldQty);
        if (state.ammo[g.id].total <= 0) delete state.ammo[g.id];
      }
      g.qty = newQty;
      renderAmmoTracker();
    };
  }
}

function renderAmmoTracker() {
  let tbody = document.getElementById("ammo_body");
  if (!tbody) return;
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  let ammoIds = Object.keys(state.ammo);
  for (let i = 0; i < ammoIds.length; i++) {
    let id = ammoIds[i];
    let entry = state.ammo[id];
    if (!entry || entry.total <= 0) continue;
    let tr = document.createElement("tr");
    tr.innerHTML = '<td>' + entry.name + '</td><td>' + entry.perBundle + '</td><td><strong>' + entry.total + '</strong></td><td><input type="number" class="ammo-use-qty" data-ammo="' + id + '" value="1" min="1" max="' + entry.total + '" style="width:55px"> <button class="btn-action ammo-use-btn" data-ammo="' + id + '" style="font-size:0.75rem;padding:0.2rem 0.5rem">Use</button></td>';
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
  if (tbody.children.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;opacity:0.5">No ammunition purchased. Add ammo from the Gear tab.</td></tr>';
  }
  attachAmmoEvents();
}

function attachAmmoEvents() {
  let btns = document.querySelectorAll(".ammo-use-btn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function() {
      let ammoId = this.dataset.ammo;
      let input = document.querySelector('.ammo-use-qty[data-ammo="' + ammoId + '"]');
      let qty = parseInt(input.value) || 1;
      if (!state.ammo[ammoId]) return;
      if (qty > state.ammo[ammoId].total) qty = state.ammo[ammoId].total;
      if (qty <= 0) return;
      state.ammo[ammoId].total -= qty;
      if (state.ammo[ammoId].total <= 0) {
        delete state.ammo[ammoId];
        for (let j = 0; j < state.gear.length; j++) {
          if (state.gear[j].id === ammoId) {
            state.gear.splice(j, 1);
            break;
          }
        }
        renderGear();
      }
      renderAmmoTracker();
    };
  }
}

const LP_FIELDS = [
  "culturalOrigins", "personality", "clothingStyle", "hairstyle", 
  "affectation", "valueMost", "feelAboutPeople", "valuedPerson", 
  "valuedPossession", "familyBackground", "childhoodEnvironment", 
  "familyCrisis", "lifeGoals"
];

function initLifepath() {
  for (let i = 0; i < LP_FIELDS.length; i++) {
    let key = LP_FIELDS[i];
    let sel = document.getElementById("lp_" + key);
    if (!sel) continue;
    sel.innerHTML = '<option value="">-- Choose --</option>';
    let items = DATA.lifepath[key];
    for (let j = 0; j < items.length; j++) {
      let opt = document.createElement("option");
      opt.value = items[j];
      opt.textContent = items[j];
      sel.appendChild(opt);
    }
  }
  document.getElementById("lp_random_btn").onclick = randomLifepath;
  
  document.getElementById("add_lp_friend_btn").onclick = function() {
    state.lifepath.friends.push("");
    renderLifepathLists();
  };
  document.getElementById("add_lp_enemy_btn").onclick = function() {
    state.lifepath.enemies.push({ who: "", cause: "", force: "", revenge: "" });
    renderLifepathLists();
  };
  document.getElementById("add_lp_lover_btn").onclick = function() {
    state.lifepath.lovers.push("");
    renderLifepathLists();
  };
  
  renderLifepathLists();
}

function renderLifepathLists() {
  // Friends
  let fc = document.getElementById("lp_friends_container");
  if(fc) {
    let fhtml = "";
    for(let i=0; i<state.lifepath.friends.length; i++) {
       fhtml += `<div style="display:flex; gap:0.5rem">
          <select class="lp-friend-sel" data-idx="${i}" style="flex:1">
             <option value="">-- Relationship --</option>
             ${DATA.lifepath.friendRelationships.map(x => `<option value="${x}" ${state.lifepath.friends[i]===x?'selected':''}>${x}</option>`).join('')}
          </select>
          <button class="btn-action" onclick="removeLifepathItem('friends', ${i})">X</button>
       </div>`;
    }
    fc.innerHTML = fhtml;
    let fsels = fc.querySelectorAll('.lp-friend-sel');
    fsels.forEach(s => s.onchange = function() { state.lifepath.friends[this.dataset.idx] = this.value; });
  }

  // Enemies
  let ec = document.getElementById("lp_enemies_container");
  if(ec) {
    let ehtml = "";
    for(let i=0; i<state.lifepath.enemies.length; i++) {
       let e = state.lifepath.enemies[i];
       ehtml += `<div style="display:flex; flex-direction:column; gap:0.2rem; border-left:2px solid var(--accent); padding-left:0.5rem; margin-bottom:0.5rem">
          <div style="display:flex; justify-content:space-between">
             <select class="lp-enemy-sel" data-idx="${i}" data-key="who" style="width:calc(100% - 30px)">
               <option value="">-- Who --</option>
               ${DATA.lifepath.enemyTypes.map(x => `<option value="${x}" ${e.who===x?'selected':''}>${x}</option>`).join('')}
             </select>
             <button class="btn-action" onclick="removeLifepathItem('enemies', ${i})">X</button>
          </div>
          <select class="lp-enemy-sel" data-idx="${i}" data-key="cause"><option value="">-- Cause --</option>${DATA.lifepath.enemyCauses.map(x => `<option value="${x}" ${e.cause===x?'selected':''}>${x}</option>`).join('')}</select>
          <select class="lp-enemy-sel" data-idx="${i}" data-key="force"><option value="">-- Forces --</option>${DATA.lifepath.enemyForces.map(x => `<option value="${x}" ${e.force===x?'selected':''}>${x}</option>`).join('')}</select>
          <select class="lp-enemy-sel" data-idx="${i}" data-key="revenge"><option value="">-- Revenge --</option>${DATA.lifepath.enemyRevenge.map(x => `<option value="${x}" ${e.revenge===x?'selected':''}>${x}</option>`).join('')}</select>
       </div>`;
    }
    ec.innerHTML = ehtml;
    let esels = ec.querySelectorAll('.lp-enemy-sel');
    esels.forEach(s => s.onchange = function() { state.lifepath.enemies[this.dataset.idx][this.dataset.key] = this.value; });
  }

  // Lovers
  let lc = document.getElementById("lp_lovers_container");
  if(lc) {
    let lhtml = "";
    for(let i=0; i<state.lifepath.lovers.length; i++) {
       lhtml += `<div style="display:flex; gap:0.5rem">
          <select class="lp-lover-sel" data-idx="${i}" style="flex:1">
             <option value="">-- What Happened --</option>
             ${DATA.lifepath.loveTragedies.map(x => `<option value="${x}" ${state.lifepath.lovers[i]===x?'selected':''}>${x}</option>`).join('')}
          </select>
          <button class="btn-action" onclick="removeLifepathItem('lovers', ${i})">X</button>
       </div>`;
    }
    lc.innerHTML = lhtml;
    let lsels = lc.querySelectorAll('.lp-lover-sel');
    lsels.forEach(s => s.onchange = function() { state.lifepath.lovers[this.dataset.idx] = this.value; });
  }
}

function removeLifepathItem(type, idx) {
  state.lifepath[type].splice(idx, 1);
  renderLifepathLists();
}

function randomLifepath() {
  for (let i = 0; i < LP_FIELDS.length; i++) {
    let key = LP_FIELDS[i];
    let sel = document.getElementById("lp_" + key);
    if (!sel) continue;
    let items = DATA.lifepath[key];
    sel.value = items[Math.floor(Math.random() * items.length)];
  }
  
  // Friends
  let numFriends = Math.max(0, Math.floor(Math.random()*10)+1 - 7);
  state.lifepath.friends = [];
  for(let i=0; i<numFriends; i++) {
    let items = DATA.lifepath.friendRelationships;
    state.lifepath.friends.push(items[Math.floor(Math.random() * items.length)]);
  }
  
  // Enemies
  let numEnemies = Math.max(0, Math.floor(Math.random()*10)+1 - 7);
  state.lifepath.enemies = [];
  for(let i=0; i<numEnemies; i++) {
    state.lifepath.enemies.push({
       who: DATA.lifepath.enemyTypes[Math.floor(Math.random() * DATA.lifepath.enemyTypes.length)],
       cause: DATA.lifepath.enemyCauses[Math.floor(Math.random() * DATA.lifepath.enemyCauses.length)],
       force: DATA.lifepath.enemyForces[Math.floor(Math.random() * DATA.lifepath.enemyForces.length)],
       revenge: DATA.lifepath.enemyRevenge[Math.floor(Math.random() * DATA.lifepath.enemyRevenge.length)]
    });
  }

  // Lovers
  let numLovers = Math.max(0, Math.floor(Math.random()*10)+1 - 7);
  state.lifepath.lovers = [];
  for(let i=0; i<numLovers; i++) {
    let items = DATA.lifepath.loveTragedies;
    state.lifepath.lovers.push(items[Math.floor(Math.random() * items.length)]);
  }
  
  renderLifepathLists();
  randomRoleLifepath();
}

function renderRoleLifepath() {
  let container = document.getElementById("role_lifepath_container");
  let content = document.getElementById("role_lifepath_content");
  if (!container || !content) return;
  
  let roleId = document.getElementById("role_select").value;
  let roleData = null;
  for (let i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id === roleId) roleData = DATA.roles[i];
  }
  
  if (!roleData || !DATA.roleLifepath || !DATA.roleLifepath[roleData.name]) {
    container.style.display = "none";
    return;
  }
  
  container.style.display = "block";
  let questions = DATA.roleLifepath[roleData.name];
  let html = "";
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    let val = state.roleLifepath[i] || "";
    html += '<label>' + q.title + ' <select class="role-lp-sel" data-idx="' + i + '">';
    html += '<option value="">-- Choose --</option>';
    for (let j = 0; j < q.options.length; j++) {
      let opt = q.options[j];
      let selected = (val === opt) ? " selected" : "";
      html += '<option value="' + opt + '"' + selected + '>' + opt + '</option>';
    }
    html += '</select></label>';
  }
  content.innerHTML = html;
  
  let selects = content.querySelectorAll(".role-lp-sel");
  for (let i = 0; i < selects.length; i++) {
    selects[i].onchange = function() {
      state.roleLifepath[this.dataset.idx] = this.value;
    };
  }
}

function randomRoleLifepath() {
  let roleId = document.getElementById("role_select").value;
  let roleData = null;
  for (let i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id === roleId) roleData = DATA.roles[i];
  }
  
  if (!roleData || !DATA.roleLifepath || !DATA.roleLifepath[roleData.name]) return;
  
  let questions = DATA.roleLifepath[roleData.name];
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    state.roleLifepath[i] = q.options[Math.floor(Math.random() * q.options.length)];
  }
  renderRoleLifepath();
}

// ============================================================
// ADD BUTTONS & ITEM SELECTOR
// ============================================================
function initAddButtons() {
  document.getElementById("add_weapon_btn").onclick = function() {
    showItemSelector("weapon", DATA.weapons, function(item) {
      let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
      if (costInput === null) return;
      let actualCost = parseInt(costInput) || 0;
      state.weapons.push({ id: item.id, name: item.name, dmg: item.dmg, rof: item.rof, mag: item.mag, type: item.type, rank: 0, cost: actualCost });
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - actualCost;
      renderWeapons();
    }, "type");
  };
  document.getElementById("add_armor_btn").onclick = function() {
    showItemSelector("armor", DATA.armor, function(item) {
      let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
      if (costInput === null) return;
      let actualCost = parseInt(costInput) || 0;
      state.armor.push({ id: item.id, name: item.name, sp: item.sp, slots: item.slots, enc: item.enc, cost: actualCost });
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - actualCost;
      renderArmor();
      renderHumanity();
    });
  };
  document.getElementById("add_cyberware_btn").onclick = function() {
    let standalone = DATA.cyberware.filter(function(c) { return !c.parentType || c.slots; });
    showItemSelector("cyberware", standalone, function(item) {
      let selectedLoc = null;
      let isPairedPurchase = (item.id === "romanova_cyberlegs" || item.id === "skydrivers");
      let bodyPart = item.bodyPart;
      
      if (bodyPart) {
        let limits = { eye: 2, arm: 2, leg: 2 };
        let max = limits[bodyPart] || 99;
        let hasLeft = false;
        let hasRight = false;
        
        for (let i = 0; i < state.cyberware.length; i++) {
          let dataItem = getDataItemById(state.cyberware[i].id);
          if (dataItem && dataItem.bodyPart === bodyPart) {
            let loc = state.cyberware[i].location;
            if (!loc) {
              if (!hasLeft) { loc = "Left"; state.cyberware[i].location = "Left"; }
              else if (!hasRight) { loc = "Right"; state.cyberware[i].location = "Right"; }
              else { loc = "Both"; }
            }
            if (loc === "Left") hasLeft = true;
            else if (loc === "Right") hasRight = true;
            else if (loc === "Both" || dataItem.takesBoth) { hasLeft = true; hasRight = true; }
          }
        }
        
        if (item.takesBoth || isPairedPurchase) {
          if (hasLeft || hasRight) {
            alert("This item requires both " + bodyPart + "s, but you already have one or more installed. Remove them first.");
            return;
          }
          if (item.takesBoth && !isPairedPurchase) {
            selectedLoc = "Both";
          }
        } else if (max === 2) {
          if (hasLeft && hasRight) {
            alert("You already have both " + bodyPart + "s installed. Remove one first.");
            return;
          } else if (!hasLeft && !hasRight) {
            let locInput = prompt("Select location for this " + bodyPart + ":\n1: Left\n2: Right", "1");
            if (locInput === null) return;
            selectedLoc = (locInput.trim() === "2") ? "Right" : "Left";
          } else if (!hasLeft) {
            selectedLoc = "Left";
            alert("Auto-assigned to Left " + bodyPart + " (Right is already taken).");
          } else if (!hasRight) {
            selectedLoc = "Right";
            alert("Auto-assigned to Right " + bodyPart + " (Left is already taken).");
          }
        }
      }
      let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
      if (costInput === null) return;
      let actualCost = parseInt(costInput) || 0;
      let actualHc = item.hc || 0;
      if (actualHc > 0) {
        let hcInput = prompt("Humanity Cost for " + item.name + "\n(Enter value, or 'r' to roll randomly)", actualHc);
        if (hcInput !== null) {
          if (hcInput.toLowerCase().trim() === 'r') {
            actualHc = rollCyberwareHC(item.hc);
            alert("Rolled Humanity Cost: " + actualHc);
          } else {
            actualHc = parseInt(hcInput) || 0;
          }
        }
      }
      let entry = { id: item.id, name: item.name, type: item.type, hc: actualHc, cost: actualCost, desc: item.desc || '', bonus: item.bonus || null };
      if (selectedLoc) entry.location = selectedLoc;
      if (item.slots) { entry.slots = item.slots; entry.options = []; }
      
      let pairedPrefill = { "romanova_cyberlegs": "talon_feet", "skydrivers": "jump_boosters" };
      let prefillId = pairedPrefill[item.id];
      if (prefillId) {
        let prefillData = getDataItemById(prefillId);
        let leftLeg = { id: item.id, name: item.name, location: "Left", type: item.type, hc: actualHc, cost: actualCost, desc: item.desc || '', bonus: item.bonus || null, slots: item.slots, options: [] };
        if (prefillData) {
          leftLeg.options[0] = { id: prefillData.id, name: prefillData.name, hc: prefillData.hc || 0, cost: prefillData.cost || 0, desc: prefillData.desc || '', bonus: prefillData.bonus || null, parentType: prefillData.parentType };
        }
        state.cyberware.push(leftLeg);
        let rightLeg = { id: item.id, name: item.name, location: "Right", type: item.type, hc: actualHc, cost: 0, desc: item.desc || '', bonus: item.bonus || null, slots: item.slots, options: [] };
        if (prefillData) {
          rightLeg.options[0] = { id: prefillData.id, name: prefillData.name, hc: prefillData.hc || 0, cost: prefillData.cost || 0, desc: prefillData.desc || '', bonus: prefillData.bonus || null, parentType: prefillData.parentType };
        }
        state.cyberware.push(rightLeg);
      } else {
        state.cyberware.push(entry);
      }
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - actualCost;
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
    }, "type");
  };
  
  document.getElementById("add_vehicle_btn").onclick = function() {
    showItemSelector("vehicle", DATA.vehicleTypes, async function(item) {
      let isFree = false;
      let motoRank = getMotoRank();
      let usedMoto = getUsedMotoCount();
      if (motoRank > 0 && usedMoto < motoRank) {
        isFree = await customConfirm(`Is this vehicle free (from Nomad Moto ability)?\nYou have used ${usedMoto}/${motoRank} Moto choices.`);
      }
      let cost = 0;
      if (!isFree) {
        let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
        if (costInput === null) return;
        cost = parseInt(costInput) || 0;
      }
      state.vehicles.push({ id: item.id, name: item.name, sdp: item.sdp, seats: item.seats, cost: cost, isMoto: isFree, desc: item.desc, upgrades: [] });
      if (!isFree) {
        let el = document.getElementById("currency_eb");
        el.value = (parseInt(el.value) || 0) - cost;
      }
      renderVehicles();
      updateRoleInfo();
    }, "cat");
  };

  document.getElementById("add_gear_btn").onclick = function() {
    let allGear = DATA.gear.concat(DATA.fashion.map(function(f) { return { id: f.id, name: f.name, cost: f.cost, cat: "Fashion" }; }));
    showItemSelector("gear", allGear, function(item) {
      let costInput = prompt("Cost in eb (0 = looted):", item.cost || 0);
      if (costInput === null) return;
      let actualCost = parseInt(costInput) || 0;
      state.gear.push({ id: item.id, name: item.name, cost: actualCost, cat: item.cat || "Gear", desc: item.desc || "", qty: 1, ammo: item.ammo });
      let el = document.getElementById("currency_eb");
      el.value = (parseInt(el.value) || 0) - actualCost;
      if (item.ammo) {
        state.ammo[item.id] = state.ammo[item.id] || { id: item.id, name: item.name, perBundle: item.ammo, total: 0 };
        state.ammo[item.id].total += item.ammo;
      }
      renderGear();
      renderAmmoTracker();
    }, "cat");
  };
}

function showItemSelector(type, items, callback, groupBy) {
  let overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";
  let box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "600px";
  let title = type.charAt(0).toUpperCase() + type.slice(1);
  box.innerHTML = '<h2>Select ' + title + '</h2><div style="max-height:400px;overflow-y:auto;margin:1rem 0">';
  let list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "4px";
  let customBtn = document.createElement("button");
  customBtn.className = "btn-action";
  customBtn.style.textAlign = "left";
  customBtn.style.justifyContent = "flex-start";
  customBtn.style.width = "100%";
  customBtn.style.background = "let(--accent)";
  customBtn.style.color = "#fff";
  customBtn.style.fontWeight = "700";
  customBtn.textContent = "\u270E Custom " + title;
  customBtn.onclick = function() {
    let name = prompt("Enter " + title + " name:");
    if (!name) return;
    if (type === "weapon") {
      let dmg = prompt("Damage dice (e.g. 3d6):") || "1d6";
      let wType = prompt("Weapon skill (Handgun, Shoulder Arms, Melee, etc.):") || "Handgun";
      let cost = parseInt(prompt("Cost in eb:") || "0");
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, dmg: dmg, type: wType, rof: 1, mag: null, conceal: "Varies", cost: cost, rank: 0 });
    } else if (type === "armor") {
      let sp = parseInt(prompt("SP value:") || "0");
      let slots = prompt("Slots (Body, Head, Shield):") || "Body";
      let enc = parseInt(prompt("Encumbrance:") || "0");
      let cost = parseInt(prompt("Cost in eb:") || "0");
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, sp: sp, slots: slots, enc: enc, cost: cost });
    } else if (type === "cyberware") {
      let cType = prompt("Type (Fashion, Internal, Neuralware, etc.):") || "Fashion";
      let hc = parseInt(prompt("Humanity Cost:") || "0");
      let cost = parseInt(prompt("Cost in eb:") || "0");
      let desc = prompt("Description:") || "";
      let slots = parseInt(prompt("Option slots (e.g., 4 for Cyberarm, 0 for none):") || "0");
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, type: cType, hc: hc, cost: cost, desc: desc, bonus: null, slots: slots > 0 ? slots : undefined });
    } else {
      let cost = parseInt(prompt("Cost in eb:") || "0");
      let cat = prompt("Category (Gear, Fashion, Electronics, Medical, etc.):") || "Gear";
      let desc = prompt("Description (optional):") || "";
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, cost: cost, cat: cat, desc: desc, qty: 1 });
    }
  };
  list.appendChild(customBtn);
  if (groupBy) {
    items = items.slice().sort(function(a, b) {
      let ga = (a[groupBy] || "Other").toUpperCase();
      let gb = (b[groupBy] || "Other").toUpperCase();
      if (ga < gb) return -1;
      if (ga > gb) return 1;
      return 0;
    });
  }
  let lastGroup = null;
  for (let i = 0; i < items.length; i++) {
    let group = groupBy ? (items[i][groupBy] || "Other") : null;
    if (group !== null && group !== lastGroup) {
      let header = document.createElement("div");
      header.textContent = group;
      header.style.fontWeight = "700";
      header.style.padding = "0.5rem 0.25rem 0.25rem";
      header.style.color = "let(--accent)";
      header.style.fontSize = "0.85rem";
      header.style.textTransform = "uppercase";
      header.style.borderBottom = "1px solid var(--border)";
      list.appendChild(header);
      lastGroup = group;
    }
    let btn = document.createElement("button");
    btn.className = "btn-action";
    btn.style.textAlign = "left";
    btn.style.justifyContent = "flex-start";
    btn.style.width = "100%";
    btn.style.background = "var(--stat-row-bg)";
    btn.style.color = "var(--text)";
    let label = items[i].name;
    if (items[i].cost) label += " (" + items[i].cost + "eb)";
    if (items[i].hc !== undefined) label += " [HC: " + items[i].hc + "]";
    if (items[i].dmg) label += " [" + items[i].dmg + "]";
    btn.textContent = label;
    (function(item) {
      btn.onclick = function() {
        closeModal();
        callback(item);
      };
    })(items[i]);
    list.appendChild(btn);
  }
  box.appendChild(list);
  let closeBtn = document.createElement("button");
  closeBtn.className = "btn-action";
  closeBtn.textContent = "Cancel";
  closeBtn.style.marginTop = "0.5rem";
  function closeModal() {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
      document.removeEventListener("keydown", escHandler);
    }
  }
  closeBtn.onclick = closeModal;
  overlay.onclick = function(e) { if (e.target === overlay) closeModal(); };
  var escHandler = function(e) { if (e.key === "Escape") closeModal(); };
  document.addEventListener("keydown", escHandler);
  
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/**
 * updateAllDerived()
 * This is the ultimate "refresh" function. Whenever you add a piece of cyberware, 
 * change a stat, or equip armor, this function is called to update EVERYTHING on the 
 * screen that might have changed (HP, Humanity, Skills, UI tabs, etc.).
 */
function updateAllDerived() {
  renderHealth();
  renderHumanity();
  renderSkills();
  try {
    renderWeapons();
  } catch (e) {
    console.error("renderWeapons crashed:", e);
  }
  try {
    updateRoleInfo();
  } catch (e) {
    console.error("updateRoleInfo crashed:", e);
  }
}

/**
 * getCharacterData()
 * Packages up everything in the `state` object, cleans it up, and prepares it 
 * to be saved to localStorage or exported as a JSON file.
 */
function getCharacterData() {
  let data = {
    handle: document.getElementById("char_handle").value,
    name: document.getElementById("char_name").value,
    char_notes: document.getElementById("char_notes") ? document.getElementById("char_notes").value : "",
    role: document.getElementById("role_select").value,
    roleAbilityRank: parseInt(document.getElementById("role_ability_rank").value) || 4,
    age: parseInt(document.getElementById("char_age").value) || 22,
    ip: parseInt(document.getElementById("char_ip").value) || 0,
    multiclassEnabled: document.getElementById("multiclass_enabled").checked,
    secondaryRole: document.getElementById("role_secondary_select").value,
    secondaryRoleRank: parseInt(document.getElementById("role_secondary_rank").value) || 1,
    stats: JSON.parse(JSON.stringify(state.stats)),
    skillRanks: JSON.parse(JSON.stringify(state.skillRanks)),
    skillItem: JSON.parse(JSON.stringify(state.skillItem)),
    weapons: JSON.parse(JSON.stringify(state.weapons)),
    armor: JSON.parse(JSON.stringify(state.armor)),
    cyberware: JSON.parse(JSON.stringify(state.cyberware)),
    gear: JSON.parse(JSON.stringify(state.gear)),
    ammo: JSON.parse(JSON.stringify(state.ammo)),
    roleSubRanks: JSON.parse(JSON.stringify(state.roleSubRanks)),
    subSkillNames: JSON.parse(JSON.stringify(state.subSkillNames || {})),
    hpCurrent: parseInt(document.getElementById("hp_current").value) || 0,
    currency: parseInt(document.getElementById("currency_eb").value) || 0,
    lifepath: {
      ...LP_FIELDS.reduce((acc, key) => {
        let el = document.getElementById("lp_" + key);
        if (el) acc[key] = el.value;
        return acc;
      }, {}),
      friends: JSON.parse(JSON.stringify(state.lifepath.friends || [])),
      enemies: JSON.parse(JSON.stringify(state.lifepath.enemies || [])),
      lovers: JSON.parse(JSON.stringify(state.lifepath.lovers || []))
    },
    roleLifepath: JSON.parse(JSON.stringify(state.roleLifepath || {}))
  };
  return data;
}

/**
 * loadCharacterData(data)
 * The exact opposite of getCharacterData(). It takes a saved character object, 
 * injects it back into the live `state` object, and tells the UI to completely 
 * redraw itself to show the newly loaded character.
 */
function loadCharacterData(data) {
  let cb = document.getElementById("toggle_creation_mode");
  if (cb) { cb.checked = false; toggleCreationMode(false); }
  document.getElementById("char_handle").value = data.handle || "";
  document.getElementById("char_name").value = data.name || "";
  if (document.getElementById("char_notes")) document.getElementById("char_notes").value = data.char_notes || "";
  document.getElementById("role_select").value = data.role || "";
  document.getElementById("role_ability_rank").value = data.roleAbilityRank || 4;
  document.getElementById("char_age").value = data.age || 22;
  document.getElementById("char_ip").value = data.ip || 0;
  document.getElementById("multiclass_enabled").checked = !!data.multiclassEnabled;
  updateSecondaryRoleOptions();
  document.getElementById("role_secondary_select").value = data.secondaryRole || "";
  document.getElementById("role_secondary_rank").value = data.secondaryRoleRank || 1;
  document.getElementById("multiclass_fields").style.display = data.multiclassEnabled ? "grid" : "none";
  document.getElementById("role_ability_rank").dataset.oldVal = document.getElementById("role_ability_rank").value;
  document.getElementById("role_secondary_rank").dataset.oldVal = document.getElementById("role_secondary_rank").value;
  if (data.stats) {
    for (let id in data.stats) {
      if (state.stats[id] !== undefined) state.stats[id] = data.stats[id];
    }
  }
  state.skillRanks = data.skillRanks || {};
  state.skillItem = data.skillItem || {};
  state.weapons = data.weapons || [];
  state.armor = data.armor || [];
  state.cyberware = data.cyberware || [];
  state.gear = data.gear || [];
  state.vehicles = data.vehicles || [];
  state.ammo = data.ammo || {};
  state.roleSubRanks = data.roleSubRanks || {};
  state.subSkillNames = data.subSkillNames || {};
  document.getElementById("hp_current").value = data.hpCurrent || 0;
  document.getElementById("currency_eb").value = data.currency || 0;
  
  if (data.lifepath) {
    for (let i = 0; i < LP_FIELDS.length; i++) {
      let key = LP_FIELDS[i];
      let el = document.getElementById("lp_" + key);
      if (el) el.value = data.lifepath[key] || "";
    }
    state.lifepath.friends = data.lifepath.friends || [];
    state.lifepath.enemies = data.lifepath.enemies || [];
    state.lifepath.lovers = data.lifepath.lovers || [];
  } else {
    for (let i = 0; i < LP_FIELDS.length; i++) {
      let el = document.getElementById("lp_" + LP_FIELDS[i]);
      if (el) el.value = "";
    }
    state.lifepath.friends = [];
    state.lifepath.enemies = [];
    state.lifepath.lovers = [];
  }
  renderLifepathLists();
  state.roleLifepath = data.roleLifepath || {};
  renderRoleLifepath();
  renderStats();
  renderSkills();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  renderVehicles();
  renderAmmoTracker();
  updateAllDerived();
  updateStatPointsBar();
}

function resetCharacter() {
  initState();
  document.getElementById("char_handle").value = "";
  document.getElementById("char_name").value = "";
  document.getElementById("role_select").value = "";
  document.getElementById("role_ability_rank").value = "4";
  document.getElementById("role_ability_rank").dataset.oldVal = "4";
  document.getElementById("char_age").value = "22";
  document.getElementById("char_ip").value = "0";
  document.getElementById("multiclass_enabled").checked = false;
  document.getElementById("role_secondary_select").value = "";
  document.getElementById("role_secondary_rank").value = "1";
  document.getElementById("role_secondary_rank").dataset.oldVal = "1";
  document.getElementById("multiclass_fields").style.display = "none";
  document.getElementById("hp_current").value = "0";
  document.getElementById("currency_eb").value = "0";
  for (let i = 0; i < LP_FIELDS.length; i++) {
    let el = document.getElementById("lp_" + LP_FIELDS[i]);
    if (el) el.value = "";
  }
  state.lifepath = { friends: [], enemies: [], lovers: [] };
  renderLifepathLists();
  state.roleLifepath = {};
  renderRoleLifepath();
  state.skillRanks = {};
  state.skillItem = {};
    state.subSkillNames = {};
  state.weapons = [];
  state.armor = [];
  state.cyberware = [];
  state.gear = [];
  state.vehicles = [];
  state.ammo = {};
  
  let cb = document.getElementById("toggle_creation_mode");
  if (cb) { cb.checked = true; toggleCreationMode(true); }

  renderStats();
  renderSkills();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  renderVehicles();
  renderAmmoTracker();
  updateAllDerived();
  updateStatPointsBar();
}

/**
 * generateRandomCharacter()
 * The magic "Random" button. This function follows the exact Cyberpunk Red 
 * Complete Package rules to automatically build a playable character:
 * 1. Rolls exactly 62 points of stats.
 * 2. Assigns mandatory minimum skill ranks (including the 4 free Language points).
 * 3. Randomly distributes the remaining 86 points into skills.
 * 4. Rolls a random lifepath.
 * 5. Re-renders the entire screen!
 */
function generateRandomCharacter() {
  resetCharacter();
  let roleIdx = Math.floor(Math.random() * DATA.roles.length);
  let role = DATA.roles[roleIdx];
  document.getElementById("role_select").value = role.id;
  updateSecondaryRoleOptions();
  document.getElementById("role_ability_rank").value = "4";
  let prefixes = ["Blitz","Cipher","Dash","Echo","Flux","Ghost","Havoc","Jinx","Karma","Locke","Morph","Nyx","Onyx","Pixel","Quake","Reef","Shade","Trigger","Vex","Whisper","Zero","Ace","Byte","Creed","Dust","Ember","Fuse","Grim","Hex","Ice"];
  let suffixes = ["dog","cat","wolf","fox","hawk","rat","viper","shark","raven","panther","tiger","bear","owl","eagle","hound","jackal","coyote","lynx","striker","runner"];
  document.getElementById("char_handle").value = prefixes[Math.floor(Math.random()*prefixes.length)]+" "+suffixes[Math.floor(Math.random()*suffixes.length)];
  document.getElementById("char_age").value = String(18+Math.floor(Math.random()*20));
  let pts = STAT_POINTS_TOTAL;
  let st = {};
  for (let i=0;i<DATA.stats.length;i++) st[DATA.stats[i].id]=STAT_MIN;
  pts -= STAT_MIN*DATA.stats.length;
  while (pts>0) { let si=Math.floor(Math.random()*DATA.stats.length); let sid=DATA.stats[si].id; if (st[sid]<STAT_MAX) { st[sid]++; pts--; } }
  for (let i=0;i<DATA.stats.length;i++) state.stats[DATA.stats[i].id]=st[DATA.stats[i].id];
  let allSks=[];
  for (let cat in DATA.skills) allSks=allSks.concat(DATA.skills[cat]);
  state.skillRanks={};
  
  // 1. Assign mandatory basic skills
  for (let sk of allSks) {
    if (sk.basic) {
      let targetId = sk.subs ? sk.id + "_1" : sk.id;
      state.skillRanks[targetId] = 2;
    }
  }
  // Language (Streetslang) gets 4 ranks minimum (first 4 are free)
  state.skillRanks["language_1"] = 4;
  if (!state.subSkillNames) state.subSkillNames = {};
  state.subSkillNames["language_1"] = "Streetslang";
  state.subSkillNames["local_expert_1"] = "Your Home";
  
  // 2. Randomly allocate the remaining points until we reach 86
  let sp = 86 - calcCreationPointsUsed();
  
  // In case some skills cost x2, we need a fallback to prevent infinite loops if only 1 point is left
  let attempts = 0; 
  while (sp > 0 && attempts < 2000) {
    attempts++;
    let sk = allSks[Math.floor(Math.random() * allSks.length)];
    let targetId = sk.subs ? sk.id + "_1" : sk.id;
    let currentRank = state.skillRanks[targetId] || 0;
    
    // Max 6 ranks at character creation
    if (currentRank < 6) {
      let mult = sk.ipMult || 1;
      // If we don't have enough points for x2, find another
      if (sp >= mult) {
        state.skillRanks[targetId] = currentRank + 1;
        sp -= mult;
      }
    }
  }
  randomLifepath();
  let w=DATA.weapons[Math.floor(Math.random()*DATA.weapons.length)];
  state.weapons.push({id:w.id,name:w.name,dmg:w.dmg,rof:w.rof||1,mag:w.mag,type:w.type,rank:0,cost:w.cost||0});
  let ap = DATA.armor.filter(function(x) { return x.slots === "Body"; });
  let a = ap[Math.floor(Math.random()*ap.length)] || DATA.armor[0];
  state.armor.push({id:a.id,name:a.name,sp:a.sp,slots:a.slots,enc:a.enc,cost:a.cost||0});
  let gIds=["agent","flashlight","rope","duct_tape","first_aid_kit"];
  for (let g=0;g<gIds.length;g++) { let gi=DATA.gear.find(function(x){return x.id===gIds[g];}); if (gi) state.gear.push({id:gi.id,name:gi.name,cost:gi.cost,cat:gi.cat||"Gear",qty:1}); }
  document.getElementById("hp_current").value = calcHitsMax(state.stats.body || 2, state.stats.will || 2);
  
  try { renderStats(); } catch(e) {}
  try { renderSkills(); } catch(e) {}
  try { renderWeapons(); } catch(e) {}
  try { renderArmor(); } catch(e) {}
  try { renderCyberware(); } catch(e) {}
  try { renderGear(); } catch(e) {}
  try { renderVehicles(); } catch(e) {}
  try { renderAmmoTracker(); } catch(e) {}
  
  try { updateAllDerived(); } catch(e) {}
  try { updateStatPointsBar(); } catch(e) {}
  try { updateCreationPoints(); } catch(e) {}
  try { updateRoleInfo(); } catch(e) {}
}

// ============================================================

// ============================================================
// CYBERDECK & PROGRAMS
// ============================================================

function deductCurrency(amount) {
  let el = document.getElementById("currency_eb");
  let current = parseInt(el.value) || 0;
  if (current < amount) {
    alert("Not enough eurobucks!");
    return false;
  }
  el.value = current - amount;
  return true;
}

function refundCurrency(amount) {
  let el = document.getElementById("currency_eb");
  el.value = (parseInt(el.value) || 0) + amount;
}

function initCyberdeck() {
  const selDeck = document.getElementById('sel_cyberdeck');
  if (selDeck) {
    let opts = '<option value="">None</option>';
    if (DATA.cyberdecks) {
      for (const d of DATA.cyberdecks) {
        opts += `<option value="${d.id}">${d.name} (${d.cost}eb) - ${d.slots} Slots</option>`;
      }
    }
    selDeck.innerHTML = opts;
    
    document.getElementById('btn_buy_cyberdeck').addEventListener('click', async () => {
      const id = selDeck.value;
      if (!id) return;
      const d = DATA._index.deckById[id];
      if (d) {
        if (state.cyberdeck && !await customConfirm('Replace current cyberdeck? Programs will be lost.')) return;
        if (!deductCurrency(d.cost)) return;
        state.cyberdeck = d.id;
        state.programs = []; // clear programs when buying new deck
        renderCyberdeck();
      }
    });
  }

  const selProg = document.getElementById('sel_program');
  if (selProg) {
    let progOpts = '<optgroup label="Programs">';
    if (DATA.programs) {
      for (const p of DATA.programs) {
        progOpts += `<option value="p_${p.id}">${p.name} (${p.cost}eb) - ${p.slots} Slot(s)</option>`;
      }
    }
    progOpts += '</optgroup><optgroup label="Hardware">';
    if (DATA.hardware) {
      for (const h of DATA.hardware) {
        progOpts += `<option value="h_${h.id}">${h.name} (${h.cost}eb) - ${h.slots} Slot(s)</option>`;
      }
    }
    progOpts += '</optgroup>';
    selProg.innerHTML = progOpts;

    document.getElementById('btn_install_program').addEventListener('click', () => {
      if (!state.cyberdeck) { alert('Equip a Cyberdeck first!'); return; }
      const val = selProg.value;
      if (!val) return;
      
      const isProg = val.startsWith('p_');
      const id = val.substring(2);
      const item = isProg ? DATA._index.programById[id] : DATA._index.hardwareById[id];
      
      if (!item) return;
      
      const deck = DATA._index.deckById[state.cyberdeck];
      let used = 0;
      for (const p of state.programs) {
        const pItem = p.isProg ? DATA._index.programById[p.id] : DATA._index.hardwareById[p.id];
        if (pItem) used += pItem.slots;
      }
      
      if (used + item.slots > deck.slots) {
        alert('Not enough slots in Cyberdeck!');
        return;
      }
      
      if (!deductCurrency(item.cost)) return;
      
      state.programs.push({ id: item.id, isProg: isProg, instanceId: Date.now() + Math.random().toString() });
      renderCyberdeck();
    });
  }
}

function renderCyberdeck() {
  const dash = document.getElementById('deck_dashboard');
  if (!dash) return;
  
  const deckId = state.cyberdeck;
  if (!deckId) {
    dash.classList.add('hidden');
    document.getElementById('programs_body').innerHTML = '<tr><td colspan="7" class="text-center">No Cyberdeck equipped.</td></tr>';
    return;
  }
  
  const deck = DATA._index.deckById[deckId];
  if (!deck) return;
  
  dash.classList.remove('hidden');
  document.getElementById('deck_name').innerHTML = deck.name + ' <span style="font-size:0.8rem; font-weight:normal; cursor:pointer; color:red; margin-left:1rem;" onclick="removeCyberdeck()">[Sell]</span>';
  
  let used = 0;
  const tbody = document.createDocumentFragment();
  
  for (const p of state.programs) {
    const item = p.isProg ? DATA._index.programById[p.id] : DATA._index.hardwareById[p.id];
    if (!item) continue;
    used += item.slots;
    
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.innerHTML = `<strong>${item.name}</strong><br><span style="font-size:0.75rem;opacity:0.8">${item.desc}</span>`;
    
    const tdClass = document.createElement('td');
    tdClass.textContent = p.isProg ? item.type : 'Hardware';
    
    const tdSlots = document.createElement('td');
    tdSlots.textContent = item.slots;
    
    const tdAtk = document.createElement('td');
    tdAtk.textContent = item.atk || '-';
    
    const tdDef = document.createElement('td');
    tdDef.textContent = item.def || '-';
    
    const tdRez = document.createElement('td');
    tdRez.textContent = item.rez || '-';
    
    const tdAct = document.createElement('td');
    tdAct.innerHTML = `<button class="btn-action" onclick="removeProgram('${p.instanceId}', ${item.cost})">Uninstall</button>`;
    
    tr.appendChild(tdName);
    tr.appendChild(tdClass);
    tr.appendChild(tdSlots);
    tr.appendChild(tdAtk);
    tr.appendChild(tdDef);
    tr.appendChild(tdRez);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  }
  
  document.getElementById('deck_slots_used').textContent = used;
  document.getElementById('deck_slots_total').textContent = deck.slots;
  
  const container = document.getElementById('programs_body');
  container.innerHTML = '';
  if (state.programs.length === 0) {
    container.innerHTML = '<tr><td colspan="7" class="text-center">No programs or hardware installed.</td></tr>';
  } else {
    container.appendChild(tbody);
  }
}

function removeProgram(instanceId, cost) {
  state.programs = state.programs.filter(p => p.instanceId !== instanceId);
  refundCurrency(cost);
  renderCyberdeck();
}

async function removeCyberdeck() {
  if (!await customConfirm('Sell Cyberdeck and all installed programs?')) return;
  const deck = DATA._index.deckById[state.cyberdeck];
  if (deck) refundCurrency(deck.cost);
  
  for (const p of state.programs) {
    const item = p.isProg ? DATA._index.programById[p.id] : DATA._index.hardwareById[p.id];
    if (item) refundCurrency(item.cost);
  }
  
  state.cyberdeck = null;
  state.programs = [];
  renderCyberdeck();
}


function showPrintOptions() {
    return new Promise(resolve => {
        let overlay = document.createElement("div");
        overlay.className = "modal-overlay active";
        overlay.style.display = "flex";
        let box = document.createElement("div");
        box.className = "modal-box";
        box.style.maxWidth = "400px";
        box.innerHTML = '<h2>Print Options</h2><p style="margin-bottom:1rem;color:var(--text-secondary)">Select sections to include in the printout:</p>';
        
                let sections = [
            { label: "Identity & Role", selector: "#print-section-identity" },
            { label: "Stats & Health", selector: "#print-section-stats" },
            { label: "Lifepath", selector: "#print-section-lifepath" },
            { label: "Role-Based Lifepath", selector: "#role_lifepath_container" },
            { label: "Weapons & Armor", selector: "#print-section-weapons" },
            { label: "Cyberware, Fashion & Gear", selector: "#print-section-cyberware" },
            { label: "Cyberdeck & Programs", selector: "#print-section-cyberdeck" },
            { label: "Vehicles & Upgrades", selector: "#print-section-vehicles" },
            { label: "Notes", selector: "#print-section-notes" },
            { label: "Skills", selector: "#print-section-skills" }
        ];
        
        let list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.style.gap = "0.5rem";
        
        let checkboxes = [];
        sections.forEach(sec => {
            let label = document.createElement("label");
            label.style.display = "flex";
            label.style.gap = "0.5rem";
            label.style.cursor = "pointer";
            label.style.alignItems = "center";
            label.style.fontSize = "1rem";
            let cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = true;
            cb.dataset.selector = sec.selector;
            cb.style.width = "auto";
            label.appendChild(cb);
            label.appendChild(document.createTextNode(" " + sec.label));
            list.appendChild(label);
            checkboxes.push(cb);
        });
        
        box.appendChild(list);
        
        let btnDiv = document.createElement("div");
        btnDiv.style.display = "flex";
        btnDiv.style.justifyContent = "flex-end";
        btnDiv.style.gap = "1rem";
        btnDiv.style.marginTop = "1.5rem";
        
        let cancelBtn = document.createElement("button");
        cancelBtn.className = "btn-action";
        cancelBtn.style.background = "#333";
        cancelBtn.style.color = "#fff";
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(null);
        };
        
        let printBtn = document.createElement("button");
        printBtn.className = "btn-action";
        printBtn.textContent = "Print";
        printBtn.onclick = () => {
            let toHide = [];
            checkboxes.forEach(cb => {
                if (!cb.checked) toHide.push(cb.dataset.selector);
            });
            document.body.removeChild(overlay);
            resolve(toHide);
        };
        
        btnDiv.appendChild(cancelBtn);
        btnDiv.appendChild(printBtn);
        box.appendChild(btnDiv);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
}
