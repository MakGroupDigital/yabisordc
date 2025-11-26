'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Wifi, Car, UtensilsCrossed, Phone, Calendar } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Hotel = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  prix: number;
  ville: string;
  rating: number;
  stars: number;
  phone?: string;
  services?: string[];
  disponibilite?: boolean;
};

interface HotelListProps {
  hotels: Hotel[];
  onHotelClick: (id: string) => void;
}

export function HotelList({ hotels, onHotelClick }: HotelListProps) {
  return (
    <div className="space-y-6">
      {hotels.map((hotel) => (
        <Card
          key={hotel.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden"
          onClick={() => onHotelClick(hotel.id)}
        >
          <div className="flex flex-col md:flex-row">
            {/* Image principale */}
            <div className="relative h-64 md:h-48 md:w-64 flex-shrink-0">
              <Image
                src={hotel.images[0] || 'https://placehold.co/400x300'}
                alt={hotel.nom}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 left-3">
                <div className="flex gap-1">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FFCC00] text-[#FFCC00]" />
                  ))}
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-[#FF8800] text-white">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  {hotel.rating}
                </Badge>
              </div>
              {!hotel.disponibilite && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Complet</Badge>
                </div>
              )}
            </div>

            {/* Contenu */}
            <CardContent className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl font-headline text-[#003366]">
                  {hotel.nom}
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-headline font-bold text-[#FF8800]">
                    {hotel.prix.toLocaleString()} CDF
                  </div>
                  <div className="text-xs text-gray-500">par nuit</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="h-4 w-4" />
                <span>{hotel.ville}</span>
              </div>

              <p className="text-gray-600 font-body text-sm mb-4 line-clamp-2">
                {hotel.description}
              </p>

              {/* Services */}
              {hotel.services && hotel.services.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {hotel.services.slice(0, 4).map((service, idx) => {
                    const icons: Record<string, any> = {
                      'WiFi': Wifi,
                      'Parking': Car,
                      'Restaurant': UtensilsCrossed,
                    };
                    const Icon = icons[service] || null;
                    return (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {Icon && <Icon className="h-3 w-3 mr-1" />}
                        {service}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t">
                {hotel.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${hotel.phone}`;
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
                <Button
                  size="sm"
                  className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90"
                  disabled={!hotel.disponibilite}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHotelClick(hotel.id);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {hotel.disponibilite ? 'Réserver' : 'Indisponible'}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

