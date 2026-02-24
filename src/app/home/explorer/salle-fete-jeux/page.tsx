'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { ArrowLeft, Phone, MessageCircle, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { shareItem, clearSharedItem } from '@/lib/share-utils';

interface SalleOffre {
  id: string;
  nom: string;
  description: string;
  telephone: string;
  whatsapp: string;
  images: string[];
  type: 'salle-fete' | 'jeux';
}

const offres: SalleOffre[] = [
  {
    id: '1',
    nom: 'Salle de Fête Le Palais',
    description: 'Salle élégante pour vos événements : mariages, anniversaires, cérémonies. Capacité jusqu\'à 300 personnes.',
    telephone: '+243 900 003 100',
    whatsapp: '+243900003100',
    type: 'salle-fete',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f29da2c4fe?w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    ],
  },
  {
    id: '2',
    nom: 'Arcade Zone - Centre de Jeux',
    description: 'Espace de jeux moderne avec jeux vidéo, billard, bowling et plus. Parfait pour les groupes et familles.',
    telephone: '+243 900 003 101',
    whatsapp: '+243900003101',
    type: 'jeux',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
      'https://images.unsplash.com/photo-1595846519845-68e298c2eed7?w=800&q=80',
    ],
  },
  {
    id: '3',
    nom: 'Salle des Fêtes Royal',
    description: 'Grande salle de réception avec terrasse extérieure. Idéale pour vos grandes célébrations.',
    telephone: '+243 900 003 102',
    whatsapp: '+243900003102',
    type: 'salle-fete',
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f29da2c4fe?w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    ],
  },
  {
    id: '4',
    nom: 'Fun Park - Parc de Jeux',
    description: 'Parc de jeux pour enfants et adultes avec attractions, jeux gonflables et activités de groupe.',
    telephone: '+243 900 003 103',
    whatsapp: '+243900003103',
    type: 'jeux',
    images: [
      'https://images.unsplash.com/photo-1595846519845-68e298c2eed7?w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    ],
  },
  {
    id: '5',
    nom: 'Salle Événementielle Prestige',
    description: 'Salle moderne et sophistiquée avec équipements audio-visuels. Parfaite pour conférences et galas.',
    telephone: '+243 900 003 104',
    whatsapp: '+243900003104',
    type: 'salle-fete',
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f29da2c4fe?w=800&q=80',
    ],
  },
];

export const dynamic = 'force-dynamic';

function SalleFeteJeuxPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [currentImages, setCurrentImages] = useState<Record<string, number>>({});
  const [isScrolling, setIsScrolling] = useState<Record<string, boolean>>({});
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Gérer les deep links
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(highlight);
      clearSharedItem();
      
      setTimeout(() => {
        const element = document.getElementById(`salle-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
    }
  }, [searchParams]);

  // Initialiser les indices d'images pour chaque offre
  useEffect(() => {
    const initial: Record<string, number> = {};
    offres.forEach(offre => {
      initial[offre.id] = 0;
    });
    setCurrentImages(initial);
  }, []);

  // Auto-scroll horizontal pour chaque offre
  useEffect(() => {
    offres.forEach(offre => {
      if (offre.images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImages(prev => ({
          ...prev,
          [offre.id]: ((prev[offre.id] || 0) + 1) % offre.images.length,
        }));
      }, 4000);

      return () => clearInterval(interval);
    });
  }, []);

  // Fonction pour faire défiler les images
  const scrollToImage = (offreId: string, index: number) => {
    const container = scrollRefs.current[offreId];
    if (!container) return;

    const imageWidth = container.clientWidth;
    container.scrollTo({
      left: imageWidth * index,
      behavior: 'smooth',
    });
    setCurrentImages(prev => ({ ...prev, [offreId]: index }));
  };

  // Gestion du swipe/drag horizontal
  const handleTouchStart = (offreId: string) => {
    setIsScrolling(prev => ({ ...prev, [offreId]: true }));
  };

  const handleTouchEnd = (offreId: string) => {
    setIsScrolling(prev => ({ ...prev, [offreId]: false }));
  };

  const handleScroll = (offreId: string) => {
    if (isScrolling[offreId]) return;
    
    const container = scrollRefs.current[offreId];
    if (!container) return;

    const imageWidth = container.clientWidth;
    const currentIndex = Math.round(container.scrollLeft / imageWidth);
    setCurrentImages(prev => ({ ...prev, [offreId]: currentIndex }));
  };

  const handleAppeler = (telephone: string, nom: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${nom}`,
    });
  };

  const handleWhatsApp = (whatsapp: string, nom: string) => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre offre ${nom}.`);
    const url = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
    toast({
      title: "WhatsApp ouvert",
      description: `Discussion avec ${nom}`,
    });
  };

  const handleShare = async (offre: SalleOffre) => {
    const result = await shareItem('salle', offre.id, offre.nom, offre.description);
    if (result.success) {
      toast({
        title: result.method === 'native' ? "Partagé !" : "Lien copié !",
        description: result.method === 'native' 
          ? `${offre.nom} a été partagé` 
          : "Le lien a été copié dans le presse-papiers",
      });
    }
  };

  const nextImage = (offreId: string, maxImages: number) => {
    setCurrentImages(prev => {
      const next = ((prev[offreId] || 0) + 1) % maxImages;
      scrollToImage(offreId, next);
      return { ...prev, [offreId]: next };
    });
  };

  const prevImage = (offreId: string, maxImages: number) => {
    setCurrentImages(prev => {
      const prevIndex = ((prev[offreId] || 0) - 1 + maxImages) % maxImages;
      scrollToImage(offreId, prevIndex);
      return { ...prev, [offreId]: prevIndex };
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
              <div className="p-2 rounded-xl bg-[#FF8800]/20">
                <MessageCircle className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Salle de Fête et Jeux</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu - Style Instagram (feed vertical) */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="space-y-0">
          {offres.map((offre) => (
            <Card 
              key={offre.id} 
              id={`salle-${offre.id}`}
              className={`bg-black border-b border-gray-800 rounded-none transition-all duration-500 ${
                highlightedId === offre.id 
                  ? 'ring-2 ring-[#FF8800] ring-offset-2 ring-offset-black scale-[1.02]' 
                  : ''
              }`}
            >
              <CardContent className="p-0">
                {/* Header de la carte (comme Instagram) */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8800] to-[#FF6600] flex items-center justify-center text-white font-bold">
                    {offre.nom.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">{offre.nom}</h3>
                    <p className="text-gray-400 text-xs">
                      {offre.type === 'salle-fete' ? 'Salle de Fête' : 'Centre de Jeux'}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={() => handleShare(offre)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Galerie d'images défilantes horizontalement */}
                <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                  <div
                    ref={(el) => {
                      scrollRefs.current[offre.id] = el;
                    }}
                    className="flex overflow-x-scroll scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onTouchStart={() => handleTouchStart(offre.id)}
                    onTouchEnd={() => handleTouchEnd(offre.id)}
                    onScroll={() => handleScroll(offre.id)}
                  >
                    {offre.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative min-w-full h-full snap-start"
                      >
                        <Image
                          src={image}
                          alt={`${offre.nom} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Boutons de navigation (si plusieurs images) */}
                  {offre.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                        onClick={() => prevImage(offre.id, offre.images.length)}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                        onClick={() => nextImage(offre.id, offre.images.length)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>

                      {/* Indicateurs de pagination */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {offre.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => scrollToImage(offre.id, index)}
                            className={`h-1.5 rounded-full transition-all ${
                              (currentImages[offre.id] || 0) === index
                                ? 'w-6 bg-white'
                                : 'w-1.5 bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Description et actions */}
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{offre.nom}</p>
                    <p className="text-gray-300 text-sm">{offre.description}</p>
                  </div>

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={() => handleAppeler(offre.telephone, offre.nom)}
                      variant="outline"
                      className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                    <Button
                      onClick={() => handleWhatsApp(offre.whatsapp, offre.nom)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default function SalleFeteJeuxPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <SalleFeteJeuxPageContent />
    </Suspense>
  );
}



