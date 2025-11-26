'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Loader2, Phone, ArrowLeft, AlertCircle, ExternalLink, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('email');
  const [step, setStep] = useState<'phone' | 'code' | 'email'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [showAuthNotEnabled, setShowAuthNotEnabled] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/home';

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.push(redirectTo);
      }
    });
    return () => unsubscribe();
  }, [router, redirectTo]);

  useEffect(() => {
    // Initialiser reCAPTCHA seulement en mode téléphone
    if (typeof window !== 'undefined' && authMode === 'phone' && !recaptchaVerifier) {
      // Attendre que le DOM soit prêt
      const initRecaptcha = () => {
        const container = document.getElementById('recaptcha-container');
        if (!container) {
          // Réessayer après un court délai si le conteneur n'est pas encore dans le DOM
          setTimeout(initRecaptcha, 100);
          return;
        }

        // S'assurer que le conteneur est complètement vide
        container.innerHTML = '';
        
        // Vérifier qu'il n'y a pas d'enfants
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        try {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA résolu
            },
            'expired-callback': () => {
              toast({
                title: 'reCAPTCHA expiré',
                description: 'Veuillez réessayer',
                variant: 'destructive',
              });
            }
          });
          setRecaptchaVerifier(verifier);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de reCAPTCHA:', error);
        }
      };

      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        setTimeout(initRecaptcha, 0);
      });
    }

    return () => {
      if (recaptchaVerifier && authMode !== 'phone') {
        try {
          recaptchaVerifier.clear();
        } catch (error) {
          console.error('Erreur lors du nettoyage de reCAPTCHA:', error);
        }
        setRecaptchaVerifier(null);
      }
    };
  }, [authMode, recaptchaVerifier, toast]);

  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    
    // Formater pour la RDC (format: +243XXXXXXXXX)
    if (numbers.startsWith('243')) {
      return `+${numbers}`;
    } else if (numbers.startsWith('0')) {
      return `+243${numbers.substring(1)}`;
    } else if (numbers.length > 0) {
      return `+243${numbers}`;
    }
    return value;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: 'Numéro invalide',
        description: 'Veuillez entrer un numéro de téléphone valide',
        variant: 'destructive',
      });
      return;
    }

    if (!recaptchaVerifier) {
      toast({
        title: 'Erreur',
        description: 'reCAPTCHA non initialisé. Veuillez rafraîchir la page',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('code');
      toast({
        title: 'Code envoyé !',
        description: 'Vérifiez vos messages SMS',
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du code:', error);
      let errorMessage = 'Une erreur est survenue';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Vérification reCAPTCHA échouée';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/invalid-app-credential') {
        errorMessage = 'L\'authentification par téléphone n\'est pas activée ou configurée correctement';
        setShowAuthNotEnabled(true);
        console.error('🔴 ACTION REQUISE: Activez l\'authentification par téléphone dans Firebase Console');
        console.error('Lien direct: https://console.firebase.google.com/project/studio-3821305079-74f59/authentication/providers');
        console.error('💡 ASTUCE: Utilisez l\'authentification par Email en attendant (bouton "Email" en haut)');
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Code invalide',
        description: 'Veuillez entrer le code à 6 chiffres',
        variant: 'destructive',
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: 'Erreur',
        description: 'Aucune confirmation en cours',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      toast({
        title: 'Connexion réussie !',
        description: 'Vous êtes maintenant connecté',
      });
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Erreur lors de la vérification du code:', error);
      let errorMessage = 'Code invalide';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Code de vérification invalide';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Code expiré. Veuillez demander un nouveau code';
        setStep('phone');
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!recaptchaVerifier) return;
    
    setLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      toast({
        title: 'Code renvoyé !',
        description: 'Vérifiez vos messages SMS',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de renvoyer le code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Compte créé !',
          description: 'Vous êtes maintenant connecté',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Connexion réussie !',
          description: 'Vous êtes maintenant connecté',
        });
      }
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Erreur lors de l\'authentification:', error);
      let errorMessage = 'Une erreur est survenue';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible (minimum 6 caractères)';
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#003366] via-[#004080] to-[#00509e] p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#FF8800] p-3">
              {authMode === 'phone' ? (
                <Phone className="h-8 w-8 text-white" />
              ) : (
                <Mail className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#003366]">
            {step === 'phone' ? 'Connexion' : step === 'code' ? 'Vérification' : isSignUp ? 'Inscription' : 'Connexion'}
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Entrez votre numéro de téléphone pour continuer'
              : step === 'code'
              ? 'Entrez le code de vérification envoyé par SMS'
              : isSignUp
              ? 'Créez votre compte'
              : 'Connectez-vous avec votre email'}
          </p>
        </div>

        {/* Toggle entre téléphone et email */}
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant={authMode === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setAuthMode('email');
              setStep('email');
              setShowAuthNotEnabled(false);
              // Nettoyer reCAPTCHA quand on passe en mode email
              if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                setRecaptchaVerifier(null);
              }
            }}
            className={authMode === 'email' ? 'bg-[#FF8800]' : ''}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            type="button"
            variant={authMode === 'phone' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setAuthMode('phone');
              setStep('phone');
              setShowAuthNotEnabled(false);
              // Réinitialiser reCAPTCHA quand on passe en mode téléphone
              if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                setRecaptchaVerifier(null);
              }
            }}
            className={authMode === 'phone' ? 'bg-[#FF8800]' : ''}
            title="L'authentification par téléphone nécessite une configuration dans Firebase Console"
          >
            <Phone className="h-4 w-4 mr-2" />
            Téléphone
          </Button>
        </div>

        {/* reCAPTCHA container (invisible) - seulement pour le mode téléphone */}
        {authMode === 'phone' && (
          <div 
            id="recaptcha-container" 
            style={{ 
              position: 'absolute',
              visibility: 'hidden',
              width: 0,
              height: 0,
              overflow: 'hidden'
            }}
          />
        )}

        {/* Alerte si l'authentification n'est pas activée */}
        {showAuthNotEnabled && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentification non activée</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                L'authentification par téléphone n'est pas activée dans Firebase Console.
              </p>
              <div className="space-y-2">
                <a
                  href="https://console.firebase.google.com/project/studio-3821305079-74f59/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Activer dans Firebase Console
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs">
                  Étapes: Authentication → Sign-in method → Phone → Enable
                </p>
                <p className="mt-3 text-sm font-semibold text-blue-700">
                  💡 En attendant, utilisez l'authentification par Email (bouton "Email" ci-dessus)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {authMode === 'email' && step === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-lg font-semibold mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-lg font-semibold mb-2 block">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignUp ? 'Création...' : 'Connexion...'}
                  </>
                ) : (
                  isSignUp ? 'Créer le compte' : 'Se connecter'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('');
                  setPassword('');
                }}
                className="w-full"
              >
                {isSignUp 
                  ? 'Déjà un compte ? Se connecter' 
                  : 'Pas de compte ? S\'inscrire'}
              </Button>
            </div>
          </form>
        ) : step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-lg font-semibold mb-2 block">
                Numéro de téléphone
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  +243
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="900 000 000"
                  value={phoneNumber.replace(/^\+243/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-16"
                  maxLength={12}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Format: +243 900 000 000
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le code'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <Label htmlFor="code" className="text-lg font-semibold mb-2 block">
                Code de vérification
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Code envoyé au {formatPhoneNumber(phoneNumber)}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('phone')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de numéro
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full"
              >
                Renvoyer le code
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>En continuant, vous acceptez nos conditions d'utilisation</p>
        </div>
      </div>
    </div>
  );
}

