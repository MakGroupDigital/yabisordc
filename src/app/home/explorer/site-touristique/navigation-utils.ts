// Utilitaires de navigation

export interface RouteStep {
  instruction: string;
  distance: number; // en mètres
  duration: number; // en secondes
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number]; // [lng, lat]
  };
}

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng][]
  distance: number; // en mètres
  duration: number; // en secondes
  steps: RouteStep[];
}

// Récupérer l'itinéraire depuis OSRM (Open Source Routing Machine)
export async function getRouteFromOSRM(
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
      console.error('OSRM error:', data);
      return null;
    }
    
    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] // Convertir [lng, lat] en [lat, lng]
    );
    
    const steps: RouteStep[] = route.legs[0].steps.map((step: any) => ({
      instruction: translateInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        location: [step.maneuver.location[1], step.maneuver.location[0]], // [lat, lng]
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

// Traduire les instructions en français
function translateInstruction(type: string, modifier: string | undefined, streetName: string): string {
  const street = streetName ? ` sur ${streetName}` : '';
  
  switch (type) {
    case 'depart':
      return `Départ${street}`;
    case 'arrive':
      return 'Vous êtes arrivé à destination';
    case 'turn':
      switch (modifier) {
        case 'left':
          return `Tournez à gauche${street}`;
        case 'right':
          return `Tournez à droite${street}`;
        case 'slight left':
          return `Légèrement à gauche${street}`;
        case 'slight right':
          return `Légèrement à droite${street}`;
        case 'sharp left':
          return `Tournez fortement à gauche${street}`;
        case 'sharp right':
          return `Tournez fortement à droite${street}`;
        case 'uturn':
          return 'Faites demi-tour';
        default:
          return `Continuez${street}`;
      }
    case 'continue':
      return `Continuez tout droit${street}`;
    case 'merge':
      return `Rejoignez la voie${street}`;
    case 'on ramp':
      return `Prenez la bretelle${street}`;
    case 'off ramp':
      return `Sortez${street}`;
    case 'fork':
      if (modifier === 'left') return `Prenez à gauche à la fourche${street}`;
      if (modifier === 'right') return `Prenez à droite à la fourche${street}`;
      return `Continuez à la fourche${street}`;
    case 'end of road':
      if (modifier === 'left') return `En fin de route, tournez à gauche${street}`;
      if (modifier === 'right') return `En fin de route, tournez à droite${street}`;
      return `Fin de la route${street}`;
    case 'roundabout':
      return `Au rond-point, prenez la sortie${street}`;
    case 'rotary':
      return `Au rond-point, prenez la sortie${street}`;
    case 'new name':
      return `Continuez${street}`;
    case 'notification':
      return street || 'Continuez';
    default:
      return `Continuez${street}`;
  }
}

// Formater la distance
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Formater la durée
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

// Calculer la distance entre deux points (formule de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Trouver l'étape actuelle basée sur la position de l'utilisateur
export function findCurrentStep(
  userLat: number,
  userLng: number,
  steps: RouteStep[]
): { step: RouteStep; index: number; distanceToManeuver: number } | null {
  if (!steps || steps.length === 0) return null;
  
  let closestStepIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const distance = calculateDistance(
      userLat,
      userLng,
      step.maneuver.location[0],
      step.maneuver.location[1]
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestStepIndex = i;
    }
  }
  
  // Trouver la prochaine étape (pas celle qu'on a déjà passée)
  let nextStepIndex = closestStepIndex;
  if (minDistance < 30 && closestStepIndex < steps.length - 1) {
    nextStepIndex = closestStepIndex + 1;
  }
  
  const nextStep = steps[nextStepIndex];
  const distanceToManeuver = calculateDistance(
    userLat,
    userLng,
    nextStep.maneuver.location[0],
    nextStep.maneuver.location[1]
  );
  
  return {
    step: nextStep,
    index: nextStepIndex,
    distanceToManeuver,
  };
}

// Classe pour la synthèse vocale
export class NavigationVoice {
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
      // Chercher une voix française
      this.voice = voices.find(v => v.lang.startsWith('fr')) || voices[0];
    };
    
    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.onvoiceschanged = setVoice;
    }
  }
  
  speak(text: string, force: boolean = false) {
    if (!this.synth || !text) return;
    
    const now = Date.now();
    // Éviter de répéter la même instruction trop souvent (minimum 10 secondes)
    if (!force && text === this.lastSpokenInstruction && now - this.lastSpokenTime < 10000) {
      return;
    }
    
    // Annuler toute parole en cours si on force
    if (force) {
      this.synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
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
    this.speak(`Vous êtes arrivé à destination : ${destinationName}. Bonne visite !`, true);
  }
  
  announceRecalculation() {
    this.speak('Recalcul de l\'itinéraire en cours.', true);
  }
  
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

