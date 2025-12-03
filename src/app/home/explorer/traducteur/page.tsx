'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Languages, ArrowLeft, MessageSquare, Phone, Star, Globe } from 'lucide-react';
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

interface Traducteur {
  id: string;
  nom: string;
  prenom: string;
  langues: { langue: string; niveau: 'Natif' | 'Courant' | 'Intermédiaire' }[];
  ville: string;
  province: string;
  note: number;
  nombreAvis: number;
  experience: number;
  telephone: string;
  avatar?: string;
  prixParHeure: number;
  disponible: boolean;
}

const traducteurs: Traducteur[] = [
  {
    id: '1',
    nom: 'Bakala',
    prenom: 'Sophie',
    langues: [
      { langue: 'Français', niveau: 'Natif' },
      { langue: 'Anglais', niveau: 'Courant' },
      { langue: 'Lingala', niveau: 'Natif' },
      { langue: 'Swahili', niveau: 'Courant' },
    ],
    ville: 'Kinshasa',
    province: 'Kinshasa',
    note: 4.8,
    nombreAvis: 67,
    experience: 5,
    telephone: '+243 900 000 200',
    prixParHeure: 20,
    disponible: true,
  },
  {
    id: '2',
    nom: 'Musasa',
    prenom: 'David',
    langues: [
      { langue: 'Français', niveau: 'Natif' },
      { langue: 'Anglais', niveau: 'Natif' },
      { langue: 'Espagnol', niveau: 'Courant' },
      { langue: 'Portugais', niveau: 'Intermédiaire' },
    ],
    ville: 'Lubumbashi',
    province: 'Haut-Katanga',
    note: 4.9,
    nombreAvis: 89,
    experience: 8,
    telephone: '+243 900 000 201',
    prixParHeure: 25,
    disponible: true,
  },
  {
    id: '3',
    nom: 'Kisanga',
    prenom: 'Julie',
    langues: [
      { langue: 'Français', niveau: 'Natif' },
      { langue: 'Lingala', niveau: 'Natif' },
      { langue: 'Kikongo', niveau: 'Natif' },
      { langue: 'Anglais', niveau: 'Courant' },
    ],
    ville: 'Kinshasa',
    province: 'Kinshasa',
    note: 4.7,
    nombreAvis: 45,
    experience: 6,
    telephone: '+243 900 000 202',
    prixParHeure: 18,
    disponible: true,
  },
  {
    id: '4',
    nom: 'Mwamba',
    prenom: 'Jean',
    langues: [
      { langue: 'Swahili', niveau: 'Natif' },
      { langue: 'Français', niveau: 'Courant' },
      { langue: 'Anglais', niveau: 'Courant' },
      { langue: 'Kinyarwanda', niveau: 'Natif' },
    ],
    ville: 'Goma',
    province: 'Nord-Kivu',
    note: 4.6,
    nombreAvis: 34,
    experience: 4,
    telephone: '+243 900 000 203',
    prixParHeure: 22,
    disponible: false,
  },
];

export default function TraducteurPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTraducteur, setSelectedTraducteur] = useState<Traducteur | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  // Filtrer les traducteurs
  const filteredTraducteurs = traducteurs.filter(traducteur =>
    `${traducteur.prenom} ${traducteur.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    traducteur.langues.some(l => l.langue.toLowerCase().includes(searchQuery.toLowerCase())) ||
    traducteur.ville.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (telephone: string) => {
    window.location.href = `tel:${telephone}`;
    toast({
      title: "Appel en cours",
      description: `Appel de ${telephone}`,
    });
  };

  const handleMessage = (traducteur: Traducteur) => {
    setSelectedTraducteur(traducteur);
    setShowMessageDialog(true);
  };

  const sendMessage = () => {
    if (!selectedTraducteur) return;
    if (!message.trim()) {
      toast({
        title: "Message vide",
        description: "Veuillez entrer un message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message envoyé",
      description: `Message envoyé à ${selectedTraducteur.prenom} ${selectedTraducteur.nom}`,
    });
    setShowMessageDialog(false);
    setMessage('');
    setSelectedTraducteur(null);
  };

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Natif':
        return 'bg-green-500/20 text-green-400';
      case 'Courant':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
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
                <Languages className="h-6 w-6 text-[#FF8800]" />
              </div>
              <h1 className="text-xl font-bold text-white">Traducteur</h1>
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
                placeholder="Rechercher un traducteur ou une langue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </CardContent>
          </Card>

          {/* Liste des traducteurs */}
          <div className="space-y-3">
            {filteredTraducteurs.map((traducteur) => (
              <Card
                key={traducteur.id}
                className={`bg-gray-900/50 border-gray-800 ${
                  !traducteur.disponible ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-[#FF8800]">
                      <AvatarImage src={traducteur.avatar} alt={`${traducteur.prenom} ${traducteur.nom}`} />
                      <AvatarFallback className="bg-[#FF8800] text-white font-semibold">
                        {traducteur.prenom.charAt(0)}{traducteur.nom.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {traducteur.prenom} {traducteur.nom}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <Globe className="h-3 w-3" />
                            <span>{traducteur.ville}, {traducteur.province}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#FFCC00] fill-[#FFCC00]" />
                          <span className="text-white text-sm font-semibold">{traducteur.note}</span>
                          <span className="text-gray-500 text-xs">({traducteur.nombreAvis})</span>
                        </div>
                      </div>

                      {/* Langues */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {traducteur.langues.map((langue, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded ${getNiveauColor(langue.niveau)}`}
                            >
                              {langue.langue}
                            </span>
                            <span className="text-xs text-gray-500">({langue.niveau})</span>
                          </div>
                        ))}
                      </div>

                      {/* Prix et statut */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-400">
                          <span>{traducteur.experience} ans d'expérience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              traducteur.disponible
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {traducteur.disponible ? 'Disponible' : 'Indisponible'}
                          </span>
                          <span className="text-[#FF8800] font-semibold">
                            ${traducteur.prixParHeure}/h
                          </span>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMessage(traducteur)}
                          variant="outline"
                          disabled={!traducteur.disponible}
                          className="flex-1 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          onClick={() => handleCall(traducteur.telephone)}
                          disabled={!traducteur.disponible}
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
              Envoyer un message à {selectedTraducteur?.prenom} {selectedTraducteur?.nom}
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
                  setSelectedTraducteur(null);
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
