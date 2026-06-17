// ============================================================
//  controllers/cadastroController.js
// ============================================================
const { listarCadastros, criarCadastro } = require('../services/cadastroService');
const { ok, fail } = require('../utils/response');

async function listar(req, res, next) {
  try {
    const dados = await listarCadastros();
    res.json(dados);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await criarCadastro({ ...req.body, ip });
    ok(res, {}, 201);
  } catch (err) { next(err); }
}

module.exports = { listar, criar };
