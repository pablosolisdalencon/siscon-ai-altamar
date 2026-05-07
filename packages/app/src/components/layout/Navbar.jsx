import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, ShoppingCart, Users, Receipt, 
  Settings, LogOut, Briefcase, Truck, User, ShoppingBag, Building2, Database,
  Menu, X
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
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
    <>
      {/* Floating Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[100] w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all overflow-hidden"
      >
        {isOpen ? <X size={24} /> : <img src="/logo.png" alt="Menu" className="w-full h-full object-cover scale-110" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <nav className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-xl z-[90] shadow-2xl transition-transform duration-500 ease-out p-8 pt-24",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full gap-2">
          {/* Logo in Drawer */}
          <div className="flex items-center gap-4 mb-10 px-2">
            <img src="/logo.png" alt="SISCON Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-primary/20" />
            <span className="font-black text-2xl text-slate-800 tracking-tighter">SISCON<span className="text-primary">-AI</span></span>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-4 p-3 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'hover:bg-slate-50 text-slate-500 hover:text-primary'
                  }`
                }
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="font-bold text-sm">{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button className="flex items-center gap-4 p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all w-full">
              <LogOut size={20} className="shrink-0" />
              <span className="font-bold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
