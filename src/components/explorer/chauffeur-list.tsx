'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, Car, Shield, Clock, DollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";

type Chauffeur = {
  id: string;
  nom: string;
  description: string;
  photo: string;
  ville: string;
  rating: number;
  phone?: string;
  vehicule?: string;
  disponible?: boolean;
  tarifBase?: number;
  tarifKm?: number;
  experience?: string;
};

interface ChauffeurListProps {
  chauffeurs: Chauffeur[];
  onChauffeurClick: (id: string) => void;
}

export function ChauffeurList({ chauffeurs, onChauffeurClick }: ChauffeurListProps) {
  return (
    <div className="space-y-4">
      {chauffeurs.map((chauffeur) => (
        <Card
          key={chauffeur.id}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden",
            !chauffeur.disponible && "opacity-75"
          )}
          onClick={() => onChauffeurClick(chauffeur.id)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#339966]">
                <AvatarImage src={chauffeur.photo} alt={chauffeur.nom} />
                <AvatarFallback className="bg-[#339966] text-white">
                  {chauffeur.nom.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg font-headline text-[#003366]">
                      {chauffeur.nom}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{chauffeur.ville}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn(
                      chauffeur.disponible 
                        ? "bg-[#339966] text-white" 
                        : "bg-gray-400 text-white"
                    )}>
                      {chauffeur.disponible ? 'Disponible' : 'Occupé'}
                    </Badge>
                    <Badge className="bg-[#FF8800] text-white">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      {chauffeur.rating}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 font-body text-sm mb-3 line-clamp-1">
                  {chauffeur.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {chauffeur.vehicule && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car className="h-4 w-4" />
                      <span className="text-xs">{chauffeur.vehicule}</span>
                    </div>
                  )}
                  {chauffeur.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs">{chauffeur.experience}</span>
                    </div>
                  )}
                  {chauffeur.tarifBase && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-[#FF8800]" />
                      <span className="font-semibold text-[#FF8800] text-xs">
                        {chauffeur.tarifBase.toLocaleString()} CDF base
                      </span>
                    </div>
                  )}
                  {chauffeur.tarifKm && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-xs">{chauffeur.tarifKm} CDF/km</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {chauffeur.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${chauffeur.phone}`;
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 bg-[#339966] hover:bg-[#339966]/90"
                    disabled={!chauffeur.disponible}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChauffeurClick(chauffeur.id);
                    }}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    {chauffeur.disponible ? 'Réserver' : 'Indisponible'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

