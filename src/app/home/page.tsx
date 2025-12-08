'use client';

import { useEffect, useMemo } from 'react';
import { PostCardTikTok } from "@/components/home/post-card-tiktok";
import { BottomNav } from "@/components/home/bottom-nav";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { sortPostsByFeedAlgorithm } from "@/lib/feed-algorithm";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { formatRelativeTime } from '@/lib/posts';

function PostSkeleton() {
    return (
        <div className="relative h-screen w-full snap-start snap-always flex-shrink-0 bg-black">
            <Skeleton className="absolute inset-0 bg-gray-900" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

export default function FeedPage() {
  // Limiter à 30 posts initiaux pour un chargement plus rapide
  const { posts, loading, error } = usePosts(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Charger les préférences utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Charger les utilisateurs suivis
          const followingRef = collection(db, 'users', user.uid, 'following');
          const followingSnapshot = await getDocs(followingRef);
          const followedUsers = followingSnapshot.docs.map(doc => doc.id);

          // Charger les favoris pour obtenir les hashtags likés
          const favoritesQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', user.uid)
          );
          const favoritesSnapshot = await getDocs(favoritesQuery);
          
          // Extraire les hashtags des posts favoris (simplifié)
          const likedHashtags: string[] = [];

          // Historique de visionnage (simplifié - à implémenter avec données réelles)
          const viewHistory: { postId: string; viewedAt: Date }[] = [];

          setUserPreferences({
            followedUsers,
            likedHashtags,
            savedLocations: [], // À implémenter
            preferredContentType: 'both' as const,
            viewHistory,
          });
        } catch (err) {
          console.error('Erreur chargement préférences:', err);
          setUserPreferences(null);
        }
      } else {
        setUserId(null);
        setUserPreferences(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Trier les posts avec l'algorithme
  const sortedPosts = useMemo(() => {
    if (posts.length === 0) return [];
    
    try {
      return sortPostsByFeedAlgorithm(posts, userPreferences);
    } catch (err) {
      console.error('Erreur tri algorithmique:', err);
      // Fallback: tri simple par date
      return [...posts].sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
    }
  }, [posts, userPreferences]);

  // Debug: afficher les infos dans la console
  useEffect(() => {
    console.log('\n📱 ========== ÉTAT DU FEED ==========');
    console.log('📱 Loading:', loading);
    console.log('📱 Posts count:', posts.length);
    console.log('📱 Sorted posts count:', sortedPosts.length);
    console.log('📱 Has error:', !!error);
    if (error) {
      console.error('📱 Error message:', error.message);
      console.error('📱 Error details:', error);
    }
    if (sortedPosts.length > 0) {
      console.log('📋 Premiers posts triés:', sortedPosts.slice(0, 3).map(p => ({
        id: p.id,
        author: p.author,
        likes: p.likes,
        views: p.viewsCount,
        mediaCount: p.media.length,
        caption: p.caption.substring(0, 30) + '...'
      })));
    } else if (!loading) {
      console.warn('⚠️ Aucun post à afficher');
      console.warn('⚠️ Vérifiez la console pour les logs de débogage');
    }
    console.log('📱 ====================================\n');
  }, [sortedPosts, loading, error, posts.length]);

  if (error) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p className="text-lg mb-2">Erreur de chargement</p>
          <p className="text-sm text-gray-400">{error.message}</p>
          <p className="text-xs text-gray-500 mt-2">Vérifiez la console pour plus de détails</p>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Container avec scroll snap style TikTok */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-white text-center p-4">
              <p className="text-lg mb-2">Aucune publication</p>
              <p className="text-sm text-gray-400 mb-4">Les publications apparaîtront ici</p>
              <p className="text-xs text-gray-500">
                Vérifiez la console du navigateur pour voir les logs de débogage
              </p>
            </div>
          </div>
        ) : (
          (() => {
            // Utiliser les posts triés par l'algorithme
            const uniquePosts = sortedPosts.reduce((acc, post) => {
              if (!acc.find(p => p.id === post.id)) {
                acc.push(post);
              }
              return acc;
            }, [] as typeof sortedPosts);
            
            return uniquePosts.map((post, index) => {
              // Ajouter relativeTime si nécessaire
              const postWithTime = {
                ...post,
                relativeTime: post.createdAt 
                  ? formatRelativeTime(post.createdAt)
                  : undefined
              };
              return (
                <PostCardTikTok 
                  key={`${post.id}-${index}-${post.createdAt?.getTime() || Date.now()}`} 
                  post={postWithTime} 
                />
              );
            });
          })()
        )}
      </div>
      
      {/* Bottom Nav - Fixé en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
