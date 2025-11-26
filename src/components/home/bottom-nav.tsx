
'use client';

import { Home, Search, Heart, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

type NavItemName = 'Accueil' | 'Explorer' | 'Créer' | 'Favoris' | 'Profil';

const navItems = [
    { name: 'Accueil', icon: Home },
    { name: 'Explorer', icon: Search },
    { name: 'Créer', icon: PlusCircle, isCentral: true },
    { name: 'Favoris', icon: Heart },
    { name: 'Profil', icon: User },
] as const;


export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveItem = (): NavItemName => {
    if (pathname === '/home') return 'Accueil';
    if (pathname === '/home/create') return 'Créer';
    if (pathname === '/home/explorer') return 'Explorer';
    if (pathname === '/home/favorites') return 'Favoris';
    if (pathname === '/home/profile') return 'Profil';
    return 'Accueil';
  };

  const activeItem = getActiveItem();

  const handleNavigation = (itemName: NavItemName) => {
    switch (itemName) {
      case 'Accueil':
        router.push('/home');
        break;
      case 'Créer':
        router.push('/home/create');
        break;
      case 'Explorer':
        router.push('/home/explorer');
        break;
      case 'Favoris':
        router.push('/home/favorites');
        break;
      case 'Profil':
        router.push('/home/profile');
        break;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#003366]/80 to-transparent backdrop-blur-md md:hidden">
      <div className="container mx-auto flex h-24 max-w-2xl items-center justify-around px-0 pt-4">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;

            if (item.isCentral) {
                return (
                    <div key={item.name} className="relative -top-8">
                        <Button 
                            size="icon" 
                            className="h-16 w-16 rounded-full bg-[#FF8800] shadow-lg hover:bg-[#FF8800]/90 transition-transform duration-200 hover:scale-105"
                            onClick={() => handleNavigation(item.name)}
                        >
                           <Icon className="h-10 w-10 text-white" fill="white" />
                        </Button>
                    </div>
                )
            }
            
            return (
                <div key={item.name} className="relative flex flex-col items-center">
                    {isActive && <div className="absolute -top-1 h-1 w-6 rounded-full bg-[#FFCC00]" />}
                    <Button 
                        variant="ghost" 
                        className="h-auto flex-col gap-1 p-2 font-medium text-sm text-white/80 hover:text-white"
                        onClick={() => handleNavigation(item.name)}
                    >
                      <Icon className={cn("h-6 w-6", isActive && "text-white")} />
                      <span className={cn("text-xs", isActive && "text-white")}>{item.name}</span>
                    </Button>
                </div>
            )
        })}
      </div>
    </div>
  );
}
