'use client';

import { useState, useEffect, useMemo } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { MapPin, ArrowLeft, Search, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TouristSite {
  id: string;
  nom: string;
  description: string;
  latitude: number;
  longitude: number;
  ville: string;
  province: string;
  image?: string;
}

// Sites touristiques de la RDC
const sitesTouristiques: TouristSite[] = [
  {
    id: '1',
    nom: 'Parc National des Virunga',
    description: 'Le plus ancien parc national d\'Afrique, abritant des gorilles de montagne',
    latitude: -0.4167,
    longitude: 29.15,
    ville: 'Goma',
    province: 'Nord-Kivu',
  },
  {
    id: '2',
    nom: 'Parc National de la Salonga',
    description: 'Plus grande réserve de forêt tropicale d\'Afrique',
    latitude: -1.5,
    longitude: 21.0,
    ville: 'Mbandaka',
    province: 'Équateur',
  },
  {
    id: '3',
    nom: 'Lac Kivu',
    description: 'Lac majestueux situé à la frontière avec le Rwanda',
    latitude: -1.9,
    longitude: 29.1,
    ville: 'Goma',
    province: 'Nord-Kivu',
  },
  {
    id: '4',
    nom: 'Chutes de Zongo',
    description: 'Magnifiques chutes d\'eau près de Kinshasa',
    latitude: -4.7833,
    longitude: 14.9333,
    ville: 'Kinshasa',
    province: 'Kinshasa',
  },
  {
    id: '5',
    nom: 'Kinshasa',
    description: 'Capitale de la RDC, ville vibrante et culturelle',
    latitude: -4.4419,
    longitude: 15.2663,
    ville: 'Kinshasa',
    province: 'Kinshasa',
  },
];

const FALLBACK_STREET_VIEW = { lat: -4.324, lng: 15.305 }; // centre Kinshasa, forte couverture

// Construit l'URL Street View (panorama pur)
const buildStreetViewUrl = (lat: number, lng: number) =>
  `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;

// Construit la carte statique OSM avec plusieurs marqueurs
const buildOsmMapUrl = (markers: { lat: number; lng: number; color?: string }[], zoom = 11) => {
  if (!markers.length) return null;
  const first = markers[0];
  const markersParam = markers
    .map((m) => `${m.lat},${m.lng},${m.color ?? 'lightblue1'}`)
    .join('|');
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${first.lat},${first.lng}&zoom=${zoom}&size=700x420&markers=${markersParam}`;
};

export default function SiteTouristiquePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<TouristSite | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  // Street View embarqué (output=svembed pour forcer le panorama)
  const [streetViewUrl, setStreetViewUrl] = useState(
    buildStreetViewUrl(FALLBACK_STREET_VIEW.lat, FALLBACK_STREET_VIEW.lng)
  );
  // Carte statique OSM pour visualiser les points (sites + utilisateur)
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);

  // Filtrer les sites selon la recherche
  const filteredSites = sitesTouristiques.filter(site =>
    site.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mettre à jour la carte quand un site est sélectionné
  useEffect(() => {
    if (selectedSite) {
      // Street View centré sur le site sélectionné (panorama direct, sans carte)
      setStreetViewUrl(buildStreetViewUrl(selectedSite.latitude, selectedSite.longitude));
    } else {
      // Fallback sur une zone couverte (Kinshasa centre) pour éviter l'écran noir
      setStreetViewUrl(buildStreetViewUrl(FALLBACK_STREET_VIEW.lat, FALLBACK_STREET_VIEW.lng));
    }
  }, [selectedSite]);

  // Markers pour la carte OSM (tous les sites filtrés + utilisateur)
  const mapMarkers = useMemo(() => {
    const list = (searchQuery ? filteredSites : sitesTouristiques).map((s) => ({
      lat: s.latitude,
      lng: s.longitude,
      color: 'lightblue1',
    }));
    if (userLocation) {
      list.unshift({ lat: userLocation.lat, lng: userLocation.lng, color: 'red-pushpin' });
    }
    return list;
  }, [filteredSites, searchQuery, userLocation]);

  // Mettre à jour la carte statique (OpenStreetMap) pour visualiser les points
  useEffect(() => {
    const url = buildOsmMapUrl(mapMarkers, userLocation ? 12 : 6);
    setStaticMapUrl(url);
  }, [mapMarkers, userLocation]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const site = sitesTouristiques.find(s =>
        s.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ville.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (site) {
        setSelectedSite(site);
        toast({
          title: "Site trouvé",
          description: `${site.nom} localisé sur la carte`,
        });
      } else {
        toast({
          title: "Site non trouvé",
          description: "Aucun site touristique correspondant",
          variant: "destructive",
        });
      }
    }
  };

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

        // Trouver les sites proches (dans un rayon de 50km)
        const nearbySites = sitesTouristiques.filter(site => {
          const distance = calculateDistance(lat, lng, site.latitude, site.longitude);
          return distance <= 50; // 50 km
        });

        if (nearbySites.length > 0) {
          // Afficher le site le plus proche
          const closestSite = nearbySites.reduce((prev, curr) => {
            const prevDist = calculateDistance(lat, lng, prev.latitude, prev.longitude);
            const currDist = calculateDistance(lat, lng, curr.latitude, curr.longitude);
            return currDist < prevDist ? curr : prev;
          });
          
          setSelectedSite(closestSite);
          toast({
            title: "Sites proches trouvés",
            description: `${nearbySites.length} site(s) trouvé(s) près de vous`,
          });
        } else {
          toast({
            title: "Aucun site proche",
            description: "Aucun site touristique dans un rayon de 50km",
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

  // Calculer la distance entre deux points (formule de Haversine)
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
                <MapPin className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Site Touristique</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {/* Barre de recherche */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un site touristique..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Bouton sites proches */}
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
                    Sites proches de ma localisation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Street View */}
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full h-[400px]">
                <iframe
                  src={streetViewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'brightness(0.8) contrast(1.2)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
                {/* Overlay identifiant l'appli */}
                <div className="absolute top-2 right-2 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Ya Biso RDC
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte statique (OpenStreetMap) pour visualiser les points */}
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full h-[320px] bg-gray-800">
                {staticMapUrl ? (
                  <img
                    src={staticMapUrl}
                    alt="Carte des positions (OSM)"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.9) contrast(1.1)' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Carte en cours de préparation...
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Points : site + vous
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des sites */}
          <div className="space-y-3">
            <h2 className="text-white font-semibold text-lg">
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Sites touristiques'}
            </h2>
            {(searchQuery ? filteredSites : sitesTouristiques).map((site) => (
              <Card
                key={site.id}
                className={`bg-gray-900/50 border-gray-800 cursor-pointer transition-all hover:border-[#FF8800]/50 ${
                  selectedSite?.id === site.id ? 'border-[#FF8800] bg-[#FF8800]/10' : ''
                }`}
                onClick={() => setSelectedSite(site)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#FF8800]/20">
                      <MapPin className="h-5 w-5 text-[#FF8800]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{site.nom}</h3>
                      <p className="text-gray-400 text-sm mb-2">{site.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{site.ville}</span>
                        <span>•</span>
                        <span>{site.province}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog pour demander la permission de localisation */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Partager votre localisation</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pour trouver les sites touristiques près de vous, nous avons besoin d'accéder à votre position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">Votre confidentialité</p>
                  <p className="text-gray-300 text-xs">
                    Votre position ne sera utilisée que pour trouver les sites touristiques proches. 
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
