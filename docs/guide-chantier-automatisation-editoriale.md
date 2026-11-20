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

Cette priorité ne vaut que si les sources sont bien classées. Reclassement appliqué à `./dev.db` le 19 novembre 2026, après sauvegarde (`dev.before-source-reclassification-20261119-125929.db`, ignorée par Git, intégrité `ok`) :

| Source (id) | Avant | Après |
|---|---|---|
| altaveu test 2 (4), rtva (5), diari de andorra (6), Bondia (7), Andorra Business (22) | `OTHER` | `MEDIA` |
| Mairie d’Andorre (1), site du Comú d’Andorra la Vella | `OTHER` | `COMMUNE` |

Contrôles après l’écriture : intégrité SQLite `ok`, aucune erreur de clé étrangère. Sources actives après reclassement : 19 institutionnelles (10 `GOVERNMENT`, 7 `COMMUNE`, 1 `POLICE`, 1 `EMERGENCY_SERVICE`), 13 ordinaires (9 `OTHER`, 2 `SPORTS_CLUB`, 2 `SPORTS_FEDERATION`) et 9 `MEDIA`. Les partis, stations de ski, COA, OMS et agenda restent classés `OTHER`. Ce reclassement ne concerne que la base locale : il faudra le reproduire sur la future base de production.

#### Deuxième essai supervisé : rédaction à partir des faits (19 novembre 2026)

Objectif : essayer pour la première fois, sur de vrais appels OpenAI, la rédaction en deux temps (#135), le contrôle de ressemblance (#136) et la priorité institutionnelle (#137).

Préparation :

- sauvegarde de `./dev.db` juste avant l’essai (`dev.before-second-trial-20261119-131403.db`, ignorée par Git, intégrité `ok`) ;
- collecte des 41 sources actives : 39 réussies, 90 nouvelles observations ; Andorra Business et le Comú d’Encamp refusent toujours la collecte (HTTP 403) ; le redatage n’a daté aucune des 158 observations sans date ;
- intégrité `ok` après la collecte ; aucune nouvelle date future (seules restent les 4 observations Altaveu du 13 août) ;
- réglages temporaires, modifiés par l’utilisateur : `AI_ARTICLE_ORCHESTRATOR_ENABLED=true`, `AI_AUTO_PUBLICATION_EMERGENCY_STOP=false` ; `AI_AUTO_PUBLICATION_ENABLED=false` et `AI_ARTICLE_ORCHESTRATOR_PUBLISH` absent, donc **mode brouillons**.

Constat pendant la préparation : un aperçu calculé avant la collecte retenait une observation du Govern sur la Creu dels Set Braços de Jaume Bartumeu, déjà traitée à partir du Diari (article 495). L’anti-doublon, qui compare les titres et les adresses, ne repère pas un même sujet traité par deux sources. Après la collecte, cette observation a été remplacée par une information plus récente.

Déroulement : aperçu relu puis lancement depuis `/admin/diffusion/orchestrateur` par un administrateur. Le run `476a1b68-20e5-4d08-9fd9-87549ca637cd`, en mode `DRAFTS_ONLY`, a duré environ une minute et demie.

Résultat :

| Article | Source | Faits | Passages de 5 mots communs | Plus long passage commun | Titre rédigé |
|---|---|---|---|---|---|
| 499 | Mairie d’Andorre (`COMMUNE`) | 18 | 3,4 % | 8 mots | Andorre-la-Vieille installe le 11e Consell d’Infants pour l’année scolaire 2026-2027 |
| 500 | Govern (`GOVERNMENT`) | 18 | 1,5 % | 6 mots | Le 20 novembre 2026, quatre navettes gratuites pour le match FC Andorra-CD Leganés à Encamp |
| 501 | FC Andorra (`SPORTS_CLUB`) | 7 | 0 % | 2 mots | Football : l’Andorra veut renouer avec la victoire face à Leganés |
| 502 | OMS Europe (`OTHER`) | 16 | 0 % | 2 mots | Résistance aux antibiotiques : 21 pays sur 43 signalent une forte résistance de Klebsiella pneumoniae |
| 503 | Concòrdia (`OTHER`) | 10 | 1,8 % | 7 mots | Après le vol de NIA à la CASS, Concòrdia réclame un audit indépendant |

Contrôles après l’essai :

- 5 articles créés sur 5, aucun échec ; run `COMPLETED`, verrou libéré ;
- aucun média retenu : 2 sources institutionnelles, puis 3 sources ordinaires ;
- les 5 articles sont au statut `AI_DRAFT`, avec `published = false` ; aucune traduction et aucune publication sur l’accueil ;
- les 5 observations sont marquées traitées et liées à leur article ;
- 5 événements `ARTICLE_CREATED` avec la version `editorial-facts-v1`, la liste de faits (`factSheet`), la mesure de ressemblance (`sourceSimilarity`) et une publication automatique refusée (`feature_disabled`) ;
- aucun passage entre guillemets dans les titres, chapôs et corps ; l’interview de l’article 501 ne conserve que des propos résumés et attribués ;
- ressemblance très en dessous des seuils (au plus 3,4 % et 8 mots), aucun blocage ;
- intégrité SQLite `ok`, aucune erreur de clé étrangère ;
- `.env` remis ensuite à `AI_ARTICLE_ORCHESTRATOR_ENABLED=false` et `AI_AUTO_PUBLICATION_EMERGENCY_STOP=true`.

Constats à traiter :

- fidélité aux sources à vérifier en relecture humaine, en comparant chaque article à sa liste de faits puis à la source (par exemple le lieu indiqué dans le titre de l’article 500) ;
- articles plus secs sans citations ; l’article 501 ne compte que 852 caractères ;
- les 5 brouillons utilisent toujours l’image générique `/images/global/hero.jpg` ;
- le champ auteur reprenait le nom brut de la source (par exemple « gouvernement d’andorre ») ; corrigé, voir « Signature des articles rédigés automatiquement » ;
- l’anti-doublon ne repère pas un même sujet traité par deux sources différentes.

Coût : 10 appels OpenAI (5 extractions, 5 rédactions), sans traduction ; le montant exact se lit dans le tableau de bord OpenAI.

#### Anti-doublon par sujet (19 novembre 2026)

Le deuxième essai a montré que l’anti-doublon exact (titres normalisés et adresses) ne repère pas un même sujet traité par deux sources avec des titres différents. La sélection rapproche désormais aussi les titres par sujet (`lib/article-orchestrator/topicSimilarity.ts`) :

- chaque titre est réduit à ses mots significatifs : sans accents ni casse, au moins 4 lettres (ou un nombre d’au moins 3 chiffres), sans les mots outils catalans, espagnols et français, ni les années, ni les noms très fréquents (Andorra, Govern, Comú, noms des paroisses) ;
- deux titres traitent le même sujet s’ils partagent au moins 3 mots significatifs, couvrant au moins 60 % de ceux du titre le plus court.

Une observation est écartée si son sujet a déjà été traité (motif « Sujet déjà traité par une autre information ») ou s’il est celui d’une observation déjà retenue dans le même lot (« Même sujet qu’une information retenue »). La décision indique l’observation rapprochée (`relatedObservationId`). Comme le tri place les sources institutionnelles en premier, c’est la version institutionnelle d’un sujet qui est retenue.

Calibrage sur les 533 observations collectées depuis le 12 novembre 2026 : les paires rapprochées sont pour l’essentiel de vrais doublons (Creu dels Set Braços, navettes de bus, procédure canonique, Querola, nationalité et niveau B1). Les faux rapprochements observés venaient de noms de lieux composés (« Sant Julià de Lòria ») ; les paroisses sont donc ignorées.

Mesure à blanc sur une copie de `./dev.db`, toutes sources supposées autorisées : 5 observations écartées par sujet, dont les reprises de la Creu dels Set Braços par le Govern et La Veu Lliure, et deux doublons des navettes de bus de l’article 500. Un rapprochement est discutable : la demande d’explications d’Andorra Endavant sur la cyberattaque de la CASS, écartée car proche de l’observation Concòrdia de l’article 503.

Limites constatées pendant cette mesure :

- deux titres de langues différentes ne sont pas rapprochés : l’annonce des navettes par le FC Andorra, en espagnol, reste retenue alors que l’article 500 traite le même sujet ;
- les variantes d’un même mot ne sont pas rapprochées (« consellers infantils » et « Consell d’Infants ») : une observation du Diari sur le Consell d’Infants d’Andorra la Vella reste retenue alors que l’article 499 traite le même sujet ;
- seules les observations des 7 derniers jours servent de référence ;
- un suivi d’une même affaire (nouvelle étape d’une procédure) peut être écarté comme doublon : c’est un choix prudent, l’article peut toujours être créé à la main.

#### Variantes de mots entre sources (19 novembre 2026)

L’anti-doublon par sujet comparait des mots identiques : « autobusos » et « busos », « lloguer » et « lloguin », ou un même mot en catalan et en espagnol (« aficionats », « afición ») n’étaient pas rapprochés. Entre deux sources différentes, la sélection compare désormais aussi les racines des mots significatifs (`topicStems`) :

- chaque mot est réduit à ses 5 premières lettres ; les nombres sont gardés tels quels ;
- « busos » est ramené à la même forme qu’« autobusos » ;
- les racines trop génériques pour désigner un sujet (euros, millions) et le mot de liaison « arran » sont ignorés ;
- les seuils ne changent pas : au moins 3 racines communes, couvrant au moins 60 % de celles du titre le plus court.

Au sein d’une même source, seule la comparaison exacte s’applique : une source publie souvent des séries de titres proches sur des faits distincts (bilans d’accidents de la Police, résultats d’un même skieur), que les racines confondraient.

Calibrage sur les 533 observations collectées depuis le 12 novembre 2026 : 18 nouvelles paires entre sources différentes, presque toutes de vrais doublons (Creu dels Set Braços, procès canonique, pisos assequibles de Concòrdia, mémorandum du multifuncional, AD-ALERT, niveau B1, changement des mots de passe des certificats numériques, campagne de Grandvalira en français et en catalan). Une paire est fausse : la délégation du Consell General à l’APF et l’AFA à l’IOSCO, rapprochées par « participa », « regional » et « Europa ». Au sein d’une même source, 6 paires auraient été rapprochées à tort ; elles ne le sont pas.

Mesure à blanc sur une copie de `./dev.db`, toutes sources supposées autorisées : 8 observations écartées par sujet au lieu de 6 ; les deux nouvelles (Creu dels Set Braços, procès canonique) sont de vrais doublons ; le lot retenu ne change pas.

Limites : la méthode ne traduit pas. Le titre espagnol du FC Andorra sur les navettes de bus (« ponen a disposición de la afición autobuses para los partidos en casa ») ne partage que 2 racines avec les titres catalans de l’article 500 et reste retenu. De même, « Consell d’Infants » et « consellers infantils » ne partagent pas assez de mots pour être rapprochés.

#### Signature des articles rédigés automatiquement (19 novembre 2026)

Les brouillons étaient signés du nom brut de la source (« Par gouvernement d’andorre »), alors que la source n’a pas écrit l’article. Ils sont désormais signés « Rédaction ANDORRE 360 » (`lib/article-engine/editorialSignature.ts`) :

- les deux générateurs (OpenAI et déterministe) renvoient cette signature ;
- `createArticleFromObservation` l’impose en dernier, quel que soit le générateur, à la création comme à la régénération d’un brouillon ;
- la source reste consignée dans l’audit : observation rattachée à l’article et événement `ARTICLE_CREATED`.

Non traité dans ce lot :

- les articles déjà enregistrés gardent leur signature ; les brouillons 494 à 503 sont signés du nom de leur source, et des articles publiés plus anciens sont signés d’un média (par exemple « BBC », « France 24 ») ;
- la page publique n’affiche pas encore la source dont l’article est tiré ; un crédit « D’après … » demandera des noms de sources propres, les noms actuels étant bruts (casse, fautes de frappe) ;
- les communiqués politiques (catégorie « Ils en parlent ») sont eux aussi signés par la rédaction ; leur présentation, qui doit indiquer clairement de qui vient la prise de position, reste à décider.

#### Noms officiels des sources (19 novembre 2026)

Les noms des sources étaient bruts : casse irrégulière (« gouvernement d’andorre », « FORCES ÉLECTRIQUES »), fautes de frappe (« Fésération de ski »), noms de test (« altaveu test 2 ») ou traductions approximatives. Avec l’accord de l’utilisateur, 53 sources ont été renommées dans `./dev.db` avec leur nom officiel, tel que l’organisation se nomme elle-même, le plus souvent en catalan : il reste juste quelle que soit la langue de l’article.

Exemples : « Govern d’Andorra », « Consell General », « Comú de Sant Julià de Lòria », « Altaveu », « Federació Andorrana d’Esquí », « FEDA », « Partit Socialdemòcrata ». Dix noms étaient déjà corrects et n’ont pas changé (Bondia, Andorra Ara, Policia d’Andorra, Andorra Business, France 24, BBC, FC Andorra, Grandvalira, Pal Arinsal, Andorra Endavant).

- sauvegarde préalable : `dev.before-source-names-20261119-212238.db`, intégrité vérifiée ;
- écriture en une transaction, validée seulement si les 53 noms attendus étaient en place ;
- vérification après coup : intégrité « ok », 53 noms modifiés, aucune autre colonne des sources modifiée, aucune observation ni aucun article ajouté ou supprimé ;
- aucun code ne dépend du nom d’une source : il sert à l’affichage dans l’administration et au contexte donné aux générateurs.

Plusieurs sources portent désormais le même nom (les deux flux du Diari d’Andorra, les deux pages météo, musées et expositions, Visit Andorra) ; elles se distinguent par leur adresse. Noms à confirmer : « Departament de Mobilitat », « Acció », « BC MoraBanc Andorra », « Agenda.ad ».

Les articles existants gardent la signature qu’ils avaient ; ce renommage prépare le crédit public de la source (« D’après … »).

#### Crédit public de la source (19 novembre 2026)

La page publique d’un article tiré d’une source indique désormais cette source sous la signature : « Source : Govern d’Andorra » en français, « Font: » en catalan, « Fuente: » en espagnol, au pluriel s’il y en a plusieurs (`lib/article-engine/articleSourceCredits.ts`).

- les sources sont lues à partir des observations rattachées à l’article ; chacune n’est créditée qu’une fois, dans l’ordre des observations ;
- le nom renvoie vers l’article d’origine, dans un nouvel onglet ; un lien qui n’est pas une adresse web (`http` ou `https`) est retiré, le nom reste affiché ;
- un article sans observation rattachée (article écrit à la main) n’affiche aucun crédit ;
- le crédit apparaît sur la page française, les pages traduites et l’aperçu administrateur des traductions.

Vérifié dans le navigateur, sur un serveur de développement branché sur une copie de `./dev.db` (l’ouverture d’un article enregistre une vue) : l’article 491 affiche « Source : Govern d’Andorra » avec le lien vers le communiqué d’origine, et sa traduction catalane « Font: Govern d’Andorra ». L’article 491 reste signé « gouvernement d’andorre » : les articles existants n’ont pas été re-signés.

#### Re-signature des brouillons et état des articles déjà publiés (19 novembre 2026)

Avec l’accord de l’utilisateur, les 12 brouillons IA non publiés 492 à 503 ont été re-signés « Rédaction ANDORRE 360 » dans `./dev.db`, comme le système les signerait aujourd’hui.

- sauvegarde préalable : `dev.before-draft-resign-20261119-220219.db`, intégrité vérifiée ;
- écriture en une transaction, validée seulement si les 12 signatures étaient en place ;
- vérification après coup : intégrité « ok », 12 signatures modifiées, aucune hors de 492 à 503, aucun titre, contenu ou statut modifié, aucun article ajouté ou supprimé.

Les autres articles signés du nom de leur source n’ont pas été re-signés, volontairement :

- les 17 articles IA publiés 471 à 491 ont été réécrits avec l’ancienne consigne, jugée trop proche d’une traduction ; d’après le contrôle de ressemblance, le 473 reprend plus de la moitié de sa source et les 472 et 481 en sont proches ;
- 148 articles plus anciens, rattachés à une observation mais créés sans IA, sont des traductions littérales ou des copies du texte de la source (par exemple l’article 276, traduction du Govern, ou l’article 440, paraphrase d’une dépêche de France 24) ; 16 sont classés comme copies par le contrôle de ressemblance, qui ne repère pas les traductions ;
- pour ces articles, la signature au nom de la source est au moins exacte : les signer par la rédaction reviendrait à s’attribuer un texte qui n’est pas le sien.

Données de chantier : 164 articles publiés sont rattachés à une source, dont 62 à des médias (BBC, France 24, Diari d’Andorra, Andorra Business, Altaveu…). Comme tous les articles déjà présents dans `./dev.db`, ils servent uniquement au chantier et seront effacés lors de la mise en production (précision de l’utilisateur, 19 novembre 2026). Ils ne sont donc pas à dépublier ni à re-signer maintenant ; l’avis d’avocat porte sur les articles que produira la chaîne de rédaction.

Les signatures humaines (« Sa.BA », « Salah »), sur des articles sans source, n’ont pas été modifiées.

#### Longueur des titres (19 novembre 2026)

Les titres des brouillons 494 à 503 comptaient de 65 à 101 caractères et étaient coupés sur la page d’accueil. Calibrage dans le navigateur, sur une copie de `./dev.db`, en mesurant le nombre de caractères que chaque emplacement de titre peut afficher avant d’être coupé :

- en bureau (1 440 px) : de 56 à 65 caractères pour presque tous les emplacements ; 39 pour un emplacement de 30 px de corps ;
- en mobile (375 px) : de 56 à 65 caractères pour les petits emplacements, 39 pour le même emplacement, et seulement 28 pour la grande une et le titre principal en 36 px ;
- 12 titres sur 14 étaient coupés sur la page d’accueil.

La rédaction limite désormais le titre à 70 caractères (`MAX_TITLE_LENGTH`, consigne `editorial-facts-v2`) :

- la consigne demande un titre d’au plus 70 caractères et pas de date dans le titre, sauf si elle est l’information principale ; le chapô et le corps gardent la date complète ;
- si le titre reste trop long, un seul appel supplémentaire le fait raccourcir, à partir du titre et de la liste de faits seulement, jamais du texte source ;
- si le titre raccourci dépasse encore 70 caractères, l’article est bloqué ; le titre raccourci passe aussi les contrôles de texte brut et de citation.

Limites :

- le raccourcissement coûte un appel OpenAI de plus, seulement pour les titres trop longs ;
- les titres traduits sont limités depuis, voir « Longueur des titres traduits » ;
- la grande une en mobile (28 caractères) et l’emplacement de 39 caractères restent trop étroits pour un titre de presse : c’est l’affichage qu’il faut adapter (taille du texte ou nombre de lignes), pas la longueur des titres ;
- les titres existants et ceux écrits à la main ne sont pas concernés.

#### Affichage des titres sur la page d’accueil (19 novembre 2026)

Après la limite de 70 caractères, la page d’accueil (`components/HomePageEditorial.tsx`) a été adaptée pour qu’un titre de cette longueur ne soit coupé nulle part :

- grande une et titre principal : texte un peu plus petit en mobile (28 px), jusqu’à 4 lignes en mobile et 3 au-delà ; interligne de la une relevé à 1,1 pour ne plus rogner le bas des lettres ;
- « L’essentiel » et les petites cartes : 4 lignes au lieu de 3 ; liste du bas de colonne : 3 lignes au lieu de 2 ; grand format : 3 lignes au lieu de 2 ;
- « La voix de la rédaction » : 24 px au lieu de 30, sur 3 lignes ;
- la colonne « L’essentiel » ne passe à côté du grand format qu’à partir de 1 024 px (elle ne faisait que 148 px de large sur tablette) ;
- la page ne se divise en partie principale et colonne latérale qu’à partir de 1 280 px (entre 1 024 et 1 280 px, plusieurs colonnes ne faisaient que 130 px).

Vérifié dans le navigateur, sur une copie de `./dev.db`, avec cinq vrais titres de 69 à 70 caractères, à 375, 768, 1 024, 1 280 et 1 440 px de large : aucun des 14 emplacements de titre ne coupe le titre, sans défilement horizontal. Avant ces changements, en bureau, 12 titres réels sur 14 étaient coupés.

Limites : seule la page d’accueil a été mesurée et adaptée ; les pages de rubrique (Politique, Culture, Lifestyle…) gardent leurs coupures en 2 ou 3 lignes. Un titre écrit à la main de plus de 70 caractères peut encore être coupé.

#### Affichage des titres sur les pages de rubrique (19 novembre 2026)

Même mesure que pour la page d’accueil, sur les pages de rubrique (Actualité, Culture, Économie, Ils en parlent, Loisirs, Montagne, Politique, Société, Sports), avec les mêmes cinq titres de 69 à 70 caractères, à 375, 768, 1 024, 1 280 et 1 440 px : avant les changements, la plupart des emplacements coupaient le titre (par exemple 11 sur 11 en Politique et en Société dès 1 024 px, 13 sur 17 en Sports).

Les emplacements se ramenaient à quelques familles, corrigées de la même façon dans chaque composant (41 emplacements) :

- cartes en 24 px sur 2 lignes, parfois de hauteur fixe : 20 px jusqu’à 1 280 px, 24 px au-delà, sur 3 lignes ; la hauteur fixe des cartes passe de 2 à 3 lignes pour garder l’alignement ;
- cartes en 18 px : une ligne de plus (3 ou 4) ;
- grandes unes de rubrique en 36 ou 48 px : 28 px en mobile, 4 lignes en mobile et 3 au-delà ; la hauteur maximale qui coupait la une est retirée ;
- grandes cartes du haut de page (Actualité, Économie, Politique, Société, Sports) : 4 lignes jusqu’à 1 280 px, 3 au-delà.

Après les changements : aucun emplacement ne coupe un titre de 70 caractères, sur aucune rubrique ni aucune largeur, sans défilement horizontal. Les pages International et Fil info n’ont pas d’emplacement de titre coupé. Mesures faites dans le navigateur, sur une copie de `./dev.db`. Les tests de mise en page (`*.layout.test.ts`), qui vérifient les classes de chaque emplacement, ont été mis à jour avec les nouvelles limites.

#### Longueur des titres traduits (19 novembre 2026)

Les traductions en catalan et en espagnol sont souvent plus longues que le français. La même limite de 70 caractères s’applique désormais aux titres traduits (`translateArticle`) :

- la consigne de traduction demande un titre d’au plus 70 caractères, resserré si nécessaire sans perdre l’information principale ;
- si le titre traduit reste trop long, un seul appel supplémentaire le raccourcit dans la langue cible, à partir du titre traduit et du chapô traduit ;
- s’il dépasse encore 70 caractères, la traduction est refusée ; comme les traductions d’un article sont préparées avant d’être enregistrées, aucune n’est alors enregistrée et l’erreur est signalée.

Le raccourcissement coûte un appel OpenAI de plus, seulement pour les titres traduits trop longs. Le titre traduit raccourci n’est plus une traduction mot à mot du titre français, mais il en garde l’information principale.

#### Contrôle de fidélité aux faits (19 novembre 2026)

Priorité 3 de la revue d’ensemble. Après la rédaction et le contrôle de ressemblance, `createArticleFromObservation` vérifie que l’article reste fidèle à la liste de faits dont il est tiré (`lib/article-engine/factFidelity.ts`) :

- chiffres : chaque nombre du titre, du chapô et du corps doit figurer dans la liste de faits ou dans les dates transmises au rédacteur (date de la source, date de génération) ; les écritures différentes sont acceptées (« 19.30 heures » et « 19 h 30 », « deux » et « 2 », « 1 200 000 » et « 1200000 ») ; **un chiffre absent bloque l’article** : aucun brouillon n’est créé ni remplacé, l’observation n’est pas marquée traitée et l’erreur indique les chiffres en cause ;
- noms propres : un nom absent des faits et du nom de la source est **seulement consigné « à vérifier »** dans l’audit (`ARTICLE_CREATED.factFidelity.namesToCheck`), sans bloquer ; les noms français usuels de lieux andorrans (Andorre, Andorre-la-Vieille, Saint-Julien-de-Loria) sont acceptés ;
- un article produit sans liste de faits (générateur déterministe) n’est pas contrôlé.

Calibrage sur les brouillons 499 à 503, avec leurs listes de faits enregistrées dans l’audit : aucun chiffre bloquant ; 4 noms à vérifier, tous légitimes mais absents des faits (« Organisation » mondiale de la santé et « Escherichia » coli, sigles développés par le rédacteur ; « Caisse » andorrane de sécurité sociale, traduction du nom catalan). Le premier prototype aurait bloqué l’article 500 à cause des horaires (« 19.30 » écrit « 19 h 30 ») et l’article 503 à cause de la date de la source : ces deux cas sont désormais acceptés.

Limites :

- les nombres sont comparés morceau par morceau pour accepter les horaires et les décimales : un « 30 » est accepté si les faits contiennent « 19.30 », et l’inversion de deux chiffres présents (« 4,7 » écrit « 7,4 ») n’est pas repérée ;
- les nombres écrits en lettres dans l’article ne sont pas contrôlés ;
- les noms à vérifier ne bloquent pas : c’est à la relecture humaine d’en juger ;
- le contrôle ne vérifie pas le sens des phrases : un fait mal attribué ou déformé avec les mêmes chiffres et les mêmes noms passe.

#### Dates propres à certains sites (19 novembre 2026)

Le 19 novembre 2026, 158 observations récentes restaient sans date, donc écartées par l’orchestrateur. Les règles de site (`lib/source-engine/collectors/siteRules.ts`) peuvent désormais désigner l’élément exact qui affiche la date :

- `publishedAt` : élément de la page d’article, lu avant les signaux génériques, à la collecte comme au redatage (`backfillObservationDates`) ;
- `listingPublishedAt` : élément du bloc de la page de liste, pour les sites qui n’affichent la date que là.

Le format « jour.mois.année » (année sur 2 ou 4 chiffres) n’est lu que dans un élément désigné par une règle : seul, il se confond avec un numéro de version. Une date future reste refusée.

| Source | Élément lu | Exemple |
|---|---|---|
| RTVA | `[class^="ContentArticle_date"]` | 19.11.26 |
| AR+I | `.post-meta-date` | Publicat: 19/11/2026 |
| Escaldes-Engordany | `.post__terms` contenant l’icône calendrier | 2026-10-20 |
| AFA | date sous le titre (`p.text-gray-light`, icône `icon-history`) | 01/09/2026 |
| Comú de Sant Julià de Lòria | `.post-meta` de la page de liste | 16.11.2026 |

Mesure à blanc du redatage (`dryRun`, copie de `./dev.db`, pages réelles) : 68 observations sur 158 datées (RTVA 31, AR+I 25, Escaldes-Engordany 7, AFA 5), aucune erreur. Sant Julià de Lòria sera daté à la prochaine collecte, puisque sa date ne figure que sur la page de liste.

Redatage réel appliqué à `./dev.db` le 19 novembre 2026, après sauvegarde (`dev.before-date-backfill-20261119-145331.db`, ignorée par Git, intégrité `ok`) : 158 observations examinées, 68 datées, 90 toujours sans date, aucune erreur. Contrôles après l’écriture : intégrité SQLite `ok`, aucune erreur de clé étrangère ; comparaison avec la sauvegarde : exactement 68 dates ajoutées, aucune date existante modifiée ; aucune nouvelle date future (seules restent les 4 observations Altaveu du 13 août). La base compte désormais 1 193 observations datées et 948 sans date, contre 1 125 et 1 016 auparavant.

Sources toujours sans date exploitable, faute de date de publication sur la page : Consell General, Ordino, CCIS, CASS, Mobilitat (incidents), FAE et PS (seule une description de page contient deux dates, sans indication de leur rôle). L’Agenda n’affiche que des dates d’événements, qui ne sont pas des dates de publication : il ne doit pas être daté ainsi. Pour l’AFA, l’icône utilisée ne permet pas d’exclure qu’il s’agisse d’une date de mise à jour : à vérifier lors de la relecture.

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

État au 20 novembre 2026 :

- branche de référence : `audit/studio-v4` ;
- dernières pull requests fusionnées : #125 à #154 (dates futures, génération, orchestrateur, Studio, limite par source, lecture et redatage des dates, mode brouillons, essais supervisés, rédaction à partir des faits, contrôle de ressemblance, priorité institutionnelle, anti-doublon par sujet, signature et crédit des sources, longueur et affichage des titres, contrôle de fidélité aux faits) ;
- orchestrateur des articles : livré, mode brouillons par défaut, désactivé hors des essais ;
- publication automatique des articles : désactivée localement, arrêt d’urgence activé ;
- essais supervisés : le 18 novembre 2026, 5 brouillons (articles 494 à 498) ; le 19 novembre 2026, 5 brouillons rédigés à partir des faits (articles 499 à 503) ; aucune publication (voir lot D) ;
- dates : 67 % des observations datées à la collecte ; règles propres à RTVA, AR+I, Escaldes-Engordany, AFA et Sant Julià de Lòria ; 68 observations récentes redatées dans `./dev.db` le 19 novembre 2026 ; 7 sources restent sans date exploitable, et l’Agenda n’affiche que des dates d’événements ;
- 4 observations Altaveu du 13 août restent datées au 7 décembre 2026 : données antérieures au correctif #125, sans effet sur l’orchestrateur ;
- images des brouillons : image générique, amélioration nécessaire ;
- production : non déployée ;
- rédaction à partir des faits : génération en deux temps (extraction des faits, puis rédaction sans le texte source), essayée avec succès le 19 novembre 2026 ;
- contrôle de ressemblance : article bloqué au-delà de 20 % de passages de 5 mots communs avec la source ou d’un passage commun de plus de 12 mots ;
- sélection de l’orchestrateur : sources institutionnelles d’abord, médias en dernier ; sources reclassées dans `./dev.db` le 19 novembre 2026 ;
- anti-doublon par sujet : titres rapprochés par mots significatifs communs et, entre sources différentes, par racines communes ; pas de traduction entre langues ;
- signature : articles rédigés automatiquement signés « Rédaction ANDORRE 360 », source créditée sur la page publique avec un lien ; sources renommées avec leur nom officiel ;
- titres : 70 caractères au plus en français, catalan et espagnol ; page d’accueil et pages de rubrique adaptées pour les afficher en entier ;
- articles déjà présents dans `./dev.db` : données de chantier, à effacer lors de la mise en production ;
- prochaines priorités : voir « Revue d’ensemble et priorités » ci-dessous ;
- question juridique de la reprise d’articles de presse : réduite par les trois derniers lots, mais non tranchée ; un avis d’avocat reste nécessaire avant toute mise en ligne.

### Revue d’ensemble et priorités (19 novembre 2026)

Revue franche du chantier demandée par l’utilisateur, sur tous les plans, du plus important au moins important.

#### Juridique

- C’est la plus grande incertitude, et tout le reste en dépend : consulter l’avocat dès maintenant plutôt qu’à la fin, avec trois questions précises (reprise de communiqués institutionnels, réécriture à partir des faits d’un article de presse, crédit de la source avec un lien).
- En attendant l’avis : limiter la rédaction automatique aux sources institutionnelles (Govern, comuns, Policia, CASS…), dont les communiqués sont faits pour être repris et qui sont les plus fiables. Décision de l’utilisateur (19 novembre 2026) : pas de limitation pendant le chantier ; rien n’étant mis en ligne, les tests peuvent s’appuyer sur des articles de confrères. La question revient à la préparation de la mise en production.
- Angle mort : le contrôle de ressemblance compare des mots ; les sources étant surtout en catalan et les articles en français, il ne repère pas une traduction fidèle. La rédaction à partir des faits limite ce risque, mais rien ne le mesure. Piste : comparer après avoir retraduit l’article vers la langue de la source.

#### Qualité éditoriale

- Chaque changement de consigne est jugé sur 5 brouillons et à l’œil : constituer un jeu de référence d’une vingtaine d’observations variées, relu une fois par l’utilisateur, sur lequel comparer chaque nouvelle version de consigne.
- Aucun contrôle automatique ne vérifie que les chiffres, noms et dates de l’article figurent dans la liste de faits : contrôle simple, qui attraperait les inventions.
- La relecture humaine des brouillons 494 à 503 reste à faire : c’est le meilleur retour disponible, et il est gratuit.
- Valeur ajoutée : réécrire l’information des autres apporte peu au lecteur ; ANDORRE 360 se distinguerait en croisant plusieurs sources sur un même sujet (l’anti-doublon sait déjà les regrouper), en ajoutant du contexte et en suivant les données locales (IPC, CASS…).

#### Produit

- Images : tous les brouillons ont la même image générique, point faible le plus visible en une.
- « Ils en parlent » : des communiqués politiques signés par la rédaction risquent de passer pour des prises de position du journal ; prévoir une présentation claire (« Communiqué de… ») et un équilibre entre partis.
- Langue : site d’abord en français dans un pays de langue officielle catalane ; choix à assumer consciemment selon le public visé.

#### Technique

- 10 composants de rubrique recopient les mêmes cartes (41 corrections identiques dans 9 fichiers pour les titres) : quelques composants de carte partagés. Fait le 20 novembre 2026 (voir « Cartes partagées des rubriques » ci-dessous).
- Les tests de mise en page vérifient des chaînes de classes CSS, ce qui est fragile : les remplacer par un test automatique qui mesure les titres coupés dans un navigateur. Remplacés le 20 novembre 2026 pour les rubriques et la page d’accueil.
- Nettoyage : fait le 20 novembre 2026 pour les fichiers morts et les avertissements de lint (voir « Nettoyage des fichiers morts » ci-dessous) ; restent les sauvegardes `dev.before-*.db` qui s’accumulent à la racine.
- Configuration des sources dans la base, règles par site dans le code : un fichier de définition des sources, versionné, rendrait tout reproductible.
- Collecte : 948 observations sans date, 2 sources en erreur 403 (Andorra Business, Encamp), aucune alerte quand une source tombe.

#### Exploitation et sécurité

- Les interrupteurs `AI_*` se modifient en éditant `.env` à la main, ce qui est risqué (le jour de l’essai l’a montré) : une page d’administration ou un petit script.
- Aucun suivi du coût par article (2 à 4 appels OpenAI) ni plafond de dépense. Plafond sur 24 heures et enregistrement des jetons de chaque appel : fait le 20 novembre 2026 (voir « Suivi des jetons et plafond de dépense OpenAI » ci-dessous) ; consommation affichée sur la page de l’orchestrateur ; reste le coût par article.
- Mise en production non préparée : hébergement, choix de la base (SQLite ou base serveur), sauvegardes automatiques, effacement des articles de chantier.

#### Méthode de travail

- Le guide dépasse 1 000 lignes et mélange journal, décisions et état actuel : le découper en une page « état actuel » lisible en 2 minutes, un journal des décisions et une procédure pour les manipulations sensibles (essai, sauvegarde, `.env`).
- Une PR de documentation séparée après chaque écriture en base demande beaucoup de validations : regrouper la documentation avec le changement, ou par fin de journée.

#### Priorités retenues, dans l’ordre

1. Avis d’avocat maintenant (questions préparées le 19 novembre 2026) ; pas de limitation aux sources institutionnelles pendant le chantier, décision de l’utilisateur.
2. Relecture humaine des brouillons 494 à 503, puis jeu de référence.
3. Contrôle automatique de fidélité : chiffres, noms et dates de l’article présents dans la liste de faits (fait, voir « Contrôle de fidélité aux faits »).
4. Images.
5. Préparation de la mise en production : interrupteurs sans `.env`, coûts, hébergement, sauvegardes.

### Nettoyage des fichiers morts (20 novembre 2026)

Vingt fichiers que plus rien n’utilisait ont été supprimés ; Git garde leur historique :

- copies de sauvegarde de la page d’accueil : `HomePageEditorial.fusion.tsx`, `HomePageEditorial.apres-fusion.tsx`, `HomePageEditorial.apres-recherche.tsx` ;
- anciennes versions du site public : `CategoryPage.tsx`, `CategoryPageDB.tsx`, `CategoryPageDB-v2.tsx`, `HomePageDB.tsx`, `Navbar.tsx` ;
- ancien éditeur d’articles, remplacé par le Studio V4 : `components/admin/article/ArticleEditor.tsx`, `ArticleContent.tsx`, `actions/articles.ts`, `components/admin/media/MediaUploader.tsx` ;
- modules abandonnés : `lib/utils.js` (doublon de `lib/utils.ts`, que Next lit en priorité), `lib/media/index.ts`, `image.ts`, `metadata.ts`, `lib/editorial/assign.ts`, `lib/analytics/score.ts`, et `lib/publications.ts` avec son test (calcul de l’ancienne page d’accueil, appelé seulement par ce test).

Garde-fou : `lib/orphanModules.test.ts` suit les imports depuis les pages et routes de `app/`, les scripts, les fichiers de configuration et les tests. Il échoue si un module n’est importé par rien, ou seulement par des tests hors des exceptions listées avec leur raison (`lib/editorial/testUtils.ts`, `lib/source-engine/backfillObservationDates.ts`).

Lint : les trois variables inutilisées restantes sont corrigées. Restent 4 avertissements `<img>`, qui relèvent du lot images.

### Cartes partagées des rubriques (20 novembre 2026)

Les 10 pages de rubrique recopiaient les mêmes cartes, et les copies avaient dérivé : une trentaine de styles de titre pour 7 rôles, d’anciennes unes à hauteur fixe à côté des nouvelles. Elles sont harmonisées :

- `components/rubric/RubricCards.tsx` définit une seule fois chaque rôle : une de rubrique, article principal, brève, carte sans image, carte avec image (large ou latérale), « Question à… », « Bon à savoir », ainsi que le squelette de page, les grilles et le bouton partenaire. Les titres sont limités en lignes, jamais par une hauteur fixe ; l’appel à lire est aligné en bas des cartes d’une même rangée ;
- `components/rubric/NewsRubricPage.tsx` porte le plan commun à Économie, Politique, Société et International, qui ne gardent que leur catégorie et leur partenaire ;
- `lib/rubric/allocateRubricSlots.ts` répartit les articles dans les emplacements, dans l’ordre et sans trou. Correctif au passage : Économie, Politique, Société et International sautaient les 13ᵉ et 14ᵉ articles ; International, Politique et Société affichent désormais un article de plus avec la base de chantier ;
- seule la carte principale lit une vidéo ; « Question à… » et les cartes latérales n’intègrent plus de lecteur dans une carte cliquable.

Tests : les 10 tests qui vérifiaient des chaînes de classes CSS sont remplacés par des tests de rendu des cartes (`RubricCards.test.tsx`) et un garde-fou (`rubricPages.test.ts`) qui refuse toute carte recopiée dans une page et tout article sauté.

Vérification dans un navigateur, sur une copie de `./dev.db`, aux largeurs 375, 768, 1024, 1280 et 1440 sur les 10 rubriques : aucun titre de 70 caractères coupé, aucun débordement horizontal, colonne latérale contenue dans la page.

### Page d’accueil : calcul séparé de l’affichage (20 novembre 2026)

- `lib/editorial/composeHomePage.ts` calcule la composition (zones placées prioritaires, complément par les derniers articles, Grand format vide pendant une composition automatique sans placement) ; `components/home/HomePageView.tsx` l’affiche ; `HomePageEditorial.tsx` ne fait plus que charger les données.
- Correctif : la Sélection n’affichait que les cartes 2 à 5, alors que l’automatisation en place 5 (`HOME_VISIBLE_ZONE_CAPACITIES`). La première carte, la mieux classée, restait invisible. Le nombre d’emplacements affichés suit désormais les capacités de l’automatisation.
- Les blocs n’ont plus de hauteur fixe qui coupait leur contenu ; le lecteur vidéo de l’édito n’est plus enfermé dans un lien.
- La publicité du briefing, intégrée au code en base64 (51 Ko, envoyée deux fois par page), est un fichier : `public/images/home/briefing-andorra-360.jpg`. La page d’accueil passe de 171 Ko à 76 Ko de HTML.
- `lib/media/videoEmbed.ts` remplace trois copies de la conversion des adresses vidéo et n’accepte plus un domaine qui imite seulement YouTube, Vimeo, Facebook ou TikTok.
- Vérification dans un navigateur, sur une copie de `./dev.db` : aucun des 15 titres coupé à 375, 768, 1024, 1280 et 1440, aucun débordement ; 15 articles affichés contre 14 avant.

### Images, étape 1 : relevé à la collecte (20 novembre 2026)

Décision de l’utilisateur : deux pistes. Une banque d’images classée par rubrique, utilisable en production ; et, pour les essais du chantier seulement, la photo de la source avec son crédit, derrière un réglage par source fermé par défaut et un garde-fou qui interdira la publication. Les images générées par IA sont écartées pour l’information.

État de départ : chaque brouillon reçoit `/images/global/hero.jpg` ; la collecte n’enregistrait aucune image ; 13 des 41 sources affichent des droits réservés, aucune une licence libre.

Étape 1, sans effet sur l’affichage :

- `Observation.imageUrl` et `Observation.imageRights` (migration `20261120150000_add_observation_image`) ;
- `lib/source-engine/articleImage.ts` relève l’image de partage de l’article (Open Graph, Twitter, JSON-LD, `image_src`) ou du flux RSS (`enclosure`, `media:content`, `media:thumbnail`), écarte les logos, icônes, images par défaut et SVG, et relève la mention de droits du site ;
- une nouvelle collecte qui ne trouve pas d’image n’efface jamais celle déjà connue.

Essai à blanc sur la dernière page de chaque source active, sans écriture : 20 sources sur 41 fournissent une photo propre à l’article, 23 une mention de droits. Les autres n’en déclarent pas, ou n’ont pas répondu (Govern, Consell General, Encamp, Andorra Business).

Migration appliquée à `./dev.db` le 20 novembre 2026 après sauvegarde vérifiée (`dev.before-observation-image-20261120-141756.db`, intégrité `ok`, 2 141 observations conservées).

### Images, étape 2 : photo de la source dans les brouillons (20 novembre 2026)

- `Source.imageReuse` : `NONE` (défaut, aucune reprise), `TESTS` (essais du chantier) ou `ALLOWED` (licence ou accord). Migration `20261120160000_add_source_image_reuse`, par ajout de colonnes seulement ;
- `lib/media/importSourceImage.ts` télécharge la photo relevée (JPEG, PNG ou WebP, 10 Mo au plus, 480 pixels de large au moins), la range dans `storage/media/sources/` (hors Git) et crée un média avec le nom de la source pour crédit, la mention de droits relevée, l’adresse d’origine et `testOnly` pour une source en `TESTS`. Une photo déjà importée depuis la même adresse est réutilisée. Le serveur ne télécharge jamais une adresse locale ou du réseau interne. Un échec laisse l’image générique, sans bloquer l’article ;
- `createArticleFromObservation` reprend la photo après les contrôles bloquants, la rattache à l’article (`MediaUsage`) et consigne la reprise dans l’audit ;
- garde-fou (`lib/media/sourceImagePolicy.ts`) : la publication est refusée, dans le Studio comme en publication automatique, tant que l’image est réservée aux essais ;
- page publique : crédit « Photo : … » (« Foto: … » en catalan et en espagnol) sous l’image, lu dans la médiathèque.

Essai sur une copie de `./dev.db`, sans OpenAI : collecte réelle d’Altaveu, RTVA et Policia d’Andorra passées en `TESTS`, puis un brouillon par source avec un générateur neutre. Les trois brouillons ont reçu la photo de leur article, avec crédit et mention de droits, et la publication a été refusée pour chacun. Copie et fichiers d’essai supprimés ensuite.

Migration appliquée à `./dev.db` le 20 novembre 2026 après sauvegarde vérifiée (`dev.before-source-image-reuse-20261120-143050.db`). Le même jour, avec l’accord de l’utilisateur et après sauvegarde (`dev.before-source-image-tests-20261120-143238.db`), les 20 sources qui fournissent une photo d’article sont passées en `TESTS` (21 lignes : Diari d’Andorra a deux entrées, site et flux RSS) : Acció, Agenda.ad, Altaveu, Andorra Ara, Andorra Recerca + Innovació, BC MoraBanc Andorra, Bondia, Cambra de Comerç, Comitè Olímpic Andorrà, Comú d’Escaldes-Engordany, Concòrdia, Creu Roja Andorrana, Diari d’Andorra, El Periòdic d’Andorra, FC Andorra, Federació Andorrana de Ciclisme, La Veu Lliure, OMS Europe, Policia d’Andorra et RTVA. Les 42 autres restent en `NONE`. La question de la reprise des photos figure dans les questions à l’avocat (question 20).

### Images, étape 3 : banque d’images par rubrique (20 novembre 2026)

- `Media.bankCategory` (migration `20261120170000_add_media_bank_category`) : la rubrique qu’une image de la médiathèque peut illustrer, `ALL` pour toutes, vide hors banque. Réglage dans la médiathèque (« Banque d’images ») ; une photo de source réservée aux essais ou une vidéo est refusée ;
- ordre de choix à la création d’un brouillon : photo de la source si son réglage le permet, sinon image de la banque de la rubrique, sinon image valable pour toutes, sinon image générique ;
- rotation (`lib/media/bankImage.ts`) : l’image la moins utilisée par des articles, puis la plus anciennement utilisée ;
- essai sur une copie de `./dev.db` avec deux images rangées en Sports, l’une déjà utilisée 3 fois : six brouillons ont reçu 12, 12, 12, 14, 12, 14, la moins utilisée rattrapant son retard puis les deux alternant.

La banque est vide tant que personne n’y range d’image : elle attend des photos qui appartiennent à ANDORRE 360 ou sous licence, avec leur crédit.

### Suivi des jetons et plafond de dépense OpenAI (20 novembre 2026)

- chaque appel réel à OpenAI est enregistré dans la table `AiUsage` (migration `20261120180000_add_ai_usage`) : date, modèle, nature de l’appel (`article_fact_sheet`, `article_from_facts`, `article_title`, `article_translation`, `home_candidate_assessment`), jetons d’entrée et de sortie ;
- avant chaque appel, les jetons consommés sur les 24 dernières heures sont comparés au plafond `AI_DAILY_TOKEN_LIMIT` ; une fois le plafond atteint, l’appel est refusé sans contacter OpenAI (`lib/ai/aiUsageBudget.ts`) ;
- sans variable, ou avec une valeur invalide, le plafond est de 500 000 jetons ; `0` interdit tout appel. Le plafond est exprimé en jetons et non en euros, car le prix dépend du modèle : le montant exact se lit toujours dans le tableau de bord OpenAI ;
- le dernier appel peut dépasser légèrement le plafond, sa taille n’étant connue qu’après coup ;
- l’orchestrateur ne lance rien si le plafond est déjà atteint (garde-fou « Plafond de dépense OpenAI atteint ») et s’arrête avant l’observation suivante s’il est atteint en cours de lot (statut « Arrêtée par un garde-fou ») ; l’aperçu l’affiche parmi les garde-fous fermés ;
- la protection couvre la rédaction, les traductions et l’évaluation de la page d’accueil : tous passent par les deux clients OpenAI du projet.

Affichage (20 novembre 2026) : la page de l’orchestrateur (`/admin/diffusion/orchestrateur`) montre en tête une carte « Consommation OpenAI » : jetons des 24 dernières heures face au plafond, avec une jauge et un avertissement quand le plafond est atteint, détail par type d’appel, et les 7 derniers jours découpés à l’heure d’Andorre (`lib/ai/summarizeAiUsage.ts`). Vérifiée dans le navigateur, sur ordinateur et sur téléphone. Le même jour, le choix « Banque d’images » de la médiathèque a été vu dans le navigateur.

Reste à faire : rattacher chaque appel à son article, pour connaître le coût d’un article.

### Mise en page indépendante de la longueur des textes (20 novembre 2026)

Règle demandée par l’utilisateur : les blocs et les photos ne doivent pas bouger selon le nombre de lignes du titre ou du chapô d’un article.

Mesure dans le navigateur, avant correction, sur l’accueil, les 13 rubriques et le Fil info : chaque titre et chaque chapô a été remplacé par un texte très court, puis très long, et la position et la taille de chaque carte et de chaque photo ont été comparées. Presque toutes les cartes grandissaient ou rétrécissaient, et dans les rubriques les photos des cartes étirées changeaient de taille.

Correctif :

- chaque texte limité à N lignes (`line-clamp-N`) réserve aussi N lignes (`min-h-[Nlh]`), à chaque largeur d’écran ;
- un chapô absent garde sa place, et une photo absente de l’accueil est remplacée par l’image générique ;
- au Fil info, les titres n’étaient plus coupés en plein milieu d’une ligne par une hauteur fixe (`overflow-hidden`) : ils sont désormais limités en lignes, avec des points de suspension ; les titres et chapôs qui n’avaient aucune limite en ont reçu une ;
- `components/testing/reservedLines.ts` vérifie la règle dans les tests des cartes de rubrique, de l’accueil et du Fil info.

Mesure après correction, à 1 280, 768 et 375 pixels de large : tout reste en place sur toutes les pages. Seul l’encadré fixe « Trafic et état des routes » de Loisirs et Lifestyle, dont le texte est écrit dans le code et ne vient d’aucun article, n’est pas concerné.

### Page d’accueil : blocs figés et colonnes alignées en bas (21 novembre 2026)

Après la correction précédente, l’utilisateur a jugé la une déstructurée. Deux défauts étaient visibles. Le chapô du grand format s’arrêtait après 6 lignes à côté d’une grande photo. La colonne de droite finissait environ 340 px plus bas que la colonne principale ; l’écart existait déjà, la correction précédente l’avait augmenté de 55 px.

Règle de l’utilisateur : les blocs ne bougent pas, tous finissent alignés en bas de page, et une fois alignés chacun garde une hauteur figée.

- Sur grand écran (`xl`, 1 280 px et plus), la page est limitée à 1 280 px de large et chaque bloc a donc toujours la même largeur. Chaque bloc y reçoit une hauteur fixe (`HOME_XL_BLOCK_HEIGHTS` dans `components/home/HomePageView.tsx`), mesurée dans le navigateur :
  - à gauche : grande carte 825 px, L’essentiel et Grand format 971 px, publicité 531 px ;
  - à droite : Édito 628 px, Sélection 1 177 px, À découvrir 530 px.
- Avec leurs espacements (40 px à gauche, 36 px à droite), les deux colonnes totalisent la même hauteur. Un test vérifie cette égalité.
- Aucun bloc n’est étiré pour combler un écart. La hauteur d’un bloc ne dépend ni des textes ni du nombre d’articles : une Sélection de 3 cartes ou une une sans édito gardent les mêmes hauteurs.
- La photo du grand format occupe la hauteur restante de son bloc. Son chapô peut aller jusqu’à 14 lignes et s’affiche en entier.
- Mesures à 1 280 et 1 440 px : les deux colonnes finissent toutes deux à 3 233 px ; aucun bloc ne déborde ; aucun élément ne bouge avec des textes très courts ou très longs, ni avec deux cartes de moins en Sélection et dans À découvrir.
- Sous 1 280 px, les colonnes sont empilées et les hauteurs fixes ne s’appliquent pas ; la règle des lignes réservées continue de s’appliquer.

Une modification des cartes de l’accueil (police, marges, nombre d’articles par zone) oblige à remesurer ces hauteurs.

Rééquilibrage demandé par l’utilisateur le même jour :
- la photo du grand format est réduite d’un quart (780 → 585 px) ;
- le bloc L’essentiel et grand format est réduit d’autant (971 → 776 px) ;
- la photo de la grande carte est agrandie d’autant (390 → 585 px), et la grande carte passe de 825 à 1 020 px.

Les deux photos ont désormais la même hauteur. Mesure à 1 440 px : les deux colonnes finissent toujours à 3 233 px, sans débordement.

---

## 19. Résumé en une minute

ANDORRE 360 sait déjà collecter des sources, créer des observations, générer des brouillons, évaluer des candidats pour la page d’accueil, simuler une composition, appliquer exactement la proposition examinée et revenir en arrière.

Les protections fonctionnent : lors de l’essai, l’article 492 a bien été créé comme brouillon et n’a pas été publié.

Le chantier a toutefois révélé deux familles de problèmes :

1. certaines dates collectées sont fausses et placées dans le futur ;
2. la qualité rédactionnelle du brouillon n’est pas encore suffisante pour une publication autonome.

La prochaine étape est donc de corriger les dates futures. Ensuite, il faudra améliorer la génération, construire l’orchestrateur autonome, multiplier les essais supervisés et seulement après automatiser toute la chaîne.

L’objectif final ne change pas : l’IA doit pouvoir prendre en charge toutes les publications. Nous construisons simplement les contrôles nécessaires pour que cette autonomie soit fiable, explicable et réversible.
