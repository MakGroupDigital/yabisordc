'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Building2, Navigation, Calendar } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Monument = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  annee?: string;
  type?: string;
  prix?: number;
  horaires?: string;
};

interface MonumentListProps {
  monuments: Monument[];
  onMonumentClick: (id: string) => void;
}

export function MonumentList({ monuments, onMonumentClick }: MonumentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {monuments.map((monument) => (
        <Card
          key={monument.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onMonumentClick(monument.id)}
        >
          <div className="relative h-64 w-full">
            <Image
              src={monument.images[0] || 'https://placehold.co/400x300'}
              alt={monument.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#FF8800] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {monument.rating}
              </Badge>
            </div>
            {monument.type && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  <Building2 className="h-3 w-3 mr-1" />
                  {monument.type}
                </Badge>
              </div>
            )}
            {monument.annee && (
              <div className="absolute bottom-16 left-3">
                <Badge className="bg-[#003366] text-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  {monument.annee}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <CardTitle className="text-xl font-headline mb-1">
                {monument.nom}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{monument.ville}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {monument.description}
            </p>
            <div className="flex items-center justify-between mb-4">
              {monument.prix !== undefined && (
                <div className="text-sm font-semibold text-[#FF8800]">
                  {monument.prix === 0 ? 'Gratuit' : `${monument.prix.toLocaleString()} CDF`}
                </div>
              )}
              {monument.horaires && (
                <div className="text-xs text-gray-500">
                  {monument.horaires}
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="w-full bg-[#003366] hover:bg-[#003366]/90"
              onClick={(e) => {
                e.stopPropagation();
                onMonumentClick(monument.id);
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Visiter
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

