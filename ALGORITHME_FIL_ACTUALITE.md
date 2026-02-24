# 🎯 Algorithme de Fil d'Actualité - Ya Biso RDC

## 📋 Vue d'ensemble

Cet algorithme détermine l'ordre d'affichage des publications dans le fil d'actualité de la page d'accueil, en favorisant les contenus pertinents, engageants et viraux.

---

## 🧮 Système de Scoring (Score Total)

Chaque publication reçoit un **score total** calculé selon la formule suivante :

```
Score Total = (Score Engagement × 0.40) + 
              (Score Fraîcheur × 0.25) + 
              (Score Viralité × 0.20) + 
              (Score Qualité × 0.10) + 
              (Score Personnalisation × 0.05)
```

### Poids des facteurs :
- **40%** - Engagement (likes, commentaires, partages, vues)
- **25%** - Fraîcheur (date de publication)
- **20%** - Viralité (tendance, croissance)
- **10%** - Qualité (complétude du contenu)
- **5%** - Personnalisation (préférences utilisateur)

---

## 1️⃣ Score d'Engagement (40% du score total)

### Formule :
```
Score Engagement = (Likes × 2) + 
                   (Commentaires × 3) + 
                   (Partages × 5) + 
                   (Vues × 0.1) + 
                   (Taux de Rétention × 100)
```

### Détails :

#### **Likes** (×2)
- Chaque like = 2 points
- Bonus si ratio likes/vues > 10% : +50 points
- Bonus si ratio likes/vues > 20% : +150 points

#### **Commentaires** (×3)
- Chaque commentaire = 3 points
- Indique un engagement profond
- Bonus si nombre de commentaires > 50 : +100 points

#### **Partages** (×5)
- Chaque partage = 5 points
- Indicateur fort de viralité
- Bonus si partages > 100 : +200 points

#### **Vues** (×0.1)
- Chaque vue = 0.1 point
- Poids faible pour éviter le biais vers les anciennes publications
- Bonus si vues > 10,000 : +50 points

#### **Taux de Rétention** (×100)
- Calcul : (Vues complètes / Vues totales) × 100
- Si > 80% : +100 points
- Si > 60% : +50 points
- Si < 30% : -20 points

---

## 2️⃣ Score de Fraîcheur (25% du score total)

### Formule :
```
Score Fraîcheur = Base Score × Décroissance Temporelle
```

### Base Score :
- **Publication < 1 heure** : 1000 points
- **Publication < 6 heures** : 800 points
- **Publication < 24 heures** : 600 points
- **Publication < 3 jours** : 400 points
- **Publication < 7 jours** : 200 points
- **Publication < 30 jours** : 100 points
- **Publication > 30 jours** : 50 points

### Décroissance Temporelle :
```
Décroissance = 1 / (1 + (heures_écoulées / 24))
```

### Bonus Fraîcheur :
- **Publication dans les 30 dernières minutes** : +200 points
- **Publication dans la dernière heure** : +100 points

---

## 3️⃣ Score de Viralité (20% du score total)

### Formule :
```
Score Viralité = Croissance Récente + 
                 Ratio Engagement + 
                 Multiplicateur de Tendance
```

### Croissance Récente :
```
Croissance = (Engagement dernière heure - Engagement heure précédente) × 10
```
- Si croissance > 50% : +300 points
- Si croissance > 20% : +150 points
- Si croissance < 0% : -50 points

### Ratio Engagement :
```
Ratio = (Likes + Commentaires + Partages) / Vues
```
- Si ratio > 0.3 : +200 points (très viral)
- Si ratio > 0.15 : +100 points (viral)
- Si ratio > 0.05 : +50 points (engagé)

### Multiplicateur de Tendance :
- **Hashtags tendance** : +100 points par hashtag tendance
- **Auteur populaire** (followers > 10K) : +50 points
- **Contenu saisonnier** (événements actuels) : +150 points

---

## 4️⃣ Score de Qualité (10% du score total)

### Critères :

#### **Complétude du Contenu** :
- Caption complète (> 50 caractères) : +50 points
- Localisation renseignée : +30 points
- Hashtags pertinents (3-5 hashtags) : +40 points
- Média de qualité (haute résolution) : +30 points

#### **Type de Média** :
- **Vidéo** : +50 points (plus engageant)
- **Image multiple** (> 3 images) : +30 points
- **Image unique** : +10 points

#### **Durée Vidéo** :
- Vidéo 15-60 secondes : +50 points (durée optimale)
- Vidéo 60-180 secondes : +30 points
- Vidéo > 180 secondes : +10 points
- Vidéo < 15 secondes : +20 points

---

## 5️⃣ Score de Personnalisation (5% du score total)

### Facteurs :

#### **Relations Utilisateur** :
- Publication d'un utilisateur suivi : +100 points
- Publication d'un utilisateur avec interactions récentes : +50 points
- Publication d'un utilisateur jamais interagi : -20 points

#### **Intérêts Utilisateur** :
- Hashtags similaires aux hashtags likés : +30 points par hashtag
- Localisation similaire aux publications sauvegardées : +40 points
- Type de contenu similaire (vidéo vs image) : +20 points

#### **Historique de Visionnage** :
- Contenu jamais vu : +50 points
- Contenu vu mais pas aimé : -30 points
- Contenu déjà aimé : +20 points (réaffichage possible)

---

## 🎬 Critères pour qu'une Vidéo Devienne Virale

### 1. **Engagement Initial Rapide**
- **Critère** : > 100 likes dans la première heure
- **Impact** : Boost automatique dans l'algorithme (+300 points)

### 2. **Taux de Rétention Élevé**
- **Critère** : > 70% des utilisateurs regardent jusqu'à la fin
- **Impact** : Indicateur fort de qualité (+200 points)

### 3. **Ratio Engagement/Vues Exceptionnel**
- **Critère** : > 20% (1 like/commentaire pour 5 vues)
- **Impact** : Signal de viralité (+250 points)

### 4. **Partages Organiques**
- **Critère** : > 50 partages dans les 24 premières heures
- **Impact** : Propagation naturelle (+300 points)

### 5. **Croissance Exponentielle**
- **Critère** : Doublement des vues/heure pendant 3 heures consécutives
- **Impact** : Algorithme booste automatiquement (+400 points)

### 6. **Commentaires de Qualité**
- **Critère** : > 20 commentaires avec réponses de l'auteur
- **Impact** : Communauté active (+150 points)

### 7. **Hashtags Tendance**
- **Critère** : Utilisation de hashtags avec > 1000 publications récentes
- **Impact** : Visibilité accrue (+100 points)

---

## 🔄 Critères pour qu'une Vidéo soit Vue Plusieurs Fois

### 1. **Score de Réengagement**
```
Score Réengagement = (Score Initial × 0.5) + 
                     (Nouveaux Likes × 2) + 
                     (Nouveaux Commentaires × 3) + 
                     (Temps depuis dernière vue × 0.1)
```

### 2. **Facteurs de Réaffichage** :

#### **Temps Écoulé** :
- **> 7 jours** depuis dernière vue : +100 points
- **> 3 jours** : +50 points
- **> 1 jour** : +20 points
- **< 1 jour** : -50 points (trop récent)

#### **Nouveau Engagement** :
- Nouveaux likes depuis dernière vue : +30 points par like
- Nouveaux commentaires : +50 points par commentaire
- Nouveaux partages : +100 points par partage

#### **Popularité Croissante** :
- Si vues ont augmenté de > 50% : +150 points
- Si ratio engagement s'améliore : +100 points

#### **Contenu Éternel (Evergreen)** :
- Contenu intemporel (pas lié à un événement) : +80 points
- Contenu éducatif/informatif : +60 points
- Contenu humoristique : +40 points

### 3. **Limites de Réaffichage** :
- **Maximum 3 réaffichages** par publication pour un utilisateur
- **Espacement minimum** : 24 heures entre chaque réaffichage
- **Décroissance** : Score réduit de 30% à chaque réaffichage

---

## 📊 Algorithme de Tri Final

### Étape 1 : Calcul du Score Total
Pour chaque publication, calculer le score total selon la formule principale.

### Étape 2 : Filtrage
- Exclure les publications avec score < 50
- Exclure les publications > 90 jours (sauf si score viralité > 500)

### Étape 3 : Tri Principal
Trier par score total décroissant.

### Étape 4 : Diversification
- **Règle** : Maximum 3 publications consécutives du même auteur
- **Règle** : Maximum 2 vidéos consécutives
- **Règle** : Mélanger contenu récent (70%) et contenu viral (30%)

### Étape 5 : Boost Personnalisé
- Ajuster l'ordre selon les préférences utilisateur
- Prioriser les publications d'utilisateurs suivis

### Étape 6 : Cache et Performance
- Mettre en cache les scores calculés (mise à jour toutes les 5 minutes)
- Limiter à 50 publications par chargement initial

---

## 🚀 Implémentation Technique

### Structure de Données Recommandée :

```typescript
interface PostScore {
  postId: string;
  totalScore: number;
  engagementScore: number;
  freshnessScore: number;
  viralityScore: number;
  qualityScore: number;
  personalizationScore: number;
  lastCalculated: Date;
  viewCount: number;
  lastViewedBy?: string[]; // IDs des utilisateurs qui ont vu
  viewHistory?: { userId: string; viewedAt: Date }[];
}
```

### Fonctions Clés :

1. **calculatePostScore(post, user)** : Calcule le score total
2. **getTrendingHashtags()** : Récupère les hashtags tendance
3. **getUserPreferences(userId)** : Récupère les préférences utilisateur
4. **shouldReShowPost(post, userId)** : Détermine si réafficher
5. **diversifyFeed(posts)** : Applique les règles de diversification

---

## 📈 Métriques de Succès

### KPIs à Suivre :
- **Taux d'engagement moyen** : Objectif > 5%
- **Temps moyen de visionnage** : Objectif > 60% de la durée
- **Taux de rétention utilisateur** : Objectif > 70% reviennent
- **Découverte de contenu** : Objectif 30% de nouveaux créateurs découverts
- **Viralité** : Objectif 10% des publications atteignent > 10K vues

---

## 🔄 Mise à Jour Continue

### Fréquence de Recalcul :
- **Scores d'engagement** : Toutes les 5 minutes
- **Scores de fraîcheur** : Toutes les heures
- **Scores de viralité** : Toutes les 15 minutes
- **Scores de personnalisation** : À chaque chargement utilisateur

### Optimisations :
- Utiliser des index Firestore pour les requêtes fréquentes
- Mettre en cache les scores calculés
- Utiliser des workers en arrière-plan pour les calculs lourds

---

## 🎯 Exemple de Calcul

### Publication Exemple :
- **Likes** : 500
- **Commentaires** : 50
- **Partages** : 20
- **Vues** : 2000
- **Âge** : 2 heures
- **Type** : Vidéo (60 secondes)
- **Taux rétention** : 75%

### Calcul :
1. **Engagement** : (500×2) + (50×3) + (20×5) + (2000×0.1) + (75×100) = 1000 + 150 + 100 + 200 + 7500 = **8950 points**
2. **Fraîcheur** : 800 × (1/(1+2/24)) = **769 points**
3. **Viralité** : Croissance 30% + Ratio 0.285 = **450 points**
4. **Qualité** : Vidéo + Caption + Localisation = **150 points**
5. **Personnalisation** : Utilisateur suivi = **100 points**

### Score Total Pondéré :
(8950×0.40) + (769×0.25) + (450×0.20) + (150×0.10) + (100×0.05) = **3580 + 192 + 90 + 15 + 5 = 3882 points**

Cette publication serait **hautement prioritaire** dans le fil d'actualité !

---

## 📝 Notes Finales

- L'algorithme doit être **transparent** et **équitable**
- Éviter la **bulle de filtres** : mélanger contenu diversifié
- **Tester et ajuster** régulièrement selon les métriques
- **Respecter la vie privée** : pas de tracking excessif
- **Favoriser les nouveaux créateurs** : bonus pour premiers posts

