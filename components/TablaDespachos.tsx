import { Truck, CheckCircle2, History } from 'lucide-react';
import pool from '@/utils/db';
import { VistaSugerenciaDespacho } from '@/types/database';

export const revalidate = 0;

export default async function TablaDespachos({ query }: { query?: string }) {
  let sugerencias: VistaSugerenciaDespacho[] = [];
  let errorMsg = null;

  try {
    // Lógica PEPS/FIFO: Priorizar los que llevan más días en almacén
    let sql = `SELECT * FROM vista_sugerencia_despacho`;
    let params: any[] = [];

    if (query) {
      sql += ` WHERE nombre_producto ILIKE $1 OR categoria ILIKE $1`;
      params.push(`%${query}%`);
    }

    sql += ` ORDER BY dias_en_almacen DESC LIMIT 10`;

    const res = await pool.query(sql, params);
    sugerencias = res.rows;
  } catch (err: any) {
    errorMsg = err.message;
  }

  if (errorMsg) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-red-500 font-medium flex items-center gap-2">
          <Truck className="w-5 h-5"/> Error de Conexión: {errorMsg}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
      <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2.5 rounded-lg border border-emerald-500/30">
            <Truck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Despachos Sugeridos</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-500/20">
                Método PEPS Activo
              </span>
              <p className="text-sm text-slate-400">Priorizando inventario antiguo</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-widest font-semibold">
              <th className="p-5 w-16 text-center">Nº</th>
              <th className="p-5">Producto</th>
              <th className="p-5">Categoría</th>
              <th className="p-5">Ingreso</th>
              <th className="p-5">En Almacén</th>
              <th className="p-5">Stock Disp.</th>
              <th className="p-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sugerencias?.map((sug: VistaSugerenciaDespacho, index: number) => {
              const isUrgent = sug.dias_para_vencer <= 10;
              
              return (
                <tr key={sug.lote_id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-5 text-center">
                    <span className="text-slate-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/50">
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="text-slate-200 font-semibold">{sug.nombre_producto}</p>
                    {isUrgent && (
                      <p className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                        ¡Vence en {sug.dias_para_vencer} días!
                      </p>
                    )}
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
                      {sug.categoria}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="text-slate-300 text-sm">{new Date(sug.fecha_ingreso).toLocaleDateString()}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <History className="w-4 h-4 opacity-70" />
                      {sug.dias_en_almacen} días
                    </div>
                  </td>
                  <td className="p-5 text-slate-200 font-bold text-lg">
                    {sug.cantidad_actual}
                  </td>
                  <td className="p-5 text-right">
                    <button className="inline-flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm opacity-90 group-hover:opacity-100 ring-1 ring-emerald-500/50 hover:ring-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Despachar
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {(!sugerencias || sugerencias.length === 0) && (
              <tr>
                <td colSpan={6} className="p-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Truck className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-semibold text-slate-400 text-lg">Sin inventario</p>
                    <p className="text-sm mt-1">No hay productos disponibles para despachar en este momento.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
