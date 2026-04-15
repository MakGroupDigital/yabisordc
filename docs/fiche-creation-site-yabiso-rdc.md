# Fiche De Creation Du Site

## 1. Identite Du Projet

- Nom du produit : `Ya Biso RDC`
- Nature actuelle : application web/mobile type super-app locale, orientee decouverte, services, contenus et transactions
- Territoire principal : `Republique Democratique du Congo`
- Langue principale : `francais`
- Promesse produit : centraliser dans une seule experience la restauration, l'hebergement, la mobilite, le tourisme, les evenements, la securite, les urgences et des interactions sociales
- Positionnement observe : melange de `guide local`, `marketplace de services`, `mini reseau social`, `assistant de decouverte` et `application transactionnelle`

## 2. Vision A Retenir Pour Le Site

Le site a creer doit presenter `Ya Biso RDC` comme une plateforme digitale congolaise moderne qui aide les utilisateurs a :

- explorer des lieux et services
- reserver ou commander
- decouvrir des offres et recommandations
- consulter des contenus communautaires
- gerer favoris, profil, commandes et reservations
- utiliser des fonctions locales comme la geolocalisation, le partage, la navigation et les paiements

Le site ne doit pas etre une simple landing page statique. Il peut etre pense en `site produit + portail de services + pages categories + pages transactionnelles`.

## 3. Cibles Principales

- habitants des grandes villes de RDC
- diaspora cherchant des services ou lieux fiables
- touristes ou visiteurs
- restaurants, hotels, organisateurs, lieux de fete, acteurs touristiques
- utilisateurs mobiles recherchant une experience rapide et simple

## 4. Fonctionnalites Observees Dans L App

### 4.1 Acces Et Compte

- inscription par email
- connexion par email
- connexion Google
- authentification telephone via Firebase + reCAPTCHA
- gestion du profil utilisateur
- edition du nom et de la photo de profil
- redirection apres connexion

### 4.2 Navigation Principale

Navigation basse actuelle :

- `Explorer`
- `Commandes`
- `Reservations`
- `Favoris`
- `Profil`

### 4.3 Univers Explorer

Categories observees :

- `Restaurant`
- `Hebergement`
- `Mobilite`
- `Tourisme`
- `Salle de fete / jeux`
- `Urgence medicale`
- `Evenements`
- `Securite`

Autres univers annexes presents dans le code :

- `Traducteur`
- `Livreur`
- `Guide touristique`

### 4.4 Services Metiers

- recherche de lieux et categories
- filtres geographiques sur base des provinces / villes / territoires RDC
- geolocalisation utilisateur
- favoris locaux et favoris utilisateur
- likes / bookmarks sur contenus
- partage de contenus et d'offres
- navigation cartographique
- pages detaillees de restauration, hebergement, tourisme, evenements, urgences
- paiement en ligne
- facture / recu

### 4.5 Paiements

Integrations observees :

- `CinetPay`
- `PayPal`

Usages :

- creation de paiement
- retour de paiement
- verification de statut
- capture de commande

### 4.6 Cartographie Et Localisation

- geolocalisation navigateur / appareil
- memorisation de la permission de localisation cote app
- carte leaflet / openstreetmap
- calcul d'itineraire et navigation
- logique de tourisme avec sites geolocalises et guidage

### 4.7 Dimension Sociale / Contenu

- fil de contenus / posts
- hashtags
- likes
- favoris
- commentaires
- partage
- profil utilisateur avec statistiques

## 5. Architecture De Pages Recommandee Pour Le Site

### 5.1 Pages Institutionnelles

- `Accueil`
- `A propos`
- `Comment ca marche`
- `Services`
- `Partenaires`
- `Contact`
- `FAQ`

### 5.2 Pages Produit / Acquisition

- `Explorer la RDC`
- `Restaurants`
- `Hebergements`
- `Tourisme`
- `Evenements`
- `Mobilite`
- `Urgence et securite`
- `Favoris`
- `Commandes`
- `Reservations`

### 5.3 Pages Conversion

- `Connexion / Inscription`
- `Devenir partenaire`
- `Publier une offre`
- `Reserver`
- `Commander`
- `Payer`

### 5.4 Pages Detail

- fiche restaurant
- fiche hotel / appartement
- fiche evenement
- fiche site touristique
- fiche lieu / salle

## 6. Charte Visuelle A Respecter

### 6.1 Palette Principale

Palette explicitement definie dans `src/app/globals.css` :

- `Orange Ya Biso` : `#FF8800`
- `Bleu Congo` : `#003366`
- `Or Mineral / Jaune` : `#FFCC00`
- `Blanc Casse` : `#F5F5F5`
- `Gris Moyen` : `#555555`
- `Vert Nature / Virunga` : `#339966`

### 6.2 Usage Recommande Des Couleurs

- bleu : confiance, structure, navigation, zones premium
- orange : action, CTA, energie, accent principal
- jaune : surlignage, badges, etats actifs, touches lumineuses
- blanc casse : fond principal
- gris : textes secondaires
- vert : usages nature / tourisme / environnement si necessaire

Important :

- eviter les couleurs hors charte
- eviter les palettes aleatoires
- garder une coherence forte mobile / desktop / site

### 6.3 Typographie

Typographies observees :

- `Inter` pour le corps de texte
- `Montserrat` pour les titres / headline

Recommandation site :

- conserver `Montserrat` pour les titres forts
- conserver `Inter` pour les contenus, UI et descriptions

### 6.4 Ton Visuel

Le site doit communiquer :

- modernite
- fierte locale
- confiance
- utilite quotidienne
- accessibilite mobile-first

Le rendu ne doit pas paraitre generique. Il doit evoquer une marque africaine contemporaine, structurante, premium mais simple d'acces.

## 7. Elements De Marque

- nom : `Ya Biso RDC`
- logo app disponible dans `public/icons/`
- banniere locale disponible dans `public/baniere.png`
- assets explorer disponibles dans `public/explorer-assets/`

## 8. Experience Utilisateur Observee

### 8.1 Principes UX Forts

- acces rapide aux categories
- navigation immediatement reactive
- prechargement des routes
- actions optimistes pour likes / favoris
- orientation mobile-first
- barre de navigation persistante

### 8.2 Gestes Et Comportements

- splash au lancement
- pull-to-refresh sur l'espace home
- geolocalisation au besoin
- preference pour interactions instantanees

## 9. Contenus A Prevoir Pour Le Site

### 9.1 Messages Marketing

- decouvrir la RDC autrement
- commander, reserver, explorer depuis une seule plateforme
- trouver des services fiables autour de soi
- connecter utilisateurs, lieux et opportunites locales

### 9.2 Blocs De Contenu

- hero principal avec image / accroche forte
- categories de services
- avantages utilisateurs
- avantages partenaires
- mise en avant des univers majeurs
- preuves de confiance
- appels a l'action vers inscription / telechargement / demande de partenariat

### 9.3 Preuves De Credibilite

- captures de l'application
- chiffres cles
- temoignages
- partenaires
- villes couvertes

## 10. Stack Technique Actuelle

### 10.1 Frontend

- `Next.js 15`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Framer Motion`
- composants `Radix UI`

### 10.2 Backend / Services

- `Firebase`
- authentification Firebase
- Firestore
- Storage
- routes API Next.js

### 10.3 Paiements

- `CinetPay`
- `PayPal`

### 10.4 Mobile / PWA

- manifest web app
- service worker
- icones PWA
- meta Apple Web App
- presence de `Capacitor`
- presence de `Bubblewrap`

Inference :

Le produit est pense pour pouvoir exister a la fois comme web app et comme experience mobile installable / empaquetable.

## 11. Structure De Navigation Recommandee Pour Le Site

### Header Desktop

- logo
- Explorer
- Restaurants
- Hebergements
- Tourisme
- Evenements
- Partenaires
- Connexion
- CTA principal

### Footer

- presentation
- categories
- aide
- legal
- contact
- reseaux sociaux

## 12. Parcours Utilisateur A Couvrir Sur Le Site

### Parcours 1 : Visiteur

- arrive sur l'accueil
- comprend l'offre
- explore une categorie
- consulte une fiche
- est pousse vers inscription / reservation / commande

### Parcours 2 : Utilisateur Connecte

- se connecte
- accede a Explorer
- ajoute en favoris
- reserve ou commande
- suit ses reservations / commandes

### Parcours 3 : Partenaire

- comprend la valeur business
- remplit un formulaire partenariat
- publie son offre / prend contact

## 13. Contraintes Et Exigences Pour Le Site

- site responsive, priorite mobile
- vitesse de chargement elevee
- architecture SEO propre
- pages categories indexables
- integration d'assets reels de la marque
- coherence stricte avec la charte Ya Biso
- experience claire meme pour des utilisateurs peu technophiles

## 14. Opportunites D Evolution Du Site

- moteur de recherche global
- pages ville / province SEO
- annuaire de services par categorie
- blog / magazine local
- espace partenaires / dashboard
- version bilingue ou multilingue
- integration carte sur pages detail

## 15. Recommandation De Livrables Pour La Creation Du Site

### Livrables UX / UI

- sitemap complet
- wireframes mobile + desktop
- maquettes haute fidelite
- design system minimal
- composants reutilisables

### Livrables Produit / Contenu

- plateforme de marque
- messages marketing
- textes des pages
- argumentaire partenaires
- FAQ

### Livrables Techniques

- architecture Next.js du site
- plan SEO
- schema des pages
- raccord analytics / CRM / formulaire

## 16. Resume Actionnable

Pour creer le site de `Ya Biso RDC`, il faut concevoir une presence digitale qui raconte et vend une `super-app congolaise de services et de decouverte`.

Les piliers a conserver sont :

- la charte `bleu #003366`, `orange #FF8800`, `jaune #FFCC00`
- le ton mobile-first, moderne, utile
- les univers metiers : restauration, hebergement, tourisme, evenements, mobilite, securite
- la promesse de centralisation
- la preuve par les fonctionnalites reelles de l'application

Le site ideal doit donc etre a la fois :

- un site vitrine de marque
- un point d'entree commercial
- un portail d'exploration de categories
- un support de conversion utilisateurs et partenaires

## 17. Sources Internes Etudiees

Cette fiche a ete etablie a partir de l'analyse du code et notamment :

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/auth/page.tsx`
- `src/app/home/layout.tsx`
- `src/components/home/bottom-nav.tsx`
- `src/app/home/explorer/page.tsx`
- `src/app/home/explorer/restauration/page.tsx`
- `src/app/home/explorer/hebergement/page.tsx`
- `src/app/home/explorer/site-touristique/page.tsx`
- `src/app/home/explorer/evenements/page.tsx`
- `src/app/home/favorites/page.tsx`
- `src/app/home/orders/page.tsx`
- `src/app/home/reservations/page.tsx`
- `src/app/home/profile/page.tsx`
- `package.json`
