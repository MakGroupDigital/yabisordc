import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Route API pour recevoir les notifications de Cinetpay (webhook)
 * Cette route sera appelée par Cinetpay après un paiement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      cpm_trans_id,
      cpm_site_id,
      signature,
      cpm_amount,
      cpm_currency,
      cpm_trans_status,
      cpm_trans_date,
      cpm_payment_date,
      cpm_phone_prefixe,
      cpm_phone_number,
      cpm_designation,
      cpm_custom,
    } = body;

    console.log('📥 Notification Cinetpay reçue:', {
      transactionId: cpm_trans_id,
      siteId: cpm_site_id,
      status: cpm_trans_status,
      amount: cpm_amount,
      currency: cpm_currency,
    });

    // Vérifier la signature
    const CINETPAY_SECRET_KEY = process.env.NEXT_PUBLIC_CINETPAY_SECRET_KEY || '';
    const signatureData = `${cpm_site_id}${cpm_trans_id}${cpm_amount}${CINETPAY_SECRET_KEY}`;
    const expectedSignature = crypto.createHash('sha256').update(signatureData).digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Signature invalide:', { received: signature, expected: expectedSignature });
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 401 }
      );
    }

    // Mettre à jour le statut du paiement dans votre base de données
    // Ici, vous pouvez utiliser Firestore pour stocker le statut
    
    // Exemple avec Firestore (à adapter selon votre structure)
    // const { db } = await import('@/lib/firebase');
    // const { doc, updateDoc } = await import('firebase/firestore');
    // await updateDoc(doc(db, 'payments', cpm_trans_id), {
    //   status: cpm_trans_status,
    //   amount: cpm_amount,
    //   currency: cpm_currency,
    //   paymentDate: cpm_payment_date,
    //   updatedAt: new Date(),
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Notification reçue avec succès' 
    });
  } catch (error: any) {
    console.error('Erreur notification Cinetpay:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Pour la vérification du webhook
  return NextResponse.json({ status: 'ok' });
}

