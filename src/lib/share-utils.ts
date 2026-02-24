/**
 * Utilitaires pour le système de partage et deep links
 */

export type ShareableType = 
  | 'post' 
  | 'hopital' 
  | 'restaurant' 
  | 'site' 
  | 'hebergement' 
  | 'appartement' 
  | 'salle' 
  | 'evenement' 
  | 'police';

/**
 * Génère un lien de partage pour un élément
 */
export function generateShareLink(type: ShareableType, id: string): string {
  if (typeof window === 'undefined') return '';
  
  // Pour les posts, utiliser le chemin existant
  if (type === 'post') {
    return `${window.location.origin}/home/post/${id}`;
  }
  
  // Pour les autres types, utiliser le nouveau système de deep links
  return `${window.location.origin}/share/${type}/${id}`;
}

/**
 * Partage un élément via l'API Web Share ou copie le lien
 */
export async function shareItem(
  type: ShareableType,
  id: string,
  title: string,
  description?: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const url = generateShareLink(type, id);
  const shareText = description || `Découvrez ${title} sur Ya Biso RDC !`;
  
  // Essayer l'API Web Share native
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Ya Biso RDC - ${title}`,
        text: shareText,
        url: url,
      });
      return { success: true, method: 'native' };
    } catch (error) {
      // L'utilisateur a annulé ou erreur - fallback vers clipboard
      console.log('Partage natif annulé ou erreur:', error);
    }
  }
  
  // Fallback: copier dans le presse-papiers
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, method: 'clipboard' };
    } else {
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, method: 'clipboard' };
    }
  } catch (error) {
    console.error('Erreur de copie:', error);
    return { success: false, method: 'clipboard' };
  }
}

/**
 * Récupère l'élément partagé depuis le localStorage
 */
export function getSharedItem(): { type: string; id: string } | null {
  if (typeof window === 'undefined') return null;
  
  const type = localStorage.getItem('shared_item_type');
  const id = localStorage.getItem('shared_item_id');
  
  if (type && id) {
    return { type, id };
  }
  return null;
}

/**
 * Efface l'élément partagé du localStorage
 */
export function clearSharedItem(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('shared_item_type');
  localStorage.removeItem('shared_item_id');
}

/**
 * Vérifie si un élément doit être mis en surbrillance
 */
export function shouldHighlightItem(id: string, highlightId: string | null): boolean {
  return highlightId === id;
}

/**
 * Génère les données de partage pour WhatsApp
 */
export function getWhatsAppShareUrl(type: ShareableType, id: string, title: string): string {
  const url = generateShareLink(type, id);
  const text = encodeURIComponent(`Découvrez ${title} sur Ya Biso RDC ! ${url}`);
  return `https://wa.me/?text=${text}`;
}

/**
 * Génère les données de partage pour Facebook
 */
export function getFacebookShareUrl(type: ShareableType, id: string): string {
  const url = generateShareLink(type, id);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Génère les données de partage pour Twitter/X
 */
export function getTwitterShareUrl(type: ShareableType, id: string, title: string): string {
  const url = generateShareLink(type, id);
  const text = encodeURIComponent(`Découvrez ${title} sur Ya Biso RDC !`);
  return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
}

