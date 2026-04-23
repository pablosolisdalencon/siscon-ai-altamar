import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Save, Trash2, Plus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Config = () => {
    const [activeTab, setActiveTab] = useState('estados_ventas');
    const [states, setStates] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'estados_ventas', label: 'Estados Ventas', active: true },
        { id: 'registros_ventas', label: 'Registros Ventas', active: true },
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
            const [s, r] = await Promise.all([
                api.get('/sale-states'),
                api.get('/sale-records')
            ]);
            setStates(s.data.data);
            setRecords(r.data.data);
        } catch (error) {
            console.error('Error fetching config data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveState = async (state) => {
        try {
            if (state.id_estado) {
                await api.put(`/sale-states/${state.id_estado}`, state);
            } else {
                await api.post('/sale-states', state);
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
            await api.delete(`/sale-states/${id}`);
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
            await api.put(`/sale-records/${record.id}`, record);
            alert('Configuración guardada');
            fetchData();
        } catch (error) {
            alert('Error al guardar configuración');
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-blue-700 mb-1">Configuraciones</h1>
                <p className="text-sm text-slate-500 font-medium">Aquí se configuran algunas variables y combos globales.</p>
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
            </div>
        </div>
    );
};

export default Config;
