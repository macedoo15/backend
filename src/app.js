// ============================================================
//  app.js — Express adaptado para Vercel + Railway
// ============================================================
const express = require('express');
const path    = require('path');
const cors    = require('cors');

const errorHandler   = require('./middlewares/errorHandler');
const cadastrosRoute = require('./routes/cadastros');
const authRoute      = require('./routes/auth');

const app = express();

// ── CORS — lista fixa + variável de ambiente ──
const ORIGENS_FIXAS = [
  'https://cadastro-qr.vercel.app',
];

const allowedOrigins = [
  ...ORIGENS_FIXAS,
  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    // Sem origin = curl / server-side — permite
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS bloqueado para origin: ${origin}`);
    callback(new Error(`CORS bloqueado para origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Rotas da API ──
app.use('/api/cadastros', cadastrosRoute);
app.use('/api',           authRoute);

// ── Frontend estático (só fora do Vercel) ──
if (!process.env.VERCEL) {
  const frontendPath = path.resolve(__dirname, '../../frontend');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ── Tratamento centralizado de erros ──
app.use(errorHandler);

module.exports = app;