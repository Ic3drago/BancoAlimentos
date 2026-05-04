"use client";
import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export default function BuscadorInventario() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [term, pathname, router, searchParams]);

  return (
    <div className="relative group w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className={`w-5 h-5 transition-colors ${isPending ? 'text-emerald-500 animate-pulse' : 'text-slate-500 group-focus-within:text-emerald-400'}`} />
      </div>
      <input 
        type="text" 
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="block w-full p-3.5 pl-11 text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-inner" 
        placeholder="Buscar productos en almacén (Ej: Fideo, Arroz)..." 
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 bg-slate-800 px-2 py-1 rounded">Ctrl+K</span>
      </div>
    </div>
  );
}
