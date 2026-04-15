'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { sallesFete } from '@/data/salles-fete';

export default function ReservationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const salleId = params.id as string;

  const [formData, setFormData] = useState({
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    duration: Number(searchParams.get('duration')) || 4,
    guests: Number(searchParams.get('guests')) || 50,
    eventType: '',
    specialRequests: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const salle = sallesFete.find(s => s.id === salleId);

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

  const totalPrice = salle.pricePerHour * formData.duration;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'une API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Redirection après 3 secondes
    setTimeout(() => {
      router.push('/home/reservations');
    }, 3000);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h2>
          <p className="text-gray-600 mb-4">
            Votre demande de réservation pour {salle.name} a été envoyée avec succès.
          </p>
          <p className="text-sm text-gray-500">
            Vous allez être redirigé vers vos réservations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Réservation</h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Salle Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-2">{salle.name}</h2>
          <p className="text-gray-600 text-sm">{salle.location.address}</p>
        </div>

        {/* Reservation Details */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Détails de la réservation</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Heure de début</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Durée (heures)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                min="1"
                max="24"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre d'invités</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.guests}
                  onChange={(e) => handleInputChange('guests', Number(e.target.value))}
                  min="1"
                  max={salle.capacity}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type d'événement</label>
            <select
              value={formData.eventType}
              onChange={(e) => handleInputChange('eventType', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Sélectionner le type d'événement</option>
              <option value="mariage">Mariage</option>
              <option value="anniversaire">Anniversaire</option>
              <option value="conference">Conférence</option>
              <option value="corporate">Événement d'entreprise</option>
              <option value="reception">Réception</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Demandes spéciales (optionnel)</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={3}
              placeholder="Décoration particulière, équipements supplémentaires, etc."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Informations de contact</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom complet *</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Téléphone *</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                required
                placeholder="+243 XX XXX XXXX"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Résumé des coûts</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prix par heure</span>
              <span>{salle.pricePerHour}$</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Durée</span>
              <span>{formData.duration} heure{formData.duration > 1 ? 's' : ''}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {totalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Conditions importantes</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• {salle.cancellationPolicy}</li>
            <li>• Un acompte de 30% peut être demandé</li>
            <li>• Confirmation sous 24h ouvrables</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
        </button>
      </form>

      <BottomNav />
    </div>
  );
}