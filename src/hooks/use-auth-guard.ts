'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour protéger les actions nécessitant l'authentification
 * Redirige automatiquement vers la page de connexion si l'utilisateur n'est pas connecté
 */
export function useAuthGuard(redirectTo?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        const redirectPath = redirectTo || window.location.pathname;
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour effectuer cette action",
          variant: "destructive",
        });
        router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      }
    });

    return () => unsubscribe();
  }, [router, redirectTo, toast]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Fonction utilitaire pour vérifier l'authentification avant une action
 */
export function requireAuth(callback: (user: User) => void | Promise<void>) {
  return async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      const { useToast } = await import('@/hooks/use-toast');
      const { useRouter } = await import('next/navigation');
      const router = useRouter();
      const { toast } = useToast();
      
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    await callback(currentUser);
  };
}



