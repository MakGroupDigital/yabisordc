'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Waves, Sun, Navigation } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Plage = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  distance?: string;
  activites?: string[];
  prix?: number;
};

interface PlageListProps {
  plages: Plage[];
  onPlageClick: (id: string) => void;
}

export function PlageList({ plages, onPlageClick }: PlageListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plages.map((plage) => (
        <Card
          key={plage.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onPlageClick(plage.id)}
        >
          <div className="relative h-64 w-full">
            <Image
              src={plage.images[0] || 'https://placehold.co/400x300'}
              alt={plage.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#FFCC00] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {plage.rating}
              </Badge>
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90">
                <Waves className="h-3 w-3 mr-1" />
                Plage
              </Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <CardTitle className="text-xl font-headline mb-1">
                {plage.nom}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{plage.ville}</span>
                {plage.distance && (
                  <>
                    <span>•</span>
                    <span>{plage.distance}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {plage.description}
            </p>
            {plage.activites && plage.activites.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 flex-wrap">
                  {plage.activites.slice(0, 3).map((activite, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {activite}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              {plage.prix !== undefined && (
                <div className="text-sm font-semibold text-[#FF8800]">
                  {plage.prix === 0 ? 'Gratuit' : `${plage.prix.toLocaleString()} CDF`}
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="w-full bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-[#003366]"
              onClick={(e) => {
                e.stopPropagation();
                onPlageClick(plage.id);
              }}
            >
              <Sun className="h-4 w-4 mr-2" />
              Découvrir
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

