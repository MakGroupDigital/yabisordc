'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/home/bottom-nav';
import { Header } from '@/components/home/feed-header';
import { createPost, uploadMedia } from '@/lib/posts';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

type MediaFile = {
  file: File;
  preview: string;
  type: 'image' | 'video';
};

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuthRedirect('/auth');
  
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showStorageError, setShowStorageError] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: 'Format non supporté',
          description: 'Veuillez sélectionner une image ou une vidéo',
          variant: 'destructive',
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setMediaFiles((prev) => [
        ...prev,
        { file, preview, type: isImage ? 'image' : 'video' },
      ]);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      newFiles.forEach((mf) => URL.revokeObjectURL(mf.preview));
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      // Redirection déjà gérée par useAuthRedirect
      return;
    }

    if (mediaFiles.length === 0) {
      toast({
        title: 'Média requis',
        description: 'Veuillez ajouter au moins une image ou une vidéo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setShowUploadDialog(true);
    setUploadProgress(0);
    setCurrentUploadIndex(0);

    try {
      const mediaUrls: { type: 'image' | 'video'; url: string }[] = [];
      
      // Uploader les médias un par un pour suivre la progression
      for (let i = 0; i < mediaFiles.length; i++) {
        setCurrentUploadIndex(i + 1);
        setUploadProgress(0);
        
        const url = await uploadMedia(
          mediaFiles[i].file, 
          user.uid,
          (progress) => {
            // Calculer la progression globale
            const totalProgress = ((i / mediaFiles.length) * 100) + (progress / mediaFiles.length);
            setUploadProgress(totalProgress);
          }
        );
        
        // Valider l'URL avant de l'ajouter
        if (!url || !url.startsWith('http')) {
          throw new Error(`URL invalide pour le média ${i + 1}: ${url}`);
        }
        
        mediaUrls.push({
          type: mediaFiles[i].type,
          url: url.trim(), // Nettoyer l'URL
        });
        
        console.log(`✅ Média ${i + 1} uploadé et validé:`, {
          type: mediaFiles[i].type,
          url: url,
          urlLength: url.length,
          urlStartsWithHttp: url.startsWith('http')
        });
      }

      setUploadProgress(100);

      // Validation finale avant sauvegarde
      console.log('📦 Validation finale des médias avant sauvegarde:');
      mediaUrls.forEach((m, i) => {
        if (!m.url || !m.url.startsWith('http')) {
          console.error(`❌ Média ${i + 1} a une URL invalide:`, m);
          throw new Error(`URL invalide pour le média ${i + 1}`);
        }
        console.log(`✅ Média ${i + 1}:`, {
          type: m.type,
          url: m.url,
          isValid: m.url.startsWith('https://firebasestorage.googleapis.com')
        });
      });

      console.log('💾 Création de la publication avec les médias:', {
        mediaCount: mediaUrls.length,
        mediaUrls: mediaUrls.map(m => ({ 
          type: m.type, 
          url: m.url,
          urlPreview: m.url.substring(0, 100) + '...'
        }))
      });

      // Créer la publication
      await createPost(
        user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        user.uid,
        location || 'RDC',
        user.photoURL || 'https://picsum.photos/seed/user/40/40',
        mediaUrls,
        caption
      );

      toast({
        title: 'Publication créée !',
        description: 'Votre publication a été ajoutée avec succès',
      });

      // Nettoyer les previews
      mediaFiles.forEach((mf) => URL.revokeObjectURL(mf.preview));

      // Fermer le dialog et rediriger avec rafraîchissement forcé
      setShowUploadDialog(false);
      
      // Attendre un peu pour que Firestore enregistre les données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers la page home avec un paramètre pour forcer le rafraîchissement
      router.push('/home?refresh=' + Date.now());
      router.refresh(); // Forcer le rafraîchissement de Next.js
    } catch (error: any) {
      console.error('Erreur lors de la création de la publication:', error);
      setShowUploadDialog(false);
      
      let errorMessage = 'Une erreur est survenue lors de la création de la publication';
      
      if (error.code === 'storage/unauthorized' || error.code === 'storage/permission-denied') {
        errorMessage = 'Firebase Storage n\'est pas activé ou les permissions sont incorrectes. Activez-le dans Firebase Console.';
        setShowStorageError(true);
        console.error('🔴 ACTION REQUISE: Activez Firebase Storage dans Firebase Console');
        console.error('Lien direct: https://console.firebase.google.com/project/studio-3821305079-74f59/storage');
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'L\'upload a été annulé';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Une erreur inconnue est survenue lors de l\'upload';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Le quota de stockage a été dépassé';
      } else if (error.code === 'storage/unauthenticated') {
        errorMessage = 'Vous devez être authentifié pour uploader des fichiers';
      } else if (error.code === 'permission-denied' || error.code?.includes('permission')) {
        errorMessage = 'Permissions insuffisantes. Vérifiez les règles Firestore et Storage dans Firebase Console.';
        console.error('🔴 Erreur de permissions:', error);
        console.error('Vérifiez les règles dans Firebase Console');
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8800]" />
      </div>
    );
  }

  // La redirection est gérée par useAuthRedirect
  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8800]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-32">
        <div className="container mx-auto max-w-2xl px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#003366] mb-6">
                Créer une publication
              </h1>
            </div>

            {/* Alerte si Firebase Storage n'est pas activé */}
            {showStorageError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Firebase Storage non activé</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">
                    Firebase Storage doit être activé pour pouvoir publier des médias.
                  </p>
                  <a
                    href="https://console.firebase.google.com/project/studio-3821305079-74f59/storage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    Activer Firebase Storage dans Firebase Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-3 text-xs">
                    Étapes: Storage → Get Started → Choisir le mode → Sélectionner l'emplacement → Done
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload de médias */}
            <div>
              <Label htmlFor="media" className="text-lg font-semibold mb-2 block">
                Médias
              </Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {mediaFiles.map((mediaFile, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    {mediaFile.type === 'image' ? (
                      <Image
                        src={mediaFile.preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={mediaFile.preview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF8800] transition-colors"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Ajouter des images</span>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Label>
                <Label
                  htmlFor="video-upload"
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#FF8800] transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span>Ajouter une vidéo</span>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption" className="text-lg font-semibold mb-2 block">
                Description
              </Label>
              <Textarea
                id="caption"
                placeholder="Partagez votre expérience..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-lg font-semibold mb-2 block">
                Lieu (optionnel)
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Ex: Kinshasa, Goma, Moanda..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || mediaFiles.length === 0}
                className="flex-1 bg-[#FF8800] hover:bg-[#FF8800]/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  'Publier'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />

      {/* Dialog de progression d'upload */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => {
        // Empêcher la fermeture pendant l'upload
        if (!open && uploadProgress < 100) {
          return;
        }
        setShowUploadDialog(open);
      }}>
        <DialogContent 
          className="sm:max-w-md" 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (uploadProgress < 100) {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle className="text-center text-xl font-bold text-[#003366]">
            Publication en cours...
          </DialogTitle>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <CircularProgress value={uploadProgress} size={150} strokeWidth={10} />
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600 font-medium">
                {currentUploadIndex > 0 && mediaFiles.length > 1
                  ? `Upload du média ${currentUploadIndex} sur ${mediaFiles.length}`
                  : 'Upload des médias en cours...'}
              </p>
              <p className="text-xs text-gray-500">
                {uploadProgress < 100 
                  ? 'Veuillez patienter, ne fermez pas cette page'
                  : 'Finalisation de la publication...'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

