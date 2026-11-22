# ANDORRE 360 — Vision, vocabulaire et chaîne éditoriale

[Sommaire](README.md) · Guide du chantier d’automatisation éditoriale, parties 2 à 4.

## 2. La vision finale

À terme, ANDORRE 360 doit pouvoir faire fonctionner une chaîne éditoriale largement automatisée.

L’objectif est qu’une intelligence artificielle puisse :

1. consulter régulièrement les sources configurées ;
2. détecter les nouvelles informations ;
3. éliminer les contenus inutilisables, trop anciens ou suspects ;
4. choisir les informations qui méritent un article ;
5. rédiger un article original et fidèle aux faits ;
6. générer les versions linguistiques nécessaires ;
7. effectuer des contrôles éditoriaux et techniques ;
8. publier les articles autorisés ;
9. proposer puis gérer la composition de la page d’accueil ;
10. conserver un historique complet de ses décisions ;
11. revenir en arrière en cas de problème.

L’automatisation complète reste donc bien la destination du projet.

Cependant, nous ne voulons pas passer directement d’un fonctionnement manuel à une autonomie totale. Le chantier avance par étapes vérifiables. À chaque étape, nous conservons :

- un bouton d’arrêt d’urgence ;
- des règles explicites ;
- des journaux d’audit ;
- des tests ;
- une possibilité de retour arrière ;
- une validation humaine tant que le niveau de fiabilité requis n’est pas atteint.

Ce fonctionnement progressif n’est pas une remise en cause de l’objectif final. C’est la méthode choisie pour y arriver sans perdre le contrôle du système.

---

## 3. Le vocabulaire essentiel

### Source

Une source est un site surveillé par ANDORRE 360 : institution, commune, média, association, club sportif, entreprise, etc.

Chaque source possède notamment :

- une adresse ;
- un mode de collecte ;
- un niveau de confiance ;
- un mode de publication ;
- un intervalle entre deux vérifications ;
- un état indiquant si elle est disponible.

### Collecte

La collecte consiste à visiter une source et à relever les contenus disponibles.

Une collecte ne publie pas automatiquement un article sur le site. Elle crée d’abord des observations.

### Observation

Une observation est une information brute récupérée depuis une source.

Elle contient généralement :

- le titre d’origine ;
- l’adresse de la page d’origine ;
- le texte collecté ;
- la date annoncée par la source ;
- l’identité de la source ;
- son état de traitement.

Une observation n’est pas encore un article ANDORRE 360.

### Brouillon IA

Lorsqu’une observation est traitée, le moteur éditorial peut créer un article rédigé par l’IA.

Cet article peut rester au statut `AI_DRAFT`, c’est-à-dire « brouillon IA ». Il est alors visible dans le Studio, mais pas sur le site public.

### Publication

La publication rend l’article accessible au public.

Elle ne doit pas être confondue avec :

- la collecte d’une source ;
- la création d’une observation ;
- la création d’un brouillon ;
- la mise en avant sur la page d’accueil.

### Composition de la page d’accueil

La composition détermine quels articles occupent les différentes zones de la page d’accueil, par exemple :

- Une principale ;
- grand format ;
- grande carte ;
- cartes éditoriales ;
- brèves ;
- autres zones secondaires.

Un article peut être publié sans être mis en avant. Inversement, une composition ne doit jamais rendre public un brouillon.

### Simulation

Une simulation est une proposition de composition. Elle permet d’examiner le résultat avant de modifier réellement la page d’accueil.

### Run

Un run est l’enregistrement d’une opération automatisée appliquée.

Il permet de savoir :

- quand l’opération a eu lieu ;
- qui l’a déclenchée ;
- quelles publications ont été créées ou désactivées ;
- quelle politique a été utilisée ;
- comment annuler l’opération.

### Retour arrière

Le retour arrière, ou rollback, annule une composition automatisée déjà appliquée et restaure autant que possible l’état précédent.

---

## 4. La chaîne éditoriale, étape par étape

Le fonctionnement général est le suivant :

1. **Collecter** les sources.
2. **Enregistrer** les nouveautés sous forme d’observations.
3. **Filtrer** les observations : date, doublon, qualité, origine et contenu.
4. **Générer** un brouillon d’article depuis une observation retenue.
5. **Contrôler** le brouillon : fidélité, langue, style, dates, chiffres, attribution et image.
6. **Traduire** l’article dans les langues requises.
7. **Publier** seulement si toutes les conditions sont réunies.
8. **Évaluer** les articles publiés pour la page d’accueil.
9. **Simuler** la composition de la page d’accueil.
10. **Appliquer** exactement la proposition examinée.
11. **Auditer** chaque décision.
12. **Revenir en arrière** si nécessaire.

Ces étapes sont séparées volontairement. Une erreur dans la collecte ne doit pas provoquer automatiquement une publication, et une erreur dans la composition ne doit pas modifier le contenu d’un article.

---
