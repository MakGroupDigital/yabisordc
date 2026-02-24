'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface TouristSite {
  id: string;
  nom: string;
  description: string;
  latitude: number;
  longitude: number;
  ville: string;
  province: string;
  telephone?: string;
  image?: string;
}

interface MapComponentProps {
  sites: TouristSite[];
  selectedSite: TouristSite | null;
  userLocation: { lat: number; lng: number } | null;
  center: [number, number];
  zoom: number;
  onSiteSelect: (site: TouristSite) => void;
  isNavigating?: boolean;
  navigationTarget?: TouristSite | null;
  routeCoordinates?: [number, number][];
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  currentInstruction?: string;
  distanceToManeuver?: number;
}

// Icône personnalisée pour les sites touristiques (orange)
const siteIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #FF8800 0%, #FF6600 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 16px;
      ">📍</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Icône pour le site sélectionné (plus grand, avec animation)
const selectedSiteIcon = L.divIcon({
  className: 'custom-marker selected',
  html: `
    <div style="
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #FF8800 0%, #FF4400 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 6px 20px rgba(255,136,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s infinite;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 22px;
      ">🏛️</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: rotate(-45deg) scale(1); }
        50% { transform: rotate(-45deg) scale(1.1); }
      }
    </style>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

// Icône pour la position de l'utilisateur (personne qui marche)
const createUserIcon = () => L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
    ">
      <!-- Cercle de précision -->
      <div style="
        position: absolute;
        width: 60px;
        height: 60px;
        background: rgba(66,133,244,0.15);
        border-radius: 50%;
        top: -8px;
        left: -8px;
        animation: userPulse 2s infinite;
      "></div>
      <!-- Icône personne -->
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 15px rgba(66,133,244,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
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

// Icône destination (drapeau)
const destinationIcon = L.divIcon({
  className: 'destination-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 50px;
    ">
      <div style="
        position: absolute;
        width: 4px;
        height: 50px;
        background: #FF4444;
        left: 4px;
        top: 0;
        border-radius: 2px;
      "></div>
      <div style="
        position: absolute;
        left: 8px;
        top: 0;
        width: 32px;
        height: 24px;
        background: linear-gradient(135deg, #FF4444 0%, #CC0000 100%);
        border-radius: 0 4px 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(255,68,68,0.4);
      ">
        <span style="font-size: 14px;">🏁</span>
      </div>
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        width: 12px;
        height: 12px;
        background: #FF4444;
        border-radius: 50%;
        border: 2px solid white;
      "></div>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [6, 50],
  popupAnchor: [14, -50],
});

export default function MapComponent({
  sites,
  selectedSite,
  userLocation,
  center,
  zoom,
  onSiteSelect,
  isNavigating = false,
  navigationTarget = null,
  routeCoordinates = [],
  isFullscreen = false,
  onToggleFullscreen,
  currentInstruction,
  distanceToManeuver,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Créer la carte
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Ajouter le contrôle de zoom en bas à droite
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Utiliser un style de carte sombre (CartoDB Dark Matter)
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

  // Mettre à jour le centre et le zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Invalider la taille de la carte quand on passe en plein écran
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isFullscreen]);

  // Mettre à jour les marqueurs des sites
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // En mode navigation, ne pas afficher les autres sites
    if (isNavigating) return;

    // Ajouter les nouveaux marqueurs
    sites.forEach((site) => {
      const isSelected = selectedSite?.id === site.id;
      
      const marker = L.marker([site.latitude, site.longitude], {
        icon: isSelected ? selectedSiteIcon : siteIcon,
      }).addTo(mapRef.current!);

      // Popup avec infos du site
      marker.bindPopup(`
        <div style="
          min-width: 200px;
          padding: 8px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: bold;
            color: #FF8800;
          ">${site.nom}</h3>
          <p style="
            margin: 0 0 8px 0;
            font-size: 13px;
            color: #666;
          ">${site.description}</p>
          <div style="
            font-size: 12px;
            color: #999;
          ">
            📍 ${site.ville}, ${site.province}
          </div>
        </div>
      `, {
        className: 'custom-popup',
      });

      // Clic sur le marqueur
      marker.on('click', () => {
        onSiteSelect(site);
      });

      markersRef.current.push(marker);
    });
  }, [sites, selectedSite, onSiteSelect, isNavigating]);

  // Mettre à jour le marqueur utilisateur
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer l'ancien marqueur utilisateur
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Ajouter le nouveau marqueur utilisateur
    if (userLocation) {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="
          padding: 12px;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
        ">
          <div style="font-size: 28px; margin-bottom: 8px;">🚶</div>
          <div style="font-weight: bold; color: #4285F4; font-size: 14px;">Vous êtes ici</div>
        </div>
      `);

      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Dessiner la route et le marqueur de destination en mode navigation
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer l'ancienne route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Supprimer l'ancien marqueur de destination
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // Dessiner la nouvelle route si en mode navigation
    if (isNavigating && navigationTarget) {
      // Si on a des coordonnées de route (depuis OSRM)
      if (routeCoordinates && routeCoordinates.length > 0) {
        const routeLine = L.polyline(routeCoordinates, {
          color: '#4285F4',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(mapRef.current);

        routeLineRef.current = routeLine;
      } else if (userLocation) {
        // Fallback: ligne droite
        const routeLine = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [navigationTarget.latitude, navigationTarget.longitude],
          ],
          {
            color: '#4285F4',
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round',
          }
        ).addTo(mapRef.current);

        routeLineRef.current = routeLine;
      }

      // Marqueur de destination
      const destMarker = L.marker(
        [navigationTarget.latitude, navigationTarget.longitude],
        { icon: destinationIcon }
      ).addTo(mapRef.current);

      destMarker.bindPopup(`
        <div style="
          padding: 12px;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">🏁</div>
          <div style="font-weight: bold; color: #FF4444; font-size: 14px;">Destination</div>
          <div style="color: #333; font-size: 13px; margin-top: 4px;">${navigationTarget.nom}</div>
        </div>
      `);

      destinationMarkerRef.current = destMarker;
    }
  }, [isNavigating, userLocation, navigationTarget, routeCoordinates]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ background: '#1a1a2e' }}
      />
      
      {/* Bouton plein écran */}
      {onToggleFullscreen && !isNavigating && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-2 left-2 z-[1000] bg-gray-900/90 hover:bg-gray-800 text-white p-2 rounded-lg shadow-lg transition-all"
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )}
        </button>
      )}

      {/* Instruction de navigation en haut */}
      {isNavigating && currentInstruction && (
        <div className="absolute top-2 left-2 right-2 z-[1000] bg-blue-600 rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{currentInstruction}</div>
              {distanceToManeuver !== undefined && (
                <div className="text-blue-200 text-xs">
                  Dans {distanceToManeuver < 1000 
                    ? `${Math.round(distanceToManeuver)} m` 
                    : `${(distanceToManeuver / 1000).toFixed(1)} km`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
