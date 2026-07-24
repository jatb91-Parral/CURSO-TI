const express = require('express');
const router = express.Router();
const { 
  obtenerTickets, 
  obtenerTicket, 
  crearTicket, 
  asignarTecnico, 
  cambiarEstado, 
  agregarSeguimiento 
} = require('../controllers/tickets.controller');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/tickets
router.get('/', obtenerTickets);

// GET /api/tickets/:id
router.get('/:id', obtenerTicket);

// POST /api/tickets
router.post('/', crearTicket);

// PUT /api/tickets/:id/asignar (solo admin)
router.put('/:id/asignar', verificarRol(['admin']), asignarTecnico);

// PUT /api/tickets/:id/estado
router.put('/:id/estado', cambiarEstado);

// POST /api/tickets/:id/seguimiento
router.post('/:id/seguimiento', agregarSeguimiento);

module.exports = router;
