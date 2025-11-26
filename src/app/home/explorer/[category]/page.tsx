'use client';

import { Header } from "@/components/home/feed-header";
import { BottomNav } from "@/components/home/bottom-nav";
import { useParams, useRouter } from "next/navigation";
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
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  Star,
  MapPin as MapPinIcon,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RestaurantList } from "@/components/explorer/restaurant-list";
import { HotelList } from "@/components/explorer/hotel-list";
import { GuideList } from "@/components/explorer/guide-list";
import { ChauffeurList } from "@/components/explorer/chauffeur-list";
import { TraducteurList } from "@/components/explorer/traducteur-list";
import { EventList } from "@/components/explorer/event-list";
import { TransportList } from "@/components/explorer/transport-list";
import { SiteTouristiqueList } from "@/components/explorer/site-touristique-list";
import { ShoppingList } from "@/components/explorer/shopping-list";
import { CultureList } from "@/components/explorer/culture-list";
import { NatureList } from "@/components/explorer/nature-list";
import { PlageList } from "@/components/explorer/plage-list";
import { MonumentList } from "@/components/explorer/monument-list";
import { ActiviteList } from "@/components/explorer/activite-list";

// Layout spécifique selon le type de catégorie
const getCategoryLayout = (categoryId: string): 'card-horizontal' | 'card-compact' | 'card-featured' | 'card-standard' => {
  switch (categoryId) {
    case 'restaurant':
    case 'hotel':
    case 'site-touristique':
      return 'card-horizontal'; // Image à gauche, contenu à droite
    case 'chauffeur':
    case 'traducteur':
    case 'guide':
      return 'card-compact'; // Layout compact pour les services
    case 'evenement':
    case 'activite':
      return 'card-featured'; // Layout avec image en haut
    default:
      return 'card-standard'; // Layout standard
  }
};

type CategoryInfo = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  placeholder: string;
};

const categoryMap: Record<string, CategoryInfo> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    icon: UtensilsCrossed,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10',
    description: 'Découvrez les meilleurs restaurants de la RDC',
    placeholder: 'Rechercher un restaurant...'
  },
  hotel: {
    id: 'hotel',
    name: 'Hôtel',
    icon: Hotel,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10',
    description: 'Trouvez l\'hôtel parfait pour votre séjour',
    placeholder: 'Rechercher un hôtel...'
  },
  chauffeur: {
    id: 'chauffeur',
    name: 'Chauffeur',
    icon: Car,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10',
    description: 'Réservez un chauffeur professionnel',
    placeholder: 'Rechercher un chauffeur...'
  },
  traducteur: {
    id: 'traducteur',
    name: 'Traducteur',
    icon: Languages,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10',
    description: 'Trouvez un traducteur professionnel',
    placeholder: 'Rechercher un traducteur...'
  },
  guide: {
    id: 'guide',
    name: 'Guide',
    icon: MapPin,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10',
    description: 'Explorez avec un guide local expérimenté',
    placeholder: 'Rechercher un guide...'
  },
  'site-touristique': {
    id: 'site-touristique',
    name: 'Site Touristique',
    icon: Camera,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10',
    description: 'Visitez les sites touristiques incontournables',
    placeholder: 'Rechercher un site...'
  },
  evenement: {
    id: 'evenement',
    name: 'Événement',
    icon: Calendar,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10',
    description: 'Découvrez les événements à venir',
    placeholder: 'Rechercher un événement...'
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10',
    description: 'Trouvez les meilleures boutiques et marchés',
    placeholder: 'Rechercher une boutique...'
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    icon: Plane,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10',
    description: 'Réservez votre moyen de transport',
    placeholder: 'Rechercher un transport...'
  },
  culture: {
    id: 'culture',
    name: 'Culture',
    icon: Music,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10',
    description: 'Explorez la riche culture de la RDC',
    placeholder: 'Rechercher un lieu culturel...'
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    icon: Mountain,
    color: 'text-[#339966]',
    bgColor: 'bg-[#339966]/10',
    description: 'Découvrez les merveilles naturelles',
    placeholder: 'Rechercher un site naturel...'
  },
  plage: {
    id: 'plage',
    name: 'Plage',
    icon: Waves,
    color: 'text-[#FFCC00]',
    bgColor: 'bg-[#FFCC00]/10',
    description: 'Profitez des plus belles plages',
    placeholder: 'Rechercher une plage...'
  },
  monument: {
    id: 'monument',
    name: 'Monument',
    icon: Building2,
    color: 'text-[#FF8800]',
    bgColor: 'bg-[#FF8800]/10',
    description: 'Visitez les monuments historiques',
    placeholder: 'Rechercher un monument...'
  },
  activite: {
    id: 'activite',
    name: 'Activité',
    icon: Sparkles,
    color: 'text-[#003366]',
    bgColor: 'bg-[#003366]/10',
    description: 'Trouvez des activités passionnantes',
    placeholder: 'Rechercher une activité...'
  },
};

// Données d'exemple (à remplacer par des données Firebase)
const getMockData = (categoryId: string) => {
  switch (categoryId) {
    case 'restaurant':
      return [
        {
          id: '1',
          nom: 'Restaurant Le Paradis',
          description: 'Cuisine locale et internationale dans un cadre chaleureux',
          images: ['https://placehold.co/400x300'],
          prix: 25000,
          ville: 'Kinshasa',
          rating: 4.5,
          phone: '+243 900 000 000',
          horaires: 'Lun-Dim: 10h-22h',
          specialites: ['Cuisine locale', 'Internationale']
        },
      ];
    case 'hotel':
      return [
        {
          id: '1',
          nom: 'Hôtel Grand Kinshasa',
          description: 'Hôtel 5 étoiles au cœur de la capitale',
          images: ['https://placehold.co/400x300'],
          prix: 150000,
          ville: 'Kinshasa',
          rating: 4.8,
          stars: 5,
          phone: '+243 900 000 001',
          disponibilite: true,
          services: ['WiFi', 'Parking', 'Restaurant', 'Piscine']
        },
      ];
    case 'guide':
      return [
        {
          id: '1',
          nom: 'Jean Kabila',
          description: 'Guide expérimenté spécialisé dans l\'histoire de la RDC',
          photo: 'https://placehold.co/100x100',
          ville: 'Kinshasa',
          rating: 4.9,
          phone: '+243 900 000 002',
          langues: ['Français', 'Lingala', 'Anglais'],
          experience: '10 ans d\'expérience',
          specialites: ['Histoire', 'Culture', 'Nature'],
          prix: 50000
        },
      ];
    case 'chauffeur':
      return [
        {
          id: '1',
          nom: 'Pierre Mwamba',
          description: 'Chauffeur professionnel avec véhicule confortable',
          photo: 'https://placehold.co/100x100',
          ville: 'Kinshasa',
          rating: 4.7,
          phone: '+243 900 000 003',
          vehicule: 'Toyota Land Cruiser',
          disponible: true,
          tarifBase: 30000,
          tarifKm: 2000,
          experience: '8 ans d\'expérience'
        },
      ];
    case 'traducteur':
      return [
        {
          id: '1',
          nom: 'Marie Tshisekedi',
          description: 'Traductrice certifiée en plusieurs langues',
          photo: 'https://placehold.co/100x100',
          rating: 4.8,
          phone: '+243 900 000 004',
          langues: ['Français', 'Anglais', 'Swahili', 'Lingala'],
          specialites: ['Juridique', 'Médical', 'Commercial'],
          tarifHoraire: 15000,
          experience: 'Certifiée'
        },
      ];
    case 'evenement':
      return [
        {
          id: '1',
          nom: 'Festival de Musique',
          description: 'Grand festival de musique congolaise',
          images: ['https://placehold.co/400x300'],
          ville: 'Kinshasa',
          date: new Date('2024-12-25'),
          heure: '18h00',
          prix: 10000,
          placesDisponibles: 500,
          type: 'Concert',
          organisateur: 'Association Culturelle'
        },
      ];
    case 'transport':
      return [
        {
          id: '1',
          nom: 'Taxi Express',
          type: 'taxi' as const,
          ville: 'Kinshasa',
          disponible: true,
          phone: '+243 900 000 005',
          tarifBase: 5000,
          tarifKm: 1000,
          rating: 4.6,
          tempsArrivee: '5 min'
        },
      ];
    default:
      return [
        {
          id: '1',
          nom: 'Exemple',
          description: 'Description de l\'exemple',
          images: ['https://placehold.co/400x300'],
          prix: 0,
          ville: 'Kinshasa',
          rating: 4.5
        },
      ];
  }
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;
  const category = categoryMap[categoryId];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setPlaces(getMockData(categoryId));
      setLoading(false);
    }, 500);
  }, [categoryId]);

  if (!category) {
    return (
      <div className="flex h-full flex-col bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto pb-24 pt-32">
          <div className="container mx-auto max-w-2xl px-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500">Catégorie non trouvée</p>
                <Button onClick={() => router.push('/home/explorer')} className="mt-4">
                  Retour à l'explorateur
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const Icon = category.icon;
  const layoutType = getCategoryLayout(categoryId);
  const filteredPlaces = places.filter(place =>
    place.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.ville.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          {/* En-tête avec retour */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/home/explorer')}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("rounded-2xl p-4", category.bgColor)}>
                <Icon className={cn("h-10 w-10", category.color)} />
              </div>
              <div>
                <h1 className="text-3xl font-headline font-bold text-[#003366]">
                  {category.name}
                </h1>
                <p className="text-gray-600 mt-1 font-body">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={category.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-[#FF8800]/10">
                <Filter className="h-3 w-3 mr-1" />
                Tous
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-[#FF8800]/10">
                Kinshasa
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-[#FF8800]/10">
                Goma
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-[#FF8800]/10">
                Lubumbashi
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-[#FF8800]/10">
                Moanda
              </Badge>
            </div>
          </div>

          {/* Liste des lieux avec layout adapté selon la catégorie */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className={cn("rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center", category.bgColor)}>
                  <Icon className={cn("h-12 w-12", category.color)} />
                </div>
                <h3 className="text-xl font-headline font-semibold text-[#003366] mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 font-body mb-4">
                  {searchQuery 
                    ? `Aucun résultat pour "${searchQuery}"`
                    : `Aucun ${category.name.toLowerCase()} disponible pour le moment`
                  }
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Effacer la recherche
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div>
              {categoryId === 'restaurant' && (
                <RestaurantList
                  restaurants={filteredPlaces}
                  onRestaurantClick={(id) => console.log('Restaurant:', id)}
                />
              )}
              {categoryId === 'hotel' && (
                <HotelList
                  hotels={filteredPlaces}
                  onHotelClick={(id) => console.log('Hotel:', id)}
                />
              )}
              {categoryId === 'guide' && (
                <GuideList
                  guides={filteredPlaces}
                  onGuideClick={(id) => console.log('Guide:', id)}
                />
              )}
              {categoryId === 'chauffeur' && (
                <ChauffeurList
                  chauffeurs={filteredPlaces}
                  onChauffeurClick={(id) => console.log('Chauffeur:', id)}
                />
              )}
              {categoryId === 'traducteur' && (
                <TraducteurList
                  traducteurs={filteredPlaces}
                  onTraducteurClick={(id) => console.log('Traducteur:', id)}
                />
              )}
              {categoryId === 'evenement' && (
                <EventList
                  events={filteredPlaces}
                  onEventClick={(id) => console.log('Event:', id)}
                />
              )}
              {categoryId === 'transport' && (
                <TransportList
                  transports={filteredPlaces}
                  onTransportClick={(id) => console.log('Transport:', id)}
                />
              )}
              {categoryId === 'site-touristique' && (
                <SiteTouristiqueList
                  sites={filteredPlaces}
                  onSiteClick={(id) => console.log('Site:', id)}
                />
              )}
              {categoryId === 'shopping' && (
                <ShoppingList
                  boutiques={filteredPlaces}
                  onBoutiqueClick={(id) => console.log('Boutique:', id)}
                />
              )}
              {categoryId === 'culture' && (
                <CultureList
                  lieux={filteredPlaces}
                  onLieuClick={(id) => console.log('Lieu culturel:', id)}
                />
              )}
              {categoryId === 'nature' && (
                <NatureList
                  sites={filteredPlaces}
                  onSiteClick={(id) => console.log('Site nature:', id)}
                />
              )}
              {categoryId === 'plage' && (
                <PlageList
                  plages={filteredPlaces}
                  onPlageClick={(id) => console.log('Plage:', id)}
                />
              )}
              {categoryId === 'monument' && (
                <MonumentList
                  monuments={filteredPlaces}
                  onMonumentClick={(id) => console.log('Monument:', id)}
                />
              )}
              {categoryId === 'activite' && (
                <ActiviteList
                  activites={filteredPlaces}
                  onActiviteClick={(id) => console.log('Activité:', id)}
                />
              )}
            </div>
          )}

          {/* Message si aucun résultat */}
          {!loading && filteredPlaces.length > 0 && (
            <div className="mt-6 text-center text-gray-500 text-sm font-body">
              {filteredPlaces.length} {category.name.toLowerCase()}(s) trouvé(s)
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

