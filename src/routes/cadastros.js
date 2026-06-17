// ============================================================
//  routes/cadastros.js
// ============================================================
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/cadastrosController');
const { requireAdmin } = require('../middlewares/auth');

router.get('/',  requireAdmin, controller.listar);   // GET  /api/cadastros — admin
router.post('/', controller.criar);                  // POST /api/cadastros — público

module.exports = router;
