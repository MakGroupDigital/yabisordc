'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { PostCardTikTok } from "@/components/home/post-card-tiktok";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

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

export default function ProfilePage() {
  const { posts: allPosts, loading: postsLoading } = usePosts(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && allPosts.length > 0) {
      // Filtrer les posts de l'utilisateur
      const filtered = allPosts.filter(post => post.authorId === user.uid);
      setUserPosts(filtered);
    }
  }, [user, allPosts]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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

  if (!user) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Connectez-vous</p>
          <p className="text-sm text-gray-400 mb-4">Connectez-vous pour voir votre profil</p>
          <Button onClick={() => router.push('/auth')} className="bg-[#FF8800] hover:bg-[#FF8800]/90">
            Se connecter
          </Button>
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
      {/* Header avec profil */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Profil</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-800"
                onClick={() => router.push('/home/profile/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-800"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Informations du profil */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-[#FF8800]">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Utilisateur'} />
              <AvatarFallback className="bg-[#FF8800] text-white text-lg">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                {user.displayName || 'Utilisateur'}
              </h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {userPosts.length} {userPosts.length <= 1 ? 'publication' : 'publications'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Container avec scroll snap style TikTok */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none pt-32">
        {userPosts.length === 0 ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-white text-center p-4">
              <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg mb-2">Aucune publication</p>
              <p className="text-sm text-gray-400 mb-4">
                Vous n'avez pas encore créé de publication
              </p>
              <Button 
                onClick={() => router.push('/home/create')} 
                className="bg-[#FF8800] hover:bg-[#FF8800]/90"
              >
                Créer une publication
              </Button>
            </div>
          </div>
        ) : (
          userPosts.map((post) => (
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

