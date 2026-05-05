import pool from '@/utils/db';
import { History, CheckCircle, Calendar, Truck, ArrowLeft, MapPin } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const revalidate = 0;

export default async function HistorialPage() {
  const userId = cookies().get('session_user_id')?.value;
  
  let entregasPasadas: any[] = [];
  
  if (userId) {
    try {
      const res = await pool.query(`
        SELECT * FROM vista_impacto_social 
        WHERE estado_entrega = 'entregado'
        AND ruta_id IN (SELECT id FROM rutas WHERE conductor_id = $1)
        ORDER BY fecha_entrega DESC
        LIMIT 20
      `, [userId]);
      entregasPasadas = res.rows;
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
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-1">Registro de Actividad</p>
              <h1 className="text-2xl font-black text-white tracking-tight">Historial</h1>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <History className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 mt-4">
        {entregasPasadas.map((item) => (
          <div key={item.despacho_id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{item.nombre_institucion}</h3>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  <Calendar className="w-3 h-3" /> {new Date(item.fecha_entrega).toLocaleDateString()} · {new Date(item.fecha_entrega).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-emerald-500/70 font-bold">
                  {item.cantidad_despachada} {item.producto_entregado}
                </div>
              </div>
            </div>
          </div>
        ))}

        {entregasPasadas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center px-10">
            <History className="w-12 h-12 text-slate-800 mb-4" />
            <p className="text-slate-500 text-sm font-medium">Aún no tienes entregas completadas en este registro.</p>
          </div>
        )}
      </div>

      {/* Menú Inferior */}
      <div className="fixed bottom-6 inset-x-6 z-50">
        <div className="bg-[#111827]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl flex justify-around items-center">
          <Link href="/mis-entregas" className="flex flex-col items-center gap-1 text-slate-600">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">Entregas</span>
          </Link>
          <Link href="/mis-entregas/destinos" className="flex flex-col items-center gap-1 text-slate-600">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">Destinos</span>
          </Link>
          <Link href="/mis-entregas/historial" className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">Historial</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
