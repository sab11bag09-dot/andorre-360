# ANDORRE 360 — Guide du chantier d’automatisation éditoriale

**Dernière mise à jour : 9 septembre 2026**  
**État du projet : chantier de développement local — aucune mise en production**

## 1. À quoi sert ce document ?

Ce document explique, avec des mots simples :

- ce que nous construisons dans ANDORRE 360 ;
- ce qui fonctionne déjà ;
- les essais qui ont été réalisés ;
- les problèmes rencontrés et ce qu’ils nous ont appris ;
- les protections actuellement en place ;
- ce qu’il reste à développer ;
- l’ordre conseillé pour reprendre le travail.

Il est volontairement détaillé afin qu’une personne qui découvre le projet puisse comprendre le fonctionnement général sans connaître tout le code.

Ce guide complète les documents techniques déjà présents dans le dossier `docs/`. Il ne remplace ni les tests automatisés ni l’historique Git.

---

## 2. La vision finale

À terme, ANDORRE 360 doit pouvoir faire fonctionner une chaîne éditoriale largement automatisée.

L’objectif est qu’une intelligence artificielle puisse :

1. consulter régulièrement les sources configurées ;
2. détecter les nouvelles informations ;
3. éliminer les contenus inutilisables, trop anciens ou suspects ;
4. choisir les informations qui méritent un article ;
5. rédiger un article original et fidèle aux faits ;
6. générer les versions linguistiques nécessaires ;
7. effectuer des contrôles éditoriaux et techniques ;
8. publier les articles autorisés ;
9. proposer puis gérer la composition de la page d’accueil ;
10. conserver un historique complet de ses décisions ;
11. revenir en arrière en cas de problème.

L’automatisation complète reste donc bien la destination du projet.

Cependant, nous ne voulons pas passer directement d’un fonctionnement manuel à une autonomie totale. Le chantier avance par étapes vérifiables. À chaque étape, nous conservons :

- un bouton d’arrêt d’urgence ;
- des règles explicites ;
- des journaux d’audit ;
- des tests ;
- une possibilité de retour arrière ;
- une validation humaine tant que le niveau de fiabilité requis n’est pas atteint.

Ce fonctionnement progressif n’est pas une remise en cause de l’objectif final. C’est la méthode choisie pour y arriver sans perdre le contrôle du système.

---

## 3. Le vocabulaire essentiel

### Source

Une source est un site surveillé par ANDORRE 360 : institution, commune, média, association, club sportif, entreprise, etc.

Chaque source possède notamment :

- une adresse ;
- un mode de collecte ;
- un niveau de confiance ;
- un mode de publication ;
- un intervalle entre deux vérifications ;
- un état indiquant si elle est disponible.

### Collecte

La collecte consiste à visiter une source et à relever les contenus disponibles.

Une collecte ne publie pas automatiquement un article sur le site. Elle crée d’abord des observations.

### Observation

Une observation est une information brute récupérée depuis une source.

Elle contient généralement :

- le titre d’origine ;
- l’adresse de la page d’origine ;
- le texte collecté ;
- la date annoncée par la source ;
- l’identité de la source ;
- son état de traitement.

Une observation n’est pas encore un article ANDORRE 360.

### Brouillon IA

Lorsqu’une observation est traitée, le moteur éditorial peut créer un article rédigé par l’IA.

Cet article peut rester au statut `AI_DRAFT`, c’est-à-dire « brouillon IA ». Il est alors visible dans le Studio, mais pas sur le site public.

### Publication

La publication rend l’article accessible au public.

Elle ne doit pas être confondue avec :

- la collecte d’une source ;
- la création d’une observation ;
- la création d’un brouillon ;
- la mise en avant sur la page d’accueil.

### Composition de la page d’accueil

La composition détermine quels articles occupent les différentes zones de la page d’accueil, par exemple :

- Une principale ;
- grand format ;
- grande carte ;
- cartes éditoriales ;
- brèves ;
- autres zones secondaires.

Un article peut être publié sans être mis en avant. Inversement, une composition ne doit jamais rendre public un brouillon.

### Simulation

Une simulation est une proposition de composition. Elle permet d’examiner le résultat avant de modifier réellement la page d’accueil.

### Run

Un run est l’enregistrement d’une opération automatisée appliquée.

Il permet de savoir :

- quand l’opération a eu lieu ;
- qui l’a déclenchée ;
- quelles publications ont été créées ou désactivées ;
- quelle politique a été utilisée ;
- comment annuler l’opération.

### Retour arrière

Le retour arrière, ou rollback, annule une composition automatisée déjà appliquée et restaure autant que possible l’état précédent.

---

## 4. La chaîne éditoriale, étape par étape

Le fonctionnement général est le suivant :

1. **Collecter** les sources.
2. **Enregistrer** les nouveautés sous forme d’observations.
3. **Filtrer** les observations : date, doublon, qualité, origine et contenu.
4. **Générer** un brouillon d’article depuis une observation retenue.
5. **Contrôler** le brouillon : fidélité, langue, style, dates, chiffres, attribution et image.
6. **Traduire** l’article dans les langues requises.
7. **Publier** seulement si toutes les conditions sont réunies.
8. **Évaluer** les articles publiés pour la page d’accueil.
9. **Simuler** la composition de la page d’accueil.
10. **Appliquer** exactement la proposition examinée.
11. **Auditer** chaque décision.
12. **Revenir en arrière** si nécessaire.

Ces étapes sont séparées volontairement. Une erreur dans la collecte ne doit pas provoquer automatiquement une publication, et une erreur dans la composition ne doit pas modifier le contenu d’un article.

---

## 5. Ce qui a déjà été développé

### 5.1 Simulation automatisée de la page d’accueil

La pull request **#119** a introduit la simulation automatisée de l’accueil.

Référence Git :

- commit `469c60b` ;
- intitulé : `feat(editorial): automatiser la simulation de l’accueil`.

Le moteur peut évaluer des candidats et proposer une répartition dans les zones disponibles, sans appliquer immédiatement cette proposition.

### 5.2 Application et retour arrière

La pull request **#120** a ajouté :

- l’application manuelle d’une proposition ;
- l’enregistrement d’un run ;
- la possibilité d’annuler ce run ;
- la conservation des choix humains verrouillés ;
- les événements d’audit associés.

Référence Git :

- commit `00d7200` ;
- intitulé : `feat(editorial): appliquer et restaurer la composition automatique de l’accueil`.

### 5.3 Guide d’activation supervisée

La pull request **#121** a ajouté un premier guide opérationnel.

Référence Git :

- commit `dd5640b` ;
- intitulé : `docs(editorial): ajouter le guide d’activation supervisée`.

### 5.4 Application fidèle de la proposition examinée

La pull request **#122** a corrigé plusieurs points importants :

- la proposition réellement appliquée correspond à celle affichée à l’utilisateur ;
- un jeton protège la proposition contre un changement silencieux entre la simulation et l’application ;
- les cartes manquantes peuvent être complétées par un mécanisme de secours ;
- une zone « grand format » volontairement non pourvue reste vide ;
- un article exclu de la composition automatique n’est pas réintroduit par erreur dans une zone automatisée ;
- les choix humains restent prioritaires.

Référence Git :

- commit `822aff4` ;
- intitulé : `fix(editorial): appliquer fidèlement la composition examinée (#122)`.

Cette correction a notamment résolu un cas où l’article sur les carburants apparaissait en grand format alors que la simulation l’avait classé parmi les candidats exclus.

Une précision importante a ensuite été adoptée : lorsqu’une composition automatique active existe, une zone automatique vide doit conserver son contenant visuel, mais son contenu éditorial doit rester vide. Lorsqu’il n’existe plus de composition automatisée active, après un retour arrière par exemple, les mécanismes habituels de la Une peuvent à nouveau remplir la page.

### 5.5 Sécurisation de la création des brouillons IA

La pull request **#123** a séparé clairement :

- une demande humaine de création ou de régénération ;
- une future demande provenant d’un orchestrateur autonome autorisé.

Référence Git :

- commit de fusion `0590c6d63c6f3007707a5d919f7dccd5003c522b` ;
- intitulé : `fix(editorial): sécuriser la création des brouillons IA (#123)` ;
- fusion effectuée le 9 septembre 2026.

Désormais, une action humaine depuis l’écran des observations demande explicitement :

```ts
allowAutoPublication: false
```

Le résultat reste donc un brouillon, même si d’autres variables d’automatisation autoriseraient normalement une publication.

Le futur orchestrateur autonome pourra demander explicitement :

```ts
allowAutoPublication: true
```

Cette distinction évite qu’un clic humain destiné à examiner un brouillon déclenche involontairement sa publication.

Elle ne bloque pas l’automatisation future : elle impose simplement que l’acteur autonome se déclare explicitement.

---

## 6. Les vérifications déjà réussies

Après le correctif de sécurisation des brouillons, les contrôles complets ont donné :

- 94 fichiers de tests réussis ;
- 549 tests réussis ;
- aucune erreur ESLint ;
- 10 avertissements ESLint déjà connus ;
- validation TypeScript ;
- build Next.js réussi ;
- `git diff --check` réussi ;
- CI GitHub réussie.

La pull request #123 a été fusionnée dans la branche `audit/studio-v4`.

Au moment de cette fusion, la branche de référence était propre et synchronisée avec son dépôt distant.

---

## 7. État local du chantier

### 7.1 Base de données

Le projet utilise actuellement SQLite avec le fichier local :

```text
./dev.db
```

Prisma a confirmé :

- 31 migrations présentes ;
- schéma de la base à jour.

Avant l’essai supervisé, une sauvegarde a été créée :

```text
/var/folders/44/r5395xmn7sv7290gdmf8ncd80000gn/T/andorre-360-dev-before-supervised-run-20260908-215526.db
```

Cette sauvegarde faisait environ 7,1 Mo.

Les vérifications effectuées sur cette copie ont indiqué :

- intégrité SQLite : `ok` ;
- aucune erreur de clé étrangère ;
- 185 publications ;
- 450 événements éditoriaux ;
- 2 runs d’automatisation de l’accueil.

Cette adresse est propre au Mac de développement. Il faut donc toujours vérifier que le fichier existe encore avant de compter dessus.

### 7.2 Variables de sécurité utilisées pendant le test

Pendant le chantier local, les réglages observés étaient :

```dotenv
AI_HOME_COMPOSITION_APPLY_ENABLED=true
AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true
AI_HOME_COMPOSITION_EMERGENCY_STOP=false
MULTILINGUAL_PUBLICATION_ENABLED=true
AI_AUTO_PUBLICATION_ENABLED=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=true
```

La liste des sources autorisées à la publication automatique a été conservée, mais la publication automatique elle-même était désactivée et son arrêt d’urgence activé.

La collecte planifiée a également reçu un secret local `SOURCE_COLLECTION_SECRET`.

**La valeur de ce secret ne doit jamais être écrite dans un document, un commit, une capture d’écran ou un message.**

---

## 8. Premier essai de collecte supervisée

### 8.1 Ce qui a été lancé

La route interne utilisée est :

```text
POST /api/internal/sources/collect
```

Elle exige un en-tête d’autorisation contenant le secret de collecte.

La taille de lot par défaut est de 10 sources. Le maximum prévu par le code est de 50.

### 8.2 Résultat

Avant l’essai, la table `Observation` contenait 1 558 lignes.

Le premier lot a produit :

```json
{
  "attempted": 10,
  "succeeded": 10,
  "failed": 0,
  "collected": 146,
  "created": 50,
  "failures": []
}
```

Après l’essai :

- 1 608 observations étaient enregistrées ;
- 50 nouvelles observations avaient donc été créées ;
- les 10 sources avaient un état disponible ;
- les dates de dernière vérification et de dernier succès avaient été mises à jour ;
- aucune erreur de clé étrangère n’était présente.

### 8.3 Ce que cela prouve

Cela prouve que la collecte par lot fonctionne sur ces dix sources dans l’environnement local.

Cela ne prouve pas encore que :

- toutes les sources fonctionnent ;
- toutes les dates collectées sont correctes ;
- toutes les observations sont de bonne qualité ;
- la génération d’articles peut fonctionner sans surveillance ;
- la publication automatique est prête.

La collecte crée des observations. Elle ne doit pas, à elle seule, être assimilée à une publication.

---

## 9. Essai de simulation de la page d’accueil

Une simulation réalisée le 8 septembre 2026 vers 22 h 01 a donné :

- 30 candidats évalués ;
- 3 articles retenus ;
- les 3 articles retenus correspondaient à des sélections humaines verrouillées ;
- 1 emplacement grand format non pourvu ;
- 5 cartes éditoriales non pourvues ;
- 2 brèves non pourvues.

Cette situation était cohérente avec les données disponibles : les articles publics les plus récents dataient du 1er septembre 2026, donc ils avaient dépassé la fenêtre de fraîcheur de sept jours utilisée par la simulation.

Le moteur a préféré laisser des emplacements vides plutôt que d’utiliser automatiquement des articles trop anciens ou non admissibles.

La simulation n’a pas été appliquée.

---

## 10. Les anomalies découvertes

### 10.1 Dates futures incorrectes

Plusieurs observations provenant de la source « altaveu test 2 » possèdent des dates futures :

- observations 1768, 1769 et 1770 : décembre 2026 ;
- observation 1771 : novembre 2026.

Ces dates sont incohérentes avec la date du chantier, septembre 2026.

La cause probable est une mauvaise interprétation d’un format de date, par exemple une confusion entre :

- jour/mois ;
- mois/jour.

Ces observations ne doivent pas être sélectionnées par un futur orchestrateur tant que le parseur n’est pas corrigé.

Il ne faut pas modifier manuellement leurs dates uniquement pour faire passer un test. Le correctif doit être réalisé dans le code, couvert par des tests et applicable aux prochaines collectes.

### 10.2 Qualité insuffisante du brouillon test

L’observation 2156 a servi de test.

Elle concernait les travaux d’une installation photovoltaïque au Complexe sportif et socioculturel d’Encamp.

Caractéristiques de l’observation :

- source : Encamp ;
- niveau de confiance : `HIGH` ;
- mode de publication de la source : `AUTO` ;
- contenu : environ 2 032 caractères ;
- date d’origine : 2 septembre 2026 ;
- aucun article correspondant n’existait avant le test.

Le moteur a créé l’article 492 :

- statut : `AI_DRAFT` ;
- publié : non ;
- observation marquée comme traitée ;
- observation reliée à l’article 492 ;
- aucune traduction publiée ;
- événement d’audit enregistré ;
- motif de non-publication : `emergency_stop`.

Le mécanisme de sécurité a donc fonctionné.

En revanche, l’examen éditorial du contenu a révélé plusieurs défauts :

- le texte ressemble trop à une traduction de la source et pas assez à une réécriture journalistique originale ;
- l’expression « ce matin » perd son sens lorsque l’article est généré plusieurs jours plus tard ;
- `Escola Bressol` a été rendu par « École maternelle », alors qu’il s’agit plutôt d’une structure de petite enfance ou d’une crèche ;
- certains nombres utilisent une typographie peu naturelle en français ;
- des espaces manquent dans certains passages, par exemple `estde` ou `bâtimentscommunaux` ;
- l’acronyme `LITECC` n’est pas expliqué ;
- l’image est encore une image générique ;
- la source est affichée comme auteur, ce qui demande une clarification éditoriale ;
- l’audit indiquait un générateur déterministe, alors que le chemin de génération réellement utilisé doit être vérifié.

Conclusion : la création technique du brouillon fonctionne, mais sa qualité n’est pas encore suffisante pour une publication autonome.

### 10.3 Dates de référence et fraîcheur

Le générateur doit connaître :

- la date de publication annoncée par la source ;
- la date réelle de génération ;
- éventuellement la date de l’événement.

Sans ce contexte, il risque de conserver des expressions relatives devenues fausses :

- aujourd’hui ;
- hier ;
- demain ;
- ce matin ;
- la semaine prochaine.

Le futur moteur devra transformer ces expressions en dates absolues ou les reformuler.

---

## 11. Pourquoi la publication automatique a été désactivée pendant l’essai

Elle a été désactivée afin d’observer séparément :

1. la collecte ;
2. la création du brouillon ;
3. la qualité du texte ;
4. la décision de publication.

Cette précaution a permis de constater les défauts du brouillon 492 sans les exposer au public.

Le danger n’était pas « l’IA » en elle-même. Le danger venait de l’enchaînement immédiat de plusieurs actions alors que nous n’avions pas encore vérifié :

- la date ;
- la qualité linguistique ;
- la fidélité aux faits ;
- l’image ;
- les traductions ;
- la bonne attribution ;
- les règles de publication ;
- la capacité de retour arrière.

Lorsque le moteur autonome sera prêt, il devra évidemment pouvoir publier automatiquement. Le correctif #123 prévoit déjà cette possibilité avec `allowAutoPublication: true`.

La règle actuelle est donc :

- action humaine dans le Studio : création d’un brouillon ;
- futur orchestrateur autonome explicitement autorisé : publication automatique possible, sous réserve de tous les autres contrôles.

---

## 12. Ce que nous ne devons pas faire pour le moment

Tant que les lots de correction suivants ne sont pas terminés :

- ne pas publier l’article 492 ;
- ne pas valider ni régénérer l’article 492 sans objectif de test défini ;
- ne pas supprimer l’article 492, car il constitue une preuve utile du comportement actuel ;
- ne pas réactiver la publication automatique globale ;
- ne pas désactiver l’arrêt d’urgence de la publication automatique ;
- ne pas appliquer une ancienne simulation devenue obsolète ;
- ne pas corriger manuellement les dates futures dans la base pour masquer le défaut du parseur ;
- ne pas déployer en production ;
- ne pas confondre le renouvellement des dépendances avec la feuille de route fonctionnelle ;
- ne jamais placer un secret dans Git.

Le projet est un chantier. Les données de développement peuvent servir de preuves et de cas de régression.

---

## 13. Feuille de route recommandée

### Lot A — Corriger et bloquer les dates futures

Il s’agit du prochain lot recommandé.

Objectifs :

- identifier le parseur responsable des dates Altaveu ;
- interpréter correctement les formats jour/mois/année ;
- ajouter une protection générique contre les dates manifestement futures ;
- ne pas remplacer silencieusement une date erronée par la date du jour ;
- conserver une trace expliquant pourquoi une observation est rejetée ou considérée comme non datée ;
- ajouter des tests couvrant les exemples observés.

Branche suggérée :

```text
fix/reject-future-observation-dates
```

Le correctif doit agir à l’entrée du système afin qu’une mauvaise date ne puisse pas influencer :

- le classement des observations ;
- la sélection des sujets ;
- la rédaction ;
- la publication ;
- la composition de la page d’accueil.

### Lot B — Améliorer la génération des articles

Objectifs :

- transmettre explicitement la date de la source au générateur ;
- interdire ou reformuler les références temporelles relatives ;
- nettoyer les espaces et la ponctuation ;
- appliquer la typographie française aux nombres et aux montants ;
- expliquer les acronymes ;
- améliorer les traductions des noms d’institutions ;
- distinguer la source, l’auteur et la signature éditoriale ;
- vérifier l’origine réelle du générateur dans l’audit ;
- choisir une image pertinente ou bloquer la publication si aucune image convenable n’existe ;
- produire une réécriture originale, fidèle aux faits, et pas une simple traduction.

Ce lot doit inclure des tests de non-régression basés sur le cas de l’article 492.

### Lot C — Construire l’orchestrateur autonome des articles

Le futur orchestrateur devra choisir les observations à traiter.

Il devra au minimum :

- sélectionner uniquement les observations non traitées ;
- refuser les dates futures ;
- appliquer une fenêtre de fraîcheur explicite ;
- gérer les observations sans date ;
- éliminer les doublons ;
- vérifier une longueur minimale de contenu ;
- respecter le niveau de confiance de la source ;
- respecter la liste des sources autorisées ;
- appeler la création d’article avec `allowAutoPublication: true` seulement lorsqu’il agit réellement comme orchestrateur autorisé ;
- générer les traductions obligatoires ;
- vérifier les statuts avant publication ;
- enregistrer chaque décision dans l’audit ;
- être idempotent, c’est-à-dire ne pas créer deux articles lorsqu’il est relancé ;
- gérer les erreurs source par source sans arrêter tout le lot ;
- prévoir des reprises et des délais entre les tentatives.

### Lot D — Multiplier les essais supervisés

Avant l’autonomie complète :

- lancer plusieurs lots de collecte ;
- examiner les observations créées ;
- générer plusieurs brouillons représentatifs ;
- tester des sources institutionnelles, médiatiques, sportives et commerciales ;
- comparer les décisions automatiques aux décisions humaines ;
- vérifier les traductions ;
- appliquer puis annuler des compositions de page d’accueil ;
- contrôler la base après chaque opération ;
- documenter les anomalies récurrentes.

### Lot E — Automatiser l’ensemble de la chaîne

Quand les lots précédents seront suffisamment fiables :

- planifier la collecte ;
- planifier la sélection des observations ;
- générer et publier les articles admissibles ;
- laisser les articles incertains en relecture ;
- actualiser automatiquement la page d’accueil ;
- déclencher des alertes en cas d’échec ;
- surveiller les taux d’erreur ;
- conserver un bouton d’arrêt global ;
- conserver un retour arrière opérationnel.

### Déploiement

Le déploiement en production est volontairement reporté jusqu’à ce que le projet soit terminé et validé.

Avant ce déploiement, il faudra au minimum :

- utiliser une base adaptée à la production ;
- externaliser et protéger les secrets ;
- mettre en place les sauvegardes ;
- configurer le planificateur ;
- définir la supervision ;
- tester la restauration ;
- vérifier les droits d’accès ;
- valider la politique éditoriale ;
- effectuer un essai de bout en bout dans un environnement intermédiaire.

---

## 14. Sujet mis de côté : synthèse de plusieurs médias

Une piste importante a été évoquée pour les contenus provenant de médias :

- repérer une même information chez plusieurs médias ;
- comparer les faits rapportés ;
- identifier les points communs et les divergences ;
- produire une synthèse originale et attribuée ;
- citer clairement les sources.

Cette approche pourrait améliorer :

- la qualité journalistique ;
- la vérification des faits ;
- la pluralité des points de vue ;
- la distance entre le texte final et une source unique.

Elle ne constitue cependant pas, à elle seule, une garantie juridique concernant les droits voisins ou le droit d’auteur. Une validation juridique dédiée restera nécessaire avant tout usage en production.

Ce chantier multisource est volontairement mis de côté pour le moment. Il devra faire l’objet d’une conception séparée : rapprochement des sujets, gestion des sources, citations, contradictions, preuves et règles de rédaction.

---

## 15. Procédure de reprise du chantier

### Étape 1 — Vérifier la branche principale de travail

```bash
git switch audit/studio-v4
git pull --ff-only origin audit/studio-v4
git status -sb
git log --oneline -4
```

Le commit `0590c6d` ou un commit plus récent doit apparaître dans l’historique.

Le statut Git doit être propre avant de créer une nouvelle branche.

### Étape 2 — Vérifier la base locale

```bash
npx prisma migrate status
```

Avant toute écriture importante, créer une sauvegarde SQLite et vérifier :

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```

### Étape 3 — Vérifier les protections

Ne jamais afficher la valeur des secrets.

Vérifier seulement la présence et l’état des variables nécessaires.

Pour le prochain correctif, la publication automatique doit rester désactivée :

```dotenv
AI_AUTO_PUBLICATION_ENABLED=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=true
```

### Étape 4 — Créer la branche du prochain lot

```bash
git switch -c fix/reject-future-observation-dates
```

### Étape 5 — Corriger avec des tests

Ordre conseillé :

1. écrire un test reproduisant une date mal interprétée ;
2. vérifier que le test échoue avant le correctif ;
3. corriger le parseur ;
4. ajouter une protection générique ;
5. relancer les tests ciblés ;
6. lancer les tests complets, ESLint, TypeScript et le build ;
7. vérifier `git diff --check`.

### Étape 6 — Sauvegarder dans Git

Créer un commit concentré sur un seul sujet.

Ensuite :

1. pousser la branche ;
2. créer une pull request vers `audit/studio-v4` ;
3. attendre la CI ;
4. examiner le diff ;
5. fusionner uniquement si tout est vert ;
6. supprimer la branche après fusion ;
7. vérifier que la branche locale de référence est synchronisée.

---

## 16. Règles de sécurité du chantier

### Avant une modification de données

- identifier précisément ce qui va être modifié ;
- créer une sauvegarde ;
- vérifier l’intégrité ;
- noter les compteurs utiles ;
- conserver un moyen de revenir en arrière.

### Pendant un test

- modifier un seul mécanisme à la fois ;
- conserver l’arrêt d’urgence ;
- lire les événements d’audit ;
- vérifier les statuts en base ;
- ne pas conclure à partir de la seule apparence de l’interface.

### Après un test

- vérifier les publications actives ;
- vérifier les observations traitées ;
- vérifier les articles créés ;
- vérifier les traductions ;
- vérifier les événements ;
- exécuter `PRAGMA foreign_key_check` ;
- comparer avec l’état attendu.

### Pour le code

- une branche par lot cohérent ;
- tests ciblés puis suite complète ;
- pas de secret dans le dépôt ;
- pas de correction manuelle de données pour cacher un bug ;
- pas de déploiement implicite ;
- pas de fusion si la CI échoue ;
- documenter les décisions qui changent le comportement éditorial.

---

## 17. Les confusions à éviter

### « La collecte a fonctionné, donc l’article est publié »

Faux. La collecte crée une observation.

### « Une observation est un article »

Faux. L’observation est la matière première. L’article est un contenu éditorial distinct.

### « Un brouillon dans le Studio est visible sur le site »

Faux. Un brouillon `AI_DRAFT` avec `published = 0` n’est pas public.

### « Le mode AUTO de la source impose toujours la publication »

Faux. Plusieurs contrôles supplémentaires s’appliquent :

- activation générale ;
- arrêt d’urgence ;
- liste d’autorisation ;
- confiance ;
- qualité ;
- cohérence des adresses ;
- autorisation explicite de l’appelant.

### « La simulation modifie la page d’accueil »

Faux. Elle reste une proposition tant que l’application manuelle n’est pas confirmée.

### « Un emplacement non pourvu doit être rempli à tout prix »

Faux. Pendant une composition automatisée active, laisser le contenu vide peut être la bonne décision. Le contenant visuel peut rester présent.

### « Le retour arrière supprime le contenant de la page »

Faux. Il retire les publications créées par le run. Une fois le run inactif, les règles habituelles de la page peuvent de nouveau fournir du contenu.

### « Un test local réussi signifie que la production est prête »

Faux. La production demande en plus une infrastructure, une supervision, des sauvegardes, une gestion des secrets et une validation éditoriale complète.

---

## 18. État exact au moment d’archiver ce guide

- branche de référence : `audit/studio-v4` ;
- dernier correctif fusionné : pull request #123 ;
- commit : `0590c6d63c6f3007707a5d919f7dccd5003c522b` ;
- publication automatique des articles : désactivée localement ;
- arrêt d’urgence de cette publication : activé ;
- application et retour arrière de la composition de l’accueil : disponibles en mode supervisé ;
- collecte par lot : testée avec succès sur dix sources ;
- article test 492 : conservé en brouillon non publié ;
- dates futures Altaveu : anomalie connue et non corrigée ;
- qualité de génération : amélioration nécessaire ;
- simulation de l’accueil du 8 septembre : non appliquée ;
- production : non déployée ;
- prochaine priorité : correction et blocage des dates futures.

---

## 19. Résumé en une minute

ANDORRE 360 sait déjà collecter des sources, créer des observations, générer des brouillons, évaluer des candidats pour la page d’accueil, simuler une composition, appliquer exactement la proposition examinée et revenir en arrière.

Les protections fonctionnent : lors de l’essai, l’article 492 a bien été créé comme brouillon et n’a pas été publié.

Le chantier a toutefois révélé deux familles de problèmes :

1. certaines dates collectées sont fausses et placées dans le futur ;
2. la qualité rédactionnelle du brouillon n’est pas encore suffisante pour une publication autonome.

La prochaine étape est donc de corriger les dates futures. Ensuite, il faudra améliorer la génération, construire l’orchestrateur autonome, multiplier les essais supervisés et seulement après automatiser toute la chaîne.

L’objectif final ne change pas : l’IA doit pouvoir prendre en charge toutes les publications. Nous construisons simplement les contrôles nécessaires pour que cette autonomie soit fiable, explicable et réversible.
