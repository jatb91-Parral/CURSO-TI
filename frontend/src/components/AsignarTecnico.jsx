import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AsignarTecnico({ ticket, onClose, onAsignado }) {
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoId, setTecnicoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const res = await api.get('/areas');
        // Obtener técnicos del área de tecnologías
        const areaTecnologias = res.data.find(a => a.nombre.includes('Tecnologías'));
        if (areaTecnologias) {
          // Buscar técnicos en esa área
          const usuariosRes = await api.get('/auth/perfil');
          // Como no hay endpoint de usuarios, usaremos un enfoque diferente
          // Por ahora mostraremos un mensaje
        }
      } catch (error) {
        console.error('Error al cargar técnicos:', error);
      }
    };
    cargarTecnicos();
  }, []);

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!tecnicoId) {
      setError('Selecciona un técnico');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.put(`/tickets/${ticket.id}/asignar`, {
        tecnico_asignado_id: parseInt(tecnicoId)
      });
      onAsignado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asignar técnico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Asignar Técnico</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500">Ticket #{ticket.id}</p>
            <p className="font-medium">{ticket.titulo}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAsignar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Técnico</label>
              <select
                value={tecnicoId}
                onChange={(e) => setTecnicoId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un técnico</option>
                <option value="9">Técnico Soporte</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nota: En producción, aquí se listarían los técnicos disponibles
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
