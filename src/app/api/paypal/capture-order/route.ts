import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour capturer un paiement PayPal après approbation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

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

    // Capturer le paiement
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error('❌ Erreur capture PayPal:', error);
      return NextResponse.json(
        { 
          success: false,
          message: 'Erreur lors de la capture du paiement',
          error: error,
        },
        { status: captureResponse.status }
      );
    }

    const captureData = await captureResponse.json();

    console.log('✅ Paiement PayPal capturé:', {
      orderId: captureData.id,
      status: captureData.status,
    });

    return NextResponse.json({
      success: true,
      orderId: captureData.id,
      status: captureData.status,
      captureData: captureData,
    });

  } catch (error: any) {
    console.error('Erreur capture PayPal:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Erreur lors de la capture du paiement',
      },
      { status: 500 }
    );
  }
}



