import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Ventas from './pages/Ventas';
import Cobros from './pages/Cobros';
import Compras from './pages/Compras';
import Dashboard from './pages/Dashboard';
import { Clientes, Proveedores, Usuarios } from './pages/Modules';
import Config from './pages/Config';
import Empresa from './pages/Empresa';
import ImportDB from './pages/ImportDB';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Redirección relativa sin slash inicial para evitar saltar a la raíz del dominio
    return <Navigate to="login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'agente') {
      return <Navigate to="agent-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // Detección de login compatible con HashRouter
  const isLoginPage = window.location.hash.includes('/login');

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/login" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>
        
        <main className={`flex-1 w-full p-4 md:p-8 transition-all duration-500 overflow-x-hidden ${isLoginPage ? '' : 'pt-24 md:pt-8'}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/ventas" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Ventas />
              </ProtectedRoute>
            } />
            <Route path="/cobros" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Cobros />
              </ProtectedRoute>
            } />
            <Route path="/compras" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Compras />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Clientes />
              </ProtectedRoute>
            } />
            <Route path="/proveedores" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Proveedores />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Usuarios />
              </ProtectedRoute>
            } />
            <Route path="/config" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Config />
              </ProtectedRoute>
            } />
            <Route path="/empresa" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Empresa />
              </ProtectedRoute>
            } />
            <Route path="/import-db" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ImportDB />
              </ProtectedRoute>
            } />
            <Route path="/agent-dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'agente']}>
                <AgentDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback a la raíz del Hash */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
