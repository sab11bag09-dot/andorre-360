# ANDORRE 360 — Workflow éditorial du Fil info

Date de référence : 2 août 2026

Périmètre : `/fil-info`, `/ca/fil-info` et `/es/fil-info`

## 1. Objet

Cette fiche décrit le fonctionnement livré du Fil info, son utilisation quotidienne, ses barrières de publication et sa procédure de validation. Elle complète la feuille de route `docs/13-fil-info-roadmap.md`.

## 2. Conditions d’apparition

Un article français apparaît uniquement si toutes les conditions suivantes sont réunies :

- catégorie exacte `ACTUALITÉ` ;
- `published = true` ;
- `editorialStatus = PUBLISHED` ;
- `filInfoVisible = true`.

Une version catalane ou espagnole exige en plus une traduction de la langue concernée au statut `PUBLISHED`. Un brouillon, une traduction en révision ou une traduction seulement approuvée ne sont jamais exposés. Si aucune traduction publiée n’existe dans une langue, l’article est absent de cette version du flux ; le contenu français n’est pas utilisé comme remplacement.

## 3. Ordre chronologique

L’ordre public utilise successivement :

1. `publishedAt` décroissant ;
2. `createdAt` décroissant ;
3. `id` décroissant.

Une correction de titre ou de contenu ne change donc pas la position de l’article. La date ne change que par une action administrative explicite.

## 4. Formats

`contentType` décrit la nature générale du contenu. `filInfoFormat` pilote uniquement sa présentation dans le Fil info.

| Valeur | Libellé FR | Usage |
| --- | --- | --- |
| `ALERT` | Alerte | Information prioritaire à forte visibilité |
| `BRIEF` | Brève | Information concise avec résumé |
| `ARTICLE` | Article | Contenu complet, éligible à « La sélection » |

Tous les formats conservent une page publique. Les règles de normalisation sont centralisées dans `lib/fil-info-format.ts`.

## 5. Réglages administratifs

Les réglages du Fil info disposent d’une action serveur dédiée. Leur enregistrement ne doit jamais dépublier l’article ni modifier implicitement son statut éditorial.

- un seul contenu peut être épinglé globalement ;
- un nouvel épinglage retire automatiquement l’ancien ;
- retirer un contenu du Fil info ne dépublie pas sa page ;
- seuls les articles publiés et au statut `PUBLISHED` peuvent être visibles ou épinglés ;
- la date de publication est modifiée uniquement par une action explicite ;
- la protection optimiste refuse l’écriture si une autre modification plus récente existe.

## 6. Pagination et nouveautés

- 20 articles sont chargés initialement ;
- le bouton « Afficher plus » charge des groupes de 20 ;
- le curseur combine `publishedAt`, `createdAt` et `id` ;
- la présence de nouveautés est contrôlée toutes les 45 secondes ;
- les nouveautés ne sont insérées qu’après une action de l’utilisateur afin de ne pas déplacer sa lecture ;
- les contenus épinglés ne sont pas dupliqués dans les pages suivantes.

Les API `/api/fil-info` et `/api/fil-info/updates` acceptent `locale=fr`, `locale=ca` ou `locale=es`. Toute autre valeur est refusée.

## 7. Multilingue et SEO

| Langue | Route du flux | Route d’un article |
| --- | --- | --- |
| Français | `/fil-info` | `/article/[slug]` |
| Catalan | `/ca/fil-info` | `/ca/article/[slug]` |
| Espagnol | `/es/fil-info` | `/es/article/[slug]` |

Les titres, descriptions, dates, formats, actions et liens utilisent la langue active. Chaque page déclare son URL canonique. Les liens `hreflang` CA ou ES ne sont produits que lorsqu’au moins une traduction publiée et publiquement admissible existe ; `x-default` pointe vers `/fil-info`.

## 8. États et accessibilité

La page possède des états de chargement, d’erreur avec nouvelle tentative et de flux vide. Les listes chronologiques utilisent une structure ordonnée et des titres de groupe par date. Les focus clavier sont visibles et les animations sont neutralisées lorsque `prefers-reduced-motion` est activé. Une image de remplacement Andorre 360 est affichée si aucun média n’est disponible.

## 9. Procédure éditoriale

1. Créer ou modifier l’article.
2. Choisir le format du contenu et le format du Fil info.
3. Classer l’article dans `ACTUALITÉ`.
4. Faire progresser le statut éditorial jusqu’à `PUBLISHED` et publier l’article.
5. Ouvrir les réglages du Fil info pour choisir visibilité, épinglage et date.
6. Enregistrer les réglages dédiés.
7. Pour CA/ES, publier séparément chaque traduction validée.
8. Contrôler les routes publiques concernées.

## 10. Contrôles avant fusion

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

Les avertissements ESLint historiques hors Fil info ne bloquent pas la livraison, mais aucune nouvelle erreur ni aucun nouvel avertissement ne doit être ajouté.

Le contrôle visuel couvre au minimum :

- `/fil-info` sur ordinateur et mobile ;
- `/ca/fil-info` et `/es/fil-info` ;
- une alerte, une brève et un article ;
- l’épinglage unique ;
- « Afficher plus » lorsque plus de 20 contenus sont admissibles ;
- l’absence d’un brouillon et d’une traduction non publiée ;
- une image manquante ;
- les états vide, chargement et erreur lorsque cela est possible.

## 11. Incident Prisma et serveur local

Après une modification du schéma Prisma :

```bash
npx prisma generate
rm -rf .next
npm run dev
```

Toujours utiliser le port annoncé par Next.js. Si un ancien serveur occupe le port 3000, l’arrêter avant de relancer afin de ne pas utiliser un client Prisma obsolète.

## 12. Déploiement

SQLite exige un stockage persistant en production ; sinon, utiliser une base gérée. Le déploiement multilingue reste soumis à `docs/11-multilingual-deployment.md`, notamment au démarrage avec `MULTILINGUAL_PUBLICATION_ENABLED=false`, à la configuration des secrets et à la procédure de retour arrière.

## 13. Fichiers principaux

| Fichier | Responsabilité |
| --- | --- |
| `app/(public)/fil-info/page.tsx` | Page française et métadonnées |
| `app/[locale]/fil-info/page.tsx` | Pages CA/ES et métadonnées localisées |
| `components/fil-info/FilInfoTimeline.tsx` | Flux chronologique et groupes de date |
| `components/fil-info/FilInfoPagination.tsx` | Pagination et notification des nouveautés |
| `actions/fil-info.ts` | Réglages administratifs atomiques |
| `lib/articles.ts` | Requête française et chronologie |
| `lib/fil-info-localized.ts` | Requête CA/ES avec barrière de publication |
| `lib/fil-info-locale.ts` | Routes et langues publiques sans dépendance serveur |
| `lib/fil-info.ts` | Répartition sans doublon |
| `lib/fil-info-format.ts` | Formats et libellés |
| `prisma/schema.prisma` | Modèle, visibilité, épinglage et index |

## 14. Définition de terminé

Le Fil info est considéré comme exploitable lorsque la suite complète, TypeScript, ESLint et le build réussissent, que les migrations sont à jour, que les routes FR/CA/ES ont été contrôlées, et que le dépôt est propre après fusion sur `audit/studio-v4`.
