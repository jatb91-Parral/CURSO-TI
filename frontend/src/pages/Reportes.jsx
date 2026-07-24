import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reportes() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [reporteArea, setReporteArea] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [estadisticasRes, areaRes] = await Promise.all([
        api.get('/reportes/estadisticas'),
        api.get('/reportes/por-area')
      ]);
      setEstadisticas(estadisticasRes.data);
      setReporteArea(areaRes.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      const res = await api.get('/reportes/exportar-excel', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tickets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Reportes y Estadísticas</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Estadísticas generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">Total de Tickets</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.totalTickets}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">Tiempo Promedio de Resolución</p>
              <p className="text-3xl font-bold text-blue-600">
                {estadisticas.tiempoPromedioResolucion}h
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-3xl font-bold text-red-600">{estadisticas.porEstado?.rojo || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">{estadisticas.porEstado?.verde || 0}</p>
            </div>
          </div>
        )}

        {/* Tickets por tipo de problema */}
        {estadisticas?.porTipo && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tickets por Tipo de Problema</h2>
            <div className="space-y-3">
              {estadisticas.porTipo.map(tipo => (
                <div key={tipo.problema_tipo} className="flex items-center">
                  <span className="w-40 text-sm text-gray-600">{tipo.problema_tipo}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${(tipo._count / estadisticas.totalTickets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{tipo._count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reporte por área */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Tickets por Área</h2>
            <button
              onClick={handleExportarExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tickets</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendientes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">En Atención</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resueltos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reporteArea.map(area => {
                  const pendientes = area.tickets?.filter(t => t.estado === 'rojo').length || 0;
                  const enAtencion = area.tickets?.filter(t => t.estado === 'amarillo').length || 0;
                  const resueltos = area.tickets?.filter(t => t.estado === 'verde').length || 0;

                  return (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{area.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{area._count?.tickets || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-red-600 font-medium">{pendientes}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-yellow-600 font-medium">{enAtencion}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-green-600 font-medium">{resueltos}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
