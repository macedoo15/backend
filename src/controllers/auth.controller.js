// ============================================================
//  controllers/authController.js
// ============================================================

const { login, logout, obterSessao } = require('../services/auth.service');
const { ok, erro, naoAutorizado }    = require('../utils/response');
const { extrairToken }               = require('../middlewares/auth');

// POST /api/login
async function fazerLogin(req, res, next) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return erro(res, 'E-mail e senha são obrigatórios.', 400);
  }

  try {
    // Autentica no Supabase — se falhar, lança erro 401
    const sessao = await login(email, senha);

    // Busca dados do usuário para retornar o email
    const user = await obterSessao(sessao.access_token);

    return ok(res, {
      access_token:  sessao.access_token,
      refresh_token: sessao.refresh_token,
      expires_at:    sessao.expires_at,
      expires_in:    sessao.expires_in,
      email:         user.email,
    });

  } catch (err) {
    if (err.statusCode === 401) return naoAutorizado(res, 'E-mail ou senha incorretos.');
    next(err);
  }
}

// POST /api/logout
async function fazerLogout(req, res, next) {
  const token = extrairToken(req);
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