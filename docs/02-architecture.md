# Architecture

## Principes

ANDORRE 360 est conçu comme un **Information Operating System**.

Son architecture repose sur une succession de moteurs spécialisés, chacun responsable d'une étape précise du traitement de l'information.

Chaque moteur possède une responsabilité unique, communique avec les autres au travers du modèle métier et peut évoluer indépendamment.

Cette séparation garantit la maintenabilité, la traçabilité et l'évolutivité du système.

---

# Vue d'ensemble

```
                    Sources
                       │
                       ▼
                Source Engine
                       │
                       ▼
               Collection Engine
                       │
                       ▼
              Knowledge Engine
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
     Site • Réseaux sociaux • API
```

Chaque moteur enrichit la connaissance sans modifier les responsabilités des autres.

---

# Source Engine

## Mission

Gérer les sources d'information.

## Responsabilités

- enregistrer les sources ;
- vérifier leur disponibilité ;
- planifier leur collecte ;
- gérer leur configuration.

---

# Collection Engine

## Mission

Transformer les sources en observations exploitables.

## Responsabilités

- collecter les contenus ;
- extraire les informations utiles ;
- détecter les nouveautés ;
- éviter les doublons ;
- conserver l'historique des observations.

Les observations restent fidèles aux documents d'origine.

Aucune interprétation n'est réalisée à ce stade.

---

# Knowledge Engine

## Mission

Construire la connaissance du système.

C'est le cœur d'ANDORRE 360.

Il transforme les observations en événements, faits et relations.

## Responsabilités

- créer ou mettre à jour les Stories ;
- extraire les Facts ;
- rapprocher plusieurs sources ;
- détecter les évolutions ;
- calculer le niveau de confiance ;
- maintenir l'historique des connaissances.

Le Knowledge Engine représente la mémoire du système.

---

# AI Engine

## Mission

Produire des contenus éditoriaux.

Les agents IA travaillent exclusivement à partir des connaissances construites par le système.

Ils ne produisent jamais directement un article à partir d'une source brute.

## Responsabilités

- rédaction ;
- résumé ;
- traduction éditoriale ;
- optimisation SEO ;
- préparation des publications sociales.

Les modèles d'IA sont interchangeables.

---

# Editorial Engine

## Mission

Appliquer les règles éditoriales.

## Responsabilités

- déterminer la priorité d'un sujet ;
- choisir la catégorie ;
- préparer les éditions ;
- appliquer les règles de publication ;
- arbitrer entre automatisation et validation humaine.

---

# Publishing Engine

## Mission

Diffuser les contenus.

## Responsabilités

- publier sur le site ;
- publier sur les réseaux sociaux ;
- alimenter les newsletters ;
- exposer les contenus via API ;
- maintenir les publications synchronisées.

Chaque canal est indépendant.

L'ajout d'un nouveau canal ne modifie pas les autres moteurs.

---

# Human Override

À tout moment, un journaliste peut reprendre la main sur une Story.

Le système suspend immédiatement les automatisations liées à cette Story tout en poursuivant la collecte et la veille.

Les propositions de l'IA deviennent consultatives.

Le journaliste reste prioritaire.

---

# Traçabilité

Chaque décision laisse une trace.

```
Source
      │
Observation
      │
Fact
      │
Story
      │
Article
      │
Publication
      │
Historique
```

Chaque contenu publié peut être relié à son origine.

Aucune information n'est perdue.

---

# Principes d'architecture

L'architecture repose sur quelques règles simples.

- Chaque moteur possède une responsabilité unique.
- Les moteurs communiquent au travers du modèle métier.
- Les données sont indépendantes des modèles d'IA.
- Les contenus sont produits à partir des connaissances.
- Toute décision est explicable.
- Toute évolution est traçable.
- Les journalistes restent prioritaires sur les agents IA.
----------------------
## Collecte des contenus

Le moteur de collecte fonctionne en deux étapes :

1. découverte des articles (RSS ou HTML) ;
2. extraction du contenu complet.

Chaque observation conserve désormais :

- le titre ;
- l'URL ;
- la date de publication ;
- le contenu intégral de l'article lorsqu'il est disponible.

L'extraction HTML repose sur des règles spécifiques à chaque domaine avec des sélecteurs génériques en secours.
-------------------------
Collecte HTML

Le moteur de collecte HTML repose sur un principe simple : le moteur est générique, les spécificités sont déclaratives.

Le collecteur ne contient aucune logique propre à un média. Toutes les différences de structure entre les sites sont décrites dans une configuration dédiée.

L'architecture s'articule autour de deux composants :

HtmlCollector, responsable de télécharger les pages, de découvrir les articles et d'extraire leur contenu ;
siteRules, qui centralise les règles d'extraction propres à chaque domaine.

Chaque règle peut définir :

les sélecteurs de découverte des articles (listing) ;
les sélecteurs du contenu principal (content) ;
les éléments à supprimer avant l'extraction (remove).

Lorsqu'une règle est disponible pour un domaine, elle est utilisée en priorité. Dans le cas contraire, le collecteur applique des sélecteurs génériques afin de conserver un fonctionnement minimal.

Cette approche permet d'intégrer de nouveaux médias sans modifier le moteur de collecte.

Intégration d'un média

L'intégration d'une nouvelle source suit toujours la même méthode.

Identifier les liens vers les articles.
Identifier le conteneur contenant le contenu rédactionnel.
Identifier les éléments parasites (publicités, recommandations, widgets, partage, etc.).
Ajouter une règle dans siteRules.
Vérifier l'extraction sur plusieurs articles représentatifs.

Dans la plupart des cas, l'ajout d'un nouveau média consiste uniquement à enrichir la configuration, sans modifier le code du collecteur.

Principes

Cette architecture respecte plusieurs principes fondamentaux :

un collecteur unique pour tous les médias ;
une configuration spécifique par domaine ;
aucune logique métier propre à un site dans le moteur ;
une maintenance simplifiée lors des évolutions des sites ;
la possibilité d'ajouter rapidement de nouvelles sources sans impacter le reste du système.
--------------------------------------------------
ANDORRE 360 — Chaîne éditoriale multilingue

Note de décision — 31 juillet 2026Statut : archivée avant implémentation

1. Décision

ANDORRE 360 dispose désormais d’assez de sources pour commencer à exploiter les contenus collectés. L’intégration de nouvelles sources et des autres communes pourra reprendre ultérieurement.

La priorité devient la construction d’une chaîne éditoriale capable de :

comprendre les articles dans leur langue d’origine ;

produire une version journalistique adaptée à ANDORRE 360 ;

proposer les contenus aux lecteurs en français, en catalan et en espagnol ;

soumettre les contenus générés à une validation éditoriale ;

les faire remonter dans les pages du journal au moyen des publications.

La langue de collecte est indépendante de la langue de publication.

2. Principes éditoriaux

Une source collectée n’est pas directement un article du journal.

La traduction ne doit pas être une transposition littérale.

ANDORRE 360 rédige un contenu original à partir des informations collectées.

Les faits, dates, noms propres, chiffres et citations ne doivent pas être inventés ni altérés.

La source originale, son URL, sa date et la provenance de l’information restent traçables.

L’intelligence artificielle prépare et automatise les tâches répétitives.

Le journaliste conserve la décision éditoriale et peut modifier, refuser ou approuver chaque contenu.

Les enquêtes, faits divers, sujets sensibles ou incertains restent obligatoirement sous contrôle humain.

3. Chaîne fonctionnelle

La cible générale d’ANDORRE 360 reste :

Source
  → Observation
  → Faits vérifiés / Story
  → Article
  → Versions linguistiques
  → Publication
  → Pages et canaux
  → Historique

La première implémentation doit toutefois exploiter l’architecture déjà opérationnelle, sans engager une refonte générale :

Source → Observation → Article → Publication

Les couches Fact et Story pourront être introduites plus tard lorsque le moteur de vérification et de rapprochement des informations sera développé.

4. Transformation d’une observation en article

Une observation collectée doit pouvoir être transformée en brouillon éditorial.

Le traitement produit :

un titre journalistique ;

un chapô ou une description ;

un corps structuré en paragraphes ;

une rubrique ;

un temps de lecture ;

une proposition de format : article, brève ou fil info ;

les métadonnées SEO ;

une proposition d’image ou un besoin d’illustration ;

une version courte destinée au Fil info, lorsque le sujet s’y prête ;

l’attribution et le lien vers la source originale.

Le texte doit être rédigé dans le ton d’ANDORRE 360, sans reproduire inutilement la structure ou les formulations du média source.

5. Gestion des trois langues

Les lecteurs doivent pouvoir consulter les contenus en :

français (fr) ;

catalan (ca) ;

espagnol (es).

Un même sujet ne doit pas devenir trois articles indépendants. Il convient de conserver un article éditorial unique auquel sont rattachées ses versions linguistiques.

Article
  ├── Version française
  ├── Versió catalana
  └── Versión española

La solution cible est un modèle ArticleTranslation, ou un nom équivalent, relié à Article.

Chaque version linguistique doit pouvoir stocker au minimum :

la langue ;

le titre ;

le slug ;

le chapô ;

le contenu ;

le titre SEO ;

la description SEO ;

son statut éditorial ;

sa date de génération ;

sa date de validation ;

sa date de dernière modification.

Le couple (articleId, locale) doit être unique.

Langue de référence

Lors de la première phase, l’article français constitue la version éditoriale de référence. Les versions catalane et espagnole sont générées à partir des mêmes informations validées, et non par une succession de traductions susceptible d’accumuler les erreurs.

À terme, le système pourra générer directement les trois versions depuis la Story et les faits communs.

6. Workflow éditorial

Les statuts cibles restent :

DRAFT → AI_DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED

Pour la première version :

la collecte crée ou met à jour une Observation ;

l’action « Préparer l’article » génère un article français en AI_DRAFT ;

le journaliste relit et corrige le contenu ;

l’approbation autorise la création des versions catalane et espagnole ;

chaque traduction reste révisable avant publication ;

une Publication place l’article dans le journal ;

le contenu apparaît sur les pages correspondant à sa rubrique et à son emplacement.

La préparation peut être automatique. La publication reste manuelle au lancement.

7. Article et publication

La séparation déjà décidée doit être conservée :

Article représente le contenu éditorial ;

Publication représente son affichage, son emplacement et sa période de diffusion.

La création d’un article ne doit donc pas suffire à le faire apparaître sur le site.

Une publication détermine notamment :

le canal ;

la page ou la rubrique ;

la zone éditoriale ;

la priorité ;

la date de début ;

la date de fin ;

son état actif ou inactif.

La page d’accueil doit progressivement consommer getHomepagePublications() et ses zones :

{
  hero,
  main,
  secondary,
  briefs,
  column
}

Les pages de rubrique doivent suivre le même principe : elles affichent des publications validées, pas directement toutes les observations ou tous les articles.

8. Expérience multilingue du lecteur

Les URL publiques doivent identifier clairement la langue :

/fr/article/...
/ca/article/...
/es/article/...

Le site doit proposer un sélecteur visible :

FR | CA | ES

Le choix du lecteur est conservé pendant sa navigation.

Si une version demandée n’est pas encore disponible, le site peut proposer la version française en indiquant clairement que la traduction n’est pas publiée, plutôt que d’afficher une page vide.

Les pages doivent utiliser les balises SEO multilingues appropriées, notamment hreflang, afin de relier les trois versions d’un même article.

9. Degré d’automatisation

Phase initiale

collecte automatique ;

préparation automatique ou déclenchée manuellement ;

rédaction française en brouillon IA ;

traductions catalane et espagnole en brouillon ;

validation humaine ;

placement et publication manuels.

Phase suivante

Après validation de la qualité sur un volume suffisant :

génération automatique après collecte ;

attribution automatique d’une rubrique ;

proposition automatique d’un emplacement ;

publication automatique limitée à certaines sources fiables et à certains formats courts ;

maintien d’une validation obligatoire pour les sujets sensibles.

10. Contrôles indispensables

Avant qu’un contenu soit publiable, le système doit vérifier :

la présence d’un titre, d’un chapô et d’un corps exploitable ;

la conservation de la source et de l’URL originale ;

l’absence de contenu vide ou manifestement tronqué ;

la cohérence des noms, dates et nombres entre les langues ;

la présence d’une rubrique valide ;

l’unicité du sujet ou de l’URL source ;

l’existence de la version linguistique demandée ;

l’approbation éditoriale requise ;

l’existence d’une publication active pour apparaître dans les pages.

11. Ordre de réalisation retenu

Étape 1 — Préparation éditoriale

Construire le passage Observation → Article français en AI_DRAFT.

Ajouter dans le Studio une action « Préparer l’article » et afficher côte à côte la source collectée et le brouillon produit.

Étape 2 — Validation

Permettre au journaliste de corriger, approuver, refuser ou régénérer le brouillon.

Étape 3 — Multilingue

Ajouter le stockage des versions linguistiques, puis générer le catalan et l’espagnol à partir des mêmes informations validées.

Étape 4 — Publication

Créer une publication depuis un article approuvé, avec sa rubrique, sa zone et sa priorité.

Étape 5 — Remontée dans le site

Brancher progressivement :

une page de rubrique pilote ;

le Fil info ;

la page d’accueil ;

les autres rubriques.

Étape 6 — Automatisation encadrée

Automatiser uniquement les actions dont la qualité et la sécurité ont été confirmées par les essais précédents.

12. Critères de réussite du premier lot

Le premier lot sera considéré comme réussi lorsqu’il sera possible de :

collecter un article catalan ou espagnol ;

ouvrir son observation dans le Studio ;

générer un article français complet et correctement formaté ;

conserver la provenance et l’URL originales ;

modifier puis approuver le brouillon ;

générer ses versions catalane et espagnole ;

créer une publication ;

faire apparaître l’article dans une page pilote ;

changer de langue sans créer trois sujets indépendants.

13. Travaux reportés

Les éléments suivants sont volontairement repoussés :

l’ajout massif de nouvelles sources ;

la finalisation des autres communes ;

la publication totalement autonome ;

la diffusion automatique vers les réseaux sociaux et les newsletters ;

le rapprochement avancé de plusieurs sources au sein d’une même Story ;

l’automatisation des sujets sensibles.

Ces travaux reprendront après validation de la chaîne éditoriale principale.

