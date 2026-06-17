// ============================================================
//  routes/auth.js
// ============================================================
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

router.post('/login',   controller.fazerLogin);                    // POST /api/login
router.post('/logout',  requireAuth, controller.fazerLogout);      // POST /api/logout
router.get('/session',  controller.verificarSessao);               // GET  /api/session

module.exports = router;
