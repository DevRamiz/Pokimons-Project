const { listBattles } = require('./battlesService');
const { listUsers, publicUser } = require('./userService');

async function buildLeaderboard() {
  const [battles, users] = await Promise.all([listBattles(), listUsers()]);
  const byUser = new Map();

  for (const b of battles) {
    const agg = byUser.get(b.userId) || { games:0, wins:0, ties:0, losses:0, points:0, lastAt:null };
    agg.games++;
    if (b.result==='win') agg.wins++; else if (b.result==='tie') agg.ties++; else agg.losses++;
    agg.points += b.points;
    agg.lastAt = b.at;
    byUser.set(b.userId, agg);
  }

  const rows = [];
  for (const u of users) {
    const a = byUser.get(u.id);
    if (!a || a.games < 6) continue;
    const success = a.games ? (a.wins / a.games) * 100 : 0;
    rows.push({ ...publicUser(u), games:a.games, wins:a.wins, ties:a.ties, losses:a.losses, points:a.points, successRate:Number(success.toFixed(2)), lastAt:a.lastAt });
  }

  rows.sort((x,y)=> y.points - x.points || y.successRate - x.successRate || y.wins - x.wins || new Date(y.lastAt) - new Date(x.lastAt));
  return rows;
}

module.exports = { buildLeaderboard };
