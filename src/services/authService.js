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

  // Log para diagnóstico (visível nos logs do Vercel)
  console.log('Supabase /token status:', res.status);
  console.log('Supabase /token data keys:', Object.keys(data));

  if (!res.ok) {
    console.warn('Supabase login falhou:', data);
    return { status: 401, error: 'E-mail ou senha incorretos.' };
  }

  // O Supabase retorna o usuário em data.user (API v2) ou direto em data (API v1)
  // Cobre os dois casos:
  const user = data.user || {
    id:            data.id,
    email:         data.email,
    app_metadata:  data.app_metadata,
    user_metadata: data.user_metadata,
  };

  console.log('Usuário autenticado:', user?.email);

  // Verifica se é admin
  if (!isAdmin(user)) {
    console.warn(`Acesso negado para: ${user?.email}`);
    return { status: 403, error: 'Acesso negado. Usuário não é administrador.' };
  }

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
  try {
    await supabaseFetch('/auth/v1/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (_) {}
  return { status: 200, data: { ok: true } };
}

async function getSession(token) {
  const user = await verificarToken(token);
  if (!user) return { status: 401, error: 'Sessão inválida.' };
  if (!isAdmin(user)) return { status: 403, error: 'Acesso negado.' };
  return { status: 200, data: { id: user.id, email: user.email } };
}

module.exports = { login, logout, getSession };