import { useState, useEffect } from 'react';
import api from '../services/api';

const COLORES_ESTADO = {
  rojo: 'bg-red-500 text-white',
  amarillo: 'bg-yellow-500 text-white',
  verde: 'bg-green-500 text-white'
};

const TEXTO_ESTADO = {
  rojo: 'Pendiente',
  amarillo: 'En Atención',
  verde: 'Resuelto'
};

export default function DetalleTicket({ ticket, onClose, onActualizado, usuario }) {
  const [ticketData, setTicketData] = useState(ticket);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticket.id}`);
      setTicketData(res.data);
    } catch (error) {
      console.error('Error al cargar ticket:', error);
    }
  };

  useEffect(() => {
    cargarTicket();
  }, [ticket.id]);

  const handleCambiarEstado = async (nuevoEstado) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}/estado`, { estado: nuevoEstado });
      await cargarTicket();
      onActualizado();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    
    setLoading(true);
    try {
      await api.post(`/tickets/${ticket.id}/seguimiento`, { comentario });
      setComentario('');
      await cargarTicket();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Ticket #{ticketData.id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${COLORES_ESTADO[ticketData.estado]}`}>
                {TEXTO_ESTADO[ticketData.estado]}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Título</p>
              <p className="font-medium">{ticketData.titulo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Problema</p>
              <p className="font-medium">{ticketData.problema_tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Área</p>
              <p className="font-medium">{ticketData.area?.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Solicitante</p>
              <p className="font-medium">{ticketData.usuario_creador?.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Técnico Asignado</p>
              <p className="font-medium">{ticketData.tecnico_asignado?.nombre || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-medium">{new Date(ticketData.fecha_creacion).toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Descripción</p>
            <p className="bg-gray-50 p-3 rounded-lg">{ticketData.descripcion}</p>
          </div>

          {/* Acciones según rol */}
          {usuario?.rol === 'admin' && (
            <div className="flex gap-3 mb-6">
              {ticketData.estado === 'rojo' && (
                <button
                  onClick={() => handleCambiarEstado('amarillo')}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  Marcar en Atención
                </button>
              )}
              {ticketData.estado === 'amarillo' && (
                <button
                  onClick={() => handleCambiarEstado('verde')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Marcar como Resuelto
                </button>
              )}
            </div>
          )}

          {usuario?.rol === 'tecnico' && ticketData.estado === 'amarillo' && (
            <div className="mb-6">
              <button
                onClick={() => handleCambiarEstado('verde')}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Marcar como Resuelto
              </button>
            </div>
          )}

          {/* Historial de seguimiento */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Historial de Seguimiento</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {ticketData.seguimientos?.map(seguimiento => (
                <div key={seguimiento.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{seguimiento.usuario?.nombre}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(seguimiento.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{seguimiento.comentario}</p>
                </div>
              ))}
              {(!ticketData.seguimientos || ticketData.seguimientos.length === 0) && (
                <p className="text-gray-500 text-sm">No hay seguimiento registrado</p>
              )}
            </div>

            {/* Agregar comentario */}
            <form onSubmit={handleAgregarComentario} className="mt-4 flex gap-2">
              <input
                type="text"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar comentario..."
              />
              <button
                type="submit"
                disabled={loading || !comentario.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
