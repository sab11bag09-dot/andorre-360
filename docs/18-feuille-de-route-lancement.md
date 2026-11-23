# ANDORRE 360 — Feuille de route jusqu’au lancement

**Établie le 22 novembre 2026**, après l’audit du 21 novembre et la reprise des pages.

Principe : **la qualité du contenu d’abord, l’automatisation ensuite, la forme en dernier.**
La fondation technique est solide ; ce qui manque, c’est la preuve que le contenu
automatique est bon, légal et assez abondant.

Règles qui s’appliquent à toutes les étapes :

- tout doit finir automatisé, sans réglage manuel article par article ;
- chaque article publié existe en français, en catalan et en espagnol ;
- toute dépense OpenAI est annoncée et acceptée avant d’être engagée ;
- toute écriture dans la base est précédée d’une sauvegarde vérifiée ;
- les fusions se font avec l’accord de l’utilisateur.

---

## Où en est-on ?

**Acquis**

- Collecte de 39 sources actives, dates fiabilisées, sources en panne signalées dans l’administration.
- Rédaction de brouillons par l’IA (orchestrateur), traductions catalane et espagnole, plafond de dépense quotidien.
- Verrou : aucun article publié sans ses trois langues.
- Mise en page figée et vérifiée automatiquement dans un navigateur, à chaque modification.
- Sécurité de base : en-têtes, limite des tentatives de connexion, IA coupée par défaut.

**Pas encore prouvé**

- La chaîne complète n’a jamais tourné en réel : source → article → traductions → publication → page.
- La qualité d’un article publié sans relecture n’est pas mesurée.
- Le volume d’articles par rubrique et par jour n’est pas connu.

**Constats**

- 143 des 300 articles publiés n’ont pas de traduction, et beaucoup sont des textes d’essai.
  Ce sont des données de chantier, effacées au lancement.
- International, Culture et Loisirs n’ont aucune source propre.
  Loisirs reprend la Montagne ; les deux autres resteront vides en automatique.
- La banque d’images par rubrique est vide : la même photo générique revient partout.
- La collecte ne lit pas les `robots.txt` des sites, ni leurs règles d’usage par l’IA.

---

## Étape 1 — Prouver la qualité éditoriale

**Objectif** : savoir, chiffres à l’appui, si un article de l’IA peut être publié sans relecture.

Travaux :

1. **Jeu de référence** : une trentaine d’observations réelles, réparties par rubrique et par type de source.
   Pour chacune, on indique ce qu’un bon article doit dire, selon les cinq questions
   du journalisme (qui ou quoi ? où ? quand ? comment ? et, si la source le dit, pourquoi ?),
   et les erreurs qu’il ne doit pas commettre.
2. **Note de qualité automatique de chaque brouillon** :
   - fidélité aux faits de la source (déjà en partie en place) ;
   - lisibilité et longueur ;
   - titre et chapô ;
   - source citée ;
   - absence de reprise mot pour mot.
3. **Tableau de résultats dans l’administration** : note moyenne, brouillons refusés et pourquoi.

État au 23 novembre 2026 : la note (2) et le tableau (3) sont en place dans *Administration → Qualité*.
La note compte un critère « Qui, où, quand », contrôlé sur chaque article sans annotation :
le début de l’article nomme un acteur, l’article cite un lieu de la source et la date dès
que la source en donne une. Le jeu de référence (1) se compose automatiquement dans
*Qualité → Jeu de référence* : 30 observations récentes réparties entre rubriques et types
de source. Les 30 sont annotées question par question (préparées par Claude, l’utilisateur
ne lisant pas le catalan, et relues par l’utilisateur), puis contrôlées contre l’article de
l’IA qui en est tiré.

Premier passage complet, le 23 novembre 2026 : 27 brouillons générés pour 0,36 dollar
(53 appels à `gpt-5.6-terra`, sans les traductions). 28 observations ont un article ;
21 sont conformes (75 %), loin des 9 sur 10 visés. Deux observations restent sans article :
une reprise trop proche de la source, une source trop longue (plus de 40 faits).
Défaut le plus fréquent : l’article omet une personne que la source ne cite qu’entre
guillemets, la consigne interdisant les citations.

| | |
|---|---|
| **Décision de l’utilisateur** | Choisir et annoter le jeu de référence. Accepter le coût de génération de ces brouillons, annoncé avant. |
| **Critère de sortie** | Au moins 9 brouillons sur 10 jugés publiables en l’état sur le jeu de référence. |
| **Coût OpenAI** | Une génération par observation du jeu, plus deux traductions si on teste aussi le catalan et l’espagnol. Chiffré avant lancement à partir des jetons mesurés. |

## Étape 2 — Cadre juridique et sources

**Objectif** : ne publier que ce qu’on a le droit de reprendre, avec les bonnes mentions.

Travaux :

1. **Avis de l’avocat** sur trois questions :
   - la reprise des communiqués institutionnels et des articles de médias ;
   - la mention de la source ;
   - le droit des photos.
2. **Respect automatique des refus des sites** : lecture du `robots.txt` et des règles d’usage par l’IA (`Content-Signal`). Une source qui refuse est écartée ou limitée à une simple mention.
3. **Mention « D’après… »** sur chaque article, avec lien vers la source, en trois langues.
4. **Sources par rubrique** : trouver des sources pour International, Culture et Loisirs, ou décider de les regrouper. Retirer des sources les médias concurrents si l’avocat le demande.

| | |
|---|---|
| **Décision de l’utilisateur** | Réponses de l’avocat, liste des sources autorisées, sort des rubriques sans source. |
| **Critère de sortie** | Chaque source active a un statut juridique clair, et la collecte respecte automatiquement les refus. |
| **Coût OpenAI** | Aucun. |

## Étape 3 — Pilote réel de bout en bout

**Objectif** : faire tourner toute la chaîne une semaine, en conditions réelles, sur peu de sources.

Travaux :

1. **Périmètre** : 5 à 10 sources officielles (Govern, Consell General, comuns, Policia…), validées à l’étape 2.
2. **Chaîne complète** : collecte, brouillon, note de qualité, traductions, publication des trois langues.
   La publication se fait sur un **clic de validation** de l’utilisateur, le temps du pilote.
3. **Mesures quotidiennes** :
   - articles produits par rubrique ;
   - articles publiables sans retouche ;
   - erreurs factuelles ;
   - coût par article ;
   - temps entre la publication de la source et celle du site.

| | |
|---|---|
| **Décision de l’utilisateur** | Allumer l’orchestrateur et les traductions pour la durée du pilote, avec un budget annoncé et un plafond. |
| **Critère de sortie** | Une semaine sans incident, coût par article connu et accepté, qualité conforme à l’étape 1. |
| **Coût OpenAI** | Trois appels par article (rédaction, catalan, espagnol). Estimation donnée avant le démarrage, sous le plafond quotidien. |

## Étape 4 — Assez de contenu, et des images

**Objectif** : des pages pleines et un site qui n’a pas l’air « automatique ».

Travaux :

1. **Volume par rubrique**, à partir des mesures du pilote. Pour une rubrique trop pauvre : regroupement, ajout de sources, ou zones qui se replient au lieu de rester des cadres vides (gabarit commun, jamais réglé à la main).
2. **Banque d’images par rubrique** : photos libres de droits ou achetées, choisies automatiquement selon la rubrique et le sujet ; photo de la source quand elle est autorisée.
3. **Composition de la une** : vérifier que le choix par ordre de publication donne une une équilibrée, sinon préparer la composition par l’IA.

| | |
|---|---|
| **Décision de l’utilisateur** | Liste des rubriques au lancement, origine et budget des images. |
| **Critère de sortie** | Chaque rubrique a de nouveaux articles au moins tous les deux jours, et aucune photo générique sur la une. |
| **Coût OpenAI** | Aucun, sauf si la composition de la une par l’IA est retenue. |

## Étape 5 — Mise en production

**Objectif** : un site en ligne, sauvegardé et surveillé.

Travaux :

1. **Hébergement**, choisi après les réponses de l’avocat. `AUTH_URL`, `AUTH_SECRET` et les interrupteurs de l’IA sont réglés sur le serveur.
2. **Sauvegardes automatiques** de la base, datées et vérifiées, conservées hors du serveur, avec un essai de restauration.
3. **Surveillance et alertes** : erreurs du site, collecte en panne, plafond OpenAI atteint, publication bloquée.
4. **Base de lancement** : effacement des données de chantier, puis départ avec les seuls articles du pilote et les sources validées.
5. **Contrôles finaux** : référencement (plan du site, balises par langue), mentions légales, politique de confidentialité, test complet sur le serveur.

| | |
|---|---|
| **Décision de l’utilisateur** | Hébergeur et budget, date de lancement, textes légaux. |
| **Critère de sortie** | Site en ligne, restauration d’une sauvegarde réussie, alertes reçues lors d’un essai de panne. |
| **Coût OpenAI** | Celui du fonctionnement normal, sous le plafond. |

## Étape 6 — Automatisation complète, par paliers

**Objectif** : retirer la validation humaine, source par source, quand les chiffres le permettent.

Travaux :

1. **Publication automatique** : allumée d’abord pour les sources officielles les mieux notées, puis élargie.
2. **Composition de la une par l’IA**, si l’étape 4 l’a retenue.
3. **Suivi hebdomadaire** : qualité, coût, volume, et corrections automatiques des sources qui dérivent.

| | |
|---|---|
| **Décision de l’utilisateur** | Chaque palier d’automatisation. |
| **Critère de sortie** | Le site se remplit seul en trois langues, avec une qualité et un coût stables pendant un mois. |
| **Coût OpenAI** | Fonctionnement normal, annoncé à chaque palier. |

---

## Ce qu’on ne fait pas maintenant

- Retoucher la mise en page des pages : elle est figée et testée.
- Payer la traduction des 143 articles de chantier.
- Ajouter des réglages manuels par article.
- Élargir les sources avant l’avis de l’avocat.

## Ordre et dépendances

```
Étape 1 (qualité) ──┐
                    ├─> Étape 3 (pilote) ─> Étape 4 (contenu, images) ─> Étape 5 (production) ─> Étape 6 (automatisation)
Étape 2 (juridique)─┘
```

Les étapes 1 et 2 avancent en parallèle : la première dépend surtout du jeu de
référence, la seconde des réponses de l’avocat.
