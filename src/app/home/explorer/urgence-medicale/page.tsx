'use client';

import { useState, useEffect, Suspense } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { ArrowLeft, Phone, Navigation, MessageCircle, MapPin, Clock, Star, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { NavigationModal, NavigationDestination } from '@/components/navigation/navigation-modal';
import { shareItem, clearSharedItem } from '@/lib/share-utils';

interface Hopital {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  horaire: string;
  specialite?: string;
  note?: number;
  image?: string;
}

const hopitaux: Hopital[] = [
  {
    id: '1',
    nom: 'Hôpital Général de Kinshasa',
    adresse: 'Avenue Kasa-Vubu, Kinshasa, RDC',
    telephone: '+243 900 001 100',
    whatsapp: '+243900001100',
    latitude: -4.3276,
    longitude: 15.3136,
    horaire: '24h/24',
    specialite: 'Urgences générales',
    note: 4.5,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
  },
  {
    id: '2',
    nom: 'Centre Hospitalier Monkole',
    adresse: 'Kinshasa, RDC',
    telephone: '+243 900 001 101',
    whatsapp: '+243900001101',
    latitude: -4.4000,
    longitude: 15.3000,
    horaire: '24h/24',
    specialite: 'Soins d\'urgence',
    note: 4.7,
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80',
  },
  {
    id: '3',
    nom: 'Hôpital Biamba Marie Mutombo',
    adresse: 'Kinshasa, RDC',
    telephone: '+243 900 001 102',
    whatsapp: '+243900001102',
    latitude: -4.3500,
    longitude: 15.3200,
    horaire: '24h/24',
    specialite: 'Urgences médicales',
    note: 4.6,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80',
  },
  {
    id: '4',
    nom: 'Clinique Ngaliema',
    adresse: 'Kinshasa, RDC',
    telephone: '+243 900 001 103',
    whatsapp: '+243900001103',
    latitude: -4.3300,
    longitude: 15.3150,
    horaire: '24h/24',
    specialite: 'Soins intensifs',
    note: 4.8,
    image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?w=800&q=80',
  },
  {
    id: '5',
    nom: 'Hôpital Central de Goma',
    adresse: 'Goma, Nord-Kivu, RDC',
    telephone: '+243 900 001 104',
    whatsapp: '+243900001104',
    latitude: -1.6792,
    longitude: 29.2228,
    horaire: '24h/24',
    specialite: 'Urgences générales',
    note: 4.4,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  },
];

export const dynamic = 'force-dynamic';

function UrgenceMedicalePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [navigationDestination, setNavigationDestination] = useState<NavigationDestination | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Gérer les deep links
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      clearSharedItem();
      
      // Scroll vers l'élément mis en surbrillance
      setTimeout(() => {
        const element = document.getElementById(`hopital-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Retirer la surbrillance après 3 secondes
      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
    }
  }, [searchParams]);

  const handleShare = async (hopital: Hopital) => {
    const result = await shareItem('hopital', hopital.id, hopital.nom, `Urgence médicale - ${hopital.specialite}`);
    if (result.success) {
      toast({
        title: result.method === 'native' ? "Partagé !" : "Lien copié !",
        description: result.method === 'native' 
          ? `${hopital.nom} a été partagé` 
          : "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  const handleAppeler = (telephone: string, nom: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${nom}`,
    });
  };

  const handleItineraire = (hopital: Hopital) => {
    setNavigationDestination({
      id: hopital.id,
      nom: hopital.nom,
      adresse: hopital.adresse,
      latitude: hopital.latitude,
      longitude: hopital.longitude,
      telephone: hopital.telephone,
      type: 'hôpital',
    });
    setShowNavigation(true);
  };

  const handleWhatsApp = (whatsapp: string, nom: string) => {
    const message = encodeURIComponent(`Bonjour, j'ai besoin d'une urgence médicale.`);
    const url = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
    toast({
      title: "WhatsApp ouvert",
      description: `Discussion avec ${nom}`,
    });
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
              <div className="p-2 rounded-xl bg-red-500/20">
                <Phone className="h-6 w-6 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-white">Urgence Médicale</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {/* Message d'avertissement */}
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="p-4">
              <p className="text-white text-sm text-center">
                ⚠️ En cas d'urgence vitale, appelez immédiatement le 112 ou rendez-vous à l'hôpital le plus proche.
              </p>
            </CardContent>
          </Card>

          {/* Liste des hôpitaux */}
          <div className="space-y-4">
            {hopitaux.map((hopital) => (
              <Card 
                key={hopital.id} 
                id={`hopital-${hopital.id}`}
                className={`bg-gray-900/50 border-gray-800 overflow-hidden transition-all duration-500 ${
                  highlightedId === hopital.id 
                    ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black scale-[1.02]' 
                    : ''
                }`}
              >
                <CardContent className="p-0">
                  {/* Image */}
                  {hopital.image && (
                    <div className="relative w-full h-48">
                      <Image
                        src={hopital.image}
                        alt={hopital.nom}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="bg-black/50 hover:bg-black/70 h-8 w-8"
                          onClick={() => handleShare(hopital)}
                        >
                          <Share2 className="h-4 w-4 text-white" />
                        </Button>
                        {hopital.note && (
                          <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-sm font-semibold">{hopital.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-4">
                    {/* Informations */}
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">{hopital.nom}</h3>
                      {hopital.specialite && (
                        <p className="text-red-400 text-sm font-semibold mb-2">{hopital.specialite}</p>
                      )}
                      <div className="flex items-start gap-2 text-gray-400 text-sm mb-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{hopital.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{hopital.horaire}</span>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleItineraire(hopital)}
                        variant="outline"
                        className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 h-10 text-xs"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Itinéraire
                      </Button>
                      <Button
                        onClick={() => handleAppeler(hopital.telephone, hopital.nom)}
                        variant="outline"
                        className="flex-1 border-red-600/50 bg-red-600/20 text-white hover:bg-red-600/30 h-10 text-xs"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Appeler
                      </Button>
                      <Button
                        onClick={() => handleWhatsApp(hopital.whatsapp, hopital.nom)}
                        variant="outline"
                        className="flex-1 border-green-600/50 bg-green-600/20 text-white hover:bg-green-600/30 h-10 text-xs"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de navigation */}
      <NavigationModal
        destination={navigationDestination}
        isOpen={showNavigation}
        onClose={() => setShowNavigation(false)}
        accentColor="#ef4444"
        destinationType="hôpital"
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

export default function UrgenceMedicalePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <UrgenceMedicalePageContent />
    </Suspense>
  );
}
