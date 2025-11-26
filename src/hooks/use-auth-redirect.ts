import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useAuthRedirect(redirectTo: string = '/auth') {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Rediriger seulement une fois si l'utilisateur n'est pas connecté
      if (!user && !hasRedirected.current && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== redirectTo && !currentPath.startsWith('/auth')) {
          hasRedirected.current = true;
          router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  return { user, loading };
}

