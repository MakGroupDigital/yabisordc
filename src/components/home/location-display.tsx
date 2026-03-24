'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationPermissionModal } from './location-permission-modal';
import { cn } from '@/lib/utils';

export function LocationDisplay() {
  const { location, loading, error, hasPermission, requestLocation } =
    useGeolocation();
  const [showModal, setShowModal] = useState(false);
  const [displayText, setDisplayText] = useState('Paris, France');

  // Mettre à jour le texte affiché quand la localisation change
  useEffect(() => {
    if (location) {
      setDisplayText(`${location.city}, ${location.country}`);
    }
  }, [location]);

  useEffect(() => {
    if (hasPermission === true && !location && !loading) {
      requestLocation();
    }
  }, [hasPermission, location, loading, requestLocation]);

  const handleLocationClick = () => {
    if (hasPermission === true) {
      requestLocation();
      return;
    }

    if (hasPermission === false) {
      // Si la permission a été refusée, montrer le modal
      setShowModal(true);
    } else {
      // Sinon, demander la permission
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    requestLocation();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Fermer le modal une fois que la localisation est chargée
  useEffect(() => {
    if (!loading && location) {
      setShowModal(false);
    }
  }, [loading, location]);

  return (
    <>
      <button
        onClick={handleLocationClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all group"
      >
        <MapPin className="h-4 w-4 text-white group-hover:text-white transition-colors" />
        <span className="text-sm text-white font-medium">
          {displayText}
        </span>
        <ChevronDown className="h-3 w-3 text-white/70 group-hover:text-white transition-colors" />
      </button>

      <LocationPermissionModal
        isOpen={showModal}
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        error={error}
      />
    </>
  );
}
