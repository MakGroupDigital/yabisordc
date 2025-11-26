'use client';

import { Header } from "@/components/home/feed-header";
import { PostCard } from "@/components/home/post-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { getPosts } from "@/lib/posts";
import { Post } from "@/types";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function PostSkeleton() {
    return (
        <div className="w-full bg-white dark:bg-card p-4 rounded-3xl shadow-xl my-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            <Skeleton className="w-full h-[400px] rounded-2xl mt-4" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
    )
}

export default function FeedPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des publications...');
      const fetchedPosts = await getPosts();
      console.log('✅ Publications chargées:', fetchedPosts.length);
      
      // Log détaillé de chaque post
      fetchedPosts.forEach((post, index) => {
        const mediaInfo = post.media?.map(m => ({
          type: m.type,
          url: m.url,
          urlLength: m.url?.length || 0,
          hasUrl: !!m.url,
          urlPreview: m.url?.substring(0, 100) + '...'
        })) || [];
        
        console.log(`📋 Post ${index + 1}:`, {
          id: post.id,
          author: post.author,
          mediaCount: post.media?.length || 0,
          hasMedia: !!post.media && post.media.length > 0,
          media: mediaInfo,
          rawMedia: post.media // Log complet pour inspection
        });
        
        // Vérifier si les médias ont des URLs valides
        if (post.media && post.media.length > 0) {
          post.media.forEach((m, mediaIndex) => {
            if (!m.url) {
              console.error(`❌ Post ${post.id} - Média ${mediaIndex} n'a pas d'URL!`, m);
            } else if (!m.url.startsWith('http')) {
              console.error(`❌ Post ${post.id} - Média ${mediaIndex} a une URL invalide:`, m.url);
            } else {
              console.log(`✅ Post ${post.id} - Média ${mediaIndex} URL valide:`, m.url.substring(0, 80));
            }
          });
        } else {
          console.warn(`⚠️ Post ${post.id} n'a pas de médias!`);
        }
      });
      
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error('Erreur lors du chargement des publications:', err);
      
      let errorMessage = 'Impossible de charger les publications';
      if (err.code === 'unavailable' || err.message?.includes('Could not reach')) {
        errorMessage = 'Firestore n\'est pas accessible. Vérifiez que Firestore est activé dans Firebase Console.';
        console.error('🔴 ACTION REQUISE: Activez Firestore dans Firebase Console');
        console.error('Lien: https://console.firebase.google.com/project/studio-3821305079-74f59/firestore');
      }
      
      setError(errorMessage);
    } finally {
            setLoading(false);
      setRefreshing(false);
    }
    }, []);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Rafraîchir les posts si on vient de la page profil (après mise à jour photo)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    if (refresh === 'profile') {
      console.log('🔄 Rafraîchissement depuis la page profil...');
      loadPosts();
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/home');
    }
  }, [loadPosts]);

  // Rafraîchir les posts quand la page redevient visible (après création d'un post)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Page redevient visible, rafraîchissement des posts...');
        loadPosts();
      }
    };

    const handleFocus = () => {
      console.log('📱 Fenêtre redevient active, rafraîchissement des posts...');
      loadPosts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  // Convertir les posts Firebase au format attendu par PostCard
  const formattedPosts = React.useMemo(() => {
    return posts.map(post => {
      const formatted = {
        id: post.id,
        author: post.author,
        location: post.location || formatDistanceToNow(post.createdAt, { addSuffix: true, locale: fr }),
        avatarUrl: post.avatarUrl,
        media: post.media || [],
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
      };
      
      // Log de l'avatarUrl pour vérification
      console.log(`👤 Post ${post.id} - Avatar URL:`, {
        author: post.author,
        avatarUrl: post.avatarUrl?.substring(0, 80) + '...',
        hasAvatarUrl: !!post.avatarUrl
      });
      
      // Log seulement si les médias sont manquants
      if (!post.media || post.media.length === 0) {
        console.warn('⚠️ Post sans média:', {
          id: post.id,
          author: post.author,
          caption: post.caption?.substring(0, 50)
        });
      }
      
      return formatted;
    });
  }, [posts]);
    
  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          {/* Bouton de rafraîchissement */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            ) : error ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-red-500 font-semibold">{error}</div>
                  {error.includes('Firestore') && (
                    <a
                      href="https://console.firebase.google.com/project/studio-3821305079-74f59/firestore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Activer Firestore dans Firebase Console →
                    </a>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Réessayer
                  </Button>
                </div>
            ) : formattedPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 space-y-4">
                  <p>Aucune publication pour le moment. Soyez le premier à publier !</p>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
            ) : (
                formattedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
