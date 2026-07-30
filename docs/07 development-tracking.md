# Development Tracking

> Journal de bord du développement d'ANDORRE 360.

Ce document suit l'avancement du projet.

Contrairement aux documents de référence (Vision, Architecture, Domaine...), celui-ci évolue tout au long du développement.

Il décrit :

- l'état actuel du projet ;
- les fonctionnalités terminées ;
- les travaux en cours ;
- les prochains objectifs ;
- les décisions temporaires ;
- les dettes techniques ;
- les points de vigilance.

---

# Informations générales

**Projet**

ANDORRE 360

**Objectif**

Construire une plateforme éditoriale capable de transformer un flux continu d'informations en un journal vivant grâce à une collaboration entre journalistes et agents d'intelligence artificielle.

**Méthodologie**

Le développement suit systématiquement le cycle :

```text
Vision
    ↓
Domaine
    ↓
Architecture
    ↓
Implémentation
    ↓
Tests
    ↓
Documentation
    ↓
Commit
```

---

# État du projet

## Documentation

✅ Terminée

- Manifesto
- Vision
- Architecture
- Domain Model
- AI Agents
- Editorial Rules
- Roadmap

La documentation constitue désormais la référence du projet.

---

## Architecture

Le pipeline métier est stabilisé.

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
    ↓
Edition
```

Les responsabilités des différents Engines sont définies.

---

## Développement

### Terminé

- socle de l'administration ;
- authentification ;
- gestion des Sources ;
- vérification de disponibilité des Sources ;
- architecture du Source Engine ;
- architecture du Collection Engine ;
- injection de dépendances ;
- contrats des Collectors ;
- orchestration de la collecte ;
- premiers tests unitaires.

### En cours

Sprint 4

Poste de travail du journaliste.

---

# Sprint actuel

## Objectif

Construire l'espace éditorial où les journalistes pourront consulter, modifier, valider et publier les Articles.

## Fonctionnalités prévues

### Liste des articles

- affichage des Articles ;
- recherche ;
- filtres ;
- statuts.

### Fiche article

- édition ;
- métadonnées ;
- Observations liées ;
- historique ;
- statut éditorial.

### États éditoriaux

- DRAFT
- AI_DRAFT
- REVIEW
- APPROVED
- PUBLISHED
- ARCHIVED

Critère de validation :

Un journaliste doit pouvoir ouvrir un brouillon, le modifier, le sauvegarder et connaître précisément son origine.

---

# Architecture actuelle

## Source Engine

Responsable de :

- gestion des Sources ;
- planification ;
- configuration ;
- surveillance.

---

## Collection Engine

Responsable de :

- collecte ;
- création des Observations ;
- détection des nouveautés ;
- conservation du contenu brut.

---

## Knowledge Engine

À venir.

Responsable de :

- Claims ;
- Facts ;
- Stories ;
- rapprochements ;
- contradictions.

---

## Editorial Engine

À venir.

Responsable de :

- rédaction ;
- validation ;
- qualité ;
- publication.

---

# Chantiers à venir

## Priorité 1

Espace éditorial.

- administration des Articles ;
- édition ;
- historique ;
- statut.

---

## Priorité 2

Traçabilité complète.

- relation Observation ↔ Article ;
- plusieurs Sources par Article ;
- justification des Facts.

---

## Priorité 3

Premier Journalist Agent.

Création automatique d'un brouillon :

- titre ;
- chapô ;
- contenu ;
- SEO ;
- avertissements.

Le résultat sera enregistré avec le statut :

AI_DRAFT

---

## Priorité 4

Story Engine.

Création des :

- Claims ;
- Facts ;
- Stories.

---

## Priorité 5

Publication autonome.

Selon les règles définies dans :

Editorial Rules.

---

# Dette technique

Aucune dette majeure identifiée à ce stade.

Les optimisations sont volontairement différées tant que l'architecture métier n'est pas stabilisée.

---

# Conventions

## Architecture

Les fonctionnalités sont organisées autour des Engines.

Le développement ne doit pas être organisé autour des pages de l'interface.

Toute nouvelle fonctionnalité doit appartenir à un Engine clairement identifié.

---

## Tests

Toute nouvelle fonctionnalité importante doit être accompagnée de tests.

L'approche privilégiée est :

Tests
↓

Implémentation

---

## Documentation

La documentation est mise à jour avant le commit final.

Les documents de référence ne sont modifiés que lorsque la vision du produit évolue.

Le suivi quotidien est conservé dans ce document.

---

# Décisions temporaires

À mesure du développement, les décisions provisoires seront consignées ici.

Les décisions devenues permanentes seront transférées dans le dossier :

docs/decisions/

---

# Journal de bord

## Foundation Sprint

Objectif :

Définir les fondations conceptuelles du projet.

Réalisations :

- manifeste ;
- vision ;
- architecture ;
- modèle métier ;
- agents IA ;
- règles éditoriales ;
- roadmap ;
- organisation documentaire.

Résultat :

Le projet dispose désormais d'une architecture métier stable qui servira de référence pour les développements futurs.

---

## Sprint 4

En cours.

Objectif :

Créer le poste de travail du journaliste.

---

# Prochaine étape

La prochaine étape consiste à développer l'interface éditoriale des Articles.

L'intégration du premier Agent IA n'interviendra qu'une fois cet espace stabilisé.

Cette approche garantit que les futurs agents s'intègreront dans une architecture éditoriale existante plutôt que de la contraindre.

---

# Vision à long terme

Le développement doit toujours rester aligné avec le manifeste.

Chaque nouvelle fonctionnalité doit contribuer à répondre à la question centrale :

> Comment transformer un flux continu d'informations en un journal vivant, fiable et traçable, avec une collaboration efficace entre journalistes et agents IA ?

Si une fonctionnalité ne contribue pas à cette vision, elle doit être reconsidérée.
------------------
---

# Session — Pipeline HTML Altaveu validé

## Objectif

Valider le pipeline complet :

Source → Observation → Brouillon d'article

avec récupération du contenu complet des articles.

## Réalisations

### HtmlCollector

Le collecteur HTML extrait désormais correctement le corps des articles Altaveu.

Sélecteur retenu :

```ts
.c-mainarticle__body
```

Les sélecteurs trop génériques (`main`, `main article`) ont été retirés afin d'éviter de récupérer des contenus parasites.

Le collecteur :

- clone le nœud avant nettoyage ;
- supprime les éléments inutiles ;
- normalise le texte extrait ;
- enregistre le contenu complet dans `Observation.content`.

## Repository des observations

Le repository met maintenant à jour les observations existantes au lieu de les ignorer lorsqu'une URL est déjà présente.

La contrainte Prisma reste :

```prisma
@@unique([sourceId, url])
```

Les champs principaux sont mis à jour :

- titre ;
- contenu ;
- date de publication.

Cela permet de compléter automatiquement les anciennes observations qui avaient un contenu vide.

## Création des brouillons

Le cas d'usage `createArticleFromObservation()` transmet correctement :

- le titre ;
- la description ;
- le contenu complet ;
- la catégorie ;
- l'auteur.

Le brouillon créé contient désormais le texte intégral de l'article.

## Validation

Tests effectués avec succès :

- extraction HTML Altaveu ;
- mise à jour des observations ;
- création du brouillon ;
- affichage du contenu dans l'éditeur.

Les longueurs de contenu observées :

- 3345 caractères ;
- 4136 caractères ;
- 4847 caractères ;
- 5818 caractères.

Le pipeline est validé de bout en bout pour Altaveu.

## Diagnostic

Le problème des brouillons vides ne venait pas de l'éditeur ni du repository des articles.

Il provenait d'observations créées avec :

```
contentLength: 0
```

Notamment pour la source **Diari d'Andorra**, dont le collecteur HTML n'est pas encore adapté.

## Travaux restants

Ajouter des règles d'extraction spécifiques pour :

- Diari d'Andorra ;
- Bondia ;
- RTVA ;
- Andorra Difusió ;
- El Periòdic d'Andorra.

## Évolution prévue

Remplacer la liste unique de sélecteurs HTML par des règles par domaine :

- altaveu.com
- diariandorra.ad
- rtva.ad
- etc.

Le collecteur utilisera d'abord les règles spécifiques au site avant de retomber sur les sélecteurs génériques.

## État du projet

✅ Pipeline Observation → Brouillon opérationnel.

Le moteur est maintenant prêt à intégrer progressivement les autres médias.