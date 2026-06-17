// ============================================================
//  services/turnstile.service.js
//  Verificação do token Cloudflare Turnstile (anti-bot)
// ============================================================

const { TURNSTILE_SECRET_KEY } = require('../config/env');

async function verificarTurnstile(token, ip = '') {
  if (!token) {
    return { valido: false, erro: 'Token de verificação de segurança ausente.' };
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY não configurada — pulando verificação.');
    return { valido: true };
  }

  try {
    const body = new URLSearchParams();
    body.set('secret',   TURNSTILE_SECRET_KEY);
    body.set('response', token);
    if (ip) body.set('remoteip', ip);

    const res  = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    const data = await res.json().catch(() => ({}));

    if (data.success !== true) {
      const codigos = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : '';
      return {
        valido: false,
        erro: `Verificação de segurança inválida${codigos ? ` (${codigos})` : ''}. Tente novamente.`,
      };
    }

    return { valido: true };
  } catch (err) {
    return { valido: false, erro: `Falha ao verificar segurança: ${err.message}` };
  }
}

module.exports = { verificarTurnstile };
