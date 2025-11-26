'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, DollarSign, Phone, UtensilsCrossed } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

type Restaurant = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  prix: number;
  ville: string;
  rating: number;
  phone?: string;
  horaires?: string;
  specialites?: string[];
};

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRestaurantClick: (id: string) => void;
}

export function RestaurantList({ restaurants, onRestaurantClick }: RestaurantListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {restaurants.map((restaurant) => (
        <Card
          key={restaurant.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden group"
          onClick={() => onRestaurantClick(restaurant.id)}
        >
          <div className="relative h-48 w-full">
            <Image
              src={restaurant.images[0] || 'https://placehold.co/400x300'}
              alt={restaurant.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge className="bg-[#FF8800] text-white">
                <Star className="h-3 w-3 mr-1 fill-white" />
                {restaurant.rating}
              </Badge>
            </div>
            {restaurant.specialites && restaurant.specialites.length > 0 && (
              <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                {restaurant.specialites.slice(0, 2).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white/90 text-[#003366]">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-headline text-[#003366] mb-2">
              {restaurant.nom}
            </CardTitle>
            <p className="text-gray-600 font-body text-sm mb-3 overflow-hidden text-ellipsis" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {restaurant.description}
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.ville}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-[#FF8800]" />
                  <span className="font-semibold text-[#FF8800]">
                    {restaurant.prix.toLocaleString()} CDF
                  </span>
                  <span className="text-gray-500 text-xs">/personne</span>
                </div>
                {restaurant.horaires && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{restaurant.horaires}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t">
              {restaurant.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${restaurant.phone}`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestaurantClick(restaurant.id);
                }}
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Réserver
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

