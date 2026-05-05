"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2, Map as MapIcon, RefreshCcw } from 'lucide-react';

type Props = {
  conductorNombre: string;
  destino: string;
  latDestino: number;
  lngDestino: number;
};

export default function MapaRutaCliente({ conductorNombre, destino, latDestino, lngDestino }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'timeout'>('loading');

  useEffect(() => {
    // Timeout de 7 segundos para el cargando
    const timeout = setTimeout(() => {
      if (status === 'loading') setStatus('timeout');
    }, 7000);

    const initMap = () => {
      const google = (window as any).google;
      if (!google || !google.maps || !mapRef.current) return;

      const latNum = parseFloat(latDestino as any);
      const lngNum = parseFloat(lngDestino as any);

      if (isNaN(latNum) || isNaN(lngNum)) {
        setStatus('error');
        return;
      }

      try {
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: latNum, lng: lngNum },
            zoom: 15,
            disableDefaultUI: true,
            gestureHandling: 'none',
            styles: [
              { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] }
            ]
          });
        }

        const destination = new google.maps.LatLng(latNum, lngNum);
        new google.maps.Marker({ 
          position: destination, 
          map: mapInstanceRef.current, 
          icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 4, fillColor: "#10b981", fillOpacity: 1, strokeWeight: 1, strokeColor: "#ffffff" }
        });

        setStatus('ready');
        clearTimeout(timeout);

        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const origin = new google.maps.LatLng(userLat, userLng);

          const ds = new google.maps.DirectionsService();
          const dr = new google.maps.DirectionsRenderer({ map: mapInstanceRef.current, suppressMarkers: true, polylineOptions: { strokeColor: "#10b981", strokeWeight: 4 } });

          ds.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (res: any, status: any) => {
            if (status === "OK") {
              dr.setDirections(res);
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(origin);
              bounds.extend(destination);
              mapInstanceRef.current.fitBounds(bounds);
            }
          });
        }, (err) => console.warn("GPS OFF"));
      } catch (e) {
        console.error("Map Error", e);
        setStatus('error');
      }
    };

    const checkGoogle = setInterval(() => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        clearInterval(checkGoogle);
      }
    }, 500);

    return () => {
      clearInterval(checkGoogle);
      clearTimeout(timeout);
    };
  }, [latDestino, lngDestino]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="w-full h-full relative bg-[#0f172a] flex items-center justify-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}
      
      {status === 'timeout' && (
        <button onClick={handleRetry} className="flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors">
          <RefreshCcw className="w-5 h-5" />
          <span className="text-[7px] font-black uppercase">Reintentar Mapa</span>
        </button>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-2 text-red-500/50">
          <MapIcon className="w-5 h-5" />
          <span className="text-[7px] font-black uppercase tracking-widest">Error GPS</span>
        </div>
      )}

      <div ref={mapRef} className={`absolute inset-0 w-full h-full ${status === 'ready' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`} />
    </div>
  );
}
