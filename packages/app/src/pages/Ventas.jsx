import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Filter, Plus, FileText, Download, MoreVertical, Calendar as CalendarIcon, Trash2, Save, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Ventas = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auxData, setAuxData] = useState({ clients: [], agents: [], states: [] });
  const [filters, setFilters] = useState({ 
    nFactura: '', 
    nCot: '', 
    from: '', 
    to: '', 
    clientSearch: '', 
    pagado: 'TODAS' 
  });

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    n_factura: 0,
    n_cot: 0,
    n_oc: 0,
    id_cliente: '',
    id_agente: '',
    item: '',
    detalle: '',
    monto: 0,
    estado: 1,
    pagado: 'NO',
    entregado: 'NO',
    fecha_entrega: '',
    fecha_pago: '',
    comicion: 0
  });

  useEffect(() => {
    fetchSales();
  }, [filters]);

  useEffect(() => {
    fetchAuxData();
  }, []);

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

  const fetchAuxData = async () => {
    try {
      const [c, a, s] = await Promise.all([
        api.get('/clients'),
        api.get('/agents'),
        api.get('/sale-states')
      ]);
      setAuxData({
        clients: c.data.data,
        agents: a.data.data,
        states: s.data.data
      });
    } catch (err) {
      console.error('Error fetching aux data:', err);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', formData);
      setIsModalOpen(false);
      fetchSales();
      alert('Venta creada con éxito');
    } catch (err) {
      alert('Error al crear venta');
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Ventas <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{sales.length} Registros</span>
          </h1>
        </div>
        <button className="btn-primary flex items-center gap-2 group" onClick={handleOpenModal}>
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nueva Venta
        </button>
      </div>

      {/* Legacy Filter Bar */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center">
        <input 
          type="text" placeholder="N° FAC" 
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
          value={filters.nFactura} onChange={(e) => setFilters({...filters, nFactura: e.target.value})}
        />
        <input 
          type="text" placeholder="N° COT" 
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
          value={filters.nCot} onChange={(e) => setFilters({...filters, nCot: e.target.value})}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Desde</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
            value={filters.from} onChange={(e) => setFilters({...filters, from: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Hasta</span>
          <input 
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
            value={filters.to} onChange={(e) => setFilters({...filters, to: e.target.value})}
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" placeholder="Buscar Cliente..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
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
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Item / Detalle</th>
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

      {/* Create Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Nueva Venta</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Registro de transacción comercial</p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><Trash2 size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dates Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Fechas y Plazos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Venta</label>
                      <input type="date" required className="input-modern" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Entrega</label>
                      <input type="date" className="input-modern" value={formData.fecha_entrega} onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Pago</label>
                      <input type="date" className="input-modern" value={formData.fecha_pago} onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Documentación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N° Factura</label>
                      <input type="number" className="input-modern" value={formData.n_factura} onChange={(e) => setFormData({...formData, n_factura: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N° Cotización</label>
                      <input type="number" className="input-modern" value={formData.n_cot} onChange={(e) => setFormData({...formData, n_cot: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N° Orden Compra</label>
                      <input type="number" className="input-modern" value={formData.n_oc} onChange={(e) => setFormData({...formData, n_oc: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Entity Selection */}
                <div className="space-y-4 col-span-full">
                   <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Participantes</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cliente</label>
                         <select required className="input-modern appearance-none" value={formData.id_cliente} onChange={(e) => setFormData({...formData, id_cliente: e.target.value})}>
                            <option value="">Seleccionar Cliente...</option>
                            {auxData.clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.razon} ({c.rut})</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Agente (Comisionista)</label>
                         <select className="input-modern appearance-none" value={formData.id_agente} onChange={(e) => {
                            const agent = auxData.agents.find(a => a.id_agente == e.target.value);
                            setFormData({...formData, id_agente: e.target.value, comicion: agent?.comision_default || 0})
                         }}>
                            <option value="">Sin Agente</option>
                            {auxData.agents.map(a => <option key={a.id_agente} value={a.id_agente}>{a.nombre}</option>)}
                         </select>
                      </div>
                   </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Detalle del Item</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Item Principal</label>
                      <input type="text" required className="input-modern" placeholder="Ej: Servicio de mantenimiento..." value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Detalle / Especificaciones</label>
                      <textarea rows={3} className="input-modern py-4" value={formData.detalle} onChange={(e) => setFormData({...formData, detalle: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Economics Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Información Económica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Neto ($)</label>
                      <input type="number" required className="input-modern text-lg font-black text-primary" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">IVA (19%)</label>
                      <div className="input-modern bg-slate-50 text-slate-400 flex items-center">${(parseFloat(formData.monto) * 0.19 || 0).toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total</label>
                      <div className="input-modern bg-slate-50 text-slate-900 font-black flex items-center">${(parseFloat(formData.monto) * 1.19 || 0).toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">% Comisión Agente</label>
                      <input type="number" step="0.1" className="input-modern" value={formData.comicion} onChange={(e) => setFormData({...formData, comicion: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* State Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Estado y Gestión</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Estado de Venta</label>
                      <select required className="input-modern appearance-none" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
                        {auxData.states.map(s => <option key={s.id_estado} value={s.id_estado}>{s.estado}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">¿Pagado?</label>
                      <select className="input-modern appearance-none" value={formData.pagado} onChange={(e) => setFormData({...formData, pagado: e.target.value})}>
                        <option value="NO">NO</option>
                        <option value="SI">SI</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">¿Entregado?</label>
                      <select className="input-modern appearance-none" value={formData.entregado} onChange={(e) => setFormData({...formData, entregado: e.target.value})}>
                        <option value="NO">NO</option>
                        <option value="SI">SI</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
                <button type="button" onClick={handleCloseModal} className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-3 px-12 py-4 text-lg">
                  <Save size={24} />
                  Confirmar y Crear Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;
