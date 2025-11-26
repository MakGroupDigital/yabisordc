'use client';

import { Header } from "@/components/home/feed-header";
import { BottomNav } from "@/components/home/bottom-nav";
import { Heart, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  // TODO: Récupérer les favoris depuis Firebase
  const favorites = [
    // Exemple de données - à remplacer par les vraies données
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Titre Favoris */}
          <div className="mb-6">
            <h1 className="text-3xl font-headline font-bold text-[#003366]">
              Favoris
            </h1>
            <p className="text-gray-600 mt-2 font-body">
              Vos endroits et services préférés
            </p>
          </div>

          {/* Liste des favoris */}
          {favorites.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-[#FF8800]/10 p-6">
                    <Heart className="h-12 w-12 text-[#FF8800]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-headline font-semibold text-[#003366] mb-2">
                    Aucun favori pour le moment
                  </h3>
                  <p className="text-gray-600 font-body mb-6">
                    Commencez à explorer et ajoutez vos endroits préférés
                  </p>
                  <Button 
                    className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                    onClick={() => window.location.href = '/home/explorer'}
                  >
                    Explorer maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-headline text-[#003366]">
                      {favorite.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-body">{favorite.location}</span>
                      </div>
                      {favorite.date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-body">{favorite.date}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

