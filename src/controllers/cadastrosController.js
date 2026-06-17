// ============================================================
//  controllers/cadastrosController.js
// ============================================================
const { criarCadastro, listarCadastros } = require('../services/cadastroService');
const { ok, erro } = require('../utils/response');

async function listar(req, res, next) {
  try {
    const data = await listarCadastros();
    return ok(res, data);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const resultado = await criarCadastro({ ...req.body, ip });

    if (resultado.error) return erro(res, resultado.error, resultado.status);
    return ok(res, resultado.data, resultado.status);
  } catch (err) { next(err); }
}

module.exports = { listar, criar };
