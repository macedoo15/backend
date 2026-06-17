// ============================================================
//  routes/cadastro.routes.js
// ============================================================

const { Router }  = require('express');
const controller  = require('../controllers/cadastro.controller');
const { requerAdmin } = require('../middlewares/auth');

const router = Router();

// GET  /api/cadastros — apenas admins
router.get('/',  requerAdmin, controller.listar);

// POST /api/cadastros — público (com Turnstile)
router.post('/', controller.criar);

module.exports = router;
