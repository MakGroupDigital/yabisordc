'use client';

import { useState, useEffect, useRef } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
import { PostCardTikTok } from "@/components/home/post-card-tiktok";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { 
  Settings, 
  LogOut, 
  User as UserIcon,
  Users,
  UserPlus,
  Bookmark,
  MapPin,
  Grid3x3,
  Heart,
  Eye,
  X,
  Play,
  Trash2,
  BarChart3,
  Edit,
  Camera,
  Save,
  Loader2,
  MessageSquare,
  Share2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile } from 'firebase/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Post } from '@/types';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number>(0);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    favorites: 0,
    totalLikes: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPostManage, setShowPostManage] = useState(false);
  const [postToManage, setPostToManage] = useState<Post | null>(null);
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserPosts([]);
      setStats(prev => ({ ...prev, posts: 0 }));
      return;
    }

    // Filtrer les posts de l'utilisateur uniquement
    const filtered = allPosts.filter(post => {
      // Vérifier que le post a un authorId et qu'il correspond à l'utilisateur
      return post.authorId && post.authorId === user.uid;
    });
    
    setUserPosts(filtered);
    setStats(prev => ({ ...prev, posts: filtered.length }));
  }, [user, allPosts]);

  // Charger les statistiques
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoadingStats(true);

        // 1. Nombre de followers (utilisateurs qui suivent cet utilisateur)
        // Note: Pour une meilleure performance, on pourrait créer une collection followers/{userId}
        // Pour l'instant, on utilise une approche optimisée avec limite
        let followersCount = 0;
        try {
          // Essayer de récupérer depuis une collection dédiée si elle existe
          const followersRef = collection(db, 'users', user.uid, 'followers');
          const followersSnapshot = await getDocs(followersRef);
          followersCount = followersSnapshot.size;
        } catch {
          // Fallback: chercher dans tous les users (limité pour performance)
          // Cette méthode est moins efficace mais fonctionne
          const usersSnapshot = await getDocs(collection(db, 'users'));
          
          // Limiter à 100 utilisateurs pour la performance et exclure l'utilisateur actuel
          const limitedUsers = usersSnapshot.docs
            .filter(userDoc => userDoc.id !== user.uid)
            .slice(0, 100);
          
          const checkPromises = limitedUsers.map(async (userDoc) => {
            const followingRef = doc(db, 'users', userDoc.id, 'following', user.uid);
            const followingSnap = await getDoc(followingRef);
            return followingSnap.exists();
          });
          
          const results = await Promise.all(checkPromises);
          followersCount = results.filter(Boolean).length;
        }

        // 2. Nombre de following (utilisateurs que cet utilisateur suit)
        const followingRef = collection(db, 'users', user.uid, 'following');
        const followingSnapshot = await getDocs(followingRef);
        const followingCount = followingSnapshot.size;

        // 3. Nombre de favoris
        const favoritesQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid)
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoritesCount = favoritesSnapshot.size;

        // 4. Total des likes de tous les posts de l'utilisateur
        const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

        setStats({
          posts: userPosts.length,
          followers: followersCount,
          following: followingCount,
          favorites: favoritesCount,
          totalLikes: totalLikes,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // En cas d'erreur, afficher au moins les posts
        setStats(prev => ({
          ...prev,
          posts: userPosts.length,
        }));
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user, userPosts.length]);

  // Scroll vers le post sélectionné quand la vue plein écran s'ouvre
  useEffect(() => {
    if (selectedPost && fullscreenScrollRef.current && selectedPostIndex >= 0) {
      const postElements = fullscreenScrollRef.current.querySelectorAll('[data-post-index]');
      const targetElement = Array.from(postElements).find(
        (elem) => parseInt(elem.getAttribute('data-post-index') || '0') === selectedPostIndex
      ) as HTMLElement;
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  }, [selectedPost, selectedPostIndex]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour formater les grands nombres
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header avec profil - Design moderne */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 via-black/90 to-transparent backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          {/* Header avec boutons */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-headline font-bold bg-gradient-to-r from-[#FFCC00] to-[#FF8800] bg-clip-text text-transparent">
              Profil
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full transition-all"
                onClick={() => router.push('/home/profile/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Informations du profil - Design moderne */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-[#FFCC00] shadow-lg shadow-[#FFCC00]/30">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Utilisateur'} />
                <AvatarFallback className="bg-gradient-to-br from-[#FF8800] to-[#FFCC00] text-white text-2xl font-bold">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-[#FF8800] rounded-full p-1.5 shadow-lg">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-headline font-bold text-white mb-1">
              {user.displayName || 'Utilisateur'}
            </h2>
            <p className="text-sm text-gray-400 mb-4">{user.email}</p>
            
            {/* Statistiques - Design moderne */}
            {loadingStats ? (
              <div className="grid grid-cols-5 gap-2 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-8 w-12 mb-2 bg-gray-800" />
                    <Skeleton className="h-3 w-16 bg-gray-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 w-full">
                {/* Publications */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Grid3x3 className="h-4 w-4 text-[#FFCC00]" />
                    <span className="text-xl font-bold text-white group-hover:text-[#FFCC00] transition-colors">
                      {formatCount(stats.posts)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Publications</span>
                </div>

                {/* Followers */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-[#FF8800]" />
                    <span className="text-xl font-bold text-white group-hover:text-[#FF8800] transition-colors">
                      {formatCount(stats.followers)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Abonnés</span>
                </div>

                {/* Following */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <UserPlus className="h-4 w-4 text-[#FFCC00]" />
                    <span className="text-xl font-bold text-white group-hover:text-[#FFCC00] transition-colors">
                      {formatCount(stats.following)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Abonnements</span>
                </div>

                {/* Total Likes */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                      {formatCount(stats.totalLikes)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Likes</span>
                </div>

                {/* Favoris */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => router.push('/home/favorites')}>
                  <div className="flex items-center gap-1 mb-1">
                    <Bookmark className="h-4 w-4 text-[#FF8800]" />
                    <span className="text-xl font-bold text-white group-hover:text-[#FF8800] transition-colors">
                      {formatCount(stats.favorites)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Favoris</span>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Modifier le profil */}
          <Button
            onClick={() => {
              setEditingDisplayName(user?.displayName || '');
              setShowEditProfile(true);
            }}
            className="w-full bg-gradient-to-r from-[#FF8800] to-[#FFCC00] hover:from-[#FF8800]/90 hover:to-[#FFCC00]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#FF8800]/30 transition-all"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier le profil
          </Button>
        </div>
      </div>

      {/* Grille de miniatures style Instagram */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-[360px] pb-20">
        {!user ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center p-8">
              <p className="text-white">Chargement...</p>
            </div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-3xl backdrop-blur-xl border border-gray-800/50 max-w-md w-full">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8800] to-[#FFCC00] rounded-full blur-2xl opacity-20"></div>
                <Grid3x3 className="h-20 w-20 mx-auto text-gray-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-white mb-2">
                Aucune publication
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Commencez à partager vos moments avec la communauté
              </p>
              <Button 
                onClick={() => router.push('/home/create')} 
                className="bg-gradient-to-r from-[#FF8800] to-[#FFCC00] hover:from-[#FF8800]/90 hover:to-[#FFCC00]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#FF8800]/30 transition-all"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Créer une publication
              </Button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-2 max-w-2xl">
            {/* Grille 3 colonnes style Instagram */}
            <div className="grid grid-cols-3 gap-1">
              {userPosts
                .filter(post => post.authorId === user.uid)
                .map((post, index) => {
                  const firstMedia = post.media[0];
                  const isVideo = firstMedia?.type === 'video';
                  
                  return (
                    <div
                      key={`grid-${post.id}-${index}`}
                      className="relative aspect-square bg-gray-900 cursor-pointer group overflow-hidden"
                      onClick={() => {
                        setSelectedPost(post);
                        setSelectedPostIndex(index);
                      }}
                    >
                      {firstMedia ? (
                        <>
                          {isVideo ? (
                            <>
                              <video
                                src={firstMedia.url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                onMouseEnter={(e) => {
                                  const video = e.currentTarget;
                                  video.play().catch(() => {});
                                }}
                                onMouseLeave={(e) => {
                                  const video = e.currentTarget;
                                  video.pause();
                                  video.currentTime = 0;
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                                <Play className="h-3 w-3 text-white fill-white" />
                              </div>
                            </>
                          ) : (
                            <Image
                              src={firstMedia.url}
                              alt={`Post ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 33vw, 33vw"
                              unoptimized={true}
                            />
                          )}
                          {/* Overlay au survol avec likes et vues */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3 text-white">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span className="text-xs font-semibold">{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-semibold">{post.viewsCount || 0}</span>
                              </div>
                            </div>
                          </div>
                          {/* Indicateur de plusieurs médias */}
                          {post.media.length > 1 && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                              <Grid3x3 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <Grid3x3 className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Vue plein écran du post sélectionné */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="relative h-full w-full">
            {/* Boutons d'action */}
            <div className="absolute top-4 right-4 z-[101] flex items-center gap-2">
              {/* Bouton gérer le post (si c'est le post de l'utilisateur) */}
              {selectedPost && selectedPost.authorId === user?.uid && (
                <button
                  onClick={() => {
                    setPostToManage(selectedPost);
                    setShowPostManage(true);
                  }}
                  className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-colors"
                  title="Gérer le post"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedPost(null)}
                className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Container avec scroll snap style TikTok */}
            <div 
              ref={fullscreenScrollRef}
              className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none"
            >
              {userPosts
                .filter(post => post.authorId === user.uid)
                .map((post, index) => (
                  <div key={`fullscreen-${post.id}-${index}`} data-post-index={index}>
                    <PostCardTikTok post={post} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modifier le profil */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le profil</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mettez à jour votre photo de profil et votre nom d'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Photo de profil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-[#FFCC00] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Utilisateur'} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF8800] to-[#FFCC00] text-white text-2xl font-bold">
                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 bg-[#FF8800] hover:bg-[#FF8800]/90 rounded-full p-2 text-white transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !user) return;

                    try {
                      setUploadingPhoto(true);
                      const timestamp = Date.now();
                      const storageRef = ref(storage, `avatars/${user.uid}/${timestamp}_${file.name}`);
                      const uploadTask = uploadBytesResumable(storageRef, file);

                      await new Promise((resolve, reject) => {
                        uploadTask.on(
                          'state_changed',
                          () => {},
                          reject,
                          async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            await updateProfile(user, { photoURL: downloadURL });
                            resolve(downloadURL);
                          }
                        );
                      });

                      toast({
                        title: "Photo mise à jour",
                        description: "Votre photo de profil a été mise à jour avec succès",
                      });
                    } catch (error: any) {
                      console.error('Erreur upload photo:', error);
                      toast({
                        title: "Erreur",
                        description: "Impossible de mettre à jour la photo de profil",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Cliquez sur l'avatar ou l'icône caméra pour changer votre photo
              </p>
            </div>

            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">
                Nom d'utilisateur
              </Label>
              <Input
                id="displayName"
                value={editingDisplayName}
                onChange={(e) => setEditingDisplayName(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                className="bg-gray-900 text-white border-gray-700"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  if (!user || !editingDisplayName.trim()) {
                    toast({
                      title: "Erreur",
                      description: "Le nom d'utilisateur ne peut pas être vide",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    setUploadingProfile(true);
                    await updateProfile(user, { displayName: editingDisplayName.trim() });
                    toast({
                      title: "Profil mis à jour",
                      description: "Votre profil a été mis à jour avec succès",
                    });
                    setShowEditProfile(false);
                  } catch (error: any) {
                    console.error('Erreur mise à jour profil:', error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de mettre à jour le profil",
                      variant: "destructive",
                    });
                  } finally {
                    setUploadingProfile(false);
                  }
                }}
                disabled={uploadingProfile || !editingDisplayName.trim()}
                className="flex-1 bg-gradient-to-r from-[#FF8800] to-[#FFCC00] hover:from-[#FF8800]/90 hover:to-[#FFCC00]/90 text-white"
              >
                {uploadingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Gérer le post */}
      <Dialog open={showPostManage} onOpenChange={setShowPostManage}>
        <DialogContent className="max-w-md bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Gérer la publication</DialogTitle>
            <DialogDescription className="text-gray-400">
              Gérez votre publication
            </DialogDescription>
          </DialogHeader>
          
          {postToManage && (
            <div className="space-y-4 py-4">
              {/* Statistiques */}
              <div className="bg-gray-900 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#FFCC00]" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Vues</p>
                      <p className="text-white font-semibold">{postToManage.viewsCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Likes</p>
                      <p className="text-white font-semibold">{postToManage.likes || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Commentaires</p>
                      <p className="text-white font-semibold">{postToManage.comments || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Partages</p>
                      <p className="text-white font-semibold">{postToManage.sharesCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPostManage(false);
                    setPostToManage(null);
                  }}
                  className="w-full border-gray-700 text-white hover:bg-gray-800"
                >
                  Fermer
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!postToManage || !user) return;

                    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.')) {
                      return;
                    }

                    try {
                      const postRef = doc(db, 'posts', postToManage.id);
                      await deleteDoc(postRef);
                      
                      toast({
                        title: "Publication supprimée",
                        description: "Votre publication a été supprimée avec succès",
                      });
                      
                      setShowPostManage(false);
                      setPostToManage(null);
                      setSelectedPost(null);
                    } catch (error: any) {
                      console.error('Erreur suppression post:', error);
                      toast({
                        title: "Erreur",
                        description: "Impossible de supprimer la publication",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer la publication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bottom Nav - Fixé en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}





