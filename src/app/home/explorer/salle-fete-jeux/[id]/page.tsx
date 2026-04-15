'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageCircle,
  Calendar,
  Check,
  X,
  Wifi,
  Car,
  Snowflake,
  Volume2,
  Lightbulb,
  UtensilsCrossed,
  Shield,
  Camera
} from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { SafeImage } from '@/components/ui/safe-image';
import { sallesFete, categories } from '@/data/salles-fete';
import { SalleFete } from '@/types/salle-fete';

export default function SalleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const salleId = params.id as string;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(4);
  const [guestCount, setGuestCount] = useState(50);
  const [showReservation, setShowReservation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const salle = useMemo(() => 
    sallesFete.find(s => s.id === salleId), 
    [salleId]
  );

  if (!salle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Salle non trouvée</h2>
          <button 
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === salle.category);
  const totalPrice = salle.pricePerHour * duration;

  const featureIcons = {
    parking: Car,
    airConditioning: Snowflake,
    soundSystem: Volume2,
    lighting: Lightbulb,
    catering: UtensilsCrossed,
    decoration: Camera,
    security: Shield,
    wifi: Wifi
  };

  const handleReservation = () => {
    if (!selectedDate || !selectedTime) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }
    
    // Ici vous pouvez implémenter la logique de réservation
    router.push(`/home/explorer/salle-fete-jeux/${salleId}/reservation?date=${selectedDate}&time=${selectedTime}&duration=${duration}&guests=${guestCount}`);
  };

  const handlePayment = () => {
    // Ici vous pouvez implémenter la logique de paiement
    router.push(`/home/explorer/salle-fete-jeux/${salleId}/payment?amount=${totalPrice}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      {/* Header */}
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-64 overflow-hidden">
          <SafeImage
            src={salle.images[currentImageIndex]}
            alt={salle.name}
            className="h-full w-full object-cover"
            fallbackText="Salle"
          />
          
          {salle.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {salle.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{salle.name}</h1>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{salle.rating}</span>
              <span className="text-gray-500">({salle.reviews.length})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{salle.location.address}</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-blue-600 mb-4">
            {category && (
              <>
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </>
            )}
          </div>

          <p className="text-gray-700">{salle.description}</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <Users className="h-5 w-5 text-blue-500" />
              <span>{salle.capacity}</span>
            </div>
            <p className="text-sm text-gray-600">Capacité</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>{salle.pricePerHour}</span>
            </div>
            <p className="text-sm text-gray-600">$/heure</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <Clock className="h-5 w-5 text-orange-500" />
              <span>{salle.pricePerDay}</span>
            </div>
            <p className="text-sm text-gray-600">$/jour</p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Équipements</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(salle.features).map(([feature, available]) => {
              const Icon = featureIcons[feature as keyof typeof featureIcons];
              const featureName = {
                parking: 'Parking',
                airConditioning: 'Climatisation',
                soundSystem: 'Système audio',
                lighting: 'Éclairage',
                catering: 'Catering',
                decoration: 'Décoration',
                security: 'Sécurité',
                wifi: 'WiFi'
              }[feature];

              return (
                <div key={feature} className={`flex items-center gap-2 p-2 rounded-lg ${
                  available ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                }`}>
                  {available ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="text-sm">{featureName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Services inclus</h3>
          <div className="flex flex-wrap gap-2">
            {salle.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <div className="space-y-2">
            <a
              href={`tel:${salle.contact.phone}`}
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
            >
              <Phone className="h-5 w-5 text-blue-500" />
              <span>{salle.contact.phone}</span>
            </a>
            
            {salle.contact.email && (
              <a
                href={`mailto:${salle.contact.email}`}
                className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <span>{salle.contact.email}</span>
              </a>
            )}
            
            {salle.contact.whatsapp && (
              <a
                href={`https://wa.me/${salle.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 rounded-lg bg-green-50 p-3 shadow-sm"
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Rules */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Règlement</h3>
          <ul className="space-y-1">
            {salle.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews */}
        {salle.reviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Avis clients</h3>
            <div className="space-y-3">
              {salle.reviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.userName}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Panel */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">À partir de</p>
            <p className="text-xl font-bold">{salle.pricePerHour}$ <span className="text-sm font-normal">/heure</span></p>
          </div>
          <button
            onClick={() => setShowReservation(!showReservation)}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white font-medium"
          >
            Réserver
          </button>
        </div>

        {showReservation && (
          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Durée (heures)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  max="24"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invités</label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  min="1"
                  max={salle.capacity}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t">
              <span className="font-medium">Total: {totalPrice}$</span>
              <div className="flex gap-2">
                <button
                  onClick={handleReservation}
                  className="rounded-lg bg-green-500 px-4 py-2 text-white text-sm font-medium"
                >
                  Réserver
                </button>
                <button
                  onClick={handlePayment}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white text-sm font-medium"
                >
                  Payer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}