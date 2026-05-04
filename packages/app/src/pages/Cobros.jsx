import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Mail, Clock, ChevronRight, Search, User as UserIcon, Settings, Download, ChevronLeft } from 'lucide-react';
import { cn } from '../utils/cn';

const StatusDropdown = ({ currentStatus, states, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 px-2 py-1.5 text-[10px] font-black uppercase bg-white/50 border border-slate-100 rounded-xl hover:bg-white transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: currentStatus?.color || '#cbd5e1' }} />
          <span className="text-slate-700 truncate">{currentStatus?.estado || '---'}</span>
        </div>
        <ChevronRight size={12} className={cn("text-slate-400 transition-transform duration-200 rotate-90", isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="absolute z-[1000] mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {states.map((state) => (
              <button
                key={state.id_estado}
                onClick={() => {
                  onSelect(state.id_estado);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-bold uppercase transition-colors text-left hover:bg-slate-50",
                  currentStatus?.id_estado === state.id_estado ? "bg-primary/5 text-primary" : "text-slate-600"
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: state.color }} />
                {state.estado}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FormSelect = ({ label, value, options, onChange, showCircle = false, currentStatus = null }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value == value);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("input-modern flex items-center justify-between text-left", isOpen && "border-primary/50 ring-4 ring-primary/5")}
      >
        <div className="flex items-center gap-3 truncate">
          {showCircle && (
            <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: currentStatus?.color || (value === 'SI' ? '#22c55e' : value === 'NO' ? '#ef4444' : '#cbd5e1') }} />
          )}
          <span className="truncate">{selectedOption?.label || `Seleccionar ${label}...`}</span>
        </div>
        <ChevronRight size={18} className={cn("text-slate-400 transition-transform duration-200 rotate-90", isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="absolute z-[1000] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-sm font-bold transition-colors text-left hover:bg-slate-50",
                  value == opt.value ? "text-primary bg-primary/5" : "text-slate-600"
                )}
              >
                {showCircle && (
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: opt.color || (opt.value === 'SI' ? '#22c55e' : opt.value === 'NO' ? '#ef4444' : '#cbd5e1') }} />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchClients();
    fetchStates();
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const { data } = await api.get('/company');
      setCompany(data.data);
    } catch (err) {
      console.error('Error fetching company:', err);
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/collections/dashboard', { 
        params: { ...filters, page: currentPage, limit: ITEMS_PER_PAGE } 
      });
      setCollections(data.data.data);
      setTotalItems(data.data.total);
      setTotalPages(data.data.totalPages);
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

  const handleUpdateStatus = async (id_venta, id_estado) => {
    try {
      await api.put(`/sale-records/${id_venta}`, { estado: id_estado });
      fetchCollections(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
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
      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-6 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N FAC</label>
          <input
            type="text"
            className="input-modern w-24"
            value={filters.nFactura}
            onChange={(e) => setFilters({ ...filters, nFactura: e.target.value })}
            placeholder="0000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N COT</label>
          <input
            type="text"
            className="input-modern w-24"
            value={filters.nCot}
            onChange={(e) => setFilters({ ...filters, nCot: e.target.value })}
            placeholder="0000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Desde</label>
          <input
            type="date"
            className="input-modern"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Hasta</label>
          <input
            type="date"
            className="input-modern"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="flex-1 space-y-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Buscar Cliente</label>
          <div className="relative">
            <input
              type="text"
              placeholder="RUT o Razón Social..."
              className="input-modern w-full pr-10"
              value={filters.clientSearch}
              onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="w-32">
          <FormSelect
            label="Pagados"
            value={filters.pagado}
            options={[
              { value: 'SI', label: 'SÍ' },
              { value: 'NO', label: 'NO' },
              { value: 'TODAS', label: 'TODAS' }
            ]}
            onChange={(val) => setFilters({ ...filters, pagado: val })}
            showCircle
          />
        </div>

        <div className="w-48">
          <FormSelect
            label="Estado"
            value={filters.estado}
            options={[
              { value: '', label: 'TODOS LOS ESTADOS' },
              ...states.map(s => ({ value: s.id_estado, label: s.estado, color: s.color }))
            ]}
            onChange={(val) => setFilters({ ...filters, estado: val })}
          />
        </div>

        <div className="w-56">
          <FormSelect
            label="Orden"
            value={filters.sort}
            options={[
              { value: 'id_venta', label: 'ID VENTA (DESC)' },
              { value: 'fecha_pago', label: 'FECHA PAGO (DESC)' },
              { value: 'fecha_entrega', label: 'FECHA ENTREGA (DESC)' }
            ]}
            onChange={(val) => setFilters({ ...filters, sort: val })}
          />
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
                    <tr key={sale.id_venta} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-2 py-3 w-40">
                        <StatusDropdown
                          currentStatus={sale.status}
                          states={states}
                          onSelect={(id) => handleUpdateStatus(sale.id_venta, id)}
                        />
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
                      <td className={cn(
                        "px-2 py-1 text-center font-black",
                        sale.daysOverdue >= 10 ? "text-red-600" :
                        sale.daysOverdue >= 5 ? "text-orange-500" :
                        sale.daysOverdue >= 1 ? "text-yellow-600" :
                        "text-green-600"
                      )}>
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

      {/* Pagination Controls */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
        <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">
            Mostrando clientes {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded font-black text-sm transition-all ${
                  page === currentPage
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

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

                <div className="mt-12 flex flex-col items-center border-t border-slate-200 pt-8">
                  {company?.pago_firma ? (
                    <img 
                      src={`${baseUrl}/docs/FIRMAS/${company.pago_firma}`} 
                      alt="Firma" 
                      className="max-h-32 object-contain"
                    />
                  ) : (
                    <div className="w-full max-w-[400px] h-[150px] bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                      <span className="text-slate-400 font-bold italic">Sin Firma Digital</span>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="font-black text-slate-800 text-lg">{company?.razon || 'Altamar MKT'}</p>
                    <p className="text-slate-500 font-bold">{company?.pago_mail || 'czuniga@altamarmkt.cl'}</p>
                  </div>
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
