const API = "";
const form = document.getElementById('regForm');
const msg  = document.getElementById('regMsg');

const NAME_RE  = /^[A-Za-z]{2,50}$/;                             // letters only, 2–50
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                   // basic email
const PASS_RE  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{7,15}$/; // 7–15, A+a+special

function validate(p){
  const e = {};
  if (!NAME_RE.test(p.firstName || "")) e.firstName = "First name: letters only (A–Z), 2–50.";
  if (!EMAIL_RE.test(p.email || ""))   e.email = "Email: please enter a valid address.";
  if (!PASS_RE.test(p.password || "")) e.password = "Password: 7–15, include uppercase, lowercase & special.";
  if ((p.password||"") !== (p.confirmPassword||"")) e.confirmPassword = "Passwords do not match.";
  return e;
}
function showErrors(errs){ msg.innerHTML = Object.values(errs).map(t=>`<div>• ${t}</div>`).join(""); }

form.onsubmit = async (e) => {
  e.preventDefault();
  msg.textContent = "";
  const payload = Object.fromEntries(new FormData(form).entries());
  const errs = validate(payload);
  if (Object.keys(errs).length) return showErrors(errs);

  // server still validates too (PDF requires)
  const r = await fetch(API + "/register", {
    method:"POST", credentials:"include",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) { showErrors(data.errors||{}); if (!data.errors) msg.textContent = data.error || "Registration failed"; return; }
  location.href = "index.html";
};