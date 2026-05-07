import pool from '@/utils/db';
import { MapPin, Truck, ArrowLeft, Navigation2, History } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import MapaSeguimientoAdmin from '@/components/MapaSeguimientoAdmin';
import DriverNav from '@/components/DriverNav';

export const revalidate = 0;

export default async function DestinosPage() {
  const userId = cookies().get('session_user_id')?.value;
  
  let misDespachos: any[] = [];
  
  if (userId) {
    try {
      // Primero buscamos si hay una ruta activa
      const rutaRes = await pool.query(`
        SELECT id FROM rutas WHERE conductor_id = $1 AND estado != 'completada' LIMIT 1
      `, [userId]);

      if (rutaRes.rows.length > 0) {
        const activeRutaId = rutaRes.rows[0].id;
        const res = await pool.query(`
          SELECT 
            v.despacho_id,
            v.nombre_institucion,
            v.lat_destino,
            v.lng_destino,
            v.nombre_conductor,
            v.vehiculo_id as placa,
            v.producto_entregado,
            v.cantidad_despachada,
            v.estado_entrega
          FROM vista_impacto_social v
          WHERE v.ruta_id = $1
        `, [activeRutaId]);
        misDespachos = res.rows;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] pb-32">
      {/* Header */}
      <div className="bg-[#0a0f1a] p-6 pt-12 border-b border-white/5 sticky top-0 z-30 backdrop-blur-xl bg-opacity-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mis-entregas" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-1">Visualización de Ruta</p>
              <h1 className="text-2xl font-black text-white tracking-tight">Mapa</h1>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <MapPin className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-4">
        {/* Mapa General (Usamos el componente admin que soporta múltiples puntos) */}
        <div className="rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl h-[400px]">
          <MapaSeguimientoAdmin entregas={misDespachos} />
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Paradas de hoy</h2>
          {misDespachos.map((item, idx) => (
            <div key={item.despacho_id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-emerald-500">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.nombre_institucion}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{item.producto_entregado}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.estado_entrega === 'entregado' && (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">Entregado</span>
                )}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat_destino},${item.lng_destino}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20"
                >
                  <Navigation2 className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          ))}

          {misDespachos.length === 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-10 text-center">
              <Truck className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase">No hay ruta activa</p>
              <p className="text-slate-600 text-[10px] mt-1">Cuando tengas una ruta asignada, aparecerá aquí.</p>
            </div>
          )}
        </div>
      </div>

      {/* Menú Inferior */}
      <DriverNav />
    </div>
  );
}
