import React, { useState, useEffect } from 'react';
import api, { getBaseURL } from '../lib/api';
import { 
  Building2, Phone, Mail, User, Save, Upload, 
  FileText, Briefcase, CreditCard, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

const Empresa = () => {
  const apiUrl = getBaseURL();
  const baseUrl = apiUrl.includes('/siscon-ai/api') ? apiUrl : apiUrl.replace(/\/api$/, '');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    rut: '',
    razon: '',
    giro: '',
    direccion: '',
    fono: '',
    mail: '',
    comercial_nombre: '',
    comercial_mail: '',
    comercial_fono: '',
    pago_nombre: '',
    pago_mail: '',
    pago_fono: '',
    pago_firma: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await api.get('company');
      if (response.data) {
        setFormData(response.data);
        if (response.data.pago_firma) {
          setPreviewUrl(`${baseUrl}/docs/FIRMAS/${response.data.pago_firma}`);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos de la empresa' });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'pago_firma') {
        data.append(key, formData[key]);
      }
    });
    
    if (selectedFile) {
      data.append('firma', selectedFile);
    }

    try {
      await api.put('company', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Información actualizada correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating company:', error);
      setMessage({ type: 'error', text: 'Error al actualizar la información' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight text-center max-w-[50%] leading-tight uppercase">
          Empresa
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Configuración Global</p>
        </h1>
      </div>

      {message && (
        <div className={cn(
          "mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <FileText size={16} />
            Información Legal y Contacto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">RUT</label>
              <input 
                name="rut" value={formData.rut} onChange={handleInputChange}
                className="input-modern" placeholder="76.701.057-5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Razón Social</label>
              <input 
                name="razon" value={formData.razon} onChange={handleInputChange}
                className="input-modern" placeholder="ALTAMAR MKT"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Giro</label>
              <input 
                name="giro" value={formData.giro} onChange={handleInputChange}
                className="input-modern" placeholder="Publicidad"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Dirección</label>
              <input 
                name="direccion" value={formData.direccion} onChange={handleInputChange}
                className="input-modern" placeholder="Pasaje Lázaro 5539, Quinta Normal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fono Principal</label>
              <input 
                name="fono" value={formData.fono} onChange={handleInputChange}
                className="input-modern" placeholder="992335039"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email General</label>
              <input 
                name="mail" value={formData.mail} onChange={handleInputChange}
                className="input-modern" placeholder="contacto@altamarmkt.cl"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contacto Comercial */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/20" />
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Briefcase size={16} />
              Contacto Comercial
            </h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre</label>
                <input 
                  name="comercial_nombre" value={formData.comercial_nombre} onChange={handleInputChange}
                  className="input-modern" placeholder="Carlos Zúñiga"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
                <input 
                  name="comercial_mail" value={formData.comercial_mail} onChange={handleInputChange}
                  className="input-modern" placeholder="czuniga@altamarmkt.cl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fono</label>
                <input 
                  name="comercial_fono" value={formData.comercial_fono} onChange={handleInputChange}
                  className="input-modern" placeholder="12345678"
                />
              </div>
            </div>
          </section>

          {/* Contacto de Pago */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20" />
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <CreditCard size={16} />
              Contacto de Pago
            </h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre</label>
                <input 
                  name="pago_nombre" value={formData.pago_nombre} onChange={handleInputChange}
                  className="input-modern" placeholder="Carlos Zúñiga"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
                <input 
                  name="pago_mail" value={formData.pago_mail} onChange={handleInputChange}
                  className="input-modern" placeholder="czuniga@altamarmkt.cl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fono</label>
                <input 
                  name="pago_fono" value={formData.pago_fono} onChange={handleInputChange}
                  className="input-modern" placeholder="7890789"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Firma Cobro */}
        <section className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <Upload size={16} />
            Firma de Cobro (Email)
          </h2>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full">
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Esta imagen se adjuntará automáticamente al final de todos los correos electrónicos de cobro enviados por el sistema.
              </p>
              
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 group-hover:border-primary/50 group-hover:bg-slate-800/50 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm">Haz clic para subir o arrastra una imagen</p>
                    <p className="text-xs text-slate-500 mt-1">Recomendado: JPG o PNG (máx 2MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-4 block">Vista Previa de la Firma</label>
              <div className="bg-white rounded-2xl p-4 shadow-2xl min-h-[120px] flex items-center justify-center overflow-hidden border border-slate-100">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Firma Preview" 
                    className="max-w-full max-h-[200px] object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center gap-2">
                    <AlertCircle size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Sin firma configurada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-8">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "flex items-center gap-3 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-sm transition-all duration-300 shadow-xl",
              saving 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-primary/20"
            )}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Empresa;
