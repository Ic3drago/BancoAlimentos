"use client";

import { useState, useTransition, useEffect } from 'react';
import { PackagePlus, CheckCircle2, ArrowRight, Box } from 'lucide-react';
import { registrarEntrada } from '@/app/actions/entradas-action';
import { getProductos } from '@/app/actions/get-productos';

export default function EntradasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [donante, setDonante] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getProductos().then(setProductos);
  }, []);

  const productoSeleccionado = productos.find(p => p.id === productoId);

  const handleSubmit = () => {
    if (!productoId || !cantidad || Number(cantidad) <= 0) return;
    startTransition(async () => {
      const form = new FormData();
      form.append('productoId', productoId);
      form.append('cantidad', cantidad);
      form.append('donante', donante);
      const res = await registrarEntrada(form);
      if (res?.success) {
        setSuccess(true);
        setProductoId('');
        setCantidad('');
        setDonante('');
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full text-violet-300 text-xs font-semibold uppercase tracking-widest mb-5">
            <Box className="w-3.5 h-3.5" />
            Almacén · Política PEPS automática
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            Registro de<br />
            <span className="text-violet-400">Donaciones</span>
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            Los lotes se ordenan automáticamente por fecha de ingreso.
          </p>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-2xl font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Lote registrado exitosamente en el almacén.
          </div>
        )}

        <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="border-b border-slate-800 px-8 py-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Paso 1</p>
            <h2 className="text-lg font-bold text-white">¿Qué producto se dona?</h2>
          </div>

          <div className="px-8 py-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productos.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProductoId(String(p.id))}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    productoId === String(p.id)
                      ? 'bg-violet-600/20 border-violet-500 text-violet-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <p className="font-bold text-sm">{p.nombre}</p>
                  <p className="text-xs mt-1 opacity-60">{p.categoria} · unid.</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 px-8 py-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Paso 2</p>
            <h2 className="text-lg font-bold text-white mb-5">Detalles del ingreso</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Cantidad {productoSeleccionado ? `(${productoSeleccionado.unidad})` : ''}
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  placeholder="Ej: 200"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Donante / Proveedor <span className="text-slate-600 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={donante}
                  onChange={e => setDonante(e.target.value)}
                  placeholder="Ej: Supermercado Los Álamos"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 px-8 py-6 bg-slate-900/50 flex items-center justify-between">
            <div>
              {productoSeleccionado && cantidad ? (
                <p className="text-slate-300 font-medium">
                  <span className="text-white font-bold">{cantidad} unid.</span>
                  {' '}de{' '}
                  <span className="text-violet-300 font-bold">{productoSeleccionado.nombre}</span>
                </p>
              ) : (
                <p className="text-slate-600 text-sm">Selecciona producto y cantidad</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isPending || !productoId || !cantidad || Number(cantidad) <= 0}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-violet-900/30"
            >
              {isPending ? 'Registrando...' : 'Registrar lote'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Fecha de ingreso asignada automáticamente · Orden PEPS garantizado
        </p>
      </div>
    </div>
  );
}