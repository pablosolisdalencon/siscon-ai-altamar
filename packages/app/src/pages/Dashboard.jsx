import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { TrendingUp, Users, AlertCircle, ArrowUpRight, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    monthlySales: 0,
    pendingCollections: 0,
    activeClients: 0
  });

  useEffect(() => {
    // In a real scenario, we'd have a specific dashboard endpoint
    // For now, let's fetch summary from collections
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/sales/stats');
      const statsData = data.data;

      setStats({
        monthlySales: statsData.monthlySales,
        pendingCollections: statsData.pendingCollections,
        activeClients: statsData.activeClients
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* Welcome Section */}
      <div className="flex justify-between items-center bg-primary rounded-[2rem] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-4xl font-bold">¡Bienvenido a SISCON-AI!</h1>
          <p className="text-blue-100 mt-2 text-lg">Tu centro de mando para la gestión comercial avanzada.</p>
          <div className="mt-8 flex gap-4">
            <Link to="/ventas" className="bg-white text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
              Explorar Ventas <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Ventas Mensuales', value: `$ ${stats.monthlySales.toLocaleString()}`, icon: <TrendingUp />, color: 'bg-green-500' },
          { label: 'Cobranza Pendiente', value: `$ ${stats.pendingCollections.toLocaleString()}`, icon: <AlertCircle />, color: 'bg-red-500' },
          { label: 'Clientes Activos', value: stats.activeClients, icon: <Users />, color: 'bg-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 group">
            <div className={`${stat.color}/10 ${stat.color.replace('bg-', 'text-')} p-3 w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2 truncate">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recents List */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Accesos Directos</h2>
            <Settings size={20} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/ventas" className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-primary/50 transition-all group">
              <Calendar className="text-slate-400 group-hover:text-primary mb-4" />
              <p className="font-bold text-slate-700">Nueva Venta</p>
              <p className="text-xs text-slate-400">Generar factura u OC</p>
            </Link>
            <Link to="/cobros" className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-primary/50 transition-all group">
              <ExternalLink className="text-slate-400 group-hover:text-primary mb-4" />
              <p className="font-bold text-slate-700">Audit de Cobros</p>
              <p className="text-xs text-slate-400">Ver mora por cliente</p>
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card relative overflow-hidden p-8 flex flex-col justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <h2 className="text-2xl font-bold mb-4">Integridad de Datos</h2>
          <p className="text-slate-400 leading-relaxed">
            SISCON-AI mantiene sincronización en tiempo real con la base de datos de Altamar.
            Todas las transacciones se registran con firma digital y validación fiscal.
          </p>
          <div className="mt-8 flex items-center gap-2 text-green-400 font-bold text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            Sistemas Sincronizados
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ size, className }) => <AlertCircle size={size} className={className} />;

export default Dashboard;
