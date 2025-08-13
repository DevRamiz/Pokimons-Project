const axios = require('axios');

async function fetchPokemon(idOrName) {
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(idOrName)}`;
  const { data } = await axios.get(url, { timeout: 12000 });

  const stats = {}; for (const s of data.stats) stats[s.stat.name] = s.base_stat;

  const name = data.name;
  const image = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '';
  const types = (data.types || []).map(t => t.type?.name);

  return {
    id: String(data.id),
    name, image, types,
    stats: {
      hp: stats['hp'] ?? 0,
      attack: stats['attack'] ?? 0,
      defense: stats['defense'] ?? 0,
      speed: stats['speed'] ?? 0,
      specialAttack: stats['special-attack'] ?? 0,
      specialDefense: stats['special-defense'] ?? 0
    },
    youtubeQuery: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} pokemon`)}`
  };
}

module.exports = { fetchPokemon };
