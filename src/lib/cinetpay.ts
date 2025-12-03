/**
 * Service d'intégration Cinetpay
 * Documentation: https://docs.cinetpay.com
 */

// Configuration Cinetpay
const CINETPAY_API_URL = process.env.NEXT_PUBLIC_CINETPAY_API_URL || 'https://api.cinetpay.com';
const CINETPAY_API_KEY = process.env.NEXT_PUBLIC_CINETPAY_API_KEY || '';
const CINETPAY_SITE_ID = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '';
const CINETPAY_SECRET_KEY = process.env.NEXT_PUBLIC_CINETPAY_SECRET_KEY || '';

export interface CinetpayPaymentRequest {
  amount: number;
  currency: string;
  customerPhoneNumber: string;
  customerEmail?: string;
  customerName?: string;
  description: string;
  reference: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface CinetpayPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  status?: string;
  message?: string;
}

export interface CinetpayPaymentStatus {
  transactionId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'CANCELLED';
  amount: number;
  currency: string;
  reference: string;
}

/**
 * Créer un paiement via Cinetpay
 * Utilise une route API Next.js pour éviter les problèmes CORS
 */
export async function createCinetpayPayment(
  request: CinetpayPaymentRequest
): Promise<CinetpayPaymentResponse> {
  try {
    // Vérifier si les clés sont configurées
    if (!CINETPAY_API_KEY || !CINETPAY_SITE_ID || !CINETPAY_SECRET_KEY) {
      console.warn('⚠️ Clés Cinetpay non configurées, utilisation du mode simulation');
      console.warn('💡 Configurez NEXT_PUBLIC_CINETPAY_API_KEY, NEXT_PUBLIC_CINETPAY_SITE_ID et NEXT_PUBLIC_CINETPAY_SECRET_KEY dans .env.local');
      // Mode simulation pour le développement
      return {
        success: true,
        transactionId: `CINET-${Date.now()}`,
        paymentUrl: '#',
        status: 'PENDING',
        message: 'Mode simulation activé'
      };
    }

    // Appeler notre route API Next.js qui fera l'appel à Cinetpay côté serveur
    let response: Response;
    let data: any;

    try {
      response = await fetch('/api/cinetpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Lire la réponse
      const responseText = await response.text();
      
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          console.warn('⚠️ Réponse vide du serveur');
          data = { 
            message: 'Réponse vide du serveur',
            raw: responseText,
            status: response.status,
            statusText: response.statusText,
          };
        }
      } catch (parseError) {
        console.error('Erreur parsing réponse JSON:', parseError);
        console.error('Réponse brute:', responseText);
        console.error('Status:', response.status, response.statusText);
        data = { 
          message: responseText || 'Réponse vide ou invalide',
          raw: responseText,
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          status: response.status,
          statusText: response.statusText,
        };
      }

      console.log('📥 Réponse de notre API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        data,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      });

    } catch (fetchError: any) {
      console.error('Erreur fetch:', fetchError);
      return {
        success: false,
        message: `Erreur réseau: ${fetchError.message || 'Impossible de contacter le serveur'}`,
      };
    }

    // Vérifier si la réponse est vide ou invalide
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      console.error('❌ Réponse vide ou invalide:', {
        status: response.status,
        statusText: response.statusText,
        data,
        responseText,
      });
      return {
        success: false,
        message: `Réponse vide du serveur (Status: ${response.status}). Vérifiez les logs du serveur.`,
      };
    }

    if (!response.ok || !data.success) {
      const errorMessage = 
        data.message || 
        data.details || 
        data.error?.message ||
        data.description ||
        data.code ||
        `Erreur ${response.status}: ${response.statusText || 'Erreur inconnue'}`;
      
      // Construire un message d'erreur détaillé
      const isEmpty = !data || typeof data !== 'object' || Object.keys(data).length === 0;
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        data: isEmpty ? 'Réponse vide' : data,
        dataType: typeof data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
        isEmpty: isEmpty,
        errorMessage: isEmpty ? `Réponse vide du serveur (Status: ${response.status})` : errorMessage,
        fullError: isEmpty ? '{}' : JSON.stringify(data, null, 2),
      };
      
      // Ne pas logger un objet vide, logger un message clair
      if (isEmpty) {
        console.error('❌ Erreur réponse API: Réponse vide du serveur', {
          status: response.status,
          statusText: response.statusText,
          url: '/api/cinetpay/create-payment',
        });
      } else {
        console.error('❌ Erreur réponse API:', errorDetails);
      }
      
      // Ne pas throw, retourner l'erreur directement avec tous les détails
      // isEmpty est déjà défini plus haut, on le réutilise
      
      return {
        success: false,
        message: isEmpty 
          ? `Réponse vide du serveur (Status: ${response.status}). Vérifiez les logs du serveur pour plus de détails.`
          : (errorMessage || `Erreur ${response.status}: ${response.statusText || 'Erreur inconnue'}`),
        details: isEmpty ? {
          status: response.status,
          statusText: response.statusText,
          message: 'La réponse du serveur est vide. Vérifiez les logs du serveur.',
        } : {
          status: response.status,
          statusText: response.statusText,
          ...(data && typeof data === 'object' && {
            ...(data.details && { details: data.details }),
            ...(data.error && { error: data.error }),
            ...(data.code && { code: data.code }),
            ...(data.description && { description: data.description }),
            rawData: data,
          }),
        },
      };
    }

    return {
      success: true,
      transactionId: data.transactionId,
      paymentUrl: data.paymentUrl,
      status: data.status,
    };
  } catch (error: any) {
    console.error('Erreur Cinetpay:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la création du paiement',
    };
  }
}

/**
 * Vérifier le statut d'un paiement
 * Utilise une route API Next.js pour éviter les problèmes CORS
 */
export async function checkCinetpayPaymentStatus(
  transactionId: string
): Promise<CinetpayPaymentStatus | null> {
  try {
    if (!CINETPAY_API_KEY || !CINETPAY_SITE_ID || !CINETPAY_SECRET_KEY) {
      // Mode simulation
      return {
        transactionId,
        status: 'ACCEPTED',
        amount: 0,
        currency: 'USD', // USD accepté par le compte Cinetpay
        reference: transactionId,
      };
    }

    // Appeler notre route API Next.js
    const response = await fetch(`/api/cinetpay/check-status?transactionId=${transactionId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la vérification du statut');
    }
    
    return {
      transactionId: data.transactionId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
    };
  } catch (error: any) {
    console.error('Erreur vérification statut Cinetpay:', error);
    return null;
  }
}

/**
 * Ouvrir la page de paiement Cinetpay
 */
export function openCinetpayPaymentPage(paymentUrl: string) {
  if (paymentUrl && paymentUrl !== '#') {
    window.open(paymentUrl, '_blank');
  }
}

