// ============================================================
//  services/authService.js — Autenticação via Supabase Auth
// ============================================================
const { supabaseFetch, verificarToken } = require('../config/supabase');
const { isAdmin } = require('../config/adminEmails');

async function login(email, senha) {
  if (!email || !senha) return { status: 400, error: 'E-mail e senha são obrigatórios.' };

  const res = await supabaseFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body:   JSON.stringify({ email, password: senha }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) return { status: 401, error: 'E-mail ou senha incorretos.' };

  // Verifica se é admin
  const user = data.user;
  if (!isAdmin(user)) return { status: 403, error: 'Acesso negado. Usuário não é administrador.' };

  return {
    status: 200,
    data: {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      user: { id: user.id, email: user.email },
    },
  };
}

async function logout(token) {
  await supabaseFetch('/auth/v1/logout', { method: 'POST' });
  return { status: 200, data: { ok: true } };
}

async function getSession(token) {
  const user = await verificarToken(token);
  if (!user) return { status: 401, error: 'Sessão inválida.' };
  if (!isAdmin(user)) return { status: 403, error: 'Acesso negado.' };
  return { status: 200, data: { id: user.id, email: user.email } };
}

module.exports = { login, logout, getSession };
