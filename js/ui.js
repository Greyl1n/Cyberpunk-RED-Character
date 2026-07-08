let state = {
  stats: {},
  skillRanks: {},
  skillItem: {},
  weapons: [],
  armor: [],
  cyberware: [],
  gear: [],
  ammo: {},
  currentTab: "tab-character"
};

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
  if (role2) {
    let rank2 = parseInt(document.getElementById("role_secondary_rank").value) || 1;
    let rd2 = (role2.rankDesc && role2.rankDesc[rank2]) ? role2.rankDesc[rank2] : "";
    html += '<div class="role-ability" style="margin-top:0.5rem;border-top:1px dashed let(--border);padding-top:0.4rem">Secondary: ' + role2.ability + ' (Rank ' + rank2 + ')</div>' +
      '<div style="margin-top:2px;font-size:0.82rem">' + role2.desc + '</div>' +
      '<div style="margin-top:1px;font-size:0.78rem;opacity:0.85">' + rd2 + '</div>';
  }
  info.innerHTML = html;
}

// ============================================================
// RENDER — All DOM rendering functions
// ============================================================
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
      if (search && name.toLowerCase().indexOf(search) === -1) continue;
      let ranks = state.skillRanks[skill.id] || 0;
      let item = state.skillItem[skill.id] || 0;
      let statVal = getEffectiveStat(statId);
      let cyber = calcSkillCyberBonus(skill.id);
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
  let spent = 0;
  for (const group in DATA.skills) {
    for (const skill of DATA.skills[group]) {
      let rank = state.skillRanks[skill.id] || 0;
      let costPerRank = skill.ipMult || 1;
      
      if (skill.id === "language") {
        rank = Math.max(0, rank - 4);
      }
      
      spent += rank * costPerRank;
    }
  }
  return spent;
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
          if ((state.skillRanks[skill.id] || 0) < 2) {
            state.skillRanks[skill.id] = 2;
          }
        }
        if (skill.id === "language") {
          if ((state.skillRanks[skill.id] || 0) < 4) {
            state.skillRanks[skill.id] = 4;
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
  let idxItem = DATA._index.skillById[id];
  if (!idxItem) return;
  let statId = idxItem.stat;
  let ranks = state.skillRanks[id] || 0;
  let item = state.skillItem[id] || 0;
  let statVal = getEffectiveStat(statId);
  let cyber = calcSkillCyberBonus(id);
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
}

function attachSkillEvents() {
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
        let idxItem = DATA._index.skillById[id];
        let isBasic = idxItem && idxItem.skill && idxItem.skill.basic;
        
        if (newVal > 6) {
          alert("Skills cannot exceed Rank 6 during character creation.");
          this.value = oldVal;
          return;
        }
        if (isBasic && newVal < 2) {
          alert("Basic skills must be at least Rank 2.");
          this.value = oldVal;
          return;
        }
        if (id === "language" && newVal < 4) {
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
    tr.innerHTML = '<td>' + w.name + '</td><td>' + w.dmg + '</td><td>' + (w.rof || "-") + '</td><td>' + (w.mag || "-") + '</td><td>' + (w.type || "") + '</td><td><input type="number" class="weapon-rank" data-idx="' + i + '" value="' + (w.rank || 0) + '" min="0" max="20" style="width:45px"></td><td>' + actionBtns + '</td>';
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
  attachWeaponEvents();
}

function attachWeaponEvents() {
  let removes = document.querySelectorAll(".weapon-remove");
  let ranks = document.querySelectorAll(".weapon-rank");
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
  for (let i = 0; i < ranks.length; i++) {
    ranks[i].onchange = function() {
      let idx = parseInt(this.dataset.idx);
      state.weapons[idx].rank = parseInt(this.value) || 0;
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

function renderCyberware() {
  let tbody = document.getElementById("cyberware_body");
  tbody.innerHTML = "";
  let frag = document.createDocumentFragment();
  for (let i = 0; i < state.cyberware.length; i++) {
    let c = state.cyberware[i];
    if (c.slots) {
      renderCyberwareRow(frag, c, i, true);
      for (let s = 0; s < c.slots; s++) {
        renderCyberwareSlot(frag, c, i, s);
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
  tr.innerHTML = '<td>' + c.name + '</td><td>' + c.type + '</td><td>' + (c.hc || 0) + '</td><td>' + (c.cost || 0) + 'eb</td><td><small>' + bonusHtml + '</small></td><td><small>' + (c.desc || '') + '</small></td><td><button class="btn-action cyberware-remove" data-idx="' + idx + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
  tbody.appendChild(tr);
}

function renderCyberwareSlot(tbody, parent, parentIdx, slotIdx) {
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
  let selectHtml = '<select class="cyber-slot-select" data-parent="' + parentIdx + '" data-slot="' + slotIdx + '" style="width:100%;font-size:0.8rem">';
  selectHtml += '<option value="">-- Empty --</option>';
  for (let oi = 0; oi < available.length; oi++) {
    let opt = available[oi];
    let sel = (option && option.id === opt.id) ? ' selected' : '';
    selectHtml += '<option value="' + opt.id + '"' + sel + '>' + opt.name + ' (' + opt.cost + 'eb, ' + (opt.hc || 0) + 'HC)' + '</option>';
  }
  selectHtml += '</select>';
  tr.innerHTML = '<td style="padding-left:1.5rem;border-top:none" colspan="6">Slot ' + (slotIdx + 1) + ': ' + selectHtml + '</td><td style="border-top:none"></td>';
  tbody.appendChild(tr);
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
      let parentIdx = parseInt(this.dataset.parent);
      let slotIdx = parseInt(this.dataset.slot);
      let optionId = this.value;
      let parent = state.cyberware[parentIdx];
      if (!parent) return;
      if (!parent.options) parent.options = [];
      let oldOption = parent.options[slotIdx] || null;
      let oldCost = oldOption ? (oldOption.cost || 0) : 0;
      if (optionId) {
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
          parent.options[slotIdx] = { id: item.id, name: item.name, hc: actualHc, cost: actualCost, desc: item.desc || '', bonus: item.bonus || null, parentType: item.parentType };
        }
      } else {
        let sellInput = prompt("Sell price in eb (0 = discard):", oldCost);
        if (sellInput === null) { this.value = oldOption ? oldOption.id : ''; return; }
        let sellPrice = parseInt(sellInput) || 0;
        let el = document.getElementById("currency_eb");
        el.value = (parseInt(el.value) || 0) + sellPrice;
        oldCost = 0;
        parent.options[slotIdx] = null;
      }
      let newOption = parent.options[slotIdx] || null;
      let newCost = newOption ? (newOption.cost || 0) : 0;
      let diff = newCost - oldCost;
      if (diff !== 0) {
        let el = document.getElementById("currency_eb");
        el.value = (parseInt(el.value) || 0) - diff;
      }
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
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

function initLifepath() {
  let fields = ["lp_background", "lp_motivation", "lp_hairstyle", "lp_clothing", "lp_event"];
  let dataKeys = ["backgrounds", "motivations", "hairstyles", "clothing_styles", "life_events"];
  for (let f = 0; f < fields.length; f++) {
    let sel = document.getElementById(fields[f]);
    sel.innerHTML = '<option value="">-- Random --</option>';
    let items = DATA.lifepath[dataKeys[f]];
    for (let i = 0; i < items.length; i++) {
      let opt = document.createElement("option");
      opt.value = items[i];
      opt.textContent = items[i];
      sel.appendChild(opt);
    }
  }
  document.getElementById("lp_random_btn").onclick = randomLifepath;
}

function randomLifepath() {
  let fields = ["lp_background", "lp_motivation", "lp_hairstyle", "lp_clothing", "lp_event"];
  let dataKeys = ["backgrounds", "motivations", "hairstyles", "clothing_styles", "life_events"];
  for (let f = 0; f < fields.length; f++) {
    let sel = document.getElementById(fields[f]);
    let items = DATA.lifepath[dataKeys[f]];
    let idx = Math.floor(Math.random() * items.length);
    sel.value = items[idx];
  }
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
      let bodyPart = item.bodyPart;
      if (bodyPart) {
        let limits = { eye: 2, arm: 2, leg: 2 };
        let max = limits[bodyPart] || 99;
        let count = 0;
        for (let i = 0; i < state.cyberware.length; i++) {
          let dataItem = getDataItemById(state.cyberware[i].id);
          if (dataItem && dataItem.bodyPart === bodyPart) count++;
        }
        let addCount = (item.id === "romanova_cyberlegs" || item.id === "skydrivers") ? 2 : 1;
        if (count + addCount > max) {
          alert("Maximum " + max + " " + bodyPart + "(s) allowed. Remove one first.");
          return;
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
      if (item.slots) { entry.slots = item.slots; entry.options = []; }
      let pairedPrefill = { "romanova_cyberlegs": "talon_feet", "skydrivers": "jump_boosters" };
      let prefillId = pairedPrefill[item.id];
      if (prefillId) {
        let prefillData = getDataItemById(prefillId);
        let leftLeg = { id: item.id, name: item.name + " (Left)", type: item.type, hc: actualHc, cost: actualCost, desc: item.desc || '', bonus: item.bonus || null, slots: item.slots, options: [] };
        if (prefillData) {
          leftLeg.options[0] = { id: prefillData.id, name: prefillData.name, hc: prefillData.hc || 0, cost: prefillData.cost || 0, desc: prefillData.desc || '', bonus: prefillData.bonus || null, parentType: prefillData.parentType };
        }
        state.cyberware.push(leftLeg);
        let rightLeg = { id: item.id, name: item.name + " (Right)", type: item.type, hc: actualHc, cost: 0, desc: item.desc || '', bonus: item.bonus || null, slots: item.slots, options: [] };
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
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, type: cType, hc: hc, cost: cost, desc: desc, bonus: null });
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

function updateAllDerived() {
  renderHealth();
  renderHumanity();
  renderSkills();
  updateRoleInfo();
}

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
    hpCurrent: parseInt(document.getElementById("hp_current").value) || 0,
    currency: parseInt(document.getElementById("currency_eb").value) || 0,
    lifepath: {
      background: document.getElementById("lp_background").value,
      motivation: document.getElementById("lp_motivation").value,
      hairstyle: document.getElementById("lp_hairstyle").value,
      clothing: document.getElementById("lp_clothing").value,
      event: document.getElementById("lp_event").value,
      notes: document.getElementById("lp_notes").value
    }
  };
  return data;
}

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
  state.ammo = data.ammo || {};
  document.getElementById("hp_current").value = data.hpCurrent || 0;
  document.getElementById("currency_eb").value = data.currency || 0;
  if (data.lifepath) {
    document.getElementById("lp_background").value = data.lifepath.background || "";
    document.getElementById("lp_motivation").value = data.lifepath.motivation || "";
    document.getElementById("lp_hairstyle").value = data.lifepath.hairstyle || "";
    document.getElementById("lp_clothing").value = data.lifepath.clothing || "";
    document.getElementById("lp_event").value = data.lifepath.event || "";
    document.getElementById("lp_notes").value = data.lifepath.notes || "";
  }
  renderStats();
  renderSkills();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  renderAmmoTracker();
  updateAllDerived();
  updateStatPointsBar();
}

function resetCharacter() {
  let cb = document.getElementById("toggle_creation_mode");
  if (cb) { cb.checked = false; toggleCreationMode(false); }
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
  document.getElementById("lp_background").value = "";
  document.getElementById("lp_motivation").value = "";
  document.getElementById("lp_hairstyle").value = "";
  document.getElementById("lp_clothing").value = "";
  document.getElementById("lp_event").value = "";
  document.getElementById("lp_notes").value = "";
  state.skillRanks = {};
  state.skillItem = {};
  state.weapons = [];
  state.armor = [];
  state.cyberware = [];
  state.gear = [];
  state.ammo = {};
  renderStats();
  renderSkills();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  renderAmmoTracker();
  updateAllDerived();
  updateStatPointsBar();
}

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
  let sp=38;
  while (sp>0) { let sk=allSks[Math.floor(Math.random()*allSks.length)]; if (!state.skillRanks[sk.id]) state.skillRanks[sk.id]=0; if (state.skillRanks[sk.id]<6) { state.skillRanks[sk.id]++; sp--; } }
  let lpF=["lp_background","lp_motivation","lp_hairstyle","lp_clothing","lp_event"];
  let lpK=["backgrounds","motivations","hairstyles","clothing_styles","life_events"];
  for (let f=0;f<lpF.length;f++) document.getElementById(lpF[f]).value=DATA.lifepath[lpK[f]][Math.floor(Math.random()*DATA.lifepath[lpK[f]].length)];
  let w=DATA.weapons[Math.floor(Math.random()*DATA.weapons.length)];
  state.weapons.push({id:w.id,name:w.name,dmg:w.dmg,rof:w.rof||1,mag:w.mag,type:w.type,rank:0,cost:w.cost||0});
  let ap = DATA.armor.filter(function(x) { return x.slots === "Body"; });
  let a = ap[Math.floor(Math.random()*ap.length)] || DATA.armor[0];
  state.armor.push({id:a.id,name:a.name,sp:a.sp,slots:a.slots,enc:a.enc,cost:a.cost||0});
  let gIds=["agent","flashlight","rope","duct_tape","first_aid_kit"];
  for (let g=0;g<gIds.length;g++) { let gi=DATA.gear.find(function(x){return x.id===gIds[g];}); if (gi) state.gear.push({id:gi.id,name:gi.name,cost:gi.cost,cat:gi.cat||"Gear",qty:1}); }
  document.getElementById("hp_current").value=calcHitsMax(state.stats.body||2);
  renderStats();renderSkills();renderWeapons();renderArmor();renderCyberware();renderGear();renderAmmoTracker();
  updateAllDerived();updateStatPointsBar();updateRoleInfo();
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
    
    document.getElementById('btn_buy_cyberdeck').addEventListener('click', () => {
      const id = selDeck.value;
      if (!id) return;
      const d = DATA._index.deckById[id];
      if (d) {
        if (state.cyberdeck && !confirm('Replace current cyberdeck? Programs will be lost.')) return;
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

function removeCyberdeck() {
  if (!confirm('Sell Cyberdeck and all installed programs?')) return;
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
