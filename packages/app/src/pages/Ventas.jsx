import React, { useState, useEffect } from 'react';
import api, { getBaseURL } from '../lib/api';
import { Search, Plus, FileText, Download, Trash2, Save, Pencil, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
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
  const apiUrl = getBaseURL();
  const baseUrl = (apiUrl.includes('/siscon-ai/api') ? apiUrl : apiUrl.replace(/\/api$/, '')).replace(/\/$/, '');
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
    status: '',
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
    iva: 0,
    total: 0,
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
      const { data } = await api.get('sales', { 
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
      const [c, u, s, r] = await Promise.all([
        api.get('clients'),
        api.get('users'),
        api.get('sale-states'),
        api.get('sale-records')
      ]);
      setAuxData({
        clients: c.data.data,
        agents: Array.isArray(u.data.data) ? u.data.data.filter(user => user.role === 'agente') : [],
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

  const handlePrintSaleDetail = async (sale) => {
    try {
      const companyRes = await api.get('company');
      const company = companyRes.data || {};
      
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert('Por favor permite los popups para descargar la ficha.');
        return;
      }
      
      const signatureUrl = company.pago_firma 
        ? `${baseUrl}/docs/FIRMAS/${company.pago_firma}` 
        : '';

      const formatCurrency = (val) => {
        return (val || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ficha Detalle de Venta #${sale.id_venta}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .signature {
              max-height: 100px;
              object-fit: contain;
              margin-bottom: 15px;
            }
            .company-name {
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #0f172a;
            }
            .company-details {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
            }
            .title-section {
              text-align: center;
              margin-bottom: 40px;
            }
            .title-section h1 {
              font-size: 24px;
              font-weight: 900;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #3b82f6;
            }
            .title-section p {
              font-size: 12px;
              font-weight: 800;
              color: #94a3b8;
              margin: 5px 0 0 0;
              letter-spacing: 3px;
              text-transform: uppercase;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #f1f5f9;
              border-radius: 16px;
              padding: 20px;
            }
            .info-card h2 {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #3b82f6;
              margin: 0 0 15px 0;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 8px;
            }
            .info-row:last-child {
              margin-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #64748b;
            }
            .info-value {
              font-weight: 800;
              color: #0f172a;
              text-align: right;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
              margin-bottom: 30px;
            }
            .details-table th {
              background: #f8fafc;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
              padding: 12px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }
            .details-table td {
              font-size: 12px;
              padding: 12px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            .details-table th.right, .details-table td.right {
              text-align: right;
            }
            .financial-summary {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              margin-top: 20px;
              padding-right: 12px;
            }
            .financial-row {
              display: flex;
              justify-content: space-between;
              width: 250px;
              font-size: 13px;
              margin-bottom: 6px;
            }
            .financial-row.total {
              border-top: 2px solid #e2e8f0;
              padding-top: 6px;
              font-size: 16px;
              font-weight: 900;
              color: #0f172a;
            }
            .financial-row .label {
              font-weight: 600;
              color: #64748b;
            }
            .financial-row .val {
              font-weight: 800;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              font-size: 10px;
              font-weight: 600;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${signatureUrl ? `<img src="${signatureUrl}" class="signature" />` : ''}
            <div class="company-name">${company.razon || 'SISCON-AI'}</div>
            <div class="company-details">
              RUT: ${company.rut || 'N/A'} &nbsp;|&nbsp; Giro: ${company.giro || 'N/A'}<br/>
              Dirección: ${company.direccion || 'N/A'}<br/>
              Fono: ${company.fono || 'N/A'} &nbsp;|&nbsp; Email: ${company.mail || 'N/A'}
            </div>
          </div>

          <div class="title-section">
            <h1>Ficha de Venta</h1>
            <p>Registro Operacional #${sale.id_venta}</p>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h2>Detalles del Cliente</h2>
              <div class="info-row">
                <span class="info-label">Razón Social:</span>
                <span class="info-value">${sale.client?.razon || 'Sin Cliente'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">RUT:</span>
                <span class="info-value">${sale.client?.rut || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Giro:</span>
                <span class="info-value">${sale.client?.giro || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dirección:</span>
                <span class="info-value">${sale.client?.direccion || 'N/A'}</span>
              </div>
            </div>

            <div class="info-card">
              <h2>Información de la Venta</h2>
              <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${sale.fecha || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">N° Factura:</span>
                <span class="info-value">${sale.n_factura || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">N° Cotización:</span>
                <span class="info-value">${sale.n_cot || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">N° O. Compra:</span>
                <span class="info-value">${sale.n_oc || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vendedor:</span>
                <span class="info-value">${sale.agent?.user || 'Sin Agente'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Estado Pago:</span>
                <span class="info-value" style="color: ${sale.pagado === 'SI' ? '#22c55e' : '#ef4444'}">${sale.pagado || 'NO'}</span>
              </div>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Item / Concepto</th>
                <th>Descripción / Detalle</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 800;">${sale.item || 'Venta de Servicios/Productos'}</td>
                <td>${sale.detalle || 'Sin detalle adicional'}</td>
                <td class="right" style="font-weight: 800;">${formatCurrency(sale.total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="financial-summary">
            <div class="financial-row">
              <span class="label">Monto Neto:</span>
              <span class="val">${formatCurrency(sale.monto)}</span>
            </div>
            <div class="financial-row">
              <span class="label">IVA (19%):</span>
              <span class="val">${formatCurrency(sale.iva)}</span>
            </div>
            <div class="financial-row total">
              <span class="label">Total General:</span>
              <span class="val">${formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div class="footer">
            Documento operacional generado automáticamente por el Sistema de Control Interno (SISCON-AI).<br/>
            &copy; ${new Date().getFullYear()} ${company.razon || 'ALTAMAR MKT'} - Todos los derechos reservados.
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar la ficha detalle.');
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
        iva: sale.iva !== undefined && sale.iva !== null ? sale.iva : Math.round((sale.monto || 0) * 0.19),
        total: sale.total !== undefined && sale.total !== null ? sale.total : Math.round((sale.monto || 0) * 1.19),
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
        iva: 0,
        total: 0,
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
      const { data } = await api.post('uploads/sale-document', formData, {
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
        await api.put(`sales/${selectedSaleId}`, dataToSave);
        alert('Venta actualizada con éxito');
      } else {
        await api.post('sales', dataToSave);
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
      await api.put(`sales/${id}`, { estado: newStatus });
      setSales(prevSales => prevSales.map(sale => 
        sale.id_venta === id ? { ...sale, estado: newStatus, status: auxData.states.find(s => s.id_estado == newStatus) } : sale
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleEconomicChange = (field, value) => {
    if (isEditMode) {
      // al Editar Venta, no debe actuar la calculadora en ningun sentido
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // al Agregar Nueva Venta, dejar editable el valor, iva y total, con calculadora activa
      const numericValue = Math.round(parseFloat(value)) || 0;
      if (field === 'monto') {
        const ivaVal = Math.round(numericValue * 0.19);
        const totalVal = numericValue + ivaVal;
        setFormData(prev => ({
          ...prev,
          monto: value,
          iva: ivaVal,
          total: totalVal
        }));
      } else if (field === 'iva') {
        const netoVal = Math.round(numericValue / 0.19);
        const totalVal = netoVal + numericValue;
        setFormData(prev => ({
          ...prev,
          monto: netoVal,
          iva: value,
          total: totalVal
        }));
      } else if (field === 'total') {
        const netoVal = Math.round(numericValue / 1.19);
        const ivaVal = numericValue - netoVal;
        setFormData(prev => ({
          ...prev,
          monto: netoVal,
          iva: ivaVal,
          total: value
        }));
      }
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
      <div className="bg-white py-2 px-4 rounded-2xl shadow-sm border border-slate-100 flex justify-center items-center gap-6 w-full">
        <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 justify-center">
          Ventas
          <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-widest normal-case">
            {totalItems} Registros (Pág. {currentPage}/{totalPages})
          </span>
        </h1>
        <button 
          className="btn-glass text-green-600 border-green-100 hover:bg-green-50 flex items-center gap-1.5 text-[9px] px-2 py-1" 
          onClick={handleExportExcel}
        >
          <Download size={12} />
          Excel
        </button>
      </div>

      {/* Compact Filter Bar */}
      <div className="glass-card py-1.5 px-3 flex flex-wrap gap-2 items-center text-[10px]">
        <input
          type="text" placeholder="N° FAC"
          className="w-20 px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary/50 text-[10px] font-bold"
          value={filters.nFactura} onChange={(e) => setFilters({ ...filters, nFactura: e.target.value })}
        />
        <input
          type="text" placeholder="N° COT"
          className="w-20 px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary/50 text-[10px] font-bold"
          value={filters.nCot} onChange={(e) => setFilters({ ...filters, nCot: e.target.value })}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase">Desde</span>
          <input
            type="date"
            className="px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold"
            value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase">Hasta</span>
          <input
            type="date"
            className="px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold"
            value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" size={10} />
          <input
            type="text" placeholder="Buscar Cliente..."
            className="w-full pl-6 pr-2 py-1 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary/50 text-[10px] font-bold"
            value={filters.clientSearch} onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50/50 px-2 py-0.5 rounded-lg border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase px-1">Pagado</span>
          {['SI', 'NO', 'TODAS'].map((opt) => (
            <label key={opt} className="flex items-center gap-1 cursor-pointer group">
              <input
                type="radio" name="pagado" value={opt}
                checked={filters.pagado === opt}
                onChange={(e) => setFilters({ ...filters, pagado: e.target.value })}
                className="w-3 h-3 text-primary focus:ring-0 border-slate-200"
              />
              <span className={cn("text-[10px] font-bold transition-colors", filters.pagado === opt ? "text-primary" : "text-slate-400 group-hover:text-slate-600")}>
                {opt}
              </span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-slate-50/50 px-2 py-0.5 rounded-lg border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase px-1">Estado</span>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
            }}
            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-600 cursor-pointer focus:ring-0 py-0 pr-6"
          >
            <option value="">TODOS</option>
            {auxData.states.map((s) => (
              <option key={s.id_estado} value={s.id_estado}>
                {s.estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse min-w-[1200px] md:min-w-[1600px]">
          <thead className="text-white select-none">
            <tr>
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
                    "px-2 py-3 text-[10px] font-black uppercase tracking-wider cursor-pointer group sticky top-0 z-10 bg-slate-800",
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
                      <p className="text-[11px] font-bold text-slate-800 uppercase max-w-[120px] truncate" title={sale.client?.razon || "Cliente Generico"}>{sale.client?.razon || "Cliente Generico"}</p>
                    </td>
                    
                    <td className="px-2 py-3">
                      <p className="text-[11px] text-slate-500 whitespace-nowrap">{sale.client?.rut || "---"}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-[11px] font-bold text-slate-700 uppercase max-w-[120px] truncate" title={sale.item}>{sale.item}</p>
                    </td>
                    
                    <td className="px-2 py-3">
                      <p className="text-[10px] text-slate-500 max-w-[150px] whitespace-pre-wrap" title={sale.detalle?.replace(/\\r\\n|\\n|\\r/g, '\n')}>
                        {sale.detalle?.replace(/\\r\\n|\\n|\\r/g, '\n')}
                      </p>
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
                          <Pencil size={12} />
                        </button>
                        <button 
                          onClick={() => handlePrintSaleDetail(sale)}
                          className="p-1 hover:bg-white rounded shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all" 
                          title="Ficha Detalle (PDF)"
                        >
                          <FileText size={12} />
                        </button>
                        <button 
                          onClick={async () => { 
                            if (window.confirm('¿Estás seguro de que deseas eliminar esta venta permanentemente?')) { 
                              try {
                                await api.delete(`sales/${sale.id_venta}`); 
                                alert('Venta eliminada con éxito.');
                                fetchSales(); 
                              } catch (err) {
                                alert('Error al eliminar la venta: ' + (err.response?.data?.message || err.message));
                              }
                            } 
                          }} 
                          className="p-1 hover:bg-white rounded shadow-sm border border-slate-100 text-slate-400 hover:text-red-600 transition-all" 
                          title="Eliminar"
                        >
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
              <td colSpan={10} className="px-6 py-4 text-xs font-bold text-slate-400 text-right">Totales Globales ({totalItems} registros)</td>
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
                <h2 className="text-3xl font-black text-slate-800">{isEditMode ? 'Editar Venta' : 'Crear Nueva Venta'}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {isEditMode ? `Editando registro N° ${selectedSaleId}` : 'Registro de transacción comercial'}
                </p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
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
                      options={[
                        { value: '', label: 'Sin Cliente' },
                        ...auxData.clients.map(c => ({ value: c.id_cliente, label: `${c.razon} (${c.rut})` }))
                      ]}
                      onChange={(val) => setFormData({ ...formData, id_cliente: val })}
                    />
                    <FormSelect 
                      label="Agente (Comisionista)"
                      value={formData.id_agente}
                      options={[
                        { value: '', label: 'Sin Agente' },
                        ...auxData.agents.map(a => ({ value: a.id_user, label: a.user, comision: a.comicion }))
                      ]}
                      onChange={(val) => {
                        const agent = auxData.agents.find(a => a.id_user == val);
                        setFormData({ ...formData, id_agente: val, comicion: agent?.comicion || 0 });
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
                      <input 
                        type="number" 
                        required 
                        className="input-modern text-lg font-black text-primary" 
                        value={formData.monto} 
                        onChange={(e) => handleEconomicChange('monto', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">IVA (19%)</label>
                      <input 
                        type="number" 
                        required 
                        className="input-modern text-lg font-black text-slate-600" 
                        value={formData.iva} 
                        onChange={(e) => handleEconomicChange('iva', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Total</label>
                      <input 
                        type="number" 
                        required 
                        className="input-modern text-lg font-black text-slate-900" 
                        value={formData.total} 
                        onChange={(e) => handleEconomicChange('total', e.target.value)} 
                      />
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
                  {isEditMode ? 'Actualizar Venta' : 'Agregar Nueva Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => handleOpenModal(null)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] group"
        title="Nueva Venta"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

export default Ventas;
