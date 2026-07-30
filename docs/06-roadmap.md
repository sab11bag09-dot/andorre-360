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
----------------------------------
Passation technique — ANDORRE 360
Objet

Ce document présente l'état actuel du projet, les travaux réalisés, les chantiers restant à mener et les priorités de développement.

Il constitue le document de référence pour toute reprise du projet.

État du projet

Le socle technique d'ANDORRE 360 est désormais en place.

L'architecture générale est définie et les premiers moteurs sont opérationnels.

Les développements réalisés permettent déjà de collecter automatiquement des contenus provenant de plusieurs médias andorrans, de conserver les observations et de préparer leur exploitation par les moteurs de connaissance.

Travaux réalisés
Architecture

✔ Architecture générale définie.

Les moteurs suivants sont identifiés :

Source Engine
Collection Engine
Knowledge Engine
AI Engine
Editorial Engine
Publishing Engine

Les responsabilités de chaque moteur sont documentées.

Source Engine

Réalisé.

Fonctionnalités :

gestion des sources ;
configuration des médias ;
planification de la collecte ;
distinction RSS / HTML.
Collection Engine

Le moteur de collecte est fonctionnel.

Fonctionnalités réalisées
collecte RSS ;
collecte HTML ;
découverte automatique des articles ;
extraction du contenu complet ;
conservation des métadonnées ;
gestion des observations.
Architecture

Le collecteur HTML est désormais générique.

Les spécificités des sites sont externalisées dans un registre de règles (siteRules).

Chaque média peut définir :

les sélecteurs de découverte (listing) ;
les sélecteurs du contenu (content) ;
les éléments à supprimer (remove).

Cette architecture évite de modifier le collecteur lors de l'ajout d'une nouvelle source.

Médias intégrés

À ce jour, les règles d'extraction sont disponibles notamment pour :

Altaveu
Diari d'Andorra
Bondia
RTVA
La Veu Lliure
El Periòdic

Le moteur peut être enrichi par simple ajout de nouvelles règles.

Documentation

La documentation d'architecture est en cours de structuration.

Elle couvre désormais :

la vision du projet ;
l'architecture globale ;
les responsabilités des moteurs ;
l'architecture du moteur de collecte.
Feuille de route
Sprint 1

✔ Terminé

Architecture générale.

Sprint 2

✔ Terminé

Source Engine.

Sprint 3

✔ Terminé

Première version du Collection Engine.

Sprint 4

✔ Fonctionnel

Finalisation du moteur de collecte.

Travaux réalisés :

collecteur HTML générique ;
règles par domaine (siteRules) ;
extraction du contenu complet ;
architecture documentée ;
intégration des principaux médias.

Travaux restant dans ce sprint :

intégrer les derniers médias locaux (configuration uniquement) ;
consolider les tests de collecte.

Ces travaux ne remettent plus en cause l'architecture.

Travaux restant à réaliser
Finaliser la couverture des médias

Médias restant à intégrer :

Ara Andorra
Forum.ad
autres sources locales à évaluer

Il s'agit principalement d'ajouter des règles dans siteRules.

Sources institutionnelles

Débuter l'intégration des sources officielles.

Exemples :

Govern
Consell General
BOPA
Comuns
Protection Civile
COEX
Météo
Stations de ski

Ces sources alimenteront directement les futures rubriques éditoriales.

Knowledge Engine

Prochaine grande étape du projet.

Objectifs :

transformer les observations en connaissances ;
créer les Stories ;
extraire les Facts ;
rapprocher plusieurs sources ;
détecter les évolutions ;
calculer un niveau de confiance.

Ce moteur constituera le cœur d'ANDORRE 360.

AI Engine

À démarrer après la stabilisation du Knowledge Engine.

Les agents IA devront produire les contenus uniquement à partir des connaissances construites par le système, jamais directement à partir des sources.

Editorial Engine

À développer.

Objectifs :

priorisation des sujets ;
classement par rubrique ;
règles éditoriales ;
arbitrage IA / journaliste.
Publishing Engine

À développer.

Objectifs :

publication sur le site ;
réseaux sociaux ;
newsletters ;
API.
Priorités recommandées
Finaliser la documentation technique.
Intégrer les derniers médias locaux.
Ajouter les premières sources institutionnelles.
Concevoir le modèle de données du Knowledge Engine.
Développer le Knowledge Engine avant toute évolution des agents IA.
Conclusion

Le projet a franchi une étape importante.

Le principal risque technique — disposer d'un moteur de collecte générique, extensible et maintenable — est désormais levé.

Les prochains développements ne porteront plus sur la collecte elle-même, mais sur la valorisation de l'information : consolidation des observations, construction des connaissances et production éditoriale.

C'est à partir de cette étape qu'ANDORRE 360 commencera réellement à se distinguer d'un simple agrégateur de contenus pour devenir un Information Operating System.

# Backlog éditorial

## Une
- Définir les critères de mise en avant.
- Développer le système de priorisation des Stories.

---

## Actu
- Finaliser les médias généralistes.
- Intégrer Ara Andorra.
- Intégrer Forum.ad.

---

## Fil info
- Construire le flux temps réel.
- Détection automatique des breaking news.
- Notifications institutionnelles.

---

## Économie
Sources à intégrer :
- Govern (Économie)
- Cambra de Comerç
- Estadística
- CASS (si pertinent)

---

## Société
Sources à intégrer :
- Santé
- Éducation
- Associations
- Justice
- Police

---

## Politique
Sources à intégrer :
- Govern
- Consell General
- BOPA
- Comuns

---

## Immo
Sources à intégrer :
- Estadística
- Registres publics
- Observatoires
- Notaires (si données publiques)

---

## International
- Définir les agences de référence.
- Règles de sélection des sujets.

---

## Sports
Sources à intégrer :
- Fédérations sportives
- Comité Olympique Andorran
- Clubs majeurs

---

## Culture
Sources à intégrer :
- Ministère de la Culture
- Agenda culturel
- Musées
- Festivals

---

## Montagne
Sources à intégrer :
- Météo
- COEX
- Protection Civile
- Risque d'avalanche
- Stations de ski
- Parcs naturels

---

## Lifestyle
Sources à intégrer :
- Tourisme
- Gastronomie
- Événements
- Loisirs