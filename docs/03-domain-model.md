# Domain Model

> Le modèle métier d’ANDORRE 360.

Ce document décrit les objets fondamentaux du système, leur rôle, leurs relations et les règles qui garantissent leur cohérence.

Il ne décrit ni la base de données, ni les tables Prisma, ni les choix techniques d’implémentation.

Il décrit le métier.

---

# Principe fondamental

Une rédaction ne produit pas seulement des articles.

Elle observe des informations, identifie des événements, établit des faits, prend des décisions éditoriales et diffuse des contenus.

Les articles ne sont qu’une représentation éditoriale de la connaissance construite par le système.

Le modèle métier repose donc sur plusieurs niveaux distincts :

```text
Source
    ↓
Observation
    ↓
Claim
    ↓
Fact
    ↓
Story
    ↓
Article
    ↓
Publication
```

Ces niveaux ne doivent pas être confondus.

Une Observation décrit ce qui a été collecté.

Un Claim décrit ce qu’une source affirme.

Un Fact décrit ce que le système considère comme établi.

Une Story organise les Facts autour d’un événement.

Un Article transforme cette connaissance en contenu journalistique.

Une Publication diffuse cet Article sur un canal donné.

---

# Source

## Définition

Une `Source` est un fournisseur d’informations surveillé par le système.

Elle représente l’origine éditoriale d’une information, et non uniquement son adresse technique.

## Exemples

- un organisme gouvernemental ;
- une commune ;
- un service de police ;
- une entreprise ;
- une association ;
- un média ;
- un flux RSS ;
- une API ;
- un site web ;
- une page de réseau social ;
- un document ou un espace documentaire.

## Responsabilités

Une Source permet au système de déterminer :

- qui produit l’information ;
- comment cette information peut être collectée ;
- à quelle fréquence elle doit être surveillée ;
- quel niveau de confiance éditoriale lui est accordé ;
- quelles règles spécifiques doivent être appliquées lors de la collecte.

## Propriétés métier

Une Source possède notamment :

- un nom ;
- une origine ;
- un type d’organisation ;
- une langue principale ;
- un mode de collecte ;
- une fréquence de surveillance ;
- des règles d’extraction ;
- un niveau de confiance éditoriale ;
- un état d’activation ;
- un état de disponibilité technique.

## Disponibilité technique

L’état de disponibilité d’une Source peut être :

- `UNKNOWN` : la Source n’a jamais été contrôlée ;
- `AVAILABLE` : le dernier contrôle technique a réussi ;
- `UNAVAILABLE` : le dernier contrôle technique a échoué.

Une Source conserve également :

- la date de son dernier contrôle ;
- la date de son dernier contrôle réussi ;
- la date de sa dernière erreur ;
- le message de sa dernière erreur.

La disponibilité technique et la confiance éditoriale sont deux notions distinctes.

Une Source techniquement disponible peut être éditorialement peu fiable.

Une Source temporairement indisponible peut rester une référence éditoriale majeure.

## Relations

Une Source peut produire plusieurs Observations.

Une Source ne crée jamais directement une Story, un Fact ou un Article.

---

# Observation

## Définition

Une `Observation` représente un contenu brut détecté dans une Source à un instant donné.

Elle constitue la trace immuable de ce que le système a collecté.

## Exemples

- un item RSS ;
- une page web nouvelle ou modifiée ;
- une réponse d’API ;
- un communiqué PDF ;
- une publication issue d’un réseau social ;
- une nouvelle version d’un document ;
- un changement détecté dans une page existante.

## Responsabilités

L’Observation conserve fidèlement le contenu d’origine avant toute interprétation éditoriale.

Elle permet :

- de prouver ce qui a été collecté ;
- de détecter les doublons ;
- de détecter les modifications ;
- de comparer plusieurs versions ;
- de relier les connaissances produites à leur origine.

## Propriétés métier

Une Observation possède notamment :

- une Source d’origine ;
- un identifiant externe lorsqu’il existe ;
- une URL ou une référence d’origine ;
- un titre brut ;
- un contenu brut ;
- une langue détectée ;
- une date de publication externe ;
- une date de détection ;
- une empreinte de contenu ;
- un numéro ou un historique de version ;
- les métadonnées collectées.

## Règles

Une Observation :

- ne constitue pas encore un événement ;
- ne constitue pas encore un fait établi ;
- ne doit pas être modifiée pour refléter une interprétation ultérieure ;
- doit rester consultable même si la Source change ou disparaît.

Une Source peut produire plusieurs Observations.

Une Observation peut contenir plusieurs Claims.

Une Observation peut contribuer à plusieurs Stories.

---

# Claim

## Définition

Un `Claim` représente une affirmation extraite d’une Observation.

Il décrit ce qu’une Source affirme, sans présumer que cette affirmation est vraie.

Le Claim constitue la séparation entre le contenu brut et la connaissance validée.

## Exemples

- « La route sera fermée à partir de 18 heures. »
- « Le Gouvernement annonce une aide de 200 euros. »
- « Trois personnes ont été blessées. »
- « Le match a été reporté à dimanche. »

## Responsabilités

Le Claim permet :

- d’extraire les affirmations importantes d’un contenu ;
- de comparer les affirmations de plusieurs Sources ;
- de détecter les confirmations ;
- de détecter les contradictions ;
- d’évaluer le niveau de confiance d’une information ;
- de conserver exactement ce qui a été affirmé et par qui.

## Propriétés métier

Un Claim possède notamment :

- une formulation ;
- une Observation d’origine ;
- une ou plusieurs entités concernées ;
- une date d’extraction ;
- un niveau de confiance d’extraction ;
- un état de vérification ;
- une éventuelle période de validité.

## États possibles

Un Claim peut notamment être :

- `DETECTED` : l’affirmation vient d’être extraite ;
- `SUPPORTED` : elle est soutenue par au moins une preuve ;
- `CONFIRMED` : elle est confirmée par des Sources suffisantes ;
- `CONTRADICTED` : une autre information la contredit ;
- `REJECTED` : elle est considérée comme incorrecte ;
- `OBSOLETE` : elle était valide mais ne l’est plus ;
- `UNRESOLVED` : le système ne peut pas encore conclure.

## Règles

Un Claim n’est pas automatiquement un Fact.

Plusieurs Claims peuvent soutenir le même Fact.

Des Claims contradictoires peuvent coexister tant qu’aucune décision de validation n’a été prise.

---

# Evidence

## Définition

Une `Evidence` représente un élément de preuve utilisé pour soutenir, contredire ou contextualiser un Claim ou un Fact.

L’Evidence conserve le lien précis entre une connaissance et son origine.

## Exemples

- un passage exact d’un communiqué ;
- une ligne d’une réponse API ;
- une citation officielle ;
- un tableau contenu dans un PDF ;
- une photographie publiée par une Source ;
- une donnée extraite d’un document administratif.

## Responsabilités

L’Evidence permet :

- d’expliquer pourquoi une information a été considérée comme fiable ;
- de retrouver le passage exact ayant servi à une décision ;
- de distinguer une preuve directe d’une simple interprétation ;
- d’auditer les décisions prises par le système ou par un journaliste.

## Propriétés métier

Une Evidence possède notamment :

- une Observation d’origine ;
- un extrait ou une référence précise ;
- un type de preuve ;
- une relation avec un Claim ou un Fact ;
- un rôle : soutien, contradiction ou contexte ;
- une date de création ;
- un niveau de fiabilité.

## Règles

Une Evidence ne doit jamais exister sans provenance identifiable.

Chaque Fact important doit pouvoir être relié à une ou plusieurs Evidences.

---

# Fact

## Définition

Un `Fact` représente une information structurée que le système considère comme suffisamment établie pour être utilisée dans la production éditoriale.

Un Fact n’est pas seulement une phrase.

Il représente une connaissance vérifiable, contextualisée et traçable.

## Exemples

- la réunion aura lieu le 12 novembre ;
- la route sera fermée entre 18 heures et 23 heures ;
- le montant annoncé est de 200 euros ;
- trois personnes ont été blessées ;
- le score final est de 2 à 1 ;
- la mesure entre en vigueur le 1er janvier.

## Responsabilités

Le Fact permet :

- de représenter la connaissance indépendamment des articles ;
- de produire plusieurs contenus à partir d’une même information ;
- de mettre à jour précisément une Story ;
- de comparer une nouvelle information avec la connaissance existante ;
- de détecter les changements significatifs ;
- de conserver l’historique des versions.

## Propriétés métier

Un Fact possède notamment :

- une nature ;
- une valeur ;
- une unité éventuelle ;
- une période de validité ;
- un niveau de confiance ;
- un état ;
- les Claims qui le soutiennent ou le contredisent ;
- les Evidences associées ;
- un historique de ses évolutions.

## États possibles

Un Fact peut notamment être :

- `PROVISIONAL` : utilisé avec prudence dans l’attente de confirmation ;
- `CONFIRMED` : suffisamment vérifié pour être considéré comme établi ;
- `CONTRADICTED` : contesté par une information crédible ;
- `CORRECTED` : remplacé par une version plus exacte ;
- `OBSOLETE` : valide auparavant, mais désormais dépassé ;
- `REJECTED` : considéré comme incorrect.

## Règles

Un Fact :

- doit toujours posséder une provenance ;
- peut être soutenu par plusieurs Claims ;
- peut être lié à plusieurs Stories ;
- peut évoluer sans entraîner automatiquement la création d’une nouvelle Story ;
- ne doit jamais être silencieusement remplacé.

Toute correction crée une nouvelle version ou un nouvel état historique.

---

# Entity

## Définition

Une `Entity` représente un élément identifiable du monde réel mentionné dans les Observations, Claims, Facts ou Stories.

## Exemples

- une personne ;
- une organisation ;
- une commune ;
- un lieu ;
- une route ;
- un événement sportif ;
- une loi ;
- un service public ;
- une entreprise ;
- un produit.

## Responsabilités

L’Entity permet :

- de reconnaître qu’un même acteur est mentionné sous plusieurs formes ;
- de relier différentes Stories ;
- de faciliter les recherches ;
- de construire l’historique d’une personne, d’un organisme ou d’un lieu ;
- d’éviter les doublons sémantiques.

## Propriétés métier

Une Entity possède notamment :

- un nom principal ;
- un type ;
- des alias ;
- des identifiants externes éventuels ;
- une langue ou une forme canonique ;
- des relations avec d’autres Entities ;
- les Stories, Facts et Claims auxquels elle est liée.

## Règles

Deux noms différents peuvent représenter la même Entity.

La fusion de deux Entities doit être traçable et réversible.

---

# Story

## Définition

Une `Story` représente un événement, une situation ou un sujet éditorial suivi dans le temps.

Elle organise les Facts, les Sources, les Entities et les décisions relatives à un même événement.

## Exemples

- l’annonce d’une nouvelle aide énergétique ;
- un accident de circulation ;
- une élection communale ;
- une fermeture de route ;
- un match sportif ;
- une réforme législative ;
- une conférence de presse ;
- un épisode météorologique.

## Responsabilités

La Story permet :

- de regrouper les informations relatives au même événement ;
- de suivre son évolution ;
- d’éviter la création de sujets en double ;
- de centraliser les Facts établis ;
- de produire plusieurs Articles ;
- de coordonner le travail humain et automatisé.

## Propriétés métier

Une Story possède notamment :

- un titre interne ;
- un résumé interne ;
- un statut ;
- un niveau de confiance ;
- une priorité ;
- une catégorie ;
- un niveau de sensibilité ;
- un mode de fonctionnement ;
- un propriétaire actif éventuel ;
- plusieurs Sources ;
- plusieurs Observations ;
- plusieurs Claims ;
- plusieurs Facts ;
- plusieurs Entities ;
- plusieurs Articles ;
- un historique de décisions.

## Cycle de vie

Une Story peut notamment être :

- `DETECTED` : un événement potentiel a été repéré ;
- `ANALYZING` : le système analyse les informations disponibles ;
- `ACTIVE` : l’événement est confirmé et suivi ;
- `DEVELOPING` : de nouvelles informations sont attendues ou détectées ;
- `REVIEW_REQUIRED` : une validation humaine est nécessaire ;
- `CLOSED` : l’événement ne nécessite plus de suivi actif ;
- `ARCHIVED` : la Story est conservée comme historique.

## Règles

Une Story :

- peut être enrichie par plusieurs Sources ;
- peut contenir plusieurs Facts ;
- peut produire plusieurs Articles ;
- peut être fusionnée avec une autre Story ;
- peut être scindée si elle regroupe plusieurs événements distincts ;
- ne peut avoir qu’un seul propriétaire actif à un instant donné ;
- reste indépendante de ses Articles.

La suppression d’un Article ne supprime pas la Story ni les Facts associés.

---

# Article

## Définition

Un `Article` est une représentation journalistique d’une Story ou d’un ensemble cohérent de Facts.

Il constitue un contenu éditorial destiné à être relu, validé ou publié.

## Origine

Un Article peut être :

- `AI` : produit principalement par un agent IA ;
- `HUMAN` : produit principalement par un journaliste ;
- `HYBRID` : produit conjointement par un journaliste et des agents IA.

## Responsabilités

L’Article permet :

- de raconter un événement ;
- d’expliquer et de contextualiser des Facts ;
- d’adapter l’information à un public ;
- de produire plusieurs angles à partir de la même Story ;
- de préparer la diffusion sur un ou plusieurs canaux.

## Propriétés métier

Un Article possède notamment :

- une Story principale ;
- les Facts utilisés ;
- les Sources et Evidences mobilisées ;
- un titre ;
- un chapô éventuel ;
- un contenu ;
- une langue ;
- un ton ;
- un angle éditorial ;
- un auteur ou un responsable éditorial ;
- un statut ;
- un historique de versions.

## Cycle de vie

Un Article peut notamment être :

- `DRAFT` : brouillon en cours ;
- `AI_DRAFT` : brouillon produit par un agent IA ;
- `REVIEW` : en attente de relecture ;
- `APPROVED` : validé éditorialement ;
- `PUBLISHED` : diffusé sur au moins un canal ;
- `ARCHIVED` : retiré du flux éditorial actif.

## Règles

Un Article doit toujours être relié à au moins une Story.

Un Article peut utiliser plusieurs Facts.

Chaque affirmation factuelle significative d’un Article doit pouvoir être reliée à une Evidence.

Une Story peut produire plusieurs Articles :

- une brève ;
- un article complet ;
- une analyse ;
- une mise à jour ;
- une version dans une autre langue ;
- un contenu adapté à un canal spécifique.

---

# Publication

## Définition

Une `Publication` représente la diffusion d’une version précise d’un Article sur un canal donné.

L’Article est le contenu éditorial.

La Publication est son existence sur un canal de diffusion.

## Exemples de canaux

- site web ;
- application mobile ;
- Facebook ;
- WhatsApp ;
- newsletter ;
- API ;
- flux partenaire ;
- réseau social.

Les notions comme `Hero`, `Feature` ou `Brève` décrivent plutôt un format ou un emplacement éditorial qu’un canal.

## Responsabilités

La Publication permet :

- de diffuser un Article ;
- de suivre son statut sur chaque canal ;
- de gérer des dates de publication différentes ;
- d’adapter le contenu au canal ;
- de corriger ou retirer une diffusion ;
- de conserver l’historique des versions publiées.

## Propriétés métier

Une Publication possède notamment :

- un Article ;
- une version précise de cet Article ;
- un canal ;
- un format ;
- un emplacement éventuel ;
- un statut ;
- une date prévue ;
- une date de publication effective ;
- un identifiant externe ;
- une URL publique éventuelle ;
- un historique de synchronisation.

## Cycle de vie

Une Publication peut notamment être :

- `SCHEDULED` : planifiée ;
- `PUBLISHING` : en cours de diffusion ;
- `PUBLISHED` : publiée ;
- `UPDATED` : mise à jour après publication ;
- `FAILED` : échec technique ;
- `UNPUBLISHED` : retirée ;
- `ARCHIVED` : conservée uniquement dans l’historique.

## Règles

Une Publication est toujours liée à une version identifiable d’un Article.

La modification d’un Article publié ne modifie pas silencieusement les Publications existantes.

Une nouvelle synchronisation ou une nouvelle version de Publication doit être créée.

---

# Edition

## Définition

Une `Edition` représente une sélection éditoriale organisée pour une période, un public ou un support donné.

Elle décrit l’état intentionnel du journal à un moment donné.

## Exemples

- édition du matin ;
- édition de midi ;
- édition du soir ;
- page d’accueil du site ;
- sélection hebdomadaire ;
- édition spéciale ;
- newsletter quotidienne.

## Responsabilités

L’Edition permet :

- de sélectionner des Publications ;
- de définir leur ordre ;
- de déterminer leur importance ;
- de gérer les emplacements éditoriaux ;
- de conserver l’historique de la composition du journal.

## Propriétés métier

Une Edition possède notamment :

- un nom ;
- un type ;
- une période de validité ;
- un canal ou un support ;
- un statut ;
- plusieurs emplacements éditoriaux ;
- plusieurs Publications ordonnées ;
- un historique de modifications.

## Règles

Une Publication peut apparaître dans plusieurs Editions.

Une Edition ne modifie pas le contenu d’un Article.

Elle organise sa présentation.

---

# Agent

## Définition

Un `Agent` représente une capacité automatisée spécialisée exécutant une mission précise dans le système.

Un Agent est un acteur du système, mais il n’est pas une connaissance métier.

## Exemples

- Collection Agent ;
- Fact Extraction Agent ;
- Story Agent ;
- Verification Agent ;
- Writer Agent ;
- Editor Agent ;
- SEO Agent ;
- Translation Agent ;
- Layout Agent ;
- Publisher Agent ;
- Quality Agent.

## Responsabilités

Un Agent peut :

- analyser des Observations ;
- extraire des Claims ;
- proposer des Facts ;
- rapprocher des Stories ;
- rédiger des Articles ;
- vérifier la cohérence d’un contenu ;
- préparer une Publication ;
- proposer une Decision.

## Propriétés métier

Un Agent possède notamment :

- une mission ;
- un périmètre ;
- des entrées autorisées ;
- des sorties attendues ;
- des outils disponibles ;
- un niveau d’autonomie ;
- des règles de qualité ;
- des limites ;
- une version de configuration.

## Règles

Chaque Agent possède une responsabilité principale clairement définie.

Un Agent ne doit pas prendre une décision en dehors de son périmètre.

Toute action d’un Agent doit être attribuable et traçable.

Un Agent ne remplace jamais les règles éditoriales du système.

---

# Workflow

## Définition

Un `Workflow` décrit l’enchaînement des étapes nécessaires pour atteindre un objectif métier.

Il ne se limite pas au cycle de vie d’une Story.

Il peut concerner une Observation, une Story, un Article, une Publication ou une Edition.

## Exemples

### Traitement d’une nouvelle Observation

```text
Détection
    ↓
Extraction des Claims
    ↓
Recherche de Story existante
    ↓
Création ou enrichissement
    ↓
Validation éventuelle
```

### Production d’un Article

```text
Sélection des Facts
    ↓
Rédaction
    ↓
Contrôle de fidélité
    ↓
Relecture
    ↓
Validation
```

### Publication

```text
Préparation
    ↓
Planification
    ↓
Diffusion
    ↓
Vérification
    ↓
Mise à jour ou retrait
```

## Responsabilités

Le Workflow permet :

- d’orchestrer les Agents et les actions humaines ;
- de déterminer l’étape suivante ;
- de gérer les validations ;
- de suspendre ou reprendre un traitement ;
- de traiter les erreurs ;
- de conserver l’état d’avancement.

## Règles

Un Workflow doit être observable.

Chaque étape doit produire un résultat ou une Decision.

Un journaliste peut suspendre ou reprendre un Workflow lorsqu’il en a l’autorité.

---

# Decision

## Définition

Une `Decision` représente un choix explicite effectué par un humain, un Agent ou une règle automatisée.

Elle constitue la mémoire des arbitrages du système.

## Exemples

- créer une nouvelle Story ;
- rattacher une Observation à une Story existante ;
- fusionner deux Stories ;
- confirmer un Fact ;
- rejeter un Claim ;
- demander une validation humaine ;
- approuver un Article ;
- publier automatiquement ;
- retirer une Publication ;
- transférer la propriété d’une Story à un journaliste.

## Propriétés métier

Une Decision possède notamment :

- un auteur humain, automatisé ou systémique ;
- un type ;
- une date ;
- un objet concerné ;
- un résultat ;
- une justification ;
- les règles appliquées ;
- les informations utilisées ;
- un niveau de confiance éventuel.

## Règles

Toute décision significative doit être historisée.

Une Decision automatique doit être explicable.

Une nouvelle Decision peut remplacer les effets d’une décision antérieure, mais ne doit jamais l’effacer de l’historique.

---

# Propriété et Human Override

Une Story peut être prise en charge par :

- le système automatisé ;
- un Agent ;
- un journaliste ;
- une équipe éditoriale.

Une seule autorité possède la responsabilité active du sujet à un instant donné.

Lorsqu’un journaliste reprend la main :

- les publications automatiques liées à la Story sont suspendues ;
- les Agents peuvent continuer la collecte et l’analyse ;
- les propositions des Agents deviennent consultatives ;
- les décisions éditoriales reviennent au journaliste.

La reprise de contrôle et sa restitution au système sont enregistrées sous forme de Decisions.

---

# Relations principales

Le modèle ne constitue pas une chaîne strictement linéaire.

Il forme un graphe de connaissances et de contenus.

```text
Source
    │
    └── produit ───────────────► Observation
                                      │
                                      ├── contient ─────────────► Claim
                                      │                              │
                                      │                              ├── soutient ou contredit
                                      │                              ▼
                                      └── fournit ──────────────► Evidence
                                                                     │
                                                                     ▼
                                                                   Fact
                                                                     │
                                      ┌──────────────────────────────┘
                                      ▼
                                    Story
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
                 Article          Decision          Entity
                    │
                    ▼
               Publication
                    │
                    ▼
                 Edition
```

Relations fondamentales :

- une Source produit plusieurs Observations ;
- une Observation appartient à une Source ;
- une Observation peut contenir plusieurs Claims ;
- un Claim provient d’une Observation ;
- une Evidence provient d’une Observation ;
- plusieurs Claims et Evidences peuvent soutenir un Fact ;
- un Fact peut appartenir à plusieurs Stories ;
- une Story regroupe plusieurs Facts ;
- une Story peut produire plusieurs Articles ;
- un Article peut utiliser plusieurs Facts ;
- un Article peut produire plusieurs Publications ;
- une Publication peut apparaître dans plusieurs Editions ;
- une Entity peut être liée à plusieurs Claims, Facts et Stories ;
- une Decision peut concerner n’importe quel objet métier ;
- un Workflow orchestre les actions portant sur ces objets.

---

# Invariants du domaine

Les invariants suivants doivent rester vrais, quelle que soit l’implémentation technique.

1. Toute Observation possède une Source identifiable.
2. Toute connaissance publiée doit être traçable jusqu’à une ou plusieurs Evidences.
3. Un Claim n’est jamais considéré automatiquement comme un Fact.
4. Un Fact ne doit jamais être modifié sans conserver son historique.
5. Une Story existe indépendamment des Articles qu’elle produit.
6. Un Article doit être relié à au moins une Story.
7. Une Publication doit être reliée à une version identifiable d’un Article.
8. Une seule autorité possède la responsabilité active d’une Story à un instant donné.
9. Un journaliste est toujours prioritaire sur une automatisation.
10. Toute décision importante doit être explicable et historisée.
11. Les contenus éditoriaux ne doivent jamais être produits directement à partir d’une Source brute.
12. Les données métier doivent rester indépendantes des modèles d’intelligence artificielle utilisés.

---

# Résumé

Le cœur d’ANDORRE 360 n’est ni l’Article ni le modèle d’intelligence artificielle.

Son cœur est la connaissance traçable construite à partir des Sources.

```text
Les Sources produisent des Observations.

Les Observations contiennent des Claims et des Evidences.

Les Claims et les Evidences permettent d’établir des Facts.

Les Facts décrivent les Stories.

Les Stories produisent des Articles.

Les Articles donnent lieu à des Publications.

Les Publications sont organisées dans des Editions.

Les Agents exécutent les Workflows.

Les Decisions conservent la mémoire de chaque arbitrage.
```