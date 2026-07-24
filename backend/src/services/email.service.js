const nodemailer = require('nodemailer');

// Configurar transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar conexión
const verificarConexion = async () => {
  try {
    await transporter.verify();
    console.log('✅ Conexión de correo configurada correctamente');
    return true;
  } catch (error) {
    console.log('⚠️  Correo no configurado. Las notificaciones se guardarán en logs.');
    return false;
  }
};

// Enviar correo de nuevo ticket
const enviarNotificacionTicket = async (ticket, area) => {
  const emailDestino = area.email_notificacion;
  
  if (!emailDestino) {
    console.log(`📧 [LOG] Notificación pendiente para ${area.nombre}: Ticket #${ticket.id} - ${ticket.titulo}`);
    return false;
  }

  const asunto = `🔴 Nuevo Ticket de Soporte #${ticket.id} - ${ticket.titulo}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Sistema Interno de Soporte Técnico SPyCI</h1>
        <p style="margin: 5px 0 0 0;">Nuevo Ticket Pendiente</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937;">Ticket #${ticket.id}</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Título</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${ticket.titulo}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Problema</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${ticket.problema_tipo}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Descripción</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${ticket.descripcion}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Solicitante</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${ticket.usuario_creador?.nombre || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Fecha</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(ticket.fecha_creacion).toLocaleString('es-MX')}</td>
          </tr>
        </table>
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Estado:</strong> <span style="color: #dc2626; font-weight: bold;">🔴 PENDIENTE</span>
        </p>
      </div>
      
      <div style="background-color: #374151; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Sistema Interno de Soporte Técnico SPyCI</p>
        <p style="margin: 5px 0 0 0;">Este es un correo generado automáticamente. No responder.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Soporte Técnico SPyCI" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: asunto,
      html: html
    });
    console.log(`📧 Correo enviado a ${emailDestino} para ticket #${ticket.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar correo a ${emailDestino}:`, error.message);
    return false;
  }
};

// Enviar correo de actualización de estado
const enviarNotificacionEstado = async (ticket, nuevoEstado) => {
  const emailDestino = ticket.area?.email_notificacion;
  
  if (!emailDestino) {
    console.log(`📧 [LOG] Actualización pendiente para ticket #${ticket.id}: Estado → ${nuevoEstado}`);
    return false;
  }

  const colores = {
    rojo: { emoji: '🔴', texto: 'PENDIENTE', color: '#dc2626' },
    amarillo: { emoji: '🟡', texto: 'EN ATENCIÓN', color: '#d97706' },
    verde: { emoji: '🟢', texto: 'RESUELTO', color: '#16a34a' }
  };

  const estado = colores[nuevoEstado] || colores.rojo;
  const asunto = `${estado.emoji} Ticket #${ticket.id} - Estado: ${estado.texto}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${estado.color}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Sistema Interno de Soporte Técnico SPyCI</h1>
        <p style="margin: 5px 0 0 0;">Actualización de Ticket</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937;">Ticket #${ticket.id} - ${ticket.titulo}</h2>
        
        <p style="font-size: 18px; text-align: center; padding: 20px; background-color: ${estado.color}10; border: 2px solid ${estado.color}; border-radius: 8px;">
          Estado actual: <strong style="color: ${estado.color};">${estado.emoji} ${estado.texto}</strong>
        </p>
        
        ${nuevoEstado === 'verde' ? `
          <p style="color: #16a34a; text-align: center;">
            <strong>✅ El problema ha sido resuelto</strong>
          </p>
        ` : ''}
      </div>
      
      <div style="background-color: #374151; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Sistema Interno de Soporte Técnico SPyCI</p>
        <p style="margin: 5px 0 0 0;">Este es un correo generado automáticamente. No responder.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Soporte Técnico SPyCI" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: asunto,
      html: html
    });
    console.log(`📧 Correo de actualización enviado a ${emailDestino} para ticket #${ticket.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar correo:`, error.message);
    return false;
  }
};

module.exports = {
  verificarConexion,
  enviarNotificacionTicket,
  enviarNotificacionEstado
};
