// ============================================================
//  config/env.js
//  Lê e valida todas as variáveis de ambiente necessárias
// ============================================================

module.exports = {
  PORT:                    process.env.PORT || 3000,
  SUPABASE_URL:            process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY:       process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE:   process.env.SUPABASE_SERVICE_ROLE_KEY,
  TURNSTILE_SECRET_KEY:    process.env.TURNSTILE_SECRET_KEY,
  ADMIN_EMAILS:            (process.env.ADMIN_EMAILS || '')
                             .split(',')
                             .map(e => e.trim().toLowerCase())
                             .filter(Boolean),
};
