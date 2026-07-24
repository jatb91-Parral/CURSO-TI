const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 peticiones por ventana
});
app.use(limiter);

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/areas', require('./routes/areas.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Soporte Técnico funcionando' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
