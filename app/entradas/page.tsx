import { PackagePlus, Save } from 'lucide-react';

export const metadata = {
  title: 'Entradas | Banco de Alimentos Bolivia',
};

export default function EntradasPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <PackagePlus className="w-8 h-8 text-emerald-400" /> Registro de Donaciones
        </h1>
        <p className="text-slate-400 mt-2">Ingreso de nuevos lotes al almacén bajo política PEPS.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Producto o Alimento</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="">Selecciona un producto...</option>
                <option value="1">Arroz Grano Largo 50kg (Abarrotes)</option>
                <option value="2">Aceite Vegetal 5L (Abarrotes)</option>
                <option value="3">Manzanas (Frutas)</option>
                <option value="4">Atún en Lata (Conservas)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Cantidad (Unidades/Kg)</label>
              <input type="number" min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Ej: 100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Fecha de Ingreso (PEPS)</label>
              <input type="date" disabled className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-500 cursor-not-allowed opacity-70" title="Se asigna automáticamente hoy" />
              <p className="text-xs text-emerald-500">Se asignará automáticamente (HOY) para el cálculo PEPS.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Fecha de Vencimiento (Seguridad)</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20">
              <Save className="w-5 h-5" /> Registrar en Almacén
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
