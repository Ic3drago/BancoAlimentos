import { getEntregasActivas } from '@/app/actions/get-seguimiento';
import MapaSeguimientoAdmin from '@/components/MapaSeguimientoAdmin';
import { Truck, Map as MapIcon, Activity } from 'lucide-react';

export const revalidate = 0; // Datos siempre frescos

export default async function SeguimientoPage() {
  const entregas = await getEntregasActivas();

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4">
            <Activity className="w-10 h-10 text-orange-500" />
            Centro de Control Logístico
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Seguimiento satelital en tiempo real de la flota de distribución.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Vehículos en Ruta</p>
            <p className="text-2xl font-black text-orange-500">{entregas.length}</p>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Panel lateral: Lista de conductores */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapIcon className="w-4 h-4" /> Conductores Activos
          </h2>
          
          {entregas.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-500 text-sm italic">No hay entregas activas en este momento.</p>
            </div>
          )}

          {entregas.map((entrega) => (
            <div 
              key={entrega.despacho_id} 
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-orange-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
                <span className="text-xs text-slate-500 font-mono">{entrega.placa}</span>
              </div>
              <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{entrega.nombre_conductor}</p>
              <p className="text-xs text-slate-500 mt-1">Hacia: <span className="text-slate-300">{entrega.nombre_institucion}</span></p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">CARGA</span>
                <span className="text-[10px] text-white font-bold">{entrega.cantidad_despachada} unid.</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mapa central */}
        <div className="lg:col-span-3">
          <MapaSeguimientoAdmin entregas={entregas} />
        </div>
      </div>
    </div>
  );
}
