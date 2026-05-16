import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Save, Trash2, Plus, Check, Mail, Server, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Config = () => {
    const [activeTab, setActiveTab] = useState('estados_ventas');
    const [states, setStates] = useState([]);
    const [records, setRecords] = useState([]);
    const [mailingConfig, setMailingConfig] = useState(null);
    const [mailingMode, setMailingMode] = useState('off');
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'estados_ventas', label: 'Estados Ventas', active: true },
        { id: 'registros_ventas', label: 'Registros Ventas', active: true },
        { id: 'mailing', label: 'Mailing', active: true },
        { id: 'estados_compras', label: 'Estados Compras', active: false },
        { id: 'estados_empresas', label: 'Estados Empresas', active: false },
        { id: 'alarmas_ventas', label: 'Alarmas Ventas', active: false },
        { id: 'alarmas_compras', label: 'Alarmas Compras', active: false },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, r, c, configs] = await Promise.all([
                api.get('sale-states'),
                api.get('sale-records'),
                api.get('company'),
                api.get('configurations')
            ]);
            setStates(s.data.data);
            setRecords(r.data.data);
            
            const mMode = configs.data.data.find(conf => conf.clave === 'mailing_mode');
            if (mMode) {
                setMailingConfig(mMode);
                setMailingMode(mMode.valor);
            }
        } catch (error) {
            console.error('Error fetching config data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveState = async (state) => {
        try {
            if (state.id_estado) {
                await api.put(`sale-states/${state.id_estado}`, state);
            } else {
                await api.post('sale-states', state);
            }
            alert('Estado guardado');
            fetchData();
        } catch (error) {
            alert('Error al guardar estado');
        }
    };

    const handleDeleteState = async (id) => {
        if (!confirm('¿Eliminar este estado?')) return;
        try {
            await api.delete(`sale-states/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleAddState = () => {
        setStates([...states, { estado: '', color: '#cccccc' }]);
    };

    const handleUpdateRecord = async (record) => {
        try {
            await api.put(`sale-records/${record.id}`, record);
            alert('Configuración guardada');
            fetchData();
        } catch (error) {
            alert('Error al guardar configuración');
        }
    };

    const handleUpdateMailing = async (mode) => {
        try {
            if (mailingConfig) {
                await api.put(`configurations/${mailingConfig.id}`, { valor: mode });
            } else {
                const res = await api.post('configurations', { clave: 'mailing_mode', valor: mode });
                setMailingConfig(res.data.data);
            }
            setMailingMode(mode);
            alert('Modo de mailing actualizado con éxito');
        } catch (error) {
            console.error('Error updating mailing mode:', error);
            alert('Error al actualizar el modo de mailing');
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight text-center max-w-[50%] leading-tight uppercase">
                    Configuración
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Variables Globales</p>
                </h1>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        disabled={!tab.active}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2 rounded-md font-bold text-sm transition-all",
                            activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-md"
                                : tab.active
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-slate-300 text-slate-100 cursor-not-allowed"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {activeTab === 'estados_ventas' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-700">Estados Ventas</h2>
                        <button
                            onClick={handleAddState}
                            className="px-4 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                            Nuevo Estado
                        </button>

                        <div className="overflow-x-auto max-w-lg">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-600 text-white text-[10px] uppercase font-black">
                                        <th className="px-3 py-2 text-center w-12">#</th>
                                        <th className="px-3 py-2 text-left">estado</th>
                                        <th className="px-3 py-2 text-left w-32">color</th>
                                        <th className="px-3 py-2 text-center w-16">accion</th>
                                    </tr>
                                </thead>
                                <tbody className="border border-slate-300">
                                    {states.map((s, idx) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="px-2 py-1 text-center text-xs font-bold text-slate-400">{s.id_estado}</td>
                                            <td className="px-2 py-1">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-bold uppercase"
                                                    value={s.estado}
                                                    onChange={(e) => {
                                                        const newStates = [...states];
                                                        newStates[idx].estado = e.target.value;
                                                        setStates(newStates);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        className="w-20 px-2 py-1 border border-slate-300 rounded text-[10px] font-mono"
                                                        value={s.color}
                                                        onChange={(e) => {
                                                            const newStates = [...states];
                                                            newStates[idx].color = e.target.value;
                                                            setStates(newStates);
                                                        }}
                                                    />
                                                    <input
                                                        type="color"
                                                        className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                                                        value={s.color}
                                                        onChange={(e) => {
                                                            const newStates = [...states];
                                                            newStates[idx].color = e.target.value;
                                                            setStates(newStates);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-2 py-1 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleSaveState(s)}
                                                        className="p-1.5 bg-slate-300 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteState(s.id_estado)}
                                                        className="p-1.5 bg-slate-300 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="px-4 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold hover:bg-slate-200 transition-colors">
                            Finalizar
                        </button>
                    </div>
                )}

                {activeTab === 'registros_ventas' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-700">Cantidad de Ventas en listado</h2>
                        <div className="max-w-md">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-600 text-white text-[10px] uppercase font-black">
                                        <th className="px-3 py-2 text-left">Cantidad de Ventas en Pagina</th>
                                    </tr>
                                </thead>
                                <tbody className="border border-slate-300">
                                    {records.map((r, idx) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-slate-500">Cantidad Actual {r.cantidad}</span>
                                                    <div className="flex flex-1 gap-2 items-center">
                                                        <input
                                                            type="number"
                                                            className="flex-1 px-3 py-2 border border-slate-300 rounded font-bold"
                                                            value={r.cantidad}
                                                            onChange={(e) => {
                                                                const newRecords = [...records];
                                                                newRecords[idx].cantidad = e.target.value;
                                                                setRecords(newRecords);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateRecord(r)}
                                                            className="p-2 bg-slate-300 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                                        >
                                                            <Save size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'mailing' && (
                    <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Motor de Envío</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración de Mensajería</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                            {[
                                { id: 'off', label: 'Desactivado', icon: Shield, desc: 'Ningún correo será enviado por el sistema.', color: 'slate' },
                                { id: 'sendgrid', label: 'SendGrid', icon: Check, desc: 'Envío profesional vía API. Requiere configuración DNS.', color: 'blue' },
                                { id: 'hosting', label: 'Hosting', icon: Server, desc: 'Envío nativo desde el servidor SMTP del hosting.', color: 'emerald' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleUpdateMailing(opt.id)}
                                    className={cn(
                                        "relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 text-left group",
                                        mailingMode === opt.id
                                            ? `border-${opt.color}-500 bg-${opt.color}-50/50 shadow-lg shadow-${opt.color}-500/10`
                                            : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-2xl mb-4 transition-colors",
                                        mailingMode === opt.id 
                                            ? `bg-${opt.color}-500 text-white` 
                                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    )}>
                                        <opt.icon size={20} />
                                    </div>
                                    
                                    <h3 className={cn(
                                        "font-black uppercase tracking-wider text-sm mb-2",
                                        mailingMode === opt.id ? `text-${opt.color}-700` : "text-slate-700"
                                    )}>
                                        {opt.label}
                                    </h3>
                                    
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {opt.desc}
                                    </p>

                                    {mailingMode === opt.id && (
                                        <div className={cn(
                                            "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center",
                                            `bg-${opt.color}-500 text-white animate-in zoom-in duration-300`
                                        )}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-4xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nota Técnica</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                El cambio de modo es instantáneo y afecta a todos los módulos (Cobranzas, Comisiones, etc.). 
                                Asegúrese de que las credenciales en el archivo .env coincidan con el modo seleccionado.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Config;
