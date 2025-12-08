
'use client';

import { Home, Search, Heart, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

type NavItemName = 'Accueil' | 'Explorer' | 'Créer' | 'Favoris' | 'Profil';

const navItems = [
    { name: 'Accueil', icon: Home, path: '/home' },
    { name: 'Explorer', icon: Search, path: '/home/explorer' },
    { name: 'Créer', icon: PlusCircle, path: '/home/create', isCentral: true },
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
            const isActive = pathname === item.path || (item.path === '/home' && pathname === '/home');

            if (item.isCentral) {
                return (
                    <div key={item.name} className="relative -top-8">
                        <Button 
                            size="icon" 
                            className="h-16 w-16 rounded-full bg-[#FF8800] shadow-lg hover:bg-[#FF8800]/90 transition-transform duration-200 hover:scale-105"
                            onClick={() => handleNavigation(item.path)}
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
                        onClick={() => handleNavigation(item.path)}
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
