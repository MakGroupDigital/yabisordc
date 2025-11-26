'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Sparkles, Clock, DollarSign, Users } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Activite = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  prix: number;
  duree?: string;
  participants?: number;
  type?: string;
  difficulte?: 'facile' | 'moyen' | 'difficile';
};

interface ActiviteListProps {
  activites: Activite[];
  onActiviteClick: (id: string) => void;
}

export function ActiviteList({ activites, onActiviteClick }: ActiviteListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activites.map((activite) => (
        <Card
          key={activite.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onActiviteClick(activite.id)}
        >
          <div className="relative h-56 w-full">
            <Image
              src={activite.images[0] || 'https://placehold.co/400x300'}
              alt={activite.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#FF8800] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {activite.rating}
              </Badge>
            </div>
            {activite.type && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {activite.type}
                </Badge>
              </div>
            )}
            {activite.difficulte && (
              <div className="absolute bottom-16 left-3">
                <Badge className={cn(
                  activite.difficulte === 'facile' && "bg-[#339966]",
                  activite.difficulte === 'moyen' && "bg-[#FFCC00]",
                  activite.difficulte === 'difficile' && "bg-[#FF8800]",
                  "text-white"
                )}>
                  {activite.difficulte}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <CardTitle className="text-xl font-headline mb-1">
                {activite.nom}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{activite.ville}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {activite.description}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {activite.duree && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{activite.duree}</span>
                </div>
              )}
              {activite.participants && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Max {activite.participants}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                <div className="text-lg font-headline font-bold text-[#FF8800]">
                  {activite.prix.toLocaleString()} CDF
                </div>
                <div className="text-xs text-gray-500">par personne</div>
              </div>
              <Button
                size="sm"
                className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onActiviteClick(activite.id);
                }}
              >
                Réserver
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

