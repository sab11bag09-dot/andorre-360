# Domain Model

> Le modèle métier d'ANDORRE 360.

Ce document décrit les objets fondamentaux du système.

Il ne décrit pas la base de données.

Il décrit le métier.

---

# Principe

Une rédaction ne produit pas des articles.

Elle traite des informations.

Les articles ne sont qu'une représentation d'une information.

Le cœur du système est donc la Story.

---

# Source

Une Source est un fournisseur d'informations surveillé par le système.

Exemples :

- un organisme gouvernemental ;
- une commune ;
- un service de police ;
- un flux RSS ;
- une API ;
- une page Facebook ;
- un site web ;
- un document PDF.

Une Source possède :

- une origine ;
- un type d'organisation ;
- un mode de collecte ;
- un mode de publication ;
- un niveau de confiance ;
- une fréquence de surveillance ;
- des règles d'extraction ;
- un état d'activation ;
- un état de disponibilité technique.

L'état de disponibilité d'une Source peut être :

- `UNKNOWN` : la Source n'a jamais été contrôlée ;
- `AVAILABLE` : le dernier contrôle technique a réussi ;
- `UNAVAILABLE` : le dernier contrôle technique a échoué.

Une Source conserve également :

- la date de son dernier contrôle ;
- la date de son dernier contrôle réussi ;
- la date de sa dernière erreur ;
- le message de sa dernière erreur.

La disponibilité technique ne détermine pas la confiance éditoriale.

Une Source disponible peut rester peu fiable sur le plan éditorial.

Une Source produit des Observations.

Elle ne crée pas directement de Story.

---

# Observation

Une Observation représente une information brute détectée dans une Source.

Elle constitue l’interface entre le Watch Engine et le Story Engine.

Exemples :

- un item RSS ;
- une page web nouvelle ou modifiée ;
- une réponse API ;
- un communiqué PDF ;
- une publication issue d’un réseau social.

Une Observation possède :

- une Source d’origine ;
- un identifiant externe lorsqu’il existe ;
- une URL ;
- un titre brut ;
- un contenu brut ;
- une date de publication externe ;
- une date de détection ;
- une empreinte permettant de détecter les doublons et les modifications ;
- un historique de ses versions.

Une Observation ne constitue pas encore une Story.

Elle représente uniquement ce que le système a détecté.

Le Story Engine analyse ensuite l’Observation afin de :

- créer une nouvelle Story ;
- enrichir une Story existante ;
- ignorer un doublon ;
- signaler une contradiction ;
- demander une validation humaine.

Une Source peut produire plusieurs Observations.

Une Observation peut contribuer à une ou plusieurs Stories.

Chaque rattachement conserve la provenance de l’information et reste traçable.
---

# Story

Une Story représente un événement.

Exemples :

- Nouvelle loi
- Accident
- Match
- Conférence
- Communiqué

Une Story existe avant les articles.

Elle peut vivre plusieurs heures, plusieurs jours ou plusieurs semaines.

Une Story peut être enrichie par plusieurs Sources.

Une Story possède :

- un titre interne
- un statut
- un niveau de confiance
- une priorité
- une catégorie
- plusieurs Facts
- plusieurs Articles

La Story est l'objet central d'ANDORRE 360.

---

# Fact

Un Fact représente une information vérifiable.

Exemples :

- Date
- Heure
- Nom
- Lieu
- Montant
- Citation
- Score
- Température

Une Story est composée de plusieurs Facts.

Les Facts peuvent évoluer.

L'historique des Facts est conservé.

---

# Article

Un Article est une représentation journalistique d'une Story.

Il peut être :

- automatique
- humain
- hybride

Un Article possède :

- un auteur
- un contenu
- un ton
- une langue
- une version

Une Story peut produire plusieurs Articles.

---

# Publication

Une Publication représente la diffusion d'un Article.

Exemples :

- Hero
- Feature
- Brève
- Facebook
- WhatsApp
- Newsletter

Une Publication possède :

- une date
- un canal
- un statut

---

# Edition

Une Edition représente l'état du journal à un instant donné.

Exemple :

Edition du matin

Edition de midi

Edition du soir

Une Edition contient plusieurs Publications.

---

# Agent

Un Agent est une intelligence spécialisée.

Exemples :

Watch Agent

Story Agent

Writer Agent

SEO Agent

Layout Agent

Publisher Agent

Quality Agent

Chaque Agent possède une responsabilité unique.

---

# Workflow

Le Workflow décrit le cycle de vie d'une Story.

Détection

↓

Analyse

↓

Vérification

↓

Rédaction

↓

Validation

↓

Publication

↓

Mises à jour

↓

Archivage

---

# Decision

Une Decision représente une action prise.

Par exemple :

Publication automatique.

Validation humaine.

Fusion de Stories.

Refus.

Toutes les décisions sont historisées.

---

# Relations

```text
Source
    ↓
Observation
    ↓
Story
    ↓
Fact
    ↓
Article
    ↓
Publication
    ↓
Edition