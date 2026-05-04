import { AlertOctagon, Clock } from 'lucide-react';
import pool from '@/utils/db'; 
import { VistaSugerenciaDespacho } from '@/types/database';

export const revalidate = 0; 

export default async function AlertasCaducidad() {
  let lotes: VistaSugerenciaDespacho[] = [];
  let errorMsg = null;

  try {
    // Alertas por FEFO (Seguridad alimentaria)
    const res = await pool.query(`
      SELECT * FROM vista_sugerencia_despacho 
      WHERE dias_para_vencer <= 10 
      ORDER BY dias_para_vencer ASC 
      LIMIT 6
    `);
    lotes = res.rows;
  } catch (err: any) {
    errorMsg = err.message;
  }

  if (errorMsg) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-red-500 font-medium">Error de conexión: {errorMsg}</p>
      </div>
    );
  }

  if (!lotes || lotes.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 h-full min-h-[300px]">
        <AlertOctagon className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-semibold text-slate-300">Inventario Sano</p>
        <p className="text-sm mt-1 text-center">No hay productos próximos a caducar en los siguientes 10 días.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-red-900/40 rounded-xl p-6 shadow-2xl h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          <AlertOctagon className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Riesgo de Caducidad</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control de mermas</p>
        </div>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {lotes.map((lote: VistaSugerenciaDespacho) => {
          const isExtremeRisk = lote.dias_para_vencer <= 3;
          return (
            <div 
              key={lote.lote_id} 
              className={`flex items-center justify-between p-4 bg-slate-950/50 border rounded-lg transition-all ${
                isExtremeRisk ? 'border-red-500/40 hover:border-red-400/80 bg-red-950/10' : 'border-orange-500/20 hover:border-orange-500/50'
              }`}
            >
              <div>
                <p className="font-bold text-slate-200">{lote.nombre_producto}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Stock: {lote.cantidad_actual}</span>
                  <span className="text-xs text-slate-500 font-mono">#{lote.lote_id.split('-')[0]}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`flex items-center gap-1.5 text-sm font-extrabold ${isExtremeRisk ? 'text-red-500' : 'text-orange-400'}`}>
                  <Clock className="w-4 h-4" />
                  {lote.dias_para_vencer} días
                </span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase font-semibold tracking-wider">
                  Vence {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
