'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { MapPin, ArrowLeft, Search, Navigation, Loader2, AlertCircle, Phone, MessageCircle, X, Star, Share2, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { shareItem, clearSharedItem } from '@/lib/share-utils';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import nextDynamic from 'next/dynamic';
import {
  getRouteFromOSRM,
  formatDistance,
  formatDuration,
  findCurrentStep,
  calculateDistance,
  NavigationVoice,
  RouteData,
  RouteStep,
} from './navigation-utils';

interface TouristSite {
  id: string;
  nom: string;
  description: string;
  latitude: number;
  longitude: number;
  ville: string;
  province: string;
  telephone?: string;
  image?: string;
}

// Sites touristiques de la RDC avec coordonnées réelles
const sitesTouristiques: TouristSite[] = [
  {
    id: '1',
    nom: 'Parc National des Virunga',
    description: 'Le plus ancien parc national d\'Afrique, abritant des gorilles de montagne',
    latitude: -1.4073,
    longitude: 29.2250,
    ville: 'Goma',
    province: 'Nord-Kivu',
    telephone: '+243970000001',
  },
  {
    id: '2',
    nom: 'Parc National de la Salonga',
    description: 'Plus grande réserve de forêt tropicale d\'Afrique',
    latitude: -2.0833,
    longitude: 21.5000,
    ville: 'Mbandaka',
    province: 'Équateur',
    telephone: '+243970000002',
  },
  {
    id: '3',
    nom: 'Lac Kivu',
    description: 'Lac majestueux situé à la frontière avec le Rwanda',
    latitude: -2.0500,
    longitude: 29.0500,
    ville: 'Goma',
    province: 'Nord-Kivu',
    telephone: '+243970000003',
  },
  {
    id: '4',
    nom: 'Chutes de Zongo',
    description: 'Magnifiques chutes d\'eau près de Kinshasa',
    latitude: -4.7167,
    longitude: 14.8833,
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243970000004',
  },
  {
    id: '5',
    nom: 'Monument de l\'Échangeur',
    description: 'Monument emblématique de Kinshasa',
    latitude: -4.3176,
    longitude: 15.3136,
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243970000005',
  },
  {
    id: '6',
    nom: 'Jardin Botanique de Kinshasa',
    description: 'Espace vert au cœur de la capitale',
    latitude: -4.3850,
    longitude: 15.3270,
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243970000006',
  },
  {
    id: '7',
    nom: 'Académie des Beaux-Arts',
    description: 'Centre culturel et artistique historique',
    latitude: -4.3100,
    longitude: 15.3000,
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243970000007',
  },
  {
    id: '8',
    nom: 'Stade des Martyrs',
    description: 'Plus grand stade de la RDC',
    latitude: -4.3333,
    longitude: 15.3167,
    ville: 'Kinshasa',
    province: 'Kinshasa',
    telephone: '+243970000008',
  },
];

// Composant Map chargé dynamiquement (Leaflet ne fonctionne pas en SSR)
const MapComponent = nextDynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF8800]" />
    </div>
  ),
});

function SiteTouristiquePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<TouristSite | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-4.3250, 15.3222]);
  const [mapZoom, setMapZoom] = useState(12);
  
  // États pour la navigation avancée
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<TouristSite | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [distanceToManeuver, setDistanceToManeuver] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [showArrivalDialog, setShowArrivalDialog] = useState(false);
  const [showDepartureDialog, setShowDepartureDialog] = useState(false);
  const [showNavigationBlockedDialog, setShowNavigationBlockedDialog] = useState(false);
  const [pendingNavigationSite, setPendingNavigationSite] = useState<TouristSite | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Deep links
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const voiceRef = useRef<NavigationVoice | null>(null);
  const lastDistanceToDestRef = useRef<number>(Infinity);
  const arrivedAtSiteRef = useRef(false);

  // Gérer les deep links
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      clearSharedItem();
      
      // Trouver et sélectionner le site
      const site = sitesTouristiques.find(s => s.id === highlight);
      if (site) {
        setSelectedSite(site);
        setMapCenter([site.latitude, site.longitude]);
        setMapZoom(15);
      }
      
      setTimeout(() => {
        const element = document.getElementById(`site-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
    }
  }, [searchParams]);

  // Filtrer les sites selon la recherche
  const filteredSites = sitesTouristiques.filter(site =>
    site.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialiser la voix de navigation
  useEffect(() => {
    voiceRef.current = new NavigationVoice();
    return () => {
      voiceRef.current?.stop();
    };
  }, []);

  // Mettre à jour le centre de la carte quand un site est sélectionné
  useEffect(() => {
    if (selectedSite && !isNavigating) {
      setMapCenter([selectedSite.latitude, selectedSite.longitude]);
      setMapZoom(15);
    }
  }, [selectedSite, isNavigating]);

  // Centrer sur l'utilisateur quand sa position est obtenue
  useEffect(() => {
    if (userLocation && !selectedSite && !isNavigating) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(13);
    }
  }, [userLocation, selectedSite, isNavigating]);

  // Nettoyer le watch GPS quand le composant est démonté
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      voiceRef.current?.stop();
    };
  }, []);

  // Mettre à jour les instructions de navigation en temps réel
  useEffect(() => {
    if (!isNavigating || !userLocation || !routeData || !navigationTarget) return;

    // Trouver l'étape actuelle
    const stepInfo = findCurrentStep(userLocation.lat, userLocation.lng, routeData.steps);
    if (stepInfo) {
      setCurrentStepIndex(stepInfo.index);
      setCurrentInstruction(stepInfo.step.instruction);
      setDistanceToManeuver(stepInfo.distanceToManeuver);

      // Annoncer l'instruction vocalement
      if (audioEnabled && voiceRef.current) {
        voiceRef.current.speakWithDistance(stepInfo.step.instruction, stepInfo.distanceToManeuver);
      }
    }

    // Calculer la distance à la destination
    const distanceToDest = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      navigationTarget.latitude,
      navigationTarget.longitude
    );

    // Vérifier si on est arrivé (moins de 50 mètres)
    if (distanceToDest < 50 && !hasArrived) {
      setHasArrived(true);
      arrivedAtSiteRef.current = true;
      setShowArrivalDialog(true);
      
      if (audioEnabled && voiceRef.current) {
        voiceRef.current.announceArrival(navigationTarget.nom);
      }
    }

    // Vérifier si on s'éloigne du site après y être arrivé
    if (arrivedAtSiteRef.current && distanceToDest > 100 && lastDistanceToDestRef.current < distanceToDest) {
      // On s'éloigne du site
      setShowDepartureDialog(true);
      arrivedAtSiteRef.current = false;
    }

    lastDistanceToDestRef.current = distanceToDest;
    setTotalDistance(distanceToDest);

  }, [userLocation, isNavigating, routeData, navigationTarget, audioEnabled, hasArrived]);

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

        const nearbySites = sitesTouristiques.filter(site => {
          const distance = calculateDistance(lat, lng, site.latitude, site.longitude);
          return distance <= 100000;
        });

        if (nearbySites.length > 0) {
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
            title: "Position obtenue",
            description: "Vous êtes maintenant visible sur la carte",
          });
        }

        setIsRequestingLocation(false);
      },
      (error) => {
        let errorMessage = 'Impossible d\'accéder à votre position';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Accès à la localisation refusé. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible. Vérifiez que votre GPS est activé et que vous avez une bonne connexion.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
            break;
          default:
            errorMessage = `Erreur: ${error.message || 'Impossible d\'obtenir votre position'}`;
            break;
        }
        
        console.error('Erreur géolocalisation:', {
          code: error.code,
          message: error.message,
          errorMessage
        });
        
        toast({
          title: "Erreur de géolocalisation",
          description: errorMessage,
          variant: "destructive",
        });
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string, siteName: string) => {
    const message = encodeURIComponent(`Bonjour, je souhaite avoir des informations sur ${siteName}.`);
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
  };

  // Tenter de démarrer la navigation
  const attemptStartNavigation = useCallback((site: TouristSite) => {
    // Si déjà en navigation, bloquer et demander confirmation
    if (isNavigating) {
      setPendingNavigationSite(site);
      setShowNavigationBlockedDialog(true);
      return;
    }
    
    startNavigation(site);
  }, [isNavigating]);

  // Démarrer la navigation vers un site
  const startNavigation = useCallback(async (site: TouristSite) => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Calcul de l'itinéraire...",
      description: "Veuillez patienter",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        // Récupérer l'itinéraire depuis OSRM
        const route = await getRouteFromOSRM(lat, lng, site.latitude, site.longitude);
        
        if (route) {
          setRouteData(route);
          setTotalDistance(route.distance);
          setTotalDuration(route.duration);
          
          if (route.steps.length > 0) {
            setCurrentInstruction(route.steps[0].instruction);
          }
        } else {
          toast({
            title: "Itinéraire simplifié",
            description: "Impossible de calculer la route exacte, affichage en ligne droite",
          });
        }

        setNavigationTarget(site);
        setIsNavigating(true);
        setIsFullscreen(true);
        setHasArrived(false);
        arrivedAtSiteRef.current = false;
        lastDistanceToDestRef.current = Infinity;

        if (audioEnabled && voiceRef.current) {
          voiceRef.current.announceStart(site.nom);
        }

        toast({
          title: "Navigation démarrée",
          description: `Vers ${site.nom}`,
        });

        // Commencer le suivi GPS en temps réel
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (error) => {
            let errorMessage = 'Erreur de géolocalisation';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Accès à la localisation refusé. Veuillez autoriser l\'accès dans les paramètres.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Position indisponible. Vérifiez votre connexion GPS.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Délai d\'attente dépassé pour obtenir la position.';
                break;
              default:
                errorMessage = `Erreur GPS: ${error.message || 'Erreur inconnue'}`;
                break;
            }
            
            console.error('Erreur GPS:', {
              code: error.code,
              message: error.message,
              errorMessage
            });
            
            toast({
              title: "Erreur de localisation",
              description: errorMessage,
              variant: "destructive",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast({
          title: "Position requise",
          description: "Veuillez autoriser l'accès à votre position pour la navigation",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [toast, audioEnabled]);

  // Arrêter la navigation
  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    voiceRef.current?.stop();
    
    setIsNavigating(false);
    setNavigationTarget(null);
    setIsFullscreen(false);
    setRouteData(null);
    setCurrentStepIndex(0);
    setCurrentInstruction('');
    setHasArrived(false);
    arrivedAtSiteRef.current = false;
    
    toast({
      title: "Navigation terminée",
      description: "Vous avez quitté le mode navigation",
    });
  }, [toast]);

  // Annuler navigation actuelle et démarrer nouvelle
  const switchNavigation = useCallback(() => {
    stopNavigation();
    setShowNavigationBlockedDialog(false);
    
    if (pendingNavigationSite) {
      setTimeout(() => {
        startNavigation(pendingNavigationSite);
        setPendingNavigationSite(null);
      }, 500);
    }
  }, [stopNavigation, startNavigation, pendingNavigationSite]);

  // Toggle plein écran
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        voiceRef.current?.stop();
      }
      return newState;
    });
  }, []);

  // Partager le site
  const handleShare = useCallback(async (site?: TouristSite) => {
    const siteToShare = site || navigationTarget;
    if (!siteToShare) return;
    
    const result = await shareItem('site', siteToShare.id, siteToShare.nom, `Site touristique à ${siteToShare.ville}`);
    if (result.success) {
      toast({
        title: result.method === 'native' ? "Partagé !" : "Lien copié !",
        description: result.method === 'native' 
          ? `${siteToShare.nom} a été partagé` 
          : "Le lien a été copié dans le presse-papiers",
      });
    }
  }, [navigationTarget, toast]);

  // Soumettre l'avis
  const submitReview = useCallback(() => {
    toast({
      title: "Merci pour votre avis !",
      description: `Vous avez noté ${navigationTarget?.nom} ${rating}/5 étoiles`,
    });
    setShowDepartureDialog(false);
    setRating(0);
    setComment('');
  }, [rating, navigationTarget, toast]);

  // Rendu en mode plein écran (navigation)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        {/* Header en plein écran */}
        <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={isNavigating ? stopNavigation : toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isNavigating ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FF8800]/20">
                  <Navigation className="h-5 w-5 text-[#FF8800]" />
                </div>
                <span className="text-white font-semibold">
                  {isNavigating ? 'Navigation' : 'Carte'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isNavigating && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudio}
                  className="text-white hover:bg-white/20"
                >
                  {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              )}
              {isNavigating && navigationTarget && (
                <div className="text-right">
                  <div className="text-white font-bold">
                    {formatDistance(totalDistance)}
                  </div>
                  <div className="text-gray-400 text-xs">restants</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carte plein écran */}
        <div className="w-full h-full">
          <MapComponent
            sites={searchQuery ? filteredSites : sitesTouristiques}
            selectedSite={selectedSite}
            userLocation={userLocation}
            center={mapCenter}
            zoom={mapZoom}
            onSiteSelect={(site: TouristSite) => {
              if (isNavigating) {
                attemptStartNavigation(site);
              } else {
                setSelectedSite(site);
              }
            }}
            isNavigating={isNavigating}
            navigationTarget={navigationTarget}
            routeCoordinates={routeData?.coordinates}
            isFullscreen={true}
            onToggleFullscreen={toggleFullscreen}
            currentInstruction={currentInstruction}
            distanceToManeuver={distanceToManeuver}
          />
        </div>

        {/* Badge Ya Biso RDC */}
        <div className="absolute top-16 right-4 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold z-[10001]">
          Ya Biso RDC
        </div>

        {/* Info navigation en bas */}
        {isNavigating && navigationTarget && (
          <div className="absolute bottom-4 left-4 right-4 z-[10001]">
            <Card className="bg-gray-900/95 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FF8800] rounded-xl flex items-center justify-center">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{navigationTarget.nom}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-blue-400">{formatDistance(totalDistance)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={stopNavigation}
                    variant="destructive"
                    size="sm"
                  >
                    Arrêter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog d'arrivée */}
        <Dialog open={showArrivalDialog} onOpenChange={setShowArrivalDialog}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                🎉 Vous êtes arrivé !
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                Bienvenue à {navigationTarget?.nom}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">🏛️</div>
                <p className="text-white font-semibold">{navigationTarget?.nom}</p>
                <p className="text-gray-400 text-sm">{navigationTarget?.ville}, {navigationTarget?.province}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setShowArrivalDialog(false)}
                  className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  Continuer l'exploration
                </Button>
                <Button
                  onClick={stopNavigation}
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800"
                >
                  Terminer la navigation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de départ du site */}
        <Dialog open={showDepartureDialog} onOpenChange={setShowDepartureDialog}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Ce lieu vous a-t-il plu ?
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Partagez votre expérience à {navigationTarget?.nom}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Notation par étoiles */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Commentaire */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Laissez un commentaire (optionnel)..."
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder:text-gray-500 resize-none"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleShare()}
                  variant="outline"
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Button
                  onClick={submitReview}
                  className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>

              <Button
                onClick={() => {
                  setShowDepartureDialog(false);
                  stopNavigation();
                }}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Passer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog navigation bloquée */}
        <Dialog open={showNavigationBlockedDialog} onOpenChange={setShowNavigationBlockedDialog}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Navigation en cours
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Vous avez déjà une navigation vers {navigationTarget?.nom} en cours.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Pour naviguer vers <strong>{pendingNavigationSite?.nom}</strong>, vous devez d'abord terminer ou annuler la navigation actuelle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={switchNavigation}
                  className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  Changer de destination
                </Button>
                <Button
                  onClick={() => setShowNavigationBlockedDialog(false)}
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800"
                >
                  Continuer vers {navigationTarget?.nom}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
          <Card className="bg-gray-900/50 border-gray-800 relative z-10">
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
                className="w-full border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 relative z-20"
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
                    {userLocation ? 'Ma position activée ✓' : 'Sites proches de ma localisation'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Carte interactive Leaflet */}
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden relative z-0">
            <CardContent className="p-0">
              <div className="relative w-full h-[400px] z-0">
                <MapComponent
                  sites={searchQuery ? filteredSites : sitesTouristiques}
                  selectedSite={selectedSite}
                  userLocation={userLocation}
                  center={mapCenter}
                  zoom={mapZoom}
                  onSiteSelect={(site: TouristSite) => setSelectedSite(site)}
                  isNavigating={false}
                  navigationTarget={null}
                  isFullscreen={false}
                  onToggleFullscreen={toggleFullscreen}
                />
                {/* Overlay identifiant l'appli */}
                <div className="absolute top-2 right-2 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold z-[1000]">
                  Ya Biso RDC
                </div>
                {userLocation && (
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-[1000]">
                    🚶 Vous êtes ici
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Détails du site sélectionné */}
          {selectedSite && (
            <Card className="bg-[#FF8800]/10 border-[#FF8800] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#FF8800]/20">
                    <MapPin className="h-5 w-5 text-[#FF8800]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{selectedSite.nom}</h3>
                    <p className="text-gray-300 text-sm mb-1">{selectedSite.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{selectedSite.ville}</span>
                      <span>•</span>
                      <span>{selectedSite.province}</span>
                      {userLocation && (
                        <>
                          <span>•</span>
                          <span className="text-[#FF8800] font-semibold">
                            {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, selectedSite.latitude, selectedSite.longitude))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => attemptStartNavigation(selectedSite)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Itinéraire
                  </Button>
                  {selectedSite.telephone && (
                    <>
                      <Button
                        onClick={() => handleCall(selectedSite.telephone!)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleWhatsApp(selectedSite.telephone!, selectedSite.nom)}
                        className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des sites */}
          <div className="space-y-3">
            <h2 className="text-white font-semibold text-lg">
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Sites touristiques'}
              <span className="text-gray-400 text-sm ml-2">
                ({(searchQuery ? filteredSites : sitesTouristiques).length} sites)
              </span>
            </h2>
            {(searchQuery ? filteredSites : sitesTouristiques).map((site) => (
              <Card
                key={site.id}
                id={`site-${site.id}`}
                className={`bg-gray-900/50 border-gray-800 cursor-pointer transition-all duration-500 hover:border-[#FF8800]/50 ${
                  selectedSite?.id === site.id ? 'border-[#FF8800] bg-[#FF8800]/10' : ''
                } ${
                  highlightedId === site.id 
                    ? 'ring-2 ring-[#FF8800] ring-offset-2 ring-offset-black scale-[1.02]' 
                    : ''
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
                        {userLocation && (
                          <>
                            <span>•</span>
                            <span className="text-[#FF8800]">
                              {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, site.latitude, site.longitude))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(site);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
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

export default function SiteTouristiquePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <SiteTouristiquePageContent />
    </Suspense>
  );
}
