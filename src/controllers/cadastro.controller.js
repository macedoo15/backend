// ============================================================
//  controllers/cadastro.controller.js
//  Recebe a requisição, chama o service e devolve a resposta
// ============================================================

const { listarCadastros, criarCadastro, auditLog } = require('../services/cadastro.service');
const { verificarTurnstile }  = require('../services/turnstile.service');
const { ok, erro, conflito, erroServidor } = require('../utils/response');
const {
  validarNome,
  validarEmail,
  validarDataNascimento,
  validarTelefone,
  normalizarEmail,
  normalizarTelefone,
} = require('../utils/validators');

// GET /api/cadastros — lista todos (admin)
async function listar(req, res, next) {
  try {
    const dados = await listarCadastros();
    return ok(res, { data: dados });
  } catch (err) {
    next(err);
  }
}

// POST /api/cadastros — cria novo cadastro (público)
async function criar(req, res, next) {
  const { nome, email, data_nascimento, telefone, turnstileToken } = req.body || {};
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  try {
    // 1. Verificação anti-bot (Turnstile)
    const captcha = await verificarTurnstile(turnstileToken, ip);
    if (!captcha.valido) {
      await auditLog('CAPTCHA_INVALIDO', { email, ip });
      return erro(res, captcha.erro, 400);
    }

    // 2. Validação dos campos
    const erros = [];
    if (!validarNome(nome))                erros.push('Nome inválido.');
    if (!validarEmail(email))              erros.push('E-mail inválido.');
    if (!validarDataNascimento(data_nascimento)) erros.push('Data de nascimento inválida.');
    if (!validarTelefone(telefone))        erros.push('Telefone inválido.');

    if (erros.length) {
      await auditLog('VALIDACAO_FALHOU', { email, erros });
      return erro(res, erros[0], 400);
    }

    // 3. Criar cadastro (service verifica duplicidade internamente)
    await criarCadastro({
      nome,
      email:           normalizarEmail(email),
      data_nascimento,
      telefone,
    });

    await auditLog('CADASTRO_SUCESSO', { email: normalizarEmail(email), telefone: normalizarTelefone(telefone) });
    return ok(res, { mensagem: 'Cadastro realizado com sucesso.' }, 201);

  } catch (err) {
    if (err.statusCode === 409) {
      await auditLog('CADASTRO_DUPLICADO', { email });
      return conflito(res, err.message);
    }
    next(err);
  }
}

module.exports = { listar, criar };
