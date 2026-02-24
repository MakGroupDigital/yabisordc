'use client';

import { useState, useEffect, useRef } from 'react';
import { BottomNav } from "@/components/home/bottom-nav";
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
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { 
  Settings, 
  LogOut, 
  User as UserIcon,
  Users,
  UserPlus,
  Bookmark,
  Grid3x3,
  Heart,
  Camera,
  Save,
  Loader2,
  Edit,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile } from 'firebase/auth';
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
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-transparent">
            <div className="container mx-auto px-4 py-4 max-w-2xl">
                <Skeleton className="h-8 w-32 mb-6 bg-[#EAF2FF]" />
                <div className="flex flex-col items-center mb-6">
                    <Skeleton className="h-24 w-24 rounded-full mb-4 bg-[#EAF2FF]" />
                    <Skeleton className="h-6 w-40 mb-2 bg-[#EAF2FF]" />
                    <Skeleton className="h-4 w-48 mb-4 bg-[#EAF2FF]" />
                    <div className="grid grid-cols-5 gap-2 w-full">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col items-center">
                                <Skeleton className="h-8 w-12 mb-2 bg-[#EAF2FF]" />
                                <Skeleton className="h-3 w-16 bg-[#EAF2FF]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    favorites: 0,
    totalLikes: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Charger les statistiques
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoadingStats(true);

        // 1. Nombre de followers
        let followersCount = 0;
        try {
          const followersRef = collection(db, 'users', user.uid, 'followers');
          const followersSnapshot = await getDocs(followersRef);
          followersCount = followersSnapshot.size;
        } catch {
          followersCount = 0;
        }

        // 2. Nombre de following
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

        // 4. Nombre de posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', user.uid)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsCount = postsSnapshot.size;

        setStats({
          posts: postsCount,
          followers: followersCount,
          following: followingCount,
          favorites: favoritesCount,
          totalLikes: 0,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user]);

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

  if (loading) {
    return (
      <>
        <LoadingSkeleton />
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BottomNav />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-transparent flex items-center justify-center">
        <div className="text-slate-900 text-center p-4">
          <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Connectez-vous</p>
          <p className="text-sm text-slate-500 mb-4">Connectez-vous pour voir votre profil</p>
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
    <div className="relative h-screen w-full overflow-hidden bg-[#F5F8FD]">
      {/* Header avec profil - Design moderne */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#003366]/10">
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
                className="text-slate-900 hover:bg-white/10 rounded-full transition-all"
                onClick={() => router.push('/home/profile/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-900 hover:bg-white/10 rounded-full transition-all"
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
                <AvatarFallback className="bg-gradient-to-br from-[#FF8800] to-[#FFCC00] text-slate-900 text-2xl font-bold">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-[#FF8800] rounded-full p-1.5 shadow-lg">
                <UserIcon className="h-4 w-4 text-slate-900" />
              </div>
            </div>
            
            <h2 className="text-2xl font-headline font-bold text-slate-900 mb-1">
              {user.displayName || 'Utilisateur'}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            
            {/* Statistiques - Design moderne */}
            {loadingStats ? (
              <div className="grid grid-cols-5 gap-2 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-8 w-12 mb-2 bg-[#EAF2FF]" />
                    <Skeleton className="h-3 w-16 bg-[#EAF2FF]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 w-full">
                {/* Publications */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Grid3x3 className="h-4 w-4 text-[#FFCC00]" />
                    <span className="text-xl font-bold text-slate-900 group-hover:text-[#FFCC00] transition-colors">
                      {formatCount(stats.posts)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Publications</span>
                </div>

                {/* Followers */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-[#FF8800]" />
                    <span className="text-xl font-bold text-slate-900 group-hover:text-[#FF8800] transition-colors">
                      {formatCount(stats.followers)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Abonnés</span>
                </div>

                {/* Following */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <UserPlus className="h-4 w-4 text-[#FFCC00]" />
                    <span className="text-xl font-bold text-slate-900 group-hover:text-[#FFCC00] transition-colors">
                      {formatCount(stats.following)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Abonnements</span>
                </div>

                {/* Total Likes */}
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xl font-bold text-slate-900 group-hover:text-red-500 transition-colors">
                      {formatCount(stats.totalLikes)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Likes</span>
                </div>

                {/* Favoris */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => router.push('/home/favorites')}>
                  <div className="flex items-center gap-1 mb-1">
                    <Bookmark className="h-4 w-4 text-[#FF8800]" />
                    <span className="text-xl font-bold text-slate-900 group-hover:text-[#FF8800] transition-colors">
                      {formatCount(stats.favorites)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Favoris</span>
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
            className="w-full bg-gradient-to-r from-[#FF8800] to-[#FFCC00] hover:from-[#FF8800]/90 hover:to-[#FFCC00]/90 text-slate-900 font-semibold rounded-xl shadow-lg shadow-[#FF8800]/30 transition-all"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier le profil
          </Button>
        </div>
      </div>

      {/* Contenu simplifié sans grille */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-[360px] pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-3xl backdrop-blur-xl border border-[#003366]/10 max-w-md w-full">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8800] to-[#FFCC00] rounded-full blur-2xl opacity-20"></div>
                <UserIcon className="h-20 w-20 mx-auto text-gray-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-slate-900 mb-2">
                Profil utilisateur
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Gérez vos informations personnelles et vos paramètres
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav - Fixé en bas */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md bg-transparent border-[#003366]/10">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Modifier le profil</DialogTitle>
            <DialogDescription className="text-slate-500">
              Mettez à jour votre photo de profil et votre nom d'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Photo de profil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-[#FFCC00] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Utilisateur'} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF8800] to-[#FFCC00] text-slate-900 text-2xl font-bold">
                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 bg-[#FF8800] hover:bg-[#FF8800]/90 rounded-full p-2 text-slate-900 transition-colors disabled:opacity-50"
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
              <p className="text-sm text-slate-500 text-center">
                Cliquez sur l'avatar ou l'icône caméra pour changer votre photo
              </p>
            </div>

            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-900">
                Nom d'utilisateur
              </Label>
              <Input
                id="displayName"
                value={editingDisplayName}
                onChange={(e) => setEditingDisplayName(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                className="bg-white text-slate-900 border-[#003366]/15"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 border-[#003366]/15 text-slate-900 hover:bg-[#EAF2FF]"
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
                className="flex-1 bg-gradient-to-r from-[#FF8800] to-[#FFCC00] hover:from-[#FF8800]/90 hover:to-[#FFCC00]/90 text-slate-900"
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

          <BottomNav />

      {/* Bottom Nav - Fixé en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
