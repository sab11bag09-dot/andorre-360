# État du chantier — automatisation éditoriale

Dernière mise à jour : 5 septembre 2026

## Branche

`feat/apply-automated-home`

Branche de base : `audit/studio-v4`.

## Jalon terminé

L’application manuelle et sécurisée d’une composition automatique de l’accueil est construite et testée.

Le système peut :

- charger jusqu’à 30 candidats ;
- évaluer les articles avec OpenAI ;
- appliquer les exclusions, seuils et règles déterministes ;
- préserver les sélections humaines verrouillées ou d’origine `MANUAL` ;
- recalculer une proposition au moment de son application ;
- appliquer toute la composition dans une transaction Prisma unique ;
- enregistrer les publications `AUTOMATED` et `FALLBACK` avec leur score, leur version de politique et leur identifiant de run ;
- empêcher l’application répétée du même identifiant de run ;
- enregistrer un événement éditorial global ;
- restaurer la composition précédente grâce à un retour arrière transactionnel ;
- bloquer toute écriture lorsque l’application est désactivée ou que l’arrêt d’urgence est actif.

La simulation reste consultative. Seule une confirmation explicite d’un administrateur déclenche l’application.

Aucune tâche planifiée n’est activée.

## Structure de la Une publique

La composition automatique respecte maintenant la structure réellement affichée :

- un hero ;
- une mise en avant ;
- un grand format ;
- trois brèves dans « L’essentiel » ;
- cinq cartes au total : une grande carte centrale et quatre articles dans « Sélection ».

## Protection des choix humains

Les publications possèdent :

- une origine : `MANUAL`, `AUTOMATED` ou `FALLBACK` ;
- un verrouillage ;
- un score automatique optionnel ;
- une version de politique ;
- un identifiant de run.

Les 171 publications historiques ont été conservées et initialisées comme publications manuelles verrouillées.

Les actions humaines du Studio réinitialisent la provenance à `MANUAL`, verrouillent la publication et effacent ses anciennes métadonnées automatiques.

Au début d’une application ou d’un retour arrière, les choix humains sont relus dans la transaction. Toute modification humaine intervenue depuis la simulation provoque l’annulation complète de l’opération.

Une publication humaine ou verrouillée ne peut jamais être déplacée ni désactivée par l’automatisation.

## Application et retour arrière

Chaque application :

- utilise un identifiant de run unique ;
- capture un snapshot des choix humains et des anciennes publications automatiques ;
- remplace uniquement les publications automatiques non verrouillées ;
- produit un événement `HOME_COMPOSITION_APPLIED` ;
- termine le run avec le statut `APPLIED`.

Chaque retour arrière :

- désactive uniquement les publications créées par le run ;
- restaure les anciennes publications automatiques du snapshot ;
- conserve les placements humains ;
- produit un événement `HOME_COMPOSITION_ROLLED_BACK` ;
- termine le run avec le statut `ROLLED_BACK`.

## Variables de sécurité

L’application est désactivée par défaut.

Variables utilisées :

- `AI_HOME_COMPOSITION_APPLY_ENABLED=true` autorise l’application manuelle ;
- `AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true` autorise le retour arrière ;
- `AI_HOME_COMPOSITION_EMERGENCY_STOP=true` bloque les écritures de composition ;
- `AI_AUTO_PUBLICATION_EMERGENCY_STOP=true` bloque également les écritures de composition.

Ces variables ne doivent pas être activées par défaut dans les fichiers d’environnement versionnés.

## Validation réalisée

Une application puis un retour arrière ont été testés visuellement le 5 septembre 2026 sur une copie isolée de la base SQLite.

La vérification a confirmé :

- la conservation des placements humains ;
- l’enregistrement des origines, scores et identifiants de run ;
- l’écriture de l’historique éditorial ;
- le retour arrière de la composition ;
- l’absence de modification de la base principale ;
- trois brèves dans « L’essentiel » ;
- une grande carte centrale ;
- quatre articles dans « Sélection » ;
- l’absence de déplacement indésirable de la publicité.

Vérification globale finale :

- 92 fichiers de tests passés ;
- 540 tests passés ;
- aucune erreur de test ;
- aucune erreur ESLint ;
- 11 avertissements ESLint préexistants ;
- TypeScript validé ;
- build Next.js réussi ;
- `git diff --check` validé.

## Travail restant

Avant une utilisation sur la base principale :

- relire le diff final ;
- pousser la branche ;
- ouvrir et faire relire la pull request ;
- appliquer la migration dans l’environnement cible ;
- effectuer une première activation supervisée ;
- vérifier immédiatement la Une, le Studio, l’historique et le retour arrière.

Ne pas activer de tâche planifiée pendant cette phase.

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

### 5. Comportement actuellement validé

La simulation évalue une proposition sans modifier la base.

Lorsqu’un administrateur confirme l’application, le serveur recalcule la proposition. Il n’utilise pas aveuglément une composition envoyée par le navigateur.

Les choix humains portent le badge :

`Sélection humaine`

Les choix IA portent le badge :

`Sélection IA`

Les secours portent le badge :

`Secours chronologique`

Un choix humain non évalué par OpenAI n’affiche pas de faux score `0/100`.

### 6. Règles de sécurité à conserver

Ne jamais déplacer ou désactiver une publication verrouillée.

Ne jamais déplacer ou désactiver une publication d’origine `MANUAL`.

Ne jamais appliquer une composition lorsque l’arrêt d’urgence est actif.

Ne jamais faire confiance à une composition provenant directement du navigateur.

Ne jamais effectuer une application ou un retour arrière hors d’une transaction Prisma.

Ne jamais supprimer les anciennes publications pour simuler un remplacement.

Ne jamais nettoyer les doublons historiques sans un chantier séparé et validé.

Ne jamais supprimer ou recréer une migration déjà appliquée.

Ne jamais considérer un score OpenAI comme une autorisation suffisante. Les exclusions déterministes restent prioritaires.

### 7. Prochaine phase exacte

La prochaine phase consiste à préparer la pull request et la première activation supervisée.

Ordre recommandé :

1. vérifier que la branche est propre ;
2. relire le diff complet depuis `audit/studio-v4` ;
3. pousser `feat/apply-automated-home` ;
4. ouvrir la pull request ;
5. faire relire les migrations, les transactions et les protections humaines ;
6. fusionner seulement après validation ;
7. appliquer d’abord sur une copie récente de la base ;
8. effectuer ensuite une activation manuelle surveillée sur la base principale.

Aucune tâche périodique ne doit être ajoutée dans cette phase.

### 8. Contrôles de fin de chantier

Lancer dans cet ordre :

- `npx vitest run`
- `npx eslint .`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
- `git status -sb`

Dernier résultat obtenu le 5 septembre 2026 :

- 92 fichiers de tests passés ;
- 540 tests passés ;
- aucune erreur de test ;
- aucune erreur ESLint ;
- 11 avertissements ESLint préexistants ;
- TypeScript validé ;
- build Next.js réussi ;
- application réelle réussie sur une copie de la base ;
- retour arrière réel réussi sur cette copie ;
- base principale non modifiée.
