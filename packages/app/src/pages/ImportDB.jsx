import React, { useState } from 'react';
import api from '../lib/api';
import { Upload, Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const ImportDB = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [errorDetail, setErrorDetail] = useState(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await api.get('import/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'database_backup.sql');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.sql') || selectedFile.name.endsWith('.sql.txt'))) {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    } else {
      alert('Por favor selecciona un archivo .sql válido');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    if (!window.confirm('¿Estás seguro de que deseas importar esta base de datos? Las tablas coincidentes serán sobrescritas.')) {
      return;
    }

    setLoading(true);
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('import/database', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setMessage(data.message || 'Base de datos importada correctamente');
      setErrorDetail(null);
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setStatus('error');
      const responseData = error.response?.data;
      setMessage(responseData?.message || 'Error al importar la base de datos');
      setErrorDetail(responseData?.errors || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-3xl">
          <Database size={48} className="text-primary" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800 uppercase max-w-[50%] leading-tight">Sincronizar Base de Datos</h1>
        <p className="text-slate-500 max-w-xl font-medium text-sm uppercase tracking-widest">
          Sincronización integral del ecosistema cognitivo.
        </p>
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 relative overflow-hidden group">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
        
        <div className="relative">
          <label 
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300",
              file ? "border-primary/50 bg-primary/5" : "border-slate-200 hover:border-primary/30 hover:bg-slate-50"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
                  <CheckCircle2 size={64} className="text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={48} className="text-slate-300 mb-4 transition-transform group-hover:-translate-y-2" />
                  <p className="mb-2 text-sm text-slate-500 font-black uppercase tracking-widest">
                    Haz clic o arrastra un archivo
                  </p>
                  <p className="text-xs text-slate-400">Solo archivos SQL (.sql)</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept=".sql" onChange={handleFileChange} />
          </label>
        </div>

        {status === 'success' && (
          <div className="p-6 bg-green-50 border border-green-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-2">
            <CheckCircle2 className="text-green-500 shrink-0" size={24} />
            <div>
              <p className="font-black text-green-800 uppercase text-sm">Éxito</p>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div className="space-y-2 flex-1 overflow-hidden">
              <p className="font-black text-red-800 uppercase text-sm">Error en la importación</p>
              <p className="text-red-600 font-medium">{message}</p>
              
              {errorDetail && (
                <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-red-100 overflow-hidden">
                  <p className="text-[10px] font-black text-red-400 uppercase mb-2 tracking-widest">Diagnóstico Técnico</p>
                  <div className="font-mono text-[10px] text-red-700 space-y-1 overflow-x-auto custom-scrollbar pb-2">
                    {errorDetail.code && <p><span className="font-bold uppercase">Código:</span> {errorDetail.code}</p>}
                    {errorDetail.sqlMessage && <p><span className="font-bold uppercase">MySQL:</span> {errorDetail.sqlMessage}</p>}
                    {errorDetail.sql && (
                      <div className="mt-2">
                        <p className="font-bold uppercase mb-1">SQL Fallido:</p>
                        <pre className="bg-red-900/5 p-2 rounded-lg whitespace-pre-wrap break-all border border-red-900/10 max-h-40 overflow-y-auto">
                          {errorDetail.sql}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={cn(
              "btn-glass py-5 px-16 text-lg font-black uppercase tracking-widest transition-all",
              (!file || loading) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            )}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Iniciar Importación'
            )}
          </button>
        </div>
      </div>

      {/* Export Card */}
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 relative overflow-hidden group">
        <div className="flex flex-col items-center text-center space-y-4">
          <Database size={32} className="text-primary" />
          <h2 className="text-xl font-black text-slate-800 uppercase">Exportar Base de Datos</h2>
          <p className="text-sm text-slate-500">Descarga un respaldo completo en formato SQL.</p>
          <button 
            onClick={handleExport} 
            disabled={loading}
            className={cn(
              "btn-primary py-4 px-10 text-sm font-black uppercase tracking-widest transition-all",
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            )}
          >
            {loading ? 'Procesando...' : 'Exportar BD Completa a un SQL'}
          </button>
        </div>
      </div>

      <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-6">
        <AlertTriangle className="text-amber-500 shrink-0" size={32} />
        <div className="space-y-2">
          <h3 className="font-black text-amber-800 uppercase text-lg">Instrucciones de Importación</h3>
          <p className="text-amber-700/80 font-medium leading-relaxed">
            Esta herramienta permite la sincronización total de tablas específicas:
            <br />
            1. Sube un archivo <span className="font-bold text-slate-700">.sql</span> (ej. exportación de phpMyAdmin).
            <br />
            2. El sistema <span className="font-bold text-red-500">sobrescribirá</span> las tablas definidas en el archivo.
            <br />
            3. <span className="font-bold text-green-600 italic">Las tablas que no estén en el archivo permanecerán intactas.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportDB;
