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

// ── CORS — aceita qualquer origem no Vercel ──
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Sem origin = requisição server-side ou curl — permite
    if (!origin) return callback(null, true);
    // Se não tem lista definida, permite tudo (dev/Railway)
    if (!allowedOrigins.length) return callback(null, true);
    // Verifica se a origin está na lista
    if (allowedOrigins.includes(origin)) return callback(null, true);
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