import pool from '@/utils/db';
import { MapPin, Truck, Navigation2, CheckCircle2, LogOut, History } from 'lucide-react';
import { cookies } from 'next/headers';
import { logout } from '@/app/actions/auth';
import BotonEntrega from '@/components/BotonEntrega';
import MapaRutaCliente from '@/components/MapaRutaCliente';
import SeguimientoGPS from '@/components/SeguimientoGPS';
import DriverNav from '@/components/DriverNav';

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
    <div className="min-h-screen bg-[#070b14] pb-32">
      {rutaId && <SeguimientoGPS rutaId={rutaId} />}
      
      {/* Header Compacto con Cerrar Sesión */}
      <div className="bg-[#0a0f1a]/80 backdrop-blur-xl p-4 pt-8 border-b border-white/5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Truck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Mis Entregas</h1>
            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">En Ruta • {misDespachos.length} paradas</p>
          </div>
        </div>
        
        <form action={logout}>
          <button type="submit" className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 active:scale-90 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="p-4 space-y-6">
        {/* Resumen de Jornada */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] p-6 shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Truck className="w-32 h-32 rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-emerald-100 font-black uppercase tracking-[0.2em] mb-1">Estado de Jornada</p>
            <h2 className="text-2xl font-black text-white leading-tight">Tienes {misDespachos.length} entregas<br/>pendientes hoy</h2>
            <div className="mt-6 flex gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[8px] text-emerald-100 font-bold uppercase">Carga Total</p>
                <p className="text-sm font-black text-white">{misDespachos.reduce((acc, curr) => acc + parseFloat(curr.cantidad_despachada), 0)} u.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[8px] text-emerald-100 font-bold uppercase">Vehículo</p>
                <p className="text-sm font-black text-white">{misDespachos[0]?.vehiculo_id || '---'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-20">
          <h2 className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Hoja de Ruta Detallada</h2>
          
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
            <div className="py-20 text-center bg-[#111827] rounded-3xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ruta Finalizada</p>
            </div>
          )}
        </div>
      </div>

      <DriverNav />
    </div>
  );
}
