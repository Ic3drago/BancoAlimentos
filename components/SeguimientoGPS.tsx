"use client";

import { useEffect, useState } from 'react';
import { actualizarUbicacionRuta } from '@/app/actions/update-ubicacion';
import { LocateFixed, LocateOff, Loader2 } from 'lucide-react';

export default function SeguimientoGPS({ rutaId }: { rutaId: string }) {
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!rutaId) return;

    if (!("geolocation" in navigator)) {
      setError("El GPS no está disponible en este navegador.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setTracking(true);
        setError(null);

        // Enviar al servidor
        actualizarUbicacionRuta(rutaId, latitude, longitude);
      },
      (err) => {
        console.error("GPS Error:", err);
        setError("Permiso de ubicación denegado o señal débil.");
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [rutaId]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
        tracking ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
      }`}>
        {tracking ? (
          <>
            <LocateFixed className="w-5 h-5 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-widest">
              Seguimiento Activo
              <span className="block text-[8px] opacity-70 font-normal">Enviando coordenadas reales</span>
            </div>
          </>
        ) : error ? (
          <>
            <LocateOff className="w-5 h-5" />
            <div className="text-[10px] font-black uppercase tracking-widest">
              GPS Desactivado
              <span className="block text-[8px] opacity-70 font-normal">{error}</span>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest">Iniciando GPS...</div>
          </>
        )}
      </div>
    </div>
  );
}
