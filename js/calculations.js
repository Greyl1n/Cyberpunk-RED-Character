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
 * 2. Cyberware (like Muscle and Bone Lace) can boost your base stats.
 */
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

/**
 * totalCyberwareHC(cyberwareList)
 * A recursive function that looks through all your cyberware (and any attachments/options
 * inside that cyberware) and adds up the total Humanity Cost (HC).
 */
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
 * It's REF + Solo's Combat Awareness. 
 * If you have Kerenzikov cyberware installed, it adds a flat +2.
 */
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

/**
 * calcSkillCyberBonus(skillId)
 * Scans through your cyberware to see if any of it gives a bonus to a specific skill.
 * (e.g., A cyberaudio option that gives +2 to Perception).
 */
const calcSkillCyberBonus = (skillId) => {
  let total = 0;

  const sumBonus = (items) => {
    if (!items) return;
    for (const item of items) {
      if (item.bonus && item.bonus.skills && item.bonus.skills[skillId]) {
        total += item.bonus.skills[skillId];
      }
      if (item.options) sumBonus(item.options);
    }
  };
  sumBonus(state.cyberware);

  return total;
};

/**
 * calcCyberStatBonus(statId)
 * Scans through your cyberware to see if any of it gives a bonus to a core STAT.
 * (e.g., Muscle and Bone Lace gives +2 to BODY).
 */
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

/**
 * formatCyberBonus(bonus)
 * A helper that takes a cyberware bonus object (like { skills: { stealth: 2 } })
 * and formats it into a nice string for the UI: "+2 Stealth".
 */
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