# Roadmap

> L'évolution du produit ANDORRE 360.

Ce document décrit les grandes étapes de développement du produit.

Il ne détaille ni les sprints, ni les tâches techniques, ni l'état d'avancement du développement.

Chaque version représente une capacité métier supplémentaire apportée au système.

---

# Vision

ANDORRE 360 a pour ambition de devenir un système éditorial capable de :

collecter ;
comprendre ;
vérifier ;
organiser ;
rédiger ;
publier ;
mettre à jour ;
archiver

des informations en continu, avec une collaboration fluide entre journalistes et agents d'intelligence artificielle.

Chaque étape de cette roadmap rapproche progressivement le produit de cette vision.

---

# Version 1 — Le CMS éditorial

## Objectif

Construire le socle de gestion des contenus.

Le système permet à une rédaction de produire et publier des articles manuellement.

## Capacités

- administration ;
- authentification ;
- gestion des utilisateurs ;
- articles ;
- catégories ;
- médias ;
- publication ;
- administration du site.

Le produit fonctionne comme un CMS moderne.

---

# Version 2 — Le moteur de collecte

## Objectif

Surveiller automatiquement les Sources.

Le système ne dépend plus uniquement des journalistes pour découvrir les nouvelles informations.

## Capacités

- catalogue de Sources ;
- collecte périodique ;
- surveillance continue ;
- détection des nouveautés ;
- stockage des Observations ;
- suivi de disponibilité des Sources.

Le système sait désormais ce qui change.

---

# Version 3 — Le moteur de connaissance

## Objectif

Comprendre les informations collectées.

Le système organise les Observations en connaissances structurées.

## Capacités

- extraction des Claims ;
- création des Facts ;
- détection des doublons ;
- rapprochement des Stories ;
- gestion des contradictions ;
- suivi de l'évolution des événements ;
- traçabilité complète.

Le système sait désormais de quoi parlent les informations.

---

# Version 4 — Le journaliste IA

## Objectif

Produire un premier brouillon journalistique.

Les agents IA assistent la rédaction sans remplacer le journaliste.

## Capacités

- rédaction automatique ;
- résumés ;
- titres ;
- chapôs ;
- SEO ;
- traduction ;
- génération de contenus sociaux ;
- signalement des informations manquantes.

Chaque brouillon reste entièrement traçable.

---

# Version 5 — La rédaction assistée

## Objectif

Transformer l'IA en assistant éditorial complet.

Les journalistes collaborent avec plusieurs agents spécialisés.

## Capacités

- contrôle qualité ;
- vérification des Facts ;
- amélioration du style ;
- recommandations éditoriales ;
- hiérarchisation des sujets ;
- aide à la décision.

Le journaliste conserve toujours la responsabilité éditoriale.

---

# Version 6 — La publication autonome

## Objectif

Automatiser la publication des contenus à faible risque.

Le système applique les règles éditoriales avant toute diffusion.

## Capacités

- validation automatique selon les règles ;
- planification ;
- publication multi-canaux ;
- mises à jour automatiques ;
- corrections ;
- archivage.

Les sujets sensibles restent soumis à une validation humaine.

---

# Version 7 — Le média multilingue

## Objectif

Produire une information de qualité dans plusieurs langues.

Le système comprend les Sources dans leur langue d'origine puis rédige dans la langue de publication.

## Capacités

- compréhension multilingue ;
- rédaction en plusieurs langues ;
- traduction des citations ;
- terminologie éditoriale ;
- adaptation culturelle ;
- publication internationale.

La langue de collecte devient indépendante de la langue de publication.

---

# Version 8 — L'Information Operating System

## Objectif

Faire d'ANDORRE 360 un système éditorial autonome capable d'assister une rédaction en continu.

Le système devient une plateforme de gestion de l'information plutôt qu'un simple CMS.

## Capacités

- veille permanente ;
- compréhension des événements ;
- suivi des Stories ;
- rédaction continue ;
- mises à jour automatiques ;
- orchestration des agents IA ;
- collaboration humain / IA ;
- publication continue ;
- traçabilité complète.

Le produit devient un véritable système d'exploitation de l'information.

---

# Principes d'évolution

Quel que soit le niveau atteint, plusieurs principes restent constants.

- Le journaliste conserve la priorité.
- Les Sources restent traçables.
- Les décisions restent explicables.
- Les modèles d'IA sont remplaçables.
- Les règles éditoriales priment sur les recommandations des agents.
- Les Stories constituent le cœur du système.
- Les Articles ne sont qu'une représentation éditoriale des connaissances.

---

# Vision finale

À terme, ANDORRE 360 devra être capable de transformer automatiquement un flux continu d'informations en un journal vivant.

Le système devra pouvoir :

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

sans perdre la provenance des informations, tout en permettant à un journaliste de reprendre instantanément le contrôle lorsque le contexte l'exige.

L'objectif n'est pas de remplacer la rédaction.

L'objectif est de permettre à une rédaction de fonctionner en continu grâce à une collaboration intelligente entre humains et agents spécialisés.
------------------------
## Pipeline de collecte

### ✅ Terminé

- Collecte RSS
- Collecte HTML Altaveu
- Mise à jour des observations existantes
- Création de brouillons à partir des observations
- Compatibilité avec l'éditeur à blocs

### 🚧 À venir

- Collecte HTML Diari d'Andorra
- Collecte HTML Bondia
- Collecte HTML RTVA
- Collecte HTML Andorra Difusió
- Collecte HTML El Periòdic
- Règles d'extraction par domaine