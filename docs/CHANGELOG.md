# Changelog

Toutes les évolutions importantes du projet sont documentées ici.

Le format suit le principe de Keep a Changelog.

---

## [Unreleased]

### Added

-

### Changed

-

### Fixed

-

### Removed

-

---

## [0.1.0] - 2026-07-24

### Added

- Initialisation du projet Next.js
- Configuration Prisma
- Base Tailwind CSS v4
- Installation de shadcn/ui
- Installation de Radix UI
- Installation de Lucide

### Architecture

- Création d'AdminShell
- Création d'AdminHeader
- Création d'AdminSidebar
- Création d'AdminContent
- Création de MobileMenu
- Création d'AdminNavigation

### Changed

- Toutes les pages admin utilisent désormais AdminContent
- Navigation factorisée
- Sidebar simplifiée
- Responsive desktop amélioré

### Fixed

- Suppression des duplications de layout
- Uniformisation de la structure des pages

### Known Issues

- Migration restante de `<img>` vers `next/image`
- Finalisation de l'intégration du menu mobile avec Sheet

## [0.2.0] - 2026-07-24

### Added

- Mise en place complète de l'architecture de l'espace d'administration.
- Création du composant `AdminShell`.
- Création de `AdminHeader`, `AdminSidebar`, `AdminNavigation` et `AdminContent`.
- Intégration de `Sheet` (shadcn/ui) pour la navigation mobile.
- Navigation centralisée dans `admin-navigation.ts`.
- Documentation du projet (`PROJECT_BIBLE.md`, `CHANGELOG.md`).

### Changed

- Refonte de l'architecture Next.js avec les Route Groups.
- Création du groupe `(public)` pour isoler complètement le site public de l'administration.
- Le layout racine (`app/layout.tsx`) est désormais minimal.
- Le `Header` et le `Footer` ont été déplacés dans `app/(public)/layout.tsx`.
- L'administration utilise désormais exclusivement `app/admin/layout.tsx`.

### Fixed

- Suppression de l'affichage du Header/Footer public dans `/admin`.
- Séparation propre entre les layouts public et administration.

### Known issues

- Deux avertissements ESLint restent présents dans :
  - `MediaPicker.tsx`
  - `ArticleMedia.tsx`

  Ces avertissements concernent uniquement l'utilisation de `<img>` à la place de `next/image`.

  - La navigation mobile est implémentée, mais son affichage et son fonctionnement
  n’ont pas encore été validés sur un téléphone réel.

  - Architecture admin : ✅ terminée
- Séparation public/admin : ✅ terminée
- Responsive desktop/tablette : ✅ implémenté
- Responsive téléphone : 🟡 à tester et corriger si nécessaire
- Authentification : ⏳ prochaine phase