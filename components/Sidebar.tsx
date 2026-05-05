"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PackageOpen, Truck, PackagePlus, LogOut, Map } from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface SidebarProps {
  userRol: string | null;
  userName: string | null;
}

export default function Sidebar({ userRol, userName }: SidebarProps) {
  const pathname = usePathname();

  if (pathname === '/login' || !userRol) {
    return null;
  }

  const menu = userRol === 'admin' 
    ? [
        { name: 'Panel de Control', icon: PackageOpen, path: '/distribucion' },
        { name: 'Registrar Entradas', icon: PackagePlus, path: '/entradas' },
        { name: 'Seguimiento', icon: Truck, path: '/seguimiento' },
      ]
    : [
        { name: 'Mis Entregas', icon: Map, path: '/mis-entregas' },
      ];

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-black text-emerald-400 tracking-tight">Banco de Alimentos</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-widest uppercase">Bolivia</p>
      </div>
      
      <div className="p-4 bg-slate-950/50 border-b border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Usuario</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-200">{userName || 'Invitado'}</p>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{userRol}</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
