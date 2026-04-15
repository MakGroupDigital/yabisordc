'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle, DollarSign } from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { sallesFete } from '@/data/salles-fete';

type PaymentMethod = 'card' | 'mobile' | 'bank';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const salleId = params.id as string;
  const amount = Number(searchParams.get('amount')) || 0;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    mobileNumber: '',
    mobileProvider: 'airtel',
    bankAccount: '',
    bankName: ''
  });

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

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulation du traitement du paiement
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setIsSuccess(true);

    // Redirection après succès
    setTimeout(() => {
      router.push('/home/orders');
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
          <p className="text-gray-600 mb-4">
            Votre paiement de {amount}$ pour {salle.name} a été traité avec succès.
          </p>
          <p className="text-sm text-gray-500">
            Vous allez être redirigé vers vos commandes...
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
          <h1 className="text-lg font-semibold">Paiement</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Résumé de la commande</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Salle</span>
              <span className="font-medium">{salle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant à payer</span>
              <span className="font-bold text-xl flex items-center gap-1">
                <DollarSign className="h-5 w-5" />
                {amount}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Méthode de paiement</h3>
          
          <div className="space-y-3">
            {/* Mobile Money */}
            <button
              onClick={() => setSelectedMethod('mobile')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMethod === 'mobile' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-sm text-gray-600">Airtel Money, Orange Money, Vodacom M-Pesa</p>
                </div>
              </div>
            </button>

            {/* Credit Card */}
            <button
              onClick={() => setSelectedMethod('card')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMethod === 'card' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Carte bancaire</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard</p>
                </div>
              </div>
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setSelectedMethod('bank')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMethod === 'bank' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Virement bancaire</p>
                  <p className="text-sm text-gray-600">Transfert direct</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Informations de paiement</h3>

          {selectedMethod === 'mobile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opérateur</label>
                <select
                  value={paymentData.mobileProvider}
                  onChange={(e) => handleInputChange('mobileProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="airtel">Airtel Money</option>
                  <option value="orange">Orange Money</option>
                  <option value="vodacom">Vodacom M-Pesa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={paymentData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  placeholder="+243 XX XXX XXXX"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de carte</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date d'expiration</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom sur la carte</label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => handleInputChange('cardName', e.target.value)}
                  placeholder="JEAN MUKENDI"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Banque</label>
                <select
                  value={paymentData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Sélectionner une banque</option>
                  <option value="rawbank">RAW Bank</option>
                  <option value="equity">Equity Bank</option>
                  <option value="tmb">TMB</option>
                  <option value="bcc">BCC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de compte</label>
                <input
                  type="text"
                  value={paymentData.bankAccount}
                  onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  placeholder="Numéro de compte bancaire"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">🔒 Paiement sécurisé</h4>
          <p className="text-sm text-green-700">
            Vos informations de paiement sont protégées par un cryptage SSL de niveau bancaire.
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Traitement en cours...
            </>
          ) : (
            <>
              <DollarSign className="h-5 w-5" />
              Payer {amount}$
            </>
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}