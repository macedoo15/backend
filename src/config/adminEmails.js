// ============================================================
//  config/adminEmails.js — Lista de e-mails administradores
// ============================================================
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(user) {
  const email = String(user?.email || '').toLowerCase();
  const role  = user?.app_metadata?.role || user?.user_metadata?.role;
  if (ADMIN_EMAILS.length) return ADMIN_EMAILS.includes(email);
  return role === 'admin';
}

module.exports = { ADMIN_EMAILS, isAdmin };
