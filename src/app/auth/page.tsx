'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Rediriger vers la page de création ou la page d'origine
        const redirectTo = searchParams.get('redirect') || '/home/create';
        router.push(redirectTo);
      }
    });
    return () => unsubscribe();
  }, [router, searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!displayName.trim()) {
        setError('Le nom d\'utilisateur est requis');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil avec le nom d'affichage
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });

      // Rediriger vers la page de création ou la page d'origine
      const redirectTo = searchParams.get('redirect') || '/home/create';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      setError(getErrorMessage(errorCode));
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
      // Rediriger vers la page de création ou la page d'origine
      const redirectTo = searchParams.get('redirect') || '/home/create';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Rediriger vers la page de création ou la page d'origine
      const redirectTo = searchParams.get('redirect') || '/home/create';
      router.push(redirectTo);
    } catch (err: any) {
      console.error('Erreur lors de la connexion Google:', err);
      const errorCode = err?.code || err?.message || 'unknown';
      setError(getErrorMessage(errorCode));
      setLoading(false);
    }
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé';
      case 'auth/invalid-email':
        return 'Email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email. Vérifiez votre email ou créez un compte';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect. Vérifiez vos identifiants';
      case 'auth/invalid-login-credentials':
        return 'Email ou mot de passe incorrect. Vérifiez vos identifiants';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      default:
        return `Erreur: ${code}. Veuillez réessayer ou contacter le support`;
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="login" className="text-white data-[state=active]:bg-[#FF8800]">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-white data-[state=active]:bg-[#FF8800]">
              Inscription
            </TabsTrigger>
          </TabsList>

          {/* Connexion */}
          <TabsContent value="login" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <form onSubmit={handleSignIn} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 text-sm">
                    {error}
                  </div>
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
                  <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 text-sm">
                    {error}
                  </div>
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

