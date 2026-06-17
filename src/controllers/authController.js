// ============================================================
//  controllers/authController.js
// ============================================================
const { login, logout, getSession } = require('../services/authService');
const { ok, erro } = require('../utils/response');

async function fazerLogin(req, res, next) {
  try {
    const { email, senha } = req.body;
    const resultado = await login(email, senha);
    if (resultado.error) return erro(res, resultado.error, resultado.status);
    return ok(res, resultado.data, resultado.status);
  } catch (err) { next(err); }
}

async function fazerLogout(req, res, next) {
  try {
    const resultado = await logout(req.token);
    return ok(res, resultado.data);
  } catch (err) { next(err); }
}

async function verificarSessao(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token  = header.replace(/^Bearer\s+/i, '').trim();
    const resultado = await getSession(token);
    if (resultado.error) return erro(res, resultado.error, resultado.status);
    return ok(res, resultado.data);
  } catch (err) { next(err); }
}

module.exports = { fazerLogin, fazerLogout, verificarSessao };
