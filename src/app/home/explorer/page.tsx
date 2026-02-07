'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from "@/components/home/bottom-nav";
import { 
  Search,
  Star,
  MapPin as LocationIcon,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  RestaurantIcon,
  HebergementIcon,
  MobiliteIcon,
  SiteTouristiqueIcon,
  SalleFeteIcon,
  UrgenceMedicaleIcon,
  EvenementsIcon,
  SecuriteIcon,
  TraducteurIcon,
  LivreurIcon,
  GuideTouristiqueIcon,
} from '@/components/home/custom-icons';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  route: string;
  color: string;
  gradient: string;
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
    id: 'restauration',
    name: 'Restaurant',
    icon: RestaurantIcon,
    route: '/home/explorer/restauration',
    color: '#FF8800',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'hebergement',
    name: 'Hébergement',
    icon: HebergementIcon,
    route: '/home/explorer/hebergement',
    color: '#003366',
    gradient: 'from-blue-600 to-blue-700'
  },
  {
    id: 'mobilite',
    name: 'Mobilité',
    icon: MobiliteIcon,
    route: '/home/explorer/mobilite',
    color: '#FFCC00',
    gradient: 'from-yellow-400 to-yellow-500'
  },
  {
    id: 'site-touristique',
    name: 'Site touristique',
    icon: SiteTouristiqueIcon,
    route: '/home/explorer/site-touristique',
    color: '#10B981',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'salle-fete-jeux',
    name: 'Salle de fête',
    icon: SalleFeteIcon,
    route: '/home/explorer/salle-fete-jeux',
    color: '#EC4899',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'urgence-medicale',
    name: 'Urgence Médicale',
    icon: UrgenceMedicaleIcon,
    route: '/home/explorer/urgence-medicale',
    color: '#EF4444',
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'evenements',
    name: 'Événements',
    icon: EvenementsIcon,
    route: '/home/explorer/evenements',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-violet-600'
  },
  {
    id: 'securite',
    name: 'Sécurité',
    icon: SecuriteIcon,
    route: '/home/explorer/securite',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'traducteur',
    name: 'Traducteur',
    icon: TraducteurIcon,
    route: '/home/explorer/traducteur',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'livreur',
    name: 'Livreur',
    icon: LivreurIcon,
    route: '/home/explorer/livreur',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    id: 'guide-touristique',
    name: 'Guide touristique',
    icon: GuideTouristiqueIcon,
    route: '/home/explorer/guide-touristique',
    color: '#14B8A6',
    gradient: 'from-teal-500 to-teal-600'
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (route: string) => {
    router.push(route);
  };

  // Auto-scroll du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5000);

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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header avec effet glassmorphism */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          {/* Titre avec animation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Explorer
              </h1>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#FFCC00]" />
                Découvrez les meilleurs services
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF8800]/20 to-[#FFCC00]/20 border border-[#FF8800]/30">
              <TrendingUp className="h-4 w-4 text-[#FF8800]" />
              <span className="text-xs font-semibold text-white">Populaire</span>
            </div>
          </motion.div>

          {/* Barre de recherche moderne */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className={cn(
              "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200",
              isSearchFocused ? "text-[#FF8800]" : "text-gray-400"
            )} />
            <Input
              type="text"
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-12 pr-4 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-[#FF8800]/50 rounded-2xl transition-all duration-200 backdrop-blur-sm"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-32 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-8">
          
          {/* Carrousel publicitaire premium */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#FF8800] to-[#FFCC00]">
                  <Star className="h-4 w-4 text-white" fill="white" />
                </div>
                À la Une
              </h2>
              <div className="flex gap-1.5">
                {featuredItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      currentIndex === index 
                        ? "w-8 bg-gradient-to-r from-[#FF8800] to-[#FFCC00]" 
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>

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
                  className="relative min-w-[320px] h-[220px] rounded-3xl overflow-hidden snap-start cursor-pointer group"
                  onClick={() => {
                    if (item.type === 'lieu') router.push('/home/explorer/site-touristique');
                    else if (item.type === 'evenement') router.push('/home/explorer/evenements');
                    else if (item.type === 'hebergement') router.push('/home/explorer/hebergement');
                    else if (item.type === 'restaurant') router.push('/home/explorer/restauration');
                  }}
                >
                  {/* Image avec effet parallax */}
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Overlay gradient premium */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  
                  {/* Badge rating flottant */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    <Star className="h-3.5 w-3.5 text-[#FFCC00]" fill="#FFCC00" />
                    <span className="text-sm font-bold text-white">{item.rating}</span>
                  </div>

                  {/* Bouton action */}
                  <div className="absolute top-4 right-4">
                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="font-bold text-xl mb-1.5 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-1">{item.subtitle}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <LocationIcon className="h-3.5 w-3.5" />
                        <span>{item.location}</span>
                      </div>
                      {item.price && (
                        <span className="text-sm font-bold bg-gradient-to-r from-[#FF8800] to-[#FFCC00] bg-clip-text text-transparent">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section Catégories avec design moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Catégories</h2>
              <span className="text-xs text-gray-400">{filteredCategories.length} services</span>
            </div>

            <AnimatePresence mode="wait">
              {filteredCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-lg text-white mb-2">Aucun résultat</p>
                    <p className="text-sm text-gray-400">Essayez avec d'autres mots-clés</p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group cursor-pointer"
                        onClick={() => handleCategoryClick(category.route)}
                      >
                        <div className={cn(
                          "relative overflow-hidden rounded-3xl p-5 min-h-[150px]",
                          "bg-gradient-to-br",
                          category.gradient,
                          "shadow-lg",
                          "transition-all duration-300",
                          "hover:scale-105 hover:shadow-2xl",
                          "active:scale-95"
                        )}
                        style={{
                          boxShadow: `0 10px 30px ${category.color}40`
                        }}>
                          {/* Effet de brillance */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Pattern de fond */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-2xl" />
                          </div>

                          {/* Contenu */}
                          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
                            {/* Icône avec fond blanc */}
                            <div className="p-4 rounded-2xl bg-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                              <Icon 
                                className="h-10 w-10 transition-transform duration-300" 
                                style={{ color: category.color }}
                              />
                            </div>

                            {/* Nom */}
                            <h3 className="text-white font-bold text-center text-sm leading-tight drop-shadow-lg">
                              {category.name}
                            </h3>
                          </div>

                          {/* Indicateur de clic */}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                            <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm">
                              <ArrowRight className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
