import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Mail, Clock, AlertTriangle, ChevronRight, ChevronDown, DollarSign, Search, Filter, Save, Trash2, X, Send, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Cobros = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState(null);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [mailContent, setMailContent] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/collections/dashboard');
      setCollections(data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCobros = (client) => {
    setSelectedClient(client);
    const template = `Estimados ${client.razon},\n\nNos ponemos en contacto para informarles que registran un saldo pendiente en nuestra contabilidad.\n\nA continuación detallamos las facturas con pago atrasado:\n\nEsperamos su pronta respuesta o comprobante de pago.\n\nAtentamente,\nEquipo de Finanzas Altamar`;
    setMailContent(template);
    setIsMailModalOpen(true);
  };

  const handleSendCollection = async () => {
    try {
      // Mocking send email
      alert(`Enviando cobro a ${selectedClient.razon}...\n\nContenido: ${mailContent.substring(0, 50)}...`);
      setIsMailModalOpen(false);
    } catch (error) {
      alert('Error enviando correo');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Módulo de Cobranza Proactiva</h1>
          <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Gestión de Facturación Vencida</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 text-right">
          <p className="text-[10px] font-black text-red-400 uppercase">Mora Total Global</p>
          <p className="text-2xl font-black text-red-600">$ {collections.reduce((acc, c) => acc + c.stats.totalTotal, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)
        ) : collections.map((client) => (
          <div key={client.id} className="glass-card overflow-hidden group border-l-4 border-l-red-500">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{client.razon}</h2>
                  <p className="text-xs font-bold text-slate-400 tracking-widest">{client.rut}</p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase">Vencido</p>
                  <p className="text-2xl font-black text-red-500">$ {client.stats.totalTotal.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{client.items.length} DOCUMENTOS</p>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => handleOpenCobros(client)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                   >
                     <Mail size={18} />
                     COBRAR
                   </button>
                   <button 
                    onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                    className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"
                   >
                     {expandedClient === client.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                   </button>
                </div>
              </div>
            </div>

            {/* Expandable Table */}
            {expandedClient === client.id && (
              <div className="p-6 pt-0 animate-in slide-in-from-top duration-300">
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black uppercase">Fecha</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase">Documento</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase">Detalle</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-right">Días Mora</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {client.items.map((sale) => (
                        <tr key={sale.id_venta}>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{sale.fecha}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">FAC: {sale.n_factura}</span>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-xs font-bold text-slate-700">{sale.item}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="text-xs font-black text-red-500">{sale.daysOverdue} d.</span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-slate-900">${sale.total?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collection Email Modal */}
      {isMailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Send size={20} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">Preparar Cobro por Email</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Mail size={12}/> {selectedClient.pago_mail || 'sin-correo@configurado.cl'}
                   </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMailModalOpen(false)}
                className="w-12 h-12 rounded-2xl hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
              {/* Message Editor */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cuerpo del Mensaje</h3>
                   <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">Mensaje Editable</span>
                </div>
                <textarea 
                  className="w-full h-[400px] p-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:border-primary/50 text-sm font-medium leading-relaxed resize-none shadow-inner"
                  value={mailContent}
                  onChange={(e) => setMailContent(e.target.value)}
                />
              </div>

              {/* Debt Preview Table */}
              <div className="w-full lg:w-[400px] space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen de Deuda a Adjuntar</h3>
                <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Detalle de Facturas</p>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedClient.items.map(item => (
                      <div key={item.id_venta} className="flex justify-between items-center pb-3 border-b border-white/10 last:border-0">
                         <div>
                            <p className="text-xs font-black tracking-tight">FAC {item.n_factura}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{item.fecha}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black">$ {item.total?.toLocaleString()}</p>
                            <p className="text-[10px] text-red-400 font-bold uppercase">{item.daysOverdue} DÍAS MORA</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
                     <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Total a Cobrar</p>
                     <p className="text-2xl font-black text-white">$ {selectedClient.stats.totalTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-blue-600">
                  <FileText size={20} className="shrink-0" />
                  <p className="text-[10px] font-bold leading-relaxed uppercase">Se adjuntará un PDF detallado de las facturas seleccionadas automáticamente al enviar.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50 rounded-b-[40px]">
               <button 
                onClick={() => setIsMailModalOpen(false)}
                className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
               >
                 CANCELAR
               </button>
               <button 
                onClick={handleSendCollection}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
               >
                 <Send size={18} />
                 ENVIAR COBRO
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cobros;
