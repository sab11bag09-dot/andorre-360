# ANDORRE 360 — Roadmap

> Plan de construction progressif de la rédaction autonome ANDORRE 360.

---

# Principes de développement

ANDORRE 360 est développé par moteurs indépendants.

Chaque moteur possède une responsabilité unique et communique avec le moteur suivant.

```text
Source Engine
    ↓
Watch Engine
    ↓
Story Engine
    ↓
AI Engine
    ↓
Editorial Engine
    ↓
Publishing Engine
```

Un moteur ne peut jamais accéder directement aux responsabilités d'un moteur situé plus loin dans la chaîne.

Chaque moteur ne dépend que du précédent et prépare le suivant.

---

# Méthodologie

Chaque sprint respecte systématiquement l'ordre suivant :

1. Vision
2. Domaine
3. Architecture
4. Implémentation
5. Tests
6. Documentation
7. Commit

Un sprint n'est terminé que lorsque :

- TypeScript compile sans erreur ;
- ESLint ne contient aucune erreur bloquante ;
- les tests passent ;
- la documentation est à jour ;
- les modifications sont enregistrées dans un commit dédié.

---

# État actuel

## Fondations

Statut : ✅ Terminé

Livrables :

- manifeste ;
- vision produit ;
- architecture par moteurs ;
- modèle de domaine ;
- authentification de l'administration ;
- administration des sources ;
- infrastructure de tests.

---

# Phase 1 — Source Engine

## Objectif

Le Source Engine gère les fournisseurs d'information.

Il est responsable :

- de la configuration des sources ;
- de leur disponibilité ;
- de leur état technique ;
- de leur planification.

Le Source Engine ne télécharge jamais de contenu éditorial.

Cette responsabilité appartient au Watch Engine.

---

## Sprint 1 — Administration des sources

Statut : ✅ Terminé

Livrables :

- modèle `Source` ;
- enums Prisma ;
- CRUD ;
- activation / désactivation ;
- filtres ;
- migration ;
- tests.

---

## Sprint 2 — Disponibilité des sources

Statut : 🔜 À faire

### Objectif

Vérifier qu'une source est techniquement accessible.

### Périmètre

- contrôle HTTP manuel ;
- délai maximal de réponse ;
- dernier contrôle ;
- dernier succès ;
- dernière erreur ;
- affichage de l'état dans l'administration.

### Hors périmètre

- téléchargement RSS ;
- parsing HTML ;
- parsing API ;
- téléchargement PDF ;
- création d'Observation ;
- création de Story ;
- intelligence artificielle.

### Critères de validation

- contrôle individuel d'une source ;
- succès historisé ;
- erreurs historisées ;
- affichage de l'état ;
- tests unitaires.

---

## Sprint 3 — Planification des contrôles

Statut : 🔜 À faire

### Objectif

Déterminer automatiquement quelles sources doivent être contrôlées.

### Périmètre

- fréquence de surveillance ;
- sélection des sources arrivées à échéance ;
- exclusion des sources inactives ;
- exécution planifiée ;
- prévention des contrôles concurrents.

### Critères de validation

- sélection correcte des sources ;
- exécution traçable ;
- fonctionnement sans interface d'administration.

---

# Phase 2 — Watch Engine

## Objectif

Transformer les contenus détectés en Observations.

Le Watch Engine ne crée jamais directement de Story.

---

## Observation

Le Watch Engine consomme les Sources.

Il produit des Observations.

Le modèle métier de l'Observation est défini dans le document `03-domain-model.md`.

Le Story Engine consomme ensuite ces Observations.

---

## Sprint 4 — Observation RSS

### Objectif

Transformer un flux RSS ou Atom en Observations.

### Livrables

- téléchargement ;
- parsing RSS/Atom ;
- extraction des métadonnées ;
- rattachement à la Source ;
- identifiant externe ;
- données brutes conservées.

---

## Sprint 5 — Détection des nouveautés

### Objectif

Identifier les nouveaux contenus et les modifications.

### Livrables

- empreinte ;
- détection des doublons ;
- comparaison ;
- historique des versions.

---

## Sprint 6 — Observation HTML

### Objectif

Créer des Observations à partir de pages HTML.

---

## Sprint 7 — Observation API

### Objectif

Créer des Observations à partir de réponses API.

---

## Sprint 8 — Observation PDF

### Objectif

Créer des Observations à partir de documents PDF.

---

# Phase 3 — Story Engine

## Objectif

Transformer les Observations en événements éditoriaux.

La Story est l'objet central du système.

---

## Sprint 9 — Création d'une Story

Créer une Story lorsqu'aucun événement existant ne correspond.

---

## Sprint 10 — Rattachement

Associer une Observation à une Story existante.

---

## Sprint 11 — Gestion des Facts

Extraire et historiser les informations vérifiables.

Les Facts :

- possèdent une provenance ;
- sont historisés ;
- ne sont jamais écrasés ;
- restent traçables.

---

## Sprint 12 — Confiance

Calcul du niveau de confiance.

Détection des contradictions.

---

## Sprint 13 — Fusion

Fusion de Stories représentant le même événement.

---

# Phase 4 — AI Engine

## Objectif

Transformer les Stories en propositions éditoriales.

L'IA prépare.

Le journaliste décide.

---

## Sprint 14 — Résumé

---

## Sprint 15 — Rédaction

---

## Sprint 16 — Titres et chapôs

---

## Sprint 17 — SEO

---

## Sprint 18 — Réseaux sociaux

---

## Sprint 19 — Traduction

Toutes les productions IA :

- sont rattachées à une Story ;
- sont versionnées ;
- conservent leur contexte ;
- identifient leur Agent ;
- restent modifiables.

---

# Phase 5 — Editorial Engine

## Objectif

Appliquer les décisions éditoriales.

Le journaliste reste toujours prioritaire.

---

## Sprint 20 — Workflow

---

## Sprint 21 — Modes AUTO / ASSISTÉ / MANUEL

---

## Sprint 22 — Priorités

---

## Sprint 23 — Validation humaine

---

## Sprint 24 — Human Override

---

## Sprint 25 — Construction des éditions

---

# Phase 6 — Publishing Engine

## Objectif

Diffuser les contenus validés.

---

## Sprint 26 — Site web

---

## Sprint 27 — Facebook

---

## Sprint 28 — WhatsApp

---

## Sprint 29 — Newsletter

---

## Sprint 30 — API

Chaque publication :

- référence un Article ;
- possède un canal ;
- possède un statut ;
- historise les erreurs ;
- permet une nouvelle tentative.

---

# Phase 7 — Traçabilité

## Objectif

Conserver l'historique complet du fonctionnement du système.

---

## Sprint 31 — Journal des décisions

---

## Sprint 32 — Historique des workflows

---

## Sprint 33 — Supervision des Agents

---

## Sprint 34 — Tableau de bord

Le système doit toujours permettre de répondre :

- qui ?
- quand ?
- pourquoi ?
- sur quelles informations ?
- quel résultat ?
- un journaliste est-il intervenu ?

---

# Phase 8 — Autonomie éditoriale

## Objectif

Faire fonctionner la rédaction en continu sous contrôle humain.

---

## Sprint 35 — Publications automatiques

---

## Sprint 36 — Mise à jour des articles

---

## Sprint 37 — Enrichissement continu des Stories

---

## Sprint 38 — Alertes éditoriales

---

## Sprint 39 — Fonctionnement autonome

---

# Phase 9 — Exploitation

## Objectif

Garantir un fonctionnement durable, fiable et maintenable.

---

## Sprint 40 — Observabilité

- métriques ;
- journaux ;
- supervision.

---

## Sprint 41 — Sauvegardes

- sauvegardes ;
- restauration ;
- reprise après incident.

---

## Sprint 42 — Performances

- optimisation ;
- cache ;
- parallélisation.

---

## Sprint 43 — Sécurité

- audit ;
- permissions ;
- protection des données.

---

# Vision cible

À terme, ANDORRE 360 devra être capable de :

- surveiller un grand nombre de sources ;
- détecter automatiquement les nouveautés ;
- produire des Observations ;
- construire et enrichir des Stories ;
- historiser les Facts ;
- générer plusieurs formes éditoriales ;
- assister les journalistes dans leurs décisions ;
- publier sur plusieurs canaux ;
- conserver l'historique complet des décisions ;
- permettre à un journaliste de reprendre le contrôle à tout moment.

ANDORRE 360 n'est pas un CMS.

C'est un système d'exploitation pour une rédaction autonome assistée par l'intelligence artificielle.