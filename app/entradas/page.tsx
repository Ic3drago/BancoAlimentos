"use client";

import { useState, useTransition, useEffect } from 'react';
import { PackagePlus, CheckCircle2, ArrowRight, Box, Trash2, ListPlus, PlusCircle, Tag, Scale, Info } from 'lucide-react';
import { registrarEntradasMasivas } from '@/app/actions/entradas-masivas';
import { getProductos, crearProducto } from '@/app/actions/get-productos';

type EntradaTemp = {
  tempId: string;
  productoId: string;
  nombre: string;
  cantidad: string;
  unidad: string;
  unidadBase: string;
  factor: number;
  donante: string;
};

const UNIDADES_OPCIONES = [
  { value: 'unidades', label: 'Unidades (u)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: '@', label: 'Arrobas (@)' },
  { value: 'paquetes', label: 'Paquetes (paq)' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'bolsas', label: 'Bolsas (bol)' },
  { value: 'cajas', label: 'Cajas (caj)' },
];

export default function EntradasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [listaEntradas, setListaEntradas] = useState<EntradaTemp[]>([]);
  
  // Estados para nuevo producto
  const [showNuevoProd, setShowNuevoProd] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCat, setNuevaCat] = useState('Abarrotes');
  const [nuevaUnidad, setNuevaUnidad] = useState('unidades');
  const [nuevoFactor, setNuevoFactor] = useState('1');
  const [nuevaUnidadBase, setNuevaUnidadBase] = useState('unidades');

  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [donante, setDonante] = useState('');
  
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshProductos = () => {
    getProductos().then(setProductos);
  };

  useEffect(() => {
    refreshProductos();
  }, []);

  const handleCrearProducto = async () => {
    if (!nuevoNombre) return;
    const res = await crearProducto(nuevoNombre, nuevaCat, nuevaUnidad, parseFloat(nuevoFactor), nuevaUnidadBase);
    if (res.success) {
      setNuevoNombre('');
      setNuevoFactor('1');
      setNuevaUnidadBase('unidades');
      setShowNuevoProd(false);
      refreshProductos();
    } else {
      alert(res.error);
    }
  };


  const productoSeleccionado = productos.find(p => p.id === productoId);

  const agregarALista = () => {
    if (!productoId || !cantidad || Number(cantidad) <= 0) return;
    const prod = productos.find(p => p.id === productoId);
    setListaEntradas(prev => [...prev, {
      tempId: Date.now().toString(),
      productoId,
      nombre: prod.nombre,
      unidad: prod.unidad_medida,
      unidadBase: prod.unidad_base,
      factor: prod.factor_conversion,
      cantidad,
      donante
    }]);
    setProductoId('');
    setCantidad('');
  };

  const quitarDeLista = (id: string) => {
    setListaEntradas(prev => prev.filter(e => e.tempId !== id));
  };

  const handleSubmitFinal = () => {
    if (listaEntradas.length === 0) return;
    startTransition(async () => {
      const res = await registrarEntradasMasivas(listaEntradas);
      if (res?.success) {
        setSuccess(true);
        setListaEntradas([]);
        setDonante('');
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6 md:p-10 font-sans text-slate-200">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Panel Izquierdo: Selección */}
        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full text-violet-300 text-xs font-semibold uppercase tracking-widest mb-5">
              <Box className="w-3.5 h-3.5" /> Almacén Central
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Registro de<br />
              <span className="text-violet-400">Mercancía</span>
            </h1>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-400" />
                1. Seleccionar Producto
              </h2>
              <button 
                onClick={() => setShowNuevoProd(!showNuevoProd)}
                className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all border ${
                  showNuevoProd 
                    ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                    : 'bg-violet-500/10 border-violet-500/50 text-violet-400 hover:bg-violet-500/20'
                }`}
              >
                {showNuevoProd ? 'CANCELAR' : '+ NUEVO PRODUCTO'}
              </button>
            </div>

            {showNuevoProd && (
              <div className="p-8 bg-gradient-to-b from-violet-600/10 to-transparent border-b border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Alta de Producto</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Configura las equivalencias de empaque</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre</label>
                      <input 
                        type="text" 
                        value={nuevoNombre}
                        onChange={e => setNuevoNombre(e.target.value)}
                        placeholder="Ej: Aceite Girasol 1L" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Categoría</label>
                      <select 
                        value={nuevaCat}
                        onChange={e => setNuevaCat(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 transition-all"
                      >
                        <option value="Abarrotes">Abarrotes</option>
                        <option value="Frutas/Verduras">Frutas/Verduras</option>
                        <option value="Lácteos">Lácteos</option>
                        <option value="Conservas">Conservas</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-violet-400 mb-1">
                      <Info className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Lógica de Conversión</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Se recibe en</label>
                        <select 
                          value={nuevaUnidad}
                          onChange={e => setNuevaUnidad(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500 transition-all"
                        >
                          {UNIDADES_OPCIONES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Contiene</label>
                        <input 
                          type="number" 
                          value={nuevoFactor}
                          onChange={e => setNuevoFactor(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Unidades mínimas</label>
                        <input 
                          type="text" 
                          value={nuevaUnidadBase}
                          onChange={e => setNuevaUnidadBase(e.target.value)}
                          placeholder="ej: botellas"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-2 text-center">
                      * 1 {nuevaUnidad} equivale a {nuevoFactor} {nuevaUnidadBase}
                    </p>
                  </div>

                  <button 
                    onClick={handleCrearProducto}
                    disabled={!nuevoNombre}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-black py-3 rounded-xl transition-all shadow-lg shadow-violet-900/20"
                  >
                    GUARDAR PRODUCTO
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar bg-slate-900/20">
              {productos.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProductoId(p.id)}
                  className={`p-4 rounded-2xl border text-left transition-all group ${
                    productoId === p.id
                      ? 'bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-bold text-sm ${productoId === p.id ? 'text-violet-200' : 'text-slate-300'}`}>
                      {p.nombre}
                    </p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                      productoId === p.id ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {p.unidad_medida}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-60 font-medium">1 {p.unidad_medida} = {p.factor_conversion} {p.unidad_base}</p>
                </button>
              ))}
            </div>

            <div className="p-8 border-t border-slate-800 space-y-5 bg-slate-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</span>
                    {productoSeleccionado && (
                      <span className="text-[10px] font-black text-violet-400 uppercase bg-violet-400/10 px-2 py-0.5 rounded-full">
                        En {productoSeleccionado.unidad_medida}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={cantidad}
                      onChange={e => setCantidad(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-xl font-black outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all placeholder:text-slate-800"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <Scale className="w-5 h-5" />
                    </div>
                  </div>
                  {productoSeleccionado && cantidad && (
                    <p className="text-[11px] text-emerald-400 font-bold animate-pulse">
                      → Equivale a {parseFloat(cantidad) * productoSeleccionado.factor_conversion} {productoSeleccionado.unidad_base}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Donante / Procedencia</label>
                  <input
                    type="text"
                    value={donante}
                    onChange={e => setDonante(e.target.value)}
                    placeholder="Ej: Mercado Central"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-violet-500 transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <button
                onClick={agregarALista}
                disabled={!productoId || !cantidad}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-slate-500 shadow-xl"
              >
                <ListPlus className="w-5 h-5 text-violet-400" />
                Añadir a la lista de carga
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Lista de Carga */}
        <div className="flex flex-col h-full">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <PackagePlus className="text-violet-400" /> 
              Carga Recibida
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-violet-500/20">
                {listaEntradas.length} PARTIDAS
              </span>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 relative flex flex-col shadow-inner backdrop-blur-sm">
            {success && (
              <div className="absolute inset-x-6 top-6 z-20 flex items-center gap-3 bg-emerald-500/90 text-white px-5 py-4 rounded-2xl font-bold animate-in fade-in zoom-in duration-300 shadow-2xl shadow-emerald-900/40">
                <CheckCircle2 className="w-6 h-6" /> 
                <span>¡Inventario actualizado con éxito!</span>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {listaEntradas.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 py-32">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                    <PackagePlus className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-bold text-sm uppercase tracking-widest opacity-40">Esperando ingresos...</p>
                  <p className="text-[11px] mt-2 opacity-30 px-10 text-center uppercase font-medium">Selecciona productos a la izquierda para armar la lista de carga</p>
                </div>
              )}
              {listaEntradas.map(item => (
                <div key={item.tempId} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-violet-500/40 transition-all shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-violet-400 text-xs">
                      {item.unidad === 'unidades' ? 'U' : item.unidad.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-black text-violet-300">{item.cantidad}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.unidad}</span>
                        <span className="text-[10px] text-emerald-500 font-bold">(= {parseFloat(item.cantidad) * item.factor} {item.unidadBase})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic mt-1 font-medium">{item.donante || 'Donante Anónimo'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => quitarDeLista(item.tempId)} 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={handleSubmitFinal}
                disabled={isPending || listaEntradas.length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-20 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-violet-900/40 transition-all active:scale-[0.98]"
              >
                {isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    PROCESANDO CARGA...
                  </div>
                ) : (
                  <>
                    CONFIRMAR INGRESO AL SISTEMA <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}