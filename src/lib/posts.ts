import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, PostMedia } from '@/types';

// Convertir un document Firestore en Post
function convertFirestorePost(doc: QueryDocumentSnapshot<DocumentData>): Post | null {
  const data = doc.data();
  
  // Debug: afficher la structure complète du document
  const sampleMediaUrl = data.media && Array.isArray(data.media) && data.media[0] 
    ? (data.media[0].url || data.media[0].src || data.media[0])
    : (data.mediaUrl || data.imageUrl || data.videoUrl || 'N/A');
  
  console.log(`🔍 Conversion du document ${doc.id}:`, {
    keys: Object.keys(data),
    hasMedia: !!data.media,
    mediaType: Array.isArray(data.media) ? 'array' : typeof data.media,
    mediaLength: Array.isArray(data.media) ? data.media.length : 'N/A',
    sampleMediaUrl: typeof sampleMediaUrl === 'string' ? sampleMediaUrl.substring(0, 100) : sampleMediaUrl,
    isGsUrl: typeof sampleMediaUrl === 'string' && sampleMediaUrl.startsWith('gs://')
  });
  
  // Vérifier que les champs essentiels existent
  // Accepter différentes structures de données
  let mediaArray = data.media;
  
  // Si media n'est pas un tableau, essayer d'autres formats
  if (!Array.isArray(mediaArray)) {
    // Peut-être que c'est un objet avec des URLs
    if (data.mediaUrl || data.imageUrl || data.videoUrl) {
      mediaArray = [{
        type: data.videoUrl ? 'video' : 'image',
        url: data.videoUrl || data.imageUrl || data.mediaUrl
      }];
    } else if (data.images && Array.isArray(data.images)) {
      mediaArray = data.images.map((url: string) => ({ type: 'image', url }));
    } else if (data.videos && Array.isArray(data.videos)) {
      mediaArray = data.videos.map((url: string) => ({ type: 'video', url }));
    } else {
      console.warn(`⚠️ Post ${doc.id} n'a pas de média valide, ignoré. Structure:`, data);
      return null;
    }
  }
  
  if (!mediaArray || mediaArray.length === 0) {
    console.warn(`⚠️ Post ${doc.id} n'a pas de média, ignoré. Structure:`, data);
    return null;
  }
  
  // Filtrer les médias invalides
  const validMedia = mediaArray
    .filter((m: any) => {
      // Accepter différents formats
      let url = m?.url || m?.src || m;
      
      // Si c'est une URL gs://, la convertir en URL HTTPS
      if (typeof url === 'string' && url.startsWith('gs://')) {
        // Convertir gs://bucket/path en https://firebasestorage.googleapis.com/v0/b/bucket/o/path
        const gsMatch = url.match(/^gs:\/\/([^\/]+)\/(.+)$/);
        if (gsMatch) {
          const [, bucket, path] = gsMatch;
          const encodedPath = encodeURIComponent(path);
          url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
          console.log(`🔄 URL gs:// convertie en HTTPS:`, { original: m?.url || m?.src || m, converted: url });
        }
      }
      
      const type = m?.type || (typeof m === 'string' ? (url.includes('video') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') ? 'video' : 'image') : 'image');
      
      const isValid = url && (type === 'image' || type === 'video');
      if (!isValid) {
        console.warn(`⚠️ Média invalide dans ${doc.id}:`, m);
      }
      return isValid;
    })
    .map((m: any) => {
      let url = m?.url || m?.src || m;
      
      // Si c'est une URL gs://, la convertir en URL HTTPS
      if (typeof url === 'string' && url.startsWith('gs://')) {
        const gsMatch = url.match(/^gs:\/\/([^\/]+)\/(.+)$/);
        if (gsMatch) {
          const [, bucket, path] = gsMatch;
          const encodedPath = encodeURIComponent(path);
          url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
        }
      }
      
      const type = m?.type || (typeof m === 'string' ? (url.includes('video') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') ? 'video' : 'image') : 'image');
      
      return {
        type: type as 'image' | 'video',
        url: url
      } as PostMedia;
    });
  
  if (validMedia.length === 0) {
    console.warn(`⚠️ Post ${doc.id} n'a pas de média valide après filtrage, ignoré`);
    return null;
  }
  
  const post = {
    id: doc.id,
    author: data.author || data.authorName || data.username || 'Utilisateur',
    authorId: data.authorId || data.userId || data.uid || '',
    location: data.location || data.place || data.city || '',
    avatarUrl: data.avatarUrl || data.authorAvatar || data.userAvatar || data.photoURL || '',
    media: validMedia,
    caption: data.caption || data.description || data.text || '',
    likes: typeof data.likes === 'number' ? data.likes : (data.likesCount || 0),
    comments: typeof data.comments === 'number' ? data.comments : (data.commentsCount || 0),
    favorites: typeof data.favorites === 'number' ? data.favorites : (data.favoritesCount || 0),
    shares: typeof data.shares === 'number' ? data.shares : (data.sharesCount || 0),
    views: typeof data.views === 'number' ? data.views : (data.viewsCount || 0),
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined),
  };
  
  console.log(`✅ Post ${doc.id} converti:`, {
    author: post.author,
    location: post.location,
    mediaCount: post.media.length,
    hasCaption: !!post.caption,
    mediaUrls: validMedia.map(m => ({
      type: m.type,
      url: m.url.substring(0, 100) + '...',
      isValid: !!m.url && (m.url.startsWith('http') || m.url.startsWith('gs://'))
    }))
  });
  
  return post;
}

// Formater la date relative (ex: "il y a 2h", "hier")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes}min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'hier';
  }
  
  if (diffInDays < 7) {
    return `il y a ${diffInDays}j`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `il y a ${diffInWeeks}sem`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `il y a ${diffInMonths}mois`;
}

// Tester différentes collections possibles
async function tryGetPostsFromCollection(collectionName: string, limitCount?: number): Promise<Post[]> {
  try {
    console.log(`🔍 Tentative de récupération depuis '${collectionName}'...`);
    const postsRef = collection(db, collectionName);
    
    // Essayer d'abord avec orderBy
    let q;
    try {
      if (limitCount) {
        q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        // Pas de limite - récupérer TOUS les posts
        q = query(
          postsRef,
          orderBy('createdAt', 'desc')
        );
      }
      console.log(`✅ Query créée avec orderBy pour '${collectionName}'`);
    } catch (orderByError: any) {
      // Si orderBy échoue (pas d'index ou champ inexistant), essayer sans orderBy
      console.warn(`⚠️ Erreur avec orderBy sur '${collectionName}':`, orderByError.message);
      console.log(`🔄 Tentative sans orderBy...`);
      if (limitCount) {
        q = query(
          postsRef,
          limit(limitCount)
        );
      } else {
        q = query(postsRef);
      }
    }
    
    console.log(`📤 Exécution de la requête pour '${collectionName}'...`);
    // Ajouter un timeout pour éviter les attentes infinies
    const queryPromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La requête a pris plus de 15 secondes')), 15000)
    );
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
    console.log(`📊 ${querySnapshot.size} document(s) trouvé(s) dans la collection '${collectionName}'`);
    
    if (querySnapshot.empty) {
      console.log(`⚠️ La collection '${collectionName}' est vide`);
      return [];
    }
    
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Document ${doc.id} de '${collectionName}':`, {
        id: doc.id,
        keys: Object.keys(data),
        hasMedia: !!data.media,
        mediaType: typeof data.media,
        author: data.author || data.authorName || 'N/A',
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 'N/A'
      });
      
      const post = convertFirestorePost(doc);
      if (post) {
        console.log(`✅ Post ${doc.id} converti avec succès:`, {
          author: post.author,
          mediaCount: post.media.length,
          caption: post.caption.substring(0, 50) + '...'
        });
        posts.push(post);
      } else {
        console.warn(`❌ Post ${doc.id} ignoré (conversion échouée) - Structure complète:`, data);
      }
    });
    
    console.log(`✨ ${posts.length} post(s) valide(s) récupéré(s) de '${collectionName}' sur ${querySnapshot.size} document(s)`);
    return posts;
  } catch (error: any) {
    console.error(`❌ Erreur avec la collection '${collectionName}':`, {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Si c'est une erreur de permissions, ne pas bloquer - les posts publics peuvent être lus
    if (error.code === 'permission-denied') {
      console.warn(`⚠️ Permissions insuffisantes pour '${collectionName}'. Vérifiez les règles Firestore pour permettre la lecture publique.`);
      return [];
    }
    
    // Si c'est un timeout ou un problème de connexion, retourner un tableau vide
    // L'application fonctionnera en mode offline
    if (error.message?.includes('Timeout') || error.code === 'unavailable' || error.code === 'deadline-exceeded') {
      console.warn(`⚠️ Problème de connexion avec '${collectionName}', mode offline activé`);
    }
    
    return [];
  }
}

// Récupérer les posts depuis Firestore
export async function getPosts(limitCount?: number): Promise<Post[]> {
  try {
    console.log('🔍 ========== DÉBUT RÉCUPÉRATION POSTS ==========');
    console.log('🔍 Tentative de récupération des posts depuis Firestore...', limitCount ? `(limite: ${limitCount})` : '(sans limite)');
    console.log('🔍 Firebase DB initialisé:', !!db);
    
    // Essayer différentes collections possibles
    const possibleCollections = ['posts', 'publications', 'post', 'feed'];
    
    // Récupérer TOUS les posts de toutes les collections
    const allPosts: Post[] = [];
    
    for (const collectionName of possibleCollections) {
      console.log(`\n🔎 ========== Essai de la collection '${collectionName}' ==========`);
      const posts = await tryGetPostsFromCollection(collectionName, limitCount);
      if (posts.length > 0) {
        console.log(`✨ ${posts.length} post(s) trouvé(s) dans '${collectionName}'`);
        allPosts.push(...posts);
      } else {
        console.log(`ℹ️ Aucun post valide dans '${collectionName}'`);
      }
    }
    
    console.log(`\n📊 ========== RÉSUMÉ ==========`);
    console.log(`📊 Total de posts trouvés: ${allPosts.length}`);
    
    // Trier par date de création (plus récent en premier)
    if (allPosts.length > 0) {
      allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      console.log(`📊 Posts triés par date`);
    }
    
    // Retirer les doublons basés sur l'ID
    const uniquePosts = allPosts.reduce((acc, post) => {
      if (!acc.find(p => p.id === post.id)) {
        acc.push(post);
      }
      return acc;
    }, [] as Post[]);
    
    console.log(`📊 Posts après déduplication: ${uniquePosts.length} (${allPosts.length - uniquePosts.length} doublon(s) retiré(s))`);
    
    // Si une limite est spécifiée, la respecter
    const finalPosts = limitCount ? uniquePosts.slice(0, limitCount) : uniquePosts;
    
    console.log(`✅ Total final: ${finalPosts.length} post(s) à afficher`);
    console.log('🔍 ========== FIN RÉCUPÉRATION POSTS ==========\n');
    
    if (finalPosts.length === 0) {
      console.warn('⚠️ ⚠️ ⚠️ AUCUNE PUBLICATION TROUVÉE ⚠️ ⚠️ ⚠️');
      console.warn('⚠️ Collections testées:', possibleCollections);
      console.warn('⚠️ Vérifiez:');
      console.warn('   1. Que les posts existent bien dans Firestore');
      console.warn('   2. Que le nom de la collection est correct');
      console.warn('   3. Que les règles Firestore permettent la lecture');
      console.warn('   4. Que la structure des données correspond à ce qui est attendu');
    }
    
    return finalPosts;
  } catch (error: any) {
    console.error('❌ ❌ ❌ ERREUR LORS DE LA RÉCUPÉRATION DES POSTS ❌ ❌ ❌');
    console.error('❌ Code:', error.code);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    return [];
  }
}

// Récupérer plus de posts (pagination)
export async function getMorePosts(
  lastPost: Post,
  limitCount: number = 20
): Promise<Post[]> {
  try {
    const postsRef = collection(db, 'posts');
    const lastPostRef = await getDocs(
      query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(1)
      )
    );
    
    if (lastPostRef.empty) {
      return [];
    }
    
    const lastDoc = lastPostRef.docs[0];
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      const post = convertFirestorePost(doc);
      if (post) {
        posts.push(post);
      }
    });
    
    return posts;
  } catch (error) {
    console.error('Erreur lors de la récupération de plus de posts:', error);
    return [];
  }
}

// Écouter les posts en temps réel - Optimisé pour performance
export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  limitCount?: number
): () => void {
  // Limiter à 50 posts par défaut pour performance
  const effectiveLimit = limitCount || 50;
  console.log('👂 Démarrage de l\'écoute en temps réel des posts...', `(limite: ${effectiveLimit})`);
  
  const unsubscribes: (() => void)[] = [];
  const allPosts: Post[] = [];
  
  // Essayer d'abord 'posts', puis 'publications' si ça échoue
  const trySubscribe = (collectionName: string): (() => void) | null => {
    try {
      const postsRef = collection(db, collectionName);
      
      let q;
      try {
        // Toujours limiter pour performance
        q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(effectiveLimit)
        );
      } catch (orderByError: any) {
        console.warn(`⚠️ Erreur avec orderBy sur '${collectionName}', tentative sans tri:`, orderByError.message);
        q = query(
          postsRef,
          limit(effectiveLimit)
        );
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(`📊 ${querySnapshot.size} document(s) reçu(s) en temps réel de '${collectionName}'`);
        const collectionPosts: Post[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          console.log(`📄 Document ${doc.id}:`, {
            hasMedia: !!data.media,
            mediaLength: Array.isArray(data.media) ? data.media.length : 0,
            author: data.author || data.authorName,
            location: data.location || data.place,
            caption: data.caption || data.description
          });
          const post = convertFirestorePost(doc);
          if (post) {
            collectionPosts.push(post);
          }
        });
        console.log(`✨ ${collectionPosts.length} post(s) valide(s) après conversion de '${collectionName}'`);
        
        // Mettre à jour les posts de cette collection
        // Retirer les anciens posts de cette collection et ajouter les nouveaux
        const existingPostIds = new Set(allPosts.map(p => p.id));
        
        // Ajouter uniquement les nouveaux posts (éviter les doublons)
        collectionPosts.forEach(post => {
          if (!existingPostIds.has(post.id)) {
            allPosts.push(post);
            existingPostIds.add(post.id);
          }
        });
        
        // Trier par date
        allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        // Appliquer la limite et retirer les doublons
        const uniquePosts = allPosts.reduce((acc, post) => {
          if (!acc.find(p => p.id === post.id)) {
            acc.push(post);
          }
          return acc;
        }, [] as Post[]);
        
        const finalPosts = uniquePosts.slice(0, effectiveLimit);
        
        console.log(`✅ Total: ${finalPosts.length} post(s) affiché(s)`);
        callback(finalPosts);
      }, (error: any) => {
        console.error(`❌ Erreur lors de l'écoute de '${collectionName}':`, error);
        console.error('Code:', error.code, 'Message:', error.message);
        
        // Si c'est une erreur de permissions, ne pas bloquer l'application
        // Les utilisateurs non connectés peuvent toujours voir les posts publics
        if (error.code === 'permission-denied') {
          console.warn(`⚠️ Permissions insuffisantes pour '${collectionName}'. Vérifiez les règles Firestore.`);
          // Ne pas appeler callback([]) pour éviter de vider les posts existants
          // L'utilisateur verra les posts déjà chargés
          return;
        }
        
        // Pour les autres erreurs, continuer normalement
        callback([]);
      });
      
      return unsubscribe;
    } catch (error: any) {
      console.warn(`⚠️ Impossible de s'abonner à '${collectionName}':`, error.message);
      return null;
    }
  };
  
  // S'abonner à toutes les collections possibles
  const possibleCollections = ['posts', 'publications', 'post', 'feed'];
  
  for (const collectionName of possibleCollections) {
    const unsubscribe = trySubscribe(collectionName);
    if (unsubscribe) {
      unsubscribes.push(unsubscribe);
    }
  }
  
  if (unsubscribes.length === 0) {
    console.error('❌ Impossible de s\'abonner à aucune collection');
    callback([]);
    return () => {};
  }
  
  // Retourner une fonction pour se désabonner de toutes les collections
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}

