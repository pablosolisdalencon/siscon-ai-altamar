import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, Receipt, 
  Settings, LogOut, Briefcase, Truck, User, ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Ventas', icon: <Receipt size={20} />, path: '/ventas' },
    { name: 'f-Cobros', icon: <ShoppingCart size={20} />, path: '/cobros' },
    { name: 'Compras', icon: <ShoppingBag size={20} />, path: '/compras' },
    { name: 'Agentes', icon: <Users size={20} />, path: '/agentes' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
    { name: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores' },
    { name: 'Usuarios', icon: <User size={20} />, path: '/usuarios' },
    { name: 'Config', icon: <Settings size={20} />, path: '/config' },
  ];

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 w-20 hover:w-64 glass rounded-3xl p-4 transition-all duration-500 overflow-hidden group z-50">
      <div className="flex flex-col gap-8 h-full">
        {/* Logo Section */}
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">SISCON-AI</span>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 p-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'hover:bg-slate-100 text-slate-500 hover:text-primary'
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto">
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
