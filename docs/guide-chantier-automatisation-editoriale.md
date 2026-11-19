# ANDORRE 360 — Guide du chantier d’automatisation éditoriale

**Dernière mise à jour : 18 novembre 2026**\
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

#### Avancement du lot C (18 novembre 2026)

Les lots A (#125) et B (#126, #127) sont fusionnés.

Premier sous-lot livré : la sélection déterministe, en lecture seule, dans `lib/article-orchestrator/` :

- `selectObservationsForArticles` : fonction pure qui retient ou écarte chaque observation avec des motifs explicites (déjà traitée, source non autorisée, inactive, hors mode `AUTO`, confiance inférieure à `HIGH`, URL non HTTPS ou hors de l’origine de la source, date absente, invalide ou future, hors fenêtre de fraîcheur de 48 h, titre ou contenu trop courts, doublon d’une observation traitée ou retenue, limite de 5 par exécution) ;
- `planArticleOrchestration` : charge les observations collectées sur les 7 derniers jours (1 000 au maximum), applique la sélection et indique si une exécution réelle resterait bloquée (arrêt d’urgence, publication automatique désactivée, aucune source autorisée).

Ce sous-lot ne crée aucun article, n’appelle pas OpenAI et n’écrit rien en base.

Limite connue : l’anti-doublon compare les titres normalisés et les URL, uniquement avec les observations des 7 derniers jours.

Deuxième sous-lot livré : l’exécution (`executeArticleOrchestration`), écrite et testée sans aucun appel OpenAI (les tests utilisent un faux générateur) :

- nouvelle variable `AI_ARTICLE_ORCHESTRATOR_ENABLED`, désactivée par défaut, exigée en plus de `AI_AUTO_PUBLICATION_ENABLED=true`, de l’arrêt d’urgence inactif et d’une source autorisée ;
- exécutions tracées dans `ArticleOrchestrationRun` : statut, politique, plan, résultat, y compris les exécutions bloquées ;
- verrou unique en base : une seule exécution à la fois ;
- réservation durable de chaque observation dans `ArticleOrchestrationItem` avant la génération : une observation ne déclenche jamais deux générations, même après relance ;
- une erreur reste limitée à son observation, n’est jamais relancée automatiquement et n’occupe plus la limite du lot ;
- arrêt d’urgence relu avant chaque observation ; délai d’une seconde entre deux générations ;
- appel de `createArticleFromObservation` avec `allowAutoPublication: true`, qui réévalue ses propres règles avant toute publication.

Migration `20261118210000_add_article_orchestration_runs` : écrite mais **pas encore appliquée** à `./dev.db`. L’appliquer avec sauvegarde préalable, selon la procédure du guide d’activation supervisée.

Comportements volontairement prudents :

- après un arrêt brutal, le verrou reste posé et les observations réservées restent `CLAIMED` : un humain doit contrôler les brouillons éventuellement créés, puis lever le verrou ;
- une observation en échec (`FAILED`) n’est plus jamais reprise automatiquement : une génération partielle pourrait sinon créer un second brouillon.

Troisième sous-lot livré : l’écran du Studio `/admin/diffusion/orchestrateur`, accessible depuis la page Diffusion :

- « Calculer l’aperçu » : liste des observations retenues et des motifs de refus, sans appel OpenAI ni écriture ;
- « Générer N articles » : affiché seulement si tous les garde-fous serveur sont ouverts, après une confirmation qui rappelle le coût OpenAI ;
- le serveur recalcule la sélection et refuse (`PLAN_CHANGED`) si elle diffère de l’aperçu examiné ;
- l’administrateur qui lance l’exécution est enregistré dans le run (migration `20261118223000_add_article_orchestration_run_actor`, pas encore appliquée à `./dev.db`).

Limite par source (18 novembre 2026) : une collecte supervisée des 41 sources actives a produit 443 observations. Sans limite, l’aperçu retenait 5 articles, tous du Diari d’Andorra, la source la plus productive. La politique limite désormais chaque source à 1 article par exécution (`maxPerSource`, motif « Limite par source atteinte »). Avec toutes les sources `AUTO` supposées autorisées, l’aperçu retient alors 4 articles issus de 4 sources différentes.

Constats de cette collecte, non corrigés à ce stade :

- 278 observations sur 443 n’avaient pas de date et étaient donc écartées. Correctif du même jour : le collecteur HTML lit d’abord les dates de publication standard déclarées par l’article (`article:published_time`, `itemprop=datePublished`, JSON-LD `datePublished`, y compris dans un `@graph` ou un JSON-LD mal formé), puis les balises `time`, puis une date année/mois/jour présente dans l’adresse. Il comprend aussi les dates écrites en toutes lettres en catalan, français et espagnol. Les dates de modification ne sont jamais utilisées. Collecte à blanc après correctif : 331 observations datées sur 493 (67 %, contre 37 % avant). Restent sans date, faute de signal standard : RTVA, Consell General, Ordino, Sant Julià, Escaldes-Engordany, CCIS, AFA, ARI, CASS, Mobilitat, Agenda, FAE et PS. Il leur faudra des règles propres à chaque site. Une nouvelle collecte ignore les adresses déjà connues : les observations déjà enregistrées sans date sont donc complétées par `backfillObservationDates` (`lib/source-engine/`). Cette fonction ne concerne que les observations sans date, non traitées, sans article et collectées depuis 7 jours. Elle utilise les mêmes règles de lecture que la collecte, ne remplace jamais une date existante, n’écrit jamais de date future et propose un mode `dryRun` qui n’écrit rien ;
- Andorra Business et le Comú d’Encamp refusent la collecte (HTTP 403) ;
- certaines observations retenues sont des pages faibles (par exemple un simple nom de personne en titre) : à examiner pendant les essais supervisés.

Vérification du 18 novembre 2026 sur une copie migrée de `./dev.db` : aperçu calculé sans erreur, 0 observation retenue, car la dernière collecte date du 8 septembre 2026. Un essai réel demandera donc d’abord une collecte récente.

Mode brouillons (18 novembre 2026) : la configuration locale autorisait déjà une cinquantaine de sources et la publication multilingue. Activer l’orchestrateur aurait donc publié directement les articles et leurs traductions, sans relecture. L’orchestrateur ne crée désormais que des **brouillons** par défaut, avec `allowAutoPublication: false`, sans publication ni traduction ; dans ce mode, `AI_AUTO_PUBLICATION_ENABLED` n’est pas exigé. La publication exige `AI_ARTICLE_ORCHESTRATOR_PUBLISH=true` en plus de `AI_AUTO_PUBLICATION_ENABLED=true`. Le mode est affiché dans le Studio et enregistré dans chaque run. L’arrêt d’urgence et la liste des sources autorisées s’appliquent dans les deux modes.

Reste à faire :

- appliquer les deux migrations à `./dev.db` après sauvegarde : fait le 18 novembre 2026 ;
- lancer une collecte, puis un premier essai supervisé réel (lot D), qui appellera OpenAI : moins de 1 € estimé pour 5 articles ;
- la levée contrôlée d’un verrou après incident.

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

#### Premier essai supervisé de l’orchestrateur (18 novembre 2026)

Préparation :

- base `./dev.db` migrée, puis sauvegardée juste avant l’essai (`dev.before-first-trial-20261118-225554.db`, ignorée par Git) ;
- collecte des 41 sources actives et redatage des observations récentes ;
- réglages temporaires : `AI_ARTICLE_ORCHESTRATOR_ENABLED=true`, `AI_AUTO_PUBLICATION_EMERGENCY_STOP=false` ; `AI_AUTO_PUBLICATION_ENABLED=false` et `AI_ARTICLE_ORCHESTRATOR_PUBLISH` absent, donc **mode brouillons**.

Déroulement : aperçu relu puis lancement depuis `/admin/diffusion/orchestrateur` par un administrateur. Le run `a486c867-ff90-46e5-b36b-5253d8e1861f`, en mode `DRAFTS_ONLY`, a duré environ une minute.

Résultat :

| Article | Source | Titre rédigé |
|---|---|---|
| 494 | La Veu Lliure | Saint-Marin prépare un plan de réponse face au risque de cyberattaque |
| 495 | Diari d’Andorra | Jaume Bartumeu reçoit la Creu dels Set Braços, la plus haute distinction d’Andorre |
| 496 | Bondia | Le diocèse d’Urgell ouvre une procédure canonique contre le prêtre accusé de viol |
| 497 | Concordia | Concòrdia propose de porter à trente ans le loyer abordable des logements aidés |
| 498 | FC Andorra | Diego Alende appelle l’Andorra à « franchir un cap » face à Leganés le 20 novembre 2026 |

Contrôles après l’essai :

- 5 articles créés sur 5, aucun échec ; run `COMPLETED`, verrou libéré ;
- les 5 articles sont au statut `AI_DRAFT`, avec `published = false` ;
- aucune traduction et aucune publication sur l’accueil ;
- les 5 observations sont marquées traitées et liées à leur article ;
- 5 événements `ARTICLE_CREATED`, avec une publication automatique refusée (`feature_disabled`) ;
- intégrité SQLite `ok`, aucune erreur de clé étrangère.

Constats :

- les 5 brouillons utilisent tous l’image générique `/images/global/hero.jpg` : le choix d’une image pertinente, prévu au lot B, reste à faire ;
- la fidélité aux sources et la qualité rédactionnelle restent à juger à la relecture humaine, en particulier pour l’article 496, au sujet sensible ;
- les sources retenues sont surtout des médias : la question juridique de la réécriture d’articles de presse (section 14) reste ouverte ;
- le coût exact se lit dans le tableau de bord OpenAI : 5 appels de rédaction, sans traduction.

Après l’essai, remettre `AI_ARTICLE_ORCHESTRATOR_ENABLED=false` et `AI_AUTO_PUBLICATION_EMERGENCY_STOP=true`.

#### Rédaction à partir des faits (19 novembre 2026)

Les sources retenues lors du premier essai sont surtout des médias. Pour réduire le risque juridique de la réécriture d’articles de presse, la génération OpenAI travaille désormais en deux temps (`OpenAiEditorialGenerator`, version de consigne `editorial-facts-v1`) :

1. **extraction** : un premier appel lit la source et rend une liste de faits courts et neutres (qui, quoi, où, quand, combien), sans citation ni témoignage ; une prise de position officielle n’y figure que résumée et attribuée, sans guillemets ;
2. **rédaction** : un second appel rédige le titre, le chapô et l’article à partir de cette liste seulement. Il ne reçoit ni le titre ni le texte d’origine.

Contrôles automatiques, qui font échouer la génération de l’observation concernée sans créer de brouillon :

- liste de faits vide, mal formée, de plus de 40 faits, ou contenant un fait de plus de 400 caractères (signe d’un paragraphe repris tel quel) ;
- passage de plus de 4 mots entre guillemets dans un fait ou dans l’article rédigé ; un nom court entre guillemets reste accepté ;
- Markdown dans l’article rédigé, comme auparavant.

La liste de faits n’est jamais enregistrée dans l’article : elle est consignée dans l’événement `ARTICLE_CREATED` (champ `factSheet`), pour permettre au relecteur de comparer l’article aux faits.

Conséquences :

- chaque article coûte désormais deux appels OpenAI au lieu d’un ;
- les citations des personnes interrogées disparaissent des articles : c’est voulu, mais les articles seront plus secs ;
- les tests utilisent un faux client ; la méthode n’a pas encore été essayée sur de vrais appels.

Ce changement éloigne le texte produit de la formulation de la source, mais **ne tranche pas la question juridique** : il ne remplace pas un avis d’avocat, qui reste nécessaire avant toute mise en ligne.

#### Contrôle de ressemblance avec la source (19 novembre 2026)

Après la rédaction, `createArticleFromObservation` compare l’article (titre, chapô et corps) au titre et au texte de l’observation (`lib/article-engine/sourceSimilarity.ts`). La comparaison ignore la casse, les accents, la ponctuation et les apostrophes. Elle mesure :

- la part des passages de 5 mots de l’article qui figurent aussi dans la source ;
- le plus long passage commun, en nombre de mots consécutifs.

L’article est **bloqué** si plus de 20 % de ses passages de 5 mots figurent dans la source, ou si un passage commun dépasse 12 mots. Dans ce cas, aucun brouillon n’est créé ni remplacé, l’observation n’est pas marquée traitée, et l’erreur indique la mesure ; dans l’orchestrateur, l’observation passe en `FAILED` avec ce message. Pour un article accepté, la mesure est consignée dans l’événement `ARTICLE_CREATED` (champ `sourceSimilarity`).

Le générateur déterministe, qui recopie la source, est désormais bloqué par ce contrôle dès que le texte est assez long : c’est voulu.

Limite : cette comparaison repère la reprise de formulations dans la même langue, pas une traduction fidèle d’une source catalane ou espagnole. La rédaction à partir des faits traite ce cas en amont. Les seuils sont un premier réglage, à confronter aux prochains essais supervisés. Mesure à blanc, en lecture seule, sur les 5 brouillons du premier essai (articles 494 à 498, rédigés avec l’ancienne consigne en un seul appel) : de 0 à 2 % de passages communs, au plus 8 mots consécutifs, donc aucun blocage. Ces sources étant en catalan et les articles en français, ce résultat illustre aussi la limite ci-dessus. Comme le lot précédent, ce contrôle réduit le risque juridique sans le trancher.

#### Priorité aux sources institutionnelles (19 novembre 2026)

La sélection de l’orchestrateur (`selectObservationsForArticles`) classe désormais les observations admissibles selon le type d’organisation de leur source (`organizationType`), avant de remplir le lot :

1. **institutionnelles** : `GOVERNMENT`, `COMMUNE`, `POLICE`, `EMERGENCY_SERVICE`, `WEATHER_SERVICE` ;
2. **ordinaires** : clubs, fédérations, entreprises, associations, `OTHER` et sources non classées ;
3. **médias** : `MEDIA`.

Au sein d’une même priorité, l’information la plus récente passe d’abord, comme avant. Les règles d’admissibilité, la limite d’un article par source et la limite du lot sont inchangées : un média n’est retenu que s’il reste de la place après les autres sources. Chaque décision indique la priorité de sa source (`sourcePriority`), enregistrée avec le plan de chaque run.

Point d’attention : cette priorité ne vaut que si les sources sont bien classées. Au 19 novembre 2026, seules 4 sources actives sont classées `MEDIA` ; plusieurs médias (RTVA, Diari d’Andorra, Bondia, Andorra Business, Altaveu) sont encore classés `OTHER` et passent donc avant les médias correctement classés. Leur reclassement est une écriture dans `./dev.db`, à faire avec sauvegarde préalable.

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

État au 18 novembre 2026 :

- branche de référence : `audit/studio-v4` ;
- dernières pull requests fusionnées : #125 à #133 (dates futures, génération, orchestrateur, Studio, limite par source, lecture et redatage des dates, mode brouillons) ;
- orchestrateur des articles : livré, mode brouillons par défaut, désactivé hors des essais ;
- publication automatique des articles : désactivée localement, arrêt d’urgence activé ;
- premier essai supervisé : 5 brouillons créés, aucune publication (voir lot D) ;
- dates : 67 % des observations datées à la collecte ; 13 sources sans signal standard ;
- 4 observations Altaveu du 13 août restent datées au 7 décembre 2026 : données antérieures au correctif #125, sans effet sur l’orchestrateur ;
- images des brouillons : image générique, amélioration nécessaire ;
- production : non déployée ;
- rédaction à partir des faits : génération en deux temps (extraction des faits, puis rédaction sans le texte source), pas encore essayée sur de vrais appels OpenAI ;
- contrôle de ressemblance : article bloqué au-delà de 20 % de passages de 5 mots communs avec la source ou d’un passage commun de plus de 12 mots ;
- sélection de l’orchestrateur : sources institutionnelles d’abord, médias en dernier ; reclassement des médias encore classés `OTHER` à faire ;
- prochaines priorités : relecture des brouillons de l’essai, choix d’images pertinentes, règles de date propres aux 13 sources restantes, puis d’autres essais supervisés.

---

## 19. Résumé en une minute

ANDORRE 360 sait déjà collecter des sources, créer des observations, générer des brouillons, évaluer des candidats pour la page d’accueil, simuler une composition, appliquer exactement la proposition examinée et revenir en arrière.

Les protections fonctionnent : lors de l’essai, l’article 492 a bien été créé comme brouillon et n’a pas été publié.

Le chantier a toutefois révélé deux familles de problèmes :

1. certaines dates collectées sont fausses et placées dans le futur ;
2. la qualité rédactionnelle du brouillon n’est pas encore suffisante pour une publication autonome.

La prochaine étape est donc de corriger les dates futures. Ensuite, il faudra améliorer la génération, construire l’orchestrateur autonome, multiplier les essais supervisés et seulement après automatiser toute la chaîne.

L’objectif final ne change pas : l’IA doit pouvoir prendre en charge toutes les publications. Nous construisons simplement les contrôles nécessaires pour que cette autonomie soit fiable, explicable et réversible.
