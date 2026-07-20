// ============================================================
//  config/adminEmails.js — Lista de e-mails administradores
// ============================================================

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Log de diagnóstico (aparece nos logs do Vercel)
if (ADMIN_EMAILS.length === 0) {
  console.warn('⚠️  ADMIN_EMAILS não configurado ou vazio. Nenhum usuário será reconhecido como admin!');
} else {
  console.log(`✅ Admins configurados: ${ADMIN_EMAILS.join(', ')}`);
}

function isAdmin(user) {
  const email = String(user?.email || '').trim().toLowerCase();

  if (!email) {
    console.warn('isAdmin: usuário sem e-mail', user);
    return false;
  }

  // Se ADMIN_EMAILS estiver configurado, usa ele como fonte da verdade
  if (ADMIN_EMAILS.length > 0) {
    const result = ADMIN_EMAILS.includes(email);
    if (!result) console.warn(`isAdmin: e-mail "${email}" não está na lista de admins`);
    return result;
  }

  // Fallback: verifica role nos metadados
  const role =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    '';

  console.warn(`isAdmin: ADMIN_EMAILS vazio, checando role="${role}" para "${email}"`);
  return role === 'admin';
}

module.exports = { ADMIN_EMAILS, isAdmin };