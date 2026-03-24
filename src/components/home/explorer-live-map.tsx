'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface ExplorerLiveMapProps {
  center: { lat: number; lon: number };
  hasPreciseLocation: boolean;
}

const createUserMarker = () =>
  L.divIcon({
    className: 'explorer-user-marker',
    html: `
      <div style="position:relative;width:34px;height:46px;">
        <div style="
          position:absolute;
          left:50%;
          top:8px;
          width:52px;
          height:52px;
          transform:translateX(-50%);
          border-radius:9999px;
          background:rgba(255,136,0,0.16);
          animation: explorerPulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;
          left:50%;
          top:4px;
          width:34px;
          height:34px;
          transform:translateX(-50%);
          border-radius:9999px;
          background:radial-gradient(circle at 30% 30%, #FFCC00 0%, #FF8800 58%, #C85E00 100%);
          border:4px solid #FFFFFF;
          box-shadow:
            0 16px 28px -14px rgba(0,51,102,0.85),
            0 6px 12px rgba(255,136,0,0.34),
            inset 0 2px 4px rgba(255,255,255,0.45);
        "></div>
        <div style="
          position:absolute;
          left:50%;
          top:32px;
          width:12px;
          height:12px;
          transform:translateX(-50%) rotate(45deg);
          background:#FF8800;
          border-right:3px solid #FFFFFF;
          border-bottom:3px solid #FFFFFF;
          box-shadow:0 10px 18px -10px rgba(0,51,102,0.8);
        "></div>
        <div style="
          position:absolute;
          left:50%;
          top:17px;
          width:8px;
          height:8px;
          transform:translate(-50%,-50%);
          border-radius:9999px;
          background:#003366;
          box-shadow:0 0 0 2px rgba(255,255,255,0.22);
        "></div>
        <div style="
          position:absolute;
          left:50%;
          bottom:0;
          width:22px;
          height:8px;
          transform:translateX(-50%);
          border-radius:9999px;
          background:rgba(0,51,102,0.24);
          filter:blur(2px);
        "></div>
      </div>
      <style>
        @keyframes explorerPulse {
          0% { transform: translateX(-50%) scale(0.9); opacity: 0.55; }
          70% { transform: translateX(-50%) scale(1.55); opacity: 0; }
          100% { transform: translateX(-50%) scale(1.55); opacity: 0; }
        }
      </style>
    `,
    iconSize: [34, 46],
    iconAnchor: [17, 40],
  });

export function ExplorerLiveMap({ center, hasPreciseLocation }: ExplorerLiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const innerCircleRef = useRef<L.Circle | null>(null);
  const outerCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lon],
      zoom: hasPreciseLocation ? 16 : 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(map);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.78,
      }
    ).addTo(map);

    const innerCircle = L.circle([center.lat, center.lon], {
      radius: hasPreciseLocation ? 28 : 120,
      color: '#FF8800',
      weight: 2,
      opacity: 0.95,
      fillColor: '#FFCC00',
      fillOpacity: 0.1,
    }).addTo(map);

    const outerCircle = L.circle([center.lat, center.lon], {
      radius: hasPreciseLocation ? 90 : 250,
      color: '#003366',
      weight: 1,
      opacity: 0.22,
      fillColor: '#003366',
      fillOpacity: 0.05,
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      opacity: 0.01,
    }).addTo(map);

    const marker = L.marker([center.lat, center.lon], {
      icon: createUserMarker(),
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;
    innerCircleRef.current = innerCircle;
    outerCircleRef.current = outerCircle;

    setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      innerCircleRef.current = null;
      outerCircleRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !innerCircleRef.current || !outerCircleRef.current) return;

    const nextLatLng: L.LatLngExpression = [center.lat, center.lon];
    markerRef.current.setLatLng(nextLatLng);
    innerCircleRef.current.setLatLng(nextLatLng);
    innerCircleRef.current.setRadius(hasPreciseLocation ? 28 : 120);
    outerCircleRef.current.setLatLng(nextLatLng);
    outerCircleRef.current.setRadius(hasPreciseLocation ? 90 : 250);
    mapRef.current.setView(nextLatLng, hasPreciseLocation ? 16 : 13, {
      animate: true,
      duration: 0.8,
    });
  }, [center.lat, center.lon, hasPreciseLocation]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,51,102,0.22)_0%,rgba(0,51,102,0.06)_28%,rgba(0,51,102,0.12)_100%)]" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/30 bg-[#003366]/82 px-3 py-2 text-white shadow-[0_16px_40px_-20px_rgba(0,51,102,0.95)] backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFCC00]">Ya Biso Map</p>
        <p className="mt-1 text-xs font-medium">Position GPS en direct</p>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-white/30 bg-white/92 px-3 py-2 text-right text-[#003366] shadow-[0_16px_40px_-20px_rgba(0,51,102,0.45)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF8800]">Mode</p>
        <p className="mt-1 text-xs font-semibold">{hasPreciseLocation ? 'Live precise' : 'Recentre RDC'}</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(0,51,102,0.2)_100%)]" />
    </div>
  );
}
