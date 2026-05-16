import React, { useState, useEffect, useMemo } from 'react';
import api, { getBaseURL } from '../lib/api';
import { Mail, Clock, ChevronRight, Search, User as UserIcon, Settings, Download, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
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
  const apiUrl = getBaseURL();
  const baseUrl = apiUrl.replace(/\/api$/, '');
  const [collections, setCollections] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    nFactura: '',
    nCot: '',
    nOc: '',
    from: '',
    to: '',
    clientSearch: '',
    pagado: 'TODAS',
    estado: '',
    idAgente: '',
    item: '',
    detalle: '',
    sortBy: 'razon',
    sortOrder: 'ASC'
  });
  const [mailMessage, setMailMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [itemSortBy, setItemSortBy] = useState('fecha');
  const [itemSortOrder, setItemSortOrder] = useState('DESC');

  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [filters, currentPage]);

  useEffect(() => {
    fetchClients();
    fetchStates();
    fetchAgents();
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const { data } = await api.get('company');
      setCompany(data);
    } catch (err) {
      console.error('Error fetching company:', err);
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('collections/dashboard', { 
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
      const { data } = await api.get('clients');
      setClients(data.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchStates = async () => {
    try {
      const { data } = await api.get('sale-states');
      setStates(data.data);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('agents');
      setAgents(data.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleUpdateStatus = async (id_venta, id_estado) => {
    try {
      await api.put(`sale-records/${id_venta}`, { estado: id_estado });
      fetchCollections(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleOpenMailModal = (client) => {
    setSelectedClient(client);
    
    // Generate default message
    const contactName = client.pago_nombre || client.comercial_nombre || '';
    const clientName = client.razon || 'Estimado Cliente';
    
    const defaultMsg = `Hola ${contactName ? contactName : clientName},

Espero que estés muy bien.

Te escribo de parte del equipo de finanzas para invitarte a ponerte al día con los pagos pendientes que tenemos registrados en nuestro sistema SISCON-AI. 

A continuación, adjuntamos el detalle de las ventas que presentan saldos pendientes de pago. Agradeceríamos mucho si pudieras revisar esta información y coordinar el pago a la brevedad posible.

Si ya realizaste el pago, por favor ignora este mensaje o envíanos el comprobante para regularizar tu estado.

Quedamos atentos a cualquier duda o comentario.

Saludos cordiales,
Equipo de Cobranzas
SISCON-AI`;

    setMailMessage(defaultMsg);
    setIsMailModalOpen(true);
  };

  const handleSendCollection = async () => {
    try {
      await api.post('collections/send-email', { 
        clientId: selectedClient.id_cliente,
        customMessage: mailMessage
      });
      alert(`Cobro enviado con éxito a ${selectedClient.razon}`);
      setIsMailModalOpen(false);
    } catch (error) {
      alert('Error enviando correo');
    }
  };

  const handleSortItems = (key) => {
    if (itemSortBy === key) {
      setItemSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setItemSortBy(key);
      setItemSortOrder('ASC');
    }
  };

  const sortedCollections = useMemo(() => {
    if (!collections) return [];
    
    return collections.map(client => {
      const sortedItems = [...client.items].sort((a, b) => {
        let valA = a[itemSortBy];
        let valB = b[itemSortBy];

        if (itemSortBy === 'monto' || itemSortBy === 'total' || itemSortBy === 'iva' || itemSortBy === 'n_cot' || itemSortBy === 'n_factura' || itemSortBy === 'n_oc') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        if (valA < valB) return itemSortOrder === 'ASC' ? -1 : 1;
        if (valA > valB) return itemSortOrder === 'ASC' ? 1 : -1;
        return 0;
      });

      return { ...client, items: sortedItems };
    });
  }, [collections, itemSortBy, itemSortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 text-center max-w-[50%] leading-tight uppercase tracking-tighter">
          f-Cobros
          <div className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest mt-1 inline-block">
            Auditoría de Cobranzas
          </div>
        </h1>
      </div>
      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N FAC</label>
            <input
              type="text"
              className="input-modern w-20"
              value={filters.nFactura}
              onChange={(e) => setFilters({ ...filters, nFactura: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N COT</label>
            <input
              type="text"
              className="input-modern w-20"
              value={filters.nCot}
              onChange={(e) => setFilters({ ...filters, nCot: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">N OC</label>
            <input
              type="text"
              className="input-modern w-20"
              value={filters.nOc}
              onChange={(e) => setFilters({ ...filters, nOc: e.target.value })}
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
          <div className="flex-1 space-y-1 min-w-[200px] flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Cliente</label>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Razón o RUT..."
                className="input-modern w-full pr-10"
                value={filters.clientSearch}
                onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" onClick={fetchCollections} />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase">Pagado:</span>
            {['SI', 'NO'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="pagado"
                  className="w-4 h-4 text-primary border-slate-200 focus:ring-primary/20"
                  checked={filters.pagado === opt}
                  onChange={() => setFilters({ ...filters, pagado: opt })}
                />
                <span className={cn("text-[10px] font-black uppercase transition-colors", filters.pagado === opt ? "text-primary" : "text-slate-400 group-hover:text-slate-600")}>
                  {opt}
                </span>
              </label>
            ))}
            <button 
              className="text-[10px] font-black text-slate-300 uppercase hover:text-slate-500 ml-2"
              onClick={() => setFilters({ ...filters, pagado: 'TODAS' })}
            >
              (Limpiar)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <FormSelect
              label="Agente"
              value={filters.idAgente}
              options={[
                { value: '', label: 'TODOS LOS AGENTES' },
                ...agents.map(a => ({ value: a.id_agente, label: a.nombre }))
              ]}
              onChange={(val) => setFilters({ ...filters, idAgente: val })}
            />
          </div>
          <div className="w-48">
            <FormSelect
              label="Estados"
              value={filters.estado}
              options={[
                { value: '', label: 'TODOS LOS ESTADOS' },
                ...states.map(s => ({ value: s.id_estado, label: s.estado, color: s.color }))
              ]}
              onChange={(val) => setFilters({ ...filters, estado: val })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar en Item..."
              className="input-modern w-full"
              value={filters.item}
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar en Detalle..."
              className="input-modern w-full"
              value={filters.detalle}
              onChange={(e) => setFilters({ ...filters, detalle: e.target.value })}
            />
          </div>
          <div className="w-48">
            <FormSelect
              label="Orden Clientes"
              value={filters.sortBy}
              options={[
                { value: 'razon', label: 'RAZON SOCIAL' },
                { value: 'rut', label: 'RUT' },
                { value: 'mail', label: 'EMAIL' }
              ]}
              onChange={(val) => setFilters({ ...filters, sortBy: val })}
            />
          </div>
        </div>
      </div>

      {/* List (Matches Screenshot 1 Grouping) */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center p-20"><Clock className="animate-spin text-primary" size={48} /></div>
        ) : sortedCollections.length === 0 ? (
          <div className="text-center p-20 text-slate-400 font-bold uppercase tracking-widest">No se encontraron cobros pendientes</div>
        ) : sortedCollections.map((client) => (
          <div key={client.id_cliente} className="border border-slate-300">
            {/* Group Header */}
            <div className="bg-[#3a3a3a] text-white p-3 flex justify-between items-center bg-gradient-to-r from-slate-700 to-slate-800">
              <h2 className="text-2xl font-black tracking-tight mx-auto uppercase">{client.razon || "Cliente Generico"}</h2>
              <div className="flex gap-4">
                <button className="p-1 hover:text-yellow-400 transition-colors" title="Info Cliente">
                  <UserIcon size={20} fill="currentColor" />
                </button>
                <button
                  onClick={() => handleOpenMailModal(client)}
                  className="p-1 hover:text-yellow-400 transition-colors"
                  title="Enviar Cobro"
                >
                  <Mail size={20} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="w-full border-collapse text-[10px] sm:text-xs min-w-[1000px]">
                <thead className="text-white uppercase font-black select-none">
                  <tr>
                    <th className="px-2 py-1 text-left w-6 sticky top-0 z-10 bg-[#666666]"></th>
                    {[
                      { label: 'fecha', key: 'fecha' },
                      { label: 'N° Cot', key: 'n_cot', center: true },
                      { label: 'N° OC', key: 'n_oc', center: true },
                      { label: 'N° Fac', key: 'n_factura', center: true },
                      { label: 'Item', key: 'item' },
                      { label: 'Detalle', key: 'detalle' },
                      { label: 'Monto $', key: 'monto', right: true },
                      { label: 'IVA $', key: 'iva', right: true },
                      { label: 'Total $', key: 'total', right: true },
                      { label: 'Fecha de pago', key: 'fecha_pago', center: true },
                      { label: 'Dias Vencidos', key: 'dias_pago', center: true }
                    ].map((col) => (
                      <th 
                        key={col.key}
                        onClick={() => handleSortItems(col.key)}
                        className={cn(
                          "px-2 py-1 font-black uppercase tracking-wider cursor-pointer group sticky top-0 z-10 bg-[#666666]",
                          col.center ? "text-center" : col.right ? "text-right" : "text-left"
                        )}
                      >
                        <div className={cn("flex items-center gap-1", col.center && "justify-center", col.right && "justify-end")}>
                          <span className={cn(col.key === 'fecha' && "lowercase")}>{col.label}</span>
                          {itemSortBy === col.key && (
                            itemSortOrder === 'ASC' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-2 py-1 text-center w-8"><Download size={14} className="mx-auto opacity-0" /></th>
                  </tr>
                </thead>
                <tbody className="border border-slate-300">
                  {client.items.map((sale) => (
                    <tr key={sale.id_venta} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-2 py-1 w-8">
                        <div 
                          className="w-4 h-4 shadow-sm" 
                          style={{ backgroundColor: sale.status?.color || '#cbd5e1' }} 
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
                      <td className="px-2 py-1 text-slate-500 italic max-w-xs whitespace-pre-wrap">{sale.detalle?.replace(/\\r\\n|\\n|\\r/g, '\n')}</td>
                      <td className="px-2 py-1 text-right font-medium">${sale.monto?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-medium">${sale.iva?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-right font-black text-slate-900">${sale.total?.toLocaleString()}</td>
                      <td className="px-2 py-1 text-center font-bold text-slate-500">{sale.fecha_pago}</td>
                      <td className={cn(
                        "px-2 py-1 text-center font-black",
                        sale.dias_pago >= 10 ? "text-red-600" :
                        sale.dias_pago >= 5 ? "text-orange-500" :
                        sale.dias_pago >= 1 ? "text-yellow-600" :
                        "text-green-600"
                      )}>
                        {sale.dias_pago > 0 ? sale.dias_pago : ''}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors" title="Editar">
                          <Settings size={12} className="text-slate-400 fill-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white border-t border-slate-300 font-black text-slate-700">
                  <tr>
                    <td colSpan={6} className="px-2 py-1 text-[10px] text-slate-500">Registros:{client.items.length}</td>
                    <td className="px-2 py-1 text-right uppercase">Total :</td>
                    <td className="px-2 py-1 text-right">${client.stats.totalMonto.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">${client.stats.totalIva.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right text-sm text-slate-900">${client.stats.totalTotal.toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
        <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">
            Mostrando clientes {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 h-10 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
            >
              Anterior
            </button>
            {(() => {
              const pages = [];
              const windowSize = 5;
              
              // Fixed First 5
              for (let i = 1; i <= Math.min(5, totalPages); i++) {
                pages.push(i);
              }

              // Mobile Window (5 before, 5 after)
              const startWindow = Math.max(1, currentPage - windowSize);
              const endWindow = Math.min(totalPages, currentPage + windowSize);
              for (let i = startWindow; i <= endWindow; i++) {
                if (!pages.includes(i)) pages.push(i);
              }

              // Fixed Last 5
              for (let i = Math.max(1, totalPages - 4); i <= totalPages; i++) {
                if (!pages.includes(i)) pages.push(i);
              }

              pages.sort((a, b) => a - b);
              const finalPages = [];
              for (let i = 0; i < pages.length; i++) {
                if (i > 0 && pages[i] - pages[i-1] > 1) finalPages.push('...');
                finalPages.push(pages[i]);
              }

              return finalPages.map((page, idx) => (
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 font-black">...</span>
                ) : (
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
                )
              ));
            })()}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 h-10 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
            >
              Siguiente
            </button>
          </div>
        </div>

      {/* Email Preview Modal (Matches Screenshot 2) */}
      {isMailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full bg-[#f0f0f0] flex flex-col flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full space-y-4 md:space-y-6">
              {/* Email Technical Headers */}
              <div className="bg-white p-4 border border-slate-200 text-[10px] md:text-xs font-mono space-y-1 text-slate-500 overflow-x-auto whitespace-nowrap">
                <p>MIME-Version: 1.0</p>
                <p>Content-type: text/html; charset=iso-8859-1</p>
                <p>From: ALTAMAR MKT czuniga@altamarmkt.cl</p>
                <p>Reply-To: czuniga@altamarmkt.cl</p>
                <p>Return-path: czuniga@altamarmkt.cl</p>
                <p>asunto: Pagos Pendientes a la fecha</p>
              </div>

              {/* Email Content Area */}
              <div className="bg-white border border-slate-300 p-4 md:p-8 shadow-sm">
                <div className="mb-6 md:mb-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mensaje Personalizado</label>
                  <textarea 
                    className="w-full min-h-[200px] md:min-h-[250px] p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-3xl text-sm font-medium focus:border-primary/50 outline-none transition-all shadow-inner"
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    placeholder="Escribe el mensaje de cobro..."
                  />
                </div>

                <div className="border border-slate-300 mb-8 overflow-x-auto">
                  <div className="bg-[#3a3a3a] text-white p-3 text-center sticky left-0">
                    <h2 className="text-xl md:text-2xl font-black uppercase">{selectedClient.razon || "Cliente Generico"} ({selectedClient.rut || "---"})</h2>
                  </div>
                  <table className="w-full text-[10px] border-collapse min-w-[800px]">
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
                          <td className="px-2 py-2 italic text-slate-500 whitespace-pre-wrap">{item.detalle?.replace(/\\r\\n|\\n|\\r/g, '\n')}</td>
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

                <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-8 gap-8">
                  <div className="flex items-center gap-4 md:gap-6 order-2 md:order-1">
                    <img src="/logo.png" alt="SISCON Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg shadow-slate-200" />
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-base md:text-lg uppercase tracking-tighter">SISCON<span className="text-primary">-AI</span></p>
                      <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Ecosistema Cognitivo de Gestión</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center order-1 md:order-2">
                    {company?.pago_firma ? (
                      <img 
                        src={`${baseUrl}/docs/FIRMAS/${company.pago_firma}`} 
                        alt="Firma" 
                        className="max-h-24 md:max-h-32 object-contain"
                      />
                    ) : (
                      <div className="w-full max-w-[300px] h-[100px] md:h-[150px] bg-slate-100 flex items-center justify-center border border-dashed border-slate-300 rounded-xl">
                        <span className="text-slate-400 text-xs font-bold italic">Sin Firma Digital</span>
                      </div>
                    )}
                    <div className="mt-4 text-center">
                      <p className="font-black text-slate-800 text-sm md:text-base">{company?.razon || 'Altamar MKT'}</p>
                      <p className="text-slate-500 font-bold text-[10px] md:text-xs">{company?.pago_mail || 'czuniga@altamarmkt.cl'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 py-6 md:py-10">
                <button
                  onClick={() => setIsMailModalOpen(false)}
                  className="w-full sm:w-auto px-12 py-3 bg-red-600 text-white font-black text-lg md:text-xl uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendCollection}
                  className="w-full sm:w-auto px-12 py-3 bg-green-700 text-white font-black text-lg md:text-xl uppercase tracking-widest shadow-lg hover:bg-green-800 transition-all rounded-xl"
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

