'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Mountain, Navigation, Camera } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type SiteNature = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  rating: number;
  type?: 'foret' | 'parc' | 'cascade' | 'montagne' | 'reserve';
  distance?: string;
  difficulte?: 'facile' | 'moyen' | 'difficile';
};

interface NatureListProps {
  sites: SiteNature[];
  onSiteClick: (id: string) => void;
}

export function NatureList({ sites, onSiteClick }: NatureListProps) {
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
              <Badge className="bg-[#339966] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {site.rating}
              </Badge>
            </div>
            {site.type && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90">
                  <Mountain className="h-3 w-3 mr-1" />
                  {site.type}
                </Badge>
              </div>
            )}
            {site.difficulte && (
              <div className="absolute bottom-16 left-3">
                <Badge className={cn(
                  site.difficulte === 'facile' && "bg-[#339966]",
                  site.difficulte === 'moyen' && "bg-[#FFCC00]",
                  site.difficulte === 'difficile' && "bg-[#FF8800]",
                  "text-white"
                )}>
                  {site.difficulte}
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
            <Button
              size="sm"
              className="w-full bg-[#339966] hover:bg-[#339966]/90"
              onClick={(e) => {
                e.stopPropagation();
                onSiteClick(site.id);
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Explorer
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

