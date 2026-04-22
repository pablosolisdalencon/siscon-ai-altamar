import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Ventas from './pages/Ventas';
import Cobros from './pages/Cobros';
import Dashboard from './pages/Dashboard';
import { Agentes, Clientes, Proveedores, Usuarios } from './pages/Modules';

// Mock Pages (to be implemented)
const Config = () => <div className="p-8"><h1 className="text-3xl font-bold">Configuración</h1><p>Ajustes globales</p></div>;

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 ml-32 p-8 transition-all duration-500">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/cobros" element={<Cobros />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/config" element={<Config />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
