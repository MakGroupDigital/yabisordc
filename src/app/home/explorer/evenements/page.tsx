'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { Calendar, ArrowLeft, Music, Film, Ticket, Users, MapPin, Clock, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const JUINGO_URL = 'https://app.juingo.com';

export default function EvenementsPage() {
  const router = useRouter();
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const { toast } = useToast();

  const handleRedirect = () => {
    // Ouvrir dans un nouvel onglet
    window.open(JUINGO_URL, '_blank');
    
    toast({
      title: "Redirection vers Juingo",
      description: "Vous allez être redirigé vers notre plateforme de billetterie Juingo",
      duration: 3000,
    });

    // Fermer le dialog après un court délai
    setTimeout(() => {
      setShowRedirectDialog(false);
    }, 500);
  };

  const features = [
    {
      icon: Ticket,
      title: 'Billetterie en ligne',
      description: 'Achetez vos billets pour tous les événements',
      color: 'text-blue-400',
    },
    {
      icon: Music,
      title: 'Concerts & Festivals',
      description: 'Découvrez les meilleurs événements musicaux',
      color: 'text-purple-400',
    },
    {
      icon: Film,
      title: 'Cinéma & Spectacles',
      description: 'Réservez vos places pour le cinéma et les spectacles',
      color: 'text-pink-400',
    },
    {
      icon: Users,
      title: 'Événements culturels',
      description: 'Participez à des événements culturels et sociaux',
      color: 'text-green-400',
    },
  ];

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
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Carte principale Juingo */}
          <Card className="bg-gradient-to-br from-[#FF8800]/10 via-gray-900 to-gray-900 border-[#FF8800]/30 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-2xl bg-[#FF8800]/20 w-fit relative">
                <Calendar className="h-12 w-12 text-[#FF8800]" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-5 w-5 text-[#FFCC00]" fill="#FFCC00" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Juingo
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Plateforme de billetterie moderne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                <p className="text-white text-center text-sm leading-relaxed">
                  Vous allez être redirigé vers notre plateforme experte <span className="font-semibold text-[#FF8800]">Juingo</span>, 
                  une solution moderne de billetterie pour découvrir et réserver vos événements préférés.
                </p>
              </div>

              {/* Liste des fonctionnalités */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-lg mb-4">Fonctionnalités disponibles :</h3>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-[#FF8800]/50 transition-all"
                    >
                      <div className={`p-2 rounded-lg bg-gray-800 ${feature.color} bg-opacity-20`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton de redirection */}
              <Button
                onClick={() => setShowRedirectDialog(true)}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-14 text-lg font-semibold"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Accéder à Juingo
              </Button>

              <p className="text-xs text-gray-500 text-center">
                En cliquant, vous serez redirigé vers app.juingo.com
              </p>
            </CardContent>
          </Card>

          {/* Carte d'information supplémentaire */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#FF8800]/20">
                  <CheckCircle2 className="h-6 w-6 text-[#FF8800]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">Pourquoi Juingo ?</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Juingo est notre plateforme experte dédiée à la billetterie et aux événements. 
                    Découvrez une large gamme d'événements : concerts, festivals, spectacles, cinéma et bien plus encore. 
                    Réservez vos billets en quelques clics, rapidement et en toute sécurité.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog de confirmation */}
      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <div className="mx-auto mb-4 p-4 rounded-2xl bg-[#FF8800]/20 w-fit relative">
              <Calendar className="h-10 w-10 text-[#FF8800]" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-[#FFCC00]" fill="#FFCC00" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Redirection vers Juingo
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center mt-2">
              Vous allez être redirigé vers notre plateforme de billetterie Juingo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
              <p className="text-white text-sm text-center">
                La plateforme Juingo s'ouvrira dans un nouvel onglet pour une meilleure expérience.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRedirect}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg font-semibold"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Oui, rediriger vers Juingo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRedirectDialog(false)}
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

