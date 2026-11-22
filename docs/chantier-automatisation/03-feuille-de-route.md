# ANDORRE 360 — Feuille de route et sujets mis de côté

[Sommaire](README.md) · Guide du chantier d’automatisation éditoriale, parties 12 à 14.

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
