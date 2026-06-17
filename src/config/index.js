// ============================================================
//  config/index.js — Configurações gerais da aplicação
// ============================================================
module.exports = {
  port:        Number(process.env.PORT || 3000),
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
};
