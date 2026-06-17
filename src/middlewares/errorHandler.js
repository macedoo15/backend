// ============================================================
//  middlewares/errorHandler.js — Tratamento centralizado de erros
// ============================================================
function errorHandler(err, req, res, next) {
  console.error('❌ Erro não tratado:', err);
  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Erro interno do servidor.';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
