'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/home/bottom-nav';
import { X, Upload, Loader2, Hash } from 'lucide-react';
import { storage, db, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

export default function CreatePostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) return;

    const currentFilesCount = mediaFiles.length;
    const filesToAdd = validFiles.slice(0, 10 - currentFilesCount);
    
    if (filesToAdd.length === 0) return;

    // Vérifier la taille des fichiers
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const oversizedFiles = filesToAdd.filter(f => f.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`Certains fichiers sont trop volumineux (max 100MB). Veuillez les compresser avant de les uploader.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Traiter les fichiers (vérification de taille)
    const processedFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (const file of filesToAdd) {
      try {
        // Vérifier la taille des vidéos
        if (file.type.startsWith('video/')) {
          const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
          if (file.size > MAX_VIDEO_SIZE) {
            alert(`La vidéo "${file.name}" est trop volumineuse (${(file.size / 1024 / 1024).toFixed(1)}MB). Veuillez utiliser une vidéo de moins de 50MB.`);
            continue;
          }
        }
        
        processedFiles.push(file);
        const objectURL = URL.createObjectURL(file);
        newPreviews.push(objectURL);
      } catch (error) {
        console.error('Erreur lors du traitement du fichier:', error);
      }
    }

    // Mettre à jour les états seulement si des fichiers ont été traités
    if (processedFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...processedFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
      setUploadStatus('');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    // Libérer l'URL de l'objet avant de supprimer
    const previewToRemove = mediaPreviews[index];
    if (previewToRemove) {
      try {
        URL.revokeObjectURL(previewToRemove);
      } catch (error) {
        // Ignorer les erreurs de révocation
      }
    }
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Nettoyer les URLs lors du démontage du composant
  useEffect(() => {
    return () => {
      mediaPreviews.forEach(preview => {
        if (preview && (preview.startsWith('blob:') || preview.startsWith('http'))) {
          try {
            URL.revokeObjectURL(preview);
          } catch (error) {
            // Ignorer les erreurs de révocation
          }
        }
      });
    };
  }, [mediaPreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations initiales
    if (!user) {
      alert('Vous devez être connecté pour publier');
      return;
    }

    if (mediaFiles.length === 0) {
      alert('Veuillez ajouter au moins une image ou une vidéo');
      return;
    }

    // Vérifier que storage est bien initialisé
    if (!storage) {
      console.error('❌ Firebase Storage n\'est pas initialisé');
      alert('Erreur de configuration. Veuillez rafraîchir la page.');
      return;
    }

    // Vérifier l'authentification
    console.log('🔐 Vérification de l\'authentification:', {
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null,
      auth: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email
      } : null
    });

    if (!user || !auth.currentUser) {
      console.error('❌ Utilisateur non authentifié');
      alert('Vous devez être connecté pour publier');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Préparation de l\'upload...');
    setUploadError(null);

    try {
      console.log('🚀 Début de l\'upload:', {
        filesCount: mediaFiles.length,
        userId: user.uid,
        userEmail: user.email,
        storageBucket: storage.app.options.storageBucket,
        files: mediaFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
      });

      // Upload des médias vers Firebase Storage avec suivi de progression
      const mediaUrls: { type: 'image' | 'video'; url: string }[] = [];
      const totalFiles = mediaFiles.length;
      let uploadedFiles = 0;

      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        
        try {
          // Vérifier que le fichier est valide
          if (!file || file.size === 0) {
            throw new Error(`Le fichier ${file?.name || `#${i + 1}`} est invalide ou vide`);
          }

          const timestamp = Date.now();
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storagePath = `posts/${user.uid}/${timestamp}_${i}_${sanitizedName}`;
          const fileRef = ref(storage, storagePath);
          
          console.log(`📤 Début upload fichier ${i + 1}/${totalFiles}:`, {
            name: file.name,
            size: file.size,
            type: file.type,
            path: storagePath,
            fullPath: fileRef.fullPath,
            bucket: fileRef.bucket
          });
          
          setUploadStatus(`Upload de ${i + 1}/${totalFiles}...`);
          setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
          
          // Utiliser uploadBytesResumable pour suivre la progression
          console.log(`🔄 Création de la tâche d'upload pour ${file.name}...`);
          const uploadTask = uploadBytesResumable(fileRef, file, {
            contentType: file.type
          });
          
          console.log(`▶️ Démarrage de l'upload pour ${file.name}...`);
          // Démarrer l'upload immédiatement
          uploadTask.resume();
          
          // Vérifier l'état initial
          console.log(`📊 État initial de l'upload:`, {
            state: uploadTask.snapshot.state,
            bytesTransferred: uploadTask.snapshot.bytesTransferred,
            totalBytes: uploadTask.snapshot.totalBytes
          });
          
          await new Promise<void>((resolve, reject) => {
            let hasStarted = false;
            let uploadTimeout: NodeJS.Timeout | null = null;
            
            // Timeout de sécurité (5 minutes par fichier)
            uploadTimeout = setTimeout(() => {
              if (!hasStarted) {
                console.error('⏱️ Timeout: L\'upload n\'a pas démarré dans les 30 secondes');
                reject(new Error(`L'upload du fichier "${file.name}" a pris trop de temps. Vérifiez votre connexion internet.`));
              }
            }, 30000);
            
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                // Annuler le timeout si l'upload a démarré
                if (uploadTimeout) {
                  clearTimeout(uploadTimeout);
                  uploadTimeout = null;
                }
                
                // Log de chaque changement d'état
                console.log(`📊 État upload ${file.name}:`, {
                  state: snapshot.state,
                  bytesTransferred: snapshot.bytesTransferred,
                  totalBytes: snapshot.totalBytes,
                  progress: snapshot.totalBytes > 0 
                    ? ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(2) + '%'
                    : '0%'
                });
                
                if (!hasStarted) {
                  hasStarted = true;
                  console.log(`✅ Upload démarré pour ${file.name}`, {
                    state: snapshot.state,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes
                  });
                }
                
                // Calculer la progression du fichier actuel (0-100)
                const fileProgress = snapshot.totalBytes > 0 
                  ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                  : 0;
                
                // Calculer la progression globale : fichiers déjà uploadés + progression du fichier actuel
                const overallProgress = ((uploadedFiles * 100 + fileProgress) / totalFiles);
                const roundedProgress = Math.min(Math.round(overallProgress), 99);
                
                setUploadProgress(roundedProgress);
                setUploadStatus(`Upload de ${i + 1}/${totalFiles}... ${Math.round(fileProgress)}%`);
                
                if (Math.round(fileProgress) % 25 === 0 || fileProgress === 100) {
                  console.log(`📈 Progression: ${roundedProgress}% (fichier: ${Math.round(fileProgress)}%)`);
                }
              },
              (error: any) => {
                if (uploadTimeout) {
                  clearTimeout(uploadTimeout);
                }
                console.error('❌ Erreur lors de l\'upload:', {
                  code: error.code,
                  message: error.message,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type
                });
                
                // Messages d'erreur plus explicites
                let errorMessage = 'Erreur lors de l\'upload';
                if (error.code === 'storage/unauthorized') {
                  errorMessage = 'Vous n\'avez pas la permission d\'uploader. Vérifiez les règles Firebase Storage.';
                } else if (error.code === 'storage/canceled') {
                  errorMessage = 'L\'upload a été annulé.';
                } else if (error.code === 'storage/unknown') {
                  errorMessage = 'Erreur inconnue. Vérifiez votre connexion internet.';
                } else if (error.message) {
                  errorMessage = error.message;
                }
                
                reject(new Error(`${errorMessage} (fichier: ${file.name})`));
              },
              async () => {
                if (uploadTimeout) {
                  clearTimeout(uploadTimeout);
                }
                
                try {
                  // Upload terminé pour ce fichier
                  console.log(`✅ Upload terminé pour ${file.name}, récupération de l'URL...`);
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  
                  if (!downloadURL) {
                    throw new Error('Impossible de récupérer l\'URL de téléchargement');
                  }
                  
                  mediaUrls.push({
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    url: downloadURL
                  });
                  
                  uploadedFiles++;
                  const progress = Math.round((uploadedFiles / totalFiles) * 100);
                  setUploadProgress(progress);
                  setUploadStatus(`Fichier ${i + 1}/${totalFiles} uploadé avec succès`);
                  console.log(`✅ Fichier ${i + 1}/${totalFiles} uploadé:`, downloadURL);
                  resolve();
                } catch (error: any) {
                  console.error('❌ Erreur lors de la récupération de l\'URL:', {
                    error: error,
                    code: error?.code,
                    message: error?.message,
                    fileName: file.name
                  });
                  reject(new Error(`Impossible de récupérer l'URL du fichier "${file.name}": ${error?.message || 'Erreur inconnue'}`));
                }
              }
            );
          });
        } catch (fileError: any) {
          console.error(`❌ Erreur pour le fichier ${i + 1}:`, fileError);
          throw new Error(`Erreur lors de l'upload du fichier "${file.name}": ${fileError.message || 'Erreur inconnue'}`);
        }
      }

      console.log('✅ Tous les fichiers uploadés:', mediaUrls.length);
      setUploadStatus('Sauvegarde de la publication...');
      setUploadProgress(95);

      // Vérifier que nous avons au moins une URL
      if (mediaUrls.length === 0) {
        throw new Error('Aucun fichier n\'a été uploadé avec succès');
      }

      // Combiner caption et hashtags
      const fullCaption = hashtags.trim() 
        ? `${caption.trim()} ${hashtags.trim()}`.trim()
        : caption.trim();

      // Créer le post dans Firestore
      const postData = {
        author: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        authorId: user.uid,
        location: location || '',
        avatarUrl: user.photoURL || '',
        media: mediaUrls,
        caption: fullCaption,
        likes: 0,
        comments: 0,
        favorites: 0,
        shares: 0,
        views: 0,
        createdAt: serverTimestamp(),
      };

      console.log('💾 Sauvegarde dans Firestore...', {
        author: postData.author,
        mediaCount: postData.media.length,
        captionLength: postData.caption.length
      });

      // Vérifier que db est bien initialisé
      if (!db) {
        throw new Error('Firebase Firestore n\'est pas initialisé');
      }

      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('✅ Publication créée avec succès:', {
        id: docRef.id,
        path: docRef.path
      });

      setUploadProgress(100);
      setUploadStatus('Publication réussie !');

      // Attendre un peu pour que l'utilisateur voie le 100%
      await new Promise(resolve => setTimeout(resolve, 500));

      // Rediriger vers le feed
      router.push('/home');
    } catch (error: any) {
      console.error('❌ Erreur lors de la publication:', {
        error: error,
        name: error?.name,
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      
      // Message d'erreur plus détaillé pour l'utilisateur
      let userMessage = 'Erreur lors de la publication';
      if (error?.code) {
        userMessage += ` (${error.code})`;
      }
      if (error?.message) {
        userMessage += `: ${error.message}`;
      } else if (error?.toString) {
        userMessage += `: ${error.toString()}`;
      }
      
      setUploadStatus(`Erreur: ${userMessage}`);
      setUploadError(userMessage);
      setUploadProgress(0);
      setUploading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté
  if (user === null) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center p-4 max-w-md mx-auto">
          {/* Logo encerclé */}
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-24 rounded-full border-4 border-[#FF8800] p-2 bg-white shadow-lg">
              <Image
                src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
                alt="Ya Biso RDC Logo"
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
          
          <p className="text-lg font-headline mb-2 text-foreground">Connexion requise</p>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour créer une publication
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/auth?redirect=/home/create')} 
              className="bg-[#FF8800] hover:bg-[#FF8800]/90 text-white w-full"
            >
              Connectez-vous
            </Button>
            <Button 
              onClick={() => router.push('/home')} 
              variant="outline"
              className="w-full"
            >
              Retour
            </Button>
          </div>
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="font-headline font-semibold text-lg text-foreground">
            Créer une publication
          </h1>
          <Button
            onClick={handleSubmit}
            disabled={uploading || mediaFiles.length === 0}
            className="bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publication...
              </>
            ) : (
              'Publier'
            )}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Zone de sélection de médias */}
        <div className="space-y-4">
          <Label className="text-foreground">Médias</Label>
          <div className="grid grid-cols-3 gap-4">
            {mediaFiles.map((file, index) => {
              const preview = mediaPreviews[index];
              
              if (!file || !preview) {
                return null;
              }
              
              const isVideo = file.type.startsWith('video/');
              const isImage = file.type.startsWith('image/');
              
              return (
                <div 
                  key={`media-${index}-${file.name}-${file.size}`} 
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-gray-100 dark:bg-gray-800"
                >
                  {isVideo ? (
                    <video 
                      src={preview} 
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : isImage ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Type non supporté
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-10 shadow-lg"
                    aria-label="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            
            {mediaFiles.length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-[#FF8800] transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Ajouter</span>
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-foreground">
            Description
          </Label>
          <Textarea
            id="caption"
            placeholder="Qu'avez-vous à partager ?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {caption.length}/500
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label htmlFor="hashtags" className="text-foreground flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Hashtags (optionnel)
          </Label>
          <Input
            id="hashtags"
            placeholder="#RDC #Kinshasa #Voyage"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="font-medium"
          />
          <p className="text-xs text-muted-foreground">
            Séparez les hashtags par des espaces (ex: #RDC #Kinshasa #Voyage)
          </p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-foreground">
            Localisation (optionnel)
          </Label>
          <Input
            id="location"
            placeholder="Où êtes-vous ?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Barre de progression d'upload */}
        {uploading && (
          <div className="space-y-2 p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{uploadStatus}</span>
              <span className="text-sm font-semibold text-[#FF8800]">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Affichage des erreurs */}
        {uploadError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Erreur lors de la publication
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {uploadError}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadError(null);
                      setUploading(false);
                      setUploadProgress(0);
                      setUploadStatus('');
                    }}
                    className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                  >
                    Fermer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setUploadError(null);
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

