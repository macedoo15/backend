// ============================================================
//  config/supabase.js — Cliente Supabase (apenas no servidor)
// ============================================================
const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY         = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  process.exit(1);
}

// Faz chamadas autenticadas ao Supabase REST API
async function supabaseFetch(path, options = {}, useServiceRole = false) {
  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'apikey':        key,
      'Authorization': `Bearer ${key}`,
      'Content-Type':  'application/json',
      ...options.headers,
    },
  });
}

// Verifica o token JWT do usuário junto ao Supabase
async function verificarToken(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

module.exports = { supabaseFetch, verificarToken };
