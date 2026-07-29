docs/02-architecture.md

L'objectif est de répondre à une seule question :

Comment une information devient-elle un article publié ?

Je ne parlerais pas de Next.js, Prisma ou OpenAI. Je parlerais uniquement des composants du système.

Par exemple :

# Architecture

## Vue d'ensemble

Le système est composé de plusieurs moteurs indépendants.

Chaque moteur possède une responsabilité unique.

```
                    Sources
                       │
                       ▼
               Source Engine
                       │
                       ▼
               Watch Engine
                       │
                       ▼
               Story Engine
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
    Site • Facebook • WhatsApp • API
```

---

# Source Engine

Responsabilité :

Gérer les sources d'information.

Fonctions :

- enregistrer les sources
- surveiller leur disponibilité
- planifier les analyses

---

# Watch Engine

Responsabilité :

Détecter les nouveautés.

Fonctions :

- télécharger les contenus
- comparer avec les versions précédentes
- détecter les changements
- éviter les doublons

---

# Story Engine

Responsabilité :

Créer ou mettre à jour une Story.

Fonctions :

- créer une Story
- fusionner deux Stories
- enrichir une Story existante
- calculer le niveau de confiance

---

# AI Engine

Responsabilité :

Transformer une Story en contenu éditorial.

Fonctions :

- rédaction
- résumé
- SEO
- réseaux sociaux
- traduction

---

# Editorial Engine

Responsabilité :

Décider.

Fonctions :

- choisir la catégorie
- choisir la priorité
- construire l'édition
- appliquer les règles éditoriales

---

# Publishing Engine

Responsabilité :

Publier.

Fonctions :

- Site
- Facebook
- WhatsApp
- Newsletter
- API

---

# Human Override

À tout moment :

Le journaliste peut reprendre la main.

Le système suspend alors toute publication automatique sur le sujet concerné.

---

# Traçabilité

Chaque étape laisse une trace.

Source

↓

Story

↓

Facts

↓

Article

↓

Publication

↓

Historique

Aucune décision n'est perdue.
Ensuite, on changera complètement de manière de développer

Jusqu'à aujourd'hui, on raisonnait souvent en termes de pages ou de fonctionnalités.

À partir de maintenant, je te proposerais qu'on raisonne en termes de moteurs :

Source Engine
Watch Engine
Story Engine
AI Engine
Editorial Engine
Publishing Engine

Chaque nouveau développement appartiendra à l'un de ces moteurs.

Cette approche a un gros avantage : dans un an, si tu ajoutes un nouveau canal (par exemple Telegram ou une application mobile), tu ne touches pas au moteur de veille ou au moteur Story. Tu ajoutes simplement un nouveau composant de publication. C'est ce type de découpage qui permet à une plateforme de grandir sans devenir difficile à maintenir.