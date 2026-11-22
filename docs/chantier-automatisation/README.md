# ANDORRE 360 — Guide du chantier d’automatisation éditoriale

Le guide d’origine (un seul fichier de 1 468 lignes) a été découpé le
22 novembre 2026 en documents plus courts, sans changement de contenu.

**Dernière mise à jour : 18 novembre 2026**\
**État du projet : chantier de développement local — aucune mise en production**

## 1. À quoi sert ce document ?

Ce document explique, avec des mots simples :

- ce que nous construisons dans ANDORRE 360 ;
- ce qui fonctionne déjà ;
- les essais qui ont été réalisés ;
- les problèmes rencontrés et ce qu’ils nous ont appris ;
- les protections actuellement en place ;
- ce qu’il reste à développer ;
- l’ordre conseillé pour reprendre le travail.

Il est volontairement détaillé afin qu’une personne qui découvre le projet puisse comprendre le fonctionnement général sans connaître tout le code.

Ce guide complète les documents techniques déjà présents dans le dossier `docs/`. Il ne remplace ni les tests automatisés ni l’historique Git.

---

## Sommaire

1. [Vision, vocabulaire et chaîne éditoriale](01-vision-et-vocabulaire.md) — parties 2 à 4
2. [Réalisations, essais et anomalies](02-realisations-et-essais.md) — parties 5 à 11
3. [Feuille de route et sujets mis de côté](03-feuille-de-route.md) — parties 12 à 14
4. [Reprise du chantier, sécurité et confusions à éviter](04-reprise-et-securite.md) — parties 15 à 17
5. [Journal du chantier](05-journal-du-chantier.md) — partie 18

## 19. Résumé en une minute

ANDORRE 360 sait déjà collecter des sources, créer des observations, générer des brouillons, évaluer des candidats pour la page d’accueil, simuler une composition, appliquer exactement la proposition examinée et revenir en arrière.

Les protections fonctionnent : lors de l’essai, l’article 492 a bien été créé comme brouillon et n’a pas été publié.

Le chantier a toutefois révélé deux familles de problèmes :

1. certaines dates collectées sont fausses et placées dans le futur ;
2. la qualité rédactionnelle du brouillon n’est pas encore suffisante pour une publication autonome.

La prochaine étape est donc de corriger les dates futures. Ensuite, il faudra améliorer la génération, construire l’orchestrateur autonome, multiplier les essais supervisés et seulement après automatiser toute la chaîne.

L’objectif final ne change pas : l’IA doit pouvoir prendre en charge toutes les publications. Nous construisons simplement les contrôles nécessaires pour que cette autonomie soit fiable, explicable et réversible.
