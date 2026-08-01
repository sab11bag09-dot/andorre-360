# Passation — Pipeline éditorial multilingue

Date : 1 août 2026

## État du projet

Branche :

```text
feature/editorial-pipeline-multilingual
```

Dernier commit fonctionnel :

```text
f3109f7 feat: ajouter l edition des traductions
```

Le dépôt était propre avant la création de ce document.

## Fonctionnalités terminées

Le pipeline permet :

- de créer un article français depuis une observation ;
- de générer les brouillons catalan `CA` et espagnol `ES` ;
- d’éviter les doublons ;
- de régénérer uniquement les traductions modifiables ;
- de protéger les traductions relues, approuvées ou publiées ;
- de modifier le titre, le chapô et le contenu ;
- d’envoyer chaque traduction en relecture ;
- de revenir au brouillon ;
- d’approuver chaque langue séparément ;
- de verrouiller les champs pendant la relecture ;
- d’afficher les statuts `CA` et `ES` sur la fiche article.

Aucune traduction n’est publiée automatiquement.

## Fichiers principaux

```text
lib/article-engine/generateArticleTranslations.ts
lib/article-engine/manageArticleTranslation.ts
lib/article-engine/repositories/ArticleTranslationRepository.ts
lib/article-engine/repositories/PrismaArticleTranslationRepository.ts
app/admin/articles/translation-actions.ts
app/admin/articles/[id]/translations/[locale]/page.tsx
components/admin/article/EditorialWorkflowPanel.tsx
```

## Modèle de données

Le modèle Prisma `ArticleTranslation` gère :

- les langues `FR`, `CA` et `ES` ;
- une traduction unique par article et langue ;
- un slug unique par langue ;
- les statuts éditoriaux ;
- les dates de génération et d’approbation ;
- la suppression en cascade.

Migration appliquée :

```text
add_article_translations
```

## Workflow validé

```text
AI_DRAFT → REVIEW → APPROVED
REVIEW → DRAFT
```

Une correction humaine fait passer une traduction de `AI_DRAFT` à `DRAFT`.

La publication directe depuis `AI_DRAFT` est interdite.

## Validations

```text
Test Files  10 passed (10)
Tests       40 passed (40)
```

Commandes validées :

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
```

Route créée :

```text
/admin/articles/[id]/translations/[locale]
```

## Test fonctionnel réalisé

Le parcours suivant a été validé :

1. génération de `CA` et `ES` ;
2. seconde génération sans doublon ;
3. modification d’une traduction ;
4. passage à `DRAFT` ;
5. envoi en relecture ;
6. verrouillage des champs ;
7. retour au brouillon ;
8. nouvel envoi en relecture ;
9. approbation ;
10. nouvelle génération ;
11. confirmation que la traduction approuvée n’est pas écrasée.

Une traduction catalane de test est présente dans la base locale avec le statut `APPROVED`.

## Commits importants

```text
591dc5e feat: ajouter le modele des traductions d articles
bc28236 feat: ajouter le contrat de traduction simulee
af9bc08 feat: ajouter le depot des traductions
6c81a0e feat: generer les traductions d article
c34c2b5 feat: ajouter l action de traduction
737bb4a feat: afficher les statuts de traduction
554d218 feat: ajouter le workflow des traductions
f3109f7 feat: ajouter l edition des traductions
```

## Limites actuelles

- Le générateur est simulé avec les préfixes `[CA]` et `[ES]`.
- Aucun service de traduction réel n’est connecté.
- Les traductions approuvées ne sont pas publiées publiquement.
- Les URL publiques multilingues ne sont pas définies.
- Les champs SEO ne sont pas éditables.
- Les slugs utilisent `crypto.randomUUID()`.
- Une traduction approuvée ne peut pas être rouverte depuis l’interface.
- Les erreurs des actions serveur ne sont pas affichées dans les formulaires.
- Les tests d’intégration Prisma restent à ajouter.

## Prochain lot recommandé

1. choisir la structure des URL publiques ;
2. publier uniquement les traductions approuvées ;
3. ajouter les routes publiques localisées ;
4. ajouter les métadonnées SEO et `hreflang` ;
5. permettre de rouvrir une traduction approuvée ;
6. afficher les messages de succès et d’erreur ;
7. connecter un service de traduction réel ;
8. ajouter des tests d’intégration Prisma.

## Commandes de reprise

```bash
cd /Users/SHAUNLEMOUTON/andorre-360
git checkout feature/editorial-pipeline-multilingual
git status --short
npx tsc --noEmit
npm test -- --run
npm run build
```