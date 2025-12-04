import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Route API pour vérifier le statut d'un paiement Cinetpay
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'transactionId requis' },
        { status: 400 }
      );
    }

    // Configuration Cinetpay - Production (hardcodée dans le code)
    const CINETPAY_API_URL = process.env.NEXT_PUBLIC_CINETPAY_API_URL || 'https://api.cinetpay.com';
    const CINETPAY_API_KEY = process.env.NEXT_PUBLIC_CINETPAY_API_KEY || '164212755567a4f2ee234470.03998181';
    const CINETPAY_SITE_ID = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '105907138';
    const CINETPAY_SECRET_KEY = process.env.NEXT_PUBLIC_CINETPAY_SECRET_KEY || '188028715669283f0b5520b6.57905905';

    // Générer la signature pour la vérification
    const signatureData = `${CINETPAY_SITE_ID}${transactionId}${CINETPAY_SECRET_KEY}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    const requestBody = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      signature: signature,
    };

    // Appel à l'API Cinetpay
    const response = await fetch(`${CINETPAY_API_URL}/v1/payment/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { 
          success: false,
          message: error.message || 'Erreur lors de la vérification du statut',
          error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Cinetpay retourne: code, message, et data avec le statut
    if (data.code === '00') {
      return NextResponse.json({
        success: true,
        transactionId: data.data?.transaction_id || transactionId,
        status: data.data?.status || 'PENDING',
        amount: data.data?.amount || 0,
        currency: data.data?.currency || 'XOF',
        reference: data.data?.transaction_id || transactionId,
        data: data.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Erreur lors de la vérification',
        error: data,
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erreur vérification statut Cinetpay:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Erreur lors de la vérification du statut',
      },
      { status: 500 }
    );
  }
}



