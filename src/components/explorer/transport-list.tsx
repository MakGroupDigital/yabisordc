'use client';

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Phone, Navigation, Clock, Users, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

type Transport = {
  id: string;
  nom: string;
  type: 'taxi' | 'bus' | 'moto' | 'location';
  ville: string;
  disponible: boolean;
  phone?: string;
  tarifBase?: number;
  tarifKm?: number;
  capacite?: number;
  rating?: number;
  tempsArrivee?: string;
};

interface TransportListProps {
  transports: Transport[];
  onTransportClick: (id: string) => void;
}

const transportIcons = {
  taxi: Car,
  bus: Car,
  moto: Car,
  location: Car,
};

const transportColors = {
  taxi: 'bg-[#FF8800]',
  bus: 'bg-[#003366]',
  moto: 'bg-[#339966]',
  location: 'bg-[#FFCC00]',
};

export function TransportList({ transports, onTransportClick }: TransportListProps) {
  return (
    <div className="space-y-3">
      {transports.map((transport) => {
        const Icon = transportIcons[transport.type] || Car;
        const bgColor = transportColors[transport.type] || 'bg-gray-500';
        
        return (
          <Card
            key={transport.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden",
              !transport.disponible && "opacity-60"
            )}
            onClick={() => onTransportClick(transport.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn("rounded-xl p-4", bgColor)}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg font-headline text-[#003366]">
                        {transport.nom}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{transport.ville}</span>
                      </div>
                    </div>
                    <Badge className={cn(
                      transport.disponible 
                        ? "bg-[#339966] text-white" 
                        : "bg-gray-400 text-white"
                    )}>
                      {transport.disponible ? 'Disponible' : 'Occupé'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {transport.tempsArrivee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">{transport.tempsArrivee}</span>
                      </div>
                    )}
                    {transport.capacite && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">{transport.capacite} places</span>
                      </div>
                    )}
                    {transport.tarifBase && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-[#FF8800] text-xs">
                          {transport.tarifBase.toLocaleString()} CDF
                        </span>
                        <span className="text-gray-500 text-xs">base</span>
                      </div>
                    )}
                    {transport.tarifKm && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-xs">{transport.tarifKm} CDF/km</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {transport.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${transport.phone}`;
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className={cn(
                        "flex-1",
                        bgColor,
                        "hover:opacity-90 text-white"
                      )}
                      disabled={!transport.disponible}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransportClick(transport.id);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      {transport.disponible ? 'Commander' : 'Indisponible'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

