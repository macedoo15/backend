// ============================================================
//  utils/validators.js — Validações de dados
// ============================================================
function validarNome(v) {
  v = String(v || '').trim();
  if (!v || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(v)) return false;
  return v.split(/\s+/).filter(p => p.length >= 2).length >= 2;
}

function validarEmail(v) {
  v = String(v || '').trim();
  if (!v || v.includes('..') || v.startsWith('.') || /\.@/.test(v)) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(v);
}

function validarNasc(v) {
  if (!v) return false;
  const [ano, mes, dia] = String(v).split('-').map(Number);
  if (!ano || !mes || !dia) return false;
  const d    = new Date(ano, mes - 1, dia);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const min  = new Date(hoje); min.setFullYear(min.getFullYear() - 120);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 &&
         d.getDate() === dia && d <= hoje && d >= min;
}

function validarTel(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  const ddds = [
    11,12,13,14,15,16,17,18,19,21,22,24,27,28,
    31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,
    51,53,54,55,61,62,63,64,65,66,67,68,69,
    71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,
    91,92,93,94,95,96,97,98,99,
  ];
  if (!ddds.includes(ddd)) return false;
  const num = d.slice(2);
  if (d.length === 11 && num[0] !== '9') return false;
  if (/^(\d)\1+$/.test(d) || /^(\d)\1+$/.test(num)) return false;
  return num !== '12345678' && num !== '987654321';
}

function normEmail(v) { return String(v || '').trim().toLowerCase(); }
function normTel(v)   { return String(v || '').replace(/\D/g, ''); }

module.exports = { validarNome, validarEmail, validarNasc, validarTel, normEmail, normTel };
