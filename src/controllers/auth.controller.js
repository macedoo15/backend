// ============================================================
//  controllers/auth.controller.js
//  Controla login, logout e sessão
// ============================================================

const { login, logout, obterSessao } = require('../services/auth.service');
const { ok, erro, naoAutorizado }    = require('../utils/response');
const { ADMIN_EMAILS }               = require('../config/env');
const { extrairToken }               = require('../middlewares/auth');

function ehAdmin(user) {
  const email = String(user?.email || '').toLowerCase();
  const role  = user?.app_metadata?.role || user?.user_metadata?.role;
  if (ADMIN_EMAILS.length) return ADMIN_EMAILS.includes(email);
  return role === 'admin';
}

// POST /api/auth/login
async function fazerLogin(req, res, next) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return erro(res, 'E-mail e senha são obrigatórios.', 400);
  }

  try {
    const sessao = await login(email, senha);

    // Verifica se é admin antes de autorizar acesso ao painel
    const user = await obterSessao(sessao.access_token);
    if (!ehAdmin(user)) {
      await logout(sessao.access_token);
      return naoAutorizado(res, 'Acesso restrito a administradores.');
    }

    return ok(res, {
      access_token:  sessao.access_token,
      refresh_token: sessao.refresh_token,
      expires_at:    sessao.expires_at,
      expires_in:    sessao.expires_in,
      email:         user.email,
    });

  } catch (err) {
    if (err.statusCode === 401) return naoAutorizado(res, err.message);
    next(err);
  }
}

// POST /api/auth/logout
async function fazerLogout(req, res, next) {
  const token = extrairToken(req);
  try {
    if (token) await logout(token);
    return ok(res, { mensagem: 'Logout realizado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/session
async function verificarSessao(req, res, next) {
  try {
    const user = req.user; // já validado pelo middleware requerAdmin
    return ok(res, {
      email: user.email,
      id:    user.id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { fazerLogin, fazerLogout, verificarSessao };
