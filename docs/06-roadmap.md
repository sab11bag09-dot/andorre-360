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
-------------------------------------------------
ANDORRE-360-passation-technique-chaine-editoriale-multilingue.md


ANDORRE 360 — Passation technique
Chantier : chaîne éditoriale et publication multilingue
Date de passation : 31 juillet 2026
Statut : prêt à lancer
Document de décision associé : ANDORRE-360-chaine-editoriale-multilingue.md

1. Résumé pour la personne qui reprend le chantier
ANDORRE 360 sait désormais enregistrer des sources, collecter leurs contenus et créer des observations. Le projet dispose d’assez de sources pour arrêter temporairement leur multiplication et commencer à transformer la matière collectée en contenus réellement publiables.

Le chantier consiste à construire, par étapes, la chaîne suivante :

Source
  → Observation
  → Brouillon journalistique français
  → Validation humaine
  → Versions catalane et espagnole
  → Publication
  → Page de rubrique / Fil info / Accueil
Le résultat attendu n’est pas une simple traduction du média source. Le système doit produire un article original au format ANDORRE 360, conserver la provenance de l’information, permettre sa relecture, puis le placer dans le journal au moyen du modèle Publication.

La génération peut être automatisée. Au lancement, la décision de publier reste humaine.

2. Pourquoi ce chantier est lancé maintenant
La phase d’intégration des sources a rempli son premier objectif :

plusieurs médias andorrans sont disponibles ;

des sources officielles sont présentes ;

les premières communes ont été testées ;

les règles d’extraction spécifiques peuvent être ajoutées au besoin ;

la collecte produit déjà suffisamment de matière pour tester la suite du système.

Continuer à ajouter des sources maintenant aurait surtout trois effets négatifs :

augmenter le nombre d’observations brutes ;

rendre la navigation éditoriale plus difficile ;

repousser la validation du cœur du produit : transformer une information collectée en publication journalistique.

Le chantier est donc prioritaire parce qu’il relie enfin le Source Engine au journal public.

3. Vision produit
ANDORRE 360 est conçu comme un système d’exploitation de l’information pour une rédaction.

L’intelligence artificielle :

surveille ;

prépare ;

rédige ;

traduit ;

classe ;

propose ;

automatise les tâches répétitives.

Le journaliste :

contrôle la provenance ;

corrige ;

décide de la hiérarchie ;

approuve ou refuse ;

déclenche la publication ;

reprend la main lorsque le contexte l’exige.

Le système cible à long terme reste :

Source
  → Observation
  → Claim / Fact
  → Story
  → Article
  → Publication
  → Historique
Ce chantier ne doit pas encore introduire l’ensemble de ces couches. Sa première version exploite l’architecture existante :

Source → Observation → Article → Publication
Les objets Claim, Fact et Story sont volontairement reportés.

4. Périmètre
Inclus
transformation d’une observation exploitable en brouillon français ;

formatage éditorial ANDORRE 360 ;

conservation de la provenance ;

workflow de validation ;

génération des versions catalane et espagnole ;

stockage multilingue ;

sélecteur de langue public ;

création d’une publication depuis un article approuvé ;

alimentation progressive des pages publiques ;

tests, garde-fous et journalisation nécessaires.

Exclus
ajout massif de nouvelles sources ;

finalisation de toutes les communes ;

création immédiate de Claim, Fact ou Story ;

rapprochement automatique de plusieurs sources sur un même événement ;

autopublication générale ;

automatisation des sujets sensibles ;

diffusion automatique vers les réseaux sociaux ;

newsletters multilingues ;

suppression immédiate des anciens champs éditoriaux ;

refonte globale du Studio ou du site public.

5. État technique confirmé
Stack
Next.js 16 ;

React 19 ;

TypeScript ;

Prisma 7 ;

SQLite ;

Tailwind CSS ;

Vitest pour les tests.

Convention Prisma
Le client Prisma est généré dans le projet et importé avec :

import { PrismaClient } from "@/lib/generated/prisma/client";
Ne pas remplacer cet import par @prisma/client sans décision explicite sur la configuration de génération.

Le client applicatif est exposé par :

import { prisma } from "@/lib/prisma";
L’adaptateur utilisé est @prisma/adapter-better-sqlite3.

Modèles actuellement concernés
Le schéma dispose déjà des objets suivants :

Source ;

Observation ;

Article ;

Publication ;

Category ;

Edition ;

statistiques d’articles et de publications.

Relations importantes :

Source 1 ─── n Observation
Article 1 ─── n Observation
Article 1 ─── n Publication
Article 1 ─── n ArticleAnalytics
Publication 1 ─── n PublicationAnalytics
Observation.articleId permet de rattacher une observation à l’article qu’elle a produit.

État du Studio
Les zones suivantes existent déjà ou ont été confirmées :

/admin ;

/admin/sources ;

/admin/observations ;

/admin/articles ;

Médiathèque ;

Éditorial ;

Diffusion.

Le module Sources prend déjà en charge le CRUD, l’activation, la vérification, la disponibilité et les erreurs de collecte.

Séparation structurante
Cette distinction est déjà décidée et ne doit pas être remise en cause :

Article = contenu ;

Publication = emplacement, canal et période d’affichage.

Créer ou approuver un article ne doit pas le rendre visible automatiquement sur le site.

6. Contraintes de réalisation
Ne pas lancer de refonte générale.

Préférer des migrations additives et réversibles.

Conserver les champs actuels d’Article pendant la transition.

Ne supprimer aucune donnée existante dans ce chantier.

Maintenir le fonctionnement des pages françaises pendant l’ajout du multilingue.

Ne jamais publier directement une sortie de modèle.

Ne jamais perdre l’URL ni l’identité de la source.

Rendre toutes les opérations de génération rejouables et idempotentes.

Écrire les tests du domaine avant de brancher l’interface publique.

Utiliser une page pilote avant la généralisation aux autres rubriques.

7. Objectif fonctionnel du premier lot
À la fin du premier lot, un journaliste doit pouvoir :

ouvrir une observation ;

vérifier son titre, son texte et sa source ;

cliquer sur « Préparer l’article » ;

obtenir un brouillon français complet ;

comparer le brouillon à l’observation ;

corriger le contenu ;

l’envoyer en relecture ;

l’approuver ;

générer les versions catalane et espagnole ;

créer une publication ;

voir l’article apparaître sur une page pilote ;

changer de langue sur l’article public.

8. Workflow éditorial cible
Les statuts retenus sont :

DRAFT
  → AI_DRAFT
  → REVIEW
  → APPROVED
  → PUBLISHED
  → ARCHIVED
Signification
Statut	Signification
DRAFT	Brouillon créé manuellement ou incomplet
AI_DRAFT	Contenu généré, non validé
REVIEW	Contenu transmis à la relecture
APPROVED	Contenu validé et publiable
PUBLISHED	Contenu disposant d’une diffusion active
ARCHIVED	Contenu retiré du flux courant
Règles
Une génération crée ou met à jour un AI_DRAFT.

AI_DRAFT ne peut pas être publié.

Une action humaine fait passer le contenu à REVIEW.

Une validation humaine fait passer le contenu à APPROVED.

Seul un article APPROVED peut recevoir une publication active.

PUBLISHED ne doit être posé qu’après création ou activation effective d’une Publication.

Un sujet sensible ne peut pas contourner REVIEW.

Pendant la transition, le booléen Article.published existant peut être conservé pour la compatibilité. Le nouveau statut devient la référence du workflow, puis le booléen pourra être retiré dans un chantier ultérieur.

9. Format éditorial produit
La préparation d’une observation doit produire une structure validable, et non du texte libre non contrôlé.

Sortie attendue du générateur
type PreparedArticle = {
  title: string;
  description: string;
  paragraphs: string[];
  categorySlug: string;
  contentType: "article" | "brief" | "fil-info";
  readingTimeMinutes: number;
  seoTitle: string;
  seoDescription: string;
  shortVersion?: string;
  sourceLanguage: "fr" | "ca" | "es" | "unknown";
  warnings: string[];
};
Pourquoi une sortie structurée
elle est validable avant l’écriture en base ;

elle évite de recevoir du HTML arbitraire ;

elle facilite les tests ;

elle permet de contrôler la catégorie ;

elle permet de refuser une génération incomplète ;

elle simplifie la génération multilingue.

Le modèle ne doit pas fournir de HTML exécutable. L’application transforme les paragraphes validés vers le format déjà attendu par le moteur de rendu.

Avant d’implémenter cette sérialisation, vérifier comment Article.content est actuellement affiché dans les pages publiques. Ne pas changer son format sans adapter et tester le lecteur existant.

Rubriques autorisées
Le générateur doit choisir uniquement parmi les rubriques du journal :

Actu ;

Fil info ;

Économie ;

Société ;

Politique ;

Immo ;

International ;

Sports ;

Culture ;

Montagne ;

Lifestyle.

La correspondance doit reposer sur les slugs réellement présents en base. Les libellés ci-dessus ne doivent pas être injectés directement sans vérification.

10. Règles de rédaction
Le générateur doit :

comprendre le texte dans sa langue d’origine ;

rédiger dans la langue demandée ;

produire un texte original ;

conserver exactement les faits disponibles ;

conserver noms propres, fonctions, lieux, nombres et dates ;

signaler les ambiguïtés ;

ne pas combler une information absente ;

ne pas transformer une hypothèse en certitude ;

ne pas attribuer une citation à la mauvaise personne ;

distinguer une annonce, une décision, un projet et un événement réalisé ;

adopter le ton éditorial d’ANDORRE 360 ;

conserver la source originale hors du corps rédactionnel pour la traçabilité.

La consigne doit explicitement interdire :

l’invention ;

les conclusions non présentes dans la source ;

la copie longue du texte original ;

les titres sensationnalistes ;

la suppression d’une réserve ou d’une incertitude ;

la traduction successive fr → ca → es.

Les versions française, catalane et espagnole doivent toutes être produites depuis les mêmes informations validées.

11. Architecture logicielle recommandée
Les noms ci-dessous sont des propositions. Avant création, vérifier les conventions déjà utilisées dans lib/, app/admin/ et les actions serveur.

lib/
  editorial/
    types.ts
    schemas.ts
    prepareArticle.ts
    validatePreparedArticle.ts
    generateTranslations.ts
    qualityChecks.ts
    prompts/
      article.ts
      translation.ts

app/admin/observations/
  [id]/
    page.tsx
    actions.ts

app/admin/articles/
  [id]/
    page.tsx
    actions.ts

lib/
  articles/
    getLocalizedArticle.ts

lib/
  publications.ts
Responsabilités
prepareArticle.ts

charge l’observation ;

vérifie qu’elle est exploitable ;

appelle le générateur ;

valide la réponse ;

crée ou met à jour l’article ;

rattache Observation.articleId ;

laisse l’article en AI_DRAFT.

generateTranslations.ts

refuse un article non approuvé ;

prend les informations validées ;

génère ca et es séparément ;

valide chaque résultat ;

enregistre chaque version en brouillon de traduction.

qualityChecks.ts

vérifie les champs obligatoires ;

compare les nombres, dates et noms propres ;

détecte un contenu vide ou trop court ;

produit des erreurs bloquantes et des avertissements.

getLocalizedArticle.ts

charge l’article et la langue demandée ;

applique la règle de repli ;

ne renvoie que des versions publiables ;

fournit les variantes nécessaires à hreflang.

lib/publications.ts

reste le point d’accès pour le placement éditorial ;

doit progressivement fournir la page d’accueil par zones ;

ne doit retourner que les publications actives et valides.

12. Couche d’intelligence artificielle
Le code métier ne doit pas dépendre directement d’un fournisseur ou d’un modèle précis.

Prévoir une interface :

interface EditorialGenerator {
  prepareArticle(input: PrepareArticleInput): Promise<PreparedArticle>;
  translateArticle(
    input: TranslateArticleInput,
  ): Promise<PreparedTranslation>;
}
Cette séparation permet :

de tester sans appel externe ;

de changer de modèle ;

de comparer plusieurs modèles ;

d’ajouter des limites de coût ;

de rejouer une génération ;

de désactiver l’IA sans casser le Studio.

Entrée minimale
type PrepareArticleInput = {
  observationId: number;
  sourceName: string;
  sourceUrl: string;
  originalUrl: string;
  originalTitle: string;
  originalContent: string;
  publishedAt?: Date;
  sourceCategory?: string;
  targetLocale: "fr";
};
Validation de sortie
Toute réponse doit être validée par un schéma strict avant écriture en base.

Si la réponse :

n’est pas parseable ;

contient une rubrique interdite ;

ne contient pas de corps ;

perd les informations essentielles ;

dépasse les limites configurées ;

alors aucune publication n’est créée et l’erreur est enregistrée de façon lisible.

13. Évolution Prisma recommandée
Le changement doit être additif.

Enums proposés
enum EditorialStatus {
  DRAFT
  AI_DRAFT
  REVIEW
  APPROVED
  PUBLISHED
  ARCHIVED
}

enum ContentLocale {
  FR
  CA
  ES
}
Champs transitoires proposés sur Article
editorialStatus EditorialStatus @default(DRAFT)
sourceLanguage  String?
generatedAt     DateTime?
approvedAt      DateTime?
Les champs précis doivent être ajustés après audit du schéma complet. Ne pas dupliquer un champ déjà existant sous un autre nom.

Modèle proposé
model ArticleTranslation {
  id             Int             @id @default(autoincrement())
  articleId      Int
  locale         ContentLocale
  title          String
  slug           String
  description    String
  content        String
  seoTitle       String?
  seoDescription String?
  status         EditorialStatus @default(AI_DRAFT)
  generatedAt    DateTime?
  approvedAt     DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([articleId, locale])
  @@unique([locale, slug])
  @@index([status])
}
Ajouter à Article :

translations ArticleTranslation[]
Stratégie de migration sans rupture
Ajouter les nouveaux enums, champs et la table.

Ne supprimer aucun champ actuel d’Article.

Créer une traduction FR pour les articles existants si la migration de données est nécessaire.

Introduire un lecteur localisé avec repli sur les champs historiques.

Faire écrire les nouveaux contenus dans les deux représentations pendant la transition si nécessaire.

Migrer une page pilote.

Généraliser uniquement après validation.

Reporter la suppression des champs historiques à un chantier distinct.

14. Idempotence et concurrence
L’action « Préparer l’article » doit pouvoir être relancée sans créer une série de doublons.

Règles
si Observation.articleId est vide, créer l’article puis rattacher l’observation ;

si Observation.articleId existe, régénérer le brouillon associé ou créer une nouvelle révision selon la politique retenue ;

ne jamais créer un deuxième article silencieusement ;

empêcher deux générations simultanées pour la même observation ;

utiliser une transaction pour l’écriture de l’article et le rattachement de l’observation ;

ne marquer l’observation comme traitée qu’après succès complet ;

en cas d’échec, conserver l’observation disponible pour une nouvelle tentative.

Le bouton doit être désactivé pendant l’opération et afficher clairement :

préparation en cours ;

succès ;

avertissements ;

échec et motif ;

possibilité de relancer.

15. Provenance et traçabilité
Un article généré doit permettre de retrouver :

la source ;

l’observation ;

l’URL originale ;

le titre original ;

la date de publication originale ;

la langue détectée ;

la date de génération ;

la version du prompt ;

le modèle utilisé ;

la date d’approbation ;

l’utilisateur ayant approuvé ;

les avertissements de qualité.

Si tous ces champs ne sont pas ajoutés immédiatement au schéma, les informations minimales obligatoires pour le premier lot sont :

Observation.articleId ;

Observation.sourceId ;

Observation.url ;

la date de génération ;

le statut éditorial.

La version du prompt et l’identité du modèle doivent être ajoutées avant toute automatisation à grande échelle.

16. Interface du Studio
Page Observation
Ajouter une page ou compléter la page existante pour afficher :

Colonne gauche

source ;

URL originale ;

titre original ;

date ;

langue ;

contenu collecté ;

éventuels avertissements d’extraction.

Colonne droite

état de préparation ;

brouillon généré ;

rubrique proposée ;

format proposé ;

avertissements ;

bouton « Préparer l’article » ;

lien vers l’article créé.

Page Article
Ajouter :

badge de statut ;

provenance ;

onglets FR, CA, ES ;

état de chaque langue ;

actions « Envoyer en relecture », « Approuver », « Régénérer » ;

action « Générer les traductions » ;

action « Créer une publication » disponible seulement après approbation ;

historique minimal des opérations.

Garde-fous d’interface
pas de bouton Publier sur AI_DRAFT ;

message explicite si la source est vide ;

confirmation avant régénération d’un texte corrigé manuellement ;

avertissement si une traduction est plus ancienne que la version de référence ;

affichage de la langue réellement servie en cas de repli.

17. Multilingue public
URL cible
/fr/article/[slug]
/ca/article/[slug]
/es/article/[slug]
Le routage exact doit être adapté à l’App Router actuel sans casser les anciennes URL.

Règle de repli
servir la traduction publiée demandée ;

si elle n’existe pas, proposer la version française ;

indiquer que la traduction demandée n’est pas encore disponible ;

ne jamais exposer un brouillon par le mécanisme de repli.

Sélecteur
Afficher :

FR | CA | ES
Le sélecteur doit :

pointer vers la même identité d’article ;

utiliser le slug de la langue cible ;

conserver la langue choisie pendant la navigation ;

distinguer une langue absente d’une langue publiée.

SEO
Pour chaque version publiée :

URL canonique propre ;

balises hreflang pour fr, ca et es ;

titres et descriptions SEO localisés ;

pas d’indexation des brouillons ;

pas de canonique unique renvoyant toutes les langues vers le français.

18. Publication et remontée dans les pages
Une version approuvée n’apparaît pas seule dans les pages.

La chaîne est :

Article approuvé
  → création d’une Publication
  → choix de la page
  → choix de la zone
  → priorité
  → activation
  → affichage
La page d’accueil doit progressivement utiliser :

getHomepagePublications(): Promise<{
  hero: PublicationView | null;
  main: PublicationView[];
  secondary: PublicationView[];
  briefs: PublicationView[];
  column: PublicationView[];
}>
Le type exact doit rester aligné sur le code existant.

Ordre de branchement
une rubrique pilote ;

le Fil info ;

la page d’accueil ;

les autres rubriques.

Le Fil info doit conserver la préférence éditoriale déjà établie : six brèves avant les cartes.

19. Plan d’exécution
Lot 0 — Audit et sécurisation
Objectif : confirmer le terrain avant modification.

À faire :

vérifier l’état Git et les changements locaux ;

identifier la branche courante ;

créer une branche dédiée ;

lire le schéma Prisma complet ;

relever les scripts de package.json ;

localiser les actions Observations et Articles ;

localiser le moteur de collecte et les règles de sites ;

vérifier le rendu actuel d’Article.content ;

identifier le lecteur des publications ;

sauvegarder le fichier SQLite réellement utilisé ;

exécuter la base de tests.

Sortie attendue :

aucun fichier fonctionnel modifié ;

inventaire court des points d’intégration ;

tests de référence enregistrés.

Lot 1 — Domaine éditorial
Objectif : introduire le workflow sans IA réelle.

À faire :

ajouter les statuts ;

ajouter les types et schémas de validation ;

créer un faux EditorialGenerator déterministe ;

écrire le service prepareArticle ;

rendre l’opération idempotente ;

écrire les tests unitaires et d’intégration.

Sortie attendue :

une observation peut produire un AI_DRAFT avec le générateur simulé ;

aucune publication n’est créée.

Lot 2 — Génération réelle et Studio
Objectif : produire un vrai brouillon français contrôlable.

À faire :

brancher le fournisseur d’IA derrière l’interface ;

ajouter la validation stricte ;

ajouter l’action « Préparer l’article » ;

afficher observation et brouillon côte à côte ;

gérer erreurs et relances ;

enregistrer provenance et métadonnées de génération.

Sortie attendue :

trois observations tests produisent des brouillons français exploitables ;

les erreurs n’altèrent pas la base.

Lot 3 — Relecture
Objectif : rendre le contenu validable.

À faire :

ajouter les transitions de statut ;

bloquer les transitions interdites ;

protéger les corrections manuelles ;

enregistrer l’approbation ;

préparer l’action de publication sans l’activer automatiquement.

Sortie attendue :

un journaliste peut conduire un article de AI_DRAFT à APPROVED.

Lot 4 — Traductions
Objectif : produire et stocker FR, CA, ES.

À faire :

ajouter ArticleTranslation ;

appliquer la migration additive ;

créer la version française de référence ;

générer CA et ES séparément ;

ajouter les contrôles de cohérence ;

afficher les trois onglets dans le Studio.

Sortie attendue :

un article approuvé possède trois versions distinctes et traçables.

Lot 5 — Page publique pilote
Objectif : valider le parcours lecteur.

À faire :

créer le lecteur localisé ;

adapter une route d’article ;

ajouter le sélecteur de langue ;

ajouter les métadonnées et hreflang ;

tester le repli vers le français ;

vérifier qu’aucun brouillon n’est accessible.

Sortie attendue :

un article pilote est lisible en trois langues.

Lot 6 — Publication
Objectif : placer l’article dans une rubrique.

À faire :

créer une publication depuis un article approuvé ;

brancher une rubrique pilote ;

respecter zone, priorité et dates ;

tester activation et désactivation ;

vérifier le comportement des trois langues.

Sortie attendue :

l’article apparaît et disparaît selon sa publication, sans modifier son contenu.

Lot 7 — Généralisation
Objectif : étendre après validation.

À faire :

Fil info ;

page d’accueil ;

autres rubriques ;

mesures de qualité ;

sélection des opérations éventuellement automatisables.

20. Procédure de lancement du chantier
Depuis la racine du dépôt :

git status
git branch --show-current
git switch -c feature/editorial-pipeline-multilingual
Si la branche existe déjà, ne pas la recréer : vérifier son contenu et la reprendre explicitement.

Lire ensuite les points d’entrée :

sed -n '1,260p' prisma/schema.prisma
cat package.json
find app/admin/observations app/admin/articles lib -maxdepth 3 -type f | sort
Si rg est disponible, il peut remplacer find pour les recherches de contenu. Le Mac utilisé pour le projet n’avait pas rg lors des derniers essais : les commandes de passation ne doivent donc pas en dépendre.

Identifier la base réelle dans .env, puis en faire une copie horodatée avant migration. Ne pas supposer son emplacement à partir du seul nom dev.db.

Lancer l’état de référence avec les scripts confirmés ou équivalents présents dans package.json :

npm run lint
npx tsc --noEmit
npm test -- --run
npm run build
Si un script n’existe pas, ne pas l’ajouter uniquement pour satisfaire cette liste : utiliser le script réellement déclaré et documenter l’équivalent exécuté.

Créer ensuite un premier commit limité au domaine et aux tests. Ne pas mélanger dans ce commit :

migration Prisma ;

interface ;

appel au modèle ;

routage public.

21. Jeu d’essai initial
Préparer un petit corpus stable :

une observation en catalan issue d’un média ;

une observation en catalan issue d’une commune ;

une observation en espagnol si disponible ;

une observation dont le contenu est trop court ;

une observation vide ;

une observation déjà rattachée à un article.

Pour chaque observation valide, conserver une fiche d’attendus :

faits indispensables ;

noms propres ;

nombres ;

dates ;

rubrique attendue ;

format attendu ;

éléments qui ne doivent pas apparaître.

Ce corpus permet de mesurer la qualité sans dépendre des nouveaux contenus collectés chaque jour.

22. Stratégie de tests
Tests unitaires
validation d’un PreparedArticle valide ;

refus d’une sortie incomplète ;

refus d’une rubrique inconnue ;

calcul du temps de lecture ;

transition de statut autorisée ;

transition interdite ;

repli linguistique ;

comparaison des nombres et dates ;

détection d’un contenu vide.

Tests du service
création d’un article depuis une observation ;

rattachement de Observation.articleId ;

relance sans doublon ;

rollback en cas d’échec ;

refus d’une observation inexistante ;

refus d’une observation vide ;

conservation de la provenance.

Tests des traductions
unicité (articleId, locale) ;

génération séparée de CA et ES ;

refus avant approbation française ;

conservation des noms propres ;

détection d’un nombre perdu ou ajouté ;

traduction non publiée invisible publiquement.

Tests de publication
refus d’un article non approuvé ;

création d’une publication valide ;

respect de la zone ;

respect des dates ;

désactivation ;

absence de publication = absence de la page de rubrique.

Vérifications de fin de lot
npm run lint
npx tsc --noEmit
npm test -- --run
npm run build
23. Critères de qualité et blocages
Erreurs bloquantes
observation absente ;

contenu vide ou trop court ;

source ou URL perdue ;

sortie non structurée ;

titre vide ;

corps vide ;

rubrique inconnue ;

article déjà en cours de génération ;

traduction générée depuis un contenu non approuvé ;

tentative de publication d’un brouillon ;

incohérence majeure sur un nom, une date ou un nombre.

Avertissements non bloquants
image absente ;

catégorie proposée avec faible confiance ;

texte source inhabituellement court ;

citation difficile à attribuer ;

traduction nécessitant une relecture terminologique ;

version linguistique plus ancienne que la référence.

24. Sécurité, confidentialité et coûts
Les clés du fournisseur d’IA restent exclusivement côté serveur.

Aucun secret ne doit être envoyé au navigateur.

Le contenu source transmis au modèle doit être limité au nécessaire.

Les appels doivent avoir une limite de taille et un délai maximal.

Les erreurs externes doivent être transformées en messages applicatifs.

Les sorties doivent être traitées comme non fiables jusqu’à validation.

Les actions de génération doivent être réservées aux rôles autorisés.

Un budget ou compteur d’appels doit être prévu avant la génération en masse.

Les journaux ne doivent pas enregistrer de clé ni de secret.

25. Observabilité
Enregistrer au minimum :

début et fin de génération ;

observation concernée ;

article concerné ;

langue ;

durée ;

succès ou échec ;

code d’erreur applicatif ;

version du prompt ;

modèle ;

avertissements de qualité.

Les erreurs affichées dans le Studio doivent être compréhensibles :

Le contenu collecté est insuffisant pour préparer un article.
et non uniquement :

Invalid prisma... / error 500
26. Déploiement progressif et retour arrière
Utiliser des drapeaux fonctionnels ou une configuration équivalente :

EDITORIAL_PIPELINE_ENABLED
ARTICLE_TRANSLATIONS_ENABLED
LOCALIZED_PUBLIC_ROUTES_ENABLED
Les noms sont indicatifs et doivent respecter les conventions du projet.

Principe :

migration additive ;

fonctionnalité désactivée par défaut hors environnement de test ;

activation dans le Studio ;

validation sur le corpus pilote ;

activation de la page publique pilote ;

généralisation.

Retour arrière :

désactiver le nouveau parcours ;

conserver les données créées ;

revenir au lecteur français historique ;

ne pas annuler une migration en supprimant les traductions ;

corriger puis réactiver.

27. Definition of Done du chantier
Le chantier est terminé lorsque :

une observation valide peut produire un brouillon français ;

la génération est rejouable sans doublon ;

la provenance est visible ;

le workflow bloque une publication prématurée ;

le journaliste peut corriger et approuver ;

les traductions catalane et espagnole sont générées séparément ;

les trois versions sont stockées sous un seul article ;

le sélecteur de langue fonctionne ;

les URL et hreflang sont corrects ;

une publication contrôle réellement l’apparition dans une rubrique ;

aucune sortie de modèle n’est publiée sans validation ;

les tests, le typage, le lint et le build passent ;

les décisions et limites sont documentées.

28. Première session de travail recommandée
La première session ne doit pas encore brancher un modèle d’IA.

Elle doit produire :

l’audit des points d’intégration ;

la branche de travail ;

la sauvegarde de la base ;

les statuts éditoriaux ;

les types PreparedArticle ;

le schéma de validation ;

un faux générateur déterministe ;

le service idempotent prepareArticle ;

ses tests ;

une démonstration en base sur une observation de test.

Cette étape donne une fondation testable. Le fournisseur d’IA, l’interface, les traductions et les pages publiques viennent ensuite, chacun dans un lot distinct.

29. Vérifications à effectuer dans le dépôt avant de coder
Ces points n’ont pas été déduits de manière suffisamment certaine et doivent être confirmés :

emplacement exact des actions Observations ;

existence d’une page détail Observation ;

format exact attendu par Article.content ;

présence éventuelle d’un statut éditorial déjà partiellement implémenté ;

fournisseur d’IA déjà configuré ou non ;

emplacement des prompts existants ;

conventions de validation déjà utilisées ;

fonctionnement exact des anciennes routes d’article ;

état réel de getHomepagePublications() ;

slugs exacts des catégories ;

stratégie actuelle de notifications et de messages d’erreur ;

emplacement réel du fichier SQLite actif.

Ne pas combler ces inconnues par des suppositions. Les résoudre pendant le Lot 0.

30. Décisions à ne pas rouvrir pendant le premier lot
Le projet dispose d’assez de sources pour commencer.

La langue de collecte est indépendante de la langue de publication.

Le français est la première version éditoriale de référence.

Les lecteurs doivent disposer du français, du catalan et de l’espagnol.

Un sujet reste un article unique avec plusieurs versions linguistiques.

L’article contient ; la publication place et diffuse.

La préparation peut être automatique.

La publication reste humaine au lancement.

Les sujets sensibles restent sous contrôle humain.

L’architecture existante est exploitée avant l’introduction de Fact et Story.

La migration doit être progressive et ne pas casser le site français.

31. Point de départ opérationnel
Le premier ticket à ouvrir est :

Créer le service idempotent de préparation d’un article depuis une observation, avec générateur simulé et statut AI_DRAFT.

Critères d’acceptation du ticket :

une observation valide crée un article ;

l’article est rattaché à l’observation ;

le statut est AI_DRAFT ;

aucune publication n’est créée ;

une relance ne crée pas de doublon ;

une observation vide est refusée proprement ;

la provenance est conservée ;

les tests passent.

Ce ticket lance le chantier sans dépendre immédiatement d’un fournisseur d’IA ni du routage multilingue.

