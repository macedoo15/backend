// ============================================================
//  server.js — Compatível com Vercel (serverless) e Railway
// ============================================================
require('dotenv').config();
const app  = require('./src/app');
const port = Number(process.env.PORT || 3000);

// Vercel não usa listen — exporta o app como handler
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Railway, local ou qualquer outro servidor tradicional
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando em http://0.0.0.0:${port}`);
  });
}