import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, Receipt, 
  Settings, LogOut, Briefcase, Truck, User, ShoppingBag, Building2, Database
} from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Ventas', icon: <Receipt size={20} />, path: '/ventas' },
    { name: 'f-Cobros', icon: <ShoppingCart size={20} />, path: '/cobros' },
    { name: 'Compras', icon: <ShoppingBag size={20} />, path: '/compras' },
    { name: 'Agentes', icon: <Users size={20} />, path: '/agentes' },
    { name: 'Clientes', icon: <Briefcase size={20} />, path: '/clientes' },
    { name: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores' },
    { name: 'Empresa', icon: <Building2 size={20} />, path: '/empresa' },
    { name: 'Importar BD', icon: <Database size={20} />, path: '/import-db' },
    { name: 'Usuarios', icon: <User size={20} />, path: '/usuarios' },
    { name: 'Config', icon: <Settings size={20} />, path: '/config' },
  ];

  return (
    <nav className="fixed md:left-6 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-20 hover:md:w-64 glass md:rounded-3xl p-2 md:p-4 transition-all duration-500 overflow-hidden group z-50 h-16 md:h-[90vh]">
      <div className="flex flex-row md:flex-col gap-2 md:gap-8 h-full items-center md:items-stretch">
        {/* Logo Section - Hidden on Mobile to save space */}
        <div className="hidden md:flex items-center gap-4 px-2 shrink-0">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">SISCON-AI</span>
        </div>

        {/* Links */}
        <div className="flex flex-row md:flex-col gap-1 md:gap-2 flex-1 overflow-x-auto md:overflow-x-hidden no-scrollbar justify-around md:justify-start">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all shrink-0 ${
                  isActive 
                    ? 'bg-primary/10 md:bg-primary text-primary md:text-white shadow-none md:shadow-lg md:shadow-primary/20' 
                    : 'hover:bg-slate-100 text-slate-400 md:text-slate-500 hover:text-primary'
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="text-[10px] md:text-sm font-medium md:font-medium opacity-100 md:opacity-0 group-hover:md:opacity-100 transition-opacity whitespace-nowrap">{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer - Only on Desktop */}
        <div className="hidden md:block mt-auto shrink-0">
          <button className="flex items-center gap-4 p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all w-full">
            <LogOut size={20} className="shrink-0" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
