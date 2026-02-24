'use client';

import { Search, Send, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const suggestions = [
    "Toutes les explorations",
    "Ville de Goma",
    "Centre Culturel",
    "Marché de la liberté",
    "Chutes de Zongo",
    "Lola ya Bonobo"
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#003366]/80 to-transparent backdrop-blur-md">
      <div className="container mx-auto flex h-20 max-w-2xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
                <Image
                    src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
                    alt="Ya Biso RDC Logo"
                    width={24}
                    height={24}
                    className="object-cover"
                />
            </div>
        </div>
        <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Où voulez-vous explorer?"
                className="h-11 rounded-full border-transparent bg-white/80 pl-11 text-base focus:bg-white"
            />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                <Send className="h-6 w-6 text-white" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                <Bell className="h-6 w-6 text-white" />
            </Button>
        </div>
      </div>
       <div className="container mx-auto max-w-2xl px-4 pb-2 pt-1 overflow-x-auto">
            <div className="flex gap-2 py-2">
                {suggestions.map((tag, index) => (
                    <Button 
                        key={tag} 
                        variant="ghost"
                        size="sm" 
                        className={cn(
                            "h-8 shrink-0 rounded-full border-0 font-medium",
                            index === 0 
                                ? "bg-[#FF8800] text-white hover:bg-[#FF8800]/90" 
                                : "bg-[#F5F5F5] text-[#003366] hover:bg-gray-200"
                        )}
                    >
                        {tag}
                    </Button>
                ))}
            </div>
      </div>
    </header>
  );
}
