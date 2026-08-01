# Plan de conduite — Publication éditoriale multilingue

Date : 1 août 2026

Document associé :

```text
docs/08-editorial-multilingual-handoff.md
```

Branche de départ :

```text
feature/editorial-pipeline-multilingual
```

Point fonctionnel de départ :

```text
f3109f7 feat: ajouter l edition des traductions
```

Point documentaire de départ :

```text
f6fdba7 docs: ajouter le point de passation multilingue
```

## 1. Rôle de ce document

Ce document décrit la suite du chantier, l’ordre recommandé des travaux, les critères de validation et la finalité à atteindre.

Le document `08-editorial-multilingual-handoff.md` décrit l’existant. Le présent document décrit comment passer de cet existant à une publication publique multilingue exploitable en production.

## 2. Finalité à atteindre

La finalité est de disposer d’un système éditorial français, catalan et espagnol dans lequel chaque langue possède son propre cycle de vie.

Le système final doit garantir que :

- l’article français reste la source éditoriale principale ;
- les traductions catalane et espagnole peuvent être générées séparément ;
- chaque traduction peut être corrigée, relue, approuvée et publiée indépendamment ;
- seule une traduction approuvée peut être publiée ;
- aucune traduction n’est publiée automatiquement après sa génération ;
- une traduction relue, approuvée ou publiée ne peut pas être écrasée par une nouvelle génération ;
- les contenus publics possèdent des URL localisées stables ;
- les moteurs de recherche comprennent les relations entre les versions linguistiques ;
- une traduction retirée de la publication n’est plus accessible publiquement ;
- le système reste testable sans appel à un service d’IA réel ;
- chaque lot peut être validé et annulé indépendamment.

## 3. Définition globale de terminé

Le chantier multilingue sera considéré comme terminé lorsque les conditions suivantes seront toutes satisfaites :

- `FR`, `CA` et `ES` possèdent un cycle éditorial explicite ;
- `CA` et `ES` disposent de pages publiques localisées ;
- une traduction non publiée retourne une page introuvable ;
- une traduction `APPROVED` peut être publiée par une action humaine ;
- une traduction `PUBLISHED` peut être retirée sans supprimer son contenu ;
- les URL publiques utilisent des slugs lisibles et stables ;
- les pages possèdent un canonical et des liens `hreflang` cohérents ;
- les traductions peuvent être prévisualisées avant publication ;
- les erreurs et confirmations sont visibles dans l’administration ;
- un fournisseur réel de traduction peut remplacer le simulateur sans modifier le workflow métier ;
- les contraintes Prisma sont couvertes par des tests d’intégration ;
- les parcours critiques sont couverts par des tests fonctionnels ;
- TypeScript, les tests et le build sont validés ;
- le déploiement et le retour arrière sont documentés.

## 4. Invariants à préserver

Ces règles ne doivent pas être contournées pendant la suite du chantier.

### 4.1 Publication humaine

La génération d’une traduction doit toujours produire un brouillon.

Elle ne doit jamais produire directement :

```text
APPROVED
PUBLISHED
```

### 4.2 Indépendance des langues

Les statuts français, catalan et espagnol sont indépendants.

Exemple autorisé :

```text
FR : PUBLISHED
CA : APPROVED
ES : AI_DRAFT
```

La publication française ne doit pas publier automatiquement `CA` ou `ES`.

### 4.3 Protection éditoriale

La régénération automatique peut modifier uniquement :

```text
DRAFT
AI_DRAFT
```

Elle doit ignorer :

```text
REVIEW
APPROVED
PUBLISHED
ARCHIVED
```

### 4.4 Publication conditionnelle

Une traduction ne peut devenir `PUBLISHED` que depuis :

```text
APPROVED
```

Toute autre transition vers `PUBLISHED` doit être refusée par le service métier, même si l’interface masque déjà le bouton.

### 4.5 Validation côté serveur

Les règles métier ne doivent jamais dépendre uniquement de l’interface.

Les actions serveur doivent appeler un service métier testable qui vérifie :

- l’identifiant ;
- la langue ;
- l’existence de la traduction ;
- le statut courant ;
- la transition demandée ;
- la concurrence éventuelle.

### 4.6 Tests sans fournisseur réel

Les tests automatisés ne doivent appeler aucun fournisseur de traduction externe.

Le fournisseur doit rester derrière le contrat :

```text
EditorialGenerator
```

## 5. Décisions à confirmer avant la publication

### 5.1 Structure des URL

Option recommandée :

```text
/ca/article/[slug]
/es/article/[slug]
```

Motifs :

- URLs lisibles ;
- séparation claire des langues ;
- gestion SEO plus simple ;
- compatibilité naturelle avec `hreflang` ;
- possibilité d’étendre plus tard à d’autres langues.

Le français conserve provisoirement :

```text
/article/[slug]
```

### 5.2 Stratégie de slug

Recommandation :

- générer un slug lisible depuis le titre traduit ;
- garantir l’unicité par langue ;
- ajouter un suffixe court en cas de collision ;
- ne plus modifier automatiquement le slug après la première publication ;
- permettre une modification manuelle avant publication.

Exemple :

```text
/ca/article/nova-politica-dhabitatge
/es/article/nueva-politica-de-vivienda
```

L’utilisation actuelle de `crypto.randomUUID()` doit rester en place tant que la nouvelle stratégie n’est pas testée.

### 5.3 Retrait de publication

Recommandation :

```text
PUBLISHED → ARCHIVED
```

Une traduction archivée :

- reste en base ;
- n’est plus accessible publiquement ;
- conserve son historique ;
- peut éventuellement revenir à `DRAFT` selon le workflow existant.

### 5.4 Date de publication

Le modèle actuel ne possède pas de champ `publishedAt` pour les traductions.

Recommandation : ajouter :

```prisma
publishedAt DateTime?
```

Ce champ doit être :

- renseigné lors du passage à `PUBLISHED` ;
- conservé lors d’un archivage ;
- utilisé pour l’affichage et les flux publics.

Cette modification nécessite une migration Prisma séparée et une sauvegarde préalable de la base.

## 6. Méthode commune à chaque lot

Chaque lot doit suivre cet ordre :

1. vérifier que l’arbre Git est propre ;
2. créer ou adapter les tests métier ;
3. implémenter le changement minimal ;
4. exécuter TypeScript ;
5. exécuter tous les tests ;
6. exécuter le build ;
7. réaliser un test manuel ciblé ;
8. vérifier le diff ;
9. créer un commit isolé ;
10. vérifier que l’arbre Git est à nouveau propre.

Commandes standard :

```bash
git status --short
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
git diff --stat
```

Aucun lot ne doit être mélangé avec une modification cosmétique sans rapport.

## 7. Plan de réalisation

# Lot 1 — Publication métier contrôlée

## Finalité

Permettre le passage manuel d’une traduction de `APPROVED` à `PUBLISHED`, sans encore créer de page publique.

## Travaux

Créer un service métier dédié ou étendre prudemment :

```text
lib/article-engine/manageArticleTranslation.ts
```

Ajouter une fonction explicite de publication.

Le service doit :

- valider l’article et la langue ;
- retrouver la traduction ;
- exiger le statut `APPROVED` ;
- effectuer une transition optimiste ;
- renseigner `publishedAt` si ce champ est ajouté ;
- refuser toute publication directe depuis un brouillon ;
- retourner l’identifiant et le nouveau statut.

Ajouter ou adapter :

```text
lib/article-engine/manageArticleTranslation.test.ts
lib/article-engine/repositories/ArticleTranslationRepository.ts
lib/article-engine/repositories/PrismaArticleTranslationRepository.ts
```

## Tests obligatoires

- `APPROVED → PUBLISHED` est autorisé ;
- `AI_DRAFT → PUBLISHED` est refusé ;
- `DRAFT → PUBLISHED` est refusé ;
- `REVIEW → PUBLISHED` est refusé ;
- une traduction introuvable est refusée ;
- un changement concurrent de statut est détecté ;
- `publishedAt` est renseigné si le champ existe.

## Critère de sortie

La publication est possible uniquement par le service métier et uniquement depuis `APPROVED`.

## Commit recommandé

```text
feat: ajouter la publication controlee des traductions
```

# Lot 2 — Migration de la date de publication

## Finalité

Disposer d’une date de publication propre à chaque langue.

## Travaux

Avant la migration :

```bash
git status --short
npx prisma migrate status
```

Sauvegarder la base selon la procédure déjà utilisée pour `ArticleTranslation`.

Modifier :

```text
prisma/schema.prisma
```

Ajouter :

```prisma
publishedAt DateTime?
```

Créer une migration nommée :

```text
add_translation_published_at
```

Régénérer le client Prisma si nécessaire.

## Tests obligatoires

- la migration s’applique sur la base locale ;
- les traductions existantes sont conservées ;
- les créations de brouillons fonctionnent encore ;
- la publication renseigne la date ;
- le build réussit.

## Critère de sortie

La base contient `publishedAt` sans perte de données.

## Commit recommandé

```text
feat: ajouter la date de publication des traductions
```

# Lot 3 — Action de publication dans l’administration

## Finalité

Permettre à un éditeur de publier une traduction approuvée depuis sa page.

## Travaux

Modifier :

```text
app/admin/articles/translation-actions.ts
app/admin/articles/[id]/translations/[locale]/page.tsx
components/admin/article/EditorialWorkflowPanel.tsx
```

Ajouter :

- un bouton `Publier` uniquement pour `APPROVED` ;
- un bouton `Retirer de la publication` pour `PUBLISHED` ;
- une confirmation avant les actions sensibles ;
- une revalidation des pages concernées ;
- un affichage clair du statut final.

Si une confirmation nécessite un composant client, l’isoler dans un petit composant dédié au lieu de convertir toute la page en composant client.

## Tests et contrôle manuel

- le bouton n’apparaît pas pour un brouillon ;
- la publication fonctionne pour `APPROVED` ;
- le statut devient `PUBLISHED` ;
- le retrait rend la traduction `ARCHIVED` ;
- la version française reste inchangée ;
- les autres langues restent inchangées.

## Critère de sortie

Un éditeur peut publier et retirer chaque langue indépendamment.

## Commit recommandé

```text
feat: ajouter les actions de publication multilingue
```

# Lot 4 — Lecture publique des traductions

## Finalité

Rendre les traductions publiées accessibles publiquement.

## Route recommandée

```text
app/[locale]/article/[slug]/page.tsx
```

La route doit accepter uniquement :

```text
ca
es
```

La conversion vers Prisma doit être explicite :

```text
ca → CA
es → ES
```

## Couche d’accès recommandée

Créer un contrat de lecture publique séparé ou une méthode dédiée qui retourne uniquement les champs nécessaires :

- titre ;
- description ;
- contenu ;
- slug ;
- langue ;
- date de publication ;
- informations communes de l’article ;
- image et auteur si nécessaires.

La requête doit exiger :

```text
status = PUBLISHED
```

Une traduction `DRAFT`, `AI_DRAFT`, `REVIEW`, `APPROVED` ou `ARCHIVED` doit retourner une page introuvable.

## Réutilisation visuelle

Inspecter d’abord :

```text
app/article/[slug]/page.tsx
```

Réutiliser le composant de rendu public existant lorsque cela est possible.

Ne pas dupliquer inutilement toute la présentation de l’article.

## Tests obligatoires

- une traduction publiée est trouvée ;
- une traduction approuvée mais non publiée est invisible ;
- une traduction archivée est invisible ;
- une langue inconnue retourne une page introuvable ;
- un slug inconnu retourne une page introuvable ;
- `CA` et `ES` restent indépendants.

## Critère de sortie

Les pages publiques existent uniquement pour les traductions publiées.

## Commit recommandé

```text
feat: ajouter les pages publiques multilingues
```

# Lot 5 — Slugs lisibles et stables

## Finalité

Remplacer les UUID publics par des slugs éditoriaux compréhensibles.

## Travaux

Créer une fonction testable de génération de slug.

Elle doit :

- convertir le titre en minuscules ;
- supprimer ou normaliser les accents ;
- remplacer les séparateurs par des tirets ;
- supprimer les caractères non autorisés ;
- éviter les tirets multiples ;
- garantir une valeur non vide ;
- gérer les collisions par langue.

Ne jamais modifier automatiquement le slug d’une traduction déjà publiée.

Ajouter un champ d’édition du slug avant publication.

## Tests obligatoires

- accents catalans ;
- accents espagnols ;
- apostrophes ;
- ponctuation ;
- espaces multiples ;
- titre vide après normalisation ;
- collision dans une même langue ;
- même slug autorisé dans deux langues différentes si le schéma le permet ;
- stabilité après publication.

## Critère de sortie

Les URLs publiques sont lisibles, uniques et stables.

## Commit recommandé

```text
feat: ajouter les slugs localises
```

# Lot 6 — SEO multilingue

## Finalité

Permettre aux moteurs de recherche d’identifier correctement les variantes linguistiques.

## Travaux

Ajouter dans les pages publiques :

- un titre localisé ;
- une description localisée ;
- une URL canonical ;
- les liens `hreflang` disponibles ;
- `x-default` vers la version française ou la version choisie ;
- la langue correcte du contenu ;
- les métadonnées sociales localisées si elles existent.

Les liens `hreflang` ne doivent pointer que vers des versions réellement publiées.

Exemple :

```text
fr → /article/slug-francais
ca → /ca/article/slug-catala
es → /es/article/slug-espanol
x-default → /article/slug-francais
```

Mettre à jour le sitemap si le projet en possède un.

## Tests obligatoires

- canonical correct ;
- `hreflang` limité aux langues publiées ;
- absence de lien vers un brouillon ;
- métadonnées `CA` et `ES` correctes ;
- build validé.

## Critère de sortie

Chaque page publiée possède un référencement multilingue cohérent.

## Commit recommandé

```text
feat: ajouter le seo multilingue
```

# Lot 7 — Aperçu et amélioration du workflow administrateur

## Finalité

Rendre le workflow utilisable sans dépendre des erreurs brutes de Next.js.

## Travaux

Ajouter :

- un aperçu avant publication ;
- des messages de succès ;
- des messages d’erreur compréhensibles ;
- un état de chargement pendant les actions ;
- une confirmation avant publication ou retrait ;
- une action `APPROVED → REVIEW` ;
- une indication de la date de génération ;
- une indication de la date d’approbation ;
- une indication de la date de publication ;
- un lien clair entre les versions `FR`, `CA` et `ES`.

## Règles

Une traduction approuvée doit revenir en `REVIEW` avant d’être modifiée.

Une traduction publiée doit être retirée ou archivée avant toute correction.

## Critère de sortie

Un éditeur comprend toujours :

- l’état actuel ;
- les actions possibles ;
- la raison d’un blocage ;
- le résultat d’une action.

## Commit recommandé

```text
feat: ameliorer le workflow multilingue
```

# Lot 8 — Fournisseur réel de traduction

## Finalité

Remplacer le simulateur par un fournisseur réel sans modifier les services métier.

## Architecture

Conserver :

```text
EditorialGenerator
```

Créer un nouvel adaptateur, par exemple :

```text
AiEditorialGenerator
```

ou :

```text
ExternalTranslationGenerator
```

Le choix du fournisseur doit être réalisé dans la composition des dépendances, pas dans le service métier.

## Règles

- aucune clé ne doit être écrite dans Git ;
- les secrets passent par les variables d’environnement ;
- les délais et erreurs doivent être gérés ;
- les réponses doivent être validées ;
- le français source ne doit jamais être modifié ;
- le résultat reste `AI_DRAFT` ;
- la relecture humaine reste obligatoire ;
- les tests utilisent un faux générateur ;
- aucun test automatisé standard n’appelle le réseau.

## Critère de sortie

Le fournisseur réel peut être activé ou remplacé sans modifier le workflow, le dépôt ou les tests métier.

## Commit recommandé

```text
feat: connecter le generateur de traduction
```

# Lot 9 — Tests d’intégration et concurrence

## Finalité

Valider les garanties fournies par Prisma et la base réelle.

## Scénarios obligatoires

- unicité de `(articleId, locale)` ;
- unicité de `(locale, slug)` ;
- suppression en cascade ;
- création de `CA` et `ES` ;
- seconde génération sans doublon ;
- clics simultanés de génération ;
- modification concurrente d’un statut ;
- protection de `REVIEW` ;
- protection de `APPROVED` ;
- protection de `PUBLISHED` ;
- publication limitée à `APPROVED` ;
- invisibilité publique des contenus non publiés.

Utiliser une base de test séparée.

Ne jamais lancer les tests destructifs sur la base de développement contenant les données manuelles.

## Critère de sortie

Les contraintes métier et de concurrence sont démontrées sur une base réelle isolée.

## Commit recommandé

```text
test: couvrir le pipeline multilingue en integration
```

# Lot 10 — Préparation du déploiement

## Finalité

Déployer le multilingue sans perte de données ni publication involontaire.

## Avant déploiement

- sauvegarder la base ;
- vérifier les migrations ;
- vérifier les variables d’environnement ;
- exécuter TypeScript ;
- exécuter tous les tests ;
- exécuter le build ;
- vérifier l’absence de fichiers non commités ;
- documenter les nouvelles routes ;
- confirmer qu’aucune traduction n’est publiée automatiquement.

Commandes minimales :

```bash
git status --short
npx prisma migrate status
npx tsc --noEmit
npm test -- --run
npm run build
```

## Déploiement progressif recommandé

1. déployer le modèle et les services ;
2. vérifier l’administration ;
3. publier une seule traduction de test ;
4. vérifier la page publique ;
5. vérifier canonical et `hreflang` ;
6. tester le retrait ;
7. surveiller les erreurs ;
8. ouvrir progressivement la publication aux autres contenus.

## Retour arrière

Le retour arrière doit privilégier :

- la désactivation des boutons de publication ;
- l’archivage des traductions publiées ;
- le retour au commit stable précédent ;
- la restauration de la base uniquement si une migration a endommagé les données.

Ne pas supprimer les traductions pour annuler une publication.

## Critère de sortie

Une traduction test peut être publiée, vérifiée puis retirée sans affecter le français ni les autres langues.

## 8. Matrice d’acceptation finale

| Domaine | Critère |
|---|---|
| Génération | `CA` et `ES` sont créées sans doublon |
| Protection | Les contenus relus ou publiés ne sont pas écrasés |
| Édition | Seuls les brouillons sont modifiables |
| Relecture | Chaque langue possède son propre statut |
| Approbation | Chaque langue peut être approuvée séparément |
| Publication | Seul `APPROVED` peut devenir `PUBLISHED` |
| Retrait | Une traduction retirée n’est plus publique |
| URL | Chaque langue possède une URL stable |
| SEO | Canonical et `hreflang` sont cohérents |
| Sécurité | Aucun secret n’est commité |
| Tests | Métier, Prisma et parcours critiques sont couverts |
| Déploiement | Sauvegarde et retour arrière sont documentés |

## 9. Risques principaux

### Écrasement éditorial

Risque : une nouvelle génération remplace une correction humaine.

Réponse : conserver la protection par statut et la vérifier dans le service et le dépôt.

### Publication involontaire

Risque : un brouillon devient visible publiquement.

Réponse : filtrer `status = PUBLISHED` dans toutes les requêtes publiques.

### Collision de slug

Risque : deux traductions utilisent la même URL.

Réponse : conserver la contrainte Prisma et gérer les collisions avant l’écriture.

### Concurrence

Risque : deux actions simultanées créent ou publient le même contenu.

Réponse : contraintes d’unicité, mises à jour conditionnelles et tests d’intégration.

### Mauvais référencement

Risque : canonical ou `hreflang` pointe vers une version non publiée.

Réponse : construire les métadonnées uniquement depuis les traductions `PUBLISHED`.

### Dépendance au fournisseur

Risque : une panne externe bloque le workflow.

Réponse : isoler le fournisseur derrière `EditorialGenerator`, gérer les erreurs et conserver la reprise manuelle.

## 10. Conditions d’arrêt

Le chantier doit être interrompu et réévalué si :

- une migration menace des données existantes ;
- les règles d’URL ne sont pas décidées ;
- la publication peut contourner `APPROVED` ;
- un test utilise la base de développement de manière destructive ;
- un secret apparaît dans le diff ;
- une traduction approuvée peut être écrasée ;
- le français est modifié par une action de traduction ;
- le build ou les tests complets échouent.

## 11. Première action à la reprise

Ne pas commencer directement par la route publique.

Commencer par confirmer les décisions suivantes :

1. URL retenue : `/ca/article/[slug]` et `/es/article/[slug]` ;
2. ajout du champ `publishedAt` ;
3. retrait par `PUBLISHED → ARCHIVED` ;
4. stabilité du slug après publication.

Une fois ces décisions confirmées, démarrer le lot 1 : publication métier contrôlée.

## 12. Commandes de reprise

```bash
cd /Users/SHAUNLEMOUTON/andorre-360
git checkout feature/editorial-pipeline-multilingual
git status --short
git log -5 --oneline
npx prisma migrate status
npx tsc --noEmit
npm test -- --run
npm run build
```

Point documentaire attendu :

```text
f6fdba7 docs: ajouter le point de passation multilingue
```

Le premier nouveau commit doit rester limité au prochain lot validé.

## 13. Décisions confirmées

Décisions validées le 1 août 2026 :

1. Les URL publiques seront :

   `/ca/article/[slug]`

   `/es/article/[slug]`

2. Le modèle `ArticleTranslation` recevra le champ :

   `publishedAt DateTime?`

3. Le retrait d’une traduction publiée utilisera la transition :

   `PUBLISHED → ARCHIVED`

4. Le slug deviendra stable après la première publication et ne pourra plus être modifié automatiquement.

Ces décisions remplacent toute mention antérieure indiquant qu’elles restaient à confirmer.

La prochaine action est désormais le lot 1 : ajouter la publication métier contrôlée, limitée aux traductions au statut `APPROVED`.


## 14. Consigne de reprise pour la prochaine session

Reprendre le chantier multilingue sur la branche `feature/editorial-pipeline-multilingual`.

Lire dans cet ordre :

1. `docs/08-editorial-multilingual-handoff.md`
2. `docs/09-multilingual-delivery-plan.md`

Vérifier le dernier commit avec :

`git log -1 --oneline`

Les quatre décisions de publication sont confirmées dans la section 13. Ne pas les rediscuter sauf nouvelle demande explicite.

Commencer par le lot 1 : publication métier contrôlée des traductions `APPROVED`.
