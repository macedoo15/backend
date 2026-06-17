// ============================================================
//  server.js — Ponto de entrada da aplicação
// ============================================================
require('dotenv').config();
const app  = require('./src/app');
const port = Number(process.env.PORT || 3000);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${port}`);
});
