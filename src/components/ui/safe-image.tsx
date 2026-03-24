'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
}

const gradients = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
];

export function SafeImage({ 
  src, 
  alt, 
  className, 
  fallbackText,
  fallbackIcon 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Choisir un gradient basé sur le texte alt pour la cohérence
  const gradientIndex = alt.length % gradients.length;
  const gradient = gradients[gradientIndex];

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError || !src) {
    return (
      <div className={cn(
        "flex items-center justify-center text-white font-medium",
        gradient,
        className
      )}>
        {fallbackIcon ? (
          <div className="flex flex-col items-center gap-2">
            {fallbackIcon}
            {fallbackText && (
              <span className="text-xs text-center opacity-90">
                {fallbackText}
              </span>
            )}
          </div>
        ) : (
          <span className="text-center text-sm">
            {fallbackText || alt.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={cn(
          "flex items-center justify-center animate-pulse bg-gray-200",
          className
        )}>
          <div className="w-6 h-6 bg-gray-300 rounded-full animate-bounce" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, isLoading && "hidden")}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
}