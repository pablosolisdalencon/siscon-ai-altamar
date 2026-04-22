import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Filter, Plus, FileText, Download, MoreVertical, Calendar as CalendarIcon, Trash2, Save, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Ventas = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    nFactura: '', 
    nCot: '', 
    from: '', 
    to: '', 
    clientSearch: '', 
    pagado: 'TODAS' 
  });

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sales', { params: filters });
      setSales(data.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateOverdue = (dateStr, isPaid) => {
    if (!dateStr || dateStr === '0000-00-00' || isPaid === 'SI') return null;
    const diff = new Date() - new Date(dateStr);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Ventas <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{sales.length} Registros</span>
          </h1>
        </div>
        <button className="btn-primary flex items-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nueva Venta
        </button>
      </div>

      {/* Legacy Filter Bar */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center">
        <input 
          type="text" placeholder="N° FAC" 
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm"
          value={filters.nFactura} onChange={(e) => setFilters({...filters, nFactura: e.target.value})}
        />
        <input 
          type="text" placeholder="N° COT" 
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm"
          value={filters.nCot} onChange={(e) => setFilters({...filters, nCot: e.target.value})}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Desde</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-sm"
            value={filters.from} onChange={(e) => setFilters({...filters, from: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Hasta</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-sm"
            value={filters.to} onChange={(e) => setFilters({...filters, to: e.target.value})}
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" placeholder="Buscar Cliente..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm"
            value={filters.clientSearch} onChange={(e) => setFilters({...filters, clientSearch: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase px-2">Pagado</span>
          {['SI', 'NO', 'TODAS'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" name="pagado" value={opt} 
                checked={filters.pagado === opt}
                onChange={(e) => setFilters({...filters, pagado: e.target.value})}
                className="w-4 h-4 text-primary focus:ring-0 border-slate-200"
              />
              <span className={cn("text-xs font-bold transition-colors", filters.pagado === opt ? "text-primary" : "text-slate-400 group-hover:text-slate-600")}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Data Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="bg-slate-800 text-white select-none">
            <tr>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider"></th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Docs (COT/OC/FAC)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Cliente / Rut</th>
              <th className="px-4 py-4 text-[10px) font-black uppercase tracking-wider">Item / Detalle</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-right">Montos</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Entrega</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Estado</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Agente / Com.</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Pago</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-20 bg-slate-50/10"></tr>)
            ) : sales.map((sale) => {
              const deliveryDays = calculateDays(sale.fecha_entrega);
              const overdueDays = calculateOverdue(sale.fecha_pago, sale.pagado);
              
              return (
                <tr key={sale.id_venta} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-4 py-4">
                    <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: sale.status?.color || '#cbd5e1' }} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{sale.fecha}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">COT: {sale.n_cot}</span>
                      <span className="text-xs text-slate-400">OC: {sale.n_oc}</span>
                      <span className="text-xs text-slate-900 font-black">FAC: {sale.n_factura}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-[200px]">
                      <p className="text-sm font-bold text-slate-800 truncate">{sale.client?.razon}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{sale.client?.rut}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-[250px]">
                      <p className="text-xs font-bold text-slate-700 uppercase">{sale.item}</p>
                      <p className="text-[10px] text-slate-400 italic line-clamp-1">{sale.detalle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400">Neto: ${sale.monto?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">IVA: ${sale.iva?.toLocaleString()}</p>
                      <p className="text-sm font-black text-slate-900">${sale.total?.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-600 font-medium">{sale.fecha_entrega}</span>
                      {deliveryDays !== null && (
                        <span className={cn("text-[10px] font-bold mt-1 px-2 py-0.5 rounded", deliveryDays > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                          {deliveryDays} días
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <select className="text-[10px] font-bold uppercase p-2 bg-white border border-slate-100 rounded-lg outline-none focus:border-primary/50">
                      <option>{sale.status?.estado}</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {sale.agent ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-700 uppercase">{sale.agent.nombre}</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 rounded">
                          {sale.comicion}% (${((sale.total * sale.comicion) / 100).toLocaleString()})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300">Sin Agente</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center">
                      <span className={cn("text-[10px] font-black px-2 py-0.5 rounded", sale.pagado === 'SI' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                        {sale.pagado}
                      </span>
                      {overdueDays && <span className="text-[10px] text-red-500 font-bold mt-1">{overdueDays} d. venc.</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-green-600 transition-all"><Save size={14} /></button>
                       <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all"><FileText size={14} /></button>
                       <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={5} className="px-6 py-4 text-xs font-bold text-slate-400">Totales Globales ({sales.length} registros)</td>
              <td className="px-4 py-4 text-right">
                <div className="text-sm font-black text-slate-800">
                  ${sales.reduce((acc, s) => acc + (s.total || 0), 0).toLocaleString()}
                </div>
              </td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Ventas;
