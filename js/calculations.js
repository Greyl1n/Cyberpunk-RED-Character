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
