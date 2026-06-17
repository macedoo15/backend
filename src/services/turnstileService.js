// ============================================================
//  services/turnstileService.js — Validação do Cloudflare Turnstile
// ============================================================
async function verificarTurnstile(token, ip) {
  if (!token) return { ok: false, error: 'Token do Turnstile ausente.' };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret)  return { ok: false, error: 'TURNSTILE_SECRET_KEY não configurada.' };

  const body = new URLSearchParams({ response: token, secret });
  if (ip) body.set('remoteip', ip);

  try {
    const res  = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body,
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok:    data.success === true,
      error: data.success ? null
        : `Verificação de segurança inválida: ${(data['error-codes'] || []).join(', ')}`,
    };
  } catch (err) {
    return { ok: false, error: `Falha ao validar Turnstile: ${err.message}` };
  }
}

module.exports = { verificarTurnstile };
