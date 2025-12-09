import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Route API pour gérer l'annulation du paiement PayPal
 */
export async function GET(request: NextRequest) {
  try {
    console.log('❌ Paiement PayPal annulé');

    // Rediriger vers la page d'hébergement
    redirect('/home/explorer/hebergement?payment=cancelled');

  } catch (error: any) {
    console.error('Erreur annulation PayPal:', error);
    redirect('/home/explorer/hebergement?payment=error');
  }
}







