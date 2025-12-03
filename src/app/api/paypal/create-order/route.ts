import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour créer une commande PayPal
 * Cette route est appelée depuis le client pour éviter les problèmes CORS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,
      currency,
      description,
      reference,
      customerName,
      customerEmail,
      returnUrl,
      cancelUrl,
    } = body;

    // Récupérer les variables d'environnement
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET || '';
    const PAYPAL_API_URL = process.env.NEXT_PUBLIC_PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const PAYPAL_MODE = process.env.NEXT_PUBLIC_PAYPAL_MODE || 'sandbox'; // sandbox ou production

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('❌ Configuration PayPal manquante côté serveur !');
      console.error('💡 Variables requises dans .env.local:');
      console.error('   NEXT_PUBLIC_PAYPAL_CLIENT_ID');
      console.error('   NEXT_PUBLIC_PAYPAL_CLIENT_SECRET');
      console.error('   NEXT_PUBLIC_PAYPAL_API_URL (optionnel, défaut: sandbox)');
      
      return NextResponse.json(
        { 
          success: false,
          message: 'Configuration PayPal manquante. Ajoutez NEXT_PUBLIC_PAYPAL_CLIENT_ID et NEXT_PUBLIC_PAYPAL_CLIENT_SECRET dans .env.local et redémarrez le serveur de développement.',
          details: {
            hasClientId: !!PAYPAL_CLIENT_ID,
            hasClientSecret: !!PAYPAL_CLIENT_SECRET,
            apiUrl: PAYPAL_API_URL,
          },
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Configuration PayPal détectée:', {
      hasClientId: !!PAYPAL_CLIENT_ID,
      hasClientSecret: !!PAYPAL_CLIENT_SECRET,
      apiUrl: PAYPAL_API_URL,
      mode: PAYPAL_MODE,
    });

    // Étape 1: Obtenir un access token PayPal
    const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('❌ Erreur obtention token PayPal:', error);
      return NextResponse.json(
        { 
          success: false,
          message: 'Erreur lors de l\'authentification PayPal',
          error: error,
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Impossible d\'obtenir un token d\'accès PayPal',
        },
        { status: 500 }
      );
    }

    // Étape 2: Créer une commande PayPal
    // Convertir le montant en nombre si nécessaire
    const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedAmount = amountValue.toFixed(2);

    console.log('📤 Création commande PayPal:', {
      amount: amountValue,
      formattedAmount,
      currency: currency || 'USD',
      description: description || 'Réservation d\'hébergement',
      returnUrl,
      cancelUrl,
    });

    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: reference || `REF-${Date.now()}`,
          description: description || 'Réservation d\'hébergement',
          amount: {
            currency_code: currency || 'USD',
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: 'Ya Biso RDC',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `${request.nextUrl.origin}/api/paypal/return`,
        cancel_url: cancelUrl || `${request.nextUrl.origin}/api/paypal/cancel`,
      },
    };

    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': reference || `REQ-${Date.now()}`,
      },
      body: JSON.stringify(orderRequest),
    });

    if (!orderResponse.ok) {
      let errorText = '';
      try {
        errorText = await orderResponse.text();
      } catch (e) {
        errorText = 'Impossible de lire la réponse d\'erreur';
      }
      
      console.error('❌ Erreur création commande PayPal:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        error: errorText,
        orderRequest: {
          ...orderRequest,
          purchase_units: orderRequest.purchase_units.map(u => ({
            ...u,
            amount: { ...u.amount },
          })),
        },
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: `Erreur lors de la création de la commande PayPal (${orderResponse.status}): ${errorText}`,
          error: errorText,
          status: orderResponse.status,
        },
        { status: orderResponse.status }
      );
    }

    const orderData = await orderResponse.json();

    // Trouver l'URL d'approbation
    let approvalUrl = '';
    if (orderData.links && Array.isArray(orderData.links)) {
      const approveLink = orderData.links.find((link: any) => link.rel === 'approve');
      if (approveLink) {
        approvalUrl = approveLink.href;
      }
    }

    console.log('✅ Commande PayPal créée:', {
      orderId: orderData.id,
      status: orderData.status,
      approvalUrl: approvalUrl || 'NON TROUVÉ',
      links: orderData.links ? orderData.links.map((l: any) => ({ rel: l.rel, href: l.href })) : 'Pas de liens',
    });

    if (!approvalUrl) {
      console.error('❌ URL d\'approbation PayPal non trouvée dans la réponse:', {
        orderData,
        links: orderData.links,
      });
      return NextResponse.json({
        success: false,
        message: 'URL de paiement PayPal non trouvée dans la réponse',
        orderData: orderData,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      paymentUrl: approvalUrl,
      status: orderData.status,
      orderData: orderData,
    });

  } catch (error: any) {
    console.error('❌ Exception lors de la création de la commande PayPal:', {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || 'Erreur lors de la création de la commande PayPal',
        error: error?.toString() || String(error),
      },
      { status: 500 }
    );
  }
}

