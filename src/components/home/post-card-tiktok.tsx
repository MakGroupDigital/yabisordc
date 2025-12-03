'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    Bookmark, 
    MoreHorizontal,
    Play,
    Volume2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Post } from '@/types';

interface PostCardTikTokProps {
  post: Post & { relativeTime?: string };
}

export function PostCardTikTok({ post }: PostCardTikTokProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
    const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => setIsBookmarked(!isBookmarked);

    // Gestion du swipe horizontal
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
        });
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentTouch = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
        };
        
        const diffX = Math.abs(touchStart.x - currentTouch.x);
        const diffY = Math.abs(touchStart.y - currentTouch.y);
        
        // Détecter si c'est un swipe horizontal ou vertical
        if (diffX > diffY && diffX > 10 && post.media.length > 1) {
            setIsSwipingHorizontal(true);
        }
        
        setTouchEnd(currentTouch);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setIsSwipingHorizontal(false);
            return;
        }
        
        const diffX = touchStart.x - touchEnd.x;
        const diffY = Math.abs(touchStart.y - touchEnd.y);
        
        // Swipe horizontal seulement si le mouvement horizontal est plus important que le vertical
        if (Math.abs(diffX) > diffY && Math.abs(diffX) > minSwipeDistance && post.media.length > 1) {
            const isLeftSwipe = diffX > 0;
            const isRightSwipe = diffX < 0;

            if (isLeftSwipe && currentMediaIndex < post.media.length - 1) {
                setCurrentMediaIndex(currentMediaIndex + 1);
            }
            if (isRightSwipe && currentMediaIndex > 0) {
                setCurrentMediaIndex(currentMediaIndex - 1);
            }
        }

        setIsSwipingHorizontal(false);
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Intersection Observer pour détecter la visibilité (style TikTok)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            {
                threshold: 0.7, // Au moins 70% visible
                rootMargin: '0px',
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Auto-play/pause videos selon l'index et la visibilité
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;
            
            const isCurrentMedia = index === currentMediaIndex;
            const isVideo = post.media[index]?.type === 'video';
            
            if (isCurrentMedia && isVideo && isVisible) {
                // Jouer la vidéo si elle est visible et c'est le média actuel
                video.play().catch((error) => {
                    console.log('Auto-play échoué (normal sur certains navigateurs):', error);
                });
            } else {
                // Mettre en pause dans tous les autres cas
                video.pause();
                if (video.currentTime > 0) {
                    video.currentTime = 0; // Reset au début
                }
            }
        });
    }, [currentMediaIndex, post.media, isVisible]);

    const hashtags = post.caption.match(/#\w+/g) || [];
    const description = post.caption.replace(/#\w+/g, '').trim();

    if (post.media.length === 0) return null;

    return (
        <div 
            ref={containerRef}
            className={cn(
                "relative h-screen w-full snap-start snap-always flex-shrink-0 bg-black overflow-hidden",
                isSwipingHorizontal && "touch-none"
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Media Container - Défilement horizontal */}
            <div 
                ref={mediaContainerRef}
                className="absolute inset-0 flex transition-transform duration-300 ease-out"
                style={{
                    transform: `translateX(-${currentMediaIndex * 100}%)`,
                }}
            >
                {post.media.map((media, index) => (
                    <div 
                        key={index}
                        className="relative h-full w-full flex-shrink-0"
                    >
                        {media.type === 'image' ? (
                            <Image
                                src={media.url}
                                alt={`Post media ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        ) : (
                            <>
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    src={media.url}
                                    className="h-full w-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay={index === currentMediaIndex && isVisible}
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                        // S'assurer que la vidéo est prête
                                        const video = e.currentTarget;
                                        if (index === currentMediaIndex && isVisible && video.paused) {
                                            video.play().catch(() => {
                                                // Auto-play peut être bloqué
                                            });
                                        }
                                    }}
                                />
                                {/* Indicateur vidéo en haut à droite */}
                                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <Play className="h-4 w-4 text-white fill-white" />
                                    <span className="text-white text-xs font-semibold">Vidéo</span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Gradient overlay en bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-0" />

            {/* Contenu principal */}
            <div className="relative h-full flex flex-col">
                {/* Header minimal en haut */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-headline font-semibold text-sm">Pour vous</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Signaler</DropdownMenuItem>
                            <DropdownMenuItem>Ne plus suivre</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Contenu principal - Bottom aligned */}
                <div className="flex-1 flex">
                    {/* Zone gauche - Infos auteur et caption */}
                    <div className="flex-1 flex flex-col justify-end p-4 pb-20 z-10">
                        {/* Avatar et infos auteur */}
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-12 w-12 border-2 border-[#FFCC00]">
                                <AvatarImage src={post.avatarUrl} alt={post.author} />
                                <AvatarFallback className="bg-[#FF8800] text-white font-headline font-semibold">
                                    {post.author.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-headline font-semibold text-white text-base">
                                    {post.author}
                                </div>
                                <div className="font-body text-white/80 text-sm">
                                    {post.location} {post.relativeTime ? `• ${post.relativeTime}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="mb-2">
                            <p className="font-body text-white text-sm leading-relaxed">
                                {description}
                                {' '}
                                {hashtags.map(tag => (
                                    <span key={tag} className="text-[#FFCC00] font-medium cursor-pointer hover:underline">
                                        {tag}{' '}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>

                    {/* Zone droite - Actions */}
                    <div className="flex flex-col justify-end items-center gap-6 p-4 pb-24 z-10">
                        {/* Avatar pour follow */}
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-14 w-14 border-2 border-white">
                                <AvatarImage src={post.avatarUrl} alt={post.author} />
                                <AvatarFallback className="bg-[#FF8800] text-white font-headline font-semibold">
                                    {post.author.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="h-6 w-6 rounded-full bg-[#FF8800] flex items-center justify-center border-2 border-white">
                                <span className="text-white text-xs font-bold">+</span>
                            </div>
                        </div>

                        {/* Like */}
                        <button 
                            onClick={handleLike} 
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
                                <Heart className={cn(
                                    "h-7 w-7 transition-all duration-200",
                                    isLiked ? "text-red-500 fill-red-500" : "text-white"
                                )} />
                            </div>
                            <span className="text-white font-semibold text-xs">
                                {likeCount > 0 ? (likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount) : ''}
                            </span>
                        </button>

                        {/* Comment */}
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
                                <MessageSquare className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-white font-semibold text-xs">
                                {post.comments > 0 ? (post.comments >= 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments) : ''}
                            </span>
                        </button>

                        {/* Bookmark */}
                        <button 
                            onClick={handleBookmark}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
                                <Bookmark className={cn(
                                    "h-7 w-7 transition-colors duration-200",
                                    isBookmarked ? "text-[#FFCC00] fill-[#FFCC00]" : "text-white"
                                )} />
                            </div>
                        </button>

                        {/* Share */}
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
                                <Share2 className="h-7 w-7 text-white" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Indicateurs de media multiples - En haut */}
                {post.media.length > 1 && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {post.media.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentMediaIndex(index)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-200",
                                    index === currentMediaIndex 
                                        ? "w-8 bg-[#FF8800]" 
                                        : "w-1 bg-white/50 hover:bg-white/70"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

