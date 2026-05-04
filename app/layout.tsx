import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Logística | Banco de Alimentos Bolivia',
  description: 'Módulo de distribución, PEPS e impacto social',
}

import { cookies } from 'next/headers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userRol = cookies().get('session_user_rol')?.value || null;
  const userName = cookies().get('session_user_nombre')?.value || null;

  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex`}>
        <Sidebar userRol={userRol} userName={userName} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
