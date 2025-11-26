'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Camera, Clock, DollarSign, Navigation } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type SiteTouristique = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  prix?: number;
  horaires?: string;
  type?: string;
  distance?: string;
};

interface SiteTouristiqueListProps {
  sites: SiteTouristique[];
  onSiteClick: (id: string) => void;
}

export function SiteTouristiqueList({ sites, onSiteClick }: SiteTouristiqueListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sites.map((site) => (
        <Card
          key={site.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onSiteClick(site.id)}
        >
          <div className="relative h-64 w-full">
            <Image
              src={site.images[0] || 'https://placehold.co/400x300'}
              alt={site.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#FF8800] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {site.rating}
              </Badge>
            </div>
            {site.type && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  {site.type}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <CardTitle className="text-xl font-headline mb-1">
                {site.nom}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{site.ville}</span>
                {site.distance && (
                  <>
                    <span>•</span>
                    <span>{site.distance}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {site.description}
            </p>
            <div className="flex items-center justify-between">
              {site.prix !== undefined && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#FF8800]" />
                  <span className="font-semibold text-[#FF8800]">
                    {site.prix === 0 ? 'Gratuit' : `${site.prix.toLocaleString()} CDF`}
                  </span>
                </div>
              )}
              {site.horaires && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{site.horaires}</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="w-full mt-4 bg-[#FF8800] hover:bg-[#FF8800]/90"
              onClick={(e) => {
                e.stopPropagation();
                onSiteClick(site.id);
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Voir les détails
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

