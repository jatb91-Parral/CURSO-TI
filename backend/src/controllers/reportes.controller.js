const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');

const prisma = new PrismaClient();

// Reporte de tickets por área
const reportePorArea = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let where = {};
    if (fecha_inicio && fecha_fin) {
      where.fecha_creacion = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    const reporte = await prisma.areas.findMany({
      include: {
        tickets: {
          where,
          select: {
            id: true,
            titulo: true,
            problema_tipo: true,
            estado: true,
            fecha_creacion: true,
            fecha_resolucion: true
          }
        },
        _count: {
          select: { tickets: true }
        }
      }
    });

    res.json(reporte);
  } catch (error) {
    console.error('Error en reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Reporte de tickets por técnico
const reportePorTecnico = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let where = {
      tecnico_asignado_id: { not: null }
    };
    
    if (fecha_inicio && fecha_fin) {
      where.fecha_creacion = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    const reporte = await prisma.usuarios.findMany({
      where: { rol: 'tecnico' },
      include: {
        tickets_asignados: {
          where,
          select: {
            id: true,
            titulo: true,
            problema_tipo: true,
            estado: true,
            fecha_creacion: true,
            fecha_resolucion: true
          }
        },
        _count: {
          select: { tickets_asignados: true }
        }
      }
    });

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Estadísticas generales
const estadisticas = async (req, res) => {
  try {
    const totalTickets = await prisma.tickets.count();
    const ticketsRojo = await prisma.tickets.count({ where: { estado: 'rojo' } });
    const ticketsAmarillo = await prisma.tickets.count({ where: { estado: 'amarillo' } });
    const ticketsVerde = await prisma.tickets.count({ where: { estado: 'verde' } });

    // Tickets por tipo de problema
    const porTipo = await prisma.tickets.groupBy({
      by: ['problema_tipo'],
      _count: true
    });

    // Tiempo promedio de resolución
    const ticketsResueltos = await prisma.tickets.findMany({
      where: { fecha_resolucion: { not: null } },
      select: {
        fecha_creacion: true,
        fecha_resolucion: true
      }
    });

    let tiempoPromedio = 0;
    if (ticketsResueltos.length > 0) {
      const totalHoras = ticketsResueltos.reduce((acc, ticket) => {
        const horas = (ticket.fecha_resolucion - ticket.fecha_creacion) / (1000 * 60 * 60);
        return acc + horas;
      }, 0);
      tiempoPromedio = totalHoras / ticketsResueltos.length;
    }

    res.json({
      totalTickets,
      porEstado: {
        rojo: ticketsRojo,
        amarillo: ticketsAmarillo,
        verde: ticketsVerde
      },
      porTipo,
      tiempoPromedioResolucion: Math.round(tiempoPromedio * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Exportar a Excel
const exportarExcel = async (req, res) => {
  try {
    const tickets = await prisma.tickets.findMany({
      include: {
        area: { select: { nombre: true } },
        usuario_creador: { select: { nombre: true } },
        tecnico_asignado: { select: { nombre: true } }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    // Encabezados
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Título', key: 'titulo', width: 30 },
      { header: 'Problema', key: 'problema_tipo', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Solicitante', key: 'solicitante', width: 25 },
      { header: 'Técnico', key: 'tecnico', width: 25 },
      { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
      { header: 'Fecha Resolución', key: 'fecha_resolucion', width: 20 }
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    // Datos
    tickets.forEach(ticket => {
      worksheet.addRow({
        id: ticket.id,
        titulo: ticket.titulo,
        problema_tipo: ticket.problema_tipo,
        estado: ticket.estado,
        area: ticket.area?.nombre,
        solicitante: ticket.usuario_creador?.nombre,
        tecnico: ticket.tecnico_asignado?.nombre || 'Sin asignar',
        fecha_creacion: ticket.fecha_creacion?.toLocaleDateString(),
        fecha_resolucion: ticket.fecha_resolucion?.toLocaleDateString() || 'Pendiente'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=tickets.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar:', error);
    res.status(500).json({ error: 'Error al exportar reporte' });
  }
};

module.exports = {
  reportePorArea,
  reportePorTecnico,
  estadisticas,
  exportarExcel
};
