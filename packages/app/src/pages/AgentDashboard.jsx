import React, { useState, useEffect } from 'react';

function AgentDashboard() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalCommissions: 0, count: 0 });
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    clientSearch: '',
    nFactura: '',
    agentId: ''
  });
  const [loading, setLoading] = useState(false);
  const userRole = localStorage.getItem('role');
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (userRole === 'admin') {
      const fetchAgents = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const json = await res.json();
          // Adjust based on response structure. If crudFactory returns data directly or in an array:
          const users = Array.isArray(json) ? json : (json.data || []);
          setAgents(users.filter(u => u.role === 'agente'));
        } catch (err) {
          console.error('Error fetching agents:', err);
        }
      };
      fetchAgents();
    }
  }, [userRole]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ ...filters, page: currentPage, limit: itemsPerPage }).toString();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/commissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setSales(json.data.sales);
        setSummary(json.data.summary);
        setTotalItems(json.data.pagination.total);
        setTotalPages(json.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchCommissions();
  }, [filters, currentPage, itemsPerPage]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendReport = async () => {
    try {
      // For simplicity, we send the current filters so the backend can fetch the same data
      // or we could send the HTML. Let's send the filters and agentId.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/commissions/send-report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          agentId: userRole === 'admin' ? filters.agentId : localStorage.getItem('id_agente'),
          // We could pass base64 PDF data here if we generated it on frontend.
          // Since we use window.print(), we can't easily get the PDF data in JS.
          // So the backend will just send a notification or a summary in the email body.
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('Reporte enviado con éxito');
      } else {
        alert('Error: ' + json.message);
      }
    } catch (err) {
      console.error('Error sending report:', err);
      alert('Error de conexión');
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 print:hidden">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard de Comisiones</h1>
          <p className="text-sm text-slate-500">Resumen de comisiones obtenidas en tus ventas.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-glass flex items-center gap-2">
            🖨️ Exportar PDF
          </button>
          <button onClick={handleSendReport} className="btn-primary flex items-center gap-2">
            ✉️ ENVIAR REPORTE
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Ventas</p>
          <p className="text-3xl font-black text-primary mt-1">$ {summary.totalSales.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-transparent">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Comisiones</p>
          <p className="text-3xl font-black text-green-600 mt-1">$ {summary.totalCommissions.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-slate-500/10 to-transparent">
          <p className="text-xs font-bold text-slate-500 uppercase">Cant. Ventas</p>
          <p className="text-3xl font-black text-slate-700 mt-1">{summary.count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 print:hidden">
        <div className={`grid grid-cols-1 ${userRole === 'admin' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Desde</label>
            <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="input-modern" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Hasta</label>
            <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="input-modern" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Cliente</label>
            <input type="text" name="clientSearch" value={filters.clientSearch} onChange={handleFilterChange} placeholder="Buscar..." className="input-modern" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">N° Factura</label>
            <input type="text" name="nFactura" value={filters.nFactura} onChange={handleFilterChange} placeholder="Buscar..." className="input-modern" />
          </div>
          {userRole === 'admin' && (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Agente</label>
              <select name="agentId" value={filters.agentId} onChange={handleFilterChange} className="input-modern">
                <option value="">Todos</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.user}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6">
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-slate-100">
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">N° Factura</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Agente</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">Total Venta</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">Comisión</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">Cargando...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">No se encontraron registros.</td></tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id_venta} className="border-bottom border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td className="p-3 text-sm font-medium text-slate-700">{sale.fecha}</td>
                    <td className="p-3 text-sm font-bold text-primary">{sale.n_factura}</td>
                    <td className="p-3 text-sm font-medium text-slate-700">{sale.client?.razon || '---'}</td>
                    <td className="p-3 text-sm font-medium text-slate-700">{sale.agent?.user || '---'}</td>
                    <td className="p-3 text-sm font-bold text-slate-700 text-right">$ {(sale.total || 0).toLocaleString()}</td>
                    <td className="p-3 text-sm font-bold text-green-600 text-right">$ {(sale.comicion || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalItems > itemsPerPage && (
          <div className="glass-card p-4 flex justify-between items-center mt-6">
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
      </div>
    </div>
  );
}

export default AgentDashboard;
