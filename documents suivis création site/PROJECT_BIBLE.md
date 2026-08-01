# ANDORRE 360 STUDIO
# PROJECT BIBLE

> ⚠️ **Ce document est la source de vérité du projet.**
>
> Toute décision d'architecture importante doit être documentée ici.
> Toute nouvelle session de développement commence par la lecture de ce document et se termine par sa mise à jour.

---

# ÉTAT DU PROJET

**Version :** 0.1

**Statut :**
En développement actif.

**Santé du projet :**

- ✅ Architecture saine
- ✅ 0 erreur ESLint
- ⚠️ 2 warnings connus (`<img>` → `next/image`)
- ✅ Refactorisation majeure du Shell terminée

---

# OBJECTIF

Andorre 360 Studio est le back-office éditorial du média Andorre 360.

Ce n'est pas un CMS générique.

Le Studio doit permettre :

- rédaction
- édition
- workflow éditorial
- gestion des médias
- gestion des sources
- publication
- administration

Objectifs principaux :

- architecture durable
- maintenance simple
- faible duplication
- composants réutilisables
- UI moderne

---

# STACK

## Frontend

- Next.js 16.x
- React 19
- TypeScript

## Backend

- Prisma 7
- SQLite (développement)

Prévu :

- PostgreSQL

## UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React

---

# PRINCIPES D'ARCHITECTURE

Toujours respecter :

- une responsabilité par composant
- pas de duplication
- architecture avant fonctionnalité
- composants courts
- logique métier séparée du layout
- TypeScript strict
- lint propre
- composants UI issus de shadcn lorsque possible

---

# ARCHITECTURE

```
app/

admin/
layout.tsx

↓

AdminShell

├── AdminHeader
├── AdminSidebar
├── AdminContent
├── Sheet (mobile)
└── AdminNavigation
```

Les pages n'ont plus de layout propre.

Toute la structure passe par AdminShell.

---

# ORGANISATION

```
app/
components/
lib/
prisma/
public/
docs/
```

Administration :

```
components/admin/layout/

AdminShell
AdminHeader
AdminSidebar
AdminNavigation
AdminContent
MobileMenu
```

---

# ADMINISTRATION

## AdminShell

Responsable :

- layout
- responsive
- sidebar
- menu mobile

Ne contient aucune logique métier.

---

## AdminHeader

Responsable :

- logo
- menu mobile
- création d'article

---

## AdminSidebar

Desktop uniquement.

Affiche uniquement :

```
AdminNavigation
```

---

## AdminNavigation

Source unique de navigation.

Toutes les pages utilisent :

```
admin-navigation.ts
```

Aucune duplication autorisée.

---

## AdminContent

Conteneur unique des pages admin.

Toutes les pages utilisent ce composant.

---

## Mobile

Le menu mobile repose sur :

```
Sheet
```

(shadcn / Radix)

Objectif :

une seule navigation pour desktop et mobile.

---

# NAVIGATION

Une seule source :

```
admin-navigation.ts
```

Chaque entrée possède :

- label
- href
- icon

Tout nouveau lien doit être ajouté ici.

---

# UI

La bibliothèque officielle est :

shadcn/ui

Utiliser en priorité :

- Sheet
- Dialog
- Dropdown
- Tabs
- Tooltip
- Select
- Popover
- Alert Dialog

Éviter les composants complexes développés à la main.

---

# ÉTAT ACTUEL

Administration :

✔ Dashboard

✔ Articles

✔ Sources

✔ Média

✔ Editorial

✔ Diffusion

Toutes utilisent :

```
AdminContent
```

Navigation factorisée.

Sidebar simplifiée.

Responsive en cours de finalisation.

---

# QUALITÉ

ESLint

```
0 erreur
```

Warnings connus

```
MediaPicker.tsx
ArticleMedia.tsx
```

Cause

```
<img>
```

Migration prévue

```
next/image
```

---

# DÉCISIONS D'ARCHITECTURE

## ADR-001

Le layout est centralisé.

Pourquoi ?

Éviter la duplication.

---

## ADR-002

Navigation unique.

Pourquoi ?

Une seule source de vérité.

---

## ADR-003

shadcn est la bibliothèque UI officielle.

Pourquoi ?

Maintenance.

Accessibilité.

Composants éprouvés.

---

## ADR-004

Sidebar desktop.

Sheet mobile.

Navigation commune.

---

# ROADMAP

## Priorité 1

Authentification.

- Auth.js
- Login
- Middleware

---

## Priorité 2

Gestion des rôles.

```
ADMIN

EDITOR

WRITER
```

---

## Priorité 3

Workflow éditorial.

```
Draft

↓

Review

↓

Validated

↓

Published
```

---

## Priorité 4

TipTap.

Autosave.

SEO.

Historique.

---

## Priorité 5

Dashboard avancé.

Statistiques.

Activité.

Publications.

---

# DETTE TECHNIQUE

Actuellement :

```
<img>

↓

next/image
```

Aucune autre dette importante.

---

# CONVENTIONS

Toujours :

- composants simples
- responsabilité unique
- pas de duplication
- Tailwind uniquement
- shadcn pour les composants interactifs
- lint propre avant commit

---

# JOURNAL

## Session 2026-07

### Réalisé

- Refactorisation du Shell
- Création d'AdminContent
- Création d'AdminNavigation
- Sidebar simplifiée
- Navigation factorisée
- MobileMenu
- Responsive desktop
- shadcn installé
- Radix installé
- Sheet installé

### État

ESLint

```
0 erreur

2 warnings connus
```

### Prochaine étape

Finaliser l'intégration du Sheet dans AdminShell.

Puis :

- Auth.js
- rôles
- workflow
- éditeur
- dashboard

---

# REPRISE D'UNE NOUVELLE SESSION

Avant de développer :

1. Lire ce document.

2. Vérifier :

```
npm run lint
```

3. Vérifier le fonctionnement du Shell.

4. Continuer uniquement la prochaine priorité.

Ne jamais contourner l'architecture existante.

Refactoriser avant d'ajouter une fonctionnalité.

---

# PHILOSOPHIE

Le Studio doit rester compréhensible plusieurs années après sa création.

Une architecture simple vaut mieux qu'une architecture "intelligente".

Le coût de maintenance est un critère de conception.

Chaque fonctionnalité doit pouvoir être remplacée sans remettre en cause le reste du projet.

Le code doit être lisible avant d'être ingénieux.

## Journal de développement

### 2026-07-24

#### Administration

- Architecture complète de l'administration mise en place.
- Création d'un shell d'administration réutilisable.
- Sidebar responsive avec Sheet (shadcn/ui).
- Navigation centralisée.

#### Architecture

Adoption des Route Groups de Next.js :

app/
├── layout.tsx
├── admin/
│   ├── layout.tsx
│   └── page.tsx
└── (public)/
    ├── layout.tsx
    ├── page.tsx
    └── ...

Cette séparation permet :

- une indépendance complète entre le site public et l'administration ;
- des layouts distincts ;
- une intégration future d'Auth.js sans impacter le site public.

#### État du projet

- Architecture : ✅ terminée
- Interface d'administration : ✅ terminée
- - Responsive desktop : ✅ fonctionnel
- Navigation mobile : 🟡 implémentée, mais non validée sur téléphone réel
- Tests mobile : ⏳ à effectuer
- Documentation : ✅ à jour
- Authentification : ⏳ prochaine étape