'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShoppingBag, Phone, DollarSign, Clock } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Boutique = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  phone?: string;
  horaires?: string;
  categorie?: string;
  produits?: string[];
};

interface ShoppingListProps {
  boutiques: Boutique[];
  onBoutiqueClick: (id: string) => void;
}

export function ShoppingList({ boutiques, onBoutiqueClick }: ShoppingListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {boutiques.map((boutique) => (
        <Card
          key={boutique.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onBoutiqueClick(boutique.id)}
        >
          <div className="relative h-48 w-full">
            <Image
              src={boutique.images[0] || 'https://placehold.co/400x300'}
              alt={boutique.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#FF8800] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {boutique.rating}
              </Badge>
            </div>
            {boutique.categorie && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  {boutique.categorie}
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-headline text-[#003366] mb-2">
              {boutique.nom}
            </CardTitle>
            <p className="text-gray-600 font-body text-sm mb-3 line-clamp-2">
              {boutique.description}
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">{boutique.ville}</span>
              </div>
              {boutique.horaires && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{boutique.horaires}</span>
                </div>
              )}
            </div>
            {boutique.produits && boutique.produits.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Produits:</div>
                <div className="flex gap-1 flex-wrap">
                  {boutique.produits.slice(0, 3).map((produit, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {produit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              {boutique.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${boutique.phone}`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-[#003366]"
                onClick={(e) => {
                  e.stopPropagation();
                  onBoutiqueClick(boutique.id);
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Visiter
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

