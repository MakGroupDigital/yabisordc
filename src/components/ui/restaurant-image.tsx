'use client';

import { useState } from 'react';
import { SafeImage } from './safe-image';

interface RestaurantImageProps {
  src: string;
  alt: string;
  className?: string;
  restaurantName?: string;
}

export function RestaurantImage({ src, alt, className, restaurantName }: RestaurantImageProps) {
  const [hasError, setHasError] = useState(false);

  // Fallback vers une image générée si l'image principale échoue
  const fallbackSrc = hasError 
    ? `https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=${encodeURIComponent(restaurantName || 'Restaurant')}`
    : src;

  return (
    <SafeImage
      src={fallbackSrc}
      alt={alt}
      className={className}
      fallbackText={restaurantName || 'Restaurant'}
      onError={() => setHasError(true)}
    />
  );
}