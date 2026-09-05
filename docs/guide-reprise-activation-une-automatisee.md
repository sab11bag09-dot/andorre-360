# Guide de reprise — première activation supervisée de la Une automatisée

Dernière mise à jour : 5 septembre 2026

## 1. Pourquoi ce document existe

Ce document sert de carte routière. Il explique ce qui a déjà été construit, ce qu’il reste à faire, pourquoi nous devons le faire et comment avancer sans abîmer la page d’accueil ni la base de données.

La règle principale est simple : nous avançons une petite étape à la fois. Après chaque étape, nous regardons le résultat. Si le résultat n’est pas exactement celui attendu, nous nous arrêtons avant de continuer.

## 2. Objectif final

L’objectif est de permettre à un administrateur de demander au système de composer la Une du site, puis d’appliquer cette composition de manière sûre.

Le système doit toujours :

- conserver les choix faits manuellement par un humain ;
- ne modifier que les anciennes publications automatiques non verrouillées ;
- enregistrer ce qu’il a fait ;
- donner un identifiant unique à chaque application ;
- pouvoir annuler une application et restaurer la composition précédente ;
- ne rien écrire lorsque l’arrêt d’urgence est actif ;
- rester manuel tant que plusieurs utilisations réelles n’ont pas été validées.

La structure attendue sur la page publique est :

- un article principal, appelé « hero » ;
- une mise en avant ;
- un grand format ;
- trois brèves dans « L’essentiel » ;
- cinq cartes au total : une grande carte centrale et quatre articles dans « Sélection ».

## 3. Ce qui est déjà terminé

Le chantier a été fusionné dans la branche `audit/studio-v4` par la pull request nº 120.

Le commit fusionné est :

`00d7200 feat(editorial): appliquer et restaurer la composition automatique de l’accueil (#120)`

Les éléments suivants sont construits :

- simulation éditoriale avec OpenAI ;
- règles déterministes d’admissibilité et de classement ;
- détection et protection des publications humaines ;
- application dans une seule transaction Prisma ;
- enregistrement des publications `AUTOMATED` et `FALLBACK` ;
- identifiant unique de run ;
- snapshot de la composition précédente ;
- historique éditorial d’application ;
- retour arrière transactionnel ;
- historique éditorial de retour arrière ;
- arrêt d’urgence ;
- boutons administratifs d’application et d’annulation ;
- recalcul côté serveur avant l’application ;
- protection contre une deuxième application du même run.

La validation finale du code a donné :

- 92 fichiers de tests passés ;
- 540 tests passés ;
- aucune erreur de test ;
- aucune erreur ESLint ;
- 11 avertissements ESLint préexistants ;
- TypeScript validé ;
- build Next.js réussi ;
- `git diff --check` validé ;
- CI GitHub réussie.

Une application et un retour arrière ont aussi été testés visuellement sur une copie isolée de la base SQLite. La base principale n’a pas été modifiée pendant ce test.

## 4. Ce qu’il reste à faire

Il reste à effectuer une première activation supervisée dans le véritable environnement cible.

« Supervisée » signifie qu’un humain reste devant l’écran pendant toute l’opération. Il regarde la proposition avant de l’appliquer, contrôle immédiatement la page publique après l’application et sait comment déclencher l’arrêt d’urgence ou le retour arrière.

Cette première activation ne doit pas devenir une tâche automatique. Aucun cron, aucune tâche planifiée et aucun déclenchement périodique ne doivent être ajoutés maintenant.

## 5. Les quatre règles les plus importantes

### Règle 1 — Ne jamais deviner quelle base est utilisée

Avant toute migration ou application, nous devons identifier le chemin exact de la base. Le fichier `./dev.db` n’est pas automatiquement la base de production. La variable `DATABASE_URL` peut désigner une autre base.

Si nous ne savons pas avec certitude quelle base est ciblée, nous nous arrêtons.

### Règle 2 — Toujours sauvegarder avant d’écrire

Une sauvegarde doit être créée avant la migration et conservée jusqu’à la fin des contrôles.

La sauvegarde doit être testée avec `PRAGMA integrity_check;`. Le résultat attendu est `ok`.

### Règle 3 — Ne pas tout activer en permanence

L’application et le retour arrière sont désactivés par défaut. Ils ne doivent être activés que dans l’environnement choisi et pendant une fenêtre supervisée.

### Règle 4 — S’arrêter au premier résultat inattendu

Une erreur, un nombre étrange, un choix humain déplacé, une publicité décalée, un doublon ou une zone vide inattendue signifie : ne pas continuer.

## 6. Les variables de sécurité

Le système utilise quatre variables :

- `AI_HOME_COMPOSITION_APPLY_ENABLED=true` autorise l’application manuelle ;
- `AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true` autorise le retour arrière ;
- `AI_HOME_COMPOSITION_EMERGENCY_STOP=true` bloque l’application et le retour arrière ;
- `AI_AUTO_PUBLICATION_EMERGENCY_STOP=true` bloque aussi les écritures de composition.

Pour une activation supervisée, les valeurs temporaires attendues sont :

```env
AI_HOME_COMPOSITION_APPLY_ENABLED=true
AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true
AI_HOME_COMPOSITION_EMERGENCY_STOP=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=false
```

Ces valeurs ne doivent pas être ajoutées sans réflexion dans un fichier versionné. Elles doivent être configurées dans l’environnement d’exécution concerné.

En cas de problème pendant l’exploitation, l’arrêt d’urgence doit être activé :

```env
AI_HOME_COMPOSITION_EMERGENCY_STOP=true
```

L’application doit ensuite être redémarrée ou redéployée selon son mode d’hébergement pour prendre en compte la nouvelle valeur.

## 7. Procédure complète de reprise

### Étape 1 — Vérifier le code local

Se placer dans le dossier du projet, puis lancer :

```bash
git branch --show-current
git status -sb
git log --oneline -3
```

Résultat attendu :

- branche `audit/studio-v4` ;
- aucun fichier modifié ;
- commit `00d7200` visible en tête.

Si un fichier est modifié ou si la branche est différente, s’arrêter et comprendre pourquoi.

### Étape 2 — Identifier la base réellement ciblée

Afficher la configuration sans modifier la base :

```bash
printf 'DATABASE_URL=%s\n' "${DATABASE_URL:-non définie dans ce terminal}"
npx prisma migrate status
```

Il faut lire attentivement la ligne `Datasource` affichée par Prisma. Elle indique le fichier SQLite ciblé.

Ne pas lancer `prisma migrate deploy` tant que ce chemin n’a pas été confirmé.

### Étape 3 — Examiner la base sans la modifier

Lorsque le chemin exact est connu, le ranger dans une variable dédiée. Exemple seulement si le chemin confirmé est `./dev.db` :

```bash
TARGET_DB="./dev.db"
```

Puis contrôler :

```bash
sqlite3 "$TARGET_DB" "
PRAGMA integrity_check;
SELECT 'Publication', COUNT(*) FROM Publication;
SELECT 'EditorialEvent', COUNT(*) FROM EditorialEvent;
SELECT 'HomeAutomationRun', COUNT(*) FROM HomeAutomationRun;
PRAGMA foreign_key_check;
"
```

Résultats attendus :

- `integrity_check` répond `ok` ;
- `foreign_key_check` ne renvoie aucune ligne ;
- les nombres de lignes sont plausibles et sont notés pour comparaison ultérieure.

### Étape 4 — Créer une sauvegarde datée

Créer un dossier de sauvegarde explicite hors du dossier des migrations. Exemple :

```bash
BACKUP_DB="${TARGET_DB}.before-home-automation-$(date +%Y%m%d-%H%M%S).backup"
sqlite3 "$TARGET_DB" ".backup '$BACKUP_DB'"
printf 'Sauvegarde créée : %s\n' "$BACKUP_DB"
```

Tester immédiatement la sauvegarde :

```bash
sqlite3 "$BACKUP_DB" "
PRAGMA integrity_check;
SELECT 'Publication', COUNT(*) FROM Publication;
SELECT 'EditorialEvent', COUNT(*) FROM EditorialEvent;
SELECT 'HomeAutomationRun', COUNT(*) FROM HomeAutomationRun;
PRAGMA foreign_key_check;
"
```

Le contrôle doit répondre `ok`, ne produire aucune erreur de clé étrangère et afficher des nombres cohérents avec la base source.

Ne jamais supprimer cette sauvegarde pendant l’activation.

### Étape 5 — Contrôler les migrations

Lancer :

```bash
npx prisma migrate status
```

Si Prisma dit que la base est à jour, ne lancer aucune migration supplémentaire.

Si Prisma indique qu’une migration doit être appliquée, vérifier une deuxième fois que `DATABASE_URL` cible la bonne base, puis seulement après cette confirmation lancer :

```bash
npx prisma migrate deploy
```

Après le déploiement :

```bash
npx prisma migrate status
npx prisma generate
```

La base doit être déclarée à jour.

### Étape 6 — Contrôler le schéma après migration

```bash
sqlite3 "$TARGET_DB" "
PRAGMA integrity_check;
PRAGMA foreign_key_check;
SELECT name FROM sqlite_master
WHERE type = 'table' AND name = 'HomeAutomationRun';
"
```

Résultats attendus :

- `ok` ;
- aucune ligne d’erreur de clé étrangère ;
- la table `HomeAutomationRun` existe.

### Étape 7 — Configurer la fenêtre d’activation

Configurer temporairement les variables de sécurité dans l’environnement cible :

```env
AI_HOME_COMPOSITION_APPLY_ENABLED=true
AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true
AI_HOME_COMPOSITION_EMERGENCY_STOP=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=false
```

Puis redémarrer ou redéployer l’application pour que les variables soient chargées.

Ne pas cliquer sur « Appliquer » avant d’avoir terminé les étapes précédentes.

### Étape 8 — Ouvrir la simulation

Se connecter avec un compte administrateur, puis ouvrir :

`/admin/diffusion/simulation`

Cliquer sur le bouton de simulation et examiner toute la proposition.

Contrôler notamment :

- les placements humains sont toujours présents ;
- « L’essentiel » contient au maximum trois brèves ;
- la grande carte centrale est cohérente ;
- « Sélection » contient quatre articles ;
- aucun article n’apparaît deux fois ;
- aucune zone importante n’est vide sans raison ;
- les scores et motifs paraissent cohérents ;
- aucun message technique secret n’est affiché.

Si la proposition n’est pas satisfaisante, ne pas l’appliquer.

### Étape 9 — Appliquer une seule fois

Cliquer une seule fois sur « Recalculer et appliquer la proposition ».

Le serveur recalcule la proposition avant de l’appliquer. Il ne fait pas confiance à une ancienne composition conservée dans le navigateur.

Noter immédiatement l’identifiant du run affiché. Exemple de variable :

```bash
RUN_ID="identifiant-affiché-dans-le-studio"
```

Ne jamais inventer cet identifiant. Il doit être copié exactement.

### Étape 10 — Vérifier visuellement immédiatement

Ouvrir la page publique dans un nouvel onglet et contrôler :

- le hero ;
- la mise en avant ;
- les trois brèves de « L’essentiel » ;
- la grande carte centrale ;
- les quatre articles de « Sélection » ;
- la position de la publicité ;
- le grand format ;
- l’absence de doublon ;
- l’absence de disparition d’un choix humain.

Ouvrir aussi le Studio et le journal éditorial pour confirmer que l’opération est visible.

### Étape 11 — Vérifier la base avec l’identifiant du run

```bash
sqlite3 "$TARGET_DB" "
SELECT id, status, policyVersion, actorEmail, appliedAt, rolledBackAt
FROM HomeAutomationRun
WHERE id = '$RUN_ID';

SELECT id, articleId, zone, priority, active, origin, locked,
       automationScore, automationPolicyVersion, automationRunId
FROM Publication
WHERE automationRunId = '$RUN_ID'
ORDER BY zone, priority DESC, id;

SELECT action, articleId, actorEmail, details
FROM EditorialEvent
WHERE action = 'HOME_COMPOSITION_APPLIED'
ORDER BY id DESC
LIMIT 1;
"
```

Résultats attendus :

- le run existe avec le statut `APPLIED` ;
- toutes les publications du run ont `locked = 0` ;
- leur origine est `AUTOMATED` ou `FALLBACK` ;
- leur version de politique et leur identifiant de run sont remplis ;
- l’événement `HOME_COMPOSITION_APPLIED` existe ;
- les placements humains ne portent pas l’identifiant du run automatique.

### Étape 12 — Décider : conserver ou annuler

Pour une première activation, la décision doit être humaine.

Si la Une est correcte, le run peut rester appliqué, mais l’arrêt d’urgence doit rester immédiatement disponible.

Si quelque chose est incorrect, utiliser le bouton « Annuler ce run » associé au run affiché.

Après le retour arrière, contrôler visuellement la page publique et lancer :

```bash
sqlite3 "$TARGET_DB" "
SELECT id, status, appliedAt, rolledBackAt
FROM HomeAutomationRun
WHERE id = '$RUN_ID';

SELECT action, actorEmail, details
FROM EditorialEvent
WHERE action = 'HOME_COMPOSITION_ROLLED_BACK'
ORDER BY id DESC
LIMIT 1;
"
```

Le statut attendu est `ROLLED_BACK` et un événement de retour arrière doit exister.

### Étape 13 — Refermer la fenêtre d’activation

Après les contrôles, décider explicitement si l’application manuelle doit rester disponible.

Pour refermer complètement la fenêtre :

```env
AI_HOME_COMPOSITION_APPLY_ENABLED=false
AI_HOME_COMPOSITION_ROLLBACK_ENABLED=false
AI_HOME_COMPOSITION_EMERGENCY_STOP=true
```

Puis redémarrer ou redéployer l’application.

La simulation peut rester accessible même lorsque les écritures sont bloquées.

## 8. Quand utiliser l’arrêt d’urgence

Activer immédiatement l’arrêt d’urgence si l’un de ces événements apparaît :

- un choix humain est déplacé ou désactivé ;
- un article apparaît plusieurs fois ;
- une publicité change de place de manière inattendue ;
- plus de trois brèves apparaissent dans « L’essentiel » ;
- moins de quatre articles apparaissent dans « Sélection » alors que cinq cartes sont disponibles ;
- une application se répète ;
- une erreur de base de données apparaît ;
- l’historique ou le run n’est pas enregistré ;
- le retour arrière ne restaure pas la composition précédente.

Après activation de l’arrêt d’urgence, ne pas essayer plusieurs clics pour « voir si cela finit par marcher ». Conserver les journaux et l’identifiant du run, puis diagnostiquer calmement.

## 9. Différence entre retour arrière et restauration de sauvegarde

Le retour arrière intégré est le premier outil à utiliser lorsqu’un run valide a produit une composition insatisfaisante. Il connaît l’identifiant du run et le snapshot enregistré.

La sauvegarde SQLite est une protection plus large. Sa restauration est une opération plus grave qui peut effacer toutes les modifications réalisées après la sauvegarde. Elle ne doit donc pas être restaurée automatiquement ni sans confirmer exactement la base cible et les données qui seraient perdues.

## 10. Ce qu’il ne faut pas encore faire

Ne pas :

- créer une tâche planifiée ;
- appliquer automatiquement une proposition sans administrateur ;
- activer les variables dans un fichier versionné par défaut ;
- désactiver les protections humaines ;
- supprimer les anciens runs ou événements pour « nettoyer » ;
- supprimer une migration déjà appliquée ;
- tester directement sur la base cible sans sauvegarde ;
- restaurer une sauvegarde sans mesurer les données plus récentes qui seraient perdues.

## 11. Quand considérer cette phase comme terminée

La phase est terminée lorsque :

- la bonne base a été identifiée ;
- une sauvegarde valide existe ;
- les migrations sont à jour ;
- une simulation a été relue par un administrateur ;
- une application manuelle a réussi ;
- les choix humains sont restés intacts ;
- la structure visuelle est correcte ;
- le run, les métadonnées et l’historique sont corrects ;
- le retour arrière a été testé ou sa disponibilité a été formellement vérifiée ;
- les variables finales ont été décidées explicitement ;
- aucune tâche planifiée n’a été ajoutée.

## 12. Point exact de reprise

À la prochaine reprise, commencer uniquement par les contrôles en lecture seule suivants :

```bash
git branch --show-current
git status -sb
git log --oneline -3

printf 'DATABASE_URL=%s\n' "${DATABASE_URL:-non définie dans ce terminal}"
npx prisma migrate status
```

Ensuite, partager toute la sortie avant de lancer une migration, de créer une sauvegarde ou d’activer l’application.

