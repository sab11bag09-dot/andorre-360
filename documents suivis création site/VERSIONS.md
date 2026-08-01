# ANDORRE 360 STUDIO

> 📖 **Project Bible**
>
> Ce document constitue la **source de vérité** du projet.
> Toute décision d'architecture, évolution majeure ou changement de direction doit être documenté ici.

---

# Informations du projet

| Élément | Valeur |
|----------|--------|
| Nom | Andorre 360 Studio |
| Version | 0.1.0 |
| Statut | 🚧 Développement actif |
| Framework | Next.js 16 |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI |
| ORM | Prisma 7 |
| Base de données | SQLite (Développement) |
| Licence | Privée |

---

# Vision

Andorre 360 Studio est le back-office éditorial du média Andorre 360.

L'objectif est de construire un Studio moderne permettant de gérer :

- les articles
- les médias
- les sources
- le workflow éditorial
- les utilisateurs
- la publication

Le projet privilégie :

- une architecture durable
- une maintenance simple
- une excellente lisibilité du code
- une faible duplication

---

# État actuel

## Santé du projet

- ✅ Architecture stable
- ✅ Shell d'administration en place
- ✅ Navigation factorisée
- ✅ shadcn/ui installé
- ✅ 0 erreur ESLint
- ⚠️ 2 warnings connus (`<img>` → `next/image`)

---

# Stack technique

## Frontend

- Next.js 16.x
- React 19
- TypeScript

## Styling

- Tailwind CSS v4

## UI

- shadcn/ui
- Radix UI
- Lucide React

## Backend

- Prisma 7
- SQLite

Prévu :

- PostgreSQL

---

# Architecture

```
app/admin/layout.tsx
        │
        ▼
AdminShell
│
├── AdminHeader
├── AdminSidebar
├── AdminContent
├── MobileMenu
└── AdminNavigation
```

Le layout est entièrement centralisé.

Les pages admin ne gèrent plus leur propre structure.

---

# Décisions d'architecture

## ADR-001

Le layout est centralisé dans `AdminShell`.

Objectif :

- supprimer les duplications
- uniformiser toutes les pages

---

## ADR-002

La navigation est définie une seule fois.

```
admin-navigation.ts
```

Toutes les interfaces utilisent cette source.

---

## ADR-003

La bibliothèque UI officielle est :

- shadcn/ui
- Radix UI

Les composants interactifs personnalisés sont évités lorsque shadcn fournit déjà une solution robuste.

---

# État des fonctionnalités

| Fonctionnalité | État |
|---------------|------|
| Architecture | 🟢 |
| Admin Shell | 🟢 |
| Navigation | 🟢 |
| Responsive | 🟡 |
| Authentification | ⚪ |
| Gestion des rôles | ⚪ |
| Workflow éditorial | ⚪ |
| Dashboard | 🟡 |
| Médias | 🟡 |
| Documentation | 🟢 |

---

# Roadmap

## Phase 1 — Fondations ✅

- [x] Structure du projet
- [x] Admin Shell
- [x] Navigation
- [x] Responsive desktop
- [x] shadcn/ui
- [x] Base UI

---

## Phase 2 — Sécurité

- [ ] Auth.js
- [ ] Login
- [ ] Sessions
- [ ] Middleware
- [ ] Gestion des rôles

---

## Phase 3 — Production éditoriale

- [ ] CRUD Articles
- [ ] TipTap
- [ ] SEO
- [ ] Upload médias
- [ ] Gestion des sources

---

## Phase 4 — Workflow

- [ ] Brouillon
- [ ] Relecture
- [ ] Validation
- [ ] Publication

---

## Phase 5 — Dashboard

- [ ] Statistiques
- [ ] Activité
- [ ] Performances

---

# Dette technique

## Connue

Migration :

```
<img>

↓

next/image
```

Aucune autre dette technique importante.

---

# Conventions

Toujours privilégier :

- une responsabilité par composant
- aucune duplication
- composants courts
- TypeScript strict
- lint propre
- architecture avant fonctionnalité
- composants shadcn pour l'UI

---

# Journal

## Version 0.1.0

### Réalisé

- Initialisation du projet
- Prisma
- Tailwind CSS v4
- Lucide React
- shadcn/ui
- Architecture Admin
- AdminShell
- AdminHeader
- AdminSidebar
- AdminContent
- AdminNavigation
- MobileMenu
- Responsive desktop
- Début du responsive mobile

### État

```
ESLint

0 erreur

2 warnings connus
```

### Prochaine étape

- Finaliser le menu mobile (`Sheet`)
- Mettre en place Auth.js
- Développer la gestion des rôles
- Implémenter le workflow éditorial