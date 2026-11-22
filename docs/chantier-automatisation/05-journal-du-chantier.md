# ANDORRE 360 — Journal du chantier

[Sommaire](README.md) · Guide du chantier d’automatisation éditoriale, partie 18.

## 18. État exact au moment d’archiver ce guide

État au 20 novembre 2026 :

- branche de référence : `audit/studio-v4` ;
- dernières pull requests fusionnées : #125 à #154 (dates futures, génération, orchestrateur, Studio, limite par source, lecture et redatage des dates, mode brouillons, essais supervisés, rédaction à partir des faits, contrôle de ressemblance, priorité institutionnelle, anti-doublon par sujet, signature et crédit des sources, longueur et affichage des titres, contrôle de fidélité aux faits) ;
- orchestrateur des articles : livré, mode brouillons par défaut, désactivé hors des essais ;
- publication automatique des articles : désactivée localement, arrêt d’urgence activé ;
- essais supervisés : le 18 novembre 2026, 5 brouillons (articles 494 à 498) ; le 19 novembre 2026, 5 brouillons rédigés à partir des faits (articles 499 à 503) ; aucune publication (voir lot D) ;
- dates : 67 % des observations datées à la collecte ; règles propres à RTVA, AR+I, Escaldes-Engordany, AFA et Sant Julià de Lòria ; 68 observations récentes redatées dans `./dev.db` le 19 novembre 2026 ; 7 sources restent sans date exploitable, et l’Agenda n’affiche que des dates d’événements ;
- 4 observations Altaveu du 13 août restent datées au 7 décembre 2026 : données antérieures au correctif #125, sans effet sur l’orchestrateur ;
- images des brouillons : image générique, amélioration nécessaire ;
- production : non déployée ;
- rédaction à partir des faits : génération en deux temps (extraction des faits, puis rédaction sans le texte source), essayée avec succès le 19 novembre 2026 ;
- contrôle de ressemblance : article bloqué au-delà de 20 % de passages de 5 mots communs avec la source ou d’un passage commun de plus de 12 mots ;
- sélection de l’orchestrateur : sources institutionnelles d’abord, médias en dernier ; sources reclassées dans `./dev.db` le 19 novembre 2026 ;
- anti-doublon par sujet : titres rapprochés par mots significatifs communs et, entre sources différentes, par racines communes ; pas de traduction entre langues ;
- signature : articles rédigés automatiquement signés « Rédaction ANDORRE 360 », source créditée sur la page publique avec un lien ; sources renommées avec leur nom officiel ;
- titres : 70 caractères au plus en français, catalan et espagnol ; page d’accueil et pages de rubrique adaptées pour les afficher en entier ;
- articles déjà présents dans `./dev.db` : données de chantier, à effacer lors de la mise en production ;
- prochaines priorités : voir « Revue d’ensemble et priorités » ci-dessous ;
- question juridique de la reprise d’articles de presse : réduite par les trois derniers lots, mais non tranchée ; un avis d’avocat reste nécessaire avant toute mise en ligne.

### Revue d’ensemble et priorités (19 novembre 2026)

Revue franche du chantier demandée par l’utilisateur, sur tous les plans, du plus important au moins important.

#### Juridique

- C’est la plus grande incertitude, et tout le reste en dépend : consulter l’avocat dès maintenant plutôt qu’à la fin, avec trois questions précises (reprise de communiqués institutionnels, réécriture à partir des faits d’un article de presse, crédit de la source avec un lien).
- En attendant l’avis : limiter la rédaction automatique aux sources institutionnelles (Govern, comuns, Policia, CASS…), dont les communiqués sont faits pour être repris et qui sont les plus fiables. Décision de l’utilisateur (19 novembre 2026) : pas de limitation pendant le chantier ; rien n’étant mis en ligne, les tests peuvent s’appuyer sur des articles de confrères. La question revient à la préparation de la mise en production.
- Angle mort : le contrôle de ressemblance compare des mots ; les sources étant surtout en catalan et les articles en français, il ne repère pas une traduction fidèle. La rédaction à partir des faits limite ce risque, mais rien ne le mesure. Piste : comparer après avoir retraduit l’article vers la langue de la source.

#### Qualité éditoriale

- Chaque changement de consigne est jugé sur 5 brouillons et à l’œil : constituer un jeu de référence d’une vingtaine d’observations variées, relu une fois par l’utilisateur, sur lequel comparer chaque nouvelle version de consigne.
- Aucun contrôle automatique ne vérifie que les chiffres, noms et dates de l’article figurent dans la liste de faits : contrôle simple, qui attraperait les inventions.
- La relecture humaine des brouillons 494 à 503 reste à faire : c’est le meilleur retour disponible, et il est gratuit.
- Valeur ajoutée : réécrire l’information des autres apporte peu au lecteur ; ANDORRE 360 se distinguerait en croisant plusieurs sources sur un même sujet (l’anti-doublon sait déjà les regrouper), en ajoutant du contexte et en suivant les données locales (IPC, CASS…).

#### Produit

- Images : tous les brouillons ont la même image générique, point faible le plus visible en une.
- « Ils en parlent » : des communiqués politiques signés par la rédaction risquent de passer pour des prises de position du journal ; prévoir une présentation claire (« Communiqué de… ») et un équilibre entre partis.
- Langue : site d’abord en français dans un pays de langue officielle catalane ; choix à assumer consciemment selon le public visé.

#### Technique

- 10 composants de rubrique recopient les mêmes cartes (41 corrections identiques dans 9 fichiers pour les titres) : quelques composants de carte partagés. Fait le 20 novembre 2026 (voir « Cartes partagées des rubriques » ci-dessous).
- Les tests de mise en page vérifient des chaînes de classes CSS, ce qui est fragile : les remplacer par un test automatique qui mesure les titres coupés dans un navigateur. Remplacés le 20 novembre 2026 pour les rubriques et la page d’accueil.
- Nettoyage : fait le 20 novembre 2026 pour les fichiers morts et les avertissements de lint (voir « Nettoyage des fichiers morts » ci-dessous) ; restent les sauvegardes `dev.before-*.db` qui s’accumulent à la racine.
- Configuration des sources dans la base, règles par site dans le code : un fichier de définition des sources, versionné, rendrait tout reproductible.
- Collecte : 948 observations sans date, 2 sources en erreur 403 (Andorra Business, Encamp), aucune alerte quand une source tombe.

#### Exploitation et sécurité

- Les interrupteurs `AI_*` se modifient en éditant `.env` à la main, ce qui est risqué (le jour de l’essai l’a montré) : une page d’administration ou un petit script.
- Aucun suivi du coût par article (2 à 4 appels OpenAI) ni plafond de dépense. Plafond sur 24 heures et enregistrement des jetons de chaque appel : fait le 20 novembre 2026 (voir « Suivi des jetons et plafond de dépense OpenAI » ci-dessous) ; consommation affichée sur la page de l’orchestrateur ; reste le coût par article.
- Mise en production non préparée : hébergement, choix de la base (SQLite ou base serveur), sauvegardes automatiques, effacement des articles de chantier.

#### Méthode de travail

- Le guide dépasse 1 000 lignes et mélange journal, décisions et état actuel : le découper en une page « état actuel » lisible en 2 minutes, un journal des décisions et une procédure pour les manipulations sensibles (essai, sauvegarde, `.env`).
- Une PR de documentation séparée après chaque écriture en base demande beaucoup de validations : regrouper la documentation avec le changement, ou par fin de journée.

#### Priorités retenues, dans l’ordre

1. Avis d’avocat maintenant (questions préparées le 19 novembre 2026) ; pas de limitation aux sources institutionnelles pendant le chantier, décision de l’utilisateur.
2. Relecture humaine des brouillons 494 à 503, puis jeu de référence.
3. Contrôle automatique de fidélité : chiffres, noms et dates de l’article présents dans la liste de faits (fait, voir « Contrôle de fidélité aux faits »).
4. Images.
5. Préparation de la mise en production : interrupteurs sans `.env`, coûts, hébergement, sauvegardes.

### Nettoyage des fichiers morts (20 novembre 2026)

Vingt fichiers que plus rien n’utilisait ont été supprimés ; Git garde leur historique :

- copies de sauvegarde de la page d’accueil : `HomePageEditorial.fusion.tsx`, `HomePageEditorial.apres-fusion.tsx`, `HomePageEditorial.apres-recherche.tsx` ;
- anciennes versions du site public : `CategoryPage.tsx`, `CategoryPageDB.tsx`, `CategoryPageDB-v2.tsx`, `HomePageDB.tsx`, `Navbar.tsx` ;
- ancien éditeur d’articles, remplacé par le Studio V4 : `components/admin/article/ArticleEditor.tsx`, `ArticleContent.tsx`, `actions/articles.ts`, `components/admin/media/MediaUploader.tsx` ;
- modules abandonnés : `lib/utils.js` (doublon de `lib/utils.ts`, que Next lit en priorité), `lib/media/index.ts`, `image.ts`, `metadata.ts`, `lib/editorial/assign.ts`, `lib/analytics/score.ts`, et `lib/publications.ts` avec son test (calcul de l’ancienne page d’accueil, appelé seulement par ce test).

Garde-fou : `lib/orphanModules.test.ts` suit les imports depuis les pages et routes de `app/`, les scripts, les fichiers de configuration et les tests. Il échoue si un module n’est importé par rien, ou seulement par des tests hors des exceptions listées avec leur raison (`lib/editorial/testUtils.ts`, `lib/source-engine/backfillObservationDates.ts`).

Lint : les trois variables inutilisées restantes sont corrigées. Restent 4 avertissements `<img>`, qui relèvent du lot images.

### Cartes partagées des rubriques (20 novembre 2026)

Les 10 pages de rubrique recopiaient les mêmes cartes, et les copies avaient dérivé : une trentaine de styles de titre pour 7 rôles, d’anciennes unes à hauteur fixe à côté des nouvelles. Elles sont harmonisées :

- `components/rubric/RubricCards.tsx` définit une seule fois chaque rôle : une de rubrique, article principal, brève, carte sans image, carte avec image (large ou latérale), « Question à… », « Bon à savoir », ainsi que le squelette de page, les grilles et le bouton partenaire. Les titres sont limités en lignes, jamais par une hauteur fixe ; l’appel à lire est aligné en bas des cartes d’une même rangée ;
- `components/rubric/NewsRubricPage.tsx` porte le plan commun à Économie, Politique, Société et International, qui ne gardent que leur catégorie et leur partenaire ;
- `lib/rubric/allocateRubricSlots.ts` répartit les articles dans les emplacements, dans l’ordre et sans trou. Correctif au passage : Économie, Politique, Société et International sautaient les 13ᵉ et 14ᵉ articles ; International, Politique et Société affichent désormais un article de plus avec la base de chantier ;
- seule la carte principale lit une vidéo ; « Question à… » et les cartes latérales n’intègrent plus de lecteur dans une carte cliquable.

Tests : les 10 tests qui vérifiaient des chaînes de classes CSS sont remplacés par des tests de rendu des cartes (`RubricCards.test.tsx`) et un garde-fou (`rubricPages.test.ts`) qui refuse toute carte recopiée dans une page et tout article sauté.

Vérification dans un navigateur, sur une copie de `./dev.db`, aux largeurs 375, 768, 1024, 1280 et 1440 sur les 10 rubriques : aucun titre de 70 caractères coupé, aucun débordement horizontal, colonne latérale contenue dans la page.

### Page d’accueil : calcul séparé de l’affichage (20 novembre 2026)

- `lib/editorial/composeHomePage.ts` calcule la composition (zones placées prioritaires, complément par les derniers articles, Grand format vide pendant une composition automatique sans placement) ; `components/home/HomePageView.tsx` l’affiche ; `HomePageEditorial.tsx` ne fait plus que charger les données.
- Correctif : la Sélection n’affichait que les cartes 2 à 5, alors que l’automatisation en place 5 (`HOME_VISIBLE_ZONE_CAPACITIES`). La première carte, la mieux classée, restait invisible. Le nombre d’emplacements affichés suit désormais les capacités de l’automatisation.
- Les blocs n’ont plus de hauteur fixe qui coupait leur contenu ; le lecteur vidéo de l’édito n’est plus enfermé dans un lien.
- La publicité du briefing, intégrée au code en base64 (51 Ko, envoyée deux fois par page), est un fichier : `public/images/home/briefing-andorra-360.jpg`. La page d’accueil passe de 171 Ko à 76 Ko de HTML.
- `lib/media/videoEmbed.ts` remplace trois copies de la conversion des adresses vidéo et n’accepte plus un domaine qui imite seulement YouTube, Vimeo, Facebook ou TikTok.
- Vérification dans un navigateur, sur une copie de `./dev.db` : aucun des 15 titres coupé à 375, 768, 1024, 1280 et 1440, aucun débordement ; 15 articles affichés contre 14 avant.

### Images, étape 1 : relevé à la collecte (20 novembre 2026)

Décision de l’utilisateur : deux pistes. Une banque d’images classée par rubrique, utilisable en production ; et, pour les essais du chantier seulement, la photo de la source avec son crédit, derrière un réglage par source fermé par défaut et un garde-fou qui interdira la publication. Les images générées par IA sont écartées pour l’information.

État de départ : chaque brouillon reçoit `/images/global/hero.jpg` ; la collecte n’enregistrait aucune image ; 13 des 41 sources affichent des droits réservés, aucune une licence libre.

Étape 1, sans effet sur l’affichage :

- `Observation.imageUrl` et `Observation.imageRights` (migration `20261120150000_add_observation_image`) ;
- `lib/source-engine/articleImage.ts` relève l’image de partage de l’article (Open Graph, Twitter, JSON-LD, `image_src`) ou du flux RSS (`enclosure`, `media:content`, `media:thumbnail`), écarte les logos, icônes, images par défaut et SVG, et relève la mention de droits du site ;
- une nouvelle collecte qui ne trouve pas d’image n’efface jamais celle déjà connue.

Essai à blanc sur la dernière page de chaque source active, sans écriture : 20 sources sur 41 fournissent une photo propre à l’article, 23 une mention de droits. Les autres n’en déclarent pas, ou n’ont pas répondu (Govern, Consell General, Encamp, Andorra Business).

Migration appliquée à `./dev.db` le 20 novembre 2026 après sauvegarde vérifiée (`dev.before-observation-image-20261120-141756.db`, intégrité `ok`, 2 141 observations conservées).

### Images, étape 2 : photo de la source dans les brouillons (20 novembre 2026)

- `Source.imageReuse` : `NONE` (défaut, aucune reprise), `TESTS` (essais du chantier) ou `ALLOWED` (licence ou accord). Migration `20261120160000_add_source_image_reuse`, par ajout de colonnes seulement ;
- `lib/media/importSourceImage.ts` télécharge la photo relevée (JPEG, PNG ou WebP, 10 Mo au plus, 480 pixels de large au moins), la range dans `storage/media/sources/` (hors Git) et crée un média avec le nom de la source pour crédit, la mention de droits relevée, l’adresse d’origine et `testOnly` pour une source en `TESTS`. Une photo déjà importée depuis la même adresse est réutilisée. Le serveur ne télécharge jamais une adresse locale ou du réseau interne. Un échec laisse l’image générique, sans bloquer l’article ;
- `createArticleFromObservation` reprend la photo après les contrôles bloquants, la rattache à l’article (`MediaUsage`) et consigne la reprise dans l’audit ;
- garde-fou (`lib/media/sourceImagePolicy.ts`) : la publication est refusée, dans le Studio comme en publication automatique, tant que l’image est réservée aux essais ;
- page publique : crédit « Photo : … » (« Foto: … » en catalan et en espagnol) sous l’image, lu dans la médiathèque.

Essai sur une copie de `./dev.db`, sans OpenAI : collecte réelle d’Altaveu, RTVA et Policia d’Andorra passées en `TESTS`, puis un brouillon par source avec un générateur neutre. Les trois brouillons ont reçu la photo de leur article, avec crédit et mention de droits, et la publication a été refusée pour chacun. Copie et fichiers d’essai supprimés ensuite.

Migration appliquée à `./dev.db` le 20 novembre 2026 après sauvegarde vérifiée (`dev.before-source-image-reuse-20261120-143050.db`). Le même jour, avec l’accord de l’utilisateur et après sauvegarde (`dev.before-source-image-tests-20261120-143238.db`), les 20 sources qui fournissent une photo d’article sont passées en `TESTS` (21 lignes : Diari d’Andorra a deux entrées, site et flux RSS) : Acció, Agenda.ad, Altaveu, Andorra Ara, Andorra Recerca + Innovació, BC MoraBanc Andorra, Bondia, Cambra de Comerç, Comitè Olímpic Andorrà, Comú d’Escaldes-Engordany, Concòrdia, Creu Roja Andorrana, Diari d’Andorra, El Periòdic d’Andorra, FC Andorra, Federació Andorrana de Ciclisme, La Veu Lliure, OMS Europe, Policia d’Andorra et RTVA. Les 42 autres restent en `NONE`. La question de la reprise des photos figure dans les questions à l’avocat (question 20).

### Images, étape 3 : banque d’images par rubrique (20 novembre 2026)

- `Media.bankCategory` (migration `20261120170000_add_media_bank_category`) : la rubrique qu’une image de la médiathèque peut illustrer, `ALL` pour toutes, vide hors banque. Réglage dans la médiathèque (« Banque d’images ») ; une photo de source réservée aux essais ou une vidéo est refusée ;
- ordre de choix à la création d’un brouillon : photo de la source si son réglage le permet, sinon image de la banque de la rubrique, sinon image valable pour toutes, sinon image générique ;
- rotation (`lib/media/bankImage.ts`) : l’image la moins utilisée par des articles, puis la plus anciennement utilisée ;
- essai sur une copie de `./dev.db` avec deux images rangées en Sports, l’une déjà utilisée 3 fois : six brouillons ont reçu 12, 12, 12, 14, 12, 14, la moins utilisée rattrapant son retard puis les deux alternant.

La banque est vide tant que personne n’y range d’image : elle attend des photos qui appartiennent à ANDORRE 360 ou sous licence, avec leur crédit.

### Suivi des jetons et plafond de dépense OpenAI (20 novembre 2026)

- chaque appel réel à OpenAI est enregistré dans la table `AiUsage` (migration `20261120180000_add_ai_usage`) : date, modèle, nature de l’appel (`article_fact_sheet`, `article_from_facts`, `article_title`, `article_translation`, `home_candidate_assessment`), jetons d’entrée et de sortie ;
- avant chaque appel, les jetons consommés sur les 24 dernières heures sont comparés au plafond `AI_DAILY_TOKEN_LIMIT` ; une fois le plafond atteint, l’appel est refusé sans contacter OpenAI (`lib/ai/aiUsageBudget.ts`) ;
- sans variable, ou avec une valeur invalide, le plafond est de 500 000 jetons ; `0` interdit tout appel. Le plafond est exprimé en jetons et non en euros, car le prix dépend du modèle : le montant exact se lit toujours dans le tableau de bord OpenAI ;
- le dernier appel peut dépasser légèrement le plafond, sa taille n’étant connue qu’après coup ;
- l’orchestrateur ne lance rien si le plafond est déjà atteint (garde-fou « Plafond de dépense OpenAI atteint ») et s’arrête avant l’observation suivante s’il est atteint en cours de lot (statut « Arrêtée par un garde-fou ») ; l’aperçu l’affiche parmi les garde-fous fermés ;
- la protection couvre la rédaction, les traductions et l’évaluation de la page d’accueil : tous passent par les deux clients OpenAI du projet.

Affichage (20 novembre 2026) : la page de l’orchestrateur (`/admin/diffusion/orchestrateur`) montre en tête une carte « Consommation OpenAI » : jetons des 24 dernières heures face au plafond, avec une jauge et un avertissement quand le plafond est atteint, détail par type d’appel, et les 7 derniers jours découpés à l’heure d’Andorre (`lib/ai/summarizeAiUsage.ts`). Vérifiée dans le navigateur, sur ordinateur et sur téléphone. Le même jour, le choix « Banque d’images » de la médiathèque a été vu dans le navigateur.

Reste à faire : rattacher chaque appel à son article, pour connaître le coût d’un article.

### Mise en page indépendante de la longueur des textes (20 novembre 2026)

Règle demandée par l’utilisateur : les blocs et les photos ne doivent pas bouger selon le nombre de lignes du titre ou du chapô d’un article.

Mesure dans le navigateur, avant correction, sur l’accueil, les 13 rubriques et le Fil info : chaque titre et chaque chapô a été remplacé par un texte très court, puis très long, et la position et la taille de chaque carte et de chaque photo ont été comparées. Presque toutes les cartes grandissaient ou rétrécissaient, et dans les rubriques les photos des cartes étirées changeaient de taille.

Correctif :

- chaque texte limité à N lignes (`line-clamp-N`) réserve aussi N lignes (`min-h-[Nlh]`), à chaque largeur d’écran ;
- un chapô absent garde sa place, et une photo absente de l’accueil est remplacée par l’image générique ;
- au Fil info, les titres n’étaient plus coupés en plein milieu d’une ligne par une hauteur fixe (`overflow-hidden`) : ils sont désormais limités en lignes, avec des points de suspension ; les titres et chapôs qui n’avaient aucune limite en ont reçu une ;
- `components/testing/reservedLines.ts` vérifie la règle dans les tests des cartes de rubrique, de l’accueil et du Fil info.

Mesure après correction, à 1 280, 768 et 375 pixels de large : tout reste en place sur toutes les pages. Seul l’encadré fixe « Trafic et état des routes » de Loisirs et Lifestyle, dont le texte est écrit dans le code et ne vient d’aucun article, n’est pas concerné.

### Page d’accueil : blocs figés et colonnes alignées en bas (21 novembre 2026)

Après la correction précédente, l’utilisateur a jugé la une déstructurée. Deux défauts étaient visibles. Le chapô du grand format s’arrêtait après 6 lignes à côté d’une grande photo. La colonne de droite finissait environ 340 px plus bas que la colonne principale ; l’écart existait déjà, la correction précédente l’avait augmenté de 55 px.

Règle de l’utilisateur : les blocs ne bougent pas, tous finissent alignés en bas de page, et une fois alignés chacun garde une hauteur figée.

- Sur grand écran (`xl`, 1 280 px et plus), la page est limitée à 1 280 px de large et chaque bloc a donc toujours la même largeur. Chaque bloc y reçoit une hauteur fixe (`HOME_XL_BLOCK_HEIGHTS` dans `components/home/HomePageView.tsx`), mesurée dans le navigateur :
  - à gauche : grande carte 825 px, L’essentiel et Grand format 971 px, publicité 531 px ;
  - à droite : Édito 628 px, Sélection 1 177 px, À découvrir 530 px.
- Avec leurs espacements (40 px à gauche, 36 px à droite), les deux colonnes totalisent la même hauteur. Un test vérifie cette égalité.
- Aucun bloc n’est étiré pour combler un écart. La hauteur d’un bloc ne dépend ni des textes ni du nombre d’articles : une Sélection de 3 cartes ou une une sans édito gardent les mêmes hauteurs.
- La photo du grand format occupe la hauteur restante de son bloc. Son chapô peut aller jusqu’à 14 lignes et s’affiche en entier.
- Mesures à 1 280 et 1 440 px : les deux colonnes finissent toutes deux à 3 233 px ; aucun bloc ne déborde ; aucun élément ne bouge avec des textes très courts ou très longs, ni avec deux cartes de moins en Sélection et dans À découvrir.
- Sous 1 280 px, les colonnes sont empilées et les hauteurs fixes ne s’appliquent pas ; la règle des lignes réservées continue de s’appliquer.

Une modification des cartes de l’accueil (police, marges, nombre d’articles par zone) oblige à remesurer ces hauteurs.

Rééquilibrage demandé par l’utilisateur le même jour :
- la photo du grand format est réduite d’un quart (780 → 585 px) ;
- le bloc L’essentiel et grand format est réduit d’autant (971 → 776 px) ;
- la photo de la grande carte est agrandie d’autant (390 → 585 px), et la grande carte passe de 825 à 1 020 px.

Les deux photos ont désormais la même hauteur. Mesure à 1 440 px : les deux colonnes finissent toujours à 3 233 px, sans débordement.

### Pages de rubrique : blocs figés et colonnes alignées en bas (21 novembre 2026)

Même règle que la une, appliquée aux 10 pages de rubrique. Avant ce changement, les colonnes finissaient au même niveau, mais par étirement : si un bloc manquait, la hauteur d’un autre changeait (Politique : grille du bas de 722 à 401 px).

- `RubricPage` reçoit désormais deux listes de blocs (`rubricColumn`). Chaque bloc a une hauteur figée sur grand écran, de 1 280 px et plus. Un bloc sans article reste un cadre vide de la même hauteur ; sur les écrans plus étroits, ce cadre vide est masqué.
- Les hauteurs de chaque page sont regroupées dans `lib/rubric/rubricXlHeights.ts`. Un test vérifie que les deux colonnes de chaque page totalisent la même hauteur, avec leurs espacements de 32 px à gauche et 24 px à droite. Les rubriques d’information n’ont pas la même hauteur avec le lien partenaire (Économie, Société) et sans lui (Politique, International).
- Chaque grille garde son nombre de rangées (`rows`) : une carte manquante laisse sa place vide et les autres cartes ne changent pas de taille.
- Entre 1 024 et 1 280 px, la largeur de la page varie : les colonnes restent alignées par étirement du dernier bloc, comme avant.
- Actualité : une publicité pleine largeur prend désormais la place des deux cartes du bas, dans le même bloc figé, au lieu de s’ajouter à la colonne. Aucune publicité n’était active le 21 novembre 2026.

Mesures à 1 280 et 1 440 px, sur les 10 pages :
- les deux colonnes finissent au même pixel ;
- chaque bloc a sa hauteur déclarée et aucun ne déborde ;
- les blocs et les cartes gardent leur taille quand on retire des cartes ;
- rien ne bouge avec des textes très courts ou très longs.

À 1 024 px, les colonnes restent alignées. À 375 px, les colonnes sont empilées et aucun cadre vide n’apparaît.


### Fil info : date dans chaque ligne et rangées figées (21 novembre 2026)

Choix de l’utilisateur : la date figure dans chaque ligne du fil chronologique. Les intertitres de jour sont supprimés, car leur nombre (de 1 à 8) changeait la hauteur du fil.

- **Lignes du fil.** Chaque ligne montre son jour court (« 21 nov. ») au-dessus de l’heure. Elle montre aussi son chapô sur deux lignes, quel que soit le format (auparavant seules les brèves l’affichaient), pour que toutes les lignes aient la même structure. Le titre d’une alerte, en plus gros caractères, est limité à deux lignes.
- **Rangées figées.** Sur grand écran, les deux rangées ont une hauteur figée (`FIL_INFO_XL_ROW_HEIGHTS` dans `lib/fil-info.ts`) :
  - fil et La sélection : 1 810 px ;
  - À suivre et À retenir : 1 205 px.
- **Partage des rangées.** Le fil garde 8 lignes de même hauteur, La sélection 2 cartes, À suivre 2 rangées et À retenir 7 lignes. Une publication manquante laisse sa place vide. Les photos de La sélection remplissent leur carte.
- **La sélection** reste en place même sans article.
- **Pages traduites.** `/ca/fil-info` et `/es/fil-info` reçoivent aussi la date dans chaque ligne, sans hauteur figée : le fil y est seul, sur toute la largeur.

Mesures à 1 280 et 1 440 px :
- les deux colonnes de chaque rangée finissent au même pixel ;
- toutes les lignes du fil mesurent 207 px ;
- rien ne déborde, et rien ne bouge avec des textes très courts ou très longs, ni avec deux publications de moins.

À 1 024 px, les colonnes restent alignées. À 375 px, les colonnes sont empilées et la page n’a pas de défilement horizontal.

---
