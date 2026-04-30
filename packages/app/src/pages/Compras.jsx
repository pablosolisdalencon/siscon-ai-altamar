import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Plus, FileText, Download, Trash2, Save, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Compras = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [auxData, setAuxData] = useState({ clients: [] });
  const [filters, setFilters] = useState({
    nOc: '',
    from: '',
    to: '',
    clientId: '',
    pagado: 'TODAS'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    n_oc: 0,
    id_cliente: '',
    item: '',
    detalle: '',
    monto: 0,
    pagado: 'NO',
    entregado: 'NO',
    fecha_entrega: '',
    fecha_pago: '',
    n_cheque: ''
  });

  useEffect(() => {
    fetchPurchases();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchAuxData();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/purchases', { 
        params: { ...filters, page: currentPage, limit: ITEMS_PER_PAGE } 
      });
      setPurchases(data.data.data);
      setTotalItems(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const { data } = await api.get('/clients');
      setAuxData({ clients: data.data });
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleOpenModal = (purchase = null) => {
    if (purchase) {
      setIsEditMode(true);
      setSelectedPurchaseId(purchase.id_compra);
      setFormData({
        fecha: purchase.fecha,
        n_oc: purchase.n_oc || 0,
        id_cliente: purchase.id_cliente,
        item: purchase.item || '',
        detalle: purchase.detalle || '',
        monto: purchase.monto || 0,
        pagado: purchase.pagado || 'NO',
        entregado: purchase.entregado || 'NO',
        fecha_entrega: purchase.fecha_entrega || '',
        fecha_pago: purchase.fecha_pago || '',
        n_cheque: purchase.n_cheque || ''
      });
    } else {
      setIsEditMode(false);
      setSelectedPurchaseId(null);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        n_oc: 0,
        id_cliente: '',
        item: '',
        detalle: '',
        monto: 0,
        pagado: 'NO',
        entregado: 'NO',
        fecha_entrega: '',
        fecha_pago: '',
        n_cheque: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode) {
        await api.put(`/purchases/${selectedPurchaseId}`, formData);
        alert('Compra actualizada con éxito');
      } else {
        await api.post('/purchases', formData);
        alert('Compra creada con éxito');
      }
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err) {
      alert(err.message || 'Error al guardar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Compras <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{totalItems} Registros (Pág. {currentPage}/{totalPages})</span>
          </h1>
        </div>
        <button className="btn-primary flex items-center gap-2 group" onClick={() => handleOpenModal()}>
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nueva Compra
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center">
        <input
          type="text" placeholder="N° OC"
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
          value={filters.nOc} onChange={(e) => setFilters({ ...filters, nOc: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Desde</span>
          <input
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
            value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Hasta</span>
          <input
            type="date"
            className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
            value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <select 
            className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold appearance-none"
            value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          >
            <option value="">Todos los Clientes</option>
            {auxData.clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.razon}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase px-2">Pagado</span>
          {['SI', 'NO', 'TODAS'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="pagado" value={opt}
                checked={filters.pagado === opt}
                onChange={(e) => setFilters({ ...filters, pagado: e.target.value })}
                className="w-4 h-4 text-primary focus:ring-0 border-slate-200"
              />
              <span className={cn("text-xs font-bold transition-colors", filters.pagado === opt ? "text-primary" : "text-slate-400 group-hover:text-slate-600")}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="bg-slate-800 text-white select-none">
            <tr>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">OC</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Item / Detalle</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-right">Montos</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Entrega</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-center">Pago</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse h-20 bg-slate-50/10"></tr>)
            ) : purchases.map((purchase) => (
              <tr key={purchase.id_compra} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-4 py-4 whitespace-nowrap text-xs font-bold text-slate-500">{purchase.fecha}</td>
                <td className="px-4 py-4 text-xs font-black text-slate-700">{purchase.n_oc}</td>
                <td className="px-4 py-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{purchase.client?.razon}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{purchase.client?.rut}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-[300px]">
                    <p className="text-xs font-bold text-slate-700 uppercase">{purchase.item}</p>
                    <p className="text-[10px] text-slate-400 italic line-clamp-1">{purchase.detalle}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400">Neto: ${purchase.monto?.toLocaleString()}</p>
                    <p className="text-sm font-black text-slate-900">${purchase.total?.toLocaleString()}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded", purchase.entregado === 'SI' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                    {purchase.entregado}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{purchase.fecha_entrega}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded", purchase.pagado === 'SI' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                    {purchase.pagado}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{purchase.fecha_pago}</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(purchase)} className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600"><Save size={14} /></button>
                    <button 
                      onClick={async () => {
                        if (confirm('¿Eliminar esta compra?')) {
                          await api.delete(`/purchases/${purchase.id_compra}`);
                          fetchPurchases();
                        }
                      }}
                      className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="glass-card p-4 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-10 h-10 rounded-xl font-black text-sm transition-all", page === currentPage ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100 hover:text-primary')}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-800">{isEditMode ? 'Editar Compra' : 'Nueva Compra'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><Trash2 size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Compra</label>
                  <input type="date" required className="input-modern" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N° Orden Compra</label>
                  <input type="number" required className="input-modern" value={formData.n_oc} onChange={(e) => setFormData({ ...formData, n_oc: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cliente Destino</label>
                  <select required className="input-modern appearance-none" value={formData.id_cliente} onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}>
                    <option value="">Seleccionar Cliente...</option>
                    {auxData.clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.razon}</option>)}
                  </select>
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Item</label>
                  <input type="text" required className="input-modern" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Detalle</label>
                  <textarea rows={3} className="input-modern py-4" value={formData.detalle} onChange={(e) => setFormData({ ...formData, detalle: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Neto ($)</label>
                  <input type="number" required className="input-modern" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">¿Pagado?</label>
                  <select className="input-modern" value={formData.pagado} onChange={(e) => setFormData({ ...formData, pagado: e.target.value })}>
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">¿Entregado?</label>
                  <select className="input-modern" value={formData.entregado} onChange={(e) => setFormData({ ...formData, entregado: e.target.value })}>
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-3 px-12 py-4 text-lg">
                  <Save size={24} />
                  {isEditMode ? 'Actualizar Compra' : 'Crear Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;
