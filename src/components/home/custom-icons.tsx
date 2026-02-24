// Icônes personnalisées modernes pour Ya Biso RDC
// Design épuré et moderne

interface IconProps {
  className?: string;
}

// Restaurant - Assiette avec couverts
export const RestaurantIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M8 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 8v6M9 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Hébergement - Maison simple et moderne
export const HebergementIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 12l9-7 9 7v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <rect x="9" y="14" width="6" height="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
  </svg>
);

// Mobilité - Voiture épurée
export const MobiliteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12l1-3c.5-1 1.5-2 3-2h8c1.5 0 2.5 1 3 2l1 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 12h20v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <circle cx="6" cy="17" r="1.5" fill="currentColor" />
    <circle cx="18" cy="17" r="1.5" fill="currentColor" />
  </svg>
);

// Site touristique - Montagne avec drapeau
export const SiteTouristiqueIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 18l6-10 5 8 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 8v4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Salle de fête - Ballons
export const SalleFeteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="17" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M7 9.5v8M17 8.5v9M12 12v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Urgence médicale - Croix simple
export const UrgenceMedicaleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Événements - Calendrier épuré
export const EvenementsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 3v4M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

// Sécurité - Bouclier
export const SecuriteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l7 3v5c0 5-7 8-7 8s-7-3-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M10 12l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Traducteur - Bulles de dialogue
export const TraducteurIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 8h8a2 2 0 012 2v4a2 2 0 01-2 2H5l-2 2v-2H3a2 2 0 01-2-2v-4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M13 10h8a2 2 0 012 2v4a2 2 0 01-2 2h-4l2 2v-2h2a2 2 0 01-2-2v-4a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M6 11h2M17 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Livreur - Colis
export const LivreurIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="8" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M7 8V6a1 1 0 011-1h6a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 12l4-2v4l-4-2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Guide touristique - Boussole
export const GuideTouristiqueIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M12 7l3 5-3 3-3-3 3-5z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);
