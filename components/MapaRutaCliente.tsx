"use client";

import { useEffect, useRef } from 'react';

type Props = {
  conductorNombre: string;
  destino: string;
  latDestino: number;
  lngDestino: number;
};

function simularPosicionConductor(latDest: number, lngDest: number) {
  const offset = 0.015;
  return {
    lat: latDest + offset,
    lng: lngDest - offset,
  };
}

export default function MapaRutaCliente({ conductorNombre, destino, latDestino, lngDestino }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const latNum = Number(latDestino);
  const lngNum = Number(lngDestino);
  const posActual = simularPosicionConductor(latNum, lngNum);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    const initGoogleMap = () => {
      const google = (window as any).google;
      if (!google || mapInstanceRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: (posActual.lat + latNum) / 2, lng: (posActual.lng + lngNum) / 2 },
        zoom: 14,
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
        ],
      });

      // Marcador Conductor
      new google.maps.Marker({
        position: { lat: posActual.lat, lng: posActual.lng },
        map,
        title: conductorNombre,
        icon: {
          path: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z",
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          scale: 1.5,
        }
      });

      // Marcador Destino
      new google.maps.Marker({
        position: { lat: latNum, lng: lngNum },
        map,
        title: destino,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: "#06b6d4",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          scale: 6,
        }
      });

      // Línea de ruta
      new google.maps.Polyline({
        path: [
          { lat: posActual.lat, lng: posActual.lng },
          { lat: latNum, lng: lngNum },
        ],
        geodesic: true,
        strokeColor: "#f97316",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        icons: [{
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 2 },
          offset: "0",
          repeat: "10px",
        }],
      }).setMap(map);

      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: posActual.lat, lng: posActual.lng });
      bounds.extend({ lat: latNum, lng: lngNum });
      map.fitBounds(bounds);

      mapInstanceRef.current = map;
    };

    if ((window as any).google && (window as any).google.maps) {
      initGoogleMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      (window as any).initMap = initGoogleMap;
      document.head.appendChild(script);
    }
  }, [conductorNombre, destino, latDestino, lngDestino]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-48 bg-slate-950 rounded-2xl overflow-hidden"
        style={{ zIndex: 0 }}
      />
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 z-10 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
        <span className="text-white text-[10px] font-bold uppercase tracking-tight">{conductorNombre}</span>
        <span className="text-slate-500 text-[10px]">→ {destino}</span>
      </div>
    </div>
  );
}
