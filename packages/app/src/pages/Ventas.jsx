import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Search, Plus, FileText, Download, Trash2, Save, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

const StatusDropdown = ({ currentStatus, states, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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
          <div 
            className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
            style={{ backgroundColor: currentStatus?.color || '#cbd5e1' }}
          />
          <span className="text-slate-700 truncate">{currentStatus?.estado || '---'}</span>
        </div>
        <ChevronDown size={12} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
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
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
                  style={{ backgroundColor: state.color }}
                />
                {state.estado}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FormSelect = ({ label, value, options, onChange, required = false, showCircle = false, currentStatus = null }) => {
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
        className={cn(
          "input-modern flex items-center justify-between text-left",
          isOpen && "border-primary/50 ring-4 ring-primary/5"
        )}
      >
        <div className="flex items-center gap-3 truncate">
          {showCircle && (
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
              style={{ backgroundColor: currentStatus?.color || (value === 'SI' ? '#22c55e' : value === 'NO' ? '#ef4444' : '#cbd5e1') }}
            />
          )}
          <span className="truncate">{selectedOption?.label || `Seleccionar ${label}...`}</span>
        </div>
        <ChevronDown size={18} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-[1100] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
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
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
                    style={{ backgroundColor: opt.color || (opt.value === 'SI' ? '#22c55e' : opt.value === 'NO' ? '#ef4444' : '#cbd5e1') }}
                  />
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

const Ventas = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [auxData, setAuxData] = useState({ clients: [], agents: [], states: [] });
  const [filters, setFilters] = useState({
    nFactura: '',
    nCot: '',
    from: '',
    to: '',
    clientSearch: '',
    pagado: 'TODAS',
    sortBy: 'id_venta',
    sortOrder: 'DESC'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    comicion: 0,
    f_factura: '',
    f_cot: '',
    f_oc: ''
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    cotizacion: null,
    factura: null,
    oc: null
  });

  useEffect(() => {
    fetchSales();
  }, [filters, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAuxData();
  }, []);

  const handleSort = (key) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'DESC' ? 'ASC' : 'DESC'
    }));
    setCurrentPage(1);
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sales', { 
        params: { ...filters, page: currentPage, limit: itemsPerPage } 
      });
      setSales(data.data.data);
      setTotalItems(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams({ ...filters }).toString();
    window.open(`${apiUrl}/sales/export?${params}`, '_blank');
  };

  const fetchAuxData = async () => {
    try {
      const [c, a, s, r] = await Promise.all([
        api.get('/clients'),
        api.get('/agents'),
        api.get('/sale-states'),
        api.get('/sale-records')
      ]);
      setAuxData({
        clients: c.data.data,
        agents: a.data.data,
        states: s.data.data
      });
      // Set pagination limit from config
      if (r.data.data && r.data.data.length > 0) {
        const configCantidad = parseInt(r.data.data[0].cantidad);
        if (configCantidad > 0) {
          setItemsPerPage(configCantidad);
        }
      }
    } catch (err) {
      console.error('Error fetching aux data:', err);
    }
  };

  const handleOpenModal = (sale = null) => {
    if (sale) {
      setIsEditMode(true);
      setSelectedSaleId(sale.id_venta);
      setFormData({
        fecha: sale.fecha,
        n_factura: sale.n_factura || 0,
        n_cot: sale.n_cot || 0,
        n_oc: sale.n_oc || 0,
        id_cliente: sale.id_cliente,
        id_agente: sale.id_agente || '',
        item: sale.item || '',
        detalle: sale.detalle || '',
        monto: sale.monto || 0,
        estado: sale.estado,
        pagado: sale.pagado || 'NO',
        entregado: sale.entregado || 'NO',
        fecha_entrega: sale.fecha_entrega || '',
        fecha_pago: sale.fecha_pago || '',
        comicion: sale.comicion || 0,
        f_factura: sale.f_factura || '',
        f_cot: sale.f_cot || '',
        f_oc: sale.f_oc || ''
      });
    } else {
      setIsEditMode(false);
      setSelectedSaleId(null);
      setFormData({
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
        comicion: 0,
        f_factura: '',
        f_cot: '',
        f_oc: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedSaleId(null);
  };

  const handleFileUpload = async (file, type, metadata = {}) => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (metadata.fecha) formData.append('fecha', metadata.fecha);
    if (metadata.numero) formData.append('numero', metadata.numero);
    try {
      const { data } = await api.post('/uploads/sale-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data.filename;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Error subiendo ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Upload files first with metadata for legacy naming
      const f_cot = await handleFileUpload(uploadingFiles.cotizacion, 'COTIZACION', {
        fecha: formData.fecha,
        numero: formData.n_cot
      });
      const f_factura = await handleFileUpload(uploadingFiles.factura, 'FACTURA', {
        fecha: formData.fecha,
        numero: formData.n_factura
      });
      const f_oc = await handleFileUpload(uploadingFiles.oc, 'OC', {
        fecha: formData.fecha,
        numero: formData.n_oc
      });

      const dataToSave = {
        ...formData,
        f_cot: f_cot || formData.f_cot,
        f_factura: f_factura || formData.f_factura,
        f_oc: f_oc || formData.f_oc
      };

      if (isEditMode) {
        await api.put(`/sales/${selectedSaleId}`, dataToSave);
        alert('Venta actualizada con éxito');
      } else {
        await api.post('/sales', dataToSave);
        alert('Venta creada con éxito');
      }

      setIsModalOpen(false);
      setUploadingFiles({ cotizacion: null, factura: null, oc: null });
      fetchSales();
    } catch (err) {
      alert(err.message || 'Error al guardar venta');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/sales/${id}`, { estado: newStatus });
      setSales(prevSales => prevSales.map(sale => 
        sale.id_venta === id ? { ...sale, estado: newStatus, status: auxData.states.find(s => s.id_estado == newStatus) } : sale
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
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
            Ventas <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{totalItems} Registros (Pág. {currentPage}/{totalPages})</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn-glass text-green-600 border-green-100 hover:bg-green-50 flex items-center gap-2" 
            onClick={handleExportExcel}
          >
            <Download size={20} />
            Exportar Excel
          </button>
          <button className="btn-primary flex items-center gap-2 group" onClick={handleOpenModal}>
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Legacy Filter Bar */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center">
        <input
          type="text" placeholder="N° FAC"
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
          value={filters.nFactura} onChange={(e) => setFilters({ ...filters, nFactura: e.target.value })}
        />
        <input
          type="text" placeholder="N° COT"
          className="w-24 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
          value={filters.nCot} onChange={(e) => setFilters({ ...filters, nCot: e.target.value })}
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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text" placeholder="Buscar Cliente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:border-primary/50 text-sm font-bold"
            value={filters.clientSearch} onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
          />
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

      {/* Advanced Data Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse min-w-[1200px] md:min-w-[1600px]">
          <thead className="bg-slate-800 text-white select-none">
            <tr>
              <th className="px-2 py-3 text-[10px] font-black uppercase tracking-wider"></th>
              {[
                { label: 'fecha', key: 'fecha' },
                { label: 'N° Cot', key: 'n_cot', center: true },
                { label: 'N° OC', key: 'n_oc', center: true },
                { label: 'N° Fac', key: 'n_factura', center: true },
                { label: 'Cliente', key: 'cliente' },
                { label: 'Rut', key: 'rut' },
                { label: 'Item', key: 'item' },
                { label: 'Detalle', key: 'detalle' },
                { label: 'Monto $', key: 'monto', right: true },
                { label: 'IVA $', key: 'iva', right: true },
                { label: 'Total $', key: 'total', right: true },
                { label: 'Fecha Entrega', key: 'fecha_entrega', center: true },
                { label: 'Dias Entrega', key: 'dias', center: true },
                { label: 'Estado', key: 'estado', center: true },
                { label: 'Fecha de pago', key: 'fecha_pago', center: true },
                { label: 'Pagado', key: 'pagado', center: true },
                { label: 'Dias Vencidos', key: 'dias_pago', center: true },
              ].map((col) => (
                <th 
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-2 py-3 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors group",
                    col.center && "text-center",
                    col.right && "text-right"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-1",
                    col.center && "justify-center",
                    col.right && "justify-end"
                  )}>
                    {col.label}
                    <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronUp size={8} className={cn(filters.sortBy === col.key && filters.sortOrder === 'ASC' ? "text-primary opacity-100" : "text-slate-500")} />
                      <ChevronDown size={8} className={cn(filters.sortBy === col.key && filters.sortOrder === 'DESC' ? "text-primary opacity-100" : "text-slate-500")} />
                    </div>
                  </div>
                </th>
              ))}
              <th className="px-2 py-3 text-[10px] font-black uppercase tracking-wider text-center">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse h-20 bg-slate-50/10"></tr>
              ))
            ) : (
              sales.map((sale) => {
                const deliveryDays = calculateDays(sale.fecha_entrega);
                const overdueDays = calculateOverdue(sale.fecha_pago, sale.pagado);
                return (
                  <tr key={sale.id_venta} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-2 py-3">
                      <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: sale.status?.color || '#cbd5e1' }} />
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-[11px] font-bold text-slate-500">{sale.fecha}</td>
                    
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <span className="text-[11px] text-blue-600 font-bold">{sale.n_cot || 0}</span>
                        {sale.f_cot && (
                          <a href={`${baseUrl}/docs/COTIZACIONES/${sale.f_cot}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-600">
                            <Download size={10} />
                          </a>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <span className="text-[11px] text-slate-600">{sale.n_oc || 0}</span>
                        {sale.f_oc && (
                          <a href={`${baseUrl}/docs/ORDENES-DE-COMPRA/${sale.f_oc}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                            <Download size={10} />
                          </a>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <span className="text-[11px] text-slate-900 font-black">{sale.n_factura || 0}</span>
                        {sale.f_factura && (
                          <a href={`${baseUrl}/docs/FACTURAS/${sale.f_factura}`} target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-600">
                            <Download size={10} />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-[11px] font-bold text-slate-800 uppercase max-w-[120px] truncate" title={sale.client?.razon}>{sale.client?.razon}</p>
                    </td>
                    
                    <td className="px-2 py-3">
                      <p className="text-[11px] text-slate-500 whitespace-nowrap">{sale.client?.rut}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-[11px] font-bold text-slate-700 uppercase max-w-[120px] truncate" title={sale.item}>{sale.item}</p>
                    </td>
                    
                    <td className="px-2 py-3">
                      <p className="text-[10px] text-slate-500 max-w-[150px] truncate" title={sale.detalle}>{sale.detalle}</p>
                    </td>

                    <td className="px-2 py-3 text-right">
                      <p className="text-[11px] text-slate-600">${sale.monto?.toLocaleString()}</p>
                    </td>
                    
                    <td className="px-2 py-3 text-right">
                      <p className="text-[11px] text-slate-600">${sale.iva?.toLocaleString()}</p>
                    </td>
                    
                    <td className="px-2 py-3 text-right">
                      <p className="text-[11px] font-black text-slate-900">${sale.total?.toLocaleString()}</p>
                    </td>

                    <td className="px-2 py-3 text-center whitespace-nowrap">
                      <span className="text-[11px] text-slate-600 font-medium">{sale.fecha_entrega === '0000-00-00' ? '' : sale.fecha_entrega}</span>
                    </td>
                    
                    <td className="px-2 py-3 text-center">
                      {deliveryDays !== null && (
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", deliveryDays >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                          {deliveryDays}
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-3 text-center min-w-[120px]">
                      <StatusDropdown 
                        currentStatus={sale.status} 
                        states={auxData.states} 
                        onSelect={(newStatusId) => handleStatusChange(sale.id_venta, newStatusId)} 
                      />
                    </td>

                    <td className="px-2 py-3 text-center whitespace-nowrap">
                      <span className="text-[11px] text-slate-600 font-medium">{sale.fecha_pago === '0000-00-00' ? '' : sale.fecha_pago}</span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", sale.pagado === 'SI' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                        {sale.pagado}
                      </span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      {overdueDays !== null && overdueDays > 0 ? (
                        <span className="text-[10px] font-bold text-red-500">-{overdueDays}</span>
                      ) : null}
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(sale)} className="p-1 hover:bg-white rounded shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-all" title="Editar">
                          <Save size={12} />
                        </button>
                        <button className="p-1 hover:bg-white rounded shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all" title="Documento">
                          <FileText size={12} />
                        </button>
                        <button onClick={async () => { if (confirm('¿Estás seguro de eliminar esta venta?')) { await api.delete(`/sales/${sale.id_venta}`); fetchSales(); } }} className="p-1 hover:bg-white rounded shadow-sm border border-slate-100 text-slate-400 hover:text-red-600 transition-all" title="Eliminar">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={11} className="px-6 py-4 text-xs font-bold text-slate-400 text-right">Totales Globales ({totalItems} registros)</td>
              <td className="px-2 py-3 text-right">
                <div className="text-[11px] font-black text-slate-800">
                  ${sales.reduce((acc, s) => acc + (s.total || 0), 0).toLocaleString()}
                </div>
              </td>
              <td colSpan={7}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalItems > itemsPerPage && (
        <div className="glass-card p-4 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 h-10 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
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
                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                      page === currentPage
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-primary'
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
              className="px-4 h-10 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">{isEditMode ? 'Editar Venta' : 'Nueva Venta'}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {isEditMode ? `Editando registro N° ${selectedSaleId}` : 'Registro de transacción comercial'}
                </p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><Trash2 size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dates Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Fechas y Plazos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Venta</label>
                      <input type="date" required className="input-modern" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Entrega</label>
                      <input type="date" className="input-modern" value={formData.fecha_entrega} onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Pago</label>
                      <input type="date" className="input-modern" value={formData.fecha_pago} onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Documentación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Factura (N° y Archivo)</label>
                      <div className="flex gap-2">
                        <input type="number" className="input-modern w-1/3" placeholder="N°" value={formData.n_factura} onChange={(e) => setFormData({ ...formData, n_factura: e.target.value })} />
                        <input type="file" className="input-modern flex-1 text-[10px]" onChange={(e) => setUploadingFiles({ ...uploadingFiles, factura: e.target.files[0] })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cotización (N° y Archivo)</label>
                      <div className="flex gap-2">
                        <input type="number" className="input-modern w-1/3" placeholder="N°" value={formData.n_cot} onChange={(e) => setFormData({ ...formData, n_cot: e.target.value })} />
                        <input type="file" className="input-modern flex-1 text-[10px]" onChange={(e) => setUploadingFiles({ ...uploadingFiles, cotizacion: e.target.files[0] })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Orden Compra (N° y Archivo)</label>
                      <div className="flex gap-2">
                        <input type="number" className="input-modern w-1/3" placeholder="N°" value={formData.n_oc} onChange={(e) => setFormData({ ...formData, n_oc: e.target.value })} />
                        <input type="file" className="input-modern flex-1 text-[10px]" onChange={(e) => setUploadingFiles({ ...uploadingFiles, oc: e.target.files[0] })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entity Selection */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Participantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect 
                      label="Cliente"
                      value={formData.id_cliente}
                      options={auxData.clients.map(c => ({ value: c.id_cliente, label: `${c.razon} (${c.rut})` }))}
                      onChange={(val) => setFormData({ ...formData, id_cliente: val })}
                      required
                    />
                    <FormSelect 
                      label="Agente (Comisionista)"
                      value={formData.id_agente}
                      options={[
                        { value: '', label: 'Sin Agente' },
                        ...auxData.agents.map(a => ({ value: a.id_agente, label: a.nombre, comision: a.comision_default }))
                      ]}
                      onChange={(val) => {
                        const agent = auxData.agents.find(a => a.id_agente == val);
                        setFormData({ ...formData, id_agente: val, comicion: agent?.comision_default || 0 });
                      }}
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Detalle del Item</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Item Principal</label>
                      <input type="text" required className="input-modern" placeholder="Ej: Servicio de mantenimiento..." value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Detalle / Especificaciones</label>
                      <textarea rows={3} className="input-modern py-4" value={formData.detalle} onChange={(e) => setFormData({ ...formData, detalle: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Economics Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Información Económica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Neto ($)</label>
                      <input type="number" required className="input-modern text-lg font-black text-primary" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })} />
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
                      <input type="number" step="0.1" className="input-modern" value={formData.comicion} onChange={(e) => setFormData({ ...formData, comicion: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* State Section */}
                <div className="space-y-4 col-span-full">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Estado y Gestión</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormSelect 
                      label="Estado de Venta"
                      value={formData.estado}
                      showCircle
                      currentStatus={auxData.states.find(s => s.id_estado == formData.estado)}
                      options={auxData.states.map(s => ({ value: s.id_estado, label: s.estado, color: s.color }))}
                      onChange={(val) => setFormData({ ...formData, estado: val })}
                      required
                    />
                    <FormSelect 
                      label="¿Pagado?"
                      value={formData.pagado}
                      showCircle
                      options={[
                        { value: 'NO', label: 'NO', color: '#ef4444' },
                        { value: 'SI', label: 'SI', color: '#22c55e' }
                      ]}
                      onChange={(val) => setFormData({ ...formData, pagado: val })}
                    />
                    <FormSelect 
                      label="¿Entregado?"
                      value={formData.entregado}
                      showCircle
                      options={[
                        { value: 'NO', label: 'NO', color: '#ef4444' },
                        { value: 'SI', label: 'SI', color: '#22c55e' }
                      ]}
                      onChange={(val) => setFormData({ ...formData, entregado: val })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
                <button type="button" onClick={handleCloseModal} className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-3 px-12 py-4 text-lg">
                  <Save size={24} />
                  {isEditMode ? 'Actualizar Venta' : 'Confirmar y Crear Venta'}
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
