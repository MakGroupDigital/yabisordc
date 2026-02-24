'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Package, ArrowLeft, Navigation, MapPin, Star, Phone, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Livreur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  note: number;
  nombreAvis: number;
  distance: number;
  latitude: number;
  longitude: number;
  disponible: boolean;
  vehicule: string;
  avatar?: string;
}

const livreurs: Livreur[] = [
  {
    id: '1',
    nom: 'Kasa',
    prenom: 'Pierre',
    telephone: '+243 900 000 100',
    note: 4.8,
    nombreAvis: 234,
    distance: 2.5,
    latitude: -4.4419,
    longitude: 15.2663,
    disponible: true,
    vehicule: 'Moto',
  },
  {
    id: '2',
    nom: 'Mukendi',
    prenom: 'Marc',
    telephone: '+243 900 000 101',
    note: 4.6,
    nombreAvis: 156,
    distance: 5.2,
    latitude: -4.4450,
    longitude: 15.2700,
    disponible: true,
    vehicule: 'Voiture',
  },
  {
    id: '3',
    nom: 'Nzuzi',
    prenom: 'Paul',
    telephone: '+243 900 000 102',
    note: 4.9,
    nombreAvis: 312,
    distance: 1.8,
    latitude: -4.4400,
    longitude: 15.2650,
    disponible: true,
    vehicule: 'Moto',
  },
  {
    id: '4',
    nom: 'Kalala',
    prenom: 'Thomas',
    telephone: '+243 900 000 103',
    note: 4.5,
    nombreAvis: 89,
    distance: 8.5,
    latitude: -4.4500,
    longitude: 15.2750,
    disponible: false,
    vehicule: 'Voiture',
  },
];

export default function LivreurPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nearbyLivreurs, setNearbyLivreurs] = useState<Livreur[]>([]);
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dRWTtaQf0YgGMg&center=-4.4419,15.2663&zoom=12&maptype=roadmap');

  // Filtrer les livreurs
  const filteredLivreurs = searchQuery
    ? livreurs.filter(livreur =>
        `${livreur.prenom} ${livreur.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        livreur.vehicule.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : livreurs;

  const requestLocationPermission = () => {
    setShowLocationDialog(true);
  };

  const handleLocationPermission = async () => {
    setIsRequestingLocation(true);
    setShowLocationDialog(false);

    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        // Trouver les livreurs proches (dans un rayon de 10km)
        const nearby = livreurs.filter(livreur => {
          const distance = calculateDistance(lat, lng, livreur.latitude, livreur.longitude);
          livreur.distance = distance;
          return distance <= 10 && livreur.disponible; // 10 km
        }).sort((a, b) => a.distance - b.distance);

        setNearbyLivreurs(nearby);
        setShowMap(true);

        // Mettre à jour la carte pour afficher les livreurs proches
        const centerLat = nearby.length > 0 ? nearby[0].latitude : lat;
        const centerLng = nearby.length > 0 ? nearby[0].longitude : lng;
        const url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dRWTtaQf0YgGMg&center=${centerLat},${centerLng}&zoom=13&maptype=roadmap`;
        setMapUrl(url);

        if (nearby.length > 0) {
          toast({
            title: "Livreurs proches trouvés",
            description: `${nearby.length} livreur(s) disponible(s) près de vous`,
          });
        } else {
          toast({
            title: "Aucun livreur proche",
            description: "Aucun livreur disponible dans un rayon de 10km",
          });
        }

        setIsRequestingLocation(false);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible d'accéder à votre position. Vérifiez les permissions.",
          variant: "destructive",
        });
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCall = (telephone: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${telephone}`,
    });
  };

  const displayLivreurs = showMap && nearbyLivreurs.length > 0 ? nearbyLivreurs : filteredLivreurs;

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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF8800]/20">
                <Package className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Livreur</h1>
            </div>
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
                placeholder="Rechercher un livreur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={requestLocationPermission}
                variant="outline"
                className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                disabled={isRequestingLocation}
              >
                {isRequestingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Voir les livreurs proches de moi
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Carte (affichée seulement si on a demandé les livreurs proches) */}
          {showMap && nearbyLivreurs.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full h-[300px]">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'brightness(0.8) contrast(1.2)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                  {/* Overlay pour personnaliser la carte avec notre charte */}
                  <div className="absolute top-2 right-2 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Ya Biso RDC
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des livreurs */}
          <div className="space-y-3">
            {showMap && nearbyLivreurs.length > 0 && (
              <h2 className="text-white font-semibold text-lg">Livreurs proches de vous</h2>
            )}
            {displayLivreurs.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">Aucun livreur trouvé</p>
                </CardContent>
              </Card>
            ) : (
              displayLivreurs.map((livreur) => (
                <Card
                  key={livreur.id}
                  className={`bg-gray-900/50 border-gray-800 ${
                    !livreur.disponible ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16 border-2 border-[#FF8800]">
                        <AvatarImage src={livreur.avatar} alt={`${livreur.prenom} ${livreur.nom}`} />
                        <AvatarFallback className="bg-[#FF8800] text-white font-semibold">
                          {livreur.prenom.charAt(0)}{livreur.nom.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {livreur.prenom} {livreur.nom}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <Package className="h-3 w-3" />
                              <span>{livreur.vehicule}</span>
                              {livreur.distance && (
                                <>
                                  <span>•</span>
                                  <span>{livreur.distance.toFixed(1)} km</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-[#FFCC00] fill-[#FFCC00]" />
                            <span className="text-white text-sm font-semibold">{livreur.note}</span>
                            <span className="text-gray-500 text-xs">({livreur.nombreAvis})</span>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="mb-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              livreur.disponible
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {livreur.disponible ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>

                        {/* Bouton d'action */}
                        <Button
                          onClick={() => handleCall(livreur.telephone)}
                          disabled={!livreur.disponible}
                          className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Appeler
                        </Button>
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
              Pour trouver les livreurs près de vous, nous avons besoin d'accéder à votre position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">Votre confidentialité</p>
                  <p className="text-gray-300 text-xs">
                    Votre position ne sera utilisée que pour trouver les livreurs proches. 
                    Nous ne stockons pas cette information.
                  </p>
                </div>
              </div>
            </div>

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
