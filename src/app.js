// ============================================================
//  app.js — Configuração do Express
// ============================================================
const express = require('express');
const cors    = require('cors');

const errorHandler   = require('./middlewares/errorHandler');
const cadastrosRoute = require('./routes/cadastros');
const authRoute      = require('./routes/auth');

const app = express();

// ── Middlewares globais ──
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

// ── Rotas da API ──
app.use('/api/cadastros', cadastrosRoute);
app.use('/api',           authRoute);

// ── Tratamento centralizado de erros ──
app.use(errorHandler);

module.exports = app;