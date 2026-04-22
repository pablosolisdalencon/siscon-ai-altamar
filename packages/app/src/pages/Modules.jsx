import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { User, Briefcase, Truck, Users, Plus, Mail, Phone, Hash, Search, Edit2, Trash2, X, Save, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ModuleManager = ({ title, endpoint, icon: Icon, fields }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setItems(data.data || []);
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || fields.reduce((acc, f) => {
      if (f.type === 'section') return acc;
      return { ...acc, [f.name]: f.defaultValue || '' };
    }, {}));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out section markers and handle numbers
      const cleanData = {};
      fields.forEach(f => {
        if (f.type !== 'section') {
          let val = formData[f.name];
          if (f.type === 'number') val = parseFloat(val) || 0;
          cleanData[f.name] = val;
        }
      });

      if (editingItem) {
        const idKey = Object.keys(editingItem).find(k => k.startsWith('id_') || k === 'id');
        await api.put(`${endpoint}/${editingItem[idKey]}`, cleanData);
      } else {
        await api.post(endpoint, cleanData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error guardando datos: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const idKey = Object.keys(item).find(k => k.startsWith('id_') || k === 'id');
      await api.delete(`${endpoint}/${item[idKey]}`);
      fetchItems();
    } catch (error) {
      alert('Error eliminando');
    }
  };

  const filteredItems = items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">{title}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{items.length} Registros activos</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Nuevo Registro
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" placeholder={`Buscar en ${title}...`}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary/50 shadow-sm"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)
        ) : filteredItems.map((item, idx) => (
          <div key={idx} className="glass-card p-6 group hover:translate-y-[-4px] transition-all relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(item)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-primary"><Edit2 size={14}/></button>
              <button onClick={() => handleDelete(item)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon size={24} />
              </div>
              <div className="flex flex-col items-end mr-12">
                <span className="text-[10px] font-black text-slate-300 uppercase">RUT / ID</span>
                <span className="text-xs font-bold text-slate-500 truncate max-w-[100px]">{item.rut || item.id || item.user}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-4 truncate">{item.nombre || item.razon || item.user}</h3>

            <div className="space-y-3">
              {(item.mail || item.pago_mail || item.comercial_mail) && (
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={14} className="text-slate-300" />
                  <span className="text-xs font-medium truncate">{item.mail || item.pago_mail || item.comercial_mail}</span>
                </div>
              )}
              {(item.fono || item.pago_fono || item.comercial_fono) && (
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone size={14} className="text-slate-300" />
                  <span className="text-xs font-medium">{item.fono || item.pago_fono || item.comercial_fono}</span>
                </div>
              )}
              {item.comision_default !== undefined && (
                <div className="flex items-center gap-3">
                  <DollarSign size={14} className="text-green-500" />
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Comisión: {item.comision_default}%</span>
                </div>
              )}
              {item.role && (
                <div className="flex items-center gap-3">
                  <Briefcase size={14} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded">Rol: {item.role}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">{editingItem ? 'Editar' : 'Nuevo'} {title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field, i) => {
                  if (field.type === 'section') {
                    return (
                      <div key={i} className="col-span-full border-b border-slate-100 pb-2 mt-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest">{field.label}</h3>
                      </div>
                    );
                  }
                  return (
                    <div key={field.name} className={cn("space-y-1", field.fullWidth && "col-span-full")}>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold appearance-none"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          required={field.required}
                        >
                          <option value="">Seleccionar...</option>
                          {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : (
                        <input 
                          type={field.type || 'text'}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                          placeholder={field.placeholder || field.label}
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-50 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-2 px-8">
                  <Save size={18} />
                  {editingItem ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AGENT_FIELDS = [
  { type: 'section', label: 'Información Básica' },
  { name: 'nombre', label: 'Nombre Completo', required: true, fullWidth: true },
  { name: 'rut', label: 'RUT' },
  { name: 'mail', label: 'Email' },
  { name: 'fono', label: 'Teléfono' },
  { name: 'comision_default', label: 'Comisión Base (%)', type: 'number', defaultValue: 0 }
];

const CLIENT_FIELDS = [
  { type: 'section', label: 'Datos de la Empresa' },
  { name: 'razon', label: 'Razón Social', required: true, fullWidth: true },
  { name: 'rut', label: 'RUT', required: true },
  { name: 'giro', label: 'Giro / Actividad' },
  { name: 'direccion', label: 'Dirección Comercial', fullWidth: true },
  { type: 'section', label: 'Contacto de Pagos' },
  { name: 'pago_nombre', label: 'Nombre Contacto Pagos' },
  { name: 'pago_mail', label: 'Email Pagos' },
  { name: 'pago_fono', label: 'Teléfono Pagos' },
  { type: 'section', label: 'Contacto Comercial' },
  { name: 'comercial_nombre', label: 'Nombre Contacto Comercial' },
  { name: 'comercial_mail', label: 'Email Comercial' },
  { name: 'comercial_fono', label: 'Teléfono Comercial' },
  { type: 'section', label: 'Otros' },
  { name: 'mensaje_cobro', label: 'Mensaje Personalizado Cobro', fullWidth: true }
];

const PROVIDER_FIELDS = [
  { type: 'section', label: 'Datos del Proveedor' },
  { name: 'razon', label: 'Nombre / Razón Social', required: true, fullWidth: true },
  { name: 'rut', label: 'RUT', required: true },
  { name: 'giro', label: 'Giro / Rubro' },
  { name: 'direccion', label: 'Dirección', fullWidth: true },
  { type: 'section', label: 'Contacto Comercial' },
  { name: 'comercial_nombre', label: 'Nombre Contacto' },
  { name: 'comercial_mail', label: 'Email' },
  { name: 'comercial_fono', label: 'Teléfono' },
  { type: 'section', label: 'Contacto de Pagos' },
  { name: 'pago_nombre', label: 'Nombre Tesorería' },
  { name: 'pago_mail', label: 'Email Pagos' },
  { name: 'pago_fono', label: 'Teléfono Pagos' }
];

const USER_FIELDS = [
  { type: 'section', label: 'Credenciales de Acceso' },
  { name: 'user', label: 'Nombre de Usuario', required: true },
  { name: 'pass', label: 'Contraseña', type: 'password', required: true },
  { name: 'role', label: 'Rol del Sistema', type: 'select', defaultValue: 'user', options: [
    { label: 'Administrador', value: 'admin' },
    { label: 'Usuario', value: 'user' },
    { label: 'Visualizador', value: 'viewer' }
  ]}
];

export const Agentes = () => <ModuleManager title="Gestión de Agentes" endpoint="/agents" icon={Users} fields={AGENT_FIELDS} />;
export const Clientes = () => <ModuleManager title="Clientes" endpoint="/clients" icon={Briefcase} fields={CLIENT_FIELDS} />;
export const Proveedores = () => <ModuleManager title="Proveedores" endpoint="/providers" icon={Truck} fields={PROVIDER_FIELDS} />;
export const Usuarios = () => <ModuleManager title="Usuarios" endpoint="/users" icon={User} fields={USER_FIELDS} />;
