import pool from '@/utils/db';
import { History, CheckCircle, Calendar, Truck, ArrowLeft, MapPin, Package, ArrowRightLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ExportPDFButton from '@/components/ExportPDFButton';
import DriverNav from '@/components/DriverNav';

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
          <div className="flex flex-col items-end gap-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <History className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
        {entregasPasadas.length > 0 && (
          <div className="mt-4 flex justify-end">
            <ExportPDFButton 
              data={entregasPasadas} 
              filename={`historial-entregas-${new Date().toISOString().split('T')[0]}.pdf`}
              title={`Historial de Entregas - Conductor ID: ${userId}`}
            />
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 mt-4">
        {entregasPasadas.map((item) => (
          <div key={item.despacho_id} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3">
               <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">Completado</span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trazabilidad de Entrega</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Origen</p>
                    <p className="text-[10px] text-white font-bold">Banco de Alimentos</p>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-slate-700" />
                  <div className="flex-1 bg-slate-900/50 p-3 rounded-xl border border-white/5 text-right">
                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Destino Final</p>
                    <p className="text-[10px] text-white font-bold truncate">{item.nombre_institucion}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-xs font-black">{item.cantidad_despachada} {item.producto_entregado}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.fecha_entrega).toLocaleDateString()}
                  </div>
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

      <DriverNav />
    </div>
  );
}
