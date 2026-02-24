'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'lg' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#003366] via-[#001122] to-black",
      className
    )}>
      <div className="relative">
        {/* Cercle de chargement animé */}
        <div className={cn(
          "relative rounded-full border-4 border-transparent",
          "bg-gradient-to-r from-[#FF8800] via-[#FFCC00] to-[#FF8800]",
          "animate-spin",
          sizeClasses[size]
        )} style={{
          background: 'conic-gradient(from 0deg, #FF8800, #FFCC00, #FF8800, #FF8800)',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
        }}>
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#003366] to-[#001122]"></div>
        </div>
        
        {/* Logo au centre */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "rounded-full overflow-hidden",
          "bg-gradient-to-br from-[#FF8800]/20 to-[#FFCC00]/20",
          "backdrop-blur-sm border-2 border-[#FFCC00]/30",
          "animate-pulse"
        )}>
          <Image
            src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
            alt="Ya Biso RDC Logo"
            width={size === 'sm' ? 48 : size === 'md' ? 72 : 96}
            height={size === 'sm' ? 48 : size === 'md' ? 72 : 96}
            className="rounded-full object-cover"
            priority
          />
        </div>
        
        {/* Points de chargement */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-[#FF8800] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-[#FFCC00] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-[#FF8800] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {/* Texte de chargement */}
      <p className="mt-20 text-white/80 font-headline text-lg animate-pulse">
        Chargement...
      </p>
    </div>
  );
}



