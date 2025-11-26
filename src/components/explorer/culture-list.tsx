'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Music, Book, Image as ImageIcon, Navigation } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type LieuCulturel = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  type?: 'musee' | 'galerie' | 'theatre' | 'bibliotheque' | 'monument';
  prix?: number;
  horaires?: string;
};

interface CultureListProps {
  lieux: LieuCulturel[];
  onLieuClick: (id: string) => void;
}

const typeIcons = {
  musee: Book,
  galerie: ImageIcon,
  theatre: Music,
  bibliotheque: Book,
  monument: ImageIcon,
};

export function CultureList({ lieux, onLieuClick }: CultureListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {lieux.map((lieu) => {
        const Icon = typeIcons[lieu.type || 'musee'] || Book;
        
        return (
          <Card
            key={lieu.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
            onClick={() => onLieuClick(lieu.id)}
          >
            <div className="relative h-56 w-full">
              <Image
                src={lieu.images[0] || 'https://placehold.co/400x300'}
                alt={lieu.nom}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-[#FF8800] text-white">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  {lieu.rating}
                </Badge>
              </div>
              {lieu.type && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90">
                    <Icon className="h-3 w-3 mr-1" />
                    {lieu.type}
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <CardTitle className="text-xl font-headline mb-1">
                  {lieu.nom}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{lieu.ville}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
                {lieu.description}
              </p>
              <div className="flex items-center justify-between">
                {lieu.prix !== undefined && (
                  <div className="text-sm font-semibold text-[#FF8800]">
                    {lieu.prix === 0 ? 'Gratuit' : `${lieu.prix.toLocaleString()} CDF`}
                  </div>
                )}
                {lieu.horaires && (
                  <div className="text-xs text-gray-500">
                    {lieu.horaires}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                className="w-full mt-4 bg-[#003366] hover:bg-[#003366]/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onLieuClick(lieu.id);
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Découvrir
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

