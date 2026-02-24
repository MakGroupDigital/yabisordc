'use client';

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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#003366]/95 via-[#003366]/80 to-transparent backdrop-blur-md md:hidden pointer-events-none">
      <div className="container mx-auto flex h-20 max-w-2xl items-center justify-around px-0 pt-2 pointer-events-auto">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path === '/home/explorer' && (pathname === '/home' || pathname === '/home/explorer'));
            
            return (
                <div key={item.name} className="relative flex flex-col items-center flex-1">
                    {isActive && <div className="absolute -top-1 h-1 w-5 rounded-full bg-[#FFCC00]" />}
                    <Button 
                        variant="ghost" 
                        className="h-auto flex-col gap-0.5 p-1.5 font-medium text-xs text-white/80 hover:text-white w-full"
                        onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "text-white")} />
                      <span className={cn("text-xs leading-tight", isActive && "text-white")}>{item.name}</span>
                    </Button>
                </div>
            )
        })}
      </div>
    </div>
  );
}
