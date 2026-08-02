# ANDORRE 360 — Sécurité et cohérence de publication

Date de cadrage : 2 août 2026

Base de référence : `audit/studio-v4` au commit `0f4dd6945d25c5fc8329121fd7d838dc54b1f3b6`

Statut : proposition à valider avant développement

## 1. Objet

Ce chantier sécurise les fonctions déjà livrées et applique une règle de publication unique sur l’ensemble du site.

Il n’ajoute aucune nouvelle fonctionnalité métier et ne modifie pas la présentation validée du Fil info. Il doit être livré dans une PR autonome avant tout nouveau chantier produit.

## 2. Périmètre

Le lot couvre exclusivement :

1. l’autorisation des API et actions d’écriture ;
2. les barrières de publication publiques ;
3. l’indépendance entre les rubriques et le Fil info ;
4. la date publique des articles français ;
5. la fraîcheur de l’accueil et des rubriques ;
6. les tests de sécurité et de non-exposition ;
7. la suppression des pages administratives de test.

Sont exclus de ce lot :

- toute refonte visuelle ;
- les auteurs, tags et paramètres ;
- la consolidation des composants de rubriques ;
- l’ajout de nouvelles fonctions éditoriales ;
- le choix de l’hébergement de production ;
- la suppression des anciennes branches Git.

## 3. Règles à valider

### Publication française

Un article est public uniquement si :

```text
published = true
ET
editorialStatus = PUBLISHED
```

Cette règle s’applique à :

- la page d’accueil ;
- toutes les rubriques ;
- la fiche article française ;
- les sélections éditoriales ;
- les contenus à la une ;
- le Fil info.

### Publication multilingue

Une traduction CA ou ES exige en plus :

```text
ArticleTranslation.status = PUBLISHED
```

Les barrières multilingues déjà livrées doivent être conservées.

### Visibilité du Fil info

`filInfoVisible` contrôle uniquement la présence dans le Fil info.

Un article retiré du Fil info doit rester accessible :

- sur sa fiche publique ;
- dans sa rubrique ;
- sur la page d’accueil s’il est sélectionné par les règles éditoriales.

### Date publique

`publishedAt` est la date publique principale.

`createdAt` n’est utilisé qu’en repli lorsqu’une ancienne donnée ne possède pas encore de `publishedAt`.

## 4. Étape 1 — Autorisation ADMIN

### Objectif

Empêcher toute écriture sans administrateur actif authentifié.

### Travaux

- créer un garde serveur central et réutilisable ;
- distinguer l’absence de session du refus de rôle ;
- protéger les API de catégories ;
- protéger la création de vidéos externes ;
- protéger les API de médias ;
- protéger les téléversements d’images et de fichiers ;
- protéger les actions des articles ;
- protéger les actions de workflow ;
- protéger les réglages du Fil info ;
- protéger les actions de traduction ;
- protéger les actions des Sources ;
- protéger la création depuis une Observation ;
- protéger les actions de composition et de diffusion.

Les routes publiques de lecture restent accessibles sans authentification.

### Réponses attendues

- API sans session : `401 Unauthorized` ;
- API avec utilisateur non autorisé : `403 Forbidden` ;
- action serveur refusée : erreur contrôlée, sans mutation ;
- administrateur actif : action autorisée.

### Critère de validation

Aucune écriture Prisma ni aucun fichier média ne sont créés, modifiés ou supprimés lors d’un refus d’autorisation.

## 5. Étape 2 — Barrière publique unique

### Objectif

Appliquer `published=true` et `editorialStatus=PUBLISHED` partout.

### Travaux

- centraliser le filtre public français ;
- sécuriser `getPublishedArticles()` ;
- sécuriser `getFeaturedArticle()` ;
- sécuriser la fiche `/article/[slug]` ;
- vérifier les sélections de l’accueil ;
- vérifier toutes les pages de rubrique ;
- conserver les filtres plus stricts du Fil info ;
- conserver les filtres CA/ES existants ;
- harmoniser les compteurs « Publiés » de l’administration.

### Critère de validation

Un article non approuvé n’apparaît sur aucune route publique, même si son ancien booléen `published` vaut `true`.

## 6. Étape 3 — Indépendance des rubriques

### Objectif

Retirer `filInfoVisible` des requêtes générales.

### Travaux

- séparer la requête publique de rubrique de la requête du Fil info ;
- réserver `filInfoVisible=true` aux seules requêtes du Fil info ;
- contrôler Actualité, Économie, Société, Politique, Immobilier, International, Sports, Culture, Montagne et Lifestyle ;
- vérifier que le retrait du Fil info ne provoque aucun doublon involontaire ailleurs.

### Critère de validation

Un article publié et approuvé reste visible dans sa rubrique après avoir été retiré du Fil info.

## 7. Étape 4 — Date de publication française

### Objectif

Afficher et référencer la véritable date de publication.

### Travaux

- remplacer l’emploi systématique de `createdAt` dans la fiche française ;
- utiliser `publishedAt ?? createdAt` dans l’affichage ;
- utiliser la même valeur dans les métadonnées SEO ;
- vérifier que les corrections n’altèrent pas la date ;
- conserver le fuseau `Europe/Andorra` lorsque l’heure est affichée.

### Critère de validation

La date visible, la date SEO et la chronologie du Fil info correspondent à la même publication réelle.

## 8. Étape 5 — Fraîcheur des pages

### Objectif

Faire apparaître les décisions éditoriales sans nouveau build.

### Travaux

- rendre la page d’accueil suffisamment dynamique ;
- rendre toutes les rubriques suffisamment dynamiques ;
- ajouter une invalidation ciblée après publication ou dépublication ;
- invalider après modification d’une sélection éditoriale ;
- limiter les requêtes pour ne pas charger tout l’historique ;
- conserver le comportement dynamique du Fil info ;
- vérifier les états vides.

### Décision recommandée

Utiliser une revalidation ciblée après mutation, complétée par un rendu dynamique pour les pages où l’immédiateté est nécessaire.

### Critère de validation

Un nouvel article publié apparaît sur les pages concernées sans redéploiement de l’application.

## 9. Étape 6 — Tests critiques

### Tests d’autorisation

- refus sans session ;
- refus d’un utilisateur inactif ;
- refus d’un rôle non `ADMIN` ;
- autorisation d’un administrateur actif ;
- aucune mutation lors d’un refus.

### Tests de non-exposition

- `published=false` et `PUBLISHED` : absent ;
- `published=true` et `DRAFT` : absent ;
- `published=true` et `APPROVED` : absent ;
- `published=true` et `PUBLISHED` : visible ;
- traduction non publiée : absente ;
- article retiré du Fil info : absent du fil mais présent dans sa rubrique ;
- article à la une non approuvé : absent ;
- date française fondée sur `publishedAt`.

### Tests de fraîcheur

- invalidation après publication ;
- invalidation après dépublication ;
- invalidation après changement éditorial ;
- aucune requête publique non bornée.

### Critère de validation

Une régression d’autorisation ou de visibilité est détectée automatiquement avant fusion.

## 10. Étape 7 — Suppression des pages de test

### Travaux

- supprimer `/admin/V4` ;
- supprimer `/admin/publications/test` ;
- retirer leurs liens éventuels de la navigation ;
- vérifier qu’aucune fonction de production ne dépend de ces routes ;
- conserver les composants réellement utilisés par l’éditeur principal ;
- vérifier le build après suppression.

### Critère de validation

Aucun outil de test accessible par URL ne peut modifier les données éditoriales.

## 11. Découpage recommandé

Le chantier reste un lot fonctionnel unique, mais peut être livré en quatre PR techniques successives si la taille du patch devient trop importante :

1. `fix/admin-write-authorization`
2. `fix/publication-visibility-rules`
3. `feat/public-page-revalidation`
4. `test/security-publication-hardening`

La suppression des pages de test peut être incluse dans la première ou la dernière PR.

La branche de sécurité doit être fusionnée avant la cohérence publique. La cohérence publique doit être fusionnée avant la fraîcheur des pages.

## 12. Validation de chaque PR

```bash
npx prisma generate
npx prisma migrate status
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git status -sb
```

Ajouter pour chaque PR :

- tests ciblés du lot ;
- suite complète ;
- contrôle visuel ordinateur et mobile si le public est modifié ;
- contrôle manuel sans session et avec session ADMIN si l’autorisation est modifiée ;
- aucune nouvelle erreur ni aucun nouvel avertissement ESLint.

## 13. Définition de terminé

Le chantier est terminé lorsque :

- toutes les écritures exigent un administrateur actif ;
- toutes les pages publiques appliquent la même barrière de publication ;
- `filInfoVisible` n’affecte plus les rubriques ;
- la fiche française utilise `publishedAt` ;
- l’accueil et les rubriques reflètent les publications sans redéploiement ;
- les refus et non-expositions sont couverts par des tests ;
- les deux pages administratives de test ont disparu ;
- les migrations, les tests, TypeScript, ESLint et le build réussissent ;
- le dépôt est propre et synchronisé après fusion.

## 14. Première action

Fusionner cette feuille de route dans une PR documentaire autonome, puis commencer par `fix/admin-write-authorization`.
