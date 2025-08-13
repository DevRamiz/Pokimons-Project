const NAME_RE = /^\p{L}{2,50}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{7,15}$/;

function validateRegister({ firstName, email, password, confirmPassword }) {
  const errors = {};
  if (!NAME_RE.test(firstName || '')) errors.firstName = 'First name 2–50 letters (no digits or symbols)';
  if (!EMAIL_RE.test(email || '')) errors.email = 'Invalid email';
  if (!PASS_RE.test(password || '')) errors.password = 'Password 7–15 with A/a and 1 special character';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

module.exports = { validateRegister };
