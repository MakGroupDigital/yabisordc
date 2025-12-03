'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from "@/components/home/bottom-nav";
import { 
  Hotel, 
  Car, 
  MapPin, 
  Calendar, 
  UtensilsCrossed, 
  Compass, 
  Package, 
  Languages, 
  Shield,
  Search,
  Star,
  MapPin as LocationIcon,
  ArrowRight
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  route: string;
}

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'lieu' | 'evenement' | 'hebergement' | 'restaurant';
  rating: number;
  location: string;
  price?: string;
}

const categories: Category[] = [
  {
    id: 'hebergement',
    name: 'Hébergement',
    icon: Hotel,
    route: '/home/explorer/hebergement'
  },
  {
    id: 'mobilite',
    name: 'Mobilité',
    icon: Car,
    route: '/home/explorer/mobilite'
  },
  {
    id: 'site-touristique',
    name: 'Site Touristique',
    icon: MapPin,
    route: '/home/explorer/site-touristique'
  },
  {
    id: 'evenements',
    name: 'Événements',
    icon: Calendar,
    route: '/home/explorer/evenements'
  },
  {
    id: 'restauration',
    name: 'Restauration',
    icon: UtensilsCrossed,
    route: '/home/explorer/restauration'
  },
  {
    id: 'guide-touristique',
    name: 'Guide Touristique',
    icon: Compass,
    route: '/home/explorer/guide-touristique'
  },
  {
    id: 'livreur',
    name: 'Livreur',
    icon: Package,
    route: '/home/explorer/livreur'
  },
  {
    id: 'traducteur',
    name: 'Traducteur',
    icon: Languages,
    route: '/home/explorer/traducteur'
  },
  {
    id: 'securite',
    name: 'Sécurité',
    icon: Shield,
    route: '/home/explorer/securite'
  },
];

const featuredItems: FeaturedItem[] = [
  {
    id: '1',
    title: 'Parc National des Virunga',
    subtitle: 'Découvrez la beauté naturelle du Congo',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    type: 'lieu',
    rating: 4.8,
    location: 'Nord-Kivu',
    price: 'Gratuit'
  },
  {
    id: '2',
    title: 'Festival de Musique Africaine',
    subtitle: 'Événement culturel incontournable',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    type: 'evenement',
    rating: 4.9,
    location: 'Kinshasa',
    price: '15$'
  },
  {
    id: '3',
    title: 'Hôtel Grand Kivu',
    subtitle: 'Luxe et confort au bord du lac',
    image: 'https://images.unsplash.com/photo-1566073771259-6a0d9b8c0b0e?w=800&q=80',
    type: 'hebergement',
    rating: 4.7,
    location: 'Goma',
    price: '120$/nuit'
  },
  {
    id: '4',
    title: 'Restaurant Le Roi du Poisson',
    subtitle: 'Cuisine locale authentique',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    type: 'restaurant',
    rating: 4.6,
    location: 'Kinshasa',
    price: '25$'
  },
  {
    id: '5',
    title: 'Chutes de Zongo',
    subtitle: 'Spectacle naturel époustouflant',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    type: 'lieu',
    rating: 4.9,
    location: 'Kongo-Central',
    price: '10$'
  },
];

export default function ExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (route: string) => {
    router.push(route);
  };

  // Auto-scroll du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Scroll automatique du carrousel
  useEffect(() => {
    if (scrollRef.current) {
      const scrollPosition = currentIndex * (scrollRef.current.scrollWidth / featuredItems.length);
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-3">Explorer</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-[#FF8800] h-11"
            />
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-28 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Carrousel de panneaux publicitaires */}
          <div className="relative">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-[#FF8800]" fill="#FF8800" />
              Au Top
            </h2>
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-scroll scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative min-w-[280px] h-[200px] rounded-2xl overflow-hidden snap-start cursor-pointer group"
                  onClick={() => {
                    // Navigation selon le type
                    if (item.type === 'lieu') router.push('/home/explorer/site-touristique');
                    else if (item.type === 'evenement') router.push('/home/explorer/evenements');
                    else if (item.type === 'hebergement') router.push('/home/explorer/hebergement');
                    else if (item.type === 'restaurant') router.push('/home/explorer/restauration');
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-[#FFCC00]" fill="#FFCC00" />
                      <span className="text-sm font-semibold">{item.rating}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">{item.subtitle}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <LocationIcon className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                      {item.price && (
                        <span className="text-sm font-semibold text-[#FF8800]">{item.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Indicateurs de pagination */}
            <div className="flex justify-center gap-2 mt-3">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentIndex === index ? "w-8 bg-[#FF8800]" : "w-2 bg-gray-600"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Section Catégories */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Catégories</h2>
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <div className="text-white text-center">
                    <p className="text-lg mb-2">Aucune catégorie trouvée</p>
                    <p className="text-sm text-gray-400">Essayez avec d'autres mots-clés</p>
                  </div>
                </div>
              ) : (
                filteredCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "cursor-pointer transition-all duration-200 active:scale-95",
                        "bg-gradient-to-br from-gray-900/90 to-gray-800/50 border border-gray-700/50 rounded-2xl",
                        "p-5 flex flex-col items-center justify-center gap-3 min-h-[130px]",
                        "hover:bg-gradient-to-br hover:from-[#FF8800]/20 hover:to-[#FF8800]/10",
                        "hover:border-[#FF8800]/50 hover:shadow-lg hover:shadow-[#FF8800]/20"
                      )}
                      onClick={() => handleCategoryClick(category.route)}
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF8800]/30 to-[#FF8800]/10 group-hover:from-[#FF8800]/40 group-hover:to-[#FF8800]/20 transition-all">
                        <Icon className="h-7 w-7 text-[#FF8800]" />
                      </div>
                      <h3 className="text-white font-semibold text-center text-sm">
                        {category.name}
                      </h3>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Nav - Fixé en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

