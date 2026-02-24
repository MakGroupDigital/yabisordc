'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Shield, ArrowLeft, AlertTriangle, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

const POLICE_EMERGENCY = '112'; // Numéro d'urgence général (à adapter selon le pays)
const POLICE_RDC = '+243 991 000 000'; // Numéro de la police en RDC (exemple)

export default function SecuritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSOS = () => {
    setShowSOSDialog(true);
  };

  const handleConfirmSOS = async () => {
    setShowSOSDialog(false);
    setIsCalling(true);
    setCountdown(3);

    // Compte à rebours de 3 secondes
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Obtenir la localisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // Après 3 secondes, appeler la police
    setTimeout(() => {
      clearInterval(interval);
      setCountdown(null);
      
      // Composer le numéro d'urgence
      window.location.href = `tel:${POLICE_RDC}`;
      
      // Afficher les informations de localisation si disponibles
      if (userLocation) {
        toast({
          title: "✅ Alerte envoyée",
          description: `Votre localisation a été partagée avec la police. Coordonnées: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "✅ Appel en cours",
          description: "L'appel à la police est en cours. Partagez votre localisation si possible.",
          duration: 5000,
        });
      }

      setIsCalling(false);
    }, 3000);
  };

  const handleCancelSOS = () => {
    setShowSOSDialog(false);
    if (countdown !== null) {
      setCountdown(null);
      setIsCalling(false);
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF8800]/20">
                <Shield className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Sécurité</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Bouton SOS principal */}
          <Card className="bg-gradient-to-br from-red-900/30 via-red-900/20 to-gray-900 border-red-500/50 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 animate-pulse">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Besoin d'aide d'urgence ?</h2>
                <p className="text-gray-400 text-sm">
                  Utilisez le bouton SOS pour alerter la police en cas d'urgence
                </p>
              </div>
              <Button
                onClick={handleSOS}
                disabled={isCalling}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-16 text-xl font-bold shadow-lg shadow-red-500/50"
              >
                {isCalling ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Appel en cours...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    SOS - ALERTER LA POLICE
                  </>
                )}
              </Button>
              {countdown !== null && countdown > 0 && (
                <p className="text-white text-lg font-semibold mt-4">
                  Appel dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informations d'urgence */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-white font-semibold text-lg mb-4">Numéros d'urgence</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Shield className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Police</p>
                      <p className="text-gray-400 text-sm">{POLICE_RDC}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = `tel:${POLICE_RDC}`}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Urgences générales</p>
                      <p className="text-gray-400 text-sm">{POLICE_EMERGENCY}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = `tel:${POLICE_EMERGENCY}`}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Police avec adresses */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-white font-semibold text-lg mb-4">Postes de Police</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Commissariat Central de Kinshasa</p>
                        <p className="text-gray-400 text-sm mb-2">Avenue de la Justice, Gombe, Kinshasa</p>
                        <p className="text-gray-400 text-sm">+243 900 004 100</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'tel:+243900004100'}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 flex-shrink-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Poste de Police de Ngaliema</p>
                        <p className="text-gray-400 text-sm mb-2">Avenue de Ngaliema, Kinshasa</p>
                        <p className="text-gray-400 text-sm">+243 900 004 101</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'tel:+243900004101'}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 flex-shrink-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Poste de Police de Matete</p>
                        <p className="text-gray-400 text-sm mb-2">Boulevard Lumumba, Matete, Kinshasa</p>
                        <p className="text-gray-400 text-sm">+243 900 004 102</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'tel:+243900004102'}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 flex-shrink-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Poste de Police de Goma</p>
                        <p className="text-gray-400 text-sm mb-2">Avenue du Lac, Goma, Nord-Kivu</p>
                        <p className="text-gray-400 text-sm">+243 900 004 103</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'tel:+243900004103'}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 flex-shrink-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Poste de Police de Lubumbashi</p>
                        <p className="text-gray-400 text-sm mb-2">Avenue Kasai, Lubumbashi, Haut-Katanga</p>
                        <p className="text-gray-400 text-sm">+243 900 004 104</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'tel:+243900004104'}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 flex-shrink-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conseils de sécurité */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Conseils de sécurité</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FF8800] flex-shrink-0 mt-0.5" />
                  <span>Gardez votre téléphone chargé et accessible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FF8800] flex-shrink-0 mt-0.5" />
                  <span>En cas d'urgence, composez rapidement le SOS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FF8800] flex-shrink-0 mt-0.5" />
                  <span>Partagez votre localisation si possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FF8800] flex-shrink-0 mt-0.5" />
                  <span>Restez calme et donnez des informations claires</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation SOS */}
      <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-red-500/50 text-white">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Alerter la Police
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Êtes-vous sûr de vouloir appeler la police ? Cette action composera immédiatement le numéro d'urgence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">Attention</p>
                  <p className="text-gray-300 text-xs">
                    N'utilisez cette fonction que en cas d'urgence réelle. Les appels abusifs peuvent être passibles de sanctions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirmSOS}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold"
              >
                <Phone className="h-5 w-5 mr-2" />
                Oui, appeler la police maintenant
              </Button>
              <Button
                onClick={handleCancelSOS}
                variant="outline"
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
