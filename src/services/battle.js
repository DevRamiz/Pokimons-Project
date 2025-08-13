function baseScore(stats) {
  const { hp=0, attack=0, defense=0, speed=0 } = stats || {};
  const v = hp*0.3 + attack*0.4 + defense*0.2 + speed*0.1;
  return Number(v.toFixed(2));
}
function tiebreak(stats) {
  const { specialDefense=0, specialAttack=1 } = stats || {};
  return specialAttack ? specialDefense/specialAttack : 0;
}
function decide(aStats, bStats) {
  const a = baseScore(aStats), b = baseScore(bStats);
  if (a > b) return { winner:'a', a, b };
  if (a < b) return { winner:'b', a, b };
  const at = tiebreak(aStats), bt = tiebreak(bStats);
  if (at > bt) return { winner:'a', a, b };
  if (at < bt) return { winner:'b', a, b };
  return { winner:'tie', a, b };
}
function pointsFor(result) { return result==='win' ? 3 : result==='tie' ? 1 : 0; }

module.exports = { baseScore, tiebreak, decide, pointsFor };
