// ============================================================
// STATE — Runtime character state object
// ============================================================
const STAT_POINTS_TOTAL = 62;
const STAT_MAX = 8;
const STAT_MIN = 2;

// CALCULATION HELPERS
// ============================================================
const calcHitsMax = (body, will) => 10 + 5 * Math.ceil((body + will) / 2);

const calcSeriouslyWounded = (hitsMax) => Math.floor(hitsMax / 2);

const calcDeathSave = (body) => body;

const calcHumanityMax = (emp) => emp * 10;

const calcCurrentHumanity = (humanityMax, cyberwareHC) => Math.max(0, humanityMax - cyberwareHC);

const calcEmpFromHumanity = (currentHumanity) => Math.floor(currentHumanity / 10);

const calcStatBonus = (statValue) => (statValue <= 0 ? 0 : statValue);

const getEffectiveStat = (statId) => {
  let base = Number(state.stats[statId]) || 2;
  if (statId === "emp") {
    const humMax = calcHumanityMax(base);
    const hcTotal = totalCyberwareHC(state.cyberware);
    const humCur = calcCurrentHumanity(humMax, hcTotal);
    base = calcEmpFromHumanity(humCur);
  }
  return base + calcCyberStatBonus(statId);
};

const calcSkillTotal = (statValue, ranks, itemBonus, specialBonus) => {
  const statBonus = calcStatBonus(Number(statValue));
  return statBonus + Number(ranks) + Number(itemBonus || 0) + Number(specialBonus || 0);
};

const calcBmr = (move) => move * 5;

const calcRunBmr = (bmr) => bmr * 3;

const calcEvasionSkillRank = (dex, ranks, evasionBase) => {
  let rank = evasionBase || 0;
  if (rank === 0 && ranks > 0) rank = 1;
  return calcSkillTotal(dex, rank, 0, 0);
};

const totalCyberwareHC = (cyberwareList) => {
  let total = 0;
  if (!cyberwareList) return total;
  for (const cw of cyberwareList) {
    if (!cw) continue;
    total += cw.hc || 0;
    if (cw.options) {
      total += totalCyberwareHC(cw.options);
    }
  }
  return total;
};

const calcEncumbrance = (gearItems, weapons, armor) => {
  let totalWt = 0;
  for (const g of gearItems) {
    totalWt += g.wt || 0;
  }
  for (const w of weapons) {
    totalWt += 2;
  }
  for (const a of armor) {
    totalWt += a.enc || 0;
  }
  return totalWt;
};

const calcInitiative = (ref, combatAwarenessRank) => {
  let init = ref + combatAwarenessRank;
  // Check for Kerenzikov (+2 Initiative)
  let hasKerenzikov = false;
  const checkInit = (items) => {
    if (!items) return;
    for (const item of items) {
      if (item.id === "kerenzikov") hasKerenzikov = true;
      if (item.options) checkInit(item.options);
    }
  };
  checkInit(state.cyberware);
  if (hasKerenzikov) init += 2;
  return init;
};

const calcSkillCyberBonus = (skillId) => {
  let total = 0;
  let lightTattooCount = 0;
  let hasChemskin = false;
  let hasTechhair = false;
  let quickDigitsCount = 0;

  const sumBonus = (items) => {
    if (!items) return;
    for (const item of items) {
      if (item.id === "light_tattoo" || item.id === "kill_display" || item.id === "leads_turn_on_show_off_nails") {
        lightTattooCount++;
      }
      if (item.id === "chemskin") hasChemskin = true;
      if (item.id === "techhair") hasTechhair = true;
      if (item.id === "quick_digits") quickDigitsCount++;
      
      if (item.bonus && item.bonus.skills && item.bonus.skills[skillId]) {
        total += item.bonus.skills[skillId];
      }
      if (item.options) sumBonus(item.options);
    }
  };
  sumBonus(state.cyberware);

  // Conditional bonuses
  if (skillId === "wardrobe_style" && lightTattooCount >= 3) {
    total += 2;
  }
  if (skillId === "personal_grooming" && hasChemskin && hasTechhair) {
    total += 2;
  }
  
  const quickDigitsSkills = ["conceal_reveal_object", "contortionist", "first_aid", "forgery", "paramedic", "pick_lock", "pick_pocket"];
  if (quickDigitsCount >= 2 && quickDigitsSkills.includes(skillId)) {
    total += 1;
  }

  return total;
};

const calcCyberStatBonus = (statId) => {
  let total = 0;
  
  const sumBonus = (items) => {
    if (!items) return;
    for (const item of items) {
      if (item.bonus && item.bonus.stats && item.bonus.stats[statId]) {
        total += item.bonus.stats[statId];
      }
      if (item.options) sumBonus(item.options);
    }
  };
  sumBonus(state.cyberware);

  return total;
};

const formatCyberBonus = (bonus) => {
  if (!bonus) return "";
  const parts = [];
  if (bonus.skills) {
    for (const id in bonus.skills) {
      parts.push(`+${bonus.skills[id]} ${skillNameById(id)}`);
    }
  }
  if (bonus.stats) {
    for (const id in bonus.stats) {
      parts.push(`+${bonus.stats[id]} ${id.toUpperCase()}`);
    }
  }
  return parts.join(", ");
};

const skillNameById = (id) => {
  const idxItem = DATA._index?.skillById[id];
  return idxItem ? idxItem.skill.name : id;
};