// ============================================================
//  services/cadastro.service.js
//  Toda lógica de negócio relacionada a cadastros
// ============================================================

const { supabaseFetch }    = require('../config/supabase');
const { normalizarEmail, normalizarTelefone } = require('../utils/validators');

// Busca todos os cadastros (ordenados por data de criação)
async function listarCadastros() {
  const res = await supabaseFetch(
    '/rest/v1/cadastros?select=id,nome,email,telefone,data_nascimento,criado_em&order=criado_em.desc',
    {},
    true, // service role
  );

  const data = await res.json().catch(() => []);

  if (!res.ok) {
    const err = new Error(data.message || `Supabase retornou HTTP ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }

  return data;
}

// Verifica se já existe cadastro com mesmo e-mail ou telefone
async function verificarDuplicidade(email, telefoneNormalizado) {
  const emailNorm = normalizarEmail(email);

  const [resEmail, resTel] = await Promise.all([
    supabaseFetch(
      `/rest/v1/cadastros?email=eq.${encodeURIComponent(emailNorm)}&select=id&limit=1`,
      {}, true,
    ),
    supabaseFetch(
      `/rest/v1/cadastros?telefone_normalizado=eq.${encodeURIComponent(telefoneNormalizado)}&select=id&limit=1`,
      {}, true,
    ),
  ]);

  const [dataEmail, dataTel] = await Promise.all([
    resEmail.json().catch(() => []),
    resTel.json().catch(() => []),
  ]);

  if (!resEmail.ok) throw new Error('Não foi possível verificar duplicidade por e-mail.');
  if (!resTel.ok)   throw new Error('Não foi possível verificar duplicidade por telefone.');

  return (Array.isArray(dataEmail) && dataEmail.length > 0) ||
         (Array.isArray(dataTel)   && dataTel.length   > 0);
}

// Cria um novo cadastro
async function criarCadastro({ nome, email, data_nascimento, telefone }) {
  const emailNorm     = normalizarEmail(email);
  const telefoneNorm  = normalizarTelefone(telefone);

  // Verificar duplicidade antes de inserir
  const duplicado = await verificarDuplicidade(emailNorm, telefoneNorm);
  if (duplicado) {
    const err = new Error('Este usuário já possui um cadastro em nosso sistema.');
    err.statusCode = 409;
    throw err;
  }

  const res = await supabaseFetch('/rest/v1/cadastros', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      nome:                  nome.trim(),
      email:                 emailNorm,
      data_nascimento,
      telefone,
      telefone_normalizado:  telefoneNorm,
    }),
  }, true);

  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    if (erro.code === '23505') {
      const err = new Error('Este usuário já possui um cadastro em nosso sistema.');
      err.statusCode = 409;
      throw err;
    }
    const err = new Error(erro.message || `Erro ao salvar cadastro (HTTP ${res.status}).`);
    err.statusCode = res.status;
    throw err;
  }

  return { ok: true };
}

// Grava log de auditoria (falha silenciosa — não interrompe o fluxo)
async function auditLog(evento, detalhe = {}) {
  try {
    await supabaseFetch('/rest/v1/audit_log', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        evento,
        detalhe: JSON.stringify(detalhe),
        criado_em: new Date().toISOString(),
      }),
    }, true);
  } catch (_) {
    // Auditoria nunca quebra o fluxo principal
  }
}

module.exports = { listarCadastros, criarCadastro, verificarDuplicidade, auditLog };
