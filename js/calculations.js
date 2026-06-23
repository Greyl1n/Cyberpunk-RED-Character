function calcHitsMax(body) {
  return body * 5 + 10;
}

function calcSeriouslyWounded(hitsMax) {
  return Math.floor(hitsMax / 2);
}

function calcDeathSave(hitsMax) {
  return -Math.floor(hitsMax / 2);
}

function calcHumanityMax(emp) {
  return emp * 10;
}

function calcCurrentHumanity(humanityMax, cyberwareHC) {
  return Math.max(0, humanityMax - cyberwareHC);
}

function calcEmpFromHumanity(currentHumanity) {
  return Math.floor(currentHumanity / 10);
}

function calcStatBonus(statValue) {
  if (statValue <= 0) return 0;
  return statValue;
}

function getEffectiveStat(statId) {
  var base = state.stats[statId] || 2;
  return base + calcCyberStatBonus(statId);
}

function calcSkillTotal(statValue, ranks, itemBonus, specialBonus) {
  var statBonus = calcStatBonus(statValue);
  return statBonus + ranks + (itemBonus || 0) + (specialBonus || 0);
}

function calcBmr(move) {
  return move * 5;
}

function calcRunBmr(bmr) {
  return bmr * 3;
}

function calcEvasionSkillRank(dex, ranks, evasionBase) {
  var rank = evasionBase || 0;
  if (rank === 0 && ranks > 0) rank = 1;
  return calcSkillTotal(dex, rank, 0, 0);
}

function totalCyberwareHC(cyberwareList) {
  var total = 0;
  for (var i = 0; i < cyberwareList.length; i++) {
    total += cyberwareList[i].hc || 0;
    if (cyberwareList[i].options) {
      for (var s = 0; s < cyberwareList[i].options.length; s++) {
        var opt = cyberwareList[i].options[s];
        if (opt) total += opt.hc || 0;
      }
    }
  }
  return total;
}

function calcEncumbrance(gearItems, weapons, armor) {
  var totalWt = 0;
  for (var i = 0; i < gearItems.length; i++) {
    totalWt += gearItems[i].wt || 0;
  }
  for (var i = 0; i < weapons.length; i++) {
    totalWt += 2;
  }
  for (var i = 0; i < armor.length; i++) {
    totalWt += armor[i].enc || 0;
  }
  return totalWt;
}

function calcInitiative(ref, combatAwarenessRank) {
  return ref + combatAwarenessRank;
}

function calcSkillCyberBonus(skillId) {
  var total = 0;
  for (var i = 0; i < state.cyberware.length; i++) {
    var cw = state.cyberware[i];
    if (cw.bonus && cw.bonus.skills && cw.bonus.skills[skillId]) {
      total += cw.bonus.skills[skillId];
    }
    if (cw.options) {
      for (var s = 0; s < cw.options.length; s++) {
        var opt = cw.options[s];
        if (opt && opt.bonus && opt.bonus.skills && opt.bonus.skills[skillId]) {
          total += opt.bonus.skills[skillId];
        }
      }
    }
  }
  return total;
}

function calcCyberStatBonus(statId) {
  var total = 0;
  for (var i = 0; i < state.cyberware.length; i++) {
    var cw = state.cyberware[i];
    if (cw.bonus && cw.bonus.stats && cw.bonus.stats[statId]) {
      total += cw.bonus.stats[statId];
    }
    if (cw.options) {
      for (var s = 0; s < cw.options.length; s++) {
        var opt = cw.options[s];
        if (opt && opt.bonus && opt.bonus.stats && opt.bonus.stats[statId]) {
          total += opt.bonus.stats[statId];
        }
      }
    }
  }
  return total;
}

function formatCyberBonus(bonus) {
  if (!bonus) return "";
  var parts = [];
  if (bonus.skills) {
    for (var id in bonus.skills) {
      parts.push("+" + bonus.skills[id] + " " + skillNameById(id));
    }
  }
  if (bonus.stats) {
    for (var id in bonus.stats) {
      parts.push("+" + bonus.stats[id] + " " + id.toUpperCase());
    }
  }
  return parts.join(", ");
}

function skillNameById(id) {
  for (var cat in DATA.skills) {
    var list = DATA.skills[cat];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i].name;
    }
  }
  return id;
}
