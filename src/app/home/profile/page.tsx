'use client';

import { Header } from "@/components/home/feed-header";
import { BottomNav } from "@/components/home/bottom-nav";
import { 
  User, 
  Settings, 
  Heart, 
  Calendar, 
  LogOut,
  Edit,
  Bell,
  Shield,
  HelpCircle,
  Camera,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { auth, storage } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateUserAvatarInPosts } from "@/lib/posts";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive';
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuthRedirect('/auth');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Avatar cliqué, ouverture du sélecteur de fichier...');
    if (fileInputRef.current) {
      console.log('Référence input trouvée, clic...');
      fileInputRef.current.click();
    } else {
      console.error('Référence input non trouvée!');
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir le sélecteur de fichier',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Fichier sélectionné:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('Aucun fichier sélectionné');
      return;
    }
    if (!user) {
      console.error('Utilisateur non connecté');
      return;
    }
    
    console.log('Fichier sélectionné:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez sélectionner une image',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La photo ne doit pas dépasser 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Créer une preview
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);

    try {
      setUploadingPhoto(true);

      // Uploader vers Firebase Storage
      const timestamp = Date.now();
      const fileName = `profile_${user.uid}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `profiles/${user.uid}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Attendre la fin de l'upload
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload photo de profil: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Erreur lors de l\'upload:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Photo de profil uploadée:', downloadURL);

              // Mettre à jour le profil utilisateur
              await updateProfile(user, {
                photoURL: downloadURL
              });

              console.log('✅ Photo de profil mise à jour dans Firebase Auth');

              // Mettre à jour la photo dans tous les posts de l'utilisateur
              try {
                console.log('🔄 Début de la mise à jour des posts...');
                await updateUserAvatarInPosts(user.uid, downloadURL);
                console.log('✅ Photo de profil mise à jour dans tous les posts');
                
                // Attendre un peu pour que Firestore se synchronise
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Attente de synchronisation Firestore terminée');
              } catch (updateError: any) {
                console.error('⚠️ Erreur lors de la mise à jour des posts:', updateError);
                console.error('Code d\'erreur:', updateError.code);
                console.error('Message:', updateError.message);
                
                toast({
                  title: 'Avertissement',
                  description: 'La photo a été mise à jour mais certains posts peuvent ne pas être synchronisés. Rafraîchissez la page d\'accueil.',
                  variant: 'default',
                });
              }

              // Nettoyer la preview
              URL.revokeObjectURL(preview);
              setPhotoPreview(null);

              toast({
                title: 'Photo mise à jour !',
                description: 'Votre photo de profil a été mise à jour avec succès',
              });

              // Attendre un peu plus pour que tout soit synchronisé
              await new Promise(resolve => setTimeout(resolve, 1500));

              // Rediriger vers la page d'accueil avec un paramètre pour forcer le rafraîchissement
              router.push('/home?refresh=profile');
              
              // Recharger aussi la page d'accueil pour forcer le rafraîchissement après un court délai
              setTimeout(() => {
                window.location.href = '/home?refresh=profile';
              }, 1000);

              resolve();
            } catch (error) {
              console.error('Erreur lors de la mise à jour du profil:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      
      // Nettoyer la preview en cas d'erreur
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }

      let errorMessage = 'Une erreur est survenue lors de l\'upload de la photo';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Permissions insuffisantes. Vérifiez les règles Storage.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Le quota de stockage a été dépassé';
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      label: 'Modifier le profil',
      icon: Edit,
      onClick: () => {
        // TODO: Ouvrir le modal d'édition de profil
        console.log('Modifier le profil');
      }
    },
    {
      id: 'favorites',
      label: 'Mes favoris',
      icon: Heart,
      onClick: () => router.push('/home/favorites')
    },
    {
      id: 'reservations',
      label: 'Mes réservations',
      icon: Calendar,
      onClick: () => {
        // TODO: Naviguer vers les réservations
        console.log('Mes réservations');
      }
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onClick: () => {
        // TODO: Naviguer vers les notifications
        console.log('Notifications');
      }
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      onClick: () => {
        // TODO: Naviguer vers les paramètres
        console.log('Paramètres');
      }
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      icon: Shield,
      onClick: () => {
        // TODO: Naviguer vers la confidentialité
        console.log('Confidentialité');
      }
    },
    {
      id: 'help',
      label: 'Aide & Support',
      icon: HelpCircle,
      onClick: () => {
        // TODO: Naviguer vers l'aide
        console.log('Aide & Support');
      }
    },
    {
      id: 'logout',
      label: 'Déconnexion',
      icon: LogOut,
      onClick: handleSignOut,
      variant: 'destructive'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8800]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          {/* En-tête du profil */}
          <div className="mb-6">
            <Card className="border-2 border-[#FFCC00]/30">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={!uploadingPhoto ? handleAvatarClick : undefined}
                      disabled={uploadingPhoto}
                      className={cn(
                        "relative rounded-full border-4 border-[#FFCC00] transition-all duration-200",
                        !uploadingPhoto && "cursor-pointer hover:scale-105 hover:border-[#FF8800] focus:outline-none focus:ring-2 focus:ring-[#FF8800] focus:ring-offset-2",
                        uploadingPhoto && "cursor-not-allowed opacity-75"
                      )}
                    >
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={photoPreview || user.photoURL || ''} 
                          alt={displayName} 
                        />
                        <AvatarFallback className="bg-[#FF8800] text-white text-2xl font-headline">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {!uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full pointer-events-none">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    aria-label="Sélectionner une photo de profil"
                  />
                  <div className="text-center">
                    <h1 className="text-2xl font-headline font-bold text-[#003366]">
                      {displayName}
                    </h1>
                    {user.email && (
                      <p className="text-gray-600 font-body mt-1">{user.email}</p>
                    )}
                    {user.phoneNumber && (
                      <p className="text-gray-600 font-body mt-1">{user.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.id}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  onClick={item.onClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={item.variant === 'destructive' 
                        ? "rounded-lg p-2 bg-red-100" 
                        : "rounded-lg p-2 bg-[#003366]/10"
                      }>
                        <Icon className={item.variant === 'destructive' 
                          ? "h-5 w-5 text-red-600" 
                          : "h-5 w-5 text-[#003366]"
                        } />
                      </div>
                      <span className={item.variant === 'destructive'
                        ? "font-body font-medium text-red-600 flex-1"
                        : "font-body font-medium text-[#003366] flex-1"
                      }>
                        {item.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Statistiques (optionnel) */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-headline font-bold text-[#FF8800]">0</div>
                <div className="text-xs text-gray-600 font-body mt-1">Favoris</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-headline font-bold text-[#339966]">0</div>
                <div className="text-xs text-gray-600 font-body mt-1">Réservations</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-headline font-bold text-[#003366]">0</div>
                <div className="text-xs text-gray-600 font-body mt-1">Publications</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

