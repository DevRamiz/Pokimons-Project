const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFavorites, addFavorite, removeFavorite } = require('../services/userService');
const { createObjectCsvStringifier } = require('csv-writer');

const router = express.Router();

router.get('/users/:userId/favorites', requireAuth, async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const ids = await getFavorites(req.user.id);
  res.json({ favorites: ids });
});

router.post('/users/:userId/favorites', requireAuth, async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { pokemonId } = req.body || {};
    const list = await addFavorite(req.user.id, String(pokemonId), 10);
    res.status(201).json({ favorites: list });
  } catch (err) {
    if (err.code === 'LIMIT') return res.status(400).json({ error: 'Favorites limit (10) reached' });
    console.error(err); res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/users/:userId/favorites/:pokemonId', requireAuth, async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const list = await removeFavorite(req.user.id, req.params.pokemonId);
  res.json({ favorites: list });
});

router.get('/users/:userId/favorites/download', requireAuth, async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const ids = await getFavorites(req.user.id);
  const csv = createObjectCsvStringifier({ header: [{ id: 'id', title: 'pokemon_id' }] });
  const csvHeader = csv.getHeaderString();
  const csvBody = csv.stringifyRecords(ids.map(id => ({ id })));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="favorites.csv"');
  res.send(csvHeader + csvBody);
});

module.exports = router;
