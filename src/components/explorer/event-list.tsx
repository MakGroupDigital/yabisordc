'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Ticket, Music } from 'lucide-react';
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Event = {
  id: string;
  nom: string;
  description: string;
  images: string[];
  ville: string;
  date: Date;
  heure: string;
  prix: number;
  placesDisponibles?: number;
  type?: string;
  organisateur?: string;
};

interface EventListProps {
  events: Event[];
  onEventClick: (id: string) => void;
}

export function EventList({ events, onEventClick }: EventListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className="cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden"
          onClick={() => onEventClick(event.id)}
        >
          <div className="flex flex-col md:flex-row">
            {/* Image avec date */}
            <div className="relative h-48 md:h-40 md:w-48 flex-shrink-0">
              <Image
                src={event.images[0] || 'https://placehold.co/400x300'}
                alt={event.nom}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 left-3">
                <div className="bg-white rounded-lg p-2 text-center shadow-lg">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {format(event.date, 'MMM', { locale: fr })}
                  </div>
                  <div className="text-2xl font-headline font-bold text-[#FF8800]">
                    {format(event.date, 'd')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(event.date, 'EEE', { locale: fr })}
                  </div>
                </div>
              </div>
              {event.type && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#FF8800] text-white">
                    {event.type}
                  </Badge>
                </div>
              )}
            </div>

            {/* Contenu */}
            <CardContent className="p-4 flex-1">
              <CardTitle className="text-xl font-headline text-[#003366] mb-2">
                {event.nom}
              </CardTitle>
              <p className="text-gray-600 font-body text-sm mb-3 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{event.ville}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{event.heure}</span>
                </div>
                {event.placesDisponibles !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.placesDisponibles} places disponibles</span>
                  </div>
                )}
                {event.organisateur && (
                  <div className="text-xs text-gray-500">
                    Organisé par {event.organisateur}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <div className="text-xl font-headline font-bold text-[#FF8800]">
                    {event.prix.toLocaleString()} CDF
                  </div>
                  <div className="text-xs text-gray-500">par billet</div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                  disabled={event.placesDisponibles === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event.id);
                  }}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  {event.placesDisponibles === 0 ? 'Complet' : 'Acheter'}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

