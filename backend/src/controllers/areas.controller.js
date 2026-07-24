const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener todas las áreas
const obtenerAreas = async (req, res) => {
  try {
    const areas = await prisma.areas.findMany({
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    res.json(areas);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: 'Error al obtener áreas' });
  }
};

// Obtener un área por ID
const obtenerArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await prisma.areas.findUnique({
      where: { id: parseInt(id) },
      include: {
        tickets: {
          select: {
            id: true,
            titulo: true,
            problema_tipo: true,
            estado: true,
            fecha_creacion: true
          },
          orderBy: { fecha_creacion: 'desc' }
        }
      }
    });

    if (!area) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    res.json(area);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener área' });
  }
};

// Crear área
const crearArea = async (req, res) => {
  try {
    const { nombre, enlace_id, email_notificacion } = req.body;

    const area = await prisma.areas.create({
      data: {
        nombre,
        enlace_id,
        email_notificacion
      }
    });

    res.status(201).json(area);
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ error: 'Error al crear área' });
  }
};

// Actualizar área
const actualizarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, enlace_id, email_notificacion } = req.body;

    const area = await prisma.areas.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        enlace_id,
        email_notificacion
      }
    });

    res.json(area);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar área' });
  }
};

// Eliminar área
const eliminarArea = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.areas.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensaje: 'Área eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar área' });
  }
};

module.exports = {
  obtenerAreas,
  obtenerArea,
  crearArea,
  actualizarArea,
  eliminarArea
};
