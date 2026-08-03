# ANDORRE 360 — État consolidé et préparation de la recette

Date de référence : 3 août 2026

Branche de référence : `audit/studio-v4`

Commit de référence : `c3b8a07c23839ff455f469a3db3cf59d9005c18f`

Statut : base fonctionnelle, testée et sécurisée ; recette distante non engagée

## 1. Objet

Cette fiche constitue le point de reprise officiel après la clôture des chantiers Fil info et Sécurité et cohérence de publication.

Elle distingue ce qui est livré dans le dépôt, ce qui reste fermé par configuration et ce qui doit être décidé avant toute mise en ligne.

## 2. Chantiers livrés

### Socle éditorial

- authentification et autorisation administrateur ;
- administration des articles, médias, catégories et sources ;
- création d’un brouillon depuis une observation ;
- workflow éditorial jusqu’à `PUBLISHED` ;
- composition de l’accueil et des rubriques ;
- pages publiques françaises.

### Publication multilingue

- versions catalane et espagnole indépendantes ;
- génération, correction, relecture, approbation, publication et archivage ;
- slugs localisés et pages publiques ;
- métadonnées SEO, canonical et `hreflang` ;
- coupe-circuit `MULTILINGUAL_PUBLICATION_ENABLED` ;
- procédure de déploiement et de retour arrière.

Le code est livré, mais l’ouverture en production n’a pas été effectuée.

### Fil info

Les lots 0 à 8 sont terminés : chronologie, formats, contrôles administratifs, épinglage unique, retrait sans dépublication, pagination, détection des nouveautés, qualité, accessibilité, multilingue et documentation.

La référence d’exploitation est `docs/14-fil-info-workflow.md`.

### Sécurité et cohérence de publication

- toutes les écritures sensibles exigent un administrateur actif ;
- un article français est public uniquement avec `published = true` et `editorialStatus = PUBLISHED` ;
- une traduction exige en plus le statut `PUBLISHED` ;
- `filInfoVisible` ne contrôle que le Fil info ;
- la date publique utilise `publishedAt`, puis `createdAt` en repli ;
- l’accueil et les rubriques reflètent les mutations sans nouveau build ;
- les anciennes pages administratives de test ont été supprimées.

## 3. Référence de validation

À la clôture du chantier sécurité :

- 25 migrations Prisma appliquées ;
- 38 fichiers de tests réussis ;
- 205 tests réussis ;
- TypeScript sans erreur ;
- ESLint sans nouvelle erreur ;
- build Next.js 16.2.10 réussi ;
- aucune pull request ni issue ouverte ;
- branche locale propre et synchronisée après fusion.

Les six avertissements ESLint historiques restent hors du périmètre fonctionnel et ne bloquent pas le build.

## 4. Fonctions encore fermées ou non validées à distance

- la publication multilingue doit rester désactivée au premier déploiement ;
- un appel OpenAI réel n’a pas été validé faute de crédits API ;
- aucune infrastructure de production n’a été choisie ;
- aucune restauration de sauvegarde n’a encore été testée sur l’infrastructure cible ;
- les parcours publics n’ont pas encore été validés sous l’URL HTTPS définitive.

## 5. Décision d’infrastructure obligatoire

Le projet utilise SQLite avec `better-sqlite3`. Deux voies sont possibles :

1. conserver SQLite sur une machine unique avec volume persistant, sauvegardes et restauration testée ;
2. migrer vers une base gérée compatible avec Prisma avant un hébergement serverless ou distribué.

Un système de fichiers éphémère est incompatible avec la base actuelle. Aucun déploiement de production ne doit commencer avant cette décision.

## 6. Préparation d’un environnement de recette

L’environnement de recette doit être distinct du poste local et de la future production.

Préparer :

- une URL HTTPS dédiée ;
- un stockage persistant ou une base gérée ;
- `AUTH_SECRET` ;
- `NEXT_PUBLIC_SITE_URL` ;
- un compte administrateur de recette ;
- une base issue d’une copie contrôlée ou d’un jeu de données non sensible ;
- `MULTILINGUAL_PUBLICATION_ENABLED=false` ;
- une procédure de sauvegarde et de restauration ;
- des journaux applicatifs consultables.

La clé OpenAI est facultative pour la première recette. Elle ne doit être ajoutée qu’après attribution de crédits et validation du budget d’usage.

## 7. Ordre recommandé pour la recette

1. choisir l’infrastructure ;
2. créer l’environnement et configurer les secrets ;
3. déployer avec la publication multilingue fermée ;
4. appliquer les migrations avec `prisma migrate deploy` ;
5. exécuter les contrôles de santé et les parcours administratifs ;
6. vérifier l’accueil, les rubriques, les fiches et les trois Fils info ;
7. tester une sauvegarde puis une restauration sur une base séparée ;
8. ajouter éventuellement OpenAI et générer une seule traduction de recette ;
9. activer temporairement la publication multilingue ;
10. publier, contrôler puis archiver une traduction ;
11. refermer le coupe-circuit jusqu’à la décision d’ouverture.

Le détail du déploiement multilingue reste défini dans `docs/11-multilingual-deployment.md`.

## 8. Contrôles avant chaque déploiement

```bash
git status -sb
npx prisma generate
npx prisma migrate status
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Vérifier également qu’aucun secret, fichier `.env` réel ou base SQLite locale n’est suivi par Git.

## 9. Chantiers métier non engagés

La base actuelle ne constitue pas encore l’Information Operating System complet décrit dans la vision. Restent notamment à concevoir et livrer :

- consolidation de plusieurs observations ;
- Claims, Evidence et Facts ;
- Story Engine ;
- traçabilité éditoriale complète ;
- agents journaliste, vérification factuelle et SEO avancé ;
- publication autonome gouvernée par les règles éditoriales.

Ces chantiers doivent commencer après la recette du socle actuel ou faire l’objet d’une décision explicite de priorité.

## 10. Prochaine décision

La prochaine décision n’est pas un choix de fonctionnalité. Elle consiste à choisir entre :

- une recette rapide sur une machine unique avec SQLite persistant ;
- une préparation plus longue avec migration préalable vers une base gérée.

Une fois cette décision prise, créer une feuille de route d’infrastructure autonome avec critères de coût, sauvegarde, sécurité, supervision et retour arrière.
