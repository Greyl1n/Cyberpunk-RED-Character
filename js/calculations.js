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

const calcInitiative = (ref, combatAwarenessRank) => ref + combatAwarenessRank;

const calcSkillCyberBonus = (skillId) => {
  let total = 0;
  for (const cw of state.cyberware) {
    if (cw.bonus && cw.bonus.skills && cw.bonus.skills[skillId]) {
      total += cw.bonus.skills[skillId];
    }
    if (cw.options) {
      for (const opt of cw.options) {
        if (opt && opt.bonus && opt.bonus.skills && opt.bonus.skills[skillId]) {
          total += opt.bonus.skills[skillId];
        }
      }
    }
  }
  return total;
};

const calcCyberStatBonus = (statId) => {
  let total = 0;
  for (const cw of state.cyberware) {
    if (cw.bonus && cw.bonus.stats && cw.bonus.stats[statId]) {
      total += cw.bonus.stats[statId];
    }
    if (cw.options) {
      for (const opt of cw.options) {
        if (opt && opt.bonus && opt.bonus.stats && opt.bonus.stats[statId]) {
          total += opt.bonus.stats[statId];
        }
      }
    }
  }
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