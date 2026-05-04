import { Suspense } from 'react';
import AlertasCaducidad from '@/components/AlertasCaducidad';
import TablaDespachos from '@/components/TablaDespachos';
import BuscadorInventario from '@/components/BuscadorInventario';

export const metadata = {
  title: 'Logística | Banco de Alimentos Bolivia',
};

export default function DistribucionDashboard({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || '';

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans selection:bg-emerald-500/30 text-slate-50">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Corporativo */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Distribución y Logística
              </h1>
            </div>
            <p className="text-slate-400 text-lg ml-5">
              Panel de Control Central
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <BuscadorInventario />
            <div className="flex flex-col items-end mt-2">
              <h2 className="text-xl font-bold text-slate-300">Banco de Alimentos de Bolivia</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sistema Online
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Alertas (Ocupa 4 columnas en desktop ancho) */}
          <div className="xl:col-span-4 h-full">
            <Suspense fallback={
              <div className="h-[500px] bg-slate-900 rounded-xl animate-pulse border border-slate-800 p-6 flex flex-col gap-4">
                <div className="h-8 bg-slate-800 rounded w-2/3"></div>
                <div className="flex-1 bg-slate-800/50 rounded"></div>
              </div>
            }>
              <AlertasCaducidad />
            </Suspense>
          </div>

          {/* Columna Derecha: Tabla Principal (Ocupa 8 columnas en desktop ancho) */}
          <div className="xl:col-span-8 h-full">
            <Suspense fallback={
              <div className="h-[500px] bg-slate-900 rounded-xl animate-pulse border border-slate-800 p-6 flex flex-col gap-4">
                <div className="h-8 bg-slate-800 rounded w-1/3"></div>
                <div className="flex-1 bg-slate-800/50 rounded"></div>
              </div>
            }>
              <TablaDespachos query={query} />
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  );
}
