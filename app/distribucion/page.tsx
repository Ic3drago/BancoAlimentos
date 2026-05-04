"use client";

import { useState, useEffect } from 'react';
import { MapPin, Package, Plus, Trash2, Send, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';

// Tipos
type Lote = {
  id: string;
  producto: string;
  cantidad_disponible: number;
  unidad: string;
  fecha_ingreso: string;
};

type Institucion = {
  id: string;
  nombre: string;
  tipo_poblacion: string;
  cantidad_personas: number;
};

type Ruta = {
  id: string;
  conductor: string;
  vehiculo: string;
};

type AsignacionItem = {
  tempId: string;
  loteId: string;
  productoNombre: string;
  cantidadDisponible: number;
  unidad: string;
  instId: string;
  instNombre: string;
  cantidadEnviar: number;
};

import { getDistribucionData } from '@/app/actions/get-distribucion';
import { crearDespacho } from '@/app/actions/despachosaction';

export default function DistribucionPage() {
  const [dbData, setDbData] = useState<{ lotes: any[], instituciones: any[], rutas: any[] }>({ lotes: [], instituciones: [], rutas: [] });
  const [asignaciones, setAsignaciones] = useState<AsignacionItem[]>([]);
  const [loteActivo, setLoteActivo] = useState<string>('');
  const [instActiva, setInstActiva] = useState<string>('');
  const [cantidadForm, setCantidadForm] = useState<string>('');
  const [rutaId, setRutaId] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [tab, setTab] = useState<'asignar' | 'resumen'>('asignar');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDistribucionData();
      if (!data.error) {
        setDbData(data as any);
      }
    };
    fetchData();
  }, []);

  const LOTES_DB = dbData.lotes;
  const INSTITUCIONES_DB = dbData.instituciones;
  const RUTAS_DB = dbData.rutas;

  const loteSeleccionado = LOTES_DB.find(l => l.id === loteActivo);
  const instSeleccionada = INSTITUCIONES_DB.find(i => i.id === instActiva);

  // Calcular cuánto ya se asignó de cada lote
  const usadoPorLote = (loteId: string) =>
    asignaciones.filter(a => a.loteId === loteId).reduce((s, a) => s + a.cantidadEnviar, 0);

  const disponibleLote = (loteId: string) => {
    const lote = LOTES_DB.find(l => l.id === loteId);
    return (lote?.cantidad_disponible || 0) - usadoPorLote(loteId);
  };

  const agregarAsignacion = () => {
    if (!loteActivo || !instActiva || !cantidadForm) return;
    const cant = Number(cantidadForm);
    if (cant <= 0 || cant > disponibleLote(loteActivo)) return;
    const lote = LOTES_DB.find(l => l.id === loteActivo)!;
    const inst = INSTITUCIONES_DB.find(i => i.id === instActiva)!;
    setAsignaciones(prev => [...prev, {
      tempId: `${Date.now()}`,
      loteId: loteActivo,
      productoNombre: lote.producto,
      cantidadDisponible: lote.cantidad_disponible,
      unidad: 'unid', // Por defecto
      instId: instActiva,
      instNombre: inst.nombre,
      cantidadEnviar: cant,
    }]);
    setCantidadForm('');
  };

  const eliminarAsignacion = (tempId: string) => {
    setAsignaciones(prev => prev.filter(a => a.tempId !== tempId));
  };

  const despachar = async () => {
    if (!rutaId || asignaciones.length === 0) return;
    setIsPending(true);
    const res = await crearDespacho({
      rutaId,
      asignaciones: asignaciones.map(a => ({
        loteId: a.loteId,
        instId: a.instId,
        cantidadEnviar: a.cantidadEnviar
      }))
    });
    
    if (res.success) {
      setSuccess(true);
      setAsignaciones([]);
      setRutaId('');
      // Refrescar datos
      const data = await getDistribucionData();
      if (!data.error) setDbData(data as any);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      alert(res.error);
    }
    setIsPending(false);
  };


  const totalAsignaciones = asignaciones.length;

  return (
    <div className="min-h-screen bg-[#080d18] text-white font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 px-6 md:px-10 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-0.5">Banco de Alimentos · Bolivia</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Distribución y Logística</h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Sistema Online</span>
        </div>
      </header>

      {success && (
        <div className="mx-6 md:mx-10 mt-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-2xl font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Despacho creado exitosamente. Los conductores ya pueden ver sus rutas.
        </div>
      )}

      <div className="max-w-[1300px] mx-auto px-6 md:px-10 py-8 grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Panel izquierdo: Lotes disponibles (PEPS) */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Lotes disponibles <span className="text-slate-700">· orden PEPS</span>
            </h2>
            <div className="space-y-3">
              {LOTES_DB.map((lote, idx) => {
                const disp = disponibleLote(lote.id);
                const porcentaje = (disp / lote.cantidad_disponible) * 100;
                return (
                  <button
                    key={lote.id}
                    onClick={() => setLoteActivo(lote.id === loteActivo ? '' : lote.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      loteActivo === lote.id
                        ? 'bg-violet-600/15 border-violet-500/60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          {idx === 0 && (
                            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">PEPS</span>
                          )}
                          <p className="font-bold text-white">{lote.producto}</p>
                        </div>
                        <p className="text-xs text-slate-500">Ingresado: {new Date(lote.fecha_ingreso).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">{disp}</p>
                        <p className="text-xs text-slate-500">unid. disp.</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-violet-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instituciones destino */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Destino / Institución</h2>
            <div className="space-y-2">
              {INSTITUCIONES_DB.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => setInstActiva(inst.id === instActiva ? '' : inst.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    instActiva === inst.id
                      ? 'bg-cyan-600/15 border-cyan-500/60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${instActiva === inst.id ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <div>
                      <p className="font-semibold text-sm text-white">{inst.nombre}</p>
                      <p className="text-xs text-slate-500">{inst.tipo_poblacion} · {inst.cantidad_personas} pers.</p>
                    </div>
                  </div>
                  <MapPin className={`w-4 h-4 ${instActiva === inst.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel central: Asignador */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Formulario de asignación */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-800">
              <h2 className="font-bold text-white text-lg">Crear asignación de lote</h2>
              <p className="text-slate-500 text-sm mt-0.5">Selecciona lote y destino, define cuánto enviar.</p>
            </div>

            <div className="px-7 py-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3">
                  {loteSeleccionado ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Producto</p>
                      <p className="font-bold text-violet-300">{loteSeleccionado.producto}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{disponibleLote(loteActivo)} {loteSeleccionado.unidad} disponibles</p>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">← Selecciona un lote</p>
                  )}
                </div>

                <ArrowRight className="w-5 h-5 text-slate-600 hidden sm:block shrink-0" />

                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3">
                  {instSeleccionada ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Destino</p>
                      <p className="font-bold text-cyan-300">{instSeleccionada.nombre}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{instSeleccionada.cantidad_personas} personas</p>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm">← Selecciona destino</p>
                  )}
                </div>
              </div>

              {loteSeleccionado && instSeleccionada && (
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">
                      Cantidad a enviar (máx. {disponibleLote(loteActivo)} {loteSeleccionado.unidad})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={disponibleLote(loteActivo)}
                      value={cantidadForm}
                      onChange={e => setCantidadForm(e.target.value)}
                      placeholder="Ej: 50"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-slate-600 focus:border-violet-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={agregarAsignacion}
                    disabled={!cantidadForm || Number(cantidadForm) <= 0 || Number(cantidadForm) > disponibleLote(loteActivo)}
                    className="mt-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold p-3 rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de asignaciones */}
          {asignaciones.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-white">Plan de despacho</h2>
                <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-3 py-1 rounded-full">{totalAsignaciones} asignaciones</span>
              </div>
              
              <div className="divide-y divide-slate-800">
                {asignaciones.map(a => (
                  <div key={a.tempId} className="px-7 py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{a.cantidadEnviar} {a.unidad} · {a.productoNombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-500" />
                          <p className="text-xs text-cyan-400">{a.instNombre}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarAsignacion(a.tempId)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Asignar conductor y despachar */}
              <div className="px-7 py-5 border-t border-slate-800 bg-slate-950/50">
                <label className="block text-xs text-slate-400 font-semibold mb-2">Conductor / Vehículo</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={rutaId}
                    onChange={e => setRutaId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-all"
                  >
                    <option value="">Selecciona conductor...</option>
                    {RUTAS_DB.map(r => (
                      <option key={r.id} value={r.id}>{r.conductor} · {r.vehiculo}</option>
                    ))}
                  </select>
                  <button
                    onClick={despachar}
                    disabled={!rutaId || asignaciones.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    Despachar
                  </button>
                </div>
              </div>
            </div>
          )}

          {asignaciones.length === 0 && (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-3xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Selecciona un lote y un destino para comenzar a planificar el despacho.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}