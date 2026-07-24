const express = require('express');
const router = express.Router();
const { 
  obtenerAreas, 
  obtenerArea, 
  crearArea, 
  actualizarArea, 
  eliminarArea 
} = require('../controllers/areas.controller');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/areas
router.get('/', obtenerAreas);

// GET /api/areas/:id
router.get('/:id', obtenerArea);

// POST /api/areas (solo admin)
router.post('/', verificarRol(['admin']), crearArea);

// PUT /api/areas/:id (solo admin)
router.put('/:id', verificarRol(['admin']), actualizarArea);

// DELETE /api/areas/:id (solo admin)
router.delete('/:id', verificarRol(['admin']), eliminarArea);

module.exports = router;
