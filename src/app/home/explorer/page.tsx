'use client';

import { Header } from "@/components/home/feed-header";
import { BottomNav } from "@/components/home/bottom-nav";
import { 
  UtensilsCrossed, 
  Hotel, 
  Car, 
  Languages, 
  MapPin, 
  Camera,
  Calendar,
  ShoppingBag,
  Plane,
  Music,
  Mountain,
  Waves,
  Building2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
};

const categories: Category[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: UtensilsCrossed,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10'
  },
  {
    id: 'hotel',
    name: 'Hôtel',
    icon: Hotel,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10'
  },
  {
    id: 'chauffeur',
    name: 'Chauffeur',
    icon: Car,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10'
  },
  {
    id: 'traducteur',
    name: 'Traducteur',
    icon: Languages,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10'
  },
  {
    id: 'guide',
    name: 'Guide',
    icon: MapPin,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10'
  },
  {
    id: 'site-touristique',
    name: 'Site Touristique',
    icon: Camera,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10'
  },
  {
    id: 'evenement',
    name: 'Événement',
    icon: Calendar,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: Plane,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10'
  },
  {
    id: 'culture',
    name: 'Culture',
    icon: Music,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10'
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Mountain,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10'
  },
  {
    id: 'plage',
    name: 'Plage',
    icon: Waves,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10'
  },
  {
    id: 'monument',
    name: 'Monument',
    icon: Building2,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10'
  },
  {
    id: 'activite',
    name: 'Activité',
    icon: Sparkles,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10'
  },
];

export default function ExplorerPage() {
  const router = useRouter();
  
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/home/explorer/${categoryId}`);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Titre Explorer */}
          <div className="mb-6">
            <h1 className="text-3xl font-headline font-bold text-[#003366]">
              Explorer
            </h1>
            <p className="text-gray-600 mt-2 font-body">
              Découvrez tout ce que la RDC a à offrir
            </p>
          </div>

          {/* Grille de catégories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                    "border-2 border-transparent hover:border-[#FF8800]/30"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <div className={cn(
                      "rounded-2xl p-4",
                      category.bgColor
                    )}>
                      <Icon className={cn("h-8 w-8", category.color)} />
                    </div>
                    <h3 className="font-headline font-semibold text-[#003366] text-center text-sm">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Section suggestions populaires */}
          <div className="mt-8 mb-6">
            <h2 className="text-xl font-headline font-bold text-[#003366] mb-4">
              Suggestions populaires
            </h2>
            <div className="space-y-3">
              {[
                'Restaurants à Kinshasa',
                'Hôtels à Goma',
                'Guides touristiques',
                'Sites historiques'
              ].map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <p className="font-body text-[#003366]">{suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

