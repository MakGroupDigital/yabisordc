'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Compass, ArrowLeft, MessageSquare, Phone, Star, MapPin, Languages } from 'lucide-react';
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

interface Guide {
  id: string;
  nom: string;
  prenom: string;
  description: string;
  ville: string;
  province: string;
  langues: string[];
  note: number;
  nombreAvis: number;
  experience: number;
  telephone: string;
  avatar?: string;
  prixParJour: number;
}

const guides: Guide[] = [
  {
    id: '1',
    nom: 'Mwamba',
    prenom: 'Jean',
    description: 'Guide expérimenté spécialisé dans les parcs nationaux et la faune',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    langues: ['Français', 'Lingala', 'Anglais'],
    note: 4.8,
    nombreAvis: 45,
    experience: 8,
    telephone: '+243 900 000 000',
    prixParJour: 50,
  },
  {
    id: '2',
    nom: 'Kasongo',
    prenom: 'Marie',
    description: 'Guide culturelle passionnée par l\'histoire et les traditions congolaises',
    ville: 'Lubumbashi',
    province: 'Haut-Katanga',
    langues: ['Français', 'Swahili', 'Anglais'],
    note: 4.9,
    nombreAvis: 67,
    experience: 12,
    telephone: '+243 900 000 001',
    prixParJour: 60,
  },
  {
    id: '3',
    nom: 'Tshisekedi',
    prenom: 'Pierre',
    description: 'Guide nature et aventure, expert en randonnées et observation d\'animaux',
    ville: 'Goma',
    province: 'Nord-Kivu',
    langues: ['Français', 'Kinyarwanda', 'Swahili'],
    note: 4.7,
    nombreAvis: 32,
    experience: 6,
    telephone: '+243 900 000 002',
    prixParJour: 55,
  },
  {
    id: '4',
    nom: 'Kabila',
    prenom: 'Sarah',
    description: 'Guide urbaine spécialisée dans les visites de Kinshasa et ses monuments',
    ville: 'Kinshasa',
    province: 'Kinshasa',
    langues: ['Français', 'Lingala', 'Anglais'],
    note: 4.6,
    nombreAvis: 28,
    experience: 5,
    telephone: '+243 900 000 003',
    prixParJour: 45,
  },
];

export default function GuideTouristiquePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  // Filtrer les guides
  const filteredGuides = guides.filter(guide =>
    `${guide.prenom} ${guide.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (telephone: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${telephone}`,
    });
  };

  const handleMessage = (guide: Guide) => {
    setSelectedGuide(guide);
    setShowMessageDialog(true);
  };

  const sendMessage = () => {
    if (!selectedGuide) return;
    if (!message.trim()) {
      toast({
        title: "Message vide",
        description: "Veuillez entrer un message",
        variant: "destructive",
      });
      return;
    }

    // Simuler l'envoi du message (ici, vous pourriez intégrer avec Firebase ou un service de messagerie)
    toast({
      title: "Message envoyé",
      description: `Message envoyé à ${selectedGuide.prenom} ${selectedGuide.nom}`,
    });
    setShowMessageDialog(false);
    setMessage('');
    setSelectedGuide(null);
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
                <Compass className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Guide Touristique</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-20 pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          {/* Barre de recherche */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <Input
                type="text"
                placeholder="Rechercher un guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </CardContent>
          </Card>

          {/* Liste des guides */}
          <div className="space-y-3">
            {filteredGuides.map((guide) => (
              <Card key={guide.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-[#FF8800]">
                      <AvatarImage src={guide.avatar} alt={`${guide.prenom} ${guide.nom}`} />
                      <AvatarFallback className="bg-[#FF8800] text-white font-semibold">
                        {guide.prenom.charAt(0)}{guide.nom.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {guide.prenom} {guide.nom}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{guide.ville}, {guide.province}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#FFCC00] fill-[#FFCC00]" />
                          <span className="text-white text-sm font-semibold">{guide.note}</span>
                          <span className="text-gray-500 text-xs">({guide.nombreAvis})</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{guide.description}</p>
                      
                      {/* Langues */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Languages className="h-4 w-4 text-gray-500" />
                        {guide.langues.map((langue, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded bg-[#FF8800]/20 text-[#FF8800]"
                          >
                            {langue}
                          </span>
                        ))}
                      </div>

                      {/* Prix et expérience */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-400">
                          <span>{guide.experience} ans d'expérience</span>
                        </div>
                        <div className="text-[#FF8800] font-semibold">
                          ${guide.prixParJour}/jour
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMessage(guide)}
                          variant="outline"
                          className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Écrire un message
                        </Button>
                        <Button
                          onClick={() => handleCall(guide.telephone)}
                          className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Appeler
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog pour envoyer un message */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Envoyer un message à {selectedGuide?.prenom} {selectedGuide?.nom}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Écrivez votre message ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                rows={6}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF8800]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessage('');
                  setSelectedGuide(null);
                }}
                variant="outline"
                className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button
                onClick={sendMessage}
                className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer
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
