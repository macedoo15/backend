// ============================================================
//  middlewares/auth.js — Verifica se o usuário está autenticado
// ============================================================
const { verificarToken } = require('../config/supabase');
const { isAdmin }        = require('../config/adminEmails');
const { erro }           = require('../utils/response');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace(/^Bearer\s+/i, '').trim();

  if (!token) return erro(res, 'Token não informado.', 401);

  try {
    const user = await verificarToken(token);
    if (!user) return erro(res, 'Sessão inválida ou expirada.', 401);
    req.user  = user;
    req.token = token;
    next();
  } catch (_) {
    return erro(res, 'Erro ao verificar autenticação.', 401);
  }
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (!isAdmin(req.user)) return erro(res, 'Acesso negado.', 403);
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
