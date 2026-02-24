import { MetadataRoute } from 'next';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yabisordc.com';
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Récupérer les publications pour les ajouter au sitemap
    const collections = ['posts', 'publications', 'post', 'feed'];
    
    for (const collectionName of collections) {
      try {
        const postsRef = collection(db, collectionName);
        const q = query(postsRef, limit(1000)); // Limiter à 1000 pour éviter les timeouts
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && doc.id) {
            routes.push({
              url: `${baseUrl}/home/post/${doc.id}`,
              lastModified: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        });
        
        // Si on a trouvé des posts dans cette collection, on s'arrête
        if (snapshot.size > 0) {
          break;
        }
      } catch (err) {
        console.warn(`Erreur récupération collection ${collectionName}:`, err);
        continue;
      }
    }
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
  }

  return routes;
}

