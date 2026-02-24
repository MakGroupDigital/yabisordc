'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    Bookmark, 
    Volume2,
    VolumeX,
    UserPlus,
    X,
    Copy,
    Send,
    Eye,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Post } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    getDoc,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    onSnapshot,
    orderBy,
    limit
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/sound-context';
import { useRouter } from 'next/navigation';

interface PostCardTikTokProps {
  post: Post & { relativeTime?: string };
}

interface Comment {
    id: string;
    userId: string;
    userAvatar: string;
    userName: string;
    text: string;
    createdAt: Date;
}

export const PostCardTikTok = memo(function PostCardTikTok({ post }: PostCardTikTokProps) {
    const { isSoundEnabled, toggleSound } = useSound();
    const [user, setUser] = useState<User | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(post.favorites || 0);
    const [sharesCount, setSharesCount] = useState(post.shares || 0);
    const [viewsCount, setViewsCount] = useState(post.views || 0);
    const [hasViewed, setHasViewed] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
    const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [showShare, setShowShare] = useState(false);
    const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const heartIdRef = useRef(0);
    const { toast } = useToast();
    const router = useRouter();

    // Vérifier l'état d'authentification
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Vérifier les statuts uniquement si l'utilisateur est connecté
                checkLikeStatus(currentUser.uid).catch(err => {
                    // Ignorer les erreurs de permissions silencieusement
                    if (err.code !== 'permission-denied') {
                        console.error('Erreur vérification like:', err);
                    }
                });
                checkBookmarkStatus(currentUser.uid).catch(err => {
                    if (err.code !== 'permission-denied') {
                        console.error('Erreur vérification bookmark:', err);
                    }
                });
                checkFollowStatus(currentUser.uid).catch(err => {
                    if (err.code !== 'permission-denied') {
                        console.error('Erreur vérification follow:', err);
                    }
                });
            } else {
                // Réinitialiser les états si l'utilisateur se déconnecte
                setIsLiked(false);
                setIsBookmarked(false);
                setIsFollowing(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Charger les commentaires
    useEffect(() => {
        if (!showComments) return;
        
        const commentsRef = collection(db, 'posts', post.id, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(50));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData: Comment[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                commentsData.push({
                    id: doc.id,
                    userId: data.userId,
                    userAvatar: data.userAvatar || '',
                    userName: data.userName || 'Utilisateur',
                    text: data.text || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });
            setComments(commentsData.reverse()); // Plus ancien en premier
        }, (error: any) => {
            // Gérer les erreurs de permissions gracieusement
            if (error.code === 'permission-denied') {
                console.warn('Permissions insuffisantes pour lire les commentaires');
                setComments([]);
                return;
            }
            console.error('Erreur chargement commentaires:', error);
        });

        return () => unsubscribe();
    }, [showComments, post.id]);

    // Vérifier si l'utilisateur a déjà liké
    const checkLikeStatus = async (userId: string) => {
        if (!userId) return;
        try {
            const likeRef = doc(db, 'posts', post.id, 'likes', userId);
            const likeSnap = await getDoc(likeRef);
            setIsLiked(likeSnap.exists());
        } catch (error: any) {
            // Ignorer les erreurs de permissions pour les utilisateurs non connectés
            if (error.code === 'permission-denied') {
                setIsLiked(false);
                return;
            }
            console.error('Erreur vérification like:', error);
        }
    };

    // Vérifier si le post est sauvegardé
    const checkBookmarkStatus = async (userId: string) => {
        if (!userId) return;
        try {
            const favoriteRef = doc(db, 'favorites', `${userId}_${post.id}`);
            const favoriteSnap = await getDoc(favoriteRef);
            setIsBookmarked(favoriteSnap.exists());
        } catch (error: any) {
            // Ignorer les erreurs de permissions pour les utilisateurs non connectés
            if (error.code === 'permission-denied') {
                setIsBookmarked(false);
                return;
            }
            console.error('Erreur vérification bookmark:', error);
        }
    };

    // Vérifier si l'utilisateur suit l'auteur
    const checkFollowStatus = async (userId: string) => {
        if (!userId) return;
        try {
            if (post.authorId && userId !== post.authorId) {
                const followRef = doc(db, 'users', userId, 'following', post.authorId);
                const followSnap = await getDoc(followRef);
                setIsFollowing(followSnap.exists());
            }
        } catch (error: any) {
            // Ignorer les erreurs de permissions pour les utilisateurs non connectés
            if (error.code === 'permission-denied') {
                setIsFollowing(false);
                return;
            }
            console.error('Erreur vérification follow:', error);
        }
    };

    // Animation de cœurs
    const createHeart = (x: number, y: number) => {
        const id = heartIdRef.current++;
        const newHeart = { id, x, y };
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 1000);
    };

    // Gérer le like
    const handleLike = async () => {
        if (!user) {
            toast({
                title: "Connexion requise",
                description: "Connectez-vous pour aimer des publications",
                variant: "destructive",
            });
            router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (isLiked) {
            // Retirer le like
            try {
                const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
                await deleteDoc(likeRef);
                
                // Mettre à jour le compteur
                const postRef = doc(db, 'posts', post.id);
                await setDoc(postRef, { likes: likeCount - 1 }, { merge: true });
                
                setIsLiked(false);
                setLikeCount(prev => prev - 1);
            } catch (error: any) {
                console.error('Erreur retrait like:', error);
                if (error.code === 'permission-denied') {
                    toast({
                        title: "Erreur de permissions",
                        description: "Vous n'avez pas la permission de retirer ce like",
                        variant: "destructive",
                    });
                }
            }
        } else {
            // Ajouter le like
            try {
                const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
                await setDoc(likeRef, {
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                });

                // Mettre à jour le compteur
                const postRef = doc(db, 'posts', post.id);
                await setDoc(postRef, { likes: likeCount + 1 }, { merge: true });

                setIsLiked(true);
                setLikeCount(prev => prev + 1);

                // Animation de cœurs
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    createHeart(rect.width / 2, rect.height / 2);
                }
            } catch (error: any) {
                console.error('Erreur ajout like:', error);
                if (error.code === 'permission-denied') {
                    toast({
                        title: "Erreur de permissions",
                        description: "Vous n'avez pas la permission d'aimer ce post",
                        variant: "destructive",
                    });
                }
            }
        }
    };

    // Gérer la sauvegarde
    const handleBookmark = async () => {
        if (!user) {
            toast({
                title: "Connexion requise",
                description: "Connectez-vous pour sauvegarder des publications",
                variant: "destructive",
            });
            router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const favoriteRef = doc(db, 'favorites', `${user.uid}_${post.id}`);
            
            if (isBookmarked) {
                await deleteDoc(favoriteRef);
                setIsBookmarked(false);
                
                // Mettre à jour le compteur de favoris
                const postRef = doc(db, 'posts', post.id);
                await setDoc(postRef, { favorites: Math.max(0, favoritesCount - 1) }, { merge: true });
                setFavoritesCount(prev => Math.max(0, prev - 1));
                
                toast({
                    title: "Retiré des favoris",
                    description: "La publication a été retirée de vos favoris",
                });
            } else {
                await setDoc(favoriteRef, {
                    userId: user.uid,
                    postId: post.id,
                    createdAt: serverTimestamp(),
                });
                setIsBookmarked(true);
                
                // Mettre à jour le compteur de favoris
                const postRef = doc(db, 'posts', post.id);
                await setDoc(postRef, { favorites: favoritesCount + 1 }, { merge: true });
                setFavoritesCount(prev => prev + 1);
                
                toast({
                    title: "Ajouté aux favoris",
                    description: "La publication a été ajoutée à vos favoris",
                });
            }
        } catch (error: any) {
            console.error('Erreur bookmark:', error);
            if (error.code === 'permission-denied') {
                toast({
                    title: "Erreur de permissions",
                    description: "Vous n'avez pas la permission de sauvegarder cette publication",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Impossible de sauvegarder la publication",
                    variant: "destructive",
                });
            }
        }
    };

    // Gérer le follow
    const handleFollow = async () => {
        if (!user) {
            toast({
                title: "Connexion requise",
                description: "Connectez-vous pour suivre des utilisateurs",
                variant: "destructive",
            });
            router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (user.uid === post.authorId) {
            return; // Ne peut pas se suivre soi-même
        }

        try {
            const followRef = doc(db, 'users', user.uid, 'following', post.authorId);
            
            if (isFollowing) {
                await deleteDoc(followRef);
                setIsFollowing(false);
                toast({
                    title: "Ne plus suivre",
                    description: `Vous ne suivez plus ${post.author}`,
                });
            } else {
                await setDoc(followRef, {
                    userId: post.authorId,
                    userName: post.author,
                    userAvatar: post.avatarUrl,
                    createdAt: serverTimestamp(),
                });
                setIsFollowing(true);
                toast({
                    title: "Abonné",
                    description: `Vous suivez maintenant ${post.author}`,
                });
            }
        } catch (error: any) {
            console.error('Erreur follow:', error);
            if (error.code === 'permission-denied') {
                toast({
                    title: "Erreur de permissions",
                    description: "Vous n'avez pas la permission de suivre cet utilisateur",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Impossible de suivre cet utilisateur",
                    variant: "destructive",
                });
            }
        }
    };

    // Ajouter un commentaire
    const handleAddComment = async () => {
        if (!user) {
            toast({
                title: "Connexion requise",
                description: "Connectez-vous pour commenter",
                variant: "destructive",
            });
            router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        if (!newComment.trim()) return;

        try {
            const commentsRef = collection(db, 'posts', post.id, 'comments');
            await addDoc(commentsRef, {
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
                userAvatar: user.photoURL || '',
                text: newComment.trim(),
                createdAt: serverTimestamp(),
            });

            // Mettre à jour le compteur de commentaires
            const postRef = doc(db, 'posts', post.id);
            await setDoc(postRef, { comments: (post.comments || 0) + 1 }, { merge: true });

            setNewComment('');
            toast({
                title: "Commentaire ajouté",
                description: "Votre commentaire a été publié",
            });
        } catch (error: any) {
            console.error('Erreur ajout commentaire:', error);
            if (error.code === 'permission-denied') {
                toast({
                    title: "Erreur de permissions",
                    description: "Vous n'avez pas la permission d'ajouter un commentaire",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erreur",
                    description: "Impossible d'ajouter le commentaire",
                    variant: "destructive",
                });
            }
        }
    };

    // Gérer le partage
    const handleShare = async (method: 'copy' | 'native') => {
        const postUrl = `${window.location.origin}/home/post/${post.id}`;
        
        // Mettre à jour le compteur de partages
        try {
            const postRef = doc(db, 'posts', post.id);
            await setDoc(postRef, { shares: sharesCount + 1 }, { merge: true });
            setSharesCount(prev => prev + 1);
        } catch (error) {
            console.error('Erreur mise à jour partages:', error);
        }
        
        if (method === 'copy') {
            try {
                // Essayer d'abord avec l'API Clipboard moderne
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(postUrl);
                    toast({
                        title: "Lien copié",
                        description: "Le lien a été copié dans le presse-papiers",
                    });
                } else {
                    // Fallback pour les navigateurs plus anciens
                    const textArea = document.createElement('textarea');
                    textArea.value = postUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            toast({
                                title: "Lien copié",
                                description: "Le lien a été copié dans le presse-papiers",
                            });
                        } else {
                            throw new Error('execCommand failed');
                        }
                    } catch (err) {
                        // Dernier recours : afficher le lien pour copie manuelle
                        toast({
                            title: "Copiez le lien",
                            description: postUrl,
                            variant: "default",
                        });
                    } finally {
                        document.body.removeChild(textArea);
                    }
                }
            } catch (error) {
                console.error('Erreur copie:', error);
                // Afficher le lien pour copie manuelle
                toast({
                    title: "Copiez le lien",
                    description: postUrl,
                    variant: "default",
                });
            }
        } else if (method === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: `Publication de ${post.author}`,
                    text: post.caption || `Découvrez cette publication de ${post.author}`,
                    url: postUrl,
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Erreur partage:', error);
                    // Si le partage natif échoue, proposer la copie
                    handleShare('copy');
                }
            }
        }
        setShowShare(false);
    };

    // Gestion du swipe horizontal - Améliorée
    const minSwipeDistance = 50; // Distance minimale pour déclencher le swipe
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const isDraggingRef = useRef(false);

    // Touch events
    const onTouchStart = (e: React.TouchEvent) => {
        if (post.media.length <= 1) return;
        const touch = e.targetTouches[0];
        setTouchEnd(null);
        setTouchStart({
            x: touch.clientX,
            y: touch.clientY,
        });
        setIsDragging(false);
        setDragOffset(0);
        isDraggingRef.current = false;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart || post.media.length <= 1) return;
        
        const touch = e.targetTouches[0];
        const currentTouch = {
            x: touch.clientX,
            y: touch.clientY,
        };
        
        const diffX = touchStart.x - currentTouch.x;
        const diffY = Math.abs(touchStart.y - currentTouch.y);
        
        // Si le mouvement horizontal est plus important que le vertical
        if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
            if (!isDraggingRef.current) {
                setIsSwipingHorizontal(true);
                setIsDragging(true);
                isDraggingRef.current = true;
            }
            
            // Calculer l'offset de drag pour un feedback visuel
            const maxOffset = window.innerWidth;
            const clampedOffset = Math.max(
                -maxOffset * (post.media.length - 1 - currentMediaIndex),
                Math.min(maxOffset * currentMediaIndex, diffX)
            );
            setDragOffset(clampedOffset);
            
            // Empêcher le scroll vertical pendant le swipe horizontal
            e.preventDefault();
            e.stopPropagation();
        }
        
        setTouchEnd(currentTouch);
    };

    const onTouchEnd = () => {
        if (!touchStart || post.media.length <= 1) {
            setIsSwipingHorizontal(false);
            setIsDragging(false);
            setTouchStart(null);
            setTouchEnd(null);
            setDragOffset(0);
            isDraggingRef.current = false;
            return;
        }
        
        if (!touchEnd) {
            setIsSwipingHorizontal(false);
            setIsDragging(false);
            setTouchStart(null);
            setTouchEnd(null);
            setDragOffset(0);
            isDraggingRef.current = false;
            return;
        }
        
        const diffX = touchStart.x - touchEnd.x;
        const diffY = Math.abs(touchStart.y - touchEnd.y);
        
        // Vérifier si c'est un swipe horizontal valide
        if (Math.abs(diffX) > diffY && Math.abs(diffX) > minSwipeDistance) {
            const isLeftSwipe = diffX > 0; // Swipe vers la gauche (index suivant)
            const isRightSwipe = diffX < 0; // Swipe vers la droite (index précédent)

            if (isLeftSwipe && currentMediaIndex < post.media.length - 1) {
                setCurrentMediaIndex(prev => Math.min(prev + 1, post.media.length - 1));
            } else if (isRightSwipe && currentMediaIndex > 0) {
                setCurrentMediaIndex(prev => Math.max(prev - 1, 0));
            }
        }

        setIsSwipingHorizontal(false);
        setIsDragging(false);
        setTouchStart(null);
        setTouchEnd(null);
        setDragOffset(0);
        isDraggingRef.current = false;
    };

    // Mouse events (pour desktop) - Utiliser des listeners globaux
    useEffect(() => {
        if (post.media.length <= 1) return;

        let startPos: { x: number; y: number } | null = null;
        let endPos: { x: number; y: number } | null = null;

        const handleMouseDown = (e: MouseEvent) => {
            // Vérifier si le clic est sur le container media
            const container = mediaContainerRef.current;
            if (!container || !container.contains(e.target as Node)) return;
            
            // Ignorer si c'est un bouton ou élément interactif
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            startPos = {
                x: e.clientX,
                y: e.clientY,
            };
            endPos = null;
            setTouchStart(startPos);
            setIsDragging(false);
            setDragOffset(0);
            isDraggingRef.current = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!startPos || post.media.length <= 1) return;
            
            const currentPos = {
                x: e.clientX,
                y: e.clientY,
            };
            
            const diffX = startPos.x - currentPos.x;
            const diffY = Math.abs(startPos.y - currentPos.y);
            
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
                if (!isDraggingRef.current) {
                    setIsSwipingHorizontal(true);
                    setIsDragging(true);
                    isDraggingRef.current = true;
                }
                
                // Calculer l'offset de drag pour un feedback visuel
                const maxOffset = window.innerWidth;
                const clampedOffset = Math.max(
                    -maxOffset * (post.media.length - 1 - currentMediaIndex),
                    Math.min(maxOffset * currentMediaIndex, diffX)
                );
                setDragOffset(clampedOffset);
            }
            
            endPos = currentPos;
            setTouchEnd(endPos);
        };

        const handleMouseUp = () => {
            if (!startPos || post.media.length <= 1) {
                setIsSwipingHorizontal(false);
                setIsDragging(false);
                setTouchStart(null);
                setTouchEnd(null);
                setDragOffset(0);
                isDraggingRef.current = false;
                startPos = null;
                endPos = null;
                return;
            }
            
            if (!endPos) {
                setIsSwipingHorizontal(false);
                setIsDragging(false);
                setTouchStart(null);
                setTouchEnd(null);
                setDragOffset(0);
                isDraggingRef.current = false;
                startPos = null;
                endPos = null;
                return;
            }
            
            const diffX = startPos.x - endPos.x;
            const diffY = Math.abs(startPos.y - endPos.y);
            
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > minSwipeDistance) {
                const isLeftSwipe = diffX > 0;
                const isRightSwipe = diffX < 0;

                if (isLeftSwipe && currentMediaIndex < post.media.length - 1) {
                    setCurrentMediaIndex(prev => Math.min(prev + 1, post.media.length - 1));
                } else if (isRightSwipe && currentMediaIndex > 0) {
                    setCurrentMediaIndex(prev => Math.max(prev - 1, 0));
                }
            }

            setIsSwipingHorizontal(false);
            setIsDragging(false);
            setTouchStart(null);
            setTouchEnd(null);
            setDragOffset(0);
            isDraggingRef.current = false;
            startPos = null;
            endPos = null;
        };

        // Ajouter les listeners globaux
        document.addEventListener('mousedown', handleMouseDown, { passive: false });
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp, { passive: false });

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [currentMediaIndex, post.media.length, minSwipeDistance]);

    // Fonction pour compter une vue
    const countView = async () => {
        if (hasViewed) return; // Éviter les comptages multiples
        
        try {
            const postRef = doc(db, 'posts', post.id);
            const currentViews = viewsCount || 0;
            await setDoc(postRef, { views: currentViews + 1 }, { merge: true });
            setViewsCount(prev => prev + 1);
            setHasViewed(true);
        } catch (error: any) {
            // Ignorer les erreurs de permissions pour les utilisateurs non connectés
            if (error.code === 'permission-denied') {
                // Ne pas compter la vue si l'utilisateur n'est pas connecté
                return;
            }
            console.error('Erreur comptage vue:', error);
            // Ne pas afficher d'erreur pour les vues, c'est silencieux
        }
    };

    // Intersection Observer pour visibilité et comptage des vues
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
                threshold: 0.5,
                rootMargin: '100px',
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Compter les vues quand le post devient visible (pour tous les types de médias)
    useEffect(() => {
        if (isVisible && !hasViewed) {
            // Compter les vues pour tous les posts (images et vidéos)
            countView();
        }
    }, [isVisible, hasViewed]);

    // Auto-play/pause videos
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;
            
            const isCurrentMedia = index === currentMediaIndex;
            const isVideo = post.media[index]?.type === 'video';
            
            if (isCurrentMedia && isVideo && isVisible) {
                video.play().catch((error) => {
                    console.log('Auto-play échoué:', error);
                });
            } else {
                video.pause();
                if (video.currentTime > 0) {
                    video.currentTime = 0;
                }
            }
        });
    }, [currentMediaIndex, post.media, isVisible]);

    // Mettre à jour le son de toutes les vidéos quand isSoundEnabled change
    useEffect(() => {
        videoRefs.current.forEach((video) => {
            if (!video) return;
            video.muted = !isSoundEnabled;
        });
    }, [isSoundEnabled]);

    // Mémoriser les hashtags et description
    const { hashtags, description } = useMemo(() => {
        const tags = post.caption.match(/#\w+/g) || [];
        const desc = post.caption.replace(/#\w+/g, '').trim();
        return { hashtags: tags, description: desc };
    }, [post.caption]);

    if (post.media.length === 0) return null;

    return (
        <div 
            ref={containerRef}
            className="relative h-screen w-full snap-start snap-always flex-shrink-0 bg-black overflow-hidden"
        >
            {/* Animation de cœurs */}
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute pointer-events-none z-50 animate-heart-float"
                    style={{
                        left: `${heart.x}px`,
                        top: `${heart.y}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                </div>
            ))}

            {/* Media Container */}
            <div 
                ref={mediaContainerRef}
                className={cn(
                    "absolute inset-0 flex transition-transform duration-300 ease-out",
                    isDragging && "transition-none"
                )}
                style={{
                    transform: `translateX(calc(-${currentMediaIndex * 100}% + ${dragOffset}px))`,
                    cursor: post.media.length > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    touchAction: post.media.length > 1 ? 'pan-x pan-y' : 'auto',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {post.media.map((media, index) => (
                    <div 
                        key={`${post.id}-${index}-${media.url.substring(0, 50)}`}
                        className="relative h-full w-full flex-shrink-0 pointer-events-auto"
                        style={{ pointerEvents: 'auto' }}
                    >
                        {media.type === 'image' ? (
                            <Image
                                src={media.url}
                                alt={`Post media ${index + 1}`}
                                fill
                                className="object-cover select-none pointer-events-none"
                                priority={index === 0 && currentMediaIndex === 0}
                                loading={index === 0 ? "eager" : "lazy"}
                                quality={85}
                                sizes="100vw"
                                unoptimized={true}
                                draggable={false}
                                style={{ pointerEvents: 'none' }}
                            />
                        ) : (
                            <>
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    src={media.url}
                                    className="h-full w-full object-cover select-none pointer-events-none"
                                    muted={!isSoundEnabled}
                                    loop
                                    playsInline
                                    autoPlay={index === currentMediaIndex && isVisible}
                                    preload={index === 0 && currentMediaIndex === 0 ? "auto" : "none"}
                                    loading="lazy"
                                    draggable={false}
                                    style={{ pointerEvents: 'none' }}
                                    onLoadedMetadata={(e) => {
                                        const video = e.currentTarget;
                                        if (index === currentMediaIndex && isVisible && video.paused) {
                                            video.play().catch(() => {});
                                        }
                                    }}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-0" />

            {/* Contenu principal */}
            <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <span className="text-[#FFCC00] font-headline font-semibold text-sm">#PonaYo</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSound();
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={cn(
                            "relative pointer-events-auto z-30 group transition-all duration-300",
                            "h-12 w-12 rounded-full flex items-center justify-center",
                            "backdrop-blur-md border-2 transition-all duration-300",
                            "shadow-lg hover:shadow-xl hover:scale-110 active:scale-95",
                            isSoundEnabled
                                ? "bg-gradient-to-br from-[#FF8800] to-[#FFCC00] border-[#FFCC00]/50 shadow-[#FF8800]/30"
                                : "bg-black/60 border-white/30 hover:border-white/50"
                        )}
                    >
                        {/* Effet de brillance au hover */}
                        <div className={cn(
                            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "bg-gradient-to-br from-[#FFCC00]/20 to-[#FF8800]/20 blur-sm"
                        )} />
                        
                        {/* Icône */}
                        <div className="relative z-10">
                            {isSoundEnabled ? (
                                <Volume2 className={cn(
                                    "h-6 w-6 transition-all duration-300",
                                    "text-white drop-shadow-lg",
                                    "group-hover:scale-110"
                                )} />
                            ) : (
                                <VolumeX className={cn(
                                    "h-6 w-6 transition-all duration-300",
                                    "text-white/80 group-hover:text-white",
                                    "group-hover:scale-110"
                                )} />
                            )}
                        </div>
                        
                        {/* Indicateur animé quand le son est activé */}
                        {isSoundEnabled && (
                            <div className="absolute inset-0 rounded-full">
                                <div className="absolute inset-0 rounded-full border-2 border-[#FFCC00]/50 animate-ping opacity-75" />
                                <div className="absolute inset-1 rounded-full border border-[#FFCC00]/30 animate-pulse" />
                            </div>
                        )}
                    </button>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 flex">
                    {/* Zone gauche - Infos auteur et caption */}
                    <div className="flex-1 flex flex-col justify-end p-4 pb-28 z-10">
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
                                    <span 
                                        key={tag} 
                                        className="text-[#FFCC00] font-medium cursor-pointer hover:underline transition-all hover:text-[#FF8800]"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const tagWithoutHash = tag.replace(/^#/, '');
                                            router.push(`/home/hashtag/${encodeURIComponent(tagWithoutHash)}`);
                                        }}
                                    >
                                        {tag}{' '}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>

                    {/* Zone droite - Actions - Ultra Minimaliste */}
                    <div className="flex flex-col justify-end items-center gap-3 p-4 pb-28 z-10">
                        {/* Avatar pour follow - Ultra compact */}
                        <button 
                            onClick={handleFollow}
                            className={cn(
                                "flex flex-col items-center gap-1 group transition-opacity",
                                (!user || user.uid === post.authorId) && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!user || user.uid === post.authorId}
                            onMouseDown={(e) => {
                                if (!user || user.uid === post.authorId) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Avatar className={cn(
                                "h-9 w-9 border transition-all",
                                isFollowing ? "border-[#FFCC00]" : "border-white/50"
                            )}>
                                <AvatarImage src={post.avatarUrl} alt={post.author} />
                                <AvatarFallback className="bg-[#FF8800] text-white text-[10px] font-semibold">
                                    {post.author.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "h-3.5 w-3.5 rounded-full flex items-center justify-center border transition-all",
                                isFollowing 
                                    ? "bg-[#FFCC00] border-[#FFCC00]" 
                                    : "bg-[#FF8800] border-white/50"
                            )}>
                                {isFollowing ? (
                                    <UserPlus className="h-2 w-2 text-black" />
                                ) : (
                                    <span className="text-white text-[7px] font-bold">+</span>
                                )}
                            </div>
                        </button>

                        {/* Like - Ultra minimaliste */}
                        <button 
                            onClick={handleLike} 
                            className="flex flex-col items-center gap-0.5 group relative"
                        >
                            <div className="h-8 w-8 flex items-center justify-center group-active:scale-90 transition-transform">
                                <Heart className={cn(
                                    "h-5 w-5 transition-all duration-200",
                                    isLiked ? "text-red-500 fill-red-500" : "text-white"
                                )} />
                            </div>
                            <span className="text-white/90 font-medium text-[10px] leading-none">
                                {likeCount > 0 ? (likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount) : ''}
                            </span>
                        </button>

                        {/* Comment - Ultra minimaliste */}
                        <button 
                            onClick={() => setShowComments(true)}
                            className="flex flex-col items-center gap-0.5 group"
                        >
                            <div className="h-8 w-8 flex items-center justify-center group-active:scale-90 transition-transform">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white/90 font-medium text-[10px] leading-none">
                                {post.comments > 0 ? (post.comments >= 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments) : ''}
                            </span>
                        </button>

                        {/* Bookmark - Ultra minimaliste */}
                        <button 
                            onClick={handleBookmark}
                            className="flex flex-col items-center gap-0.5 group"
                        >
                            <div className="h-8 w-8 flex items-center justify-center group-active:scale-90 transition-transform">
                                <Bookmark className={cn(
                                    "h-5 w-5 transition-colors duration-200",
                                    isBookmarked ? "text-[#FFCC00] fill-[#FFCC00]" : "text-white"
                                )} />
                            </div>
                            <span className="text-white/90 font-medium text-[10px] leading-none">
                                {favoritesCount > 0 ? (favoritesCount >= 1000 ? `${(favoritesCount / 1000).toFixed(1)}K` : favoritesCount) : ''}
                            </span>
                        </button>

                        {/* Share - Ultra minimaliste */}
                        <button 
                            onClick={() => setShowShare(true)}
                            className="flex flex-col items-center gap-0.5 group"
                        >
                            <div className="h-8 w-8 flex items-center justify-center group-active:scale-90 transition-transform">
                                <Share2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white/90 font-medium text-[10px] leading-none">
                                {sharesCount > 0 ? (sharesCount >= 1000 ? `${(sharesCount / 1000).toFixed(1)}K` : sharesCount) : ''}
                            </span>
                        </button>

                        {/* Views - Ultra minimaliste */}
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="h-8 w-8 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white/90 font-medium text-[10px] leading-none">
                                {viewsCount > 0 ? (viewsCount >= 1000 ? `${(viewsCount / 1000).toFixed(1)}K` : viewsCount) : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Indicateurs de media multiples */}
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

            {/* Dialog Commentaires */}
            <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col bg-black border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Commentaires</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {comments.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Aucun commentaire</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={comment.userAvatar} />
                                        <AvatarFallback className="bg-[#FF8800] text-white">
                                            {comment.userName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-semibold text-sm">{comment.userName}</span>
                                            <span className="text-gray-400 text-xs">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {user && (
                        <div className="flex gap-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="flex-1 bg-gray-900 text-white border-gray-700"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <Button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="bg-[#FF8800] hover:bg-[#FF8800]/90"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Partage */}
            <Dialog open={showShare} onOpenChange={setShowShare}>
                <DialogContent className="max-w-md bg-black border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Partager</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        {navigator.share && (
                            <Button
                                onClick={() => handleShare('native')}
                                className="w-full bg-[#FF8800] hover:bg-[#FF8800]/90 text-white"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Partager via...
                            </Button>
                        )}
                        <Button
                            onClick={() => handleShare('copy')}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copier le lien
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.post.id === nextProps.post.id && 
           prevProps.post.likes === nextProps.post.likes &&
           prevProps.post.comments === nextProps.post.comments &&
           prevProps.post.relativeTime === nextProps.post.relativeTime;
});
