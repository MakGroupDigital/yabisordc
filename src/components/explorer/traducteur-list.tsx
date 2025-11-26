'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Languages, Phone, MessageCircle, Globe, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

type Traducteur = {
  id: string;
  nom: string;
  description: string;
  photo: string;
  rating: number;
  phone?: string;
  langues?: string[];
  specialites?: string[];
  tarifHoraire?: number;
  experience?: string;
};

interface TraducteurListProps {
  traducteurs: Traducteur[];
  onTraducteurClick: (id: string) => void;
}

export function TraducteurList({ traducteurs, onTraducteurClick }: TraducteurListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {traducteurs.map((traducteur) => (
        <Card
          key={traducteur.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden"
          onClick={() => onTraducteurClick(traducteur.id)}
        >
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Avatar className="h-20 w-20 border-2 border-[#FFCC00]">
                <AvatarImage src={traducteur.photo} alt={traducteur.nom} />
                <AvatarFallback className="bg-[#FFCC00] text-white text-xl">
                  {traducteur.nom.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-headline text-[#003366]">
                    {traducteur.nom}
                  </CardTitle>
                  <Badge className="bg-[#FF8800] text-white">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {traducteur.rating}
                  </Badge>
                </div>
                {traducteur.experience && (
                  <div className="text-xs text-gray-500 mb-2">
                    {traducteur.experience}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {traducteur.description}
            </p>

            {/* Langues */}
            {traducteur.langues && traducteur.langues.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Langues:</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {traducteur.langues.map((langue, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-[#FFCC00]/10">
                      {langue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Spécialités */}
            {traducteur.specialites && traducteur.specialites.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Spécialités:</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {traducteur.specialites.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              {traducteur.tarifHoraire && (
                <div>
                  <div className="text-lg font-headline font-bold text-[#FF8800]">
                    {traducteur.tarifHoraire.toLocaleString()} CDF
                  </div>
                  <div className="text-xs text-gray-500">par heure</div>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                {traducteur.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${traducteur.phone}`;
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-[#003366]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTraducteurClick(traducteur.id);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

