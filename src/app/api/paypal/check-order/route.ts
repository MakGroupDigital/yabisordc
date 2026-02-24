import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour vérifier le statut d'une commande PayPal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'orderId requis' },
        { status: 400 }
      );
    }

    // Configuration PayPal - Production (hardcodée dans le code)
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AcjvyGe5w5ASvHcOwaQDXHi1BjNUR3NsT8bLWCLDWgyZCmTJAluAwZ8Gxrlo8qNaGPsn7pLzbTFTSXnl';
    const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET || 'EAud2skyaLTJbDnTeXrJUvPDZdKzSZfaSea_YkqaURUf9HVRLQ1iIpotXTGwqHBtSljc_TABI52oMgVc';
    const PAYPAL_API_URL = process.env.NEXT_PUBLIC_PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // Obtenir un access token
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

    // Vérifier le statut de la commande
    const statusResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.text();
      return NextResponse.json(
        { 
          success: false,
          message: 'Erreur lors de la vérification du statut',
          error: error,
        },
        { status: statusResponse.status }
      );
    }

    const orderData = await statusResponse.json();
    
    // Extraire le montant depuis purchase_units
    let amount = 0;
    let currency = 'USD';
    if (orderData.purchase_units && orderData.purchase_units.length > 0) {
      const purchaseUnit = orderData.purchase_units[0];
      if (purchaseUnit.amount) {
        amount = parseFloat(purchaseUnit.amount.value || '0');
        currency = purchaseUnit.amount.currency_code || 'USD';
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      status: orderData.status,
      amount: amount,
      currency: currency,
      orderData: orderData,
    });

  } catch (error: any) {
    console.error('Erreur vérification statut PayPal:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Erreur lors de la vérification du statut',
      },
      { status: 500 }
    );
  }
}



