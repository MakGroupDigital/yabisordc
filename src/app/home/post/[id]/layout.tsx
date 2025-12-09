import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const postId = params.id;
  
  try {
    // Essayer de récupérer le post depuis différentes collections
    const collections = ['posts', 'publications', 'post', 'feed'];
    let postData: any = null;

    for (const collectionName of collections) {
      try {
        const postRef = doc(db, collectionName, postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          postData = postSnap.data();
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!postData) {
      return {
        title: 'Publication - Ya Biso RDC',
        description: 'Découvrez cette publication sur Ya Biso RDC',
        openGraph: {
          title: 'Publication - Ya Biso RDC',
          description: 'Découvrez cette publication sur Ya Biso RDC',
          images: [{
            url: 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png',
            width: 1200,
            height: 630,
            alt: 'Ya Biso RDC',
          }],
          type: 'article',
          siteName: 'Ya Biso RDC',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Publication - Ya Biso RDC',
          description: 'Découvrez cette publication sur Ya Biso RDC',
          images: ['https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png'],
        },
      };
    }

    const author = postData.author || postData.authorName || 'Utilisateur';
    const caption = postData.caption || postData.description || '';
    const location = postData.location || '';
    
    // Récupérer la première image/vidéo pour l'aperçu
    let imageUrl = '';
    if (postData.media && Array.isArray(postData.media) && postData.media.length > 0) {
      imageUrl = postData.media[0].url || postData.media[0].src || '';
    } else if (postData.mediaUrl) {
      imageUrl = postData.mediaUrl;
    } else if (postData.imageUrl) {
      imageUrl = postData.imageUrl;
    }

    const title = `${author} sur Ya Biso RDC`;
    const description = caption.length > 150 
      ? caption.substring(0, 150) + '...' 
      : caption || `Publication de ${author}${location ? ` à ${location}` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `Publication de ${author}`,
          },
        ] : [
          {
            url: 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png',
            width: 1200,
            height: 630,
            alt: 'Ya Biso RDC',
          },
        ],
        type: 'article',
        siteName: 'Ya Biso RDC',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : ['https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png'],
      },
    };
  } catch (error) {
    console.error('Erreur génération métadonnées:', error);
    return {
      title: 'Publication - Ya Biso RDC',
      description: 'Découvrez cette publication sur Ya Biso RDC',
      openGraph: {
        title: 'Publication - Ya Biso RDC',
        description: 'Découvrez cette publication sur Ya Biso RDC',
        images: [{
          url: 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png',
          width: 1200,
          height: 630,
          alt: 'Ya Biso RDC',
        }],
        type: 'article',
        siteName: 'Ya Biso RDC',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Publication - Ya Biso RDC',
        description: 'Découvrez cette publication sur Ya Biso RDC',
        images: ['https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png'],
      },
    };
  }
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



