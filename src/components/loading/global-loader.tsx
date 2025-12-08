'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Détecter le chargement initial
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 1500); // Afficher pendant 1.5 secondes minimum
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    // Afficher le loader lors du changement de route
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Afficher pendant 0.8 secondes lors du changement de route
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-[#003366] via-[#001122] to-black">
      <div className="relative">
        {/* Cercle de chargement animé - Effet de rotation avec gradient */}
        <div className="relative h-32 w-32 rounded-full animate-spin-slow" style={{
          background: 'conic-gradient(from 0deg, #FF8800 0deg, #FFCC00 90deg, #FF8800 180deg, #FFCC00 270deg, #FF8800 360deg)',
          padding: '4px',
        }}>
          <div className="h-full w-full rounded-full bg-gradient-to-b from-[#003366] to-[#001122] flex items-center justify-center">
            {/* Logo au centre avec effet de pulse */}
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-[#FF8800]/30 to-[#FFCC00]/30 backdrop-blur-sm border-2 border-[#FFCC00]/40 animate-pulse">
              <Image
                src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
                alt="Ya Biso RDC Logo"
                width={96}
                height={96}
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Points de chargement animés en bas */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF8800] shadow-lg shadow-[#FF8800]/50 animate-bounce-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2.5 w-2.5 rounded-full bg-[#FFCC00] shadow-lg shadow-[#FFCC00]/50 animate-bounce-dot" style={{ animationDelay: '200ms' }}></div>
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF8800] shadow-lg shadow-[#FF8800]/50 animate-bounce-dot" style={{ animationDelay: '400ms' }}></div>
        </div>
        
        {/* Texte de chargement avec effet de fade */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white font-headline text-2xl font-bold whitespace-nowrap">
            <span className="bg-gradient-to-r from-[#FF8800] via-[#FFCC00] to-[#FF8800] bg-clip-text text-transparent animate-gradient">
              Oyo Ya Biso Moko
            </span>
            <span className="text-[#FFCC00] ml-1 animate-pulse">!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

