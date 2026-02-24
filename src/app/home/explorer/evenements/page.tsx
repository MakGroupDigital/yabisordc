'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Calendar, ArrowLeft, Phone, Info, MapPin, Clock, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Evenement {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  lieu: string;
  image: string;
  contact: string;
  prix?: string;
  capacite?: number;
  organisateur?: string;
}

const evenements: Evenement[] = [
  {
    id: '1',
    titre: 'Festival de Musique Africaine',
    description: 'Grand festival de musique mettant en avant les talents africains avec des artistes locaux et internationaux.',
    date: '15 Mars 2024',
    heure: '18:00',
    lieu: 'Stade des Martyrs, Kinshasa',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    contact: '+243 900 002 100',
    prix: '15$',
    capacite: 5000,
    organisateur: 'Ya Biso Events',
  },
  {
    id: '2',
    titre: 'Exposition d\'Art Contemporain',
    description: 'Découvrez les œuvres d\'artistes congolais contemporains lors de cette exposition exceptionnelle.',
    date: '20 Mars 2024',
    heure: '10:00',
    lieu: 'Musée National, Kinshasa',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
    contact: '+243 900 002 101',
    prix: 'Gratuit',
    capacite: 200,
    organisateur: 'Ministère de la Culture',
  },
  {
    id: '3',
    titre: 'Conférence Tech & Innovation',
    description: 'Conférence sur les technologies émergentes et l\'innovation en RDC avec des intervenants de renom.',
    date: '25 Mars 2024',
    heure: '09:00',
    lieu: 'Palais du Peuple, Kinshasa',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    contact: '+243 900 002 102',
    prix: '10$',
    capacite: 1000,
    organisateur: 'Tech RDC',
  },
  {
    id: '4',
    titre: 'Concert Jazz & Blues',
    description: 'Soirée inoubliable avec des performances live de musiciens de jazz et blues congolais.',
    date: '30 Mars 2024',
    heure: '20:00',
    lieu: 'Théâtre National, Kinshasa',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    contact: '+243 900 002 103',
    prix: '20$',
    capacite: 500,
    organisateur: 'Jazz Kinshasa',
  },
  {
    id: '5',
    titre: 'Festival de Cinéma Africain',
    description: 'Projection de films africains primés avec des séances en plein air et des rencontres avec les réalisateurs.',
    date: '5 Avril 2024',
    heure: '19:00',
    lieu: 'Centre Culturel, Kinshasa',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    contact: '+243 900 002 104',
    prix: '12$',
    capacite: 300,
    organisateur: 'Ciné RDC',
  },
];

export default function EvenementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);

  const handleContact = (contact: string, titre: string) => {
    window.location.href = `tel:${contact}`;
    toast({
      title: "Appel en cours",
      description: `Contact de ${titre}`,
    });
  };

  const handleEnSavoirPlus = (evenement: Evenement) => {
    setSelectedEvent(evenement);
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
                <Calendar className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Événements</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {/* Liste des événements */}
          {evenements.map((evenement) => (
            <Card key={evenement.id} className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative w-full h-56">
                  <Image
                    src={evenement.image}
                    alt={evenement.titre}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <div className="bg-[#FF8800] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {evenement.prix || 'Gratuit'}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Informations principales */}
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{evenement.titre}</h3>
                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{evenement.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{evenement.heure}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-gray-400 text-sm mb-3">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{evenement.lieu}</span>
                    </div>
                    {evenement.capacite && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Users className="h-4 w-4" />
                        <span>Capacité: {evenement.capacite} places</span>
                      </div>
                    )}
                    {evenement.organisateur && (
                      <p className="text-[#FF8800] text-sm font-semibold mb-2">
                        Organisé par: {evenement.organisateur}
                      </p>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleContact(evenement.contact, evenement.titre)}
                      variant="outline"
                      className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button
                      onClick={() => handleEnSavoirPlus(evenement)}
                      className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog En savoir plus */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedEvent?.titre}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedEvent?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedEvent.date} à {selectedEvent.heure}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{selectedEvent.lieu}</span>
                </div>
                {selectedEvent.prix && (
                  <div className="flex items-center gap-2 text-[#FF8800] font-semibold">
                    <span>Prix: {selectedEvent.prix}</span>
                  </div>
                )}
                {selectedEvent.organisateur && (
                  <div className="text-gray-300">
                    <span className="font-semibold">Organisateur: </span>
                    <span>{selectedEvent.organisateur}</span>
                  </div>
                )}
                {selectedEvent.capacite && (
                  <div className="text-gray-300">
                    <span className="font-semibold">Capacité: </span>
                    <span>{selectedEvent.capacite} places</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleContact(selectedEvent.contact, selectedEvent.titre)}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contacter l'organisateur
              </Button>
            </div>
          )}
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
