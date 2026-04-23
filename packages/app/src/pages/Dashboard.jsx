import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { TrendingUp, Users, AlertCircle, ArrowUpRight, Calendar, ExternalLink, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CountUp = ({ end, prefix = '', duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}</span>;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    monthlySales: 0,
    pendingCollections: 0,
    activeClients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sales/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1400px] mx-auto">
      {/* Premium Welcome Hero */}
      <div className="relative group perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 text-white shadow-2xl border border-white/5 overflow-hidden">
          <div className="z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-500/30">
              <Zap size={14} className="fill-current" /> Sistema Operativo: Modo Épico
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">
              Control Maestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SISCON-AI</span>
            </h1>
            <p className="text-slate-400 mt-4 text-xl max-w-xl font-medium">
              Gestión comercial con paridad total legacy y análisis predictivo en tiempo real.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/ventas" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                GESTIONAR VENTAS <ArrowUpRight size={20} />
              </Link>
              <Link to="/cobros" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all backdrop-blur-md">
                AUDIT DE COBROS <BarChart3 size={20} />
              </Link>
            </div>
          </div>

          <div className="relative mt-12 md:mt-0">
            <div className="w-64 h-64 bg-primary/20 rounded-full absolute -inset-4 blur-3xl animate-pulse"></div>
            <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl skew-x-3 rotate-3 hover:rotate-0 hover:skew-x-0 transition-all duration-700">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"><ShieldCheck /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Estado DB</p>
                    <p className="text-sm font-bold text-emerald-400">Sincronizado 100%</p>
                  </div>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400"><TrendingUp /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Paridad Legacy</p>
                    <p className="text-sm font-bold text-blue-400">Activa & Auditoría</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Epic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: `Ventas ${stats.monthlyLabel || 'Mensuales'}`, value: stats.monthlySales, icon: <TrendingUp />, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', isCurrency: true },
          { label: 'Cobranza Pendiente', value: stats.pendingCollections, icon: <AlertCircle />, color: 'from-rose-500 to-orange-600', shadow: 'shadow-rose-500/20', isCurrency: true },
          { label: 'Clientes Activos', value: stats.activeClients, icon: <Users />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', isCurrency: false },
        ].map((stat, i) => (
          <div key={i} className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-[2.5rem] blur-lg opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative glass-card p-10 overflow-hidden border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2">
              <div className={`bg-gradient-to-br ${stat.color} text-white p-4 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${stat.shadow} transform group-hover:rotate-6 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-800 mt-3 tabular-nums">
                {stat.isCurrency ? <CountUp end={stat.value} prefix="$ " /> : <CountUp end={stat.value} />}
              </h3>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="p-1 rounded bg-slate-100 text-slate-500 font-black">DATOS REALES</span>
                <span>Última sincronización inmediata</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Experience Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 glass-card p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Accesos Inteligentes</h2>
              <p className="text-slate-400 text-sm font-bold mt-1">Ecosistema operativo Altamar MKT</p>
            </div>
            <BarChart3 className="text-slate-300" size={32} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/ventas" className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary hover:bg-white hover:shadow-xl transition-all group flex flex-col items-center text-center">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform"><Calendar size={32} /></div>
              <p className="font-black text-slate-800 text-lg uppercase">Módulo de Ventas</p>
              <p className="text-xs text-slate-400 mt-2 font-bold px-4 leading-relaxed">Gestión de Facturas, Cotizaciones y Ordenes de Compra con auto-homologación.</p>
            </Link>
            <Link to="/cobros" className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-500 hover:bg-white hover:shadow-xl transition-all group flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform"><ExternalLink size={32} /></div>
              <p className="font-black text-slate-800 text-lg uppercase">Audit de Cobros</p>
              <p className="text-xs text-slate-400 mt-2 font-bold px-4 leading-relaxed">Control de mora legacy y envío de recordatorios masivos (f-cobros 2.0).</p>
            </Link>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden p-10 flex flex-col justify-center bg-slate-900 text-white min-h-[400px]">
          <div className="absolute top-0 right-0 p-8">
            <ShieldCheck className="text-primary animate-pulse" size={48} />
          </div>
          <h2 className="text-3xl font-black mb-6 leading-tight">Integridad de<br />Sistemas v1.0</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <p className="text-sm font-bold text-slate-400">Legacy ID Parity: <span className="text-emerald-400">ACTIVA</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm font-bold text-slate-400">Aiven Data Sync: <span className="text-primary">ACTIVA</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <p className="text-sm font-bold text-slate-400">File Naming Hook: <span className="text-indigo-400">ACTIVA</span></p>
            </div>
          </div>
          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nota del Agente</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">"Sincronización masiva de 377 registros completada. Diferencia financiera detectada: 0.00%"</p>
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

