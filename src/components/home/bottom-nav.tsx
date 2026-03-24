'use client';

import { startTransition, useEffect } from 'react';
import { Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

type NavItemName = 'Explorer' | 'Commandes' | 'Réservations' | 'Favoris' | 'Profil';

// Icône de jumelles personnalisée
const Binoculars = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Jumelle gauche - cercle extérieur */}
    <circle cx="7" cy="12" r="5" />
    {/* Jumelle gauche - cercle intérieur (oculaire) */}
    <circle cx="7" cy="12" r="3" fill="currentColor" opacity="0.3" />
    {/* Jumelle droite - cercle extérieur */}
    <circle cx="17" cy="12" r="5" />
    {/* Jumelle droite - cercle intérieur (oculaire) */}
    <circle cx="17" cy="12" r="3" fill="currentColor" opacity="0.3" />
    {/* Lien central entre les jumelles */}
    <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" />
    {/* Barre de connexion supérieure */}
    <path d="M10 8h4" strokeWidth="2.5" />
    {/* Barre de connexion inférieure */}
    <path d="M10 16h4" strokeWidth="2.5" />
  </svg>
);

// Icône de commande (sac/panier)
const Orders = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9" cy="21" r="1" fill="currentColor" />
    <circle cx="20" cy="21" r="1" fill="currentColor" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

// Icône de réservation (calendrier)
const Reservations = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="12" cy="16" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

const navItems = [
    { name: 'Explorer', icon: Binoculars, path: '/home/explorer' },
    { name: 'Commandes', icon: Orders, path: '/home/orders' },
    { name: 'Réservations', icon: Reservations, path: '/home/reservations' },
    { name: 'Favoris', icon: Heart, path: '/home/favorites' },
    { name: 'Profil', icon: User, path: '/home/profile' },
] as const;


export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.path));
  }, [router]);

  const handleNavigation = (path: string) => {
    router.prefetch(path);
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-3">
      <div className="pointer-events-auto flex h-20 w-full max-w-2xl items-center justify-around rounded-[28px] border border-[#003366]/12 bg-[#003366] px-2 pt-2 shadow-[0_24px_60px_-28px_rgba(0,51,102,0.55)] md:h-[74px] md:max-w-3xl md:rounded-full md:px-4">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path === '/home/explorer' && (pathname === '/home' || pathname === '/home/explorer'));
            
            return (
                <div key={item.name} className="relative flex flex-col items-center flex-1">
                    {isActive && <div className="absolute -top-1 h-1 w-5 rounded-full bg-[#FFCC00] md:-top-2" />}
                    <Button 
                        variant="ghost" 
                        className="h-auto w-full flex-col gap-0.5 p-1.5 text-xs font-medium text-white/80 hover:bg-transparent hover:text-white md:flex-row md:justify-center md:gap-2 md:rounded-full md:px-3"
                        onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "text-white")} />
                      <span className={cn("text-xs leading-tight md:text-sm", isActive && "text-white")}>{item.name}</span>
                    </Button>
                </div>
            )
        })}
      </div>
    </div>
  );
}
