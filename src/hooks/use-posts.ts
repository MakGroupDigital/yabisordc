'use client';

import { useState, useEffect } from 'react';
import { getPosts, subscribeToPosts, formatRelativeTime } from '@/lib/posts';
import { Post } from '@/types';

export interface PostWithRelativeTime extends Post {
  relativeTime: string;
}

export function usePosts(useRealtime: boolean = true) {
  const [posts, setPosts] = useState<PostWithRelativeTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useRealtime) {
      // Écouter les posts en temps réel - Limite de 50 pour performance
      const unsubscribe = subscribeToPosts((firestorePosts) => {
        console.log(`📥 ${firestorePosts.length} post(s) reçu(s) en temps réel`);
        const postsWithTime = firestorePosts.map(post => ({
          ...post,
          relativeTime: formatRelativeTime(post.createdAt)
        }));
        setPosts(postsWithTime);
        setLoading(false);
        setError(null);
      }, 50); // Limite de 50 posts

      return () => unsubscribe();
    } else {
      // Charger les posts une seule fois - Limite de 50 pour performance
      const timeout = setTimeout(() => {
        if (loading) {
          console.warn('⚠️ Le chargement des posts prend du temps, vérifiez votre connexion');
        }
      }, 5000);
      
      getPosts(50) // Limite de 50 posts
        .then((firestorePosts) => {
          clearTimeout(timeout);
          console.log(`📥 ${firestorePosts.length} post(s) chargé(s)`);
          const postsWithTime = firestorePosts.map(post => ({
            ...post,
            relativeTime: formatRelativeTime(post.createdAt)
          }));
          setPosts(postsWithTime);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          clearTimeout(timeout);
          console.error('❌ Erreur lors du chargement des posts:', err);
          // Ne pas bloquer l'application si c'est juste un problème de connexion
          if (err.code === 'unavailable' || err.message?.includes('Could not reach')) {
            console.warn('⚠️ Mode offline: Les posts seront chargés quand la connexion sera rétablie');
            setPosts([]);
            setError(new Error('Connexion à Firestore impossible. Vérifiez votre connexion internet.'));
          } else {
            setError(err);
          }
          setLoading(false);
        });
    }
  }, [useRealtime]);

  return { posts, loading, error };
}







