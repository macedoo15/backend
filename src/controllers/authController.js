// ============================================================
//  controllers/authController.js
// ============================================================

const { login, logout, obterSessao } = require('../services/auth.service');
const { ok, erro }                   = require('../utils/response');
const { isAdmin }                    = require('../config/adminEmails');

// POST /api/login
async function fazerLogin(req, res, next) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return erro(res, 'E-mail e senha são obrigatórios.', 400);
  }

  try {
    // 1. Autentica no Supabase
    const sessao = await login(email, senha);

    // 2. Busca dados do usuário para verificar se é admin
    const user = await obterSessao(sessao.access_token);

    // 3. Verifica se é administrador
    if (!isAdmin(user)) {
      return erro(res, 'Acesso negado. Usuário não é administrador.', 403);
    }

    return ok(res, {
      access_token:  sessao.access_token,
      refresh_token: sessao.refresh_token,
      expires_at:    sessao.expires_at,
      expires_in:    sessao.expires_in,
      email:         user.email,
    });

  } catch (err) {
    if (err.statusCode === 401) return erro(res, 'E-mail ou senha incorretos.', 401);
    next(err);
  }
}

// POST /api/logout
async function fazerLogout(req, res, next) {
  const token = req.token; // populado pelo requireAuth
  try {
    if (token) await logout(token);
    return ok(res, { mensagem: 'Logout realizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/session
async function verificarSessao(req, res, next) {
  try {
    const user = req.user; // populado pelo requireAuth
    return ok(res, { email: user.email, id: user.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { fazerLogin, fazerLogout, verificarSessao };