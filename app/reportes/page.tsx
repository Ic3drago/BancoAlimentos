import { getReporteGeneral } from '@/app/actions/get-reportes';
import { 
  BarChart3, 
  Map as MapIcon, 
  History, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  Package, 
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRightLeft
} from 'lucide-react';
import MapaSeguimientoAdmin from '@/components/MapaSeguimientoAdmin';
import ExportExcelButton from '@/components/ExportExcelButton';

export const revalidate = 0;

export default async function ReportesPage() {
  const reportData = await getReporteGeneral();

  if (!reportData.success) {
    return <div className="p-10 text-white">Error cargando reportes.</div>;
  }

  const { entregas, peps, resumenInstituciones } = reportData;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-6 md:p-10 font-sans">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <BarChart3 className="w-3 h-3" /> Inteligencia de Datos
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Reportes
          </h1>
          <p className="text-slate-500 mt-2">Monitoreo de trazabilidad, sistema PEPS y distribución social.</p>
        </div>
        <div className="flex items-center gap-4">
           {entregas.length > 0 && (
             <ExportExcelButton data={entregas} filename={`reporte-general-${new Date().toISOString().split('T')[0]}.xlsx`} />
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Entregas</p>
            <p className="text-3xl font-black text-white mt-1">{entregas.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lotes en Stock</p>
            <p className="text-3xl font-black text-white mt-1">{peps.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Instituciones</p>
            <p className="text-3xl font-black text-white mt-1">{resumenInstituciones.length}</p>
          </div>
          <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-xl">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impacto Social</p>
            <p className="text-3xl font-black text-white mt-1">Alta</p>
          </div>
        </div>

        {/* Mapa de Entregas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-500" /> Cobertura de Entregas
              </h2>
            </div>
            <div className="h-[400px]">
              <MapaSeguimientoAdmin entregas={entregas.map((e: any) => ({
                ...e,
                placa: e.vehiculo_id,
                lat_destino: e.lat_destino,
                lng_destino: e.lng_destino
              }))} />
            </div>
          </div>

          {/* Historial Detallado */}
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" /> Historial de Movimientos (Entradas y Salidas)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <th className="pb-4">Producto</th>
                    <th className="pb-4">Destino</th>
                    <th className="pb-4">Fecha Salida</th>
                    <th className="pb-4">Cantidad</th>
                    <th className="pb-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entregas.map((entrega: any) => (
                    <tr key={entrega.despacho_id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-4">
                        <p className="text-sm font-bold text-white">{entrega.producto_entregado}</p>
                        <p className="text-[10px] text-slate-500">PEPS ID: {entrega.despacho_id.slice(0,8)}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-medium text-slate-300">{entrega.nombre_institucion}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{entrega.tipo_poblacion}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-slate-400">{new Date(entrega.fecha_entrega).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-600 font-medium">{new Date(entrega.fecha_entrega).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="py-4">
                        <span className="text-emerald-400 font-black">{entrega.cantidad_despachada}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">Entregado</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Prioridad PEPS */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Prioridad PEPS
              </h2>
              <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Crítico</span>
            </div>
            
            <div className="space-y-4">
              {peps.map((item: any, idx: number) => (
                <div key={item.lote_id} className="bg-[#1e293b]/30 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${idx < 3 ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-white text-sm">{item.nombre_producto}</p>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">{item.cantidad_disponible} disp.</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-black/20 p-2 rounded-lg">
                      <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Entrada</p>
                      <p className="text-[10px] text-slate-300 font-black">{new Date(item.fecha_ingreso).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg">
                      <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Vencimiento</p>
                      <p className={`text-[10px] font-black ${item.dias_para_vencer < 7 ? 'text-red-400' : 'text-amber-400'}`}>
                        {new Date(item.fecha_vencimiento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter">
                    <span className="text-slate-500">{item.dias_en_almacen} días en stock</span>
                    <span className={item.dias_para_vencer < 0 ? 'text-red-500' : 'text-amber-500'}>
                      {item.dias_para_vencer < 0 ? '¡VENCIDO!' : `${item.dias_para_vencer} días para vencer`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" /> Top Instituciones
            </h2>
            <div className="space-y-4">
              {resumenInstituciones.map((inst: any) => (
                <div key={inst.nombre_institucion} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-black text-slate-500">
                      {inst.total_entregas}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{inst.nombre_institucion}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{inst.total_productos} productos entregados</p>
                    </div>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
