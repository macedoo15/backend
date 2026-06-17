// ============================================================
//  utils/response.js — Respostas padronizadas em JSON
// ============================================================
function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

function erro(res, message, status = 400) {
  return res.status(status).json({ error: message });
}

function erroServidor(res, message = 'Erro interno do servidor.') {
  return res.status(500).json({ error: message });
}

module.exports = { ok, erro, erroServidor };
