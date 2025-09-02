const API = "";
async function loadLeaderboard(){
  const lbWrap  = document.getElementById('lbWrap');
  const table   = document.getElementById('lbTable');
  const tbody   = table.querySelector('tbody');
  lbWrap.textContent = "Loading...";
  table.style.display = "none"; tbody.innerHTML = "";
  try {
    const r = await fetch(API + "/arena/leaderboard", { credentials:"include" });
    const data = await r.json();
    if (!r.ok) { lbWrap.textContent = data.error || "Failed to load leaderboard"; return; }
    const list = data.leaderboard || [];
    if (!list.length) { lbWrap.textContent = "No qualifying players yet."; return; }
    list.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>#${i+1}</td>
        <td>${escapeHtml(row.firstName)} <span class="muted">(${escapeHtml(row.email)})</span></td>
        <td>${row.games}</td><td>${row.wins}</td><td>${row.ties}</td><td>${row.losses}</td>
        <td><b>${row.points}</b></td><td>${row.successRate}%</td>`;
      tbody.appendChild(tr);
    });
    lbWrap.textContent = ""; table.style.display = "";
  } catch (e) {
    console.error(e); lbWrap.textContent = "Failed to load leaderboard";
  }
}
function escapeHtml(s){ return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
loadLeaderboard();
