"use client";

import { useState, useEffect } from 'react';
import { MapPin, Package, Plus, Trash2, Send, ArrowRight, ChevronDown, CheckCircle2, Truck, User, Link as LinkIcon } from 'lucide-react';

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
  const [dbData, setDbData] = useState<{ 
    lotes: any[], 
    instituciones: any[], 
    rutas: any[], 
    conductores: any[], 
    vehiculos: any[] 
  }>({ lotes: [], instituciones: [], rutas: [], conductores: [], vehiculos: [] });

  const [asignaciones, setAsignaciones] = useState<AsignacionItem[]>([]);
  const [loteActivo, setLoteActivo] = useState<string>('');
  const [instActiva, setInstActiva] = useState<string>('');
  const [cantidadForm, setCantidadForm] = useState<string>('');
  
  const [rutaId, setRutaId] = useState<string>('');
  const [conductorId, setConductorId] = useState<string>('');
  const [vehiculoId, setVehiculoId] = useState<string>('');
  const [modoLogistica, setModoLogistica] = useState<'existente' | 'nueva'>('existente');

  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

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
  const CONDUCTORES_DB = dbData.conductores;
  const VEHICULOS_DB = dbData.vehiculos;

  const loteSeleccionado = LOTES_DB.find(l => l.id === loteActivo);
  const instSeleccionada = INSTITUCIONES_DB.find(i => i.id === instActiva);

  const usadoPorLote = (loteId: string) =>
    asignaciones.filter(a => a.loteId === loteId).reduce((s, a) => s + a.cantidadEnviar, 0);

  const disponibleLote = (loteId: string) => {
    const lote = LOTES_DB.find(l => l.id === loteId);
    return (parseFloat(lote?.cantidad_disponible || '0')) - usadoPorLote(loteId);
  };

  const agregarAsignacion = () => {
    if (!loteActivo || !instActiva || !cantidadForm) return;
    const cant = parseFloat(cantidadForm);
    if (cant <= 0 || cant > disponibleLote(loteActivo)) return;
    const lote = LOTES_DB.find(l => l.id === loteActivo)!;
    const inst = INSTITUCIONES_DB.find(i => i.id === instActiva)!;
    setAsignaciones(prev => [...prev, {
      tempId: `${Date.now()}`,
      loteId: loteActivo,
      productoNombre: lote.producto,
      cantidadDisponible: lote.cantidad_disponible,
      unidad: lote.unidad, 
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
    if (modoLogistica === 'existente' && !rutaId) return;
    if (modoLogistica === 'nueva' && (!conductorId || !vehiculoId)) return;
    if (asignaciones.length === 0) return;

    setIsPending(true);
    const res = await crearDespacho({
      rutaId: modoLogistica === 'existente' ? rutaId : undefined,
      conductorId: modoLogistica === 'nueva' ? conductorId : undefined,
      vehiculoId: modoLogistica === 'nueva' ? vehiculoId : undefined,
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
      setConductorId('');
      setVehiculoId('');
      // Refrescar datos
      const data = await getDistribucionData();
      if (!data.error) setDbData(data as any);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      alert(res.error);
    }
    setIsPending(false);
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-white font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 px-6 md:px-10 py-5 flex items-center justify-between bg-[#0a1221]">
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
        <div className="mx-6 md:mx-10 mt-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-2xl font-medium animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Despacho creado exitosamente. Los conductores ya pueden ver sus rutas.
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Panel izquierdo: Lotes disponibles */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package className="w-3 h-3" /> Lotes disponibles <span className="text-slate-700">· PEPS</span>
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {LOTES_DB.map((lote, idx) => {
                const disp = disponibleLote(lote.id);
                const porcentaje = (disp / parseFloat(lote.cantidad_disponible)) * 100;
                return (
                  <button
                    key={lote.id}
                    onClick={() => setLoteActivo(lote.id === loteActivo ? '' : lote.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      loteActivo === lote.id
                        ? 'bg-violet-600/15 border-violet-500 shadow-lg shadow-violet-900/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {idx === 0 && (
                            <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase">Prioridad</span>
                          )}
                          <p className="font-bold text-white text-base">{lote.producto}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lote.categoria} · Ingreso: {new Date(lote.fecha_ingreso).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">{disp}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{lote.unidad}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
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
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Destino / Institución
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {INSTITUCIONES_DB.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => setInstActiva(inst.id === instActiva ? '' : inst.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    instActiva === inst.id
                      ? 'bg-cyan-600/15 border-cyan-500 shadow-lg shadow-cyan-900/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${instActiva === inst.id ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <div>
                      <p className="font-bold text-sm text-white">{inst.nombre}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{inst.tipo_poblacion} · {inst.cantidad_personas} pers.</p>
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
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="font-bold text-white text-xl">Configurar Despacho</h2>
              <p className="text-slate-500 text-sm mt-1">Selecciona el inventario, el destino y asigna el transporte.</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
                <div className={`flex-1 rounded-2xl p-5 border transition-all ${loteSeleccionado ? 'bg-violet-600/10 border-violet-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  {loteSeleccionado ? (
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Producto Seleccionado</p>
                      <p className="font-black text-lg text-white">{loteSeleccionado.producto}</p>
                      <p className="text-xs text-violet-400 font-bold mt-1">{disponibleLote(loteActivo)} {loteSeleccionado.unidad} disponibles</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-700">
                      <Package className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Elige un lote</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-slate-700 hidden md:block" />
                </div>

                <div className={`flex-1 rounded-2xl p-5 border transition-all ${instSeleccionada ? 'bg-cyan-600/10 border-cyan-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  {instSeleccionada ? (
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Destino</p>
                      <p className="font-black text-lg text-white">{instSeleccionada.nombre}</p>
                      <p className="text-xs text-cyan-400 font-bold mt-1">{instSeleccionada.cantidad_personas} personas beneficiarias</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-700">
                      <MapPin className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Elige destino</p>
                    </div>
                  )}
                </div>
              </div>

              {loteSeleccionado && instSeleccionada && (
                <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-top-4">
                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">
                        Cantidad a enviar ({loteSeleccionado.unidad})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={disponibleLote(loteActivo)}
                        value={cantidadForm}
                        onChange={e => setCantidadForm(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white text-2xl font-black placeholder-slate-800 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={agregarAsignacion}
                      disabled={!cantidadForm || parseFloat(cantidadForm) <= 0 || parseFloat(cantidadForm) > disponibleLote(loteActivo)}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white font-black px-8 py-5 rounded-xl transition-all shadow-xl shadow-violet-900/20 h-[64px]"
                    >
                      AÑADIR AL PLAN
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plan de despacho y Logística */}
          {asignaciones.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-violet-400" /> Plan de Despacho Actual
                </h2>
                <span className="bg-violet-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{asignaciones.length} ITEMS</span>
              </div>
              
              <div className="divide-y divide-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                {asignaciones.map(a => (
                  <div key={a.tempId} className="px-8 py-4 flex items-center justify-between group hover:bg-slate-800/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{a.cantidadEnviar} {a.unidad} · {a.productoNombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-500" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{a.instNombre}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarAsignacion(a.tempId)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Sección de Logística Mejorada */}
              <div className="px-8 py-8 border-t border-slate-800 bg-slate-950/40 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Asignación de Transporte</label>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button 
                      onClick={() => setModoLogistica('existente')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${modoLogistica === 'existente' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
                    >
                      RUTAS ACTIVAS
                    </button>
                    <button 
                      onClick={() => setModoLogistica('nueva')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${modoLogistica === 'nueva' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
                    >
                      NUEVA ASIGNACIÓN
                    </button>
                  </div>
                </div>

                {modoLogistica === 'existente' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={rutaId}
                        onChange={e => setRutaId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-12 py-4 text-white font-bold focus:border-violet-500 outline-none transition-all appearance-none"
                      >
                        <option value="">Selecciona una ruta en curso...</option>
                        {RUTAS_DB.map(r => (
                          <option key={r.id} value={r.id}>{r.conductor} · {r.vehiculo}</option>
                        ))}
                      </select>
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                    {RUTAS_DB.length === 0 && (
                      <p className="text-[10px] text-amber-500 font-bold italic ml-1">No hay rutas activas. Usa "Nueva Asignación" para enviar a alguien.</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={conductorId}
                        onChange={e => setConductorId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-12 py-4 text-white font-bold focus:border-violet-500 outline-none transition-all appearance-none"
                      >
                        <option value="">Elegir Conductor...</option>
                        {CONDUCTORES_DB.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                    <div className="relative">
                      <select
                        value={vehiculoId}
                        onChange={e => setVehiculoId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-12 py-4 text-white font-bold focus:border-violet-500 outline-none transition-all appearance-none"
                      >
                        <option value="">Elegir Vehículo...</option>
                        {VEHICULOS_DB.map(v => (
                          <option key={v.id} value={v.id}>{v.placa} ({v.modelo})</option>
                        ))}
                      </select>
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                )}

                <button
                  onClick={despachar}
                  disabled={isPending || (modoLogistica === 'existente' && !rutaId) || (modoLogistica === 'nueva' && (!conductorId || !vehiculoId))}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-20 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-900/30"
                >
                  {isPending ? 'PROCESANDO DESPACHO...' : (
                    <>
                      <Send className="w-5 h-5" />
                      CONFIRMAR Y DESPACHAR AHORA
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {asignaciones.length === 0 && (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-[40px] p-20 text-center">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                <Package className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Panel de Planificación Vacío</h3>
              <p className="text-slate-600 max-w-sm mx-auto text-sm">Selecciona productos y destinos a la izquierda para comenzar a armar el plan de carga del camión.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}