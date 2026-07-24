const { PrismaClient } = require('@prisma/client');
const { enviarNotificacionTicket, enviarNotificacionEstado } = require('../services/email.service');

const prisma = new PrismaClient();

// Obtener tickets según el rol
const obtenerTickets = async (req, res) => {
  try {
    const { rol, id: usuarioId, area_id } = req.usuario;
    const { area, estado, fecha_inicio, fecha_fin } = req.query;

    let where = {};

    // Filtrar según el rol
    if (rol === 'enlace') {
      // Enlace solo ve tickets de su área (usando el area_id del usuario)
      where.area_id = area_id;
    } else if (rol === 'tecnico') {
      // Técnico ve tickets de su área o asignados a él
      where.OR = [
        { area_id: area_id },
        { tecnico_asignado_id: usuarioId }
      ];
    }
    // Admin ve todos (sin filtro)

    // Filtros adicionales
    if (area) {
      where.area_id = parseInt(area);
    }
    if (estado) {
      where.estado = estado;
    }
    if (fecha_inicio && fecha_fin) {
      where.fecha_creacion = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    const tickets = await prisma.tickets.findMany({
      where,
      include: {
        area: {
          select: { id: true, nombre: true }
        },
        usuario_creador: {
          select: { id: true, nombre: true, email: true }
        },
        tecnico_asignado: {
          select: { id: true, nombre: true, email: true }
        },
        _count: {
          select: { seguimientos: true }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

// Obtener un ticket por ID
const obtenerTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.tickets.findUnique({
      where: { id: parseInt(id) },
      include: {
        area: {
          select: { id: true, nombre: true }
        },
        usuario_creador: {
          select: { id: true, nombre: true, email: true }
        },
        tecnico_asignado: {
          select: { id: true, nombre: true, email: true }
        },
        seguimientos: {
          include: {
            usuario: {
              select: { id: true, nombre: true, rol: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

// Crear ticket
const crearTicket = async (req, res) => {
  try {
    const { titulo, problema_tipo, descripcion, area_id, prioridad } = req.body;
    const usuarioId = req.usuario.id;

    const ticket = await prisma.tickets.create({
      data: {
        titulo,
        problema_tipo,
        descripcion,
        area_id: parseInt(area_id),
        prioridad: prioridad || 'media',
        usuario_creador_id: usuarioId,
        estado: 'rojo'
      },
      include: {
        area: {
          select: { id: true, nombre: true }
        },
        usuario_creador: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Enviar notificación por correo
    enviarNotificacionTicket(ticket, ticket.area);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

// Asignar técnico (solo admin)
const asignarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { tecnico_asignado_id } = req.body;

    const ticket = await prisma.tickets.update({
      where: { id: parseInt(id) },
      data: {
        tecnico_asignado_id,
        estado: 'amarillo',
        fecha_atencion: new Date()
      },
      include: {
        area: {
          select: { id: true, nombre: true }
        },
        tecnico_asignado: {
          select: { id: true, nombre: true }
        }
      }
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar técnico' });
  }
};

// Cambiar estado del ticket
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    let updateData = { estado };

    if (estado === 'amarillo') {
      updateData.fecha_atencion = new Date();
    } else if (estado === 'verde') {
      updateData.fecha_resolucion = new Date();
    }

    const ticket = await prisma.tickets.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        area: {
          select: { id: true, nombre: true, email_notificacion: true }
        },
        usuario_creador: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Enviar notificación por correo
    enviarNotificacionEstado(ticket, estado);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

// Agregar seguimiento
const agregarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const usuarioId = req.usuario.id;

    const seguimiento = await prisma.seguimiento.create({
      data: {
        ticket_id: parseInt(id),
        usuario_id: usuarioId,
        comentario
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, rol: true }
        }
      }
    });

    res.status(201).json(seguimiento);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar seguimiento' });
  }
};

module.exports = {
  obtenerTickets,
  obtenerTicket,
  crearTicket,
  asignarTecnico,
  cambiarEstado,
  agregarSeguimiento
};
