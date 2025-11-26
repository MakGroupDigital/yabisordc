
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    Bookmark, 
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { incrementLikes, decrementLikes } from '@/lib/posts';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type Post = {
  id: string | number;
  author: string;
  location: string;
  avatarUrl: string;
  media: { type: 'image' | 'video'; url: string }[];
  caption: string;
  likes: number;
  comments: number;
};

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isUpdatingLike, setIsUpdatingLike] = useState(false);
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log('PostCard - Données du post:', {
            id: post.id,
            author: post.author,
            mediaCount: post.media?.length || 0,
            media: post.media?.map((m, i) => ({
                index: i,
                type: m.type,
                url: m.url?.substring(0, 60) + '...'
            })) || []
        });
    }, [post]);

    const handleLike = async () => {
        if (!user) {
            const currentPath = window.location.pathname;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
            toast({
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour aimer une publication',
            });
            return;
        }

        if (isUpdatingLike) return;

        setIsUpdatingLike(true);
        const wasLiked = isLiked;
        
        // Mise à jour optimiste de l'UI
        if (wasLiked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setIsLiked(!wasLiked);

        try {
            if (wasLiked) {
                await decrementLikes(post.id.toString());
            } else {
                await incrementLikes(post.id.toString());
            }
        } catch (error) {
            // Revenir en arrière en cas d'erreur
            if (wasLiked) {
                setLikeCount(likeCount);
            } else {
                setLikeCount(likeCount);
            }
            setIsLiked(wasLiked);
            toast({
                title: 'Erreur',
                description: 'Impossible de mettre à jour le like',
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingLike(false);
        }
    };

    const handleBookmark = () => {
        if (!user) {
            const currentPath = window.location.pathname;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
            toast({
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour enregistrer une publication',
            });
            return;
        }
        setIsBookmarked(!isBookmarked);
    };

    const handleComment = () => {
        if (!user) {
            const currentPath = window.location.pathname;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
            toast({
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour commenter',
            });
            return;
        }
        // TODO: Implémenter l'ouverture du modal de commentaires
    };

    const hashtags = post.caption.match(/#\w+/g) || [];
    const description = post.caption.replace(/#\w+/g, '').trim();

  return (
    <div className="w-full bg-white p-4 rounded-3xl shadow-xl my-6">
      {/* Post Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-[#FFCC00]">
          <AvatarImage src={post.avatarUrl} alt={post.author} />
          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <span className="font-headline font-semibold text-lg text-[#003366]">{post.author}</span>
            <p className="font-body text-sm text-gray-500">{post.location}</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Signaler</DropdownMenuItem>
                <DropdownMenuItem>Ne plus suivre</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Media */}
      {post.media && post.media.length > 0 ? (
        <div className="relative aspect-[1/1] w-full mt-4 group">
          <Carousel className="w-full h-full rounded-2xl overflow-hidden">
            <CarouselContent>
              {post.media.map((item, index) => {
                const hasError = imageErrors[index];
                
                // Log détaillé pour débogage
                if (!item.url) {
                  console.error(`❌ Post ${post.id} - Média ${index} n'a pas d'URL:`, item);
                } else {
                  console.log(`🖼️ Rendu média ${index}:`, {
                    postId: post.id,
                    type: item.type,
                    url: item.url,
                    urlLength: item.url.length,
                    hasError
                  });
                }
                
                return (
                  <CarouselItem key={index}>
                    <div className="relative h-full w-full">
                      {!item.url ? (
                        <div className="h-full w-full bg-red-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <p className="text-red-500 text-sm font-semibold">❌ URL manquante</p>
                            <p className="text-gray-400 text-xs mt-2">Type: {item.type}</p>
                            <p className="text-gray-400 text-xs">Index: {index}</p>
                          </div>
                        </div>
                      ) : item.type === 'image' && !hasError ? (
                        <>
                          {/* Essayer d'abord avec Next.js Image */}
                          <Image
                            src={item.url}
                            alt={`Post media ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              console.error('❌ Erreur Next.js Image:', {
                                url: item.url,
                                error: e,
                                type: item.type
                              });
                              setImageErrors(prev => ({ ...prev, [index]: true }));
                            }}
                            onLoad={() => {
                              console.log('✅ Image Next.js chargée avec succès:', item.url);
                            }}
                          />
                          {/* Fallback avec img HTML si Next.js Image échoue */}
                          {hasError && (
                            <img
                              src={item.url}
                              alt={`Post media ${index + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('❌ Erreur img HTML aussi:', item.url);
                              }}
                              onLoad={() => {
                                console.log('✅ Image HTML chargée avec succès:', item.url);
                              }}
                            />
                          )}
                        </>
                      ) : item.type === 'video' && !hasError ? (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          onError={(e) => {
                            console.error('❌ Erreur de chargement de la vidéo:', {
                              url: item.url,
                              error: e
                            });
                            setImageErrors(prev => ({ ...prev, [index]: true }));
                          }}
                          onLoadedData={() => {
                            console.log('✅ Vidéo chargée avec succès:', item.url);
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <div className="text-center p-4">
                            <p className="text-gray-500 text-sm font-semibold">Impossible de charger le média</p>
                            <p className="text-gray-400 text-xs mt-2 break-all max-w-xs">
                              URL: {item.url?.substring(0, 80)}...
                            </p>
                            <p className="text-gray-400 text-xs mt-1">Type: {item.type}</p>
                            <button
                              onClick={() => {
                                setImageErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors[index];
                                  return newErrors;
                                });
                              }}
                              className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                              Réessayer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {post.media.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 text-white hover:bg-black/50" />
                <CarouselNext className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 text-white hover:bg-black/50" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        <div className="relative aspect-[1/1] w-full mt-4 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 font-semibold">Aucun média disponible</p>
            <p className="text-gray-400 text-xs mt-2">Post ID: {post.id}</p>
            <p className="text-gray-400 text-xs">Media array: {JSON.stringify(post.media)}</p>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
                <button onClick={handleLike} className="flex items-center gap-1.5 group/like">
                    <Heart className={cn("h-7 w-7 text-gray-400 transition-all duration-200 group-hover/like:scale-110", isLiked && "text-red-500 fill-red-500")} />
                    <span className="font-semibold text-gray-600">{likeCount.toLocaleString()}</span>
                </button>
                <button onClick={handleComment} className="flex items-center gap-1.5 group/comment">
                    <MessageSquare className="h-7 w-7 text-gray-400 transition-all duration-200 group-hover/comment:scale-110" />
                    <span className="font-semibold text-gray-600">{post.comments.toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 group/share">
                    <Share2 className="h-7 w-7 text-gray-400 transition-all duration-200 group-hover/share:scale-110" />
                </button>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleBookmark}>
                    <Bookmark className={cn("h-7 w-7 text-gray-400 transition-colors duration-200", isBookmarked && "text-[#003366] fill-[#003366]")} />
                </button>
            </div>
        </div>

      {/* Post Info */}
      <div className="px-1">
        <p className="font-body text-[#555555]">
            {description}
            {' '}
            {hashtags.map(tag => (
                <span key={tag} className="text-[#339966] font-medium cursor-pointer hover:underline">{tag} </span>
            ))}
        </p>
      </div>

    </div>
  );
}
