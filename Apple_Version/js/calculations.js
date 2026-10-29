// ============================================================
// STATE — Runtime character state object
// ============================================================
const STAT_POINTS_TOTAL = 62;
const STAT_MAX = 8;
const STAT_MIN = 2;

// CALCULATION HELPERS
// ============================================================

/**
 * calcHitsMax(body, will)
 * Formula from the rulebook: Hit points = 10 + (5 * average of BODY and WILL rounded up).
 */
const calcHitsMax = (body, will) => 10 + 5 * Math.ceil((body + will) / 2);

/**
 * calcSeriouslyWounded(hitsMax)
 * You are Seriously Wounded when you drop below half your maximum Hit Points.
 */
const calcSeriouslyWounded = (hitsMax) => Math.floor(hitsMax / 2);

/**
 * calcDeathSave(body)
 * Your base Death Save value is simply your BODY stat.
 */
const calcDeathSave = (body) => body;

/**
 * calcHumanityMax(emp)
 * Maximum humanity is 10 times your Empathy stat.
 */
const calcHumanityMax = (emp) => emp * 10;

/**
 * calcCurrentHumanity(humanityMax, cyberwareHC)
 * Every piece of cyberware you install costs Humanity (HC). 
 * This deducts that total from your Max Humanity.
 */
const calcCurrentHumanity = (humanityMax, cyberwareHC) => Math.max(0, humanityMax - cyberwareHC);

/**
 * calcEmpFromHumanity(currentHumanity)
 * Your "effective" Empathy drops as your Humanity drops. 
 * E.g., if you have 45 Humanity, your effective EMP is 4.
 */
const calcEmpFromHumanity = (currentHumanity) => Math.floor(currentHumanity / 10);

/**
 * calcStatBonus(statValue)
 * Ensures that stats don't drop below 0 when calculating skill totals.
 */
const calcStatBonus = (statValue) => (statValue <= 0 ? 0 : statValue);

/**
 * getEffectiveStat(statId)
 * Returns the final value of a stat (like DEX or REF).
 * It applies special rules:
 * 1. Empathy (EMP) goes down if you install lots of cyberware.
 * 2. Cyberware (like Muscle and Bone Lace) and Gear can boost your base stats.
 */
const getEffectiveStat = (statId) => {
  let base = Number(state.stats[statId]) || 2;
  if (statId === "emp") {
    const humMax = calcHumanityMax(base);
    const hcTotal = totalCyberwareHC(state.cyberware);
    const humCur = calcCurrentHumanity(humMax, hcTotal);
    base = calcEmpFromHumanity(humCur);
  }
  return base + calcCyberStatBonus(statId) + calcGearStatBonus(statId);
};

/**
 * calcSkillTotal(...)
 * The core roll of the game! 
 * Total Skill = The Base Stat + Skill Ranks + Item Bonuses + Cyberware Bonuses
 */
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

// ============================================================
// CYBERWARE & GEAR SUMMARY & CACHING (Unified Single-Pass O(1) Lookups)
// ============================================================
let _cyberCache = null;
let _gearCache = null;

const invalidateCyberCache = () => {
  _cyberCache = null;
};

const invalidateGearCache = () => {
  _gearCache = null;
};

/**
 * getCyberwareSummary(cyberwareList)
 * Traverses installed cyberware in a single pass, computing:
 * - totalHC: Total Humanity Cost
 * - statsBonus: Map of statId -> bonus (+2 BODY, etc.)
 * - skillsBonus: Map of skillId -> bonus (+2 Perception, etc.)
 * - hasKerenzikov: Boolean flag for initiative calculation
 * Results are cached until cyberware changes.
 */
const getCyberwareSummary = (cyberwareList) => {
  const list = cyberwareList || (typeof state !== "undefined" ? state.cyberware : null);
  if (!cyberwareList && _cyberCache) return _cyberCache;

  let totalHC = 0;
  const statsBonus = Object.create(null);
  const skillsBonus = Object.create(null);
  let hasKerenzikov = false;

  const traverse = (items) => {
    if (!items || !items.length) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      totalHC += item.hc || 0;
      if (item.id === "kerenzikov") hasKerenzikov = true;
      if (item.bonus) {
        if (item.bonus.skills) {
          for (const sk in item.bonus.skills) {
            skillsBonus[sk] = (skillsBonus[sk] || 0) + (Number(item.bonus.skills[sk]) || 0);
          }
        }
        if (item.bonus.stats) {
          for (const st in item.bonus.stats) {
            statsBonus[st] = (statsBonus[st] || 0) + (Number(item.bonus.stats[st]) || 0);
          }
        }
      }
      if (item.options && item.options.length) {
        traverse(item.options);
      }
    }
  };

  traverse(list);

  const summary = { totalHC, statsBonus, skillsBonus, hasKerenzikov };
  if (!cyberwareList) _cyberCache = summary;
  return summary;
};

/**
 * getGearSummary(gearList)
 * Traverses equipped gear (and installed gear slot options) in a single pass, computing:
 * - statsBonus: Map of statId -> bonus (+2 BODY, etc.)
 * - skillsBonus: Map of skillId -> bonus (+2 Pick Lock, etc.)
 * Results are cached until gear changes.
 */
const getGearSummary = (gearList) => {
  const list = gearList || (typeof state !== "undefined" ? state.gear : null);
  if (!gearList && _gearCache) return _gearCache;

  const statsBonus = Object.create(null);
  const skillsBonus = Object.create(null);

  const traverse = (items) => {
    if (!items || !items.length) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      if (item.bonus) {
        if (item.bonus.skills) {
          for (const sk in item.bonus.skills) {
            skillsBonus[sk] = (skillsBonus[sk] || 0) + (Number(item.bonus.skills[sk]) || 0);
          }
        }
        if (item.bonus.stats) {
          for (const st in item.bonus.stats) {
            statsBonus[st] = (statsBonus[st] || 0) + (Number(item.bonus.stats[st]) || 0);
          }
        }
      }
      if (item.options && item.options.length) {
        traverse(item.options);
      }
    }
  };

  traverse(list);

  const summary = { statsBonus, skillsBonus };
  if (!gearList) _gearCache = summary;
  return summary;
};

/**
 * totalCyberwareHC(cyberwareList)
 * Returns total Humanity Cost using the single-pass summary.
 */
const totalCyberwareHC = (cyberwareList) => {
  return getCyberwareSummary(cyberwareList).totalHC;
};

/**
 * calcEncumbrance(gearItems, weapons, armor)
 * Optional rule calculation for how much weight you are carrying.
 */
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

/**
 * calcInitiative(ref, combatAwarenessRank)
 * Initiative determines turn order in combat. 
 * It's REF + Solo's Combat Awareness (+2 with Kerenzikov).
 */
const calcInitiative = (ref, combatAwarenessRank) => {
  let init = ref + (combatAwarenessRank || 0);
  if (getCyberwareSummary().hasKerenzikov) init += 2;
  return init;
};

/**
 * calcSkillCyberBonus(skillId)
 * Returns bonus to a specific skill in O(1) from the cyberware summary.
 */
const calcSkillCyberBonus = (skillId) => {
  const sb = getCyberwareSummary().skillsBonus;
  let val = sb[skillId] || 0;
  if (skillId) {
    const idx = skillId.lastIndexOf('_');
    if (idx !== -1 && !isNaN(skillId.substring(idx + 1))) {
      const baseId = skillId.substring(0, idx);
      val += sb[baseId] || 0;
    }
  }
  return val;
};

/**
 * calcSkillGearBonus(skillId)
 * Returns bonus to a specific skill in O(1) from the gear summary.
 */
const calcSkillGearBonus = (skillId) => {
  const sb = getGearSummary().skillsBonus;
  let val = sb[skillId] || 0;
  if (skillId) {
    const idx = skillId.lastIndexOf('_');
    if (idx !== -1 && !isNaN(skillId.substring(idx + 1))) {
      const baseId = skillId.substring(0, idx);
      val += sb[baseId] || 0;
    }
  }
  return val;
};

/**
 * calcCyberStatBonus(statId)
 * Returns bonus to a core STAT in O(1) from the cyberware summary.
 */
const calcCyberStatBonus = (statId) => {
  return getCyberwareSummary().statsBonus[statId] || 0;
};

/**
 * calcGearStatBonus(statId)
 * Returns bonus to a core STAT in O(1) from the gear summary.
 */
const calcGearStatBonus = (statId) => {
  return getGearSummary().statsBonus[statId] || 0;
};

/**
 * formatCyberBonus(bonus)
 * A helper that takes a cyberware or gear bonus object (like { skills: { stealth: 2 } })
 * and formats it into a nice string for the UI: "+2 Stealth".
 */
const formatCyberBonus = (bonus) => {
  if (!bonus) return "";
  const parts = [];
  if (bonus.skills) {
    for (const id in bonus.skills) {
      const v = bonus.skills[id];
      if (!v) continue;
      parts.push(`${v > 0 ? '+' : ''}${v} ${skillNameById(id)}`);
    }
  }
  if (bonus.stats) {
    for (const id in bonus.stats) {
      const v = bonus.stats[id];
      if (!v) continue;
      parts.push(`${v > 0 ? '+' : ''}${v} ${id.toUpperCase()}`);
    }
  }
  return parts.join(", ");
};

const skillNameById = (id) => {
  const idxItem = DATA._index?.skillById[id];
  if (idxItem) return idxItem.skill.name;
  if (id) {
    const idx = id.lastIndexOf('_');
    if (idx !== -1 && !isNaN(id.substring(idx + 1))) {
      const baseId = id.substring(0, idx);
      const subNum = id.substring(idx + 1);
      const baseItem = DATA._index?.skillById[baseId];
      if (baseItem) {
        const customSub = (typeof state !== "undefined" && state.subSkillNames && state.subSkillNames[id]) ? state.subSkillNames[id] : `#${subNum}`;
        return `${baseItem.skill.name} (${customSub})`;
      }
    }
  }
  return id;
};
