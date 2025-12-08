'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult
} from 'firebase/auth';
import { Loader2, Eye, EyeOff, Phone, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error');
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const { toast } = useToast();

  // Initialiser reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA vérifié');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expiré');
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error('Erreur initialisation reCAPTCHA:', error);
      }
    }
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const redirectTo = searchParams.get('redirect') || '/home';
        router.push(redirectTo);
      }
    });
    return () => unsubscribe();
  }, [router, searchParams]);

  const getErrorMessage = (code: string): { message: string; type: 'error' | 'warning' | 'info' } => {
    switch (code) {
      case 'auth/email-already-in-use':
        return { message: 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.', type: 'warning' };
      case 'auth/invalid-email':
        return { message: 'Format d\'email invalide. Veuillez vérifier votre adresse email.', type: 'error' };
      case 'auth/weak-password':
        return { message: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'warning' };
      case 'auth/user-not-found':
        return { message: 'Aucun compte trouvé avec cet email. Créez un compte ou vérifiez votre email.', type: 'info' };
      case 'auth/wrong-password':
        return { message: 'Mot de passe incorrect. Vérifiez votre mot de passe et réessayez.', type: 'error' };
      case 'auth/invalid-credential':
        return { message: 'Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.', type: 'error' };
      case 'auth/invalid-login-credentials':
        return { message: 'Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.', type: 'error' };
      case 'auth/too-many-requests':
        return { message: 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.', type: 'warning' };
      case 'auth/network-request-failed':
        return { message: 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.', type: 'error' };
      case 'auth/user-disabled':
        return { message: 'Ce compte a été désactivé. Contactez le support pour plus d\'informations.', type: 'error' };
      case 'auth/popup-closed-by-user':
        return { message: 'La fenêtre de connexion a été fermée. Veuillez réessayer.', type: 'info' };
      case 'auth/popup-blocked':
        return { message: 'La fenêtre popup a été bloquée. Autorisez les popups pour ce site.', type: 'warning' };
      case 'auth/cancelled-popup-request':
        return { message: 'Connexion annulée. Veuillez réessayer.', type: 'info' };
      case 'auth/invalid-phone-number':
        return { message: 'Numéro de téléphone invalide. Utilisez le format international (ex: +243...).', type: 'error' };
      case 'auth/invalid-verification-code':
        return { message: 'Code de vérification incorrect. Vérifiez le code reçu par SMS.', type: 'error' };
      case 'auth/code-expired':
        return { message: 'Le code de vérification a expiré. Demandez un nouveau code.', type: 'warning' };
      case 'auth/session-expired':
        return { message: 'La session a expiré. Veuillez réessayer.', type: 'warning' };
      default:
        return { message: `Une erreur s'est produite: ${code}. Veuillez réessayer ou contacter le support.`, type: 'error' };
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!displayName.trim()) {
        const errorInfo = { message: 'Le nom d\'utilisateur est requis.', type: 'warning' as const };
        setError(errorInfo.message);
        setErrorType(errorInfo.type);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });

      const redirectTo = searchParams.get('redirect') || '/home';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ya Biso RDC !",
      });

      const redirectTo = searchParams.get('redirect') || '/home';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Ajouter des scopes si nécessaire
      provider.addScope('profile');
      provider.addScope('email');
      // Personnaliser les paramètres
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${result.user.displayName || 'sur Ya Biso RDC'} !`,
      });

      const redirectTo = searchParams.get('redirect') || '/home';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de la connexion Google:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!phoneNumber.trim()) {
        setError('Le numéro de téléphone est requis.');
        setErrorType('warning');
        setLoading(false);
        return;
      }

      // Formater le numéro (ajouter + si nécessaire)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA non initialisé');
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep('code');
      
      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé à votre téléphone.",
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du code:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('Aucune confirmation en cours');
      }

      if (!verificationCode.trim()) {
        setError('Le code de vérification est requis.');
        setErrorType('warning');
        setLoading(false);
        return;
      }

      await confirmationResult.confirm(verificationCode);
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ya Biso RDC !",
      });

      const redirectTo = searchParams.get('redirect') || '/home';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de la vérification du code:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA non initialisé');
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      
      toast({
        title: "Code renvoyé",
        description: "Un nouveau code a été envoyé à votre téléphone.",
      });
    } catch (err: any) {
      console.error('Erreur lors du renvoi du code:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003366] to-[#001122] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
              alt="Ya Biso RDC Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white mb-2">
            Ya Biso RDC
          </h1>
          <p className="text-white/80">
            Rejoignez la communauté
          </p>
        </div>

        {/* reCAPTCHA Container (invisible) */}
        <div id="recaptcha-container"></div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setError(null);
          setPhoneStep('phone');
          setVerificationCode('');
          setConfirmationResult(null);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-[#FF8800]">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-white data-[state=active]:bg-[#FF8800]">
              Inscription
            </TabsTrigger>
            <TabsTrigger value="phone" className="text-white data-[state=active]:bg-[#FF8800]">
              Téléphone
            </TabsTrigger>
          </TabsList>

          {/* Connexion */}
          <TabsContent value="login" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <Alert 
                    variant={errorType === 'error' ? 'destructive' : errorType === 'warning' ? 'warning' : 'info'}
                    className="animate-in slide-in-from-top-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">
                      {errorType === 'error' ? 'Erreur' : errorType === 'warning' ? 'Attention' : 'Information'}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <button
                      onClick={() => setError(null)}
                      className="absolute right-2 top-2 text-current opacity-70 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>
            </div>
          </TabsContent>

          {/* Inscription */}
          <TabsContent value="signup" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert 
                    variant={errorType === 'error' ? 'destructive' : errorType === 'warning' ? 'warning' : 'info'}
                    className="animate-in slide-in-from-top-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">
                      {errorType === 'error' ? 'Erreur' : errorType === 'warning' ? 'Attention' : 'Information'}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <button
                      onClick={() => setError(null)}
                      className="absolute right-2 top-2 text-current opacity-70 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Votre nom"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-white/60">
                    Au moins 6 caractères
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'Créer un compte'
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>
            </div>
          </TabsContent>

          {/* Connexion par téléphone */}
          <TabsContent value="phone" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {phoneStep === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  {error && (
                    <Alert 
                      variant={errorType === 'error' ? 'destructive' : errorType === 'warning' ? 'warning' : 'info'}
                      className="animate-in slide-in-from-top-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-semibold">
                        {errorType === 'error' ? 'Erreur' : errorType === 'warning' ? 'Attention' : 'Information'}
                      </AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                      <button
                        onClick={() => setError(null)}
                        className="absolute right-2 top-2 text-current opacity-70 hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone-number" className="text-white">
                      Numéro de téléphone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+243 900 000 000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pl-10"
                      />
                    </div>
                    <p className="text-xs text-white/60">
                      Format international requis (ex: +243 900 000 000)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi du code...
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Envoyer le code
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  {error && (
                    <Alert 
                      variant={errorType === 'error' ? 'destructive' : errorType === 'warning' ? 'warning' : 'info'}
                      className="animate-in slide-in-from-top-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-semibold">
                        {errorType === 'error' ? 'Erreur' : errorType === 'warning' ? 'Attention' : 'Information'}
                      </AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                      <button
                        onClick={() => setError(null)}
                        className="absolute right-2 top-2 text-current opacity-70 hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="text-white">
                      Code de vérification
                    </Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      required
                      maxLength={6}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-white/60 text-center">
                      Entrez le code à 6 chiffres reçu par SMS
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPhoneStep('phone');
                        setVerificationCode('');
                        setConfirmationResult(null);
                        setError(null);
                      }}
                      className="flex-1 border-white/30 text-white hover:bg-white/20"
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Renvoyer le code
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#003366] to-[#001122] flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
