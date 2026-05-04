import pool from '@/utils/db';
import { MapPin, PackageCheck, Truck } from 'lucide-react';
import { cookies } from 'next/headers';
import BotonEntrega from '@/components/BotonEntrega';
import MapaRutaCliente from '@/components/MapaRutaCliente';

export const revalidate = 0;

export default async function MisEntregasPage() {
  const userId = cookies().get('session_user_id')?.value;
  
  let misDespachos: any[] = [];
  
  if (userId) {
    try {
      const res = await pool.query(`
        SELECT * FROM vista_impacto_social 
        WHERE estado_entrega = 'en_transito'
        AND ruta_id IN (SELECT id FROM rutas WHERE conductor_id = $1)
        ORDER BY fecha_despacho ASC
      `, [userId]);
      misDespachos = res.rows;
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Truck className="w-8 h-8 text-emerald-400" /> Mis Rutas Activas
        </h1>
        <p className="text-slate-400 mt-2">Marca los pedidos cuando los entregues a los beneficiarios.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {misDespachos.map((despacho, index) => (
          <div key={despacho.despacho_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Pendiente
                </span>
                <span className="bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-md text-sm border border-slate-700">
                  Envío Nº {index + 1}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> {despacho.nombre_institucion}
              </h3>
              <p className="text-slate-400 text-sm ml-7 mb-6">Población: {despacho.cantidad_personas} personas ({despacho.tipo_poblacion})</p>

              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800">
                <MapaRutaCliente 
                  conductorNombre={despacho.nombre_conductor || 'Conductor'} 
                  destino={despacho.nombre_institucion} 
                  latDestino={despacho.lat_destino || -17.3895} 
                  lngDestino={despacho.lng_destino || -66.1568}
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <p className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                  <PackageCheck className="w-4 h-4 text-slate-400" /> Carga a Entregar
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{despacho.producto_entregado}</span>
                  <span className="text-white font-bold text-lg">{despacho.cantidad_despachada} unid.</span>
                </div>
              </div>
            </div>

            <BotonEntrega despachoId={despacho.despacho_id} />
          </div>
        ))}

        {misDespachos.length === 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <PackageCheck className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400">¡Todo entregado!</h3>
            <p className="text-slate-400 mt-2">No tienes despachos pendientes en este momento. ¡Buen trabajo!</p>
          </div>
        )}
      </div>
    </div>
  );
}
