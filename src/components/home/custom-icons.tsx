import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

const iconShell = (children: ReactNode, className?: string) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.08" />
    <path d="M7 7.5h10" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.2" strokeLinecap="round" />
    {children}
  </svg>
);

export const RestaurantIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M8 8.5v7.5M10 8.5v4.5M15 8.5v7.5M17 8.5v7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 13c-1.2 0-2-.9-2-2.1V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 11.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 17h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    </>,
    className
  );

export const HebergementIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M5.5 11.5 12 6l6.5 5.5V18a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-6.5Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="M10 19v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 10.5h.01M15 10.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>,
    className
  );

export const MobiliteIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M7 15.5h10l-.9-4.1a2 2 0 0 0-2-1.6H9.9a2 2 0 0 0-2 1.6L7 15.5Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="M6 15.5h12v1.2A1.3 1.3 0 0 1 16.7 18H7.3A1.3 1.3 0 0 1 6 16.7v-1.2Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="17" r="1.1" fill="currentColor" />
      <circle cx="15.5" cy="17" r="1.1" fill="currentColor" />
    </>,
    className
  );

export const SiteTouristiqueIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M6 17.5 10 10l3 4 2-2.5 3 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 8v4h2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 17.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </>,
    className
  );

export const SalleFeteIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <circle cx="8" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.14" />
      <circle cx="16" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.14" />
      <path d="M8 11.4v5.1M16 10.4v6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m7 16.5 2 1.5m6-1.5-2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 13.2h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    </>,
    className
  );

export const UrgenceMedicaleIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </>,
    className
  );

export const EvenementsIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <rect x="5.5" y="7" width="13" height="10.5" rx="2.3" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="M8.5 5.5v3M15.5 5.5v3M5.5 10h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m10 13 1.3 1.3L14.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className
  );

export const SecuriteIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M12 5.8 17 8v3.1c0 3.4-2.1 5.5-5 7.1-2.9-1.6-5-3.7-5-7.1V8l5-2.2Z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="m9.8 12.2 1.6 1.6 2.9-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className
  );

export const TraducteurIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <path d="M6.5 8h5a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2H9l-2.5 2v-2H6.5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12" />
      <path d="M14 10.5h3.5a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H17v1.5L15 17h-1a2 2 0 0 1-2-2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.12" />
      <path d="M8 10.8h2.2M15.3 13.2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>,
    className
  );

export const LivreurIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <rect x="5.5" y="9" width="8.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.12" />
      <path d="M14 11h2.3l2.2 2v3.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8.3" cy="17" r="1.1" fill="currentColor" />
      <circle cx="16.6" cy="17" r="1.1" fill="currentColor" />
      <path d="M8 12.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>,
    className
  );

export const GuideTouristiqueIcon = ({ className }: IconProps) =>
  iconShell(
    <>
      <circle cx="12" cy="12.2" r="5.2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" opacity="0.1" />
      <path d="M12 8.3v7.8M8.1 12.2h7.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <path d="m12 9.3 2 3-2 2-2-2 2-3Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    </>,
    className
  );
