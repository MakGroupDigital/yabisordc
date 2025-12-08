/**
 * Algorithme de Fil d'Actualité - Ya Biso RDC
 * 
 * Cet algorithme détermine l'ordre d'affichage des publications
 * en fonction de l'engagement, la fraîcheur, la viralité, la qualité
 * et la personnalisation.
 */

import { Post } from '@/types';

export interface PostScore {
  post: Post;
  totalScore: number;
  engagementScore: number;
  freshnessScore: number;
  viralityScore: number;
  qualityScore: number;
  personalizationScore: number;
  lastCalculated: Date;
}

interface UserPreferences {
  followedUsers: string[];
  likedHashtags: string[];
  savedLocations: string[];
  preferredContentType: 'video' | 'image' | 'both';
  viewHistory: { postId: string; viewedAt: Date }[];
}

/**
 * Calcule le score d'engagement d'une publication
 */
function calculateEngagementScore(post: Post): number {
  const likes = post.likes || 0;
  const comments = post.comments || 0;
  const shares = post.sharesCount || 0;
  const views = post.viewsCount || 0;

  // Score de base
  let score = (likes * 2) + (comments * 3) + (shares * 5) + (views * 0.1);

  // Bonus ratio likes/vues
  if (views > 0) {
    const likeRatio = likes / views;
    if (likeRatio > 0.2) score += 150;
    else if (likeRatio > 0.1) score += 50;
  }

  // Bonus commentaires
  if (comments > 50) score += 100;

  // Bonus partages
  if (shares > 100) score += 200;
  else if (shares > 50) score += 100;

  // Bonus vues
  if (views > 10000) score += 50;

  // Taux de rétention (simulé - à implémenter avec données réelles)
  // Pour l'instant, on estime basé sur le ratio engagement/vues
  if (views > 0) {
    const retentionRatio = (likes + comments + shares) / views;
    if (retentionRatio > 0.3) score += 100;
    else if (retentionRatio > 0.15) score += 50;
  }

  return score;
}

/**
 * Calcule le score de fraîcheur d'une publication
 */
function calculateFreshnessScore(post: Post): number {
  const now = new Date();
  const createdAt = post.createdAt || now;
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  // Base score selon l'âge
  let baseScore = 50;
  if (hoursElapsed < 1) baseScore = 1000;
  else if (hoursElapsed < 6) baseScore = 800;
  else if (hoursElapsed < 24) baseScore = 600;
  else if (hoursElapsed < 72) baseScore = 400;
  else if (hoursElapsed < 168) baseScore = 200;
  else if (hoursElapsed < 720) baseScore = 100;

  // Décroissance temporelle
  const decay = 1 / (1 + hoursElapsed / 24);
  let score = baseScore * decay;

  // Bonus fraîcheur
  if (hoursElapsed < 0.5) score += 200; // 30 dernières minutes
  else if (hoursElapsed < 1) score += 100; // Dernière heure

  return score;
}

/**
 * Calcule le score de viralité d'une publication
 */
function calculateViralityScore(post: Post, allPosts: Post[]): number {
  const likes = post.likes || 0;
  const comments = post.comments || 0;
  const shares = post.sharesCount || 0;
  const views = post.viewsCount || 0;

  let score = 0;

  // Ratio engagement
  if (views > 0) {
    const engagementRatio = (likes + comments + shares) / views;
    if (engagementRatio > 0.3) score += 200;
    else if (engagementRatio > 0.15) score += 100;
    else if (engagementRatio > 0.05) score += 50;
  }

  // Croissance récente (simulé - nécessite historique)
  // Pour l'instant, on utilise le ratio engagement comme proxy
  if (views > 100 && likes > 50) {
    const growthRate = likes / views;
    if (growthRate > 0.2) score += 300;
    else if (growthRate > 0.1) score += 150;
  }

  // Bonus hashtags tendance (à implémenter avec données réelles)
  const hashtags = (post.caption || '').match(/#\w+/g) || [];
  if (hashtags.length > 0) {
    // Simuler des hashtags tendance
    const trendingHashtags = ['#RDC', '#Kinshasa', '#Congo', '#PonaYo'];
    const trendingCount = hashtags.filter(tag => 
      trendingHashtags.some(trending => 
        tag.toLowerCase().includes(trending.toLowerCase().replace('#', ''))
      )
    ).length;
    score += trendingCount * 100;
  }

  return score;
}

/**
 * Calcule le score de qualité d'une publication
 */
function calculateQualityScore(post: Post): number {
  let score = 0;

  // Complétude du contenu
  const caption = post.caption || '';
  if (caption.length > 50) score += 50;
  if (post.location) score += 30;
  
  const hashtags = caption.match(/#\w+/g) || [];
  if (hashtags.length >= 3 && hashtags.length <= 5) score += 40;

  // Type de média
  const hasVideo = post.media.some(m => m.type === 'video');
  const mediaCount = post.media.length;

  if (hasVideo) {
    score += 50;
    // Bonus pour vidéo de durée optimale (à implémenter avec métadonnées vidéo)
    score += 30;
  } else if (mediaCount > 3) {
    score += 30;
  } else if (mediaCount > 1) {
    score += 20;
  } else {
    score += 10;
  }

  return score;
}

/**
 * Calcule le score de personnalisation pour un utilisateur
 */
function calculatePersonalizationScore(
  post: Post, 
  userPreferences: UserPreferences | null
): number {
  if (!userPreferences) return 0;

  let score = 0;

  // Relations utilisateur
  if (userPreferences.followedUsers.includes(post.authorId)) {
    score += 100;
  }

  // Intérêts utilisateur (hashtags)
  const postHashtags = (post.caption || '').match(/#\w+/g) || [];
  const matchingHashtags = postHashtags.filter(tag =>
    userPreferences.likedHashtags.some(liked =>
      tag.toLowerCase().includes(liked.toLowerCase().replace('#', ''))
    )
  );
  score += matchingHashtags.length * 30;

  // Localisation similaire
  if (post.location && userPreferences.savedLocations.includes(post.location)) {
    score += 40;
  }

  // Type de contenu préféré
  const hasVideo = post.media.some(m => m.type === 'video');
  if (userPreferences.preferredContentType === 'both' ||
      (userPreferences.preferredContentType === 'video' && hasVideo) ||
      (userPreferences.preferredContentType === 'image' && !hasVideo)) {
    score += 20;
  }

  // Historique de visionnage
  const viewedBefore = userPreferences.viewHistory.some(
    h => h.postId === post.id
  );
  if (!viewedBefore) {
    score += 50; // Contenu jamais vu
  } else {
    // Vérifier si assez de temps s'est écoulé pour réafficher
    const lastView = userPreferences.viewHistory.find(h => h.postId === post.id);
    if (lastView) {
      const daysSinceView = (new Date().getTime() - lastView.viewedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceView > 7) score += 100;
      else if (daysSinceView > 3) score += 50;
      else if (daysSinceView > 1) score += 20;
      else score -= 30; // Trop récent
    }
  }

  return score;
}

/**
 * Calcule le score total d'une publication
 */
export function calculatePostScore(
  post: Post,
  allPosts: Post[],
  userPreferences: UserPreferences | null = null
): PostScore {
  const engagementScore = calculateEngagementScore(post);
  const freshnessScore = calculateFreshnessScore(post);
  const viralityScore = calculateViralityScore(post, allPosts);
  const qualityScore = calculateQualityScore(post);
  const personalizationScore = calculatePersonalizationScore(post, userPreferences);

  // Score total pondéré
  const totalScore = 
    (engagementScore * 0.40) +
    (freshnessScore * 0.25) +
    (viralityScore * 0.20) +
    (qualityScore * 0.10) +
    (personalizationScore * 0.05);

  return {
    post,
    totalScore,
    engagementScore,
    freshnessScore,
    viralityScore,
    qualityScore,
    personalizationScore,
    lastCalculated: new Date(),
  };
}

/**
 * Trie les publications selon l'algorithme de fil d'actualité
 */
export function sortPostsByFeedAlgorithm(
  posts: Post[],
  userPreferences: UserPreferences | null = null
): Post[] {
  // Calculer les scores pour toutes les publications
  const scoredPosts = posts.map(post => 
    calculatePostScore(post, posts, userPreferences)
  );

  // Filtrer les publications avec score trop faible
  const filteredPosts = scoredPosts.filter(
    score => score.totalScore >= 50 || 
    (score.viralityScore > 500 && score.post.createdAt && 
     (new Date().getTime() - score.post.createdAt.getTime()) < 90 * 24 * 60 * 60 * 1000)
  );

  // Trier par score décroissant
  filteredPosts.sort((a, b) => b.totalScore - a.totalScore);

  // Appliquer la diversification
  const diversified = diversifyFeed(filteredPosts.map(sp => sp.post));

  return diversified;
}

/**
 * Applique les règles de diversification au fil d'actualité
 */
function diversifyFeed(posts: Post[]): Post[] {
  const diversified: Post[] = [];
  const authorCount: { [key: string]: number } = {};
  let consecutiveVideos = 0;

  for (const post of posts) {
    // Règle : Maximum 3 publications consécutives du même auteur
    if (authorCount[post.authorId] >= 3) {
      continue;
    }

    // Règle : Maximum 2 vidéos consécutives
    const isVideo = post.media.some(m => m.type === 'video');
    if (isVideo && consecutiveVideos >= 2) {
      continue;
    }

    diversified.push(post);
    
    // Mettre à jour les compteurs
    authorCount[post.authorId] = (authorCount[post.authorId] || 0) + 1;
    
    if (isVideo) {
      consecutiveVideos++;
    } else {
      consecutiveVideos = 0;
    }

    // Réinitialiser le compteur d'auteur après 5 posts
    if (diversified.length % 5 === 0) {
      Object.keys(authorCount).forEach(key => {
        authorCount[key] = Math.max(0, authorCount[key] - 2);
      });
    }
  }

  return diversified;
}

/**
 * Détermine si une publication devrait être réaffichée
 */
export function shouldReShowPost(
  post: Post,
  userId: string,
  userPreferences: UserPreferences | null
): boolean {
  if (!userPreferences) return false;

  const viewHistory = userPreferences.viewHistory.filter(h => h.postId === post.id);
  if (viewHistory.length === 0) return true; // Jamais vu

  // Maximum 3 réaffichages
  if (viewHistory.length >= 3) return false;

  // Vérifier l'espacement minimum (24 heures)
  const lastView = viewHistory[viewHistory.length - 1];
  const hoursSinceLastView = (new Date().getTime() - lastView.viewedAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastView < 24) return false;

  // Vérifier si le contenu a gagné en popularité
  const likes = post.likes || 0;
  const views = post.viewsCount || 0;
  
  // Si le ratio engagement s'améliore, réafficher
  if (views > 0 && likes / views > 0.1) {
    return true;
  }

  // Si assez de temps s'est écoulé (> 7 jours)
  if (hoursSinceLastView > 168) {
    return true;
  }

  return false;
}

/**
 * Récupère les hashtags tendance (à implémenter avec données réelles)
 */
export function getTrendingHashtags(posts: Post[]): string[] {
  const hashtagCount: { [key: string]: number } = {};

  posts.forEach(post => {
    const hashtags = (post.caption || '').match(/#\w+/g) || [];
    hashtags.forEach(tag => {
      const normalized = tag.toLowerCase();
      hashtagCount[normalized] = (hashtagCount[normalized] || 0) + 1;
    });
  });

  // Trier par popularité et retourner le top 10
  return Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
}

