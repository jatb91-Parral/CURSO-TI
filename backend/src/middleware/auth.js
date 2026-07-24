const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware para verificar token
const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: { id: true, nombre: true, email: true, rol: true, area_id: true }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
};

// Middleware para verificar área
const verificarArea = async (req, res, next) => {
  try {
    const usuario = req.usuario;
    
    // Admin puede acceder a todo
    if (usuario.rol === 'admin') {
      return next();
    }

    // Enlace solo puede acceder a su área
    if (usuario.rol === 'enlace') {
      const area = await prisma.areas.findUnique({
        where: { enlace_id: usuario.id }
      });
      
      if (!area) {
        return res.status(403).json({ error: 'No tienes área asignada' });
      }
      
      req.areaId = area.id;
    }

    // Técnico solo puede ver tickets de su área
    if (usuario.rol === 'tecnico') {
      req.areaId = usuario.area_id;
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar área' });
  }
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarArea
};
