const { read, write } = require('../utils/db');

let last = Promise.resolve();
function withLock(fn) {
  last = last.then(fn, fn).catch(err => {
    console.error('Battles write error:', err);
  });
  return last;
}

async function listBattles() { return await read('battles'); }

async function addBattle(entry) {
  return withLock(async () => {
    const all = await read('battles');
    const rec = { id: String(all.length + 1), ...entry, at: entry.at || new Date().toISOString() };
    all.push(rec);
    await write('battles', all);
    return rec;
  });
}

async function addBattlesPair(leftEntry, rightEntry) {
  return withLock(async () => {
    const all = await read('battles');
    const left = { id: String(all.length + 1), ...leftEntry, at: leftEntry.at || new Date().toISOString() };
    const right = { id: String(all.length + 2), ...rightEntry, at: rightEntry.at || new Date().toISOString() };
    all.push(left, right);
    await write('battles', all);
    return [left, right];
  });
}

module.exports = { listBattles, addBattle, addBattlesPair };
