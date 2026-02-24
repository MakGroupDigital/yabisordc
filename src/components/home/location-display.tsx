'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationPermissionModal } from './location-permission-modal';
import { cn } from '@/lib/utils';

export function LocationDisplay() {
  const { location, loading, error, hasPermission, requestLocation, clearLocation } =
    useGeolocation();
  const [showModal, setShowModal] = useState(false);
  const [displayText, setDisplayText] = useState('Paris, France');

  // Mettre à jour le texte affiché quand la localisation change
  useEffect(() => {
    if (location) {
      setDisplayText(`${location.city}, ${location.country}`);
    }
  }, [location]);

  const handleLocationClick = () => {
    if (location) {
      // Si on a déjà une localisation, afficher un menu pour changer
      setShowModal(true);
    } else if (hasPermission === false) {
      // Si la permission a été refusée, montrer le modal
      setShowModal(true);
    } else {
      // Sinon, demander la permission
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    requestLocation();
    // Garder le modal ouvert pendant le chargement
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <MapPin className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
          {displayText}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
