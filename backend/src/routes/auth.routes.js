const express = require('express');
const router = express.Router();
const { login, registrar, perfil } = require('../controllers/auth.controller');
const { verificarToken, verificarRol } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/registrar (solo admin)
router.post('/registrar', verificarToken, verificarRol(['admin']), registrar);

// GET /api/auth/perfil
router.get('/perfil', verificarToken, perfil);

module.exports = router;
