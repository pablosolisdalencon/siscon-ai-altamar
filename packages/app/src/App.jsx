import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Ventas from './pages/Ventas';
import Cobros from './pages/Cobros';
import Compras from './pages/Compras';
import Dashboard from './pages/Dashboard';
import { Agentes, Clientes, Proveedores, Usuarios } from './pages/Modules';
import Config from './pages/Config';
import Empresa from './pages/Empresa';
import ImportDB from './pages/ImportDB';

function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full md:ml-24 lg:ml-28 p-4 md:p-8 transition-all duration-500 overflow-x-hidden pb-24 md:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/cobros" element={<Cobros />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/config" element={<Config />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/import-db" element={<ImportDB />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
