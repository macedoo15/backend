// ============================================================
//  services/auth.service.js
//  Toda lógica de autenticação via Supabase Auth
// ============================================================

const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../config/env');

// Login com e-mail e senha
async function login(email, senha) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: senha }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error('E-mail ou senha incorretos.');
    err.statusCode = 401;
    throw err;
  }

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    data.expires_at,
    expires_in:    data.expires_in,
    token_type:    data.token_type,
  };
}

// Logout — revoga o token no Supabase
async function logout(token) {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (_) {
    // Logout nunca falha para o usuário
  }
}

// Verifica sessão e retorna dados do usuário
async function obterSessao(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = new Error('Sessão inválida.');
    err.statusCode = 401;
    throw err;
  }

  return res.json();
}

module.exports = { login, logout, obterSessao };
