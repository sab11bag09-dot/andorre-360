# Guide de travail avec GitHub

Date de création : 1 août 2026

## 1. Objet du document

Ce document définit la manière de travailler avec Git et GitHub sur le projet Andorre 360.

Il s’adresse :

- au propriétaire du projet ;
- aux développeurs ;
- aux assistants ou agents qui reprennent une session ;
- à toute personne chargée de relire, tester ou intégrer une modification.

Son objectif est d’éviter :

- la perte de travail ;
- les changements directement sur la branche principale ;
- les commits contenant des fichiers sans rapport ;
- les conflits difficiles à résoudre ;
- l’envoi de secrets ou de données locales sur GitHub ;
- l’intégration de code non testé ;
- les reprises de chantier sans contexte.

## 2. Configuration actuelle du projet

Dépôt GitHub :

```text
https://github.com/sab11bag09-dot/andorre-360
```

Dépôt distant configuré localement :

```text
origin
```

URL Git :

```text
https://github.com/sab11bag09-dot/andorre-360.git
```

Branche du chantier multilingue :

```text
feature/editorial-pipeline-multilingual
```

Branche distante correspondante :

```text
origin/feature/editorial-pipeline-multilingual
```

La branche locale suit déjà la branche distante.

Pour vérifier la branche principale définie sur GitHub :

```bash
git remote show origin
```

Lire la ligne :

```text
HEAD branch
```

Ne pas supposer le nom de la branche principale avant cette vérification.

## 3. Pourquoi utiliser GitHub

GitHub remplit plusieurs fonctions distinctes.

### 3.1 Sauvegarde distante du code

Un commit local existe uniquement sur le Mac tant qu’il n’a pas été poussé.

La commande :

```bash
git push
```

envoie les commits locaux vers GitHub.

Un travail non poussé peut être perdu en cas de panne, perte ou remplacement de l’ordinateur.

### 3.2 Historique

Chaque commit enregistre :

- les fichiers modifiés ;
- l’auteur ;
- la date ;
- le message décrivant l’intention ;
- le lien avec les commits précédents.

L’historique permet de comprendre pourquoi un changement a été réalisé.

### 3.3 Travail par branches

Une branche permet de développer une fonctionnalité sans modifier immédiatement la version principale.

Exemple :

```text
feature/editorial-pipeline-multilingual
```

Le chantier reste isolé jusqu’à sa validation et son intégration.

### 3.4 Relecture par pull request

Une pull request permet :

- de présenter l’objectif ;
- de voir tous les changements ;
- de documenter les tests ;
- de recevoir une relecture ;
- de détecter les erreurs automatisées ;
- d’intégrer le travail de manière contrôlée.

### 3.5 Continuité entre les sessions

Une nouvelle session peut retrouver :

- la branche ;
- les commits ;
- les documents ;
- le diff ;
- les décisions enregistrées.

GitHub ne remplace pas une passation, mais rend cette passation vérifiable.

## 4. Ce que GitHub sauvegarde

GitHub sauvegarde uniquement les fichiers suivis par Git et inclus dans des commits poussés.

Exemples :

- code source ;
- tests ;
- schéma Prisma ;
- migrations commitées ;
- documentation ;
- configuration non secrète ;
- ressources volontairement versionnées.

## 5. Ce que GitHub ne sauvegarde pas automatiquement

GitHub ne sauvegarde pas :

- les modifications non commitées ;
- les commits non poussés ;
- les variables contenues dans `.env` ;
- la base locale ;
- les sauvegardes locales de base ;
- les médias non versionnés ;
- les fichiers ignorés par `.gitignore` ;
- les données créées manuellement pendant les tests ;
- les dépendances installées dans `node_modules` ;
- les résultats locaux de build ;
- les sessions ouvertes dans le navigateur.

Un push Git ne remplace donc pas une sauvegarde de base de données.

## 6. Vocabulaire essentiel

| Terme | Signification |
|---|---|
| Dépôt local | Copie du projet présente sur le Mac |
| Dépôt distant | Copie GitHub du projet |
| `origin` | Nom local du dépôt GitHub |
| Branche | Ligne de travail indépendante |
| Commit | Point d’enregistrement versionné |
| Index ou staging | Sélection préparée pour le prochain commit |
| Push | Envoi des commits locaux vers GitHub |
| Fetch | Récupération des informations distantes sans modifier les fichiers |
| Pull | Récupération et intégration des commits distants |
| Pull request | Demande de relecture et d’intégration |
| Merge | Intégration d’une branche dans une autre |
| Conflit | Modification incompatible entre deux historiques |
| Tag | Repère nommé sur un commit |
| HEAD | Commit actuellement sélectionné |

## 7. Règles fondamentales

### 7.1 Ne pas développer directement sur la branche principale

Toute fonctionnalité importante doit utiliser une branche dédiée.

Exemples :

```text
feature/editorial-pipeline-multilingual
feature/publication-translations
fix/translation-status-race
docs/github-workflow
```

### 7.2 Vérifier la branche avant de travailler

Commande :

```bash
git status -sb
```

La première ligne indique la branche active.

Ne jamais modifier des fichiers avant d’avoir confirmé la branche.

### 7.3 Commiter par lots cohérents

Un commit doit correspondre à une seule intention.

Bon exemple :

```text
feat: ajouter le workflow des traductions
```

Mauvais exemple :

```text
modifications diverses
```

Un commit ne doit pas mélanger :

- fonctionnalité ;
- correction sans rapport ;
- formatage global ;
- documentation indépendante ;
- migration différente ;
- fichier local accidentel.

### 7.4 Ajouter explicitement les fichiers

Préférer :

```bash
git add chemin/fichier-1 chemin/fichier-2
```

Éviter par défaut :

```bash
git add .
```

L’ajout explicite réduit le risque d’inclure un secret ou une modification sans rapport.

### 7.5 Vérifier avant de commiter

Toujours exécuter :

```bash
git status --short
git diff --check
git diff
```

Après `git add` :

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached
```

### 7.6 Pousser les points stables

Un commit local important doit être poussé dès qu’il constitue un point de reprise stable.

Commande :

```bash
git push
```

### 7.7 Ne jamais forcer sans raison validée

Ne pas utiliser :

```bash
git push --force
git push -f
git reset --hard
git clean -fd
```

Ces commandes peuvent supprimer du travail ou réécrire l’historique partagé.

Si l’une d’elles semble nécessaire, arrêter et vérifier la situation avant de continuer.

## 8. Procédure de début de session

### Étape 1 — Ouvrir le projet

```bash
cd /Users/SHAUNLEMOUTON/andorre-360
```

### Étape 2 — Vérifier l’état

```bash
git status -sb
```

Si des fichiers sont modifiés, déterminer à qui ils appartiennent et pourquoi avant toute action.

Ne jamais les supprimer automatiquement.

### Étape 3 — Vérifier les dépôts distants

```bash
git remote -v
```

Le projet doit afficher `origin` en lecture et en écriture.

### Étape 4 — Récupérer les informations GitHub

```bash
git fetch origin
```

Cette commande ne modifie pas les fichiers de travail.

### Étape 5 — Vérifier la synchronisation

```bash
git status -sb
```

Cas possibles :

- aucune indication : branche synchronisée ;
- `ahead` : commits locaux non poussés ;
- `behind` : commits distants à récupérer ;
- `diverged` : historiques divergents, arrêter avant toute intégration automatique.

### Étape 6 — Mettre à jour uniquement si possible en avance rapide

```bash
git pull --ff-only
```

Si cette commande refuse l’opération, ne pas utiliser une autre méthode au hasard. Examiner l’historique et les changements.

### Étape 7 — Lire la passation du chantier

Pour le chantier multilingue :

```text
docs/08-editorial-multilingual-handoff.md
docs/09-multilingual-delivery-plan.md
```

### Étape 8 — Vérifier le dernier commit

```bash
git log -5 --oneline
```

## 9. Procédure pendant le développement

### 9.1 Observer avant de modifier

Avant toute modification :

- lire le fichier ;
- identifier ses dépendances ;
- lire les tests existants ;
- vérifier le schéma de données ;
- chercher les appels existants ;
- préserver les changements sans rapport.

### 9.2 Modifier un petit lot à la fois

Ordre recommandé :

1. contrat ;
2. test ;
3. implémentation ;
4. vérification ;
5. commit.

Pour une modification de schéma :

1. sauvegarde de la base ;
2. modification Prisma ;
3. migration ;
4. génération du client ;
5. tests ;
6. build ;
7. commit séparé.

### 9.3 Vérifications régulières

Pendant le travail :

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
```

Avant un commit fonctionnel :

```bash
npm run build
```

### 9.4 Contrôle manuel

Un test automatique ne remplace pas toujours un contrôle fonctionnel.

Pour une interface :

- ouvrir la page ;
- tester le parcours normal ;
- tester un refus ;
- vérifier l’état de la base si nécessaire ;
- confirmer qu’aucune autre langue ou donnée n’a changé.

### 9.5 Ne pas masquer une erreur

Si un test, TypeScript ou le build échoue :

- conserver la sortie ;
- identifier la première cause ;
- corriger le lot actuel ;
- relancer les vérifications ;
- ne pas commiter en prétendant que le lot est validé.

## 10. Niveaux de validation

### 10.1 Documentation uniquement

Minimum :

```bash
git diff --check
```

Vérifier aussi :

- début du document ;
- fin du document ;
- absence de duplication ;
- liens et chemins cités.

### 10.2 Code sans changement de base

Minimum :

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
```

### 10.3 Schéma ou migration Prisma

Minimum :

```bash
git status --short
npx prisma migrate status
npx tsc --noEmit
npm test -- --run
npm run build
```

Ajouter :

- sauvegarde préalable ;
- vérification des données existantes ;
- contrôle de la migration générée ;
- test fonctionnel ciblé.

### 10.4 Publication ou action sensible

Ajouter :

- test de permission ou de statut ;
- test de concurrence ;
- contrôle manuel ;
- procédure de retrait ;
- confirmation qu’aucune publication automatique n’existe.

## 11. Procédure de commit

### Étape 1 — Examiner les fichiers

```bash
git status --short
git diff --stat
```

### Étape 2 — Ajouter les fichiers explicitement

```bash
git add fichier-1 fichier-2
```

### Étape 3 — Vérifier l’index

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached
```

### Étape 4 — Créer un message précis

Formats recommandés :

```text
feat: ajouter ...
fix: corriger ...
test: couvrir ...
docs: documenter ...
refactor: simplifier ...
chore: mettre a jour ...
```

Le message doit décrire l’intention, pas seulement le fichier.

### Étape 5 — Commiter

```bash
git commit -m "feat: description precise"
```

### Étape 6 — Vérifier

```bash
git status --short
git log -3 --oneline
```

Un commit réussi ne garantit pas que l’arbre est propre. Toujours vérifier.

## 12. Procédure de push

### Première publication d’une branche

```bash
git push -u origin nom-de-branche
```

L’option `-u` configure le suivi distant.

### Push suivant

```bash
git push
```

### Vérification

```bash
git status -sb
```

Une branche synchronisée ne doit pas afficher `ahead`.

### Règle

Ne jamais annoncer qu’un travail est sauvegardé sur GitHub avant d’avoir vu la confirmation du push.

## 13. Procédure de pull request

### 13.1 Quand ouvrir une pull request

Ouvrir une pull request lorsque :

- le lot forme un ensemble cohérent ;
- les tests passent ;
- le build réussit ;
- la documentation de passation existe ;
- la branche est poussée ;
- le diff a été relu.

Une pull request peut être créée en mode brouillon si le chantier continue.

### 13.2 Contenu recommandé

La pull request doit contenir :

- objectif ;
- contexte ;
- principales modifications ;
- règles métier ;
- migrations ;
- tests exécutés ;
- test manuel ;
- risques ;
- limites ;
- prochaines étapes ;
- captures d’écran si l’interface change.

### 13.3 Checklist recommandée

```text
- [ ] Diff relu
- [ ] Aucun secret
- [ ] TypeScript validé
- [ ] Tests validés
- [ ] Build validé
- [ ] Migration vérifiée
- [ ] Test manuel réalisé
- [ ] Documentation mise à jour
- [ ] Retour arrière identifié
```

### 13.4 Lien actuel du chantier multilingue

```text
https://github.com/sab11bag09-dot/andorre-360/pull/new/feature/editorial-pipeline-multilingual
```

### 13.5 Intégration

Ne pas fusionner automatiquement uniquement parce que GitHub affiche un bouton vert.

Avant l’intégration :

- lire les contrôles automatisés ;
- traiter les commentaires ;
- vérifier la branche cible ;
- confirmer les migrations ;
- confirmer le plan de déploiement.

La méthode de fusion doit respecter la règle du dépôt.

Si aucune règle n’est définie, décider explicitement entre :

- squash merge pour un historique principal compact ;
- merge commit pour conserver la structure de la branche ;
- rebase merge pour un historique linéaire.

Ne pas choisir implicitement.

## 14. Synchronisation et conflits

### 14.1 Récupérer les nouveautés

```bash
git fetch origin
```

### 14.2 Vérifier la divergence

```bash
git status -sb
git log --oneline --decorate --graph --all -20
```

### 14.3 Mise à jour simple

```bash
git pull --ff-only
```

### 14.4 En cas de conflit ou divergence

Arrêter les modifications.

Vérifier :

- les commits locaux ;
- les commits distants ;
- les fichiers concernés ;
- la présence de changements non commités.

Ne pas utiliser `reset --hard` ou `push --force` pour faire disparaître le problème.

Une résolution de conflit doit être suivie de :

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
```

## 15. Gestion des erreurs et retour arrière

### 15.1 Retirer un fichier de l’index sans perdre son contenu

```bash
git restore --staged chemin/fichier
```

Cette commande retire le fichier du prochain commit, mais conserve sa modification locale.

### 15.2 Annuler un commit déjà partagé

Préférer :

```bash
git revert HASH_DU_COMMIT
```

`git revert` crée un nouveau commit inverse et préserve l’historique.

### 15.3 Ne pas effacer silencieusement le travail

Ne pas utiliser sans décision explicite :

```bash
git reset --hard
git checkout -- fichier
git restore fichier
git clean -fd
```

Ces commandes peuvent supprimer des modifications non sauvegardées.

### 15.4 En cas de doute

Commencer par des commandes en lecture seule :

```bash
git status
git diff
git diff --cached
git log --oneline
git reflog
```

Ne lancer une opération destructive qu’après avoir identifié exactement ce qu’elle supprimera.

## 16. Secrets et fichiers interdits

Ne jamais commiter :

- `.env` ;
- clés d’API ;
- mots de passe ;
- jetons GitHub ;
- cookies ;
- secrets NextAuth ;
- URL de base contenant des identifiants ;
- sauvegardes de base ;
- bases locales ;
- exports contenant des utilisateurs ;
- journaux contenant des données sensibles ;
- fichiers privés de production.

Avant chaque commit sensible :

```bash
git diff --cached
```

Si un secret est envoyé sur GitHub :

1. considérer le secret comme compromis ;
2. le révoquer ou le remplacer immédiatement ;
3. retirer le secret du code ;
4. vérifier l’historique ;
5. documenter l’incident ;
6. ne pas se contenter de supprimer le fichier dans un commit suivant.

## 17. Bases de données et migrations

GitHub versionne :

- le schéma Prisma ;
- les migrations ;
- les scripts nécessaires.

GitHub ne sauvegarde pas automatiquement :

- la base locale ;
- les données manuelles ;
- les sauvegardes ;
- les données de production.

Avant une migration :

```bash
git status --short
npx prisma migrate status
```

Règles :

- sauvegarder la base ;
- nommer clairement la migration ;
- lire les instructions SQL générées ;
- vérifier les données après migration ;
- isoler la migration dans un commit cohérent ;
- documenter le retour arrière ;
- ne jamais tester une suppression destructive sur la base de production.

## 18. Documents de passation

Un chantier long doit posséder deux types de documents.

### État actuel

Il explique :

- ce qui existe ;
- les fichiers ;
- les tests ;
- les commits ;
- les limites ;
- les données de test.

Exemple :

```text
docs/08-editorial-multilingual-handoff.md
```

### Plan de continuité

Il explique :

- la finalité ;
- les décisions ;
- les lots ;
- les critères ;
- les risques ;
- le déploiement ;
- le retour arrière.

Exemple :

```text
docs/09-multilingual-delivery-plan.md
```

Les documents doivent être commités et poussés, sinon ils ne constituent pas une passation distante.

## 19. Procédure de fin de session

### Étape 1 — Vérifications

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
```

Adapter les vérifications si la session ne modifie que la documentation.

### Étape 2 — Commit

```bash
git status --short
git add fichiers-explicites
git diff --cached --check
git commit -m "type: description"
```

### Étape 3 — Vérifier l’arbre

```bash
git status --short
```

### Étape 4 — Pousser

```bash
git push
```

### Étape 5 — Vérifier la synchronisation

```bash
git status -sb
```

### Étape 6 — Mettre à jour la passation

Indiquer :

- branche ;
- dernier commit ;
- tests ;
- build ;
- travail non commité ;
- prochaine action exacte ;
- décision encore attendue.

### Étape 7 — Donner la consigne de reprise

Exemple :

```text
Reprendre sur la branche feature/editorial-pipeline-multilingual.
Lire docs/08-editorial-multilingual-handoff.md,
docs/09-multilingual-delivery-plan.md
et docs/10-github-workflow.md.
Vérifier git status -sb et git log -5 --oneline avant toute modification.
```

## 20. État GitHub du chantier multilingue

La branche a été poussée avec succès vers :

```text
origin/feature/editorial-pipeline-multilingual
```

Le push a configuré le suivi distant.

Dernier commit connu au moment de la création initiale de ce guide :

```text
5774741 docs: confirmer les decisions multilingues
```

Ce hash est un repère historique. Toujours vérifier le dernier commit réel avec :

```bash
git log -1 --oneline
```

La prochaine modification du présent document créera nécessairement un commit plus récent.

## 21. Commandes de référence rapide

### Observer

```bash
git status -sb
git status --short
git diff
git diff --stat
git log -5 --oneline
git remote -v
```

### Synchroniser

```bash
git fetch origin
git pull --ff-only
git push
```

### Préparer un commit

```bash
git add chemin/fichier
git diff --cached --check
git diff --cached --stat
git diff --cached
```

### Valider le projet

```bash
git diff --check
npx tsc --noEmit
npm test -- --run
npm run build
```

### Vérifier Prisma

```bash
npx prisma migrate status
```

### Retirer de l’index sans perdre le travail

```bash
git restore --staged chemin/fichier
```

### Annuler proprement un commit partagé

```bash
git revert HASH_DU_COMMIT
```

## 22. Définition d’un point stable

Un point est considéré comme stable lorsque :

- la branche est correcte ;
- le diff est compris ;
- aucun secret n’est présent ;
- TypeScript passe ;
- les tests passent ;
- le build passe pour un changement fonctionnel ;
- le test manuel requis est terminé ;
- le commit est cohérent ;
- l’arbre Git est propre ;
- le commit est poussé ;
- la passation indique la prochaine action.

Un commit non poussé n’est pas encore un point stable distant.

## 23. Directive pour tout nouvel intervenant

Avant de modifier le projet :

1. lire ce document ;
2. vérifier la branche ;
3. vérifier l’état Git ;
4. récupérer les informations distantes ;
5. lire la passation du chantier concerné ;
6. vérifier le dernier commit ;
7. ne supprimer aucun changement local inconnu ;
8. confirmer les décisions produit déjà enregistrées ;
9. travailler par petits lots ;
10. tester, commiter et pousser chaque point stable.

En cas de contradiction entre une conversation ancienne et les fichiers présents dans GitHub, considérer le code, l’historique Git et les documents commités comme les sources vérifiables, puis demander confirmation avant toute action irréversible.