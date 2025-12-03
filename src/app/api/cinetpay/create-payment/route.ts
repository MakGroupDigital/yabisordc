import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour créer un paiement Cinetpay
 * Cette route est appelée depuis le client pour éviter les problèmes CORS
 */
export async function POST(request: NextRequest) {
  // S'assurer qu'on retourne toujours une réponse valide
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Erreur parsing body:', parseError);
      return NextResponse.json(
        { 
          success: false,
          message: 'Corps de la requête invalide',
          error: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 }
      );
    }
    
    const {
      amount,
      currency,
      customerPhoneNumber,
      customerEmail,
      customerName,
      description,
      reference,
      returnUrl,
      notifyUrl,
    } = body;

    // Récupérer les variables d'environnement
    // URL selon la documentation Cinetpay: https://api-checkout.cinetpay.com/v2/payment
    const CINETPAY_API_URL = process.env.NEXT_PUBLIC_CINETPAY_API_URL || 'https://api-checkout.cinetpay.com';
    const CINETPAY_API_KEY = process.env.NEXT_PUBLIC_CINETPAY_API_KEY || '';
    const CINETPAY_SITE_ID = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID || '';
    const CINETPAY_SECRET_KEY = process.env.NEXT_PUBLIC_CINETPAY_SECRET_KEY || '';

    if (!CINETPAY_API_KEY || !CINETPAY_SITE_ID) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Configuration Cinetpay manquante. Vérifiez vos variables d\'environnement.' 
        },
        { status: 400 }
      );
    }

    // Préparer le corps de la requête pour Cinetpay
    // Format selon la documentation Cinetpay: https://docs.cinetpay.com
    // transaction_id doit être unique et sans caractères spéciaux (#,/,$,_,&)
    // Remplacer les tirets et caractères spéciaux par des caractères alphanumériques
    const cleanReference = (reference || '').replace(/[#\/$_,\-&]/g, '');
    const transactionId = cleanReference || `trans${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Le montant doit être un entier (Integer selon la doc) et multiple de 5 (sauf USD)
    let transactionAmount = Number(amount);
    if (currency !== 'USD') {
      transactionAmount = Math.round(transactionAmount / 5) * 5;
    }
    transactionAmount = Math.floor(transactionAmount); // S'assurer que c'est un entier
    
    // Nettoyer la description (pas de caractères spéciaux #,/,$,_,& selon la doc)
    const cleanDescription = (description || 'Paiement de reservation')
      .replace(/[#\/$_,&]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limiter la longueur
    
    // Validation des champs obligatoires
    if (!amount || transactionAmount <= 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Le montant est requis et doit être supérieur à 0' 
        },
        { status: 400 }
      );
    }
    
    if (!description || cleanDescription.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'La description est requise' 
        },
        { status: 400 }
      );
    }
    
    // Construire le corps de la requête avec tous les champs obligatoires
    const requestBody: any = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: transactionAmount, // Doit être un Integer
      currency: currency || 'USD', // USD par défaut (ou CDF pour la devise locale RDC)
      description: cleanDescription,
      notify_url: notifyUrl || `${request.nextUrl.origin}/api/cinetpay/notify`,
      return_url: returnUrl || `${request.nextUrl.origin}/api/cinetpay/return`,
      channels: 'ALL', // ALL, MOBILE_MONEY, CREDIT_CARD, WALLET
      lang: 'fr', // fr ou en
    };
    
    // Ajouter metadata si fourni (optionnel)
    if (reference && cleanReference) {
      requestBody.metadata = cleanReference.substring(0, 100);
    }

    // Ajouter les informations client si disponibles (recommandé pour carte bancaire)
    // Cinetpay exige que tous les champs client soient des chaînes valides (non vides)
    if (customerName || customerEmail || customerPhoneNumber) {
      requestBody.customer_name = (customerName || 'Client').substring(0, 50);
      requestBody.customer_surname = customerName ? customerName.split(' ')[1] || customerName : 'Client';
      if (customerEmail) {
        requestBody.customer_email = customerEmail.substring(0, 100);
      } else {
        requestBody.customer_email = 'client@example.com'; // Email par défaut requis
      }
      if (customerPhoneNumber) {
        requestBody.customer_phone_number = customerPhoneNumber.substring(0, 20);
      } else {
        requestBody.customer_phone_number = '+243000000000'; // Numéro par défaut
      }
      requestBody.customer_address = 'Non spécifiée'; // Adresse par défaut (non vide)
      requestBody.customer_city = 'Kinshasa'; // Ville par défaut (non vide)
      requestBody.customer_country = 'CD'; // Code ISO du pays (RDC = CD)
      requestBody.customer_state = 'CD'; // État par défaut
      requestBody.customer_zip_code = '00000'; // Code postal par défaut (non vide)
    }

    // Vérifier que tous les champs obligatoires sont présents
    const requiredFields = ['apikey', 'site_id', 'transaction_id', 'amount', 'currency', 'description', 'notify_url', 'return_url', 'channels'];
    const missingFields = requiredFields.filter(field => !requestBody[field] || requestBody[field] === '');
    
    if (missingFields.length > 0) {
      console.error('❌ Champs manquants:', missingFields);
      return NextResponse.json(
        { 
          success: false,
          message: `Champs obligatoires manquants: ${missingFields.join(', ')}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    console.log('📤 Requête Cinetpay:', {
      url: `${CINETPAY_API_URL}/v2/payment`,
      siteId: CINETPAY_SITE_ID,
      transactionId: transactionId,
      amount: transactionAmount,
      currency: currency,
      body: { ...requestBody, apikey: '***' },
    });

    // Appel à l'API Cinetpay - endpoint correct selon la documentation
    const response = await fetch(`${CINETPAY_API_URL}/v2/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'YaBisoRDC/1.0', // Nécessaire pour éviter l'erreur 1010
      },
      body: JSON.stringify(requestBody),
    });

    // Lire la réponse
    let data: any = {};
    const responseText = await response.text();
    
    try {
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
      } else {
        console.error('⚠️ Réponse vide de Cinetpay');
        data = {
          code: 'EMPTY_RESPONSE',
          message: 'Réponse vide de Cinetpay',
          description: `Status: ${response.status}, StatusText: ${response.statusText}`,
        };
      }
    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e);
      console.error('Réponse brute:', responseText);
      console.error('Status:', response.status, response.statusText);
      data = { 
        code: 'PARSE_ERROR',
        message: responseText || 'Réponse vide ou invalide',
        description: `Erreur de parsing JSON: ${e instanceof Error ? e.message : String(e)}`,
        raw: responseText,
        error: 'Réponse non-JSON'
      };
    }

    console.log('📥 Réponse Cinetpay:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!data && Object.keys(data).length > 0,
      dataKeys: data ? Object.keys(data) : [],
      code: data?.code,
      message: data?.message,
      description: data?.description,
      fullData: data,
      responseTextLength: responseText?.length || 0,
    });

    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error('❌ Erreur API Cinetpay (response.notOk):', {
        status: response.status,
        statusText: response.statusText,
        data,
        requestBody: { 
          ...requestBody, 
          apikey: '***',
          transaction_id: transactionId,
          amount: transactionAmount,
        },
        responseText,
      });
      
      // Extraire le message d'erreur de différentes structures possibles
      const errorMessage = 
        data?.description || 
        data?.message || 
        data?.error?.message || 
        data?.error ||
        (typeof data === 'string' ? data : null) ||
        `Erreur API Cinetpay: ${response.status} ${response.statusText}`;
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          code: data?.code || 'API_ERROR',
          error: data,
          details: `Status: ${response.status}, Response: ${responseText || 'vide'}`,
        },
        { status: 400 }
      );
    }

    // La réponse de Cinetpay selon la documentation:
    // - code: "201" = succès
    // - message: message de réponse
    // - data: contient payment_url et payment_token
    if (data.code === '201' && data.data?.payment_url) {
      return NextResponse.json({
        success: true,
        transactionId: transactionId,
        paymentUrl: data.data.payment_url,
        paymentToken: data.data.payment_token,
        status: 'PENDING',
        data: data.data,
      });
    } else {
      // Gérer les erreurs selon la documentation
      // Si data.code n'est pas '201', c'est une erreur
      const errorMessage = 
        data?.description || 
        data?.message || 
        `Code erreur: ${data?.code || 'UNKNOWN'}` ||
        'Erreur lors de la création du paiement';
      
      console.error('❌ Erreur Cinetpay (code != 201):', {
        code: data?.code,
        message: data?.message,
        description: data?.description,
        fullData: data,
      });
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: data,
        code: data?.code || 'UNKNOWN_ERROR',
        details: JSON.stringify(data, null, 2),
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Exception lors de la création du paiement:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      type: typeof error,
    });
    
    // Toujours retourner une réponse JSON valide avec tous les détails
    const errorResponse = {
      success: false,
      message: error?.message || 'Erreur lors de la création du paiement',
      error: error?.toString() || String(error),
      errorType: error?.name || typeof error,
      ...(error?.stack && { stack: error.stack }),
      ...(error?.code && { code: error.code }),
    };
    
    console.error('📤 Retour de l\'erreur:', errorResponse);
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

