import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

const STORAGE_KEY = 'user_location_data';
const PERMISSION_KEY = 'location_permission_granted';

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: null,
  });

  // Charger les données stockées au montage
  useEffect(() => {
    const storedLocation = localStorage.getItem(STORAGE_KEY);
    const permissionGranted = localStorage.getItem(PERMISSION_KEY);

    if (storedLocation) {
      try {
        setState((prev) => ({
          ...prev,
          location: JSON.parse(storedLocation),
          hasPermission: permissionGranted === 'true',
        }));
      } catch (e) {
        console.error('Erreur lors du chargement de la localisation stockée:', e);
      }
    }
  }, []);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<LocationData | null> => {
      try {
        // Utiliser OpenStreetMap Nominatim API (gratuit, pas de clé requise)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'Accept-Language': 'fr',
            },
          }
        );

        if (!response.ok) throw new Error('Erreur de géocodage inverse');

        const data = await response.json();
        const address = data.address || {};

        return {
          city: address.city || address.town || address.village || 'Ville inconnue',
          country: address.country || 'Pays inconnu',
          region: address.state || address.region || 'Région inconnue',
          latitude,
          longitude,
        };
      } catch (error) {
        console.error('Erreur lors du géocodage inverse:', error);
        return null;
      }
    },
    []
  );

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = await reverseGeocode(latitude, longitude);

        if (locationData) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
          localStorage.setItem(PERMISSION_KEY, 'true');

          setState({
            location: locationData,
            loading: false,
            error: null,
            hasPermission: true,
          });
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Impossible de déterminer votre localisation',
          }));
        }
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permission de géolocalisation refusée';
          localStorage.setItem(PERMISSION_KEY, 'false');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Position indisponible';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Délai d\'attente dépassé';
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          hasPermission: false,
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [reverseGeocode]);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERMISSION_KEY);
    setState({
      location: null,
      loading: false,
      error: null,
      hasPermission: null,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}
