import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import AdminAreas from './pages/AdminAreas';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }
  
  return token ? children : <Navigate to="/login" />;
}

function Navigation() {
  const { usuario, logout } = useAuth();
  
  if (!usuario) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Tickets
          </Link>
          {(usuario.rol === 'admin') && (
            <>
              <Link to="/reportes" className="text-gray-700 hover:text-blue-600 font-medium">
                Reportes
              </Link>
              <Link to="/admin/areas" className="text-gray-700 hover:text-blue-600 font-medium">
                Gestión de Áreas
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {usuario.nombre} ({usuario.rol})
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/reportes" element={
          <PrivateRoute>
            <Reportes />
          </PrivateRoute>
        } />
        <Route path="/admin/areas" element={
          <PrivateRoute>
            <AdminAreas />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
