"use client";

import { useEffect, useRef } from 'react';

type Entrega = {
  despacho_id: string;
  nombre_institucion: string;
  lat_destino: number;
  lng_destino: number;
  nombre_conductor: string;
  placa: string;
  producto_entregado: string;
  latitud_actual?: number;
  longitud_actual?: number;
};

export default function MapaSeguimientoAdmin({ entregas }: { entregas: Entrega[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const renderersRef = useRef<any[]>([]);

  useEffect(() => {
    const initMap = () => {
      const google = (window as any).google;
      if (!google || !google.maps || !mapRef.current) return;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: -17.3895, lng: -66.1568 },
          zoom: 12,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] }
          ]
        });
      }

      // Limpiar anteriores
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      renderersRef.current.forEach(r => r.setMap(null));
      renderersRef.current = [];

      const bounds = new google.maps.LatLngBounds();
      let hasPoints = false;

      entregas.forEach(entrega => {
        const latDest = parseFloat(entrega.lat_destino as any);
        const lngDest = parseFloat(entrega.lng_destino as any);
        const latAct = parseFloat((entrega.latitud_actual || latDest + 0.005) as any);
        const lngAct = parseFloat((entrega.longitud_actual || lngDest - 0.005) as any);

        if (isNaN(latDest) || isNaN(lngDest) || latDest === 0) return;

        const posAct = new google.maps.LatLng(latAct, lngAct);
        const posDest = new google.maps.LatLng(latDest, lngDest);

        // Marcadores
        const m1 = new google.maps.Marker({ position: posAct, map: mapInstanceRef.current, title: `Conductor: ${entrega.nombre_conductor}` });
        const m2 = new google.maps.Marker({ position: posDest, map: mapInstanceRef.current, label: "D" });
        markersRef.current.push(m1, m2);

        // Ruta
        const ds = new google.maps.DirectionsService();
        const dr = new google.maps.DirectionsRenderer({ map: mapInstanceRef.current, suppressMarkers: true });
        renderersRef.current.push(dr);

        ds.route({ origin: posAct, destination: posDest, travelMode: google.maps.TravelMode.DRIVING }, (res: any, status: any) => {
          if (status === "OK") dr.setDirections(res);
        });

        bounds.extend(posAct);
        bounds.extend(posDest);
        hasPoints = true;
      });

      if (hasPoints && entregas.length > 0) {
        mapInstanceRef.current.fitBounds(bounds);
      }
    };

    // Intentar inicializar (con reintentos si el script global aún no carga)
    const timer = setInterval(() => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [entregas]);

  return (
    <div ref={mapRef} className="w-full h-[600px] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800" />
  );
}
