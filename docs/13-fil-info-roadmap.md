# ANDORRE 360 — Feuille de route du Fil info

Date de cadrage : 2 août 2026

Statut : chantier terminé ; lots 0 à 8 livrés, validés et documentés

Date de clôture : 2 août 2026

Référence Git de clôture : `audit/studio-v4` au commit `0f4dd6945d25c5fc8329121fd7d838dc54b1f3b6`

Référence d’exploitation : `docs/14-fil-info-workflow.md`

## Objet

Cette fiche définit la transformation progressive de la page `/fil-info` en un véritable flux chronologique d’actualité.

La page actuelle possède une présentation éditoriale solide, mais son fonctionnement repose essentiellement sur une répartition visuelle des articles publiés. Le chantier doit corriger les anomalies existantes, rendre les informations récentes immédiatement accessibles et préparer un fonctionnement durable, administrable et multilingue.

## État de départ avant chantier

Le Fil info actuel :

- sélectionne les articles publiés de la catégorie `ACTUALITÉ` ;
- les classe selon `updatedAt` ;
- utilise le premier article comme sujet principal ;
- répartit les suivants entre les blocs « brèves », « À suivre » et « À retenir » ;
- n’affiche le véritable bloc chronologique qu’à partir du treizième article ;
- utilise l’heure de dernière modification comme heure affichée ;
- ne se rafraîchit pas automatiquement dans le navigateur ;
- produit uniquement des liens vers les articles français.

Les principales limites identifiées sont :

- la remontée d’un ancien article après une simple correction ;
- le chevauchement de certains contenus entre « À suivre » et « À retenir » ;
- un Fil info vide lorsque moins de treize articles sont disponibles ;
- l’emploi d’expressions comme « En direct » sans actualisation automatique ;
- l’absence de pagination et de limite claire ;
- la non-utilisation du champ `contentType` ;
- l’absence de prise en charge des versions catalane et espagnole.

## Cible fonctionnelle

`/fil-info` doit devenir un flux chronologique prioritaire, complété par une sélection éditoriale secondaire.

Les règles recommandées sont les suivantes :

- l’ordre chronologique repose sur `publishedAt` et non sur `updatedAt` ;
- une correction ne change pas automatiquement la position d’une publication ;
- seuls les contenus effectivement publiés apparaissent ;
- une information peut être épinglée explicitement ;
- les formats `ALERTE`, `BRÈVE` et `ARTICLE` possèdent des rendus distincts ;
- chaque contenu conserve une page publique dans la première version ;
- le flux français est stabilisé avant l’extension aux langues catalane et espagnole.

## Feuille de route

### Lot 0 — Règles éditoriales

Objectif : formaliser les règles avant toute modification structurelle.

Travaux :

- confirmer les formats `ALERTE`, `BRÈVE` et `ARTICLE` ;
- définir les longueurs éditoriales recommandées ;
- confirmer le rôle de `publishedAt` ;
- définir la durée et la priorité d’un épinglage ;
- préciser les conditions de retrait du fil ;
- documenter la relation entre une brève et un article complet.

Critère de validation : les règles peuvent être appliquées sans interprétation différente entre l’administration et la page publique.

### Lot 1 — Stabilisation de la sélection des données

Objectif : corriger les anomalies certaines sans refondre immédiatement la page.

Travaux :

- remplacer le tri par `updatedAt` par un tri fondé sur `publishedAt` ;
- supprimer les doublons entre les différentes sélections ;
- rendre le flux visible même avec peu de publications ;
- limiter le nombre de contenus chargés ;
- fiabiliser le filtre de catégorie ;
- ajouter des tests unitaires de sélection, de tri et d’absence de doublon.

Critère de validation : une correction éditoriale ne modifie pas l’ordre du fil et chaque publication n’apparaît qu’une seule fois dans les blocs concernés.

### Lot 2 — Nouvelle structure chronologique

Objectif : rendre les dernières informations immédiatement visibles.

Structure recommandée :

1. titre et date du Fil info ;
2. alerte épinglée éventuelle ;
3. flux chronologique ;
4. sélection éditoriale ;
5. contenus « À suivre » ;
6. commande « Afficher plus ».

Le flux doit apparaître directement après l’en-tête sur mobile.

Critère de validation : l’utilisateur accède aux dernières informations sans devoir traverser l’ensemble des sélections éditoriales.

### Lot 3 — Formats éditoriaux réels

Objectif : faire dépendre le rendu du type de contenu plutôt que de sa position.

Rendus recommandés :

- `ALERTE` : heure, titre court et lien éventuel ;
- `BRÈVE` : titre, résumé concis et lien vers sa page ;
- `ARTICLE` : carte complète avec image, résumé et lien.

Critère de validation : deux contenus de types différents sont présentés différemment, quel que soit leur rang dans le flux.

### Lot 4 — Administration

Objectif : donner à l’équipe éditoriale un contrôle explicite sur le Fil info.

Travaux :

- sélectionner le type de contenu ;
- prévisualiser le rendu dans le fil ;
- épingler ou désépingler une information ;
- retirer une information du fil sans supprimer son contenu ;
- contrôler la date de publication ;
- empêcher l’exposition d’un brouillon ou d’un contenu non approuvé.

Critère de validation : toutes les décisions visibles dans le Fil info résultent d’une règle serveur ou d’une action éditoriale explicite.

### Lot 5 — Pagination et actualisation

Objectif : maintenir un flux utilisable lorsque le volume augmente.

Travaux :

- afficher initialement les 20 à 30 entrées les plus récentes ;
- charger progressivement les entrées suivantes ;
- vérifier les nouveautés toutes les 30 à 60 secondes ;
- proposer une commande « Nouvelles informations disponibles » ;
- éviter tout déplacement brutal pendant la lecture ;
- ajouter les index nécessaires en base de données.

Critère de validation : la page ne charge pas l’historique complet et l’arrivée de nouvelles informations ne perturbe pas la lecture en cours.

### Lot 6 — Qualité de la page

Objectif : finaliser la robustesse technique et l’expérience utilisateur.

Travaux :

- regrouper correctement les entrées par date ;
- ajouter les états vide, chargement et erreur ;
- améliorer le rendu mobile et desktop ;
- utiliser une structure de liste accessible ;
- respecter `prefers-reduced-motion` ;
- prévoir un visuel de remplacement ;
- ajouter un titre et une description SEO spécifiques ;
- mesurer et optimiser les requêtes.

Critère de validation : la page est lisible, accessible et stable sur les principaux formats d’écran.

### Lot 7 — Extension multilingue

Objectif : décliner le flux pour les versions française, catalane et espagnole.

Travaux :

- ajouter les routes localisées ;
- n’afficher que les traductions au statut `PUBLISHED` ;
- produire les liens et slugs dans la langue active ;
- localiser les dates et libellés ;
- gérer `canonical`, `hreflang` et `x-default` ;
- masquer proprement une langue lorsqu’aucune traduction publiée n’existe.

Critère de validation : aucun brouillon ou contenu non approuvé n’est exposé par une route localisée.

### Lot 8 — Validation et documentation

Objectif : sécuriser la livraison et transmettre le fonctionnement.

Travaux :

- tests unitaires des règles de sélection et de classement ;
- tests d’intégration avec une base SQLite isolée ;
- tests des statuts de publication ;
- tests de pagination et de détection des nouveautés ;
- vérification du build ;
- contrôle visuel mobile et desktop ;
- documentation du workflow éditorial ;
- fusion progressive des changements.

Critère de validation : les tests et le build réussissent, et le fonctionnement peut être utilisé sans connaissance du code.

## Découpage recommandé en pull requests

1. `fix/fil-info-data-selection`
2. `feat/fil-info-chronological-layout`
3. `feat/fil-info-content-types`
4. `feat/fil-info-admin-controls`
5. `feat/fil-info-pagination-refresh`
6. `feat/fil-info-multilingual`
7. `docs/fil-info-workflow`

Chaque pull request doit rester autonome, testable et réversible.

## Ordre de mise en œuvre

Le chantier doit commencer par le lot 1 après validation des règles du lot 0. Les lots 2 et 3 construisent ensuite le nouveau cœur du Fil info. Le contrôle administratif précède la pagination et l’actualisation. L’extension multilingue intervient uniquement après stabilisation du flux français.

## Définition globale de terminé

Le chantier sera considéré comme terminé lorsque :

- le Fil info est classé par date réelle de publication ;
- les dernières informations sont visibles immédiatement ;
- aucun contenu n’est dupliqué involontairement ;
- les formats éditoriaux pilotent réellement le rendu ;
- l’administration contrôle la présence et la priorité des entrées ;
- le volume est maîtrisé par pagination ;
- l’actualisation ne perturbe pas la lecture ;
- les versions FR, CA et ES respectent le workflow de publication ;
- les tests, le build, le contrôle visuel et la documentation sont validés.

## État de clôture

Les lots 0 à 8 sont fusionnés. Le fonctionnement livré et la procédure d’exploitation sont décrits dans `docs/14-fil-info-workflow.md`.

Toute évolution ultérieure du Fil info doit partir de la branche `audit/studio-v4`, préserver les règles de publication sécurisées et être traitée comme un nouveau chantier autonome.
