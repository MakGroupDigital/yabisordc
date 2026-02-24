interface IconProps {
  className?: string;
}

// Couverts - Fourchette, couteau, cuillère
export const CuteleryIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Fourchette */}
    <path d="M5 3v10c0 1 .5 2 1.5 2h1v4h2v-4h2v4h2v-4h1c1 0 1.5-1 1.5-2V3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3" />
    {/* Couteau */}
    <path d="M14 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cuillère */}
    <circle cx="19" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M19 10.5v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Avion incliné
export const PlaneIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l8 6v3l-8-4-8 4v-3l8-6z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M4 11l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
);

// Camion de livraison
export const TruckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    {/* Cabine */}
    <rect x="2" y="8" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    {/* Cargo */}
    <rect x="8" y="8" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    {/* Roue avant */}
    <circle cx="5" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    {/* Roue arrière */}
    <circle cx="18" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    {/* Pare-chocs */}
    <line x1="2" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
