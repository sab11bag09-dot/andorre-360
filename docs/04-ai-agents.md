# AI Agents

> Les agents spécialisés d’ANDORRE 360.

Ce document décrit les rôles, responsabilités, limites et règles de fonctionnement des agents d’intelligence artificielle du système.

Il ne décrit ni les prompts détaillés, ni les fournisseurs de modèles, ni l’implémentation technique.

Il décrit les capacités attendues.

---

# Principe général

ANDORRE 360 ne repose pas sur une intelligence artificielle unique.

Il repose sur plusieurs agents spécialisés.

Chaque agent possède :

- une mission précise ;
- un périmètre limité ;
- des entrées autorisées ;
- des sorties attendues ;
- des outils définis ;
- des critères de qualité ;
- un niveau d’autonomie ;
- des limites explicites.

Un agent ne doit jamais agir en dehors de son périmètre.

Les agents collaborent au travers du modèle métier.

Ils ne se transmettent pas directement des textes informels lorsqu’un objet métier structuré peut être utilisé.

---

# Objectif

Les agents ont pour objectif d’automatiser les tâches répétitives d’une rédaction tout en conservant :

- la traçabilité ;
- la fiabilité ;
- l’explicabilité ;
- la priorité humaine ;
- le respect des règles éditoriales.

Ils assistent la rédaction.

Ils ne constituent pas l’autorité éditoriale finale.

---

# Principes de fonctionnement

Les agents respectent les règles suivantes :

1. Chaque agent possède une responsabilité principale.
2. Chaque action doit être attribuable.
3. Chaque sortie doit être traçable jusqu’à ses entrées.
4. Une proposition ne doit jamais être présentée comme une certitude sans preuve suffisante.
5. Un agent ne peut pas modifier silencieusement une connaissance existante.
6. Un journaliste peut suspendre ou annuler toute action automatisée.
7. Les règles éditoriales priment sur les recommandations d’un agent.
8. Les modèles d’IA sont interchangeables.
9. Les décisions importantes doivent être historisées.
10. Les agents travaillent sur des objets métier structurés dès que cela est possible.

---

# Niveaux d’autonomie

Chaque agent possède un niveau d’autonomie défini selon son contexte d’utilisation.

## `OBSERVE`

L’agent analyse les informations mais ne modifie aucun objet métier.

Il produit uniquement des observations ou des diagnostics.

## `SUGGEST`

L’agent propose une action.

La proposition doit être validée par un humain ou une règle métier.

## `EXECUTE`

L’agent peut exécuter une action réversible dans un périmètre défini.

## `AUTONOMOUS`

L’agent peut agir automatiquement selon des règles approuvées par la rédaction.

Ce niveau est réservé aux tâches considérées comme suffisamment fiables, traçables et peu risquées.

Le niveau d’autonomie peut varier selon :

- le type de Story ;
- la Source concernée ;
- le niveau de confiance ;
- la sensibilité du sujet ;
- le canal de publication ;
- les règles éditoriales applicables.

---

# Agent de collecte

## Nom

`Collection Agent`

## Mission

Collecter les contenus des Sources et produire des Observations fidèles aux contenus d’origine.

## Entrées

- Source ;
- configuration de collecte ;
- fréquence de surveillance ;
- règles d’extraction ;
- historique des collectes précédentes.

## Sorties

- nouvelle Observation ;
- nouvelle version d’une Observation ;
- signalement d’indisponibilité ;
- signalement d’erreur de collecte ;
- détection d’un contenu inchangé.

## Responsabilités

- consulter les Sources ;
- télécharger les contenus ;
- extraire les données brutes ;
- détecter les changements ;
- calculer les empreintes de contenu ;
- éviter les doublons techniques ;
- conserver la provenance.

## Limites

L’agent de collecte :

- n’interprète pas les informations ;
- ne crée pas de Fact ;
- ne crée pas d’Article ;
- ne décide pas de la valeur journalistique d’un contenu.

## Critères de qualité

- fidélité au contenu d’origine ;
- conservation des métadonnées ;
- absence de duplication ;
- capacité à reproduire la collecte ;
- détection fiable des erreurs.

---

# Agent d’extraction

## Nom

`Claim Extraction Agent`

## Mission

Identifier les affirmations présentes dans une Observation.

## Entrées

- Observation ;
- contenu brut ;
- langue détectée ;
- métadonnées de la Source.

## Sorties

- Claims ;
- Entities détectées ;
- passages servant d’Evidences ;
- niveau de confiance d’extraction ;
- éléments ambigus ou non interprétables.

## Responsabilités

- distinguer les affirmations des commentaires ;
- extraire les dates, lieux, noms, montants et citations ;
- identifier les acteurs concernés ;
- relier chaque Claim à un passage précis ;
- conserver la langue et la formulation d’origine.

## Limites

L’agent d’extraction :

- ne décide pas qu’un Claim est vrai ;
- ne transforme pas automatiquement un Claim en Fact ;
- ne corrige pas silencieusement une Source ;
- ne complète pas une information manquante par supposition.

## Critères de qualité

- précision des Claims ;
- qualité du rattachement aux Evidences ;
- absence d’invention ;
- conservation du contexte ;
- signalement explicite des ambiguïtés.

---

# Agent de vérification

## Nom

`Verification Agent`

## Mission

Évaluer les Claims et proposer la création, la confirmation, la correction ou le rejet de Facts.

## Entrées

- Claims ;
- Evidences ;
- niveau de confiance des Sources ;
- Facts existants ;
- règles de vérification ;
- contexte de la Story.

## Sorties

- proposition de Fact ;
- proposition de confirmation ;
- contradiction détectée ;
- demande de vérification humaine ;
- niveau de confiance ;
- justification.

## Responsabilités

- comparer plusieurs Claims ;
- rechercher les confirmations ;
- détecter les contradictions ;
- distinguer les mises à jour des erreurs ;
- évaluer la qualité des Evidences ;
- proposer un état de Fact.

## Limites

L’agent de vérification :

- ne doit pas masquer une contradiction ;
- ne doit pas fusionner deux informations incompatibles ;
- ne doit pas déclarer un Fact confirmé sans justification suffisante ;
- ne doit pas remplacer une validation humaine sur les sujets sensibles.

## Critères de qualité

- explicabilité ;
- cohérence des décisions ;
- conservation des informations contradictoires ;
- qualité de l’évaluation de confiance ;
- respect des seuils de validation.

---

# Agent Story

## Nom

`Story Agent`

## Mission

Créer, enrichir, fusionner ou scinder les Stories à partir des informations disponibles.

## Entrées

- Observation ;
- Claims ;
- Facts ;
- Entities ;
- Stories existantes ;
- règles de rapprochement.

## Sorties

- nouvelle Story ;
- enrichissement d’une Story ;
- proposition de fusion ;
- proposition de scission ;
- rattachement d’Observations et de Facts ;
- signalement de doublon ;
- demande de validation humaine.

## Responsabilités

- reconnaître qu’une information concerne un événement existant ;
- éviter les Stories en double ;
- organiser les Facts autour d’un événement ;
- suivre l’évolution d’une Story ;
- détecter les changements significatifs ;
- maintenir la cohérence du sujet.

## Limites

L’agent Story :

- ne fusionne pas automatiquement des Stories sensibles sans règle explicite ;
- ne supprime pas l’historique ;
- ne modifie pas les Facts ;
- ne produit pas directement d’Article.

## Critères de qualité

- qualité du rapprochement sémantique ;
- faible taux de doublons ;
- faible taux de fusions incorrectes ;
- cohérence temporelle ;
- justification des rattachements.

---

# Agent journaliste

## Nom

`Journalist Agent`

## Mission

Transformer une Story et ses Facts en contenu journalistique en français.

## Entrées

- Story ;
- Facts validés ;
- Claims utiles ;
- Evidences ;
- contexte éditorial ;
- langue de publication ;
- angle ;
- format ;
- ton ;
- règles éditoriales.

## Sorties

- brouillon d’Article ;
- titre ;
- chapô ;
- corps de texte ;
- suggestions d’intertitres ;
- éléments nécessitant une validation ;
- liens entre affirmations et Facts.

## Responsabilités

- hiérarchiser l’information ;
- rédiger dans un style journalistique ;
- contextualiser les Facts ;
- respecter l’angle demandé ;
- produire directement dans la langue de publication ;
- signaler les informations manquantes ;
- conserver la fidélité aux Sources.

## Compréhension multilingue

L’agent ne réalise pas une traduction littérale.

Il comprend les Facts dans leur langue d’origine puis rédige un contenu journalistique dans la langue cible.

Le pipeline attendu est :

```text
Observation multilingue
    ↓
Claims
    ↓
Facts
    ↓
Rédaction journalistique en français
```

La langue de collecte et la langue de publication sont indépendantes.

## Limites

L’agent journaliste :

- n’invente aucun Fact ;
- ne transforme pas une hypothèse en certitude ;
- ne produit pas directement à partir d’une Source brute ;
- ne masque pas les incertitudes ;
- ne publie pas sauf autorisation explicite ;
- ne décide pas seul de la ligne éditoriale.

## Critères de qualité

- fidélité factuelle ;
- clarté ;
- hiérarchisation de l’information ;
- qualité du français ;
- respect du ton ;
- absence d’invention ;
- traçabilité des affirmations.

---

# Agent éditeur

## Nom

`Editor Agent`

## Mission

Relire un Article et évaluer sa qualité éditoriale.

## Entrées

- Article ;
- Story ;
- Facts ;
- Evidences ;
- règles éditoriales ;
- format demandé ;
- public cible.

## Sorties

- corrections proposées ;
- nouvelle version de l’Article ;
- signalement de problèmes ;
- recommandation de validation ;
- recommandation de rejet ;
- demande de complément.

## Responsabilités

- vérifier la structure ;
- améliorer la clarté ;
- supprimer les répétitions ;
- vérifier la cohérence du ton ;
- contrôler la hiérarchie de l’information ;
- vérifier que le titre reflète le contenu ;
- détecter les formulations ambiguës.

## Limites

L’agent éditeur :

- ne modifie pas les Facts ;
- ne supprime pas une incertitude justifiée ;
- ne remplace pas une décision éditoriale humaine ;
- ne change pas l’angle sans justification.

## Critères de qualité

- lisibilité ;
- cohérence ;
- concision ;
- respect de la ligne éditoriale ;
- conservation du sens ;
- absence de déformation factuelle.

---

# Agent de contrôle factuel

## Nom

`Fact Check Agent`

## Mission

Vérifier qu’un Article reste fidèle aux Facts, Claims et Evidences utilisés.

## Entrées

- Article ;
- Facts ;
- Claims ;
- Evidences ;
- Sources ;
- règles de vérification.

## Sorties

- rapport de conformité ;
- affirmations validées ;
- affirmations non sourcées ;
- contradictions ;
- erreurs potentielles ;
- niveau global de confiance ;
- demande de validation humaine.

## Responsabilités

- relier les affirmations de l’Article aux Facts ;
- identifier les informations non prouvées ;
- détecter les erreurs de dates, noms, lieux ou montants ;
- vérifier les citations ;
- vérifier les niveaux d’incertitude ;
- contrôler les mises à jour.

## Limites

L’agent de contrôle factuel :

- ne corrige pas silencieusement l’Article ;
- ne crée pas de nouvelles informations ;
- ne valide pas une affirmation uniquement parce qu’elle semble plausible ;
- ne remplace pas une enquête journalistique.

## Critères de qualité

- taux d’affirmations traçables ;
- détection des erreurs factuelles ;
- qualité des justifications ;
- absence de faux positifs excessifs ;
- conservation des nuances.

---

# Agent SEO

## Nom

`SEO Agent`

## Mission

Préparer les éléments de référencement d’un Article sans modifier son sens éditorial.

## Entrées

- Article ;
- Story ;
- sujet principal ;
- public cible ;
- règles SEO ;
- contraintes du canal.

## Sorties

- titre SEO ;
- méta-description ;
- slug ;
- mots-clés ;
- suggestions de liens internes ;
- données structurées éventuelles.

## Responsabilités

- améliorer la découvrabilité ;
- conserver la fidélité au contenu ;
- respecter les limites de longueur ;
- éviter le bourrage de mots-clés ;
- proposer des formulations naturelles.

## Limites

L’agent SEO :

- ne modifie pas les Facts ;
- ne produit pas de titre trompeur ;
- ne privilégie pas le référencement au détriment de l’exactitude ;
- ne remplace pas le titre éditorial sans validation.

## Critères de qualité

- pertinence ;
- lisibilité ;
- absence de clickbait ;
- cohérence avec l’Article ;
- respect des contraintes techniques.

---

# Agent réseaux sociaux

## Nom

`Social Agent`

## Mission

Adapter un Article aux formats des réseaux sociaux et des canaux de messagerie.

## Entrées

- Article ;
- Publication cible ;
- canal ;
- règles éditoriales ;
- longueur maximale ;
- public cible.

## Sorties

- texte de publication ;
- résumé ;
- accroche ;
- hashtags éventuels ;
- appel à l’action ;
- avertissement en cas de sujet sensible.

## Responsabilités

- adapter le format au canal ;
- conserver le sens ;
- éviter les formulations trompeuses ;
- produire plusieurs variantes ;
- respecter le ton éditorial.

## Limites

L’agent Social :

- ne publie pas sans autorisation ;
- ne dramatise pas artificiellement ;
- ne retire pas une nuance importante ;
- ne présente pas une information provisoire comme définitive.

## Critères de qualité

- fidélité ;
- efficacité ;
- adaptation au canal ;
- clarté ;
- respect de la ligne éditoriale.

---

# Agent de mise en page

## Nom

`Layout Agent`

## Mission

Proposer l’organisation éditoriale des Publications dans une Edition.

## Entrées

- Stories actives ;
- Publications ;
- priorités ;
- catégories ;
- règles de mise en page ;
- emplacements disponibles ;
- contexte temporel.

## Sorties

- proposition d’Edition ;
- ordre des Publications ;
- emplacement recommandé ;
- format recommandé ;
- signalement des conflits.

## Responsabilités

- hiérarchiser les contenus ;
- répartir les catégories ;
- éviter les répétitions ;
- valoriser les sujets importants ;
- maintenir l’équilibre de l’Edition.

## Limites

L’agent de mise en page :

- ne modifie pas les Articles ;
- ne publie pas ;
- ne déplace pas un sujet sensible sans règle explicite ;
- ne remplace pas l’arbitrage éditorial final.

## Critères de qualité

- cohérence globale ;
- hiérarchie ;
- diversité des sujets ;
- absence de doublons ;
- respect des priorités.

---

# Agent de publication

## Nom

`Publisher Agent`

## Mission

Exécuter la diffusion d’une Publication sur un canal donné.

## Entrées

- Publication approuvée ;
- version d’Article ;
- canal ;
- date de publication ;
- paramètres techniques ;
- règles de diffusion.

## Sorties

- Publication diffusée ;
- identifiant externe ;
- URL publique ;
- statut de synchronisation ;
- rapport d’erreur ;
- confirmation de mise à jour ou de retrait.

## Responsabilités

- publier ;
- planifier ;
- mettre à jour ;
- retirer ;
- contrôler le résultat ;
- conserver la trace technique.

## Limites

L’agent de publication :

- ne choisit pas le contenu à publier ;
- ne modifie pas l’Article ;
- ne diffuse jamais une version non approuvée ;
- ne masque pas un échec technique.

## Critères de qualité

- fiabilité ;
- idempotence ;
- cohérence entre canaux ;
- qualité des rapports d’erreur ;
- vérification après publication.

---

# Agent qualité

## Nom

`Quality Agent`

## Mission

Évaluer la qualité globale d’un traitement avant publication.

## Entrées

- Story ;
- Article ;
- rapport de vérification ;
- règles éditoriales ;
- niveau de sensibilité ;
- décisions précédentes.

## Sorties

- score de qualité ;
- score de confiance ;
- alertes ;
- blocage éventuel ;
- recommandation de publication ;
- recommandation de validation humaine.

## Responsabilités

- agréger les contrôles ;
- vérifier que les étapes obligatoires ont été réalisées ;
- identifier les risques ;
- appliquer les seuils de publication ;
- empêcher une automatisation insuffisamment fiable.

## Limites

L’agent qualité :

- ne corrige pas lui-même tous les problèmes ;
- ne contourne pas les règles éditoriales ;
- ne valide pas automatiquement les sujets sensibles ;
- ne transforme pas un score en vérité absolue.

## Critères de qualité

- cohérence des évaluations ;
- qualité des alertes ;
- faible taux de publications incorrectes ;
- explicabilité du score ;
- respect des seuils définis.

---

# Orchestration des agents

Les agents interviennent dans des Workflows.

Un Workflow typique peut être :

```text
Collection Agent
    ↓
Claim Extraction Agent
    ↓
Verification Agent
    ↓
Story Agent
    ↓
Journalist Agent
    ↓
Editor Agent
    ↓
Fact Check Agent
    ↓
Quality Agent
    ↓
Publisher Agent
```

Ce flux n’est pas obligatoire dans tous les cas.

Certains traitements peuvent être plus courts.

Exemple pour un contenu de routine :

```text
Collection
    ↓
Extraction
    ↓
Vérification automatique
    ↓
Rédaction
    ↓
Contrôle qualité
    ↓
Publication
```

Exemple pour un sujet sensible :

```text
Collection
    ↓
Extraction
    ↓
Vérification
    ↓
Analyse
    ↓
Validation humaine
    ↓
Rédaction
    ↓
Relecture humaine
    ↓
Publication
```

---

# Collaboration entre agents

Les agents ne doivent pas se faire confiance aveuglément.

Chaque sortie doit pouvoir être contrôlée par :

- un autre agent ;
- une règle métier ;
- un journaliste ;
- un seuil de confiance ;
- une étape de validation.

Un agent producteur et un agent contrôleur doivent rester distincts lorsque le risque éditorial le justifie.

Par exemple :

- le Journalist Agent rédige ;
- le Fact Check Agent contrôle ;
- le Editor Agent améliore ;
- le Quality Agent évalue ;
- le Publisher Agent diffuse.

Cette séparation limite les erreurs et améliore l’explicabilité.

---

# Human Override

À tout moment, un journaliste peut :

- suspendre un Agent ;
- reprendre une Story ;
- annuler une action ;
- refuser une proposition ;
- modifier un Article ;
- imposer une validation ;
- bloquer une Publication ;
- restituer le contrôle au système.

Lorsqu’un journaliste reprend une Story :

- les agents continuent éventuellement la veille ;
- les actions éditoriales deviennent consultatives ;
- les publications automatiques sont suspendues ;
- toutes les transitions sont historisées.

---

# Traçabilité

Chaque exécution d’un Agent doit conserver :

- l’identité de l’Agent ;
- sa version ;
- la date d’exécution ;
- les entrées utilisées ;
- les outils appelés ;
- les sorties produites ;
- le niveau de confiance ;
- les règles appliquées ;
- les erreurs rencontrées ;
- les Decisions créées.

Une sortie générée ne doit jamais être impossible à expliquer.

---

# Gestion des erreurs

Un Agent peut échouer.

Un échec ne doit jamais être masqué.

Le système doit distinguer :

- une erreur technique ;
- une entrée invalide ;
- une information insuffisante ;
- une contradiction ;
- un niveau de confiance trop faible ;
- une règle interdisant l’action ;
- une validation humaine nécessaire.

Selon le cas, le Workflow peut :

- réessayer ;
- changer d’outil ;
- suspendre le traitement ;
- demander une validation ;
- créer une alerte ;
- abandonner l’action.

---

# Indépendance des modèles

Un Agent ne doit pas être confondu avec un modèle d’intelligence artificielle.

L’Agent définit :

- une mission ;
- des règles ;
- des entrées ;
- des sorties ;
- des outils ;
- des limites ;
- des critères de qualité.

Le modèle est uniquement l’un des moyens utilisés pour exécuter cette mission.

Un même Agent peut utiliser plusieurs modèles.

Un modèle peut être remplacé sans modifier le rôle métier de l’Agent.

Le patrimoine d’ANDORRE 360 réside dans :

- ses données ;
- son modèle métier ;
- ses règles éditoriales ;
- ses Workflows ;
- ses évaluations ;
- son historique de Decisions.

Il ne réside pas dans un fournisseur de modèle particulier.

---

# Résumé

Les agents d’ANDORRE 360 forment une rédaction logicielle spécialisée.

```text
Les agents collectent.

Les agents extraient.

Les agents vérifient.

Les agents organisent la connaissance.

Les agents rédigent.

Les agents contrôlent.

Les agents préparent la diffusion.

Les journalistes décident.
```

L’objectif n’est pas de rendre l’IA toute-puissante.

L’objectif est de lui confier des missions précises, contrôlables et traçables, afin qu’elle puisse automatiser le travail répétitif sans affaiblir la responsabilité éditoriale.