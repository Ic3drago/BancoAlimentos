import pool from '@/utils/db';
import { Truck, MapPin, PackageCheck, Users } from 'lucide-react';
import { VistaImpactoSocial } from '@/types/database';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0;

export default async function SeguimientoPage() {
  let despachosEnRuta: any[] = [];
  let poblacionAlcanzada = 0;
  
  try {
    const res = await pool.query(`
      SELECT * FROM vista_impacto_social 
      WHERE estado_entrega = 'en_transito'
      ORDER BY fecha_despacho ASC
    `);
    despachosEnRuta = res.rows;

    const resStats = await pool.query(`
      SELECT SUM(cantidad_personas) as total 
      FROM vista_impacto_social 
      WHERE estado_entrega = 'entregado'
    `);
    poblacionAlcanzada = resStats.rows[0]?.total || 0;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="p-8">
      <AutoRefresh intervalMs={3000} />
      
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-400" /> Seguimiento Logístico
          </h1>
          <p className="text-slate-400 mt-2">Trazabilidad en tiempo real de vehículos en ruta hacia los beneficiarios.</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Población Alimentada</p>
            <p className="text-3xl font-black text-white">{poblacionAlcanzada}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {despachosEnRuta.map((despacho, index) => (
          <div key={despacho.despacho_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
                  <Truck className="w-3 h-3" /> En Tránsito
                </span>
                <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-md text-sm border border-slate-700">
                  Envío Nº {index + 1}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> {despacho.nombre_institucion}
              </h3>
              <p className="text-slate-400 text-sm ml-7 mb-6">Población: {despacho.cantidad_personas} personas ({despacho.tipo_poblacion})</p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
                <div>
                  <p className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-slate-400" /> Vehículo y Conductor
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{despacho.vehiculo_id}</span>
                    <span className="text-white font-bold">{despacho.nombre_conductor || 'No asignado'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-400" /> Auditoría
                  </p>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-500">Despacho cargado por:</span>
                    <span className="text-emerald-400 font-semibold">{despacho.cargado_por || 'Sin registro'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Entregado por:</span>
                    <span className="text-orange-400 font-semibold">{despacho.nombre_conductor || 'No asignado'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                    <PackageCheck className="w-4 h-4 text-slate-400" /> Carga Actual
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{despacho.producto_entregado}</span>
                    <span className="text-white font-bold">{despacho.cantidad_despachada} unid.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-950 text-slate-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-slate-800 border-dashed text-sm">
              Esperando confirmación del conductor...
            </div>
          </div>
        ))}

        {despachosEnRuta.length === 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Truck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300">Todos los vehículos en base</h3>
            <p className="text-slate-500 mt-2">No hay despachos en tránsito actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
