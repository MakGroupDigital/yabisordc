// Icônes personnalisées pour le panneau publicitaire "À la Une"

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// Dépôt & Retrait - Enveloppe avec argent
export const DepotRetraitIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M3 8l9-3 9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

// Transfer International - Globe avec flèche
export const TransferIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 8l3-3m0 0l-3-3m3 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Retrait - Billet de banque
export const RetraitIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 12h2M16 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Cartes Virtuelles - Carte de crédit
export const CartesVirtuellesIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="14" width="4" height="2" fill="currentColor" />
  </svg>
);

// Achat d'Unités - Téléphone avec signal
export const AchatUnitesIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M8 18h8M12 20h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Réabonnement TV - Télévision
export const ReabonnementTVIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M7 17h10M9 20h6M6 20h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Appro Illico - Portefeuille avec plus
export const ApproIllicoIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 8h16a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <circle cx="14" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 11v4M12 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Appro Rawbank - Banque
export const ApproRawbankIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M9 13v4M15 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Approbations - Coche circulaire
export const ApprobationsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
