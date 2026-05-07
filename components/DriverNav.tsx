"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, MapPin, History } from 'lucide-react';

export default function DriverNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Ruta', path: '/mis-entregas', icon: Truck },
    { name: 'Mapa', path: '/mis-entregas/destinos', icon: MapPin },
    { name: 'Historial', path: '/mis-entregas/historial', icon: History },
  ];

  return (
    <div className="fixed bottom-6 inset-x-6 z-50">
      <div className="bg-[#111827]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-transparent'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
