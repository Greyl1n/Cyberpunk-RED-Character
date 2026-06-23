var STAT_POINTS_TOTAL = 62;
var STAT_MAX = 8;
var STAT_MIN = 2;

var state = {
  stats: {},
  skillRanks: {},
  skillItem: {},
  weapons: [],
  armor: [],
  cyberware: [],
  gear: [],
  currentTab: "tab-character"
};

function initState() {
  for (var i = 0; i < DATA.stats.length; i++) {
    var s = DATA.stats[i];
    state.stats[s.id] = 6;
  }
}

function getStatPointsRemaining() {
  var used = 0;
  for (var i = 0; i < DATA.stats.length; i++) {
    used += state.stats[DATA.stats[i].id];
  }
  return STAT_POINTS_TOTAL - used;
}

function updateSecondaryRoleOptions() {
  var sel = document.getElementById("role_select");
  var sel2 = document.getElementById("role_secondary_select");
  var currentVal = sel2.value;
  var html = '<option value="">-- None --</option>';
  for (var i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id !== sel.value) {
      html += '<option value="' + DATA.roles[i].id + '">' + DATA.roles[i].name + '</option>';
    }
  }
  sel2.innerHTML = html;
  sel2.value = currentVal;
}

function initRoleSelect() {
  var sel = document.getElementById("role_select");
  var sel2 = document.getElementById("role_secondary_select");
  var html = '<option value="">-- Select Role --</option>';
  for (var i = 0; i < DATA.roles.length; i++) {
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
  var roleRankEl = document.getElementById("role_ability_rank");
  var roleRank2El = document.getElementById("role_secondary_rank");
  roleRankEl.dataset.oldVal = roleRankEl.value;
  roleRank2El.dataset.oldVal = roleRank2El.value;
  roleRankEl.oninput = function() {
    var oldVal = parseInt(this.dataset.oldVal) || 0;
    var newVal = parseInt(this.value) || 0;
    if (newVal === oldVal) { updateRoleInfo(); return; }
    var cost = ipCostBetween(oldVal, newVal, 60);
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
    var oldVal = parseInt(this.dataset.oldVal) || 0;
    var newVal = parseInt(this.value) || 0;
    if (newVal === oldVal) { updateRoleInfo(); return; }
    var cost = ipCostBetween(oldVal, newVal, 60);
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
  var roleId = document.getElementById("role_select").value;
  var info = document.getElementById("role_info");
  if (!roleId) { info.innerHTML = ""; return; }
  var role = null, role2 = null;
  for (var i = 0; i < DATA.roles.length; i++) {
    if (DATA.roles[i].id === roleId) role = DATA.roles[i];
  }
  var mcEnabled = document.getElementById("multiclass_enabled").checked;
  var role2Id = mcEnabled ? document.getElementById("role_secondary_select").value : "";
  if (role2Id) {
    for (var i = 0; i < DATA.roles.length; i++) {
      if (DATA.roles[i].id === role2Id) role2 = DATA.roles[i];
    }
  }
  var html = "";
  var abilityRank = parseInt(document.getElementById("role_ability_rank").value) || 4;
  var rd = (role && role.rankDesc && role.rankDesc[abilityRank]) ? role.rankDesc[abilityRank] : "";
  html += '<div class="role-ability">Primary: ' + role.ability + ' (Rank ' + abilityRank + ')</div>' +
    '<div style="margin-top:2px;font-size:0.82rem">' + role.desc + '</div>' +
    '<div style="margin-top:1px;font-size:0.78rem;opacity:0.85">' + rd + '</div>';
  if (role2) {
    var rank2 = parseInt(document.getElementById("role_secondary_rank").value) || 1;
    var rd2 = (role2.rankDesc && role2.rankDesc[rank2]) ? role2.rankDesc[rank2] : "";
    html += '<div class="role-ability" style="margin-top:0.5rem;border-top:1px dashed var(--border);padding-top:0.4rem">Secondary: ' + role2.ability + ' (Rank ' + rank2 + ')</div>' +
      '<div style="margin-top:2px;font-size:0.82rem">' + role2.desc + '</div>' +
      '<div style="margin-top:1px;font-size:0.78rem;opacity:0.85">' + rd2 + '</div>';
  }
  info.innerHTML = html;
}

function renderStats() {
  var container = document.getElementById("stats_container");
  container.innerHTML = "";
  for (var i = 0; i < DATA.stats.length; i++) {
    var s = DATA.stats[i];
    var baseVal = state.stats[s.id] || 2;
    var cyberBonus = calcCyberStatBonus(s.id);
    var effVal = baseVal + cyberBonus;
    var bonus = calcStatBonus(effVal);
    var row = document.createElement("div");
    row.className = "stat-row";
    var cyberStr = cyberBonus > 0 ? ' <span class="cyber-stat-bonus">(+' + cyberBonus + ' chrome)</span>' : '';
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
  var incs = document.querySelectorAll(".stat-inc");
  var decs = document.querySelectorAll(".stat-dec");
  var inputs = document.querySelectorAll(".stat-input");
  for (var i = 0; i < incs.length; i++) {
    incs[i].onclick = function() { statChange(this.dataset.stat, 1); };
  }
  for (var i = 0; i < decs.length; i++) {
    decs[i].onclick = function() { statChange(this.dataset.stat, -1); };
  }
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].onchange = function() {
      var id = this.dataset.stat;
      var v = parseInt(this.value) || STAT_MIN;
      if (v < STAT_MIN) v = STAT_MIN;
      if (v > STAT_MAX) v = STAT_MAX;
      state.stats[id] = v;
      renderStats();
      updateAllDerived();
    };
  }
}

function statChange(id, delta) {
  var cur = state.stats[id] || 2;
  var newVal = cur + delta;
  if (newVal < STAT_MIN) return;
  if (newVal > STAT_MAX) return;
  if (delta > 0 && getStatPointsRemaining() <= 0) return;
  state.stats[id] = newVal;
  renderStats();
  updateAllDerived();
}

function updateStatPointsBar() {
  var rem = getStatPointsRemaining();
  document.getElementById("stat_points_remaining").textContent = rem;
  var bar = document.getElementById("stat_points_bar");
  bar.style.opacity = rem < 0 ? "0.6" : "1";
}

function renderSkills() {
  var tbody = document.getElementById("skills_body");
  var search = (document.getElementById("skillSearch").value || "").toLowerCase();
  tbody.innerHTML = "";
  var statKeys = Object.keys(DATA.skills);
  for (var si = 0; si < statKeys.length; si++) {
    var statId = statKeys[si];
    var skillList = DATA.skills[statId];
    for (var j = 0; j < skillList.length; j++) {
      var skill = skillList[j];
      var name = skill.name;
      if (search && name.toLowerCase().indexOf(search) === -1) continue;
      var ranks = state.skillRanks[skill.id] || 0;
      var item = state.skillItem[skill.id] || 0;
      var statVal = getEffectiveStat(statId);
      var cyber = calcSkillCyberBonus(skill.id);
      var total = calcSkillTotal(statVal, ranks, item, cyber);
      var tr = document.createElement("tr");
      tr.innerHTML = '<td>' + name + '</td>' +
        '<td>' + statId.toUpperCase() + '</td>' +
        '<td>' + calcStatBonus(statVal) + '</td>' +
        '<td><input type="number" class="skill-rank" data-skill="' + skill.id + '" value="' + ranks + '" min="0" max="10" style="width:50px"></td>' +
        '<td><input type="number" class="skill-item" data-skill="' + skill.id + '" value="' + item + '" style="width:50px"></td>' +
        '<td>' + (cyber > 0 ? '+' + cyber : '0') + '</td>' +
        '<td><strong>' + (total >= 0 ? "+" : "") + total + '</strong></td>';
      tbody.appendChild(tr);
    }
  }
  attachSkillEvents();
}

function getSkillIpBase(skillId) {
  for (var k in DATA.skills) {
    for (var i = 0; i < DATA.skills[k].length; i++) {
      if (DATA.skills[k][i].id === skillId) {
        var m = DATA.skills[k][i].ipMult || 1;
        return m * 20;
      }
    }
  }
  return 20;
}

function ipCostBetween(oldRank, newRank, baseCost) {
  return baseCost * (newRank * (newRank + 1) / 2 - oldRank * (oldRank + 1) / 2);
}

function payIpCost(cost) {
  var ipEl = document.getElementById("char_ip");
  var cur = parseInt(ipEl.value) || 0;
  if (cur - cost < 0) return false;
  ipEl.value = cur - cost;
  return true;
}

function attachSkillEvents() {
  var ranks = document.querySelectorAll(".skill-rank");
  var items = document.querySelectorAll(".skill-item");
  for (var i = 0; i < ranks.length; i++) {
    var input = ranks[i];
    input.dataset.oldVal = input.value;
    input.onchange = function() {
      var id = this.dataset.skill;
      var oldVal = parseInt(this.dataset.oldVal) || 0;
      var newVal = parseInt(this.value) || 0;
      if (newVal === oldVal) return;
      var base = getSkillIpBase(id);
      var cost = ipCostBetween(oldVal, newVal, base);
      if (cost > 0 && !payIpCost(cost)) {
        alert("Not enough Improvement Points! Need " + cost + " IP.");
        this.value = oldVal;
        return;
      }
      if (cost < 0) payIpCost(cost);
      state.skillRanks[id] = newVal;
      this.dataset.oldVal = newVal;
      renderSkills();
    };
  }
  for (var i = 0; i < items.length; i++) {
    items[i].onchange = function() {
      var id = this.dataset.skill;
      state.skillItem[id] = parseInt(this.value) || 0;
      renderSkills();
    };
  }
}

function renderHealth() {
  var body = state.stats.body || 2;
  var hpMax = calcHitsMax(body);
  document.getElementById("hp_max").value = hpMax;
  document.getElementById("hp_seriously").value = calcSeriouslyWounded(hpMax);
  document.getElementById("hp_death").value = calcDeathSave(hpMax);
  var cur = document.getElementById("hp_current");
  if (!cur.value || parseInt(cur.value) === 0) cur.value = hpMax;
}

function renderHumanity() {
  var emp = state.stats.emp || 2;
  var humMax = calcHumanityMax(emp);
  var hcTotal = totalCyberwareHC(state.cyberware);
  var humCur = calcCurrentHumanity(humMax, hcTotal);
  var empFromHum = calcEmpFromHumanity(humCur);
  document.getElementById("hum_max").value = humMax;
  document.getElementById("hum_hc_total").value = hcTotal;
  document.getElementById("hum_current").value = humCur;
  document.getElementById("hum_emp").value = empFromHum;
}

function renderWeapons() {
  var tbody = document.getElementById("weapons_body");
  tbody.innerHTML = "";
  for (var i = 0; i < state.weapons.length; i++) {
    var w = state.weapons[i];
    var tr = document.createElement("tr");
    tr.innerHTML = '<td>' + w.name + '</td><td>' + w.dmg + '</td><td>' + (w.rof || "-") + '</td><td>' + (w.mag || "-") + '</td><td>' + (w.type || "") + '</td><td><input type="number" class="weapon-rank" data-idx="' + i + '" value="' + (w.rank || 0) + '" min="0" max="20" style="width:45px"></td><td><button class="btn-action weapon-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
    tbody.appendChild(tr);
  }
  attachWeaponEvents();
}

function attachWeaponEvents() {
  var removes = document.querySelectorAll(".weapon-remove");
  var ranks = document.querySelectorAll(".weapon-rank");
  for (var i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      var idx = parseInt(this.dataset.idx);
      state.weapons.splice(idx, 1);
      renderWeapons();
    };
  }
  for (var i = 0; i < ranks.length; i++) {
    ranks[i].onchange = function() {
      var idx = parseInt(this.dataset.idx);
      state.weapons[idx].rank = parseInt(this.value) || 0;
    };
  }
}

function renderArmor() {
  var tbody = document.getElementById("armor_body");
  tbody.innerHTML = "";
  var bodySP = 0;
  var headSP = 0;
  for (var i = 0; i < state.armor.length; i++) {
    var a = state.armor[i];
    var tr = document.createElement("tr");
    tr.innerHTML = '<td>' + a.name + '</td><td>' + a.sp + '</td><td>' + a.slots + '</td><td>' + a.enc + '</td><td><button class="btn-action armor-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
    tbody.appendChild(tr);
    if (a.slots === "Body") bodySP = Math.max(bodySP, a.sp);
    if (a.slots === "Head") headSP = Math.max(headSP, a.sp);
    if (a.slots === "Shield") bodySP = Math.max(bodySP, a.sp);
  }
  document.getElementById("armor_total_sp_body").textContent = bodySP;
  document.getElementById("armor_total_sp_head").textContent = headSP;
  var removes = document.querySelectorAll(".armor-remove");
  for (var i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      var idx = parseInt(this.dataset.idx);
      state.armor.splice(idx, 1);
      renderArmor();
      renderHumanity();
    };
  }
}

function renderCyberware() {
  var tbody = document.getElementById("cyberware_body");
  tbody.innerHTML = "";
  for (var i = 0; i < state.cyberware.length; i++) {
    var c = state.cyberware[i];
    if (c.slots) {
      renderCyberwareRow(tbody, c, i, true);
      for (var s = 0; s < c.slots; s++) {
        renderCyberwareSlot(tbody, c, i, s);
      }
    } else {
      renderCyberwareRow(tbody, c, i, false);
    }
  }
  attachCyberwareEvents();
}

function renderCyberwareRow(tbody, c, idx) {
  var tr = document.createElement("tr");
  var bonusHtml = formatCyberBonus(c.bonus);
  tr.innerHTML = '<td>' + c.name + '</td><td>' + c.type + '</td><td>' + (c.hc || 0) + '</td><td>' + (c.cost || 0) + 'eb</td><td><small>' + bonusHtml + '</small></td><td><small>' + (c.desc || '') + '</small></td><td><button class="btn-action cyberware-remove" data-idx="' + idx + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
  tbody.appendChild(tr);
}

function renderCyberwareSlot(tbody, parent, parentIdx, slotIdx) {
  var option = (parent.options && parent.options[slotIdx]) || null;
  var available = getOptionsForParent(parent.id);
  var tr = document.createElement("tr");
  tr.style.background = "rgba(128,128,128,0.05)";
  tr.style.fontSize = "0.85rem";
  if (!option) tr.className = "cyber-slot-empty";
  var selectHtml = '<select class="cyber-slot-select" data-parent="' + parentIdx + '" data-slot="' + slotIdx + '" style="width:100%;font-size:0.8rem">';
  selectHtml += '<option value="">-- Empty --</option>';
  for (var oi = 0; oi < available.length; oi++) {
    var opt = available[oi];
    var sel = (option && option.id === opt.id) ? ' selected' : '';
    selectHtml += '<option value="' + opt.id + '"' + sel + '>' + opt.name + ' (' + opt.cost + 'eb, ' + (opt.hc || 0) + 'HC)' + '</option>';
  }
  selectHtml += '</select>';
  tr.innerHTML = '<td style="padding-left:1.5rem;border-top:none" colspan="6">Slot ' + (slotIdx + 1) + ': ' + selectHtml + '</td><td style="border-top:none"></td>';
  tbody.appendChild(tr);
}

function getOptionsForParent(parentId) {
  var result = [];
  for (var i = 0; i < DATA.cyberware.length; i++) {
    if (DATA.cyberware[i].parentType === parentId) {
      result.push(DATA.cyberware[i]);
    }
  }
  return result;
}

function attachCyberwareEvents() {
  var removes = document.querySelectorAll(".cyberware-remove");
  for (var i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      var idx = parseInt(this.dataset.idx);
      state.cyberware.splice(idx, 1);
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
    };
  }
  var selects = document.querySelectorAll(".cyber-slot-select");
  for (var i = 0; i < selects.length; i++) {
    selects[i].onclick = function(e) { e.stopPropagation(); };
    selects[i].onchange = function() {
      var parentIdx = parseInt(this.dataset.parent);
      var slotIdx = parseInt(this.dataset.slot);
      var optionId = this.value;
      var parent = state.cyberware[parentIdx];
      if (!parent) return;
      if (!parent.options) parent.options = [];
      if (optionId) {
        var item = getDataItemById(optionId);
        if (item) {
          parent.options[slotIdx] = { id: item.id, name: item.name, hc: item.hc || 0, cost: item.cost || 0, desc: item.desc || '', bonus: item.bonus || null, parentType: item.parentType };
        }
      } else {
        parent.options[slotIdx] = null;
      }
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
    };
  }
}

function getDataItemById(id) {
  for (var i = 0; i < DATA.cyberware.length; i++) {
    if (DATA.cyberware[i].id === id) return DATA.cyberware[i];
  }
  return null;
}

function renderGear() {
  var tbody = document.getElementById("gear_body");
  tbody.innerHTML = "";
  for (var i = 0; i < state.gear.length; i++) {
    var g = state.gear[i];
    var tr = document.createElement("tr");
    tr.innerHTML = '<td>' + g.name + '</td><td>' + (g.cat || "-") + '</td><td>' + g.cost + 'eb</td><td><input type="number" class="gear-qty" data-idx="' + i + '" value="' + (g.qty || 1) + '" min="1" style="width:45px"></td><td><button class="btn-action gear-remove" data-idx="' + i + '" style="font-size:0.75rem;padding:0.2rem 0.4rem">X</button></td>';
    tbody.appendChild(tr);
  }
  var removes = document.querySelectorAll(".gear-remove");
  var qtys = document.querySelectorAll(".gear-qty");
  for (var i = 0; i < removes.length; i++) {
    removes[i].onclick = function() {
      var idx = parseInt(this.dataset.idx);
      state.gear.splice(idx, 1);
      renderGear();
    };
  }
  for (var i = 0; i < qtys.length; i++) {
    qtys[i].onchange = function() {
      var idx = parseInt(this.dataset.idx);
      state.gear[idx].qty = parseInt(this.value) || 1;
    };
  }
}

function initLifepath() {
  var fields = ["lp_background", "lp_motivation", "lp_hairstyle", "lp_clothing", "lp_event"];
  var dataKeys = ["backgrounds", "motivations", "hairstyles", "clothing_styles", "life_events"];
  for (var f = 0; f < fields.length; f++) {
    var sel = document.getElementById(fields[f]);
    sel.innerHTML = '<option value="">-- Random --</option>';
    var items = DATA.lifepath[dataKeys[f]];
    for (var i = 0; i < items.length; i++) {
      var opt = document.createElement("option");
      opt.value = items[i];
      opt.textContent = items[i];
      sel.appendChild(opt);
    }
  }
  document.getElementById("lp_random_btn").onclick = randomLifepath;
}

function randomLifepath() {
  var fields = ["lp_background", "lp_motivation", "lp_hairstyle", "lp_clothing", "lp_event"];
  var dataKeys = ["backgrounds", "motivations", "hairstyles", "clothing_styles", "life_events"];
  for (var f = 0; f < fields.length; f++) {
    var sel = document.getElementById(fields[f]);
    var items = DATA.lifepath[dataKeys[f]];
    var idx = Math.floor(Math.random() * items.length);
    sel.value = items[idx];
  }
}

function initAddButtons() {
  document.getElementById("add_weapon_btn").onclick = function() {
    showItemSelector("weapon", DATA.weapons, function(item) {
      state.weapons.push({ id: item.id, name: item.name, dmg: item.dmg, rof: item.rof, mag: item.mag, type: item.type, rank: 0 });
      renderWeapons();
    }, "type");
  };
  document.getElementById("add_armor_btn").onclick = function() {
    showItemSelector("armor", DATA.armor, function(item) {
      state.armor.push({ id: item.id, name: item.name, sp: item.sp, slots: item.slots, enc: item.enc });
      renderArmor();
      renderHumanity();
    });
  };
  document.getElementById("add_cyberware_btn").onclick = function() {
    showItemSelector("cyberware", DATA.cyberware, function(item) {
      var bodyPart = item.bodyPart;
      if (bodyPart) {
        var limits = { eye: 2, arm: 2, leg: 2 };
        var max = limits[bodyPart] || 99;
        var count = 0;
        for (var i = 0; i < state.cyberware.length; i++) {
          var dataItem = getDataItemById(state.cyberware[i].id);
          if (dataItem && dataItem.bodyPart === bodyPart) count++;
        }
        if (count >= max) {
          alert("Maximum " + max + " " + bodyPart + "(s) allowed. Remove one first.");
          return;
        }
      }
      var entry = { id: item.id, name: item.name, type: item.type, hc: item.hc, cost: item.cost, desc: item.desc || '', bonus: item.bonus || null };
      if (item.slots) { entry.slots = item.slots; entry.options = []; }
      state.cyberware.push(entry);
      renderCyberware();
      renderHumanity();
      renderStats();
      renderSkills();
    }, "type");
  };
  document.getElementById("add_gear_btn").onclick = function() {
    var allGear = DATA.gear.concat(DATA.fashion.map(function(f) { return { id: f.id, name: f.name, cost: f.cost, cat: "Fashion" }; }));
    showItemSelector("gear", allGear, function(item) {
      state.gear.push({ id: item.id, name: item.name, cost: item.cost, cat: item.cat || "Gear", qty: 1 });
      renderGear();
    }, "cat");
  };
}

function showItemSelector(type, items, callback, groupBy) {
  var overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.style.display = "flex";
  var box = document.createElement("div");
  box.className = "modal-box";
  box.style.maxWidth = "600px";
  var title = type.charAt(0).toUpperCase() + type.slice(1);
  box.innerHTML = '<h2>Select ' + title + '</h2><div style="max-height:400px;overflow-y:auto;margin:1rem 0">';
  var list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "4px";
  var customBtn = document.createElement("button");
  customBtn.className = "btn-action";
  customBtn.style.textAlign = "left";
  customBtn.style.justifyContent = "flex-start";
  customBtn.style.width = "100%";
  customBtn.style.background = "var(--accent)";
  customBtn.style.color = "#fff";
  customBtn.style.fontWeight = "700";
  customBtn.textContent = "\u270E Custom " + title;
  customBtn.onclick = function() {
    var name = prompt("Enter " + title + " name:");
    if (!name) return;
    if (type === "weapon") {
      var dmg = prompt("Damage dice (e.g. 3d6):") || "1d6";
      var wType = prompt("Weapon skill (Handgun, Shoulder Arms, Melee, etc.):") || "Handgun";
      var cost = parseInt(prompt("Cost in eb:") || "0");
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, dmg: dmg, type: wType, rof: 1, mag: null, conceal: "Varies", cost: cost, rank: 0 });
    } else if (type === "armor") {
      var sp = parseInt(prompt("SP value:") || "0");
      var slots = prompt("Slots (Body, Head, Shield):") || "Body";
      var enc = parseInt(prompt("Encumbrance:") || "0");
      var cost = parseInt(prompt("Cost in eb:") || "0");
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, sp: sp, slots: slots, enc: enc, cost: cost });
    } else if (type === "cyberware") {
      var cType = prompt("Type (Fashion, Internal, Neuralware, etc.):") || "Fashion";
      var hc = parseInt(prompt("Humanity Cost:") || "0");
      var cost = parseInt(prompt("Cost in eb:") || "0");
      var desc = prompt("Description:") || "";
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, type: cType, hc: hc, cost: cost, desc: desc, bonus: null });
    } else {
      var cost = parseInt(prompt("Cost in eb:") || "0");
      var cat = prompt("Category (Gear, Fashion, Electronics, Medical, etc.):") || "Gear";
      document.body.removeChild(overlay);
      callback({ id: "custom_" + Date.now(), name: name, cost: cost, cat: cat, qty: 1 });
    }
  };
  list.appendChild(customBtn);
  if (groupBy) {
    items = items.slice().sort(function(a, b) {
      var ga = (a[groupBy] || "Other").toUpperCase();
      var gb = (b[groupBy] || "Other").toUpperCase();
      if (ga < gb) return -1;
      if (ga > gb) return 1;
      return 0;
    });
  }
  var lastGroup = null;
  for (var i = 0; i < items.length; i++) {
    var group = groupBy ? (items[i][groupBy] || "Other") : null;
    if (group !== null && group !== lastGroup) {
      var header = document.createElement("div");
      header.textContent = group;
      header.style.fontWeight = "700";
      header.style.padding = "0.5rem 0.25rem 0.25rem";
      header.style.color = "var(--accent)";
      header.style.fontSize = "0.85rem";
      header.style.textTransform = "uppercase";
      header.style.borderBottom = "1px solid var(--border)";
      list.appendChild(header);
      lastGroup = group;
    }
    var btn = document.createElement("button");
    btn.className = "btn-action";
    btn.style.textAlign = "left";
    btn.style.justifyContent = "flex-start";
    btn.style.width = "100%";
    btn.style.background = "var(--stat-row-bg)";
    btn.style.color = "var(--text)";
    var label = items[i].name;
    if (items[i].cost) label += " (" + items[i].cost + "eb)";
    if (items[i].hc !== undefined) label += " [HC: " + items[i].hc + "]";
    if (items[i].dmg) label += " [" + items[i].dmg + "]";
    btn.textContent = label;
    (function(item) {
      btn.onclick = function() {
        document.body.removeChild(overlay);
        callback(item);
      };
    })(items[i]);
    list.appendChild(btn);
  }
  box.appendChild(list);
  var closeBtn = document.createElement("button");
  closeBtn.className = "btn-action";
  closeBtn.textContent = "Cancel";
  closeBtn.style.marginTop = "0.5rem";
  closeBtn.onclick = function() { document.body.removeChild(overlay); };
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
  var data = {
    handle: document.getElementById("char_handle").value,
    name: document.getElementById("char_name").value,
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
  document.getElementById("char_handle").value = data.handle || "";
  document.getElementById("char_name").value = data.name || "";
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
    for (var id in data.stats) {
      if (state.stats[id] !== undefined) state.stats[id] = data.stats[id];
    }
  }
  state.skillRanks = data.skillRanks || {};
  state.skillItem = data.skillItem || {};
  state.weapons = data.weapons || [];
  state.armor = data.armor || [];
  state.cyberware = data.cyberware || [];
  state.gear = data.gear || [];
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
  renderStats();
  renderSkills();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  updateAllDerived();
  updateStatPointsBar();
}

function generateRandomCharacter() {
  resetCharacter();
  var roleIdx = Math.floor(Math.random() * DATA.roles.length);
  var role = DATA.roles[roleIdx];
  document.getElementById("role_select").value = role.id;
  updateSecondaryRoleOptions();
  document.getElementById("role_ability_rank").value = "4";
  var prefixes = ["Blitz","Cipher","Dash","Echo","Flux","Ghost","Havoc","Jinx","Karma","Locke","Morph","Nyx","Onyx","Pixel","Quake","Reef","Shade","Trigger","Vex","Whisper","Zero","Ace","Byte","Creed","Dust","Ember","Fuse","Grim","Hex","Ice"];
  var suffixes = ["dog","cat","wolf","fox","hawk","rat","viper","shark","raven","panther","tiger","bear","owl","eagle","hound","jackal","coyote","lynx","striker","runner"];
  document.getElementById("char_handle").value = prefixes[Math.floor(Math.random()*prefixes.length)]+" "+suffixes[Math.floor(Math.random()*suffixes.length)];
  document.getElementById("char_age").value = String(18+Math.floor(Math.random()*20));
  var pts = STAT_POINTS_TOTAL;
  var st = {};
  for (var i=0;i<DATA.stats.length;i++) st[DATA.stats[i].id]=STAT_MIN;
  pts -= STAT_MIN*DATA.stats.length;
  while (pts>0) { var si=Math.floor(Math.random()*DATA.stats.length); var sid=DATA.stats[si].id; if (st[sid]<STAT_MAX) { st[sid]++; pts--; } }
  for (var i=0;i<DATA.stats.length;i++) state.stats[DATA.stats[i].id]=st[DATA.stats[i].id];
  var allSks=[];
  for (var cat in DATA.skills) allSks=allSks.concat(DATA.skills[cat]);
  state.skillRanks={};
  var sp=38;
  while (sp>0) { var sk=allSks[Math.floor(Math.random()*allSks.length)]; if (!state.skillRanks[sk.id]) state.skillRanks[sk.id]=0; if (state.skillRanks[sk.id]<6) { state.skillRanks[sk.id]++; sp--; } }
  var lpF=["lp_background","lp_motivation","lp_hairstyle","lp_clothing","lp_event"];
  var lpK=["backgrounds","motivations","hairstyles","clothing_styles","life_events"];
  for (var f=0;f<lpF.length;f++) document.getElementById(lpF[f]).value=DATA.lifepath[lpK[f]][Math.floor(Math.random()*DATA.lifepath[lpK[f]].length)];
  var w=DATA.weapons[Math.floor(Math.random()*DATA.weapons.length)];
  state.weapons.push({id:w.id,name:w.name,dmg:w.dmg,rof:w.rof||1,mag:w.mag,type:w.type,rank:0});
  var ap=[DATA.armor[7],DATA.armor[8],DATA.armor[9],DATA.armor[2],DATA.armor[1]];
  var a=ap[Math.floor(Math.random()*ap.length)];
  state.armor.push({id:a.id,name:a.name,sp:a.sp,slots:a.slots,enc:a.enc});
  var gIds=["agent","flashlight","rope","duct_tape","first_aid_kit"];
  for (var g=0;g<gIds.length;g++) { var gi=DATA.gear.find(function(x){return x.id===gIds[g];}); if (gi) state.gear.push({id:gi.id,name:gi.name,cost:gi.cost,cat:gi.cat||"Gear",qty:1}); }
  document.getElementById("hp_current").value=calcHitsMax(state.stats.body||2);
  renderStats();renderSkills();renderWeapons();renderArmor();renderCyberware();renderGear();
  updateAllDerived();updateStatPointsBar();updateRoleInfo();
}
