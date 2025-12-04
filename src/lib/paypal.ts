/**
 * Service d'intégration PayPal
 * Documentation: https://developer.paypal.com/docs/api/orders/v2/
 */

// Configuration PayPal - Production
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AcjvyGe5w5ASvHcOwaQDXHi1BjNUR3NsT8bLWCLDWgyZCmTJAluAwZ8Gxrlo8qNaGPsn7pLzbTFTSXnl';
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET || 'EAud2skyaLTJbDnTeXrJUvPDZdKzSZfaSea_YkqaURUf9HVRLQ1iIpotXTGwqHBtSljc_TABI52oMgVc';
const PAYPAL_API_URL = process.env.NEXT_PUBLIC_PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

export interface PayPalPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customerName?: string;
  customerEmail?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalPaymentResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  status?: string;
  message?: string;
  details?: any;
}

export interface PayPalOrderStatus {
  orderId: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  amount: number;
  currency: string;
}

/**
 * Créer un paiement via PayPal
 * Utilise une route API Next.js pour éviter les problèmes CORS
 */
export async function createPayPalPayment(
  request: PayPalPaymentRequest
): Promise<PayPalPaymentResponse> {
  try {
    // Vérifier si les clés sont configurées
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('❌ Clés PayPal non configurées !');
      console.error('💡 Configurez les variables suivantes dans .env.local:');
      console.error('   NEXT_PUBLIC_PAYPAL_CLIENT_ID=...');
      console.error('   NEXT_PUBLIC_PAYPAL_CLIENT_SECRET=...');
      console.error('   NEXT_PUBLIC_PAYPAL_API_URL=https://api-m.sandbox.paypal.com');
      return {
        success: false,
        message: 'Configuration PayPal manquante. Ajoutez NEXT_PUBLIC_PAYPAL_CLIENT_ID et NEXT_PUBLIC_PAYPAL_CLIENT_SECRET dans .env.local et redémarrez le serveur.',
        details: {
          hasClientId: !!PAYPAL_CLIENT_ID,
          hasClientSecret: !!PAYPAL_CLIENT_SECRET,
          apiUrl: PAYPAL_API_URL,
        },
      };
    }

    // Appeler notre route API Next.js qui fera l'appel à PayPal côté serveur
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    console.log('📥 Réponse API PayPal:', {
      status: response.status,
      ok: response.ok,
      data: {
        success: data.success,
        orderId: data.orderId,
        paymentUrl: data.paymentUrl ? 'OUI' : 'NON',
        message: data.message,
      },
    });

    if (!response.ok || !data.success) {
      console.error('❌ Erreur dans la réponse PayPal:', data);
      throw new Error(data.message || 'Erreur lors de la création du paiement PayPal');
    }

    if (!data.paymentUrl || data.paymentUrl === '#') {
      console.error('❌ URL PayPal manquante ou invalide dans la réponse:', data);
      return {
        success: false,
        message: 'URL de paiement PayPal manquante ou invalide',
        details: data,
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      paymentUrl: data.paymentUrl,
      status: data.status,
    };
  } catch (error: any) {
    console.error('Erreur PayPal:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la création du paiement PayPal',
    };
  }
}

/**
 * Vérifier le statut d'un paiement PayPal
 * Utilise une route API Next.js pour éviter les problèmes CORS
 */
export async function checkPayPalOrderStatus(
  orderId: string
): Promise<PayPalOrderStatus | null> {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      // Mode simulation
      return {
        orderId,
        status: 'COMPLETED',
        amount: 0,
        currency: 'USD',
      };
    }

    // Appeler notre route API Next.js
    const response = await fetch(`/api/paypal/check-order?orderId=${orderId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la vérification du statut');
    }

    return {
      orderId: data.orderId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error: any) {
    console.error('Erreur vérification statut PayPal:', error);
    return null;
  }
}

/**
 * Capturer un paiement PayPal (après approbation)
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalPaymentResponse> {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      // Mode simulation
      return {
        success: true,
        orderId,
        status: 'COMPLETED',
        message: 'Mode simulation activé',
      };
    }

    // Appeler notre route API Next.js
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la capture du paiement');
    }

    return {
      success: true,
      orderId: data.orderId,
      status: data.status,
    };
  } catch (error: any) {
    console.error('Erreur capture PayPal:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la capture du paiement',
    };
  }
}

/**
 * Ouvrir la page de paiement PayPal
 */
export function openPayPalPaymentPage(paymentUrl: string) {
  if (!paymentUrl || paymentUrl === '#' || paymentUrl.length < 10) {
    console.error('⚠️ URL PayPal invalide ou manquante:', paymentUrl);
    throw new Error('URL de paiement PayPal invalide. Vérifiez les variables d\'environnement PayPal.');
  }
  
  console.log('🔗 Redirection vers PayPal:', paymentUrl.substring(0, 60) + '...');
  
  // Utiliser window.location.href pour une redirection directe
  // Cela évite les problèmes avec les bloqueurs de pop-ups
  try {
    window.location.href = paymentUrl;
  } catch (error) {
    console.error('❌ Erreur lors de la redirection PayPal:', error);
    // Essayer une méthode alternative
    window.location.replace(paymentUrl);
  }
}

