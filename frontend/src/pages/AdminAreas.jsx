import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(res.data);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setAreaSeleccionada(null);
    setNombre('');
    setEmail('');
    setError('');
    setShowModal(true);
  };

  const abrirEditar = (area) => {
    setAreaSeleccionada(area);
    setNombre(area.nombre);
    setEmail(area.email_notificacion || '');
    setError('');
    setShowModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const datos = { nombre, email_notificacion: email || null };
      if (areaSeleccionada) {
        await api.put(`/areas/${areaSeleccionada.id}`, datos);
      } else {
        await api.post('/areas', datos);
      }
      setShowModal(false);
      cargarAreas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar área');
    }
  };

  const eliminar = async (id, nombreArea) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombreArea}"?`)) return;
    try {
      await api.delete(`/areas/${id}`);
      cargarAreas();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar área');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando áreas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Gestión de Áreas</h1>
          <p className="text-sm text-gray-500">Administra las áreas y correos de notificación</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Áreas Registradas</h2>
            <button
              onClick={abrirCrear}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Nueva Área
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo Notificación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {areas.map(area => (
                  <tr key={area.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{area.nombre}</p>
                    </td>
                    <td className="px-4 py-3">
                      {area.email_notificacion ? (
                        <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                          {area.email_notificacion}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin configurar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {area._count?.tickets || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirEditar(area)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(area.id, area.nombre)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Información sobre notificaciones</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Agrega el correo institucional de cada área para recibir notificaciones</li>
            <li>• Se enviará un correo cuando se cree un nuevo ticket en esa área</li>
            <li>• Se notificará cuando cambie el estado del ticket (atención/resuelto)</li>
            <li>• Si no hay correo configurado, las notificaciones se guardan en el servidor</li>
          </ul>
        </div>
      </main>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {areaSeleccionada ? 'Editar Área' : 'Nueva Área'}
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={guardar}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del área</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Área de Recursos Humanos"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo de notificación
                    <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@institucion.gob.mx"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se enviarán notificaciones de tickets a este correo
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {areaSeleccionada ? 'Guardar Cambios' : 'Crear Área'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
