'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostCardTikTok } from '@/components/home/post-card-tiktok';
import { BottomNav } from '@/components/home/bottom-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/types';
import { formatRelativeTime } from '@/lib/posts';

function PostSkeleton() {
    return (
        <div className="relative h-screen w-full snap-start snap-always flex-shrink-0 bg-transparent">
            <Skeleton className="absolute inset-0 bg-white/80" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) {
                setError('ID de publication manquant');
                setLoading(false);
                return;
            }

            try {
                // Essayer de récupérer depuis différentes collections possibles
                const collections = ['posts', 'publications', 'post', 'feed'];
                let foundPost: Post | null = null;

                for (const collectionName of collections) {
                    try {
                        const postRef = doc(db, collectionName, postId);
                        const postSnap = await getDoc(postRef);
                        
                        if (postSnap.exists()) {
                            const data = postSnap.data();
                            
                            // Convertir le document en Post
                            let mediaArray = data.media;
                            if (!Array.isArray(mediaArray)) {
                                if (data.mediaUrl || data.imageUrl || data.videoUrl) {
                                    mediaArray = [{
                                        type: data.videoUrl ? 'video' : 'image',
                                        url: data.videoUrl || data.imageUrl || data.mediaUrl
                                    }];
                                } else {
                                    continue;
                                }
                            }

                            if (mediaArray && mediaArray.length > 0) {
                                foundPost = {
                                    id: postSnap.id,
                                    author: data.author || data.authorName || 'Utilisateur',
                                    authorId: data.authorId || data.userId || '',
                                    location: data.location || '',
                                    avatarUrl: data.avatarUrl || data.authorAvatar || '',
                                    media: mediaArray.map((m: any) => ({
                                        type: m.type || (m.url?.includes('video') ? 'video' : 'image'),
                                        url: m.url || m.src || m
                                    })),
                                    caption: data.caption || data.description || '',
                                    likes: typeof data.likes === 'number' ? data.likes : 0,
                                    comments: typeof data.comments === 'number' ? data.comments : 0,
                                    favoritesCount: typeof data.favoritesCount === 'number' ? data.favoritesCount : 0,
                                    sharesCount: typeof data.sharesCount === 'number' ? data.sharesCount : 0,
                                    viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : 0,
                                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
                                };
                                break;
                            }
                        }
                    } catch (err) {
                        console.warn(`Erreur avec collection ${collectionName}:`, err);
                        continue;
                    }
                }

                if (foundPost) {
                    setPost(foundPost);
                } else {
                    setError('Publication non trouvée');
                }
            } catch (err: any) {
                console.error('Erreur récupération post:', err);
                setError('Erreur lors du chargement de la publication');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="relative h-screen w-full overflow-hidden bg-transparent">
                <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
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

    if (error || !post) {
        return (
            <div className="relative h-screen w-full overflow-hidden bg-transparent flex items-center justify-center">
                <div className="text-slate-900 text-center p-4">
                    <p className="text-lg mb-2">Publication non trouvée</p>
                    <p className="text-sm text-gray-400 mb-4">{error || 'Cette publication n\'existe pas ou a été supprimée'}</p>
                    <Button 
                        onClick={() => router.push('/home')} 
                        className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à l'accueil
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

    // Ajouter relativeTime au post
    const postWithTime = {
        ...post,
        relativeTime: formatRelativeTime(post.createdAt)
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-transparent">
            {/* Bouton retour */}
            <div className="fixed top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="bg-white/85 backdrop-blur-sm text-[#003366] hover:bg-white rounded-full border border-[#003366]/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </div>

            {/* Container avec scroll snap style TikTok */}
            <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
                <PostCardTikTok post={postWithTime} />
            </div>
            
            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}


