'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, MessageCircle, Languages, Award } from 'lucide-react';
import { cn } from "@/lib/utils";

type Guide = {
  id: string;
  nom: string;
  description: string;
  photo: string;
  ville: string;
  rating: number;
  phone?: string;
  langues?: string[];
  experience?: string;
  specialites?: string[];
  prix: number;
};

interface GuideListProps {
  guides: Guide[];
  onGuideClick: (id: string) => void;
}

export function GuideList({ guides, onGuideClick }: GuideListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {guides.map((guide) => (
        <Card
          key={guide.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden"
          onClick={() => onGuideClick(guide.id)}
        >
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Avatar className="h-20 w-20 border-2 border-[#FFCC00]">
                <AvatarImage src={guide.photo} alt={guide.nom} />
                <AvatarFallback className="bg-[#FF8800] text-white text-xl">
                  {guide.nom.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-headline text-[#003366]">
                    {guide.nom}
                  </CardTitle>
                  <Badge className="bg-[#FF8800] text-white">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {guide.rating}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{guide.ville}</span>
                </div>
                {guide.experience && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Award className="h-3 w-3" />
                    <span>{guide.experience}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
              {guide.description}
            </p>

            {/* Langues */}
            {guide.langues && guide.langues.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Langues parlées:</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {guide.langues.map((langue, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {langue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Spécialités */}
            {guide.specialites && guide.specialites.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 flex-wrap">
                  {guide.specialites.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="text-lg font-headline font-bold text-[#FF8800]">
                  {guide.prix.toLocaleString()} CDF
                </div>
                <div className="text-xs text-gray-500">par jour</div>
              </div>
              <div className="flex gap-2">
                {guide.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${guide.phone}`;
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGuideClick(guide.id);
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

