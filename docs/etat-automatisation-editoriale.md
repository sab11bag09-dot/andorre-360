# État du chantier — automatisation éditoriale

Dernière mise à jour : 3 septembre 2026

## Branche

`feat/automated-home-editorial`

Destination prévue : `audit/studio-v4`.

## Jalon terminé

La simulation automatique de la page d’accueil est fonctionnelle.

Elle peut :

- charger jusqu’à 30 candidats ;
- évaluer les articles avec OpenAI ;
- appliquer les exclusions et les seuils déterministes ;
- respecter la fraîcheur, la diversité et les capacités des zones ;
- proposer des sélections IA ;
- compléter uniquement les cartes et les brèves par secours chronologique ;
- préserver les sélections humaines verrouillées.

Elle ne modifie encore aucune publication réelle.

## Protection des choix humains

Les publications possèdent maintenant :

- une origine : `MANUAL`, `AUTOMATED` ou `FALLBACK` ;
- un verrouillage ;
- un score automatique optionnel ;
- une version de politique ;
- un identifiant de run.

La migration a conservé les 171 publications existantes. Elles ont toutes été initialisées comme publications manuelles verrouillées.

Les actions humaines du Studio réinitialisent la provenance à `MANUAL`, verrouillent la publication et effacent les anciennes métadonnées automatiques.

## Validation

La simulation réelle a produit :

- 30 candidats évalués ;
- 10 articles retenus ;
- des choix humains correctement préservés ;
- aucun score artificiel sur les choix humains ;
- un grand format laissé vide faute de candidat admissible ;
- aucune modification de la page publique.

Vérification globale :

- 80 fichiers de tests passés ;
- 452 tests passés ;
- 0 erreur ESLint ;
- TypeScript validé ;
- build Next.js réussi.

## Suite du chantier

L’application réelle d’une composition automatique reste à construire.

Elle devra inclure :

- une transaction unique ;
- un historique complet ;
- un identifiant de run ;
- un retour arrière ;
- un arrêt d’urgence ;
- une activation administrative supervisée.

Aucun bouton d’application automatique ne doit être ajouté avant ces protections.

## Consignes très précises pour reprendre dans un nouveau chat

### 1. Première chose à faire

Dire au nouvel assistant :

« Lis entièrement le fichier `docs/etat-automatisation-editoriale.md` avant de proposer une modification. Ne recommence pas le chantier depuis le début. »

Ensuite, exécuter ces trois commandes :

- `git branch --show-current`
- `git status -sb`
- `git log --oneline -15`

Le résultat attendu est :

- branche courante : `feat/automated-home-editorial` ;
- aucun fichier modifié ou non suivi ;
- les derniers commits concernent l’automatisation éditoriale.

Si le dépôt n’est pas propre, ne rien supprimer et ne rien réinitialiser. Montrer d’abord la sortie de `git status -sb` au nouvel assistant.

### 2. Ce qui est déjà terminé

Ne pas refaire les éléments suivants.

La politique automatique de l’accueil existe dans :

- `lib/editorial/homeAutomationPolicy.ts`
- `lib/editorial/homeAutomationPolicy.test.ts`

Elle contient :

- les exclusions obligatoires ;
- les différents éléments du score ;
- les seuils des zones ;
- la limite de fraîcheur ;
- les règles du grand format.

Le moteur de composition existe dans :

- `lib/editorial/homeComposition.ts`
- `lib/editorial/homeComposition.test.ts`

Il sait :

- préserver les placements humains ;
- empêcher qu’un article apparaisse deux fois ;
- respecter les capacités des zones ;
- respecter la diversité des catégories ;
- respecter la diversité des sources principales ;
- remplir les zones avec les candidats IA ;
- utiliser le secours chronologique uniquement pour les cartes et les brèves ;
- laisser une zone vide quand aucun candidat n’est suffisamment bon.

Le chargement des candidats existe dans :

- `lib/editorial/loadHomeCandidateFacts.ts`
- `lib/editorial/loadHomeCandidateFacts.test.ts`

L’évaluation éditoriale existe dans :

- `lib/editorial/homeCandidateAssessment.ts`
- `lib/editorial/homeCandidateAssessment.test.ts`
- `lib/editorial/OpenAiHomeCandidateAssessmentProvider.ts`
- `lib/editorial/OpenAiHomeCandidateAssessmentProvider.test.ts`

La simulation complète existe dans :

- `lib/editorial/simulateAutomatedHome.ts`
- `lib/editorial/simulateAutomatedHome.test.ts`

Le chargement des choix humains existe dans :

- `lib/editorial/loadLockedHomePlacements.ts`
- `lib/editorial/loadLockedHomePlacements.test.ts`

L’action administrative existe dans :

- `actions/home-editorial-simulation.ts`
- `actions/home-editorial-simulation.test.ts`

L’interface existe dans :

- `components/admin/editorial/HomeEditorialSimulationPanel.tsx`
- `components/admin/editorial/HomeEditorialSimulationPanel.test.ts`
- `app/admin/diffusion/simulation/page.tsx`

La page est accessible à l’adresse :

`/admin/diffusion/simulation`

### 3. Ce qui a été ajouté à la base de données

Le modèle `Publication` contient maintenant :

- `origin`
- `locked`
- `automationScore`
- `automationPolicyVersion`
- `automationRunId`
- `updatedAt`

Les origines possibles sont :

- `MANUAL` pour une sélection humaine ;
- `AUTOMATED` pour une sélection choisie par l’IA ;
- `FALLBACK` pour un secours chronologique.

La migration se trouve dans :

`prisma/migrations/20260903073815_add_publication_automation_metadata/migration.sql`

La migration a été appliquée avec succès.

La base locale utilisée est :

`./dev.db`

Ne pas utiliser :

`./prisma/dev.db`

Le fichier `./prisma/dev.db` était un fichier vide créé accidentellement et a été supprimé.

La migration a conservé les 171 publications existantes.

Après migration :

- 171 publications avaient l’origine `MANUAL` ;
- 171 publications étaient verrouillées ;
- aucune publication ne possédait encore de score automatique ;
- aucune publication ne possédait encore de version automatique ;
- aucune publication ne possédait encore d’identifiant de run.

### 4. Comment les choix humains sont protégés

Toutes les publications historiques ont été considérées comme humaines et verrouillées.

Les actions humaines ont été sécurisées dans :

- `actions/publications.ts`
- `actions/publications.test.ts`
- `actions/articles.ts`
- `actions/article-v4.ts`
- `actions/article-v4.test.ts`

Lorsqu’un humain crée, déplace ou réactive une publication :

- son origine devient `MANUAL` ;
- elle devient verrouillée ;
- son ancien score automatique est effacé ;
- son ancienne version de politique est effacée ;
- son ancien identifiant de run est effacé.

Lorsqu’un humain sélectionne un article déjà placé automatiquement dans la même zone, cet article devient une sélection humaine verrouillée.

Une simple désactivation conserve la provenance historique de la publication.

### 5. Comportement actuellement visible dans la simulation

Une simulation réelle a été exécutée le 3 septembre 2026.

Elle a produit :

- 30 candidats évalués ;
- 10 articles retenus.

La simulation a correctement affiché :

- une Une principale humaine ;
- une grande carte humaine ;
- une brève humaine ;
- des sélections IA ;
- des secours chronologiques ;
- un grand format vide faute de candidat suffisamment bon.

Les choix humains portent le badge :

`Sélection humaine`

Les choix IA portent le badge :

`Sélection IA`

Les secours portent le badge :

`Secours chronologique`

Un choix humain non évalué par OpenAI n’affiche pas de faux score `0/100`.

La simulation ne modifie aucune publication réelle.

### 6. Ce qu’il ne faut surtout pas faire

Ne pas ajouter immédiatement un bouton « Appliquer la proposition ».

Ne pas écrire directement la composition simulée dans la base.

Ne pas déplacer une publication verrouillée.

Ne pas désactiver une publication verrouillée.

Ne pas supprimer les anciennes lignes de la table `Publication`.

Ne pas nettoyer les doublons historiques sans un chantier séparé et validé.

Ne pas modifier les règles des pages publiques déjà restaurées.

Ne pas utiliser `git reset --hard`.

Ne pas utiliser `git checkout --` pour effacer des changements.

Ne pas supprimer une migration déjà appliquée.

Ne pas recréer la migration des métadonnées de publication.

Ne pas considérer un score OpenAI comme une autorisation suffisante. Les exclusions déterministes restent prioritaires.

### 7. Prochaine phase exacte

La prochaine phase consiste à construire un service capable d’appliquer une composition automatique de manière sûre.

Ne pas commencer par l’interface.

Ne pas commencer par un bouton.

Commencer par un service métier isolé et testé.

Nom recommandé du nouveau fichier :

`lib/editorial/applyAutomatedHomeComposition.ts`

Nom recommandé du fichier de test :

`lib/editorial/applyAutomatedHomeComposition.test.ts`

### 8. Première étape de la prochaine phase

Avant d’écrire le service, inspecter :

- `prisma/schema.prisma`
- `actions/publications.ts`
- `lib/editorial/homeComposition.ts`
- `lib/editorial/simulateAutomatedHome.ts`
- `lib/editorial/loadLockedHomePlacements.ts`
- `lib/editorial-history.ts`
- `lib/public-revalidation.ts`

Le service devra recevoir une composition déjà calculée. Il ne devra pas appeler OpenAI lui-même.

### 9. Règles obligatoires du futur service d’application

Toute l’application devra être effectuée dans une seule transaction Prisma.

Au début de la transaction, le service devra relire les publications verrouillées depuis la base.

Cette seconde lecture est obligatoire, car un humain peut avoir modifié la Une après la simulation.

Si un placement humain a changé depuis la simulation, le service ne doit pas l’écraser.

Le service doit refuser de déplacer ou de désactiver une publication ayant :

- `locked = true`
- ou `origin = MANUAL`

Une publication choisie normalement par le moteur doit être enregistrée avec :

- `origin = AUTOMATED`
- `locked = false`
- son score dans `automationScore`
- la version de politique dans `automationPolicyVersion`
- l’identifiant du run dans `automationRunId`

Une publication ajoutée par secours chronologique doit être enregistrée avec :

- `origin = FALLBACK`
- `locked = false`
- son score dans `automationScore`
- la version de politique dans `automationPolicyVersion`
- l’identifiant du run dans `automationRunId`

Le service peut désactiver une ancienne publication uniquement si elle est automatique et non verrouillée.

Il ne doit jamais désactiver une publication humaine.

### 10. Identifiant de run

Chaque application réelle doit posséder un identifiant unique de run.

Le même identifiant doit être enregistré sur toutes les publications créées ou modifiées pendant l’application.

Le service doit empêcher une seconde application accidentelle du même run.

L’identifiant du run servira aussi au retour arrière et à l’historique.

### 11. Historique obligatoire

Chaque application réelle doit produire un événement éditorial.

L’événement doit indiquer au minimum :

- l’identifiant du run ;
- la version de politique ;
- la date ;
- les articles placés ;
- les zones utilisées ;
- les scores ;
- les origines ;
- les anciennes publications désactivées ;
- les placements humains conservés ;
- l’administrateur ayant déclenché l’application.

Aucune erreur secrète du fournisseur ne doit être affichée dans l’interface.

### 12. Retour arrière obligatoire

Avant d’exposer un bouton d’application, construire une stratégie de retour arrière.

Le retour arrière doit pouvoir retrouver toutes les publications d’un run grâce à `automationRunId`.

Il doit pouvoir :

- désactiver les publications créées par le run ;
- restaurer les anciennes publications automatiques remplacées ;
- conserver tous les placements humains ;
- produire un événement éditorial de retour arrière.

Le retour arrière doit lui aussi être transactionnel.

### 13. Arrêt d’urgence obligatoire

Avant toute activation automatique périodique, vérifier l’arrêt d’urgence.

Si l’arrêt d’urgence est actif :

- aucune composition ne doit être appliquée ;
- aucune publication ne doit être créée ;
- aucune publication ne doit être déplacée ;
- aucune publication ne doit être désactivée.

La simulation consultative peut rester disponible.

### 14. Tests à écrire avant toute application réelle

Écrire les tests avant d’ajouter un bouton.

Les tests doivent couvrir :

1. une composition entièrement automatique ;
2. une composition mélangeant choix humains et choix IA ;
3. un hero humain verrouillé ;
4. une carte humaine verrouillée ;
5. une publication automatique remplacée ;
6. une publication humaine qui ne doit pas être désactivée ;
7. un changement humain intervenu après la simulation ;
8. une erreur au milieu de la transaction ;
9. une seconde application du même identifiant de run ;
10. un retour arrière ;
11. l’arrêt d’urgence ;
12. une zone volontairement laissée vide.

Après chaque petit changement, lancer seulement les tests ciblés.

Ne lancer la vérification globale qu’à la fin.

### 15. Première activation réelle

La première application réelle devra être déclenchée manuellement par un administrateur.

Elle devra être testée sur une copie de la base avant d’être utilisée sur la base principale.

Après l’application, vérifier manuellement :

- la page d’accueil publique ;
- les zones du Studio ;
- les publications verrouillées ;
- les origines enregistrées ;
- les scores enregistrés ;
- l’identifiant du run ;
- l’historique éditorial ;
- l’absence de doublon visible.

Ne pas activer de tâche planifiée pendant cette première phase.

### 16. Contrôles de fin de chantier

Lancer dans cet ordre :

- `npx vitest run`
- `npx eslint .`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
- `git status -sb`

Résultat obtenu le 3 septembre 2026 :

- 80 fichiers de tests passés ;
- 452 tests passés ;
- aucune erreur de test ;
- aucune erreur ESLint ;
- 11 avertissements ESLint préexistants ;
- TypeScript validé ;
- build Next.js réussi ;
- simulation réelle réussie.
