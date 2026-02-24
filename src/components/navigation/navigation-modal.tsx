'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navigation, X, ArrowLeft, Loader2, Volume2, VolumeX, MapPin, Phone, Star, Share2, MessageSquare, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Types
export interface NavigationDestination {
  id: string;
  nom: string;
  adresse?: string;
  latitude: number;
  longitude: number;
  telephone?: string;
  type?: string;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  steps: RouteStep[];
}

// Composant Map chargé dynamiquement
const NavigationMap = dynamic(() => import('./navigation-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-800">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF8800]" />
    </div>
  ),
});

// API OSRM pour calculer l'itinéraire
async function getRouteFromOSRM(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteData | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }
    
    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );
    
    const steps: RouteStep[] = route.legs[0].steps.map((step: any) => ({
      instruction: translateInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        location: [step.maneuver.location[1], step.maneuver.location[0]],
      },
    }));
    
    return {
      coordinates,
      distance: route.distance,
      duration: route.duration,
      steps,
    };
  } catch (error) {
    console.error('Erreur OSRM:', error);
    return null;
  }
}

function translateInstruction(type: string, modifier: string | undefined, streetName: string): string {
  const street = streetName ? ` sur ${streetName}` : '';
  
  switch (type) {
    case 'depart': return `Départ${street}`;
    case 'arrive': return 'Vous êtes arrivé à destination';
    case 'turn':
      switch (modifier) {
        case 'left': return `Tournez à gauche${street}`;
        case 'right': return `Tournez à droite${street}`;
        case 'slight left': return `Légèrement à gauche${street}`;
        case 'slight right': return `Légèrement à droite${street}`;
        case 'sharp left': return `Tournez fortement à gauche${street}`;
        case 'sharp right': return `Tournez fortement à droite${street}`;
        case 'uturn': return 'Faites demi-tour';
        default: return `Continuez${street}`;
      }
    case 'continue': return `Continuez tout droit${street}`;
    case 'merge': return `Rejoignez la voie${street}`;
    case 'roundabout': return `Au rond-point, prenez la sortie${street}`;
    default: return `Continuez${street}`;
  }
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Classe pour la synthèse vocale
class NavigationVoice {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private lastSpokenInstruction: string = '';
  private lastSpokenTime: number = 0;
  
  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
    }
  }
  
  private loadVoice() {
    if (!this.synth) return;
    const setVoice = () => {
      const voices = this.synth!.getVoices();
      
      // Noms de voix féminines communes
      const femaleVoiceNames = [
        'femme', 'female', 'woman', 'amélie', 'aurélie', 'thomas', 'zira', 
        'hortense', 'helen', 'samantha', 'victoria', 'karen', 'susan', 
        'monica', 'marisol', 'paulina', 'tessa', 'veena', 'fiona', 'siri',
        'anna', 'melina', 'milena', 'maria', 'katya', 'alice', 'carmit',
        'lisa', 'satu', 'yuna', 'yuri', 'nora', 'ellen', 'nicole',
        'celine', 'chantal', 'claire', 'sophie', 'isabelle', 'julie'
      ];
      
      // Chercher une voix française féminine
      const femaleVoices = voices.filter(v => {
        if (!v.lang.startsWith('fr')) return false;
        const nameLower = v.name.toLowerCase();
        return femaleVoiceNames.some(femaleName => nameLower.includes(femaleName));
      });
      
      // Si on trouve une voix féminine française, l'utiliser
      if (femaleVoices.length > 0) {
        this.voice = femaleVoices[0];
        console.log('🎤 Voix féminine sélectionnée:', this.voice.name);
      } else {
        // Sinon, chercher n'importe quelle voix française
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
        if (frenchVoices.length > 0) {
          this.voice = frenchVoices[0];
          console.log('🎤 Voix française sélectionnée:', this.voice.name);
        } else {
          this.voice = voices[0];
          console.log('🎤 Voix par défaut sélectionnée:', this.voice?.name);
        }
      }
    };
    if (this.synth.getVoices().length > 0) setVoice();
    else this.synth.onvoiceschanged = setVoice;
  }
  
  speak(text: string, force: boolean = false) {
    if (!this.synth || !text) return;
    const now = Date.now();
    if (!force && text === this.lastSpokenInstruction && now - this.lastSpokenTime < 10000) return;
    if (force) this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.1; // Légèrement plus rapide
    utterance.pitch = 1.2; // Pitch plus élevé pour voix féminine
    utterance.volume = 1.0;
    if (this.voice) utterance.voice = this.voice;
    
    this.synth.speak(utterance);
    this.lastSpokenInstruction = text;
    this.lastSpokenTime = now;
  }
  
  speakWithDistance(instruction: string, distanceMeters: number) {
    let text = '';
    if (distanceMeters > 1000) {
      text = `Dans ${(distanceMeters / 1000).toFixed(1)} kilomètres, ${instruction.toLowerCase()}`;
    } else if (distanceMeters > 100) {
      text = `Dans ${Math.round(distanceMeters / 10) * 10} mètres, ${instruction.toLowerCase()}`;
    } else if (distanceMeters > 30) {
      text = `Bientôt, ${instruction.toLowerCase()}`;
    } else {
      text = instruction;
    }
    this.speak(text);
  }
  
  announceStart(destinationName: string) {
    this.speak(`Démarrage de la navigation vers ${destinationName}. Suivez les instructions.`, true);
  }
  
  announceArrival(destinationName: string) {
    this.speak(`Vous êtes arrivé à destination : ${destinationName}.`, true);
  }
  
  stop() {
    if (this.synth) this.synth.cancel();
  }
}

interface NavigationModalProps {
  destination: NavigationDestination | null;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
  destinationType?: string;
}

export function NavigationModal({
  destination,
  isOpen,
  onClose,
  accentColor = '#FF8800',
  destinationType = 'lieu',
}: NavigationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'preview' | 'navigating'>('preview');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [distanceToManeuver, setDistanceToManeuver] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [showArrivalDialog, setShowArrivalDialog] = useState(false);
  const [showDepartureDialog, setShowDepartureDialog] = useState(false);
  const [rating, setRating] = useState(0);
  
  const watchIdRef = useRef<number | null>(null);
  const voiceRef = useRef<NavigationVoice | null>(null);
  const arrivedRef = useRef(false);
  const lastDistanceRef = useRef<number>(Infinity);

  // Initialiser la voix
  useEffect(() => {
    voiceRef.current = new NavigationVoice();
    return () => voiceRef.current?.stop();
  }, []);

  // Demander la localisation quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && destination && !userLocation) {
      requestLocation();
    }
  }, [isOpen, destination]);

  // Nettoyer quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  // Mettre à jour les instructions en temps réel
  useEffect(() => {
    if (step !== 'navigating' || !userLocation || !routeData || !destination) return;

    // Trouver l'instruction actuelle
    if (routeData.steps.length > 0) {
      let closestStepIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < routeData.steps.length; i++) {
        const stepData = routeData.steps[i];
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          stepData.maneuver.location[0],
          stepData.maneuver.location[1]
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestStepIndex = i;
        }
      }

      const nextStep = routeData.steps[Math.min(closestStepIndex + (minDistance < 30 ? 1 : 0), routeData.steps.length - 1)];
      const distToManeuver = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        nextStep.maneuver.location[0],
        nextStep.maneuver.location[1]
      );

      setCurrentInstruction(nextStep.instruction);
      setDistanceToManeuver(distToManeuver);

      if (audioEnabled && voiceRef.current) {
        voiceRef.current.speakWithDistance(nextStep.instruction, distToManeuver);
      }
    }

    // Vérifier l'arrivée
    const distanceToDest = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destination.latitude,
      destination.longitude
    );

    if (distanceToDest < 50 && !hasArrived) {
      setHasArrived(true);
      arrivedRef.current = true;
      setShowArrivalDialog(true);
      if (audioEnabled && voiceRef.current) {
        voiceRef.current.announceArrival(destination.nom);
      }
    }

    // Détecter le départ
    if (arrivedRef.current && distanceToDest > 100 && lastDistanceRef.current < distanceToDest) {
      setShowDepartureDialog(true);
      arrivedRef.current = false;
    }

    lastDistanceRef.current = distanceToDest;

  }, [userLocation, step, routeData, destination, audioEnabled, hasArrived]);

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    voiceRef.current?.stop();
    setStep('preview');
    setRouteData(null);
    setHasArrived(false);
    arrivedRef.current = false;
    lastDistanceRef.current = Infinity;
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setIsLoadingLocation(false);

        // Calculer l'itinéraire
        if (destination) {
          setIsLoadingRoute(true);
          const route = await getRouteFromOSRM(
            loc.lat, loc.lng,
            destination.latitude, destination.longitude
          );
          setRouteData(route);
          setIsLoadingRoute(false);
        }
      },
      (error) => {
        let errorMessage = 'Impossible d\'obtenir votre position';
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
          title: "Position requise",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [destination, toast]);

  const startNavigation = useCallback(() => {
    if (!userLocation || !destination) return;

    setStep('navigating');
    setHasArrived(false);
    arrivedRef.current = false;

    if (audioEnabled && voiceRef.current) {
      voiceRef.current.announceStart(destination.nom);
    }

    // Suivi GPS en temps réel
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    toast({
      title: "Navigation démarrée",
      description: `Vers ${destination.nom}`,
    });
  }, [userLocation, destination, audioEnabled, toast]);

  const stopNavigation = useCallback(() => {
    cleanup();
    onClose();
    toast({
      title: "Navigation terminée",
    });
  }, [cleanup, onClose, toast]);

  const handleShare = useCallback(() => {
    if (destination && navigator.share) {
      navigator.share({
        title: destination.nom,
        text: `J'ai visité ${destination.nom} !`,
        url: window.location.href,
      });
    }
  }, [destination]);

  const submitReview = useCallback(() => {
    toast({
      title: "Merci pour votre avis !",
      description: `Vous avez noté ${destination?.nom} ${rating}/5 étoiles`,
    });
    setShowDepartureDialog(false);
    setRating(0);
  }, [rating, destination, toast]);

  if (!isOpen || !destination) return null;

  // Vue de prévisualisation
  if (step === 'preview') {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-white font-semibold">Itinéraire</span>
            <div className="w-10" />
          </div>
        </div>

        {/* Carte */}
        <div className="w-full h-full">
          <NavigationMap
            userLocation={userLocation}
            destination={destination}
            routeCoordinates={routeData?.coordinates}
            isNavigating={false}
            accentColor={accentColor}
          />
        </div>

        {/* Badge */}
        <div className="absolute top-16 right-4 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold z-[10001]">
          Ya Biso RDC
        </div>

        {/* Info destination en bas */}
        <div className="absolute bottom-0 left-0 right-0 z-[10001] bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-4">
          <Card className="bg-gray-900/95 border-gray-700">
            <CardContent className="p-4">
              {isLoadingLocation || isLoadingRoute ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FF8800] mr-3" />
                  <span className="text-white">
                    {isLoadingLocation ? 'Obtention de votre position...' : 'Calcul de l\'itinéraire...'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                      <MapPin className="h-6 w-6" style={{ color: accentColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{destination.nom}</h3>
                      {destination.adresse && (
                        <p className="text-gray-400 text-sm">{destination.adresse}</p>
                      )}
                      {routeData && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-blue-400 font-semibold">{formatDistance(routeData.distance)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={startNavigation}
                    disabled={!userLocation || !routeData}
                    className="w-full h-12 text-lg font-semibold"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Y aller
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vue de navigation
  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={stopNavigation}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="text-white font-semibold">Navigation</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="text-white hover:bg-white/20"
          >
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Instruction actuelle */}
      {currentInstruction && (
        <div className="absolute top-16 left-4 right-4 z-[10000] bg-blue-600 rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">{currentInstruction}</div>
              <div className="text-blue-200 text-xs">Dans {formatDistance(distanceToManeuver)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className="w-full h-full">
        <NavigationMap
          userLocation={userLocation}
          destination={destination}
          routeCoordinates={routeData?.coordinates}
          isNavigating={true}
          accentColor={accentColor}
        />
      </div>

      {/* Badge */}
      <div className="absolute top-32 right-4 bg-[#FF8800] text-white px-3 py-1 rounded-full text-xs font-semibold z-[10001]">
        Ya Biso RDC
      </div>

      {/* Info navigation en bas */}
      <div className="absolute bottom-4 left-4 right-4 z-[10001]">
        <Card className="bg-gray-900/95 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">{destination.nom}</h3>
                {routeData && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-blue-400">{formatDistance(routeData.distance)}</span>
                  </div>
                )}
              </div>
              <Button onClick={stopNavigation} variant="destructive" size="sm">
                Arrêter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog d'arrivée */}
      <Dialog open={showArrivalDialog} onOpenChange={setShowArrivalDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">🎉 Vous êtes arrivé !</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Bienvenue à {destination.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🏁</div>
              <p className="text-white font-semibold">{destination.nom}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowArrivalDialog(false)} style={{ backgroundColor: accentColor }}>
                Continuer
              </Button>
              <Button onClick={stopNavigation} variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Terminer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de départ */}
      <Dialog open={showDepartureDialog} onOpenChange={setShowDepartureDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ce {destinationType} vous a-t-il plu ?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" className="flex-1 border-gray-700 text-white">
                <Share2 className="h-4 w-4 mr-2" /> Partager
              </Button>
              <Button onClick={submitReview} className="flex-1" style={{ backgroundColor: accentColor }}>
                <MessageSquare className="h-4 w-4 mr-2" /> Envoyer
              </Button>
            </div>
            <Button onClick={() => { setShowDepartureDialog(false); stopNavigation(); }} variant="ghost" className="w-full text-gray-400">
              Passer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

