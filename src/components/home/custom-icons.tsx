// Icônes personnalisées modernes pour Ya Biso RDC
// Charte graphique: Bleu #003366, Orange #FF8800, Jaune #FFCC00

interface IconProps {
  className?: string;
}

// Restaurant - Fourchette et couteau croisés avec assiette
export const RestaurantIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    <path d="M8 5v6c0 1 .5 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 13v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 5v5.5c0 1.5-1 2.5-2 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 13v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Hébergement - Maison moderne avec toit
export const HebergementIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 12l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

// Mobilité - Voiture moderne vue de côté
export const MobiliteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 13l1.5-4.5C7 7 8 6 9.5 6h5c1.5 0 2.5 1 3 2.5L19 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 13h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.2" />
    <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
    <path d="M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Site touristique - Pin de localisation avec montagne
export const SiteTouristiqueIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
    <path d="M9 9l1.5-2 1.5 2 1.5-2L15 9" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </svg>
);

// Salle de fête - Ballons et confettis
export const SalleFeteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3" />
    <path d="M8 11v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3" />
    <path d="M16 8.5v10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 16l2-2m2 4l1-1m6-1l2-2m-4 4l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="5" cy="18" r="0.5" fill="currentColor" />
    <circle cx="19" cy="14" r="0.5" fill="currentColor" />
    <circle cx="11" cy="20" r="0.5" fill="currentColor" />
  </svg>
);

// Urgence médicale - Croix médicale avec pouls
export const UrgenceMedicaleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 12h2l1-2 2 4 1-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    <path d="M14 12h2l1-2 2 4 1-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
  </svg>
);

// Événements - Calendrier avec étoile
export const EvenementsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 3v4M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 13l1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2-1.5-1.5 2-.5z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

// Sécurité - Bouclier avec coche
export const SecuriteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.2" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Traducteur - Bulles de dialogue avec langues
export const TraducteurIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 7h10M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 7c0 4 2 7 5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 7c0 4-2 7-5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 12h7M17.5 9v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 17l3.5-5 3.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    <circle cx="17" cy="15" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
  </svg>
);

// Livreur - Colis avec flèche rapide
export const LivreurIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="8" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M9 8V6a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1h-2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 10l4 2-4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="18" r="1.5" fill="currentColor" />
    <circle cx="11" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

// Guide touristique - Boussole moderne
export const GuideTouristiqueIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 8l2 4-4 2 2-4-2-4 4 2z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
