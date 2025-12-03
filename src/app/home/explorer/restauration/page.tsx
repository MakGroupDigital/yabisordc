'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { UtensilsCrossed, ArrowLeft, Filter, X, MapPin, Navigation, Star, Clock, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  image?: string;
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    nom: 'Restaurant Le Roi',
    description: 'Cuisine congolaise authentique',
    cuisine: 'Congolaise',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Avenue Kasa-Vubu',
    note: 4.5,
    nombreAvis: 128,
    tempsLivraison: 30,
    livre: true,
  },
  {
    id: '2',
    nom: 'La Terrasse',
    description: 'Cuisine internationale et locale',
    cuisine: 'Mixte',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Boulevard du 30 juin',
    note: 4.2,
    nombreAvis: 95,
    tempsLivraison: 45,
    livre: true,
  },
  {
    id: '3',
    nom: 'Mbote Restaurant',
    description: 'Spécialités congolaises traditionnelles',
    cuisine: 'Congolaise',
    ville: 'Lubumbashi',
    province: 'Haut-Katanga',
    adresse: 'Avenue Lumumba',
    note: 4.7,
    nombreAvis: 156,
    tempsLivraison: 35,
    livre: true,
  },
  {
    id: '4',
    nom: 'Pizza Express',
    description: 'Pizzas et plats italiens',
    cuisine: 'Italienne',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    adresse: 'Gombe',
    note: 4.0,
    nombreAvis: 67,
    tempsLivraison: 25,
    livre: true,
  },
  {
    id: '5',
    nom: 'Restaurant Nganda',
    description: 'Cuisine congolaise et poisson frais',
    cuisine: 'Congolaise',
    ville: 'Goma',
    province: 'Nord-Kivu',
    adresse: 'Avenue de la Paix',
    note: 4.4,
    nombreAvis: 89,
    tempsLivraison: 40,
    livre: false,
  },
];

const villes = ['Toutes', 'Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani'];
const provinces = ['Toutes', 'Kinshasa', 'Haut-Katanga', 'Nord-Kivu', 'Tshopo'];
const cuisines = ['Toutes', 'Congolaise', 'Mixte', 'Italienne', 'Française'];

export default function RestaurationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    livre: false,
    cuisine: 'Toutes',
    ville: 'Toutes',
    province: 'Toutes',
  });
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filtrer les restaurants
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

  const requestLocationPermission = () => {
    setShowLocationDialog(true);
  };

  const handleLocationPermission = async () => {
    setShowLocationDialog(false);

    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        toast({
          title: "Localisation obtenue",
          description: "Affichage des restaurants proches de vous",
        });
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible d'accéder à votre position. Vérifiez les permissions.",
          variant: "destructive",
        });
      }
    );
  };

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
                  {/* Livraison */}
                  <div className="space-y-3">
                    <Label className="text-white font-semibold">Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="livre"
                        checked={filters.livre}
                        onCheckedChange={(checked) => setFilters({ ...filters, livre: checked as boolean })}
                        className="border-gray-700 data-[state=checked]:bg-[#FF8800] data-[state=checked]:border-[#FF8800]"
                      />
                      <label
                        htmlFor="livre"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Livraison disponible
                      </label>
                    </div>
                  </div>

                  {/* Cuisine */}
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

                  {/* Ville */}
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

                  {/* Province */}
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

                  {/* Boutons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 mr-2" />
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
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {/* Barre de recherche et bouton proche */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 space-y-3">
              <Input
                type="text"
                placeholder="Rechercher un restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={requestLocationPermission}
                variant="outline"
                className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Trouver un restaurant proche de moi
              </Button>
            </CardContent>
          </Card>

          {/* Liste des restaurants */}
          <div className="space-y-3">
            {filteredRestaurants.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">Aucun restaurant trouvé</p>
                  {hasActiveFilters && (
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="mt-4 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold text-lg">{restaurant.nom}</h3>
                          {restaurant.livre && (
                            <div className="flex items-center gap-1 text-[#FF8800]">
                              <Truck className="h-4 w-4" />
                              <span className="text-xs">Livraison</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{restaurant.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {restaurant.adresse}
                          </span>
                          <span>{restaurant.ville}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-[#FFCC00] fill-[#FFCC00]" />
                            <span className="text-white text-sm font-semibold">{restaurant.note}</span>
                            <span className="text-gray-500 text-xs">({restaurant.nombreAvis})</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            {restaurant.tempsLivraison} min
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-[#FF8800]/20 text-[#FF8800]">
                            {restaurant.cuisine}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog pour demander la permission de localisation */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Partager votre localisation</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pour trouver les restaurants près de vous, nous avons besoin d'accéder à votre position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLocationPermission}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg font-semibold"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Autoriser l'accès à la localisation
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLocationDialog(false)}
                className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 h-12"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
