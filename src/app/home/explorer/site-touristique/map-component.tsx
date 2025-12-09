'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Icône pour la position de l'utilisateur (bleu pulsant)
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
    ">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        background: #4285F4;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 10px rgba(66,133,244,0.5);
      "></div>
      <div style="
        position: absolute;
        width: 48px;
        height: 48px;
        background: rgba(66,133,244,0.2);
        border-radius: 50%;
        top: -12px;
        left: -12px;
        animation: userPulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes userPulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.5); opacity: 0.2; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapComponent({
  sites,
  selectedSite,
  userLocation,
  center,
  zoom,
  onSiteSelect,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Créer la carte
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Ajouter le contrôle de zoom en bas à droite
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Utiliser un style de carte sombre (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

  // Mettre à jour les marqueurs des sites
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

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
  }, [sites, selectedSite, onSiteSelect]);

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
        icon: userIcon,
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="
          padding: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
        ">
          <div style="font-size: 24px; margin-bottom: 4px;">📍</div>
          <div style="font-weight: bold; color: #4285F4;">Vous êtes ici</div>
        </div>
      `);

      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  );
}

