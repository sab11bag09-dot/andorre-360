# ANDORRE 360 — Note de synthèse du chantier multilingue

Date de finalisation : 1 août 2026

## Objet

Le chantier a transformé le pipeline éditorial existant en un système capable de gérer séparément les versions française, catalane et espagnole d’un article, depuis la génération jusqu’à la publication publique.

Le français reste la source éditoriale principale. Les versions catalane et espagnole disposent chacune de leur propre contenu, slug, statut, date de publication et URL publique. Aucune traduction n’est publiée automatiquement : la relecture, l’approbation et la publication restent des décisions humaines.

## Résultat obtenu

Le système permet désormais de :

- générer des brouillons catalans et espagnols depuis l’article français ;
- corriger chaque traduction indépendamment ;
- suivre le cycle `AI_DRAFT → DRAFT → REVIEW → APPROVED → PUBLISHED` ;
- renvoyer une traduction approuvée en relecture ;
- publier uniquement une traduction préalablement approuvée ;
- retirer une traduction en la passant à `ARCHIVED`, sans supprimer son contenu ;
- conserver la date de première publication ;
- empêcher une régénération d’écraser une traduction relue, approuvée, publiée ou archivée ;
- prévisualiser une traduction dans l’administration avant sa publication ;
- afficher publiquement les traductions publiées sur des URL localisées ;
- produire les métadonnées SEO multilingues correspondantes ;
- désactiver immédiatement toute nouvelle publication grâce à un coupe-circuit de configuration.

## Lots réalisés

| Lot | Réalisation principale |
|---:|---|
| 1 | Service métier de publication limité à `APPROVED → PUBLISHED` |
| 2 | Ajout de `publishedAt` avec migration Prisma et sauvegarde préalable |
| 3 | Actions administrateur « Publier » et « Retirer de la publication » |
| 4 | Pages publiques catalanes et espagnoles, accessibles uniquement en statut `PUBLISHED` |
| 5 | Slugs localisés lisibles, uniques par langue et stables après publication |
| 6 | Canonical, `hreflang`, `x-default`, Open Graph et métadonnées localisées |
| 7 | Aperçu protégé, messages, confirmations, chargements et amélioration du workflow administrateur |
| 8 | Adaptateur OpenAI derrière le contrat `EditorialGenerator`, avec validation et tests sans réseau |
| 9 | Tests d’intégration SQLite isolés et correction des générations simultanées |
| 10 | Coupe-circuit, modèle d’environnement et procédure de déploiement/retour arrière |

## Architecture et règles préservées

Les services métier restent indépendants du fournisseur de traduction. Le contrat `EditorialGenerator` permet de remplacer OpenAI sans modifier le workflow, les dépôts ou les tests métier.

Les règles critiques sont vérifiées côté serveur :

- seuls `DRAFT` et `AI_DRAFT` peuvent être régénérés ou modifiés ;
- seule une traduction `APPROVED` peut être publiée ;
- une modification concurrente de statut est détectée par mise à jour conditionnelle ;
- les contraintes Prisma garantissent l’unicité de `(articleId, locale)` et `(locale, slug)` ;
- deux générations simultanées sont désormais idempotentes et ne créent aucun doublon ;
- les contenus non publiés sont systématiquement invisibles sur les routes publiques ;
- la suppression d’un article supprime ses traductions en cascade.

## Routes principales

| Usage | Route |
|---|---|
| Article français | `/article/[slug]` |
| Article catalan | `/ca/article/[slug]` |
| Article espagnol | `/es/article/[slug]` |
| Gestion d’une traduction | `/admin/articles/[id]/translations/[locale]` |
| Aperçu administrateur | `/admin/articles/[id]/translations/[locale]/preview` |

Les routes catalanes et espagnoles retournent une page 404 pour un brouillon, une traduction en relecture, approuvée mais non publiée, archivée, inconnue ou associée à une langue non prise en charge.

## Traduction OpenAI

L’adaptateur OpenAI utilise l’API Responses avec une sortie JSON structurée. Il applique un délai maximal, valide les champs retournés et transforme les erreurs du fournisseur en messages compréhensibles.

Le modèle est configurable avec `OPENAI_TRANSLATION_MODEL` et utilise `gpt-5.6-terra` par défaut. La clé reste exclusivement dans `OPENAI_API_KEY`, dans l’environnement local ou celui de l’hébergement. Elle n’est pas présente dans Git.

L’appel réel a été tenté avec une clé valide, mais le compte API ne possédait aucun crédit. L’intégration réelle n’a donc pas été validée jusqu’au retour d’une traduction distante. Ce point ne bloque pas les tests automatisés, qui utilisent un faux client et n’effectuent aucun appel réseau.

## Validation effectuée

Au terme du chantier :

- TypeScript réussit sans erreur ;
- le build Next.js 16.2.10 réussit ;
- 20 fichiers de tests passent ;
- 122 tests passent ;
- 16 scénarios d’intégration utilisent une base SQLite temporaire créée à partir des migrations réelles puis supprimée ;
- les parcours publics, les slugs, le SEO, le workflow et le coupe-circuit ont été contrôlés manuellement ;
- la base locale contenant les données manuelles n’est jamais utilisée par les tests destructifs.

## GitHub

Deux pull requests ont été fusionnées dans `audit/studio-v4` :

- PR #1 — publication contrôlée des traductions ; squash final `37a4a1a` ;
- PR #2 — pages publiques multilingues et lots 4 à 10 ; squash final `ffdaa71`.

État final :

- branche active : `audit/studio-v4` ;
- branche locale synchronisée avec `origin/audit/studio-v4` ;
- arbre Git propre ;
- branches de fonctionnalités supprimées après fusion.

## Configuration actuelle

La publication multilingue est volontairement fermée dans l’environnement local :

```dotenv
MULTILINGUAL_PUBLICATION_ENABLED="false"
```

Quand cette variable est absente ou différente de `true`, le bouton de publication disparaît et l’action serveur refuse également la publication. Le retrait d’une traduction déjà publiée reste disponible.

Le fichier `.env.example` documente les variables attendues sans contenir de secret :

- `DATABASE_URL` ;
- `AUTH_SECRET` ;
- `NEXT_PUBLIC_SITE_URL` ;
- `MULTILINGUAL_PUBLICATION_ENABLED` ;
- `OPENAI_API_KEY` ;
- `OPENAI_TRANSLATION_MODEL` ;
- variables `ADMIN_*` utilisées pour l’initialisation.

## Point bloquant avant production

Le projet utilise actuellement SQLite avec `better-sqlite3`. Une mise en production exige donc un disque persistant, sauvegardé, avec une topologie adaptée aux écritures SQLite.

Il ne faut pas déployer cette base sur un système de fichiers éphémère. Pour un hébergement serverless sans volume persistant, il faudra d’abord migrer vers une base gérée compatible avec Prisma.

La procédure complète se trouve dans `docs/11-multilingual-deployment.md`. Elle couvre :

- la sauvegarde SQLite et son contrôle d’intégrité ;
- les variables d’environnement ;
- `prisma migrate deploy` ;
- les contrôles TypeScript, tests et build ;
- l’ouverture progressive avec une seule traduction de recette ;
- les vérifications canonical et `hreflang` ;
- le retrait de la traduction test ;
- le retour arrière par coupe-circuit, archivage et retour à la version stable.

## Prochaines décisions

Avant un déploiement réel :

1. choisir l’hébergement et confirmer la persistance de la base ;
2. configurer `AUTH_SECRET` et l’URL publique finale ;
3. décider si OpenAI doit être activé et, dans ce cas, créditer le compte API ;
4. réaliser une sauvegarde vérifiée ;
5. déployer avec `MULTILINGUAL_PUBLICATION_ENABLED=false` ;
6. tester une traduction approuvée unique ;
7. activer temporairement la publication, vérifier la page puis tester son retrait ;
8. ouvrir progressivement la fonctionnalité après validation.

## Conclusion

Le pipeline multilingue est fonctionnel, testé, fusionné et sécurisé par défaut. La prochaine phase n’est plus un chantier fonctionnel : elle concerne le choix de l’infrastructure, la configuration des secrets et l’exécution contrôlée du plan de déploiement.
