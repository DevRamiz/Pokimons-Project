import { me, escapeHtml } from './shared.js';
const API = "";
const favGrid   = document.getElementById('favGrid');
const emptyMsg  = document.getElementById('emptyMsg');
const sortSel   = document.getElementById('sortSelect');
const csvBtn    = document.getElementById('csvBtn');

sortSel.onchange = render;

async function getFavoritesIds(){
  const r = await fetch(API + `/users/${me.id}/favorites`, { credentials:"include" });
  if (!r.ok) throw new Error("Failed to load favorites");
  const { favorites } = await r.json();
  return favorites;
}
async function getPokemon(id){
  const r = await fetch(API + `/pokemon/${id}`, { credentials:"include" });
  if (!r.ok) throw new Error("Failed to load pokemon");
  return r.json();
}
async function render(){
  favGrid.innerHTML=""; emptyMsg.textContent="";
  if (!me) { emptyMsg.textContent="Login to see your favorites."; csvBtn.style.display="none"; return; }
  csvBtn.style.display = "inline-block";
  csvBtn.href = `/users/${me.id}/favorites/download`;
  const ids = await getFavoritesIds();
  if (!ids.length) { emptyMsg.textContent = "No Pokémon in favorites."; return; }
  const all = (await Promise.all(ids.map(getPokemon))).map(p => ({ id:p.id, name:p.name, img:p.image || "", types:p.types || [] }));
  const sorted = [...all].sort(sortFn(sortSel.value));
  favGrid.innerHTML = sorted.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div>${p.types.map(t=>`<span class="badge">${t}</span>`).join('')}</div>
      <p>#${p.id}</p>
      <button data-id="${p.id}">Remove</button>
    </div>`).join('');
  favGrid.querySelectorAll('button').forEach(btn => {
    btn.onclick = async () => {
      await fetch(API + `/users/${me.id}/favorites/${btn.dataset.id}`, { method:"DELETE", credentials:"include" });
      await render();
    };
  });
}
function sortFn(type){
  switch (type) {
    case 'id-desc':   return (a,b)=> Number(b.id)-Number(a.id);
    case 'name-asc':  return (a,b)=> a.name.localeCompare(b.name);
    case 'name-desc': return (a,b)=> b.name.localeCompare(a.name);
    default:          return (a,b)=> Number(a.id)-Number(b.id);
  }
}

render();
