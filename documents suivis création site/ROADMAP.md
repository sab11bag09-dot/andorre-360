# ROADMAP

## Phase 1 — Fondations ✅

### Architecture

- [x] Initialisation Next.js
- [x] Prisma
- [x] Structure du projet
- [x] Admin Shell
- [x] Navigation centralisée
- [x] Responsive
- [x] shadcn/ui
- [x] Base UI

---

## Phase 2 — Sécurité 🔄

### Authentification

- [x] Auth.js
- [x] Connexion
- [x] Déconnexion
- [ ] Middleware
- [x] Protection des routes

### Utilisateurs

- [ ] Gestion des comptes
- [ ] Profils
- [ ] Changement de mot de passe

### Rôles

- [x] ADMIN
- [ ] EDITOR
- [ ] WRITER

---

## Phase 3 — Production éditoriale

### Articles

- [ ] CRUD complet
- [ ] Brouillons
- [ ] Prévisualisation
- [ ] Publication

### Éditeur

- [ ] TipTap
- [ ] Auto-save
- [ ] Compteur de mots
- [ ] SEO
- [ ] Slug automatique

### Médias

- [ ] Upload
- [ ] Bibliothèque
- [ ] Images
- [ ] Documents
- [ ] Métadonnées

### Sources

- [ ] Gestion des sources
- [ ] Référencement
- [ ] Citations

---

## Phase 4 — Workflow

- [ ] Brouillon
- [ ] En attente
- [ ] Relecture
- [ ] Validation
- [ ] Publication

Notifications

- [ ] Affectation
- [ ] Validation
- [ ] Refus

---

## Phase 5 — Dashboard

- [ ] Statistiques
- [ ] Activité
- [ ] Articles récents
- [ ] Brouillons
- [ ] Performances

---

## Phase 6 — Administration

- [ ] Paramètres
- [ ] Catégories
- [ ] Tags
- [ ] Menus
- [ ] Configuration

---

## Phase 7 — Optimisation

- [ ] next/image
- [ ] Performance
- [ ] Accessibilité
- [ ] Tests
- [ ] Documentation

ANDORRE 360
Vision v1
Mission

Créer la première plateforme de presse capable de fonctionner de manière autonome grâce à l'IA, tout en permettant à un journaliste de reprendre instantanément le contrôle éditorial.

L'objectif n'est pas de remplacer le journaliste.

L'objectif est que le journal continue d'informer même lorsqu'aucun journaliste n'est présent.

Les principes
1. Le journal ne dort jamais

Le système surveille en permanence les sources autorisées.

Il détecte les nouveautés.

Il produit les contenus.

Il met à jour le journal.

24h/24.

2. L'humain garde toujours la priorité

Lorsqu'un journaliste décide de traiter un sujet :

l'IA cesse toute publication sur ce sujet ;
elle continue la veille ;
elle fournit uniquement des informations complémentaires.

Le journaliste devient prioritaire.

3. Chaque information possède un cycle de vie

Aujourd'hui :

Article

Demain :

Source

↓

Story

↓

Article

↓

Publication

↓

Archive

Une Story est une information vivante.

Elle peut évoluer pendant plusieurs jours.

Les objets du système
Source

Un fournisseur d'informations.

Exemples :

Gouvernement d'Andorre
Police
MeteoCat
FC Andorra
RSS
API
Site web
PDF
Facebook
Story

Nouvelle information détectée.

Exemple :

Le Gouvernement annonce
une nouvelle aide énergétique.

Une Story n'est pas un article.

C'est un fait.

Article

Version journalistique d'une Story.

Peut être :

automatique
humaine
mixte
Publication

Placement de l'article.

Exemple :

Hero
Feature
Brève
Économie
Sport
Facebook
WhatsApp
Les agents IA

Je ne construirais pas un seul agent.

Je construirais une équipe.

Agent Veille

Surveille les sources.

Agent Détection

Trouve les nouveautés.

Agent Vérification

Vérifie :

source
date
cohérence
doublons
Agent Rédaction

Produit l'article.

Agent SEO

Titre

Slug

Meta

Tags

Agent Réseaux sociaux

Produit les publications.

Agent Mise en page

Choisit où placer les articles.

Agent Qualité

Contrôle :

orthographe
style
charte éditoriale
citations
longueur
hallucinations potentielles
Les modes
Mode AUTO

Le système :

détecte
écrit
publie

sans intervention.

Mode ASSISTÉ

Le système :

détecte
écrit

mais attend la validation.

Mode MANUEL

Le journaliste contrôle tout.

L'IA devient uniquement un assistant.

Les objectifs à 12 mois

Je viserais quelque chose comme :

500 sources surveillées
10 000 Stories détectées par jour
200 articles générés
100 publications automatiques
moins de 5 minutes entre la publication d'une information officielle et sa présence sur ANDORRE 360
La vraie différence avec un CMS

Un CMS classique répond à cette question :

"Comment publier un article ?"

ANDORRE 360 répondrait à une autre :

"Comment faire vivre un média en continu, avec une rédaction hybride composée d'humains et d'agents IA ?"

Je pense que c'est cette phrase qui doit guider toutes les décisions techniques. Si une fonctionnalité ne contribue pas à cette vision, elle est probablement secondaire.

Et je te dirais même qu'à partir de maintenant, chaque nouvelle table de la base de données, chaque service et chaque écran devrait pouvoir se rattacher à l'une des briques de cette architecture. C'est ce qui permettra au projet de rester cohérent à mesure qu'il grandira.

Je pense qu'on est arrivé à un point où il faut arrêter de penser "application" et commencer à penser produit.

Si ANDORRE 360 réussit, ce ne sera pas parce qu'il aura un meilleur éditeur de texte que WordPress.

Ce sera parce qu'il fera une chose que les autres ne font pas :

Transformer un flux continu d'informations en un journal vivant, sans intervention humaine permanente.

Je vois même un slogan interne pour guider le développement :

"Toute information pertinente doit pouvoir devenir un article, puis une publication, sans intervention humaine."

Ensuite, on définit les exceptions (enquête, faits divers, sujets sensibles, etc.) où l'humain reprend la main.

Je structurerais le développement en quatre grandes étapes
Phase 1 — Le moteur de veille

Objectif : savoir ce qui change.

gestion des sources ;
surveillance périodique ;
détection des nouveautés ;
stockage des instantanés ;
élimination des doublons.

À ce stade, il n'y a même pas encore d'IA de rédaction.

Phase 2 — Le moteur de compréhension

Objectif : comprendre ce qui s'est passé.

L'IA doit répondre à des questions comme :

De quoi parle cette nouveauté ?
Est-ce vraiment une nouvelle information ?
Est-ce une mise à jour d'une Story existante ?
Quelle est son importance ?
À quelle catégorie appartient-elle ?

C'est ici que naît l'objet Story.

Phase 3 — Le moteur éditorial

Objectif : produire un contenu publiable.

À partir d'une Story :

générer un article ;
choisir une image si disponible ;
produire le SEO ;
générer les publications sociales ;
choisir la place dans le journal ;
publier selon les règles.

C'est là que ton moteur éditorial actuel prend toute sa valeur.

Phase 4 — La rédaction autonome

Objectif : orchestrer l'ensemble.

Le système devient capable de dire :

« Une information officielle importante vient d'être publiée. J'ai vérifié la source, créé une Story, rédigé un article, généré les contenus sociaux, placé l'article en Hero et publié le tout. »

Sans qu'aucun journaliste ne soit connecté.

Ce qui me plaît dans cette vision

Elle est progressive.

Tu peux mettre en production une partie du système très tôt :

d'abord la veille ;
puis les brouillons automatiques ;
ensuite les propositions de publication ;
enfin la publication autonome sur les contenus à faible risque.

Tu n'as pas besoin d'attendre que tout soit parfait.

Le défi principal ne sera pas l'IA

Beaucoup pensent que le plus difficile est de rédiger un article avec un LLM.

À mon avis, ce sera presque la partie la plus simple.

Le vrai défi sera :

détecter correctement les nouveautés ;
éviter les doublons ;
fusionner plusieurs sources parlant du même événement ;
suivre l'évolution d'une Story sur plusieurs jours ;
décider quand une mise à jour mérite un nouvel article plutôt qu'une modification de l'existant ;
garantir la traçabilité de chaque information.

C'est cette intelligence éditoriale qui fera la différence.

Une ambition réaliste

Si, dans un an, un journaliste peut partir une semaine en congé et retrouver un site qui a continué à publier correctement les informations officielles, les résultats sportifs, les alertes et les communiqués, tout en pouvant reprendre instantanément la main pour les sujets de fond, alors ANDORRE 360 aura atteint un niveau que très peu de rédactions possèdent aujourd'hui.

Parfait. Je te propose qu'on fasse ça sérieusement, comme si on lançait une startup.

Je créerais un dossier docs/ à la racine du projet.

docs/
│
├── 00-manifesto.md
├── 01-vision.md
├── 02-architecture.md
├── 03-domain-model.md
├── 04-ai-agents.md
├── 05-editorial-rules.md
├── 06-roadmap.md
└── decisions/

Chaque document aura un rôle précis.

00-manifesto.md

Pourquoi ANDORRE 360 existe.

C'est le document que nous venons d'écrire.

Il ne changera presque jamais.

01-vision.md

Le fonctionnement global.

On y expliquera :

la rédaction autonome ;
le rôle des journalistes ;
le rôle de l'IA ;
les trois modes (AUTO, ASSISTÉ, MANUEL).
02-architecture.md

L'architecture technique.

Exemple :

Sources
        │
        ▼
Crawler
        │
        ▼
Story Engine
        │
        ▼
AI Pipeline
        │
        ▼
Editorial Engine
        │
        ▼
Publishing Engine
        │
        ▼
Website
Facebook
WhatsApp
Newsletter
API
03-domain-model.md

Le cœur du projet.

Toutes les entités.

Source

Story

Article

Publication

Edition

Zone

Author

Media

Agent

Workflow

Event

Et surtout leurs relations.

04-ai-agents.md

Chaque agent IA.

Par exemple :

Watch Agent

Mission :

Trouver les nouveautés.

Entrées :

Sources.

Sorties :

Stories.

Writer Agent

Mission :

Transformer une Story en Article.

Layout Agent

Mission :

Construire automatiquement le journal.

Publisher Agent

Mission :

Publier.

05-editorial-rules.md

Le cerveau.

Par exemple :

Si

Source = Gouvernement

ET

Catégorie = Communiqué

ET

Confiance > 95 %

↓

Publication automatique

Ou

Si

Justice

↓

Validation humaine

Toutes les règles éditoriales seront ici.

06-roadmap.md

La roadmap des deux prochaines années.

Par exemple :

V1

CMS.

✅ déjà fait

V2

Centre éditorial.

✅ déjà fait

V3

Sources.

V4

Story Engine.

V5

Rédaction IA.

V6

Publication autonome.

decisions/

Très important.

Chaque grande décision aura son fichier.

Exemple :

0001-story-first.md

Pourquoi une Story existe avant un Article.

ou

0007-no-direct-publication.md

Pourquoi une IA ne publie jamais directement un sujet sensible.

C'est inspiré des ADR (Architecture Decision Records). Quand, dans un an, on se demandera « Pourquoi avons-nous fait ce choix ? », la réponse sera déjà documentée.

Ce que je te propose

À partir d'aujourd'hui, on change de méthode de travail.

On ne commence plus une fonctionnalité par du code.

On suit ce cycle :

Vision : est-ce que cette fonctionnalité sert le manifeste ?
Architecture : où s'intègre-t-elle ?
Modèle de données : quelles entités sont concernées ?
Décision d'architecture (si nécessaire).
Implémentation.
Tests.
Documentation.

C'est un peu plus lent au début, mais sur un projet qui peut devenir aussi ambitieux qu'ANDORRE 360, c'est ce qui permet de conserver une architecture cohérente pendant des années. Et je pense que cette vision mérite une base solide dès maintenant.