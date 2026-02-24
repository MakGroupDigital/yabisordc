'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { UtensilsCrossed, ArrowLeft, ChevronLeft, ChevronRight, MapPin, Star, Clock, Truck, Phone, MessageCircle, Navigation, Filter, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NavigationModal, NavigationDestination } from '@/components/navigation/navigation-modal';
import { shareItem, clearSharedItem } from '@/lib/share-utils';

interface Restaurant {
  id: string;
  nom: string;
  description: string;
  cuisine: string;
  ville: string;
  province: string;
  adresse: string;
  note: number;
  nombreAvis: number;
  tempsLivraison: number;
  livre: boolean;
  images: string[];
  telephone?: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    nom: 'Restaurant Le Roi',
    description: 'Cuisine congolaise authentique avec des plats traditionnels préparés avec amour. Ambiance chaleureuse et accueillante.',
    cuisine: 'Congolaise',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Avenue Kasa-Vubu',
    note: 4.5,
    nombreAvis: 128,
    tempsLivraison: 30,
    livre: true,
    telephone: '+243 900 005 100',
    whatsapp: '+243900005100',
    latitude: -4.3276,
    longitude: 15.3136,
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-3677a3c9d74c?w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    ],
  },
  {
    id: '2',
    nom: 'La Terrasse',
    description: 'Cuisine internationale et locale dans un cadre moderne. Menu varié pour tous les goûts.',
    cuisine: 'Mixte',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Boulevard du 30 juin',
    note: 4.2,
    nombreAvis: 95,
    tempsLivraison: 45,
    livre: true,
    telephone: '+243 900 005 101',
    whatsapp: '+243900005101',
    latitude: -4.3300,
    longitude: 15.3150,
    images: [
      'https://images.unsplash.com/photo-1555396273-3677a3c9d74c?w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    ],
  },
  {
    id: '3',
    nom: 'Mbote Restaurant',
    description: 'Spécialités congolaises traditionnelles préparées avec des ingrédients frais. Service exceptionnel.',
    cuisine: 'Congolaise',
    ville: 'Lubumbashi',
    province: 'Haut-Katanga',
    adresse: 'Avenue Lumumba',
    note: 4.7,
    nombreAvis: 156,
    tempsLivraison: 35,
    livre: true,
    telephone: '+243 900 005 102',
    whatsapp: '+243900005102',
    latitude: -11.6642,
    longitude: 27.4794,
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-3677a3c9d74c?w=800&q=80',
    ],
  },
  {
    id: '4',
    nom: 'Pizza Express',
    description: 'Pizzas et plats italiens authentiques. Pâte fraîche préparée quotidiennement.',
    cuisine: 'Italienne',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Gombe',
    note: 4.0,
    nombreAvis: 67,
    tempsLivraison: 25,
    livre: true,
    telephone: '+243 900 005 103',
    whatsapp: '+243900005103',
    latitude: -4.3200,
    longitude: 15.3100,
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-3677a3c9d74c?w=800&q=80',
    ],
  },
  {
    id: '5',
    nom: 'Restaurant Nganda',
    description: 'Cuisine congolaise et poisson frais du lac. Spécialités de la région du Kivu.',
    cuisine: 'Congolaise',
    ville: 'Goma',
    province: 'Nord-Kivu',
    adresse: 'Avenue de la Paix',
    note: 4.4,
    nombreAvis: 89,
    tempsLivraison: 40,
    livre: false,
    telephone: '+243 900 005 104',
    whatsapp: '+243900005104',
    latitude: -1.6792,
    longitude: 29.2228,
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    ],
  },
];

const villes = ['Toutes', 'Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani'];
export const dynamic = 'force-dynamic';

const provinces = ['Toutes', 'Kinshasa', 'Haut-Katanga', 'Nord-Kivu', 'Tshopo'];
const cuisines = ['Toutes', 'Congolaise', 'Mixte', 'Italienne', 'Française'];

function RestaurationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    livre: false,
    cuisine: 'Toutes',
    ville: 'Toutes',
    province: 'Toutes',
  });
  const [currentImages, setCurrentImages] = useState<Record<string, number>>({});
  const [isScrolling, setIsScrolling] = useState<Record<string, boolean>>({});
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Navigation
  const [navigationDestination, setNavigationDestination] = useState<NavigationDestination | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  
  // Deep links
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Gérer les deep links
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      clearSharedItem();
      
      setTimeout(() => {
        const element = document.getElementById(`restaurant-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
    }
  }, [searchParams]);

  useEffect(() => {
    const initial: Record<string, number> = {};
    restaurants.forEach(restaurant => {
      initial[restaurant.id] = 0;
    });
    setCurrentImages(initial);
  }, []);

  useEffect(() => {
    restaurants.forEach(restaurant => {
      if (restaurant.images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImages(prev => ({
          ...prev,
          [restaurant.id]: ((prev[restaurant.id] || 0) + 1) % restaurant.images.length,
        }));
      }, 4000);

      return () => clearInterval(interval);
    });
  }, []);

  const scrollToImage = (restaurantId: string, index: number) => {
    const container = scrollRefs.current[restaurantId];
    if (!container) return;

    const imageWidth = container.clientWidth;
    container.scrollTo({
      left: imageWidth * index,
      behavior: 'smooth',
    });
    setCurrentImages(prev => ({ ...prev, [restaurantId]: index }));
  };

  const handleTouchStart = (restaurantId: string) => {
    setIsScrolling(prev => ({ ...prev, [restaurantId]: true }));
  };

  const handleTouchEnd = (restaurantId: string) => {
    setIsScrolling(prev => ({ ...prev, [restaurantId]: false }));
  };

  const handleScroll = (restaurantId: string) => {
    if (isScrolling[restaurantId]) return;
    
    const container = scrollRefs.current[restaurantId];
    if (!container) return;

    const imageWidth = container.clientWidth;
    const currentIndex = Math.round(container.scrollLeft / imageWidth);
    setCurrentImages(prev => ({ ...prev, [restaurantId]: currentIndex }));
  };

  const nextImage = (restaurantId: string, maxImages: number) => {
    setCurrentImages(prev => {
      const next = ((prev[restaurantId] || 0) + 1) % maxImages;
      scrollToImage(restaurantId, next);
      return { ...prev, [restaurantId]: next };
    });
  };

  const prevImage = (restaurantId: string, maxImages: number) => {
    setCurrentImages(prev => {
      const prevIndex = ((prev[restaurantId] || 0) - 1 + maxImages) % maxImages;
      scrollToImage(restaurantId, prevIndex);
      return { ...prev, [restaurantId]: prevIndex };
    });
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLivre = !filters.livre || restaurant.livre;
    const matchesCuisine = filters.cuisine === 'Toutes' || restaurant.cuisine === filters.cuisine;
    const matchesVille = filters.ville === 'Toutes' || restaurant.ville === filters.ville;
    const matchesProvince = filters.province === 'Toutes' || restaurant.province === filters.province;

    return matchesSearch && matchesLivre && matchesCuisine && matchesVille && matchesProvince;
  });

  const resetFilters = () => {
    setFilters({
      livre: false,
      cuisine: 'Toutes',
      ville: 'Toutes',
      province: 'Toutes',
    });
  };

  const hasActiveFilters = filters.livre || 
    filters.cuisine !== 'Toutes' || 
    filters.ville !== 'Toutes' || 
    filters.province !== 'Toutes';

  const handleAppeler = (telephone: string, nom: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${nom}`,
    });
  };

  const handleWhatsApp = (whatsapp: string, nom: string) => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre restaurant ${nom}.`);
    const url = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
    toast({
      title: "WhatsApp ouvert",
      description: `Discussion avec ${nom}`,
    });
  };

  const handleItineraire = (restaurant: Restaurant) => {
    if (!restaurant.latitude || !restaurant.longitude) {
      toast({
        title: "Itinéraire indisponible",
        description: "Les coordonnées de ce restaurant ne sont pas disponibles",
        variant: "destructive",
      });
      return;
    }
    
    setNavigationDestination({
      id: restaurant.id,
      nom: restaurant.nom,
      adresse: `${restaurant.adresse}, ${restaurant.ville}`,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      telephone: restaurant.telephone,
      type: 'restaurant',
    });
    setShowNavigation(true);
  };

  const handleShare = async (restaurant: Restaurant) => {
    const result = await shareItem('restaurant', restaurant.id, restaurant.nom, `${restaurant.cuisine} - ${restaurant.ville}`);
    if (result.success) {
      toast({
        title: result.method === 'native' ? "Partagé !" : "Lien copié !",
        description: result.method === 'native' 
          ? `${restaurant.nom} a été partagé` 
          : "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-[#FF8800]/20">
                <UtensilsCrossed className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Restauration</h1>
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-800 relative"
                >
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF8800] rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] bg-gray-900 border-gray-800 text-white">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold">Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-white font-semibold">Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="livre"
                        checked={filters.livre}
                        onCheckedChange={(checked) => setFilters({ ...filters, livre: checked as boolean })}
                        className="border-gray-700 data-[state=checked]:bg-[#FF8800] data-[state=checked]:border-[#FF8800]"
                      />
                      <label htmlFor="livre" className="text-sm font-medium text-white flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Livraison disponible
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white font-semibold">Type de cuisine</Label>
                    <Select value={filters.cuisine} onValueChange={(value) => setFilters({ ...filters, cuisine: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Toutes les cuisines" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {cuisines.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine} className="hover:bg-gray-700">
                            {cuisine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white font-semibold">Ville</Label>
                    <Select value={filters.ville} onValueChange={(value) => setFilters({ ...filters, ville: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Toutes les villes" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {villes.map((ville) => (
                          <SelectItem key={ville} value={ville} className="hover:bg-gray-700">
                            {ville}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white font-semibold">Province</Label>
                    <Select value={filters.province} onValueChange={(value) => setFilters({ ...filters, province: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Toutes les provinces" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province} className="hover:bg-gray-700">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                    >
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="mt-3">
            <Input
              type="text"
              placeholder="Rechercher un restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-32 pb-32">
        <div className="space-y-0">
          {filteredRestaurants.length === 0 ? (
            <Card className="bg-black border-b border-gray-800 rounded-none">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 mb-4">Aucun restaurant trouvé</p>
                {hasActiveFilters && (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                id={`restaurant-${restaurant.id}`}
                className={`bg-black border-b border-gray-800 rounded-none transition-all duration-500 ${
                  highlightedId === restaurant.id 
                    ? 'ring-2 ring-[#FF8800] ring-offset-2 ring-offset-black scale-[1.02]' 
                    : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8800] to-[#FF6600] flex items-center justify-center text-white font-bold">
                      {restaurant.nom.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">{restaurant.nom}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{restaurant.ville}</span>
                        {restaurant.livre && (
                          <>
                            <span>•</span>
                            <Truck className="h-3 w-3 text-[#FF8800]" />
                            <span className="text-[#FF8800]">Livraison</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={() => handleShare(restaurant)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-semibold">{restaurant.note}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                    <div
                      ref={(el) => { scrollRefs.current[restaurant.id] = el; }}
                      className="flex overflow-x-scroll scrollbar-hide snap-x snap-mandatory scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onTouchStart={() => handleTouchStart(restaurant.id)}
                      onTouchEnd={() => handleTouchEnd(restaurant.id)}
                      onScroll={() => handleScroll(restaurant.id)}
                    >
                      {restaurant.images.map((image, index) => (
                        <div key={index} className="relative min-w-full h-full snap-start">
                          <Image
                            src={image}
                            alt={`${restaurant.nom} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {restaurant.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                          onClick={() => prevImage(restaurant.id, restaurant.images.length)}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                          onClick={() => nextImage(restaurant.id, restaurant.images.length)}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {restaurant.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => scrollToImage(restaurant.id, index)}
                              className={`h-1.5 rounded-full transition-all ${
                                (currentImages[restaurant.id] || 0) === index
                                  ? 'w-6 bg-white'
                                  : 'w-1.5 bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="px-4 py-3 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-sm font-semibold">{restaurant.note}</span>
                          <span className="text-gray-500 text-xs">({restaurant.nombreAvis})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{restaurant.tempsLivraison} min</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-[#FF8800]/20 text-[#FF8800]">
                          {restaurant.cuisine}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">{restaurant.nom}</p>
                      <p className="text-gray-300 text-sm mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>{restaurant.adresse}, {restaurant.ville}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {restaurant.latitude && restaurant.longitude && (
                        <Button
                          onClick={() => handleItineraire(restaurant)}
                          variant="outline"
                          className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 text-xs"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Itinéraire
                        </Button>
                      )}
                      {restaurant.telephone && (
                        <Button
                          onClick={() => handleAppeler(restaurant.telephone!, restaurant.nom)}
                          variant="outline"
                          className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 text-xs"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Appeler
                        </Button>
                      )}
                      {restaurant.whatsapp && (
                        <Button
                          onClick={() => handleWhatsApp(restaurant.whatsapp!, restaurant.nom)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de navigation */}
      <NavigationModal
        destination={navigationDestination}
        isOpen={showNavigation}
        onClose={() => setShowNavigation(false)}
        accentColor="#FF8800"
        destinationType="restaurant"
      />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default function RestaurationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <RestaurationPageContent />
    </Suspense>
  );
}
