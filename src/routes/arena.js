const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFavorites, listUsers, publicUser } = require('../services/userService');
const { fetchPokemon } = require('../services/pokemonService');
const { decide, pointsFor } = require('../services/battle');
const { addBattle, addBattlesPair } = require('../services/battlesService');
const { buildLeaderboard } = require('../services/leaderboard');

const router = express.Router();
function randGen1() { return String(1 + Math.floor(Math.random() * 151)); }

// Random vs Player — random Gen‑1 for both unless you override your pick
router.post('/arena/random-vs-player', requireAuth, async (req, res) => {
  try {
    const users = await listUsers();
    const others = users.filter(u => u.id !== req.user.id);
    if (!others.length) return res.status(400).json({ error: 'Need another user to battle' });
    const opponent = others[Math.floor(Math.random() * others.length)];

    const myId = req.body?.myPokemonId ? String(req.body.myPokemonId) : randGen1();
    const oppId = randGen1();

    const [me, opp] = await Promise.all([fetchPokemon(myId), fetchPokemon(oppId)]);
    const d = decide(me.stats, opp.stats);
    const myScore = d.a, oppScore = d.b;
    const result = d.winner === 'a' ? 'win' : d.winner === 'b' ? 'loss' : 'tie';

    await addBattlesPair(
      { userId:req.user.id, opponentType:'player', opponentId:opponent.id, myPokemonId:me.id,  oppPokemonId:opp.id, myScore, oppScore, result, points: pointsFor(result) },
      { userId:opponent.id, opponentType:'player', opponentId:req.user.id, myPokemonId:opp.id, oppPokemonId:me.id,  myScore:oppScore, oppScore:myScore, result: result==='win'?'loss':result==='loss'?'win':'tie', points: pointsFor(result==='win'?'loss':result==='loss'?'win':'tie') }
    );

    res.json({ mode:'random-vs-player', you:{ user: publicUser({ ...req.user }), pokemon: me, score: myScore }, opponent:{ user: publicUser(opponent), pokemon: opp, score: oppScore }, result });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Battle failed' });
  }
});

router.post('/arena/vs-bot', requireAuth, async (req, res) => {
  try {
    const myId = req.body?.myPokemonId ? String(req.body.myPokemonId) : randGen1();
    const botId = randGen1();
    const [me, bot] = await Promise.all([fetchPokemon(myId), fetchPokemon(botId)]);
    const d = decide(me.stats, bot.stats);
    const myScore = d.a, botScore = d.b;
    const result = d.winner === 'a' ? 'win' : d.winner === 'b' ? 'loss' : 'tie';
    await addBattle({ userId:req.user.id, opponentType:'bot', myPokemonId:me.id, oppPokemonId:bot.id, myScore, oppScore:botScore, result, points: pointsFor(result) });
    res.json({ mode:'vs-bot', you:{ pokemon: me, score: myScore }, opponent:{ kind:'bot', pokemon: bot, score: botScore }, result });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Bot battle failed' });
  }
});

// Favorites vs Player — both players must use favorites
router.post('/arena/favorites-vs-player', requireAuth, async (req, res) => {
  try {
    const users = await listUsers();
    const others = users.filter(u => u.id !== req.user.id);
    let opponent = null, oppFavs = [];
    const shuffled = others.sort(() => Math.random() - 0.5);
    for (const u of shuffled) {
      const f = await getFavorites(u.id);
      if (f.length) { opponent = u; oppFavs = f; break; }
    }
    if (!opponent) return res.status(400).json({ error: 'No opponents with favorites' });

    const myFavs = await getFavorites(req.user.id);
    if (!myFavs.length) return res.status(400).json({ error: 'Add favorites first' });

    const incoming = req.body?.myFavoriteId && String(req.body.myFavoriteId);
    let myId;
    if (incoming) {
      if (!myFavs.includes(incoming)) return res.status(400).json({ error: 'myFavoriteId must be one of your favorites' });
      myId = incoming;
    } else {
      myId = myFavs[Math.floor(Math.random() * myFavs.length)];
    }

    const oppId = oppFavs[Math.floor(Math.random() * oppFavs.length)];
    const [me, opp] = await Promise.all([fetchPokemon(myId), fetchPokemon(oppId)]);
    const d = decide(me.stats, opp.stats);
    const myScore = d.a, oppScore = d.b;
    const result = d.winner === 'a' ? 'win' : d.winner === 'b' ? 'loss' : 'tie';

    await addBattlesPair(
      { userId:req.user.id, opponentType:'player', opponentId:opponent.id, myPokemonId:me.id,  oppPokemonId:opp.id, myScore, oppScore, result, points: pointsFor(result) },
      { userId:opponent.id, opponentType:'player', opponentId:req.user.id, myPokemonId:opp.id, oppPokemonId:me.id,  myScore:oppScore, oppScore:myScore, result: result==='win'?'loss':result==='loss'?'win':'tie', points: pointsFor(result==='win'?'loss':result==='loss'?'win':'tie') }
    );

    res.json({ mode:'favorites-vs-player', you:{ user: publicUser({ ...req.user }), pokemon: me, score: myScore }, opponent:{ user: publicUser(opponent), pokemon: opp, score: oppScore }, result });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Battle failed' });
  }
});

router.get('/arena/leaderboard', async (_req, res) => {
  try { res.json({ leaderboard: await buildLeaderboard() }); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Failed to build leaderboard' }); }
});

module.exports = router;
