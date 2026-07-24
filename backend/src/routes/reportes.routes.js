const express = require('express');
const router = express.Router();
const { 
  reportePorArea, 
  reportePorTecnico, 
  estadisticas, 
  exportarExcel 
} = require('../controllers/reportes.controller');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/reportes/por-area
router.get('/por-area', reportePorArea);

// GET /api/reportes/por-tecnico
router.get('/por-tecnico', reportePorTecnico);

// GET /api/reportes/estadisticas
router.get('/estadisticas', estadisticas);

// GET /api/reportes/exportar-excel
router.get('/exportar-excel', exportarExcel);

module.exports = router;
