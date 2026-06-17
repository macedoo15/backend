// ============================================================
//  services/cadastroService.js — Regras de negócio dos cadastros
// ============================================================
const { supabaseFetch }  = require('../config/supabase');
const { validarNome, validarEmail, validarNasc, validarTel, normEmail, normTel } = require('../utils/validators');
const { verificarTurnstile } = require('./turnstileService');

// Verifica duplicidade por e-mail ou telefone normalizado
async function verificarDuplicidade(email, telNorm) {
  const [emailRes, telRes] = await Promise.all([
    supabaseFetch(`/rest/v1/cadastros?email=eq.${encodeURIComponent(email)}&select=id&limit=1`, {}, true),
    supabaseFetch(`/rest/v1/cadastros?telefone_normalizado=eq.${encodeURIComponent(telNorm)}&select=id&limit=1`, {}, true),
  ]);

  const emailData = await emailRes.json().catch(() => []);
  const telData   = await telRes.json().catch(() => []);

  if (Array.isArray(emailData) && emailData.length > 0) return 'e-mail';
  if (Array.isArray(telData)   && telData.length   > 0) return 'telefone';
  return null;
}

// Cria um novo cadastro
async function criarCadastro({ nome, email, data_nascimento, telefone, turnstileToken, ip }) {
  // 1. Turnstile
  const captcha = await verificarTurnstile(turnstileToken, ip);
  if (!captcha.ok) return { status: 400, error: captcha.error };

  // 2. Normalização
  const emailNorm = normEmail(email);
  const telNorm   = normTel(telefone);
  const nomeClean = String(nome || '').trim();

  // 3. Validação
  if (!validarNome(nomeClean))        return { status: 400, error: 'Nome inválido.' };
  if (!validarEmail(emailNorm))       return { status: 400, error: 'E-mail inválido.' };
  if (!validarNasc(data_nascimento))  return { status: 400, error: 'Data de nascimento inválida.' };
  if (!validarTel(telefone))          return { status: 400, error: 'Telefone inválido.' };

  // 4. Duplicidade
  const dup = await verificarDuplicidade(emailNorm, telNorm);
  if (dup) return { status: 409, error: `Este ${dup} já está cadastrado em nosso sistema.` };

  // 5. Inserção
  const res = await supabaseFetch('/rest/v1/cadastros', {
    method:  'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      nome:                 nomeClean,
      email:                emailNorm,
      data_nascimento,
      telefone,
      telefone_normalizado: telNorm,
    }),
  }, true);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.code === '23505') return { status: 409, error: 'Usuário já cadastrado.' };
    return { status: res.status, error: err.message || 'Erro ao salvar cadastro.' };
  }

  return { status: 201, data: { ok: true } };
}

// Lista todos os cadastros (apenas admin)
async function listarCadastros() {
  const res = await supabaseFetch(
    '/rest/v1/cadastros?select=id,nome,email,telefone,data_nascimento,criado_em&order=criado_em.desc',
    {}, true
  );
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error(data.message || 'Erro ao listar cadastros.');
  return data;
}

module.exports = { criarCadastro, listarCadastros };
