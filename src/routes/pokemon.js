const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { fetchPokemon } = require('../services/pokemonService');

const router = express.Router();

router.get('/pokemon/:id', requireAuth, async (req, res) => {
  try {
    const p = await fetchPokemon(req.params.id);
    res.json(p);
  } catch (err) { console.error(err?.response?.status, err?.message); res.status(502).json({ error: 'Failed to fetch Pokémon' }); }
});

module.exports = router;
