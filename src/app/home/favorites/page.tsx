'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { PostCardTikTok } from "@/components/home/post-card-tiktok";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';

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

export default function FavoritesPage() {
  const { posts: allPosts, loading: postsLoading } = usePosts(true);
  const [user, setUser] = useState<User | null>(null);
  const [favoritePostIds, setFavoritePostIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Récupérer les favoris de l'utilisateur depuis Firestore
          const favoritesRef = collection(db, 'favorites');
          const q = query(favoritesRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const favoriteIds = querySnapshot.docs.map(doc => doc.data().postId);
          setFavoritePostIds(favoriteIds);
        } catch (error) {
          console.error('Erreur lors de la récupération des favoris:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrer les posts pour ne garder que les favoris
  const favoritePosts = allPosts.filter(post => 
    favoritePostIds.includes(post.id)
  );

  if (!user) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Connectez-vous</p>
          <p className="text-sm text-gray-400">Connectez-vous pour voir vos favoris</p>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  if (loading || postsLoading) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
          <PostSkeleton />
          <PostSkeleton />
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
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            Mes Favoris
          </h1>
        </div>
      </div>

      {/* Container avec scroll snap style TikTok */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none pt-16">
        {favoritePosts.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-white text-center p-4">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg mb-2">Aucun favori</p>
              <p className="text-sm text-gray-400">
                Les publications que vous aimez apparaîtront ici
              </p>
            </div>
          </div>
        ) : (
          favoritePosts.map((post) => (
            <PostCardTikTok key={post.id} post={post} />
          ))
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



