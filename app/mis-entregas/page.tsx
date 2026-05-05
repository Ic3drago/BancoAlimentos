import pool from '@/utils/db';
import { MapPin, PackageCheck, Truck, Navigation2, CheckCircle2, ChevronRight, History, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import BotonEntrega from '@/components/BotonEntrega';
import MapaRutaCliente from '@/components/MapaRutaCliente';
import SeguimientoGPS from '@/components/SeguimientoGPS';

export const revalidate = 0;

export default async function MisEntregasPage() {
  const userId = cookies().get('session_user_id')?.value;
  
  let misDespachos: any[] = [];
  let rutaId: string | null = null;
  let conductorNombre: string = 'Conductor';
  
  if (userId) {
    try {
      const rutaRes = await pool.query(`
        SELECT r.id, u.nombre 
        FROM rutas r 
        JOIN usuarios u ON r.conductor_id = u.id 
        WHERE r.conductor_id = $1 AND r.estado != 'completada' 
        LIMIT 1
      `, [userId]);
      
      if (rutaRes.rows.length > 0) {
        rutaId = rutaRes.rows[0].id;
        conductorNombre = rutaRes.rows[0].nombre;
      }

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
    <div className="min-h-screen bg-[#070b14] pb-24">
      {rutaId && <SeguimientoGPS rutaId={rutaId} />}
      
      {/* Header Compacto con Cerrar Sesión */}
      <div className="bg-[#0a0f1a]/80 backdrop-blur-xl p-4 pt-8 border-b border-white/5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Truck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Mis Entregas</h1>
            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">En Ruta • {misDespachos.length} stops</p>
          </div>
        </div>
        
        <form action={logout}>
          <button type="submit" className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 active:scale-90 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="p-3 space-y-4 mt-2">
        {misDespachos.map((despacho, index) => (
          <div key={despacho.despacho_id} className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="h-32 relative bg-slate-900 border-b border-white/5">
              <MapaRutaCliente 
                conductorNombre={conductorNombre} 
                destino={despacho.nombre_institucion} 
                latDestino={despacho.lat_destino || -17.3895} 
                lngDestino={despacho.lng_destino || -66.1568}
              />
              <div className="absolute top-3 left-3 bg-emerald-500 text-[#070b14] px-2 py-0.5 rounded-lg font-black text-[10px]">
                {index + 1}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="max-w-[75%]">
                  <h3 className="text-base font-bold text-white truncate">{despacho.nombre_institucion}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {despacho.tipo_poblacion}
                  </p>
                </div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${despacho.lat_destino},${despacho.lng_destino}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 p-2.5 rounded-xl shadow-lg active:scale-90 transition-all"
                >
                  <Navigation2 className="w-5 h-5 fill-[#070b14] text-[#070b14]" />
                </a>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800 mb-4 flex justify-between items-center">
                <div className="overflow-hidden">
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Carga</p>
                  <p className="text-xs font-bold text-white truncate">{despacho.producto_entregado}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Cant.</p>
                  <p className="text-base font-black text-emerald-400">{despacho.cantidad_despachada}</p>
                </div>
              </div>

              <BotonEntrega despachoId={despacho.despacho_id} />
            </div>
          </div>
        ))}

        {misDespachos.length === 0 && (
          <div className="py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ruta Finalizada</p>
          </div>
        )}
      </div>

      {/* Menú Inferior Compacto */}
      <div className="fixed bottom-4 inset-x-4 z-50">
        <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl flex justify-around items-center">
          <Link href="/mis-entregas" className="flex flex-col items-center gap-0.5 text-emerald-400 px-4 py-1">
            <Truck className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Ruta</span>
          </Link>
          <Link href="/mis-entregas/destinos" className="flex flex-col items-center gap-0.5 text-slate-500 px-4 py-1">
            <MapPin className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Mapa</span>
          </Link>
          <Link href="/mis-entregas/historial" className="flex flex-col items-center gap-0.5 text-slate-500 px-4 py-1">
            <History className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Historial</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
