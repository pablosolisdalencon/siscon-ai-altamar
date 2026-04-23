import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Mail, Clock, AlertTriangle, ChevronRight, ChevronDown, DollarSign, Search, Filter, Save, Trash2, X, Send, FileText, User as UserIcon, Settings, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Cobros = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  const [collections, setCollections] = useState([]);
  const [clients, setClients] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    nFactura: '',
    nCot: '',
    from: '',
    to: '',
    clientSearch: '',
    pagado: 'NO',
    estado: '',
    sort: 'id_venta'
  });

  useEffect(() => {
    fetchCollections();
  }, [filters]);

  useEffect(() => {
    fetchClients();
    fetchStates();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/collections/dashboard', { params: filters });
      setCollections(data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchStates = async () => {
    try {
      const { data } = await api.get('/sale-states');
      setStates(data.data);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const handleOpenMailModal = (client) => {
    setSelectedClient(client);
    setIsMailModalOpen(true);
  };

  const handleSendCollection = async () => {
    try {
      await api.post('/collections/send-email', { clientId: selectedClient.id_cliente });
      alert(`Cobro enviado con éxito a ${selectedClient.razon}`);
      setIsMailModalOpen(false);
    } catch (error) {
      alert('Error enviando correo');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      {/* Filter Bar (Matches Screenshot 1) */}
      <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center text-xs font-bold text-slate-600">
        <div className="flex items-center gap-1">
          <span>N FAC</span>
          <input
            type="text"
            className="w-20 px-2 py-1 border border-slate-300 rounded"
            value={filters.nFactura}
            onChange={(e) => setFilters({ ...filters, nFactura: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1">
          <span>N COT</span>
          <input
            type="text"
            className="w-20 px-2 py-1 border border-slate-300 rounded"
            value={filters.nCot}
            onChange={(e) => setFilters({ ...filters, nCot: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1">
          <span>Desde</span>
          <input
            type="date"
            className="px-2 py-1 border border-slate-300 rounded"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1">
          <span>Hasta</span>
          <input
            type="date"
            className="px-2 py-1 border border-slate-300 rounded"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <span>Cliente</span>
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="w-full px-2 py-1 border border-slate-300 rounded pr-8"
              value={filters.clientSearch}
              onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
            />
            <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span>Pagados:</span>
          {['SI', 'NO', 'TODAS'].map(opt => (
            <label key={opt} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="pagado"
                value={opt}
                checked={filters.pagado === opt}
                onChange={(e) => setFilters({ ...filters, pagado: e.target.value })}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Estado:</span>
          <select
            className="px-2 py-1 border border-slate-300 rounded bg-white"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          >
            <option value="">TODAS</option>
            {states.map(s => (
              <option key={s.id_estado} value={s.id_estado}>{s.estado}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Orden:</span>
          <select
            className="px-2 py-1 border border-slate-300 rounded bg-white font-bold"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="id_venta">ID VENTA (DESC)</option>
            <option value="fecha_pago">FECHA PAGO (DESC)</option>
            <option value="fecha_entrega">FECHA ENTREGA (DESC)</option>
          </select>
        </div>
      </div>

      {/* List (Matches Screenshot 1 Grouping) */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center p-20"><Clock className="animate-spin text-primary" size={48} /></div>
        ) : collections.length === 0 ? (
          <div className="text-center p-20 text-slate-400 font-bold uppercase tracking-widest">No se encontraron cobros pendientes</div>
        ) : collections.map((client) => (
          <div key={client.id_cliente} className="border border-slate-300">
            {/* Group Header */}
            <div className="bg-[#3a3a3a] text-white p-3 flex justify-between items-center bg-gradient-to-r from-slate-700 to-slate-800">
              <h2 className="text-2xl font-black tracking-tight mx-auto uppercase">{client.razon} ({client.rut})</h2>
              <div className="flex gap-4">
                <button className="p-1 hover:text-yellow-400 transition-colors"><UserIcon size={20} fill="currentColor" /></button>
                <button
                  onClick={() => handleOpenMailModal(client)}
                  className="p-1 hover:text-yellow-400 transition-colors"
                >
                  <Mail size={20} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] sm:text-xs">
                <thead className="bg-[#666666] text-white uppercase font-black">
                  <tr>
                    <th className="px-2 py-1 text-left w-6"></th>
                    <th className="px-2 py-1 text-left">fecha</th>
                    <th className="px-2 py-1 text-center">N° Cot</th>
                    <th className="px-2 py-1 text-center">N° OC</th>
                    <th className="px-2 py-1 text-center">N° Fac</th>
                    <th className="px-2 py-1 text-left">Item</th>
                    <th className="px-2 py-1 text-left">Detalle</th>
                    <th className="px-2 py-1 text-right">Monto $</th>
                    <th className="px-2 py-1 text-right">IVA $</th>
                    <th className="px-2 py-1 text-right">Total $</th>
                    <th className="px-2 py-1 text-center">Fecha de pago</th>
                    <th className="px-2 py-1 text-center">Dias Vencidos</th>
                    <th className="px-2 py-1 text-center w-8"><Settings size={14} className="mx-auto" /></th>
                  </tr>
                </thead>
                <tbody className="border border-slate-300">
                  {client.items.map((sale) => (
                    <tr key={sale.id_venta} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-2 py-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: sale.status?.color || '#cccccc' }} />
                      </td>
                      <td className="px-2 py-1 font-bold text-slate-600">{sale.fecha}</td>
                      <td className="px-2 py-1 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-blue-500 font-bold border-b border-blue-200">{sale.n_cot}</span>
                          {sale.f_cot && (
                            <a href={`${baseUrl}/docs/COTIZACIONES/${sale.f_cot}`} target="_blank" rel="noreferrer" className="text-blue-400">
                              <Download size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span>{sale.n_oc}</span>
                          {sale.f_oc && (
                            <a href={`${baseUrl}/docs/ORDENES-DE-COMPRA/${sale.f_oc}`} target="_blank" rel="noreferrer" className="text-slate-400">
                              <Download size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-blue-500 font-bold border-b border-blue-200">{sale.n_factura}</span>
                          {sale.f_factura && (
                            <a href={`${baseUrl}/docs/FACTURAS/${sale.f_factura}`} target="_blank" rel="noreferrer" className="text-red-400">
                              <Download size={10} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 font-bold text-slate-700">{sale.item}</td>
                      <td className="px-2 py-1 text-slate-500 italic max-w-xs">{sale.detalle}</td>
                      <td className="px-2 py-1 text-right font-medium">${sale.monto?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-medium">${sale.iva?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-black text-slate-900">${sale.total?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-center font-bold text-slate-500">{sale.fecha_pago}</td>
                      <td className="px-2 py-1 text-center font-black text-red-600">
                        {sale.daysOverdue > 0 ? sale.daysOverdue : ''}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors"><Settings size={12} className="text-slate-400" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white border-t border-slate-300 font-black text-slate-700">
                  <tr>
                    <td colSpan={6} className="px-2 py-1 text-xs">Registros: {client.items.length}</td>
                    <td className="px-2 py-1 text-right uppercase">Total :</td>
                    <td className="px-2 py-1 text-right">${client.stats.totalMonto.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">${client.stats.totalIva.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right text-sm text-blue-600">${client.stats.totalTotal.toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Email Preview Modal (Matches Screenshot 2) */}
      {isMailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full bg-[#f0f0f0] flex flex-col flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              {/* Email Technical Headers */}
              <div className="bg-white p-4 border border-slate-200 text-xs font-mono space-y-1 text-slate-500">
                <p>MIME-Version: 1.0</p>
                <p>Content-type: text/html; charset=iso-8859-1</p>
                <p>From: ALTAMAR MKT czuniga@altamarmkt.cl</p>
                <p>Reply-To: czuniga@altamarmkt.cl</p>
                <p>Return-path: czuniga@altamarmkt.cl</p>
                <p>asunto: Pagos Pendientes a la fecha</p>
              </div>

              {/* Email Content Area */}
              <div className="bg-white border border-slate-300 p-8 shadow-sm">
                <div className="border border-slate-300 mb-8">
                  <div className="bg-[#3a3a3a] text-white p-3 text-center">
                    <h2 className="text-2xl font-black uppercase">{selectedClient.razon} ({selectedClient.rut})</h2>
                  </div>
                  <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-[#666666] text-white font-black uppercase">
                      <tr>
                        <th className="px-2 py-1 text-left w-6"></th>
                        <th className="px-2 py-1 text-left">fecha</th>
                        <th className="px-2 py-1 text-center">N° Cot</th>
                        <th className="px-2 py-1 text-center">N° OC</th>
                        <th className="px-2 py-1 text-center">N° Fac</th>
                        <th className="px-2 py-1 text-left">Item</th>
                        <th className="px-2 py-1 text-left">Detalle</th>
                        <th className="px-2 py-1 text-right">Monto $</th>
                        <th className="px-2 py-1 text-right">IVA $</th>
                        <th className="px-2 py-1 text-right">Total $</th>
                        <th className="px-2 py-1 text-center">Fecha de pago</th>
                        <th className="px-2 py-1 text-center">Dias Vencidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedClient.items.map(item => (
                        <tr key={item.id_venta}>
                          <td className="px-2 py-1"><div className="w-4 h-4 rounded" style={{ backgroundColor: item.status?.color || '#ccc' }} /></td>
                          <td className="px-2 py-2 font-bold">{item.fecha}</td>
                          <td className="px-2 py-2 text-center text-blue-600">{item.n_cot}</td>
                          <td className="px-2 py-2 text-center">{item.n_oc}</td>
                          <td className="px-2 py-2 text-center text-blue-600">{item.n_factura}</td>
                          <td className="px-2 py-2 font-bold">{item.item}</td>
                          <td className="px-2 py-2 italic text-slate-500">{item.detalle}</td>
                          <td className="px-2 py-2 text-right">${item.monto?.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right">${item.iva?.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right font-bold">${item.total?.toLocaleString()}</td>
                          <td className="px-2 py-2 text-center font-bold">{item.fecha_pago}</td>
                          <td className="px-2 py-2 text-center font-black text-red-600">
                            {item.daysOverdue > 0 ? item.daysOverdue : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-black border-t border-slate-300">
                      <tr>
                        <td colSpan={6} className="px-2 py-2 text-[8px]">Registros: {selectedClient.items.length}</td>
                        <td className="px-2 py-2 text-right uppercase">Total :</td>
                        <td className="px-2 py-2 text-right">${selectedClient.stats.totalMonto.toLocaleString()}</td>
                        <td className="px-2 py-2 text-right">${selectedClient.stats.totalIva.toLocaleString()}</td>
                        <td className="px-2 py-2 text-right text-xs text-blue-600">${selectedClient.stats.totalTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Placeholder for Signature Image as seen in screenshot */}
                <div className="mt-12">
                  <div className="w-full max-w-[400px] h-[150px] bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                    <span className="text-slate-400 font-bold italic">Logo Altamar / Firma Digital</span>
                  </div>
                  {/* Real image would be here: ![Signature](/signature.png) */}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-center gap-8 py-10">
                <button
                  onClick={() => setIsMailModalOpen(false)}
                  className="px-12 py-3 bg-red-600 text-white font-black text-xl uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendCollection}
                  className="px-12 py-3 bg-green-700 text-white font-black text-xl uppercase tracking-widest shadow-lg hover:bg-green-800 transition-all rounded"
                >
                  Enviar Cobro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cobros;
