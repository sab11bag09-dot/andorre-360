# Architecture

## Principes

ANDORRE 360 est conçu comme un **Information Operating System**.

Son architecture repose sur une succession de moteurs spécialisés, chacun responsable d'une étape précise du traitement de l'information.

Chaque moteur possède une responsabilité unique, communique avec les autres au travers du modèle métier et peut évoluer indépendamment.

Cette séparation garantit la maintenabilité, la traçabilité et l'évolutivité du système.

---

# Vue d'ensemble

```
                    Sources
                       │
                       ▼
                Source Engine
                       │
                       ▼
               Collection Engine
                       │
                       ▼
              Knowledge Engine
                       │
                       ▼
                 AI Engine
                       │
                       ▼
             Editorial Engine
                       │
                       ▼
            Publishing Engine
                       │
                       ▼
     Site • Réseaux sociaux • API
```

Chaque moteur enrichit la connaissance sans modifier les responsabilités des autres.

---

# Source Engine

## Mission

Gérer les sources d'information.

## Responsabilités

- enregistrer les sources ;
- vérifier leur disponibilité ;
- planifier leur collecte ;
- gérer leur configuration.

---

# Collection Engine

## Mission

Transformer les sources en observations exploitables.

## Responsabilités

- collecter les contenus ;
- extraire les informations utiles ;
- détecter les nouveautés ;
- éviter les doublons ;
- conserver l'historique des observations.

Les observations restent fidèles aux documents d'origine.

Aucune interprétation n'est réalisée à ce stade.

---

# Knowledge Engine

## Mission

Construire la connaissance du système.

C'est le cœur d'ANDORRE 360.

Il transforme les observations en événements, faits et relations.

## Responsabilités

- créer ou mettre à jour les Stories ;
- extraire les Facts ;
- rapprocher plusieurs sources ;
- détecter les évolutions ;
- calculer le niveau de confiance ;
- maintenir l'historique des connaissances.

Le Knowledge Engine représente la mémoire du système.

---

# AI Engine

## Mission

Produire des contenus éditoriaux.

Les agents IA travaillent exclusivement à partir des connaissances construites par le système.

Ils ne produisent jamais directement un article à partir d'une source brute.

## Responsabilités

- rédaction ;
- résumé ;
- traduction éditoriale ;
- optimisation SEO ;
- préparation des publications sociales.

Les modèles d'IA sont interchangeables.

---

# Editorial Engine

## Mission

Appliquer les règles éditoriales.

## Responsabilités

- déterminer la priorité d'un sujet ;
- choisir la catégorie ;
- préparer les éditions ;
- appliquer les règles de publication ;
- arbitrer entre automatisation et validation humaine.

---

# Publishing Engine

## Mission

Diffuser les contenus.

## Responsabilités

- publier sur le site ;
- publier sur les réseaux sociaux ;
- alimenter les newsletters ;
- exposer les contenus via API ;
- maintenir les publications synchronisées.

Chaque canal est indépendant.

L'ajout d'un nouveau canal ne modifie pas les autres moteurs.

---

# Human Override

À tout moment, un journaliste peut reprendre la main sur une Story.

Le système suspend immédiatement les automatisations liées à cette Story tout en poursuivant la collecte et la veille.

Les propositions de l'IA deviennent consultatives.

Le journaliste reste prioritaire.

---

# Traçabilité

Chaque décision laisse une trace.

```
Source
      │
Observation
      │
Fact
      │
Story
      │
Article
      │
Publication
      │
Historique
```

Chaque contenu publié peut être relié à son origine.

Aucune information n'est perdue.

---

# Principes d'architecture

L'architecture repose sur quelques règles simples.

- Chaque moteur possède une responsabilité unique.
- Les moteurs communiquent au travers du modèle métier.
- Les données sont indépendantes des modèles d'IA.
- Les contenus sont produits à partir des connaissances.
- Toute décision est explicable.
- Toute évolution est traçable.
- Les journalistes restent prioritaires sur les agents IA.
----------------------
## Collecte des contenus

Le moteur de collecte fonctionne en deux étapes :

1. découverte des articles (RSS ou HTML) ;
2. extraction du contenu complet.

Chaque observation conserve désormais :

- le titre ;
- l'URL ;
- la date de publication ;
- le contenu intégral de l'article lorsqu'il est disponible.

L'extraction HTML repose sur des règles spécifiques à chaque domaine avec des sélecteurs génériques en secours.
-------------------------
Collecte HTML

Le moteur de collecte HTML repose sur un principe simple : le moteur est générique, les spécificités sont déclaratives.

Le collecteur ne contient aucune logique propre à un média. Toutes les différences de structure entre les sites sont décrites dans une configuration dédiée.

L'architecture s'articule autour de deux composants :

HtmlCollector, responsable de télécharger les pages, de découvrir les articles et d'extraire leur contenu ;
siteRules, qui centralise les règles d'extraction propres à chaque domaine.

Chaque règle peut définir :

les sélecteurs de découverte des articles (listing) ;
les sélecteurs du contenu principal (content) ;
les éléments à supprimer avant l'extraction (remove).

Lorsqu'une règle est disponible pour un domaine, elle est utilisée en priorité. Dans le cas contraire, le collecteur applique des sélecteurs génériques afin de conserver un fonctionnement minimal.

Cette approche permet d'intégrer de nouveaux médias sans modifier le moteur de collecte.

Intégration d'un média

L'intégration d'une nouvelle source suit toujours la même méthode.

Identifier les liens vers les articles.
Identifier le conteneur contenant le contenu rédactionnel.
Identifier les éléments parasites (publicités, recommandations, widgets, partage, etc.).
Ajouter une règle dans siteRules.
Vérifier l'extraction sur plusieurs articles représentatifs.

Dans la plupart des cas, l'ajout d'un nouveau média consiste uniquement à enrichir la configuration, sans modifier le code du collecteur.

Principes

Cette architecture respecte plusieurs principes fondamentaux :

un collecteur unique pour tous les médias ;
une configuration spécifique par domaine ;
aucune logique métier propre à un site dans le moteur ;
une maintenance simplifiée lors des évolutions des sites ;
la possibilité d'ajouter rapidement de nouvelles sources sans impacter le reste du système.