// ============================================================
//  routes/auth.routes.js
// ============================================================

const { Router }     = require('express');
const controller     = require('../controllers/auth.controller');
const { requerAdmin } = require('../middlewares/auth');

const router = Router();

// POST /api/auth/login   — público
router.post('/login',   controller.fazerLogin);

// POST /api/auth/logout  — requer token válido
router.post('/logout',  controller.fazerLogout);

// GET  /api/auth/session — requer admin
router.get('/session',  requerAdmin, controller.verificarSessao);

module.exports = router;
