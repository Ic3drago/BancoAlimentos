import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Script from 'next/script'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Logística | Banco de Alimentos Bolivia',
  description: 'Módulo de distribución, PEPS e impacto social',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userRol = cookies().get('session_user_rol')?.value || null;
  const userName = cookies().get('session_user_nombre')?.value || null;

  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#0a0f1a] text-slate-50 min-h-screen flex flex-col md:flex-row`}>
        <Sidebar userRol={userRol} userName={userName} />
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
        <Script 
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
