'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface NavigationDestination {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
}

interface NavigationMapProps {
  userLocation: { lat: number; lng: number } | null;
  destination: NavigationDestination;
  routeCoordinates?: [number, number][];
  isNavigating: boolean;
  accentColor?: string;
}

export default function NavigationMap({
  userLocation,
  destination,
  routeCoordinates,
  isNavigating,
  accentColor = '#FF8800',
}: NavigationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Icône utilisateur (personne)
  const createUserIcon = () => L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="position: absolute; width: 60px; height: 60px; background: rgba(66,133,244,0.15); border-radius: 50%; top: -8px; left: -8px; animation: userPulse 2s infinite;"></div>
        <div style="position: absolute; width: 44px; height: 44px; background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%); border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(66,133,244,0.5); display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="4" r="3"/>
            <path d="M12 8c-2.5 0-4.5 1.5-4.5 3.5V14h2v7h5v-7h2v-2.5c0-2-2-3.5-4.5-3.5z"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes userPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
      </style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  // Icône destination
  const createDestIcon = (color: string) => L.divIcon({
    className: 'dest-marker',
    html: `
      <div style="position: relative; width: 40px; height: 50px;">
        <div style="position: absolute; width: 4px; height: 50px; background: ${color}; left: 4px; top: 0; border-radius: 2px;"></div>
        <div style="position: absolute; left: 8px; top: 0; width: 32px; height: 24px; background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); border-radius: 0 4px 4px 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px ${color}66;">
          <span style="font-size: 14px;">🏁</span>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 12px; height: 12px; background: ${color}; border-radius: 50%; border: 2px solid white;"></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [6, 50],
    popupAnchor: [14, -50],
  });

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lat, userLocation.lng]
      : [destination.latitude, destination.longitude];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Mettre à jour le marqueur utilisateur
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="padding: 8px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 4px;">🚶</div>
          <div style="font-weight: bold; color: #4285F4;">Vous êtes ici</div>
        </div>
      `);

      userMarkerRef.current = marker;

      // Centrer sur l'utilisateur en mode navigation
      if (isNavigating) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
      }
    }
  }, [userLocation, isNavigating]);

  // Mettre à jour le marqueur destination
  useEffect(() => {
    if (!mapRef.current) return;

    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    const marker = L.marker([destination.latitude, destination.longitude], {
      icon: createDestIcon(accentColor),
    }).addTo(mapRef.current);

    marker.bindPopup(`
      <div style="padding: 8px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 4px;">🏁</div>
        <div style="font-weight: bold; color: ${accentColor};">Destination</div>
        <div style="color: #666; font-size: 12px;">${destination.nom}</div>
      </div>
    `);

    destMarkerRef.current = marker;
  }, [destination, accentColor]);

  // Dessiner la route
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      const routeLine = L.polyline(routeCoordinates, {
        color: '#4285F4',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      routeLineRef.current = routeLine;

      // Ajuster la vue pour voir toute la route
      if (!isNavigating) {
        mapRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }
    } else if (userLocation) {
      // Fallback: ligne droite
      const routeLine = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [destination.latitude, destination.longitude],
        ],
        {
          color: '#4285F4',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapRef.current);

      routeLineRef.current = routeLine;

      if (!isNavigating) {
        mapRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }
    }
  }, [routeCoordinates, userLocation, destination, isNavigating]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  );
}

