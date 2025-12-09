import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Route API pour gérer le retour après paiement PayPal
 * Cette route est appelée quand l'utilisateur revient après le paiement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    console.log('📥 Retour PayPal:', {
      token,
      payerId,
    });

    if (token) {
      // Rediriger vers une page de confirmation avec le token
      redirect(`/home/explorer/hebergement?payment=success&paypalToken=${token}`);
    } else {
      // Rediriger vers une page d'erreur
      redirect(`/home/explorer/hebergement?payment=failed`);
    }

  } catch (error: any) {
    console.error('Erreur retour PayPal:', error);
    redirect('/home/explorer/hebergement?payment=error');
  }
}







