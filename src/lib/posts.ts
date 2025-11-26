import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { Post, PostMedia } from '@/types';

const POSTS_COLLECTION = 'posts';

// Convertir un document Firestore en Post
function firestoreToPost(doc: any): Post {
  const data = doc.data();
  
  // Log des données brutes pour débogage
  console.log('📄 Données brutes Firestore:', {
    id: doc.id,
    hasMedia: 'media' in data,
    mediaType: typeof data.media,
    mediaValue: data.media,
    allFields: Object.keys(data)
  });
  
  // Gérer différents formats de media
  let media: PostMedia[] = [];
  
  if (data.media) {
    if (Array.isArray(data.media)) {
      // Format attendu: [{ type: 'image', url: '...' }]
      media = data.media.map((m: any) => {
        if (typeof m === 'string') {
          // Si c'est juste une string, c'est probablement une URL
          console.warn('⚠️ Format média inattendu (string):', m);
          return { type: 'image' as const, url: m };
        } else if (m && typeof m === 'object') {
          // Format normal
          return {
            type: (m.type || 'image') as 'image' | 'video',
            url: m.url || ''
          };
        } else {
          console.warn('⚠️ Format média inattendu:', m);
          return { type: 'image' as const, url: '' };
        }
      }).filter((m: PostMedia) => m.url && m.url.length > 0);
    } else if (typeof data.media === 'string') {
      // Si media est une string unique
      console.warn('⚠️ Media est une string au lieu d\'un array:', data.media);
      media = [{ type: 'image' as const, url: data.media }];
    }
  }
  
  console.log('📥 Conversion du post depuis Firestore:', {
    id: doc.id,
    author: data.author,
    mediaCount: media.length,
    media: media.map((m: PostMedia) => ({ 
      type: m.type, 
      url: m.url?.substring(0, 80) + '...',
      fullUrl: m.url, // Log complet pour vérification
      hasUrl: !!m.url,
      urlLength: m.url?.length || 0
    }))
  });
  
  // Avertir si pas de média mais qu'il devrait y en avoir
  if (media.length === 0 && data.caption) {
    console.warn(`⚠️ Post ${doc.id} n'a pas de médias mais a une caption. Vérifiez Firestore.`);
  }
  
  return {
    id: doc.id,
    author: data.author || '',
    authorId: data.authorId || '',
    location: data.location || '',
    avatarUrl: data.avatarUrl || '',
    media: media,
    caption: data.caption || '',
    likes: data.likes || 0,
    comments: data.comments || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
  };
}

// Récupérer toutes les publications
export async function getPosts(): Promise<Post[]> {
  try {
    console.log('🔄 Tentative de récupération des publications depuis Firestore...');
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    console.log(`✅ ${querySnapshot.docs.length} document(s) récupéré(s) depuis Firestore`);
    
    // Log détaillé de chaque document brut
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📋 Document ${index + 1} brut:`, {
        id: doc.id,
        fields: Object.keys(data),
        hasMedia: 'media' in data,
        mediaValue: data.media,
        mediaType: typeof data.media,
        mediaIsArray: Array.isArray(data.media)
      });
    });
    
    const posts = querySnapshot.docs.map(firestoreToPost);
    
    // Résumé final
    const postsWithMedia = posts.filter(p => p.media && p.media.length > 0);
    console.log(`📊 Résumé: ${posts.length} posts, ${postsWithMedia.length} avec médias`);
    
    return posts;
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des publications:', error);
    if (error.code === 'unavailable' || error.message?.includes('Could not reach')) {
      console.error('🔴 Firestore n\'est pas accessible. Vérifiez que Firestore est activé dans Firebase Console.');
      console.error('Lien: https://console.firebase.google.com/project/studio-3821305079-74f59/firestore');
    }
    throw error;
  }
}

// Ajouter une nouvelle publication
export async function createPost(
  author: string,
  authorId: string,
  location: string,
  avatarUrl: string,
  media: PostMedia[],
  caption: string
): Promise<string> {
  try {
    console.log('Création de la publication avec les données:', {
      author,
      authorId,
      location,
      mediaCount: media.length,
      captionLength: caption.length
    });

    const postData = {
      author,
      authorId,
      location,
      avatarUrl,
      media,
      caption,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
    };

    console.log('💾 Données à sauvegarder dans Firestore:', {
      author,
      mediaCount: media.length,
      media: media.map(m => ({ 
        type: m.type, 
        url: m.url.substring(0, 80) + '...',
        fullUrl: m.url // Log complet pour vérification
      }))
    });

    console.log('💾 Tentative d\'ajout du document dans Firestore...');
    console.log('📦 Structure complète des données:', JSON.stringify(postData, null, 2));
    
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
    console.log('✅ Publication créée avec succès, ID:', docRef.id);
    console.log('📊 Médias sauvegardés:', media.length, 'média(s)');
    
    // Vérifier immédiatement ce qui a été sauvegardé
    try {
      const savedDoc = await getDocs(query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc')));
      if (savedDoc.docs.length > 0) {
        const firstDoc = savedDoc.docs[0];
        const savedData = firstDoc.data();
        console.log('🔍 Vérification du document sauvegardé:', {
          id: firstDoc.id,
          hasMedia: 'media' in savedData,
          mediaType: typeof savedData.media,
          mediaIsArray: Array.isArray(savedData.media),
          mediaValue: savedData.media
        });
      }
    } catch (verifyError) {
      console.warn('⚠️ Impossible de vérifier le document sauvegardé:', verifyError);
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('Erreur lors de la création de la publication:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Message d\'erreur:', error.message);
    throw error;
  }
}

// Uploader un fichier média vers Firebase Storage avec suivi de progression
export async function uploadMedia(
  file: File, 
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log('Début de l\'upload du média:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId
    });

    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;
    const storagePath = `posts/${fileName}`;
    console.log('Chemin de stockage:', storagePath);
    
    const storageRef = ref(storage, storagePath);
    console.log('Référence Storage créée, début de l\'upload...');
    
    // Utiliser uploadBytesResumable pour le suivi de progression
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculer le pourcentage de progression
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Erreur lors de l\'upload du média:', error);
          reject(error);
        },
        async () => {
          // Upload terminé avec succès
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('✅ URL de téléchargement récupérée:', {
              fileName: file.name,
              url: downloadURL.substring(0, 80) + '...',
              fullUrl: downloadURL
            });
            resolve(downloadURL);
          } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du média:', error);
    throw error;
  }
}

// Incrémenter les likes
export async function incrementLikes(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des likes:', error);
    throw error;
  }
}

// Décrémenter les likes
export async function decrementLikes(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      likes: increment(-1),
    });
  } catch (error) {
    console.error('Erreur lors de la décrémentation des likes:', error);
    throw error;
  }
}

// Mettre à jour la photo de profil dans tous les posts d'un utilisateur
export async function updateUserAvatarInPosts(userId: string, newAvatarUrl: string): Promise<void> {
  try {
    console.log('🔄 Mise à jour de la photo de profil dans les posts de l\'utilisateur:', {
      userId,
      newAvatarUrl: newAvatarUrl.substring(0, 80) + '...'
    });
    
    // Récupérer tous les posts de l'utilisateur
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('authorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`📋 ${querySnapshot.docs.length} post(s) trouvé(s) pour l'utilisateur ${userId}`);
    
    if (querySnapshot.docs.length === 0) {
      console.log('✅ Aucun post à mettre à jour');
      return;
    }

    // Log des posts trouvés
    querySnapshot.docs.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      console.log(`📄 Post ${index + 1}:`, {
        id: docSnapshot.id,
        authorId: data.authorId,
        currentAvatarUrl: data.avatarUrl?.substring(0, 50) + '...',
        newAvatarUrl: newAvatarUrl.substring(0, 50) + '...'
      });
    });

    // Utiliser une batch pour mettre à jour tous les posts en une seule transaction
    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.docs.forEach((docSnapshot) => {
      const postRef = doc(db, POSTS_COLLECTION, docSnapshot.id);
      batch.update(postRef, {
        avatarUrl: newAvatarUrl
      });
      updateCount++;
      console.log(`📝 Post ${docSnapshot.id} ajouté à la batch de mise à jour`);
    });

    // Exécuter la batch
    console.log(`💾 Exécution de la batch pour ${updateCount} post(s)...`);
    await batch.commit();
    console.log(`✅ ${updateCount} post(s) mis à jour avec la nouvelle photo de profil`);
    
    // Vérifier que la mise à jour a bien été effectuée
    const verifyQuery = query(
      collection(db, POSTS_COLLECTION),
      where('authorId', '==', userId)
    );
    const verifySnapshot = await getDocs(verifyQuery);
    
    let verifiedCount = 0;
    verifySnapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.avatarUrl === newAvatarUrl) {
        verifiedCount++;
      } else {
        console.warn(`⚠️ Post ${docSnapshot.id} n'a pas été mis à jour correctement:`, {
          expected: newAvatarUrl.substring(0, 50) + '...',
          actual: data.avatarUrl?.substring(0, 50) + '...'
        });
      }
    });
    
    console.log(`✅ Vérification: ${verifiedCount}/${verifySnapshot.docs.length} post(s) ont la nouvelle photo`);
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de la photo de profil dans les posts:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Message:', error.message);
    if (error.code === 'unavailable' || error.message?.includes('Could not reach')) {
      console.error('🔴 Firestore n\'est pas accessible');
    } else if (error.code === 'permission-denied') {
      console.error('🔴 Permissions insuffisantes. Vérifiez les règles Firestore.');
    }
    throw error;
  }
}

