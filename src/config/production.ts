// Configuration de production - Clés API
// Ce fichier contient directement les clés pour la production
// Firebase App Hosting utilisera ces valeurs lors du déploiement

export const productionConfig = {
  cinetpay: {
    apiUrl: 'https://api-checkout.cinetpay.com',
    apiKey: '164212755567a4f2ee234470.03998181',
    siteId: '105907138',
    secretKey: '188028715669283f0b5520b6.57905905',
  },
  paypal: {
    mode: 'sandbox',
    apiUrl: 'https://api-m.sandbox.paypal.com',
    clientId: 'AcjvyGe5w5ASvHcOwaQDXHi1BjNUR3NsT8bLWCLDWgyZCmTJAluAwZ8Gxrlo8qNaGPsn7pLzbTFTSXnl',
    clientSecret: 'EAud2skyaLTJbDnTeXrJUvPDZdKzSZfaSea_YkqaURUf9HVRLQ1iIpotXTGwqHBtSljc_TABI52oMgVc',
  },
};

// Valeurs par défaut pour les variables d'environnement si elles ne sont pas définies
export const envDefaults = {
  NEXT_PUBLIC_CINETPAY_API_URL: productionConfig.cinetpay.apiUrl,
  NEXT_PUBLIC_CINETPAY_API_KEY: productionConfig.cinetpay.apiKey,
  NEXT_PUBLIC_CINETPAY_SITE_ID: productionConfig.cinetpay.siteId,
  NEXT_PUBLIC_CINETPAY_SECRET_KEY: productionConfig.cinetpay.secretKey,
  NEXT_PUBLIC_PAYPAL_MODE: productionConfig.paypal.mode,
  NEXT_PUBLIC_PAYPAL_API_URL: productionConfig.paypal.apiUrl,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: productionConfig.paypal.clientId,
  NEXT_PUBLIC_PAYPAL_CLIENT_SECRET: productionConfig.paypal.clientSecret,
};





