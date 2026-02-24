import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour gérer le retour après paiement Cinetpay
 * Cette route est appelée quand l'utilisateur revient après le paiement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const transactionId = searchParams.get('transaction_id');
    const status = searchParams.get('status');

    console.log('📥 Retour Cinetpay:', {
      transactionId,
      status,
    });

    // Rediriger vers une page de confirmation ou retourner à l'application
    if (status === 'ACCEPTED') {
      // Rediriger vers la page de confirmation de paiement
      return NextResponse.redirect(
        new URL(`/home/explorer/hebergement?payment=success&transaction=${transactionId}`, request.url)
      );
    } else {
      // Rediriger vers une page d'erreur
      return NextResponse.redirect(
        new URL(`/home/explorer/hebergement?payment=failed&transaction=${transactionId}`, request.url)
      );
    }

  } catch (error: any) {
    console.error('Erreur retour Cinetpay:', error);
    return NextResponse.redirect(
      new URL('/home/explorer/hebergement?payment=error', request.url)
    );
  }
}

