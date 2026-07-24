import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CrearTicket from '../components/CrearTicket';
import DetalleTicket from '../components/DetalleTicket';
import AsignarTecnico from '../components/AsignarTecnico';

const PROBLEMAS = {
  internet: 'Falló el Internet',
  pc: 'No prende la computadora',
  impresora: 'No sirve la impresora',
  scanner: 'No sirve el Scanner',
  otro: 'Otro'
};

const COLORES_ESTADO = {
  rojo: 'bg-red-500',
  amarillo: 'bg-yellow-500',
  verde: 'bg-green-500'
};

const TEXTO_ESTADO = {
  rojo: 'Pendiente',
  amarillo: 'En Atención',
  verde: 'Resuelto'
};

export default function Dashboard() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [showAsignar, setShowAsignar] = useState(false);
  const [ticketParaAsignar, setTicketParaAsignar] = useState(null);

  const cargarTickets = async () => {
    try {
      const params = {};
      if (filtroArea) params.area = filtroArea;
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.get('/tickets', { params });
      setTickets(res.data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    }
  };

  const cargarAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(res.data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  useEffect(() => {
    cargarAreas();
    cargarTickets();
  }, [filtroArea, filtroEstado]);

  const handleTicketCreado = () => {
    setShowCrear(false);
    cargarTickets();
  };

  const handleTicketAsignado = () => {
    setShowAsignar(false);
    setTicketParaAsignar(null);
    cargarTickets();
  };

  const handleVerDetalle = (ticket) => {
    setTicketSeleccionado(ticket);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sistema Interno de Soporte Técnico SPyCI</h1>
            <p className="text-sm text-gray-500">
              Bienvenido, {usuario?.nombre}
            </p>
          </div>
          <div className="flex gap-3">
            {usuario?.rol === 'enlace' && (
              <button
                onClick={() => setShowCrear(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nuevo Ticket
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Área</label>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todas las áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option value="rojo">Pendiente (Rojo)</option>
              <option value="amarillo">En Atención (Amarillo)</option>
              <option value="verde">Resuelto (Verde)</option>
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="text-2xl font-bold text-gray-800">{tickets.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-red-600">
              {tickets.filter(t => t.estado === 'rojo').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">En Atención</p>
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => t.estado === 'amarillo').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Resueltos</p>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.estado === 'verde').length}
            </p>
          </div>
        </div>

        {/* Lista de tickets */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Tickets de Soporte</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Problema</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${COLORES_ESTADO[ticket.estado]}`}>
                        {TEXTO_ESTADO[ticket.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{ticket.titulo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{PROBLEMAS[ticket.problema_tipo]}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.area?.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.usuario_creador?.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ticket.tecnico_asignado?.nombre || <span className="text-gray-400">Sin asignar</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(ticket.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleVerDetalle(ticket)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Ver
                      </button>
                      {usuario?.rol === 'admin' && ticket.estado === 'rojo' && (
                        <button
                          onClick={() => { setTicketParaAsignar(ticket); setShowAsignar(true); }}
                          className="text-green-600 hover:text-green-800"
                        >
                          Asignar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No hay tickets registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modales */}
      {showCrear && (
        <CrearTicket
          areas={areas}
          onClose={() => setShowCrear(false)}
          onTicketCreado={handleTicketCreado}
        />
      )}

      {ticketSeleccionado && (
        <DetalleTicket
          ticket={ticketSeleccionado}
          onClose={() => setTicketSeleccionado(null)}
          onActualizado={cargarTickets}
          usuario={usuario}
        />
      )}

      {showAsignar && ticketParaAsignar && (
        <AsignarTecnico
          ticket={ticketParaAsignar}
          onClose={() => { setShowAsignar(false); setTicketParaAsignar(null); }}
          onAsignado={handleTicketAsignado}
        />
      )}
    </div>
  );
}
