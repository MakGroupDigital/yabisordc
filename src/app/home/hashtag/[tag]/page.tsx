'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PostCardTikTok } from '@/components/home/post-card-tiktok';
import { BottomNav } from '@/components/home/bottom-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash } from 'lucide-react';
import { usePosts } from '@/hooks/use-posts';
import { Post } from '@/types';
import { formatRelativeTime } from '@/lib/posts';

function PostSkeleton() {
    return (
        <div className="relative h-screen w-full snap-start snap-always flex-shrink-0 bg-black">
            <Skeleton className="absolute inset-0 bg-gray-900" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

// Fonction pour normaliser un hashtag (enlever le # et mettre en minuscule)
function normalizeHashtag(tag: string): string {
    return tag.replace(/^#/, '').toLowerCase().trim();
}

// Fonction pour trouver des hashtags similaires
function findSimilarHashtags(targetTag: string, allHashtags: string[]): string[] {
    const normalizedTarget = normalizeHashtag(targetTag);
    const similar: string[] = [normalizedTarget];
    
    // Trouver des variations similaires
    allHashtags.forEach(tag => {
        const normalized = normalizeHashtag(tag);
        
        // Exact match (déjà ajouté)
        if (normalized === normalizedTarget) return;
        
        // Match partiel (contient le tag cible ou vice versa)
        if (normalized.includes(normalizedTarget) || normalizedTarget.includes(normalized)) {
            if (!similar.includes(normalized)) {
                similar.push(normalized);
            }
        }
        
        // Similarité de distance (Levenshtein simplifié)
        const distance = levenshteinDistance(normalizedTarget, normalized);
        const maxLength = Math.max(normalizedTarget.length, normalized.length);
        const similarity = 1 - (distance / maxLength);
        
        // Si similarité > 70%, considérer comme similaire
        if (similarity > 0.7 && !similar.includes(normalized)) {
            similar.push(normalized);
        }
    });
    
    return similar;
}

// Distance de Levenshtein simplifiée
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

export default function HashtagPage() {
    const params = useParams();
    const router = useRouter();
    const hashtag = params.tag as string;
    const { posts: allPosts, loading } = usePosts(true);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    // Extraire tous les hashtags uniques de tous les posts
    const allHashtags = useMemo(() => {
        const tags = new Set<string>();
        allPosts.forEach(post => {
            const postTags = post.caption.match(/#\w+/g) || [];
            postTags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [allPosts]);

    // Filtrer les posts par hashtag
    useEffect(() => {
        if (!hashtag || allPosts.length === 0) {
            setFilteredPosts([]);
            return;
        }

        // Trouver les hashtags similaires
        const similarTags = findSimilarHashtags(hashtag, allHashtags);
        
        // Filtrer les posts qui contiennent au moins un des hashtags similaires
        const filtered = allPosts.filter(post => {
            const postTags = (post.caption.match(/#\w+/g) || []).map(t => normalizeHashtag(t));
            return similarTags.some(similarTag => postTags.includes(similarTag));
        });

        // Trier par pertinence (posts avec le hashtag exact en premier, puis par nombre de likes)
        filtered.sort((a, b) => {
            const aTags = (a.caption.match(/#\w+/g) || []).map(t => normalizeHashtag(t));
            const bTags = (b.caption.match(/#\w+/g) || []).map(t => normalizeHashtag(t));
            const normalizedTarget = normalizeHashtag(hashtag);
            
            const aHasExact = aTags.includes(normalizedTarget);
            const bHasExact = bTags.includes(normalizedTarget);
            
            if (aHasExact && !bHasExact) return -1;
            if (!aHasExact && bHasExact) return 1;
            
            // Si même niveau de correspondance, trier par likes
            return (b.likes || 0) - (a.likes || 0);
        });

        setFilteredPosts(filtered);
    }, [hashtag, allPosts, allHashtags]);

    if (loading) {
        return (
            <div className="relative h-screen w-full overflow-hidden bg-black">
                <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none">
                    <PostSkeleton />
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

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            {/* Header avec bouton retour */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/90 to-transparent backdrop-blur-xl border-b border-gray-800/50">
                <div className="container mx-auto px-4 py-4 max-w-2xl flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2 flex-1">
                        <Hash className="h-6 w-6 text-[#FFCC00]" />
                        <h1 className="text-xl font-headline font-bold text-white">
                            #{hashtag}
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400">
                        {filteredPosts.length} {filteredPosts.length === 1 ? 'publication' : 'publications'}
                    </div>
                </div>
            </div>

            {/* Container avec scroll snap style TikTok */}
            <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none pt-20">
                {filteredPosts.length === 0 ? (
                    <div className="h-screen flex items-center justify-center">
                        <div className="text-white text-center p-4">
                            <Hash className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-lg mb-2">Aucune publication</p>
                            <p className="text-sm text-gray-400 mb-4">
                                Aucune publication trouvée pour #{hashtag}
                            </p>
                            <Button 
                                onClick={() => router.push('/home')} 
                                className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                            >
                                Retour à l'accueil
                            </Button>
                        </div>
                    </div>
                ) : (
                    filteredPosts.map((post) => {
                        const postWithTime = {
                            ...post,
                            relativeTime: formatRelativeTime(post.createdAt)
                        };
                        return (
                            <PostCardTikTok 
                                key={`${post.id}-${post.createdAt?.getTime() || Date.now()}`} 
                                post={postWithTime} 
                            />
                        );
                    })
                )}
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



