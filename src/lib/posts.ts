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
  console.log(`🔍 Conversion du document ${doc.id}:`, {
    keys: Object.keys(data),
    hasMedia: !!data.media,
    mediaType: Array.isArray(data.media) ? 'array' : typeof data.media,
    mediaLength: Array.isArray(data.media) ? data.media.length : 'N/A'
  });
  
  // Vérifier que les champs essentiels existent
  if (!data.media || !Array.isArray(data.media) || data.media.length === 0) {
    console.warn(`⚠️ Post ${doc.id} n'a pas de média, ignoré. Structure:`, data);
    return null;
  }
  
  // Filtrer les médias invalides
  const validMedia = (data.media || [])
    .filter((m: any) => {
      const isValid = m && m.url && (m.type === 'image' || m.type === 'video');
      if (!isValid) {
        console.warn(`⚠️ Média invalide dans ${doc.id}:`, m);
      }
      return isValid;
    })
    .map((m: any) => ({
      type: m.type as 'image' | 'video',
      url: m.url
    } as PostMedia));
  
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
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined),
  };
  
  console.log(`✅ Post ${doc.id} converti:`, {
    author: post.author,
    location: post.location,
    mediaCount: post.media.length,
    hasCaption: !!post.caption
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
async function tryGetPostsFromCollection(collectionName: string, limitCount: number): Promise<Post[]> {
  try {
    const postsRef = collection(db, collectionName);
    
    // Essayer d'abord avec orderBy
    let q;
    try {
      q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } catch (orderByError: any) {
      // Si orderBy échoue (pas d'index ou champ inexistant), essayer sans orderBy
      console.warn(`⚠️ Erreur avec orderBy sur '${collectionName}', tentative sans tri:`, orderByError.message);
      q = query(
        postsRef,
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    console.log(`📊 ${querySnapshot.size} document(s) trouvé(s) dans la collection '${collectionName}'`);
    
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      console.log(`📄 Document ${doc.id} de '${collectionName}':`, doc.data());
      const post = convertFirestorePost(doc);
      if (post) {
        console.log(`✅ Post ${doc.id} converti avec succès`);
        posts.push(post);
      } else {
        console.warn(`❌ Post ${doc.id} ignoré (conversion échouée)`);
      }
    });
    
    return posts;
  } catch (error: any) {
    console.warn(`⚠️ Erreur avec la collection '${collectionName}':`, error.message);
    return [];
  }
}

// Récupérer les posts depuis Firestore
export async function getPosts(limitCount: number = 20): Promise<Post[]> {
  try {
    console.log('🔍 Tentative de récupération des posts depuis Firestore...');
    
    // Essayer différentes collections possibles
    const possibleCollections = ['posts', 'publications', 'post', 'feed'];
    
    for (const collectionName of possibleCollections) {
      console.log(`🔎 Essai de la collection '${collectionName}'...`);
      const posts = await tryGetPostsFromCollection(collectionName, limitCount);
      if (posts.length > 0) {
        console.log(`✨ ${posts.length} post(s) trouvé(s) dans '${collectionName}'`);
        return posts;
      }
    }
    
    console.warn('⚠️ Aucune publication trouvée dans les collections testées:', possibleCollections);
    return [];
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des posts:', error);
    console.error('Détails:', error.message, error.code);
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

// Écouter les posts en temps réel
export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  limitCount: number = 20
): () => void {
  console.log('👂 Démarrage de l\'écoute en temps réel des posts...');
  
  // Essayer d'abord 'posts', puis 'publications' si ça échoue
  const trySubscribe = (collectionName: string): (() => void) | null => {
    try {
      const postsRef = collection(db, collectionName);
      
      let q;
      try {
        q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } catch (orderByError: any) {
        console.warn(`⚠️ Erreur avec orderBy sur '${collectionName}', tentative sans tri:`, orderByError.message);
        q = query(
          postsRef,
          limit(limitCount)
        );
      }
      
      return onSnapshot(q, (querySnapshot) => {
        console.log(`📊 ${querySnapshot.size} document(s) reçu(s) en temps réel de '${collectionName}'`);
        const posts: Post[] = [];
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
            posts.push(post);
          }
        });
        console.log(`✨ ${posts.length} post(s) valide(s) après conversion`);
        callback(posts);
      }, (error: any) => {
        console.error(`❌ Erreur lors de l'écoute de '${collectionName}':`, error);
        console.error('Code:', error.code, 'Message:', error.message);
        callback([]);
      });
    } catch (error: any) {
      console.warn(`⚠️ Impossible de s'abonner à '${collectionName}':`, error.message);
      return null;
    }
  };
  
  // Essayer 'posts' d'abord
  const unsubscribe = trySubscribe('posts');
  if (unsubscribe) {
    return unsubscribe;
  }
  
  // Si ça échoue, essayer 'publications'
  console.log('🔄 Essai de la collection "publications"...');
  const unsubscribe2 = trySubscribe('publications');
  if (unsubscribe2) {
    return unsubscribe2;
  }
  
  // Si tout échoue, retourner une fonction no-op
  console.error('❌ Impossible de s\'abonner à aucune collection');
  callback([]);
  return () => {};
}

