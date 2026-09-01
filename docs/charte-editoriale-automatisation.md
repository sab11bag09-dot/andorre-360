# Charte éditoriale et règles d’automatisation

- Version : `2026-09-01.v1`
- Statut : proposition de référence
- Projet : ANDORRE 360
- Portée : collecte, création, traduction, publication et placement éditorial

## 1. Objet

Cette charte définit les règles applicables :

- aux journalistes et administrateurs ;
- aux sources automatiques ;
- aux générateurs utilisant l’intelligence artificielle ;
- au moteur de publication ;
- au moteur de composition des pages publiques.

L’automatisation doit assister ou reproduire une décision éditoriale explicable. Elle ne peut pas contourner les règles de qualité, de sécurité, de pluralisme ou de contrôle humain.

## 2. Principes fondamentaux

Toute publication doit respecter les principes suivants :

1. exactitude des informations ;
2. traçabilité de la source ;
3. distinction entre information, opinion, communication et publicité ;
4. priorité aux sujets concernant directement l’Andorre ;
5. absence de doublons ;
6. catégorie éditoriale canonique ;
7. disponibilité en français, catalan et espagnol ;
8. possibilité de correction, de retrait ou de verrouillage humain ;
9. journalisation des décisions automatiques ;
10. conservation de la dernière configuration valide en cas d’échec.

## 3. Langues

### 3.1 Version principale

L’article principal enregistré dans `Article` constitue la version française.

### 3.2 Traductions obligatoires

Tout article public doit disposer de traductions publiées pour :

- `CA` : catalan ;
- `ES` : espagnol.

Un article ne peut pas devenir public si une de ces traductions est absente, incomplète ou non publiée.

### 3.3 Échec de traduction

En cas d’échec :

- l’article reste en brouillon ;
- aucune version linguistique ne devient publiquement accessible ;
- l’erreur est journalisée ;
- une nouvelle tentative ou une intervention humaine reste possible.

## 4. Catégories canoniques

Les catégories publiques autorisées sont :

- `ACTUALITÉ`
- `ÉCONOMIE`
- `SOCIÉTÉ`
- `CULTURE`
- `SPORTS`
- `MONTAGNE`
- `POLITIQUE`
- `ILS_EN_PARLENT`
- `LOISIRS`
- `INTERNATIONAL`
- `ÉDITORIAL`

Les anciennes valeurs telles que `IMMOBILIER`, `LIFESTYLE`, `PRESSE`, `GOUVERNEMENT`, `GÉNÉRAL` ou `INSTITUTIONS POLITIQUES` ne doivent pas être produites par le nouveau pipeline.

Elles peuvent rester temporairement reconnues pour assurer la compatibilité avec l’historique du projet.

## 5. Distinction entre catégorie et type de source

La catégorie décrit le sujet de l’article et non la nature de la source.

Exemples :

- un article de presse sur l’économie relève de `ÉCONOMIE`, pas de `PRESSE` ;
- une annonce de la Police relève généralement de `SOCIÉTÉ` ;
- une information de l’AFA relève généralement de `ÉCONOMIE` ;
- une décision du Gouvernement peut relever de `POLITIQUE`, `SOCIÉTÉ` ou `ÉCONOMIE` selon son sujet ;
- un communiqué provenant directement d’un parti relève de `ILS_EN_PARLENT`.

## 6. Niveaux d’automatisation

Chaque décision appartient à l’un des modes suivants :

### 6.1 Manuel

La rédaction choisit et valide le contenu et son emplacement.

### 6.2 Assisté

L’IA propose une catégorie, une publication ou une composition. Un humain valide avant mise en ligne.

### 6.3 Automatique

Le système publie sans validation préalable uniquement si toutes les règles déterministes et éditoriales sont satisfaites.

### 6.4 Simulation

Le système calcule une décision et l’enregistre sans modifier les pages publiques.

La mise en service d’une nouvelle automatisation doit commencer en mode simulation.

## 7. Conditions générales de publication automatique

Un article est admissible à la publication automatique uniquement si :

- la source est explicitement autorisée ;
- son mode est `AUTO` ;
- son niveau de confiance est `HIGH` ou `OFFICIAL` ;
- son URL et celle de l’observation utilisent HTTPS ;
- l’observation provient de la même origine que la source ;
- le titre est suffisamment descriptif ;
- le contenu est suffisamment complet ;
- la date de l’information est cohérente ;
- aucun doublon n’est détecté ;
- aucun signal contradictoire n’est identifié ;
- la catégorie est canonique ;
- les versions française, catalane et espagnole sont prêtes ;
- l’arrêt d’urgence est désactivé ;
- les fonctionnalités automatiques nécessaires sont activées.

En cas d’échec d’une règle, l’article reste en attente de révision humaine.

## 8. Fraîcheur des contenus

Les limites indicatives sont :

| Type d’information | Fraîcheur recommandée |
|---|---:|
| Urgence, sécurité, circulation, météo | 6 heures |
| Actualité générale | 24 à 48 heures |
| Résultat sportif | 24 heures |
| Annonce institutionnelle | 72 heures |
| Agenda et événement | Jusqu’à la fin de l’événement |
| Analyse ou grand format | Selon la pertinence éditoriale |
| Contenu pratique durable | Sans limite stricte |

Une information dépassée ne doit pas être présentée comme récente.

## 9. Règles de la page d’accueil

### 9.1 Mission

La page d’accueil hiérarchise les informations les plus importantes, utiles et représentatives du moment.

Elle peut être composée automatiquement par l’IA, dans le respect des règles de cette charte.

### 9.2 Priorité des décisions

L’ordre de priorité est :

1. sélection humaine verrouillée ;
2. sélection IA validée ;
3. remplissage chronologique de secours.

Une décision automatique ne peut pas remplacer une sélection humaine encore active.

### 9.3 Conditions d’admission à l’accueil

Un article candidat doit :

- être public dans les trois langues ;
- posséder une image exploitable ;
- respecter les critères de fiabilité ;
- ne pas être dupliqué dans une autre zone ;
- ne pas appartenir à `ILS_EN_PARLENT` ;
- ne pas être une publicité déguisée ;
- ne pas être archivé ou périmé.

### 9.4 Zones

#### Hero

Le `hero` est réservé au sujet principal du moment.

Conditions recommandées :

- score minimal : 85/100 ;
- forte importance pour l’Andorre ;
- source fiable ;
- publication récente ;
- image de qualité ;
- absence de caractère promotionnel ;
- absence de signal contradictoire.

#### Feature

Le `feature` accueille un deuxième sujet important ou explicatif.

Score minimal recommandé : 75/100.

#### Secondary

Les zones secondaires complètent le sujet principal et assurent la diversité thématique.

Score minimal recommandé : 68/100.

#### Card

Les cartes présentent les principales informations des différentes rubriques.

Score minimal recommandé : 60/100.

#### Brief

Les brèves accueillent des informations courtes, récentes et factuelles.

Score minimal recommandé : 55/100.

#### Grand format

Le grand format est réservé à un contenu long, approfondi et durable.

Il ne doit pas être attribué sur la seule base de la récence.

#### Question

La zone question accueille un sujet nécessitant une explication accessible.

#### Bon à savoir

Cette zone accueille une information pratique ayant un effet direct sur la vie des habitants.

#### Discover

Cette zone valorise notamment :

- culture ;
- loisirs ;
- montagne ;
- patrimoine ;
- contenus durables.

#### Éditorial

La zone éditoriale est réservée à une décision humaine.

### 9.5 Stabilité

Pour éviter une page instable :

- le `hero` doit rester en place au moins 2 heures, sauf urgence ;
- il peut être remplacé après 12 heures si un meilleur candidat existe ;
- les autres zones importantes restent stables au moins 1 heure ;
- une nouvelle collecte ne doit pas provoquer une recomposition inutile ;
- la dernière composition valide est conservée en cas d’erreur.

### 9.6 Diversité

La composition doit respecter :

- un seul emplacement par article ;
- maximum deux articles d’une même catégorie dans les zones principales ;
- maximum un article d’une même source parmi `hero`, `feature` et `secondary` ;
- diversité des rubriques lorsque les candidats le permettent ;
- absence de succession de sujets presque identiques ;
- absence de surreprésentation d’une institution, d’un parti ou d’un club.

## 10. Score de sélection pour l’accueil

Le score indicatif est calculé sur 100 :

| Critère | Maximum |
|---|---:|
| Importance pour l’Andorre | 25 |
| Fraîcheur | 20 |
| Fiabilité de la source | 15 |
| Impact concret sur la population | 15 |
| Qualité et complétude | 10 |
| Intérêt visuel | 5 |
| Originalité par rapport aux autres candidats | 5 |
| Potentiel explicatif ou pratique | 5 |

Les exclusions déterministes restent prioritaires sur le score.

Un score élevé ne permet jamais de contourner une règle d’interdiction.

## 11. Page Actualité

### Mission

Présenter les informations générales et transversales récentes.

### Inclut

- actualité nationale ;
- événements importants ;
- informations générales ne relevant pas exclusivement d’une autre rubrique ;
- sujets ayant plusieurs dimensions.

### Exclut

- communiqués directs des partis ;
- publicité ;
- doublons d’une information déjà publiée ;
- contenus trop spécialisés lorsqu’une rubrique précise existe.

### Automatisation

Automatique après validation des règles générales.

## 12. Page Économie

### Mission

Couvrir l’activité économique et financière de l’Andorre.

### Inclut

- entreprises ;
- emploi ;
- salaires ;
- fiscalité ;
- commerce ;
- banques et finance ;
- innovation ;
- énergie sous son angle économique ;
- investissements ;
- conjoncture.

### Exclut

- promotion commerciale sans intérêt éditorial ;
- publicité non identifiée ;
- annonces d’entreprise sans conséquence notable.

### Automatisation

Automatique, avec détection renforcée des contenus promotionnels.

## 13. Page Société

### Mission

Couvrir la vie quotidienne, les services publics et les enjeux sociaux.

### Inclut

- santé ;
- éducation ;
- justice ;
- police et sécurité ;
- logement sous son angle social ;
- solidarité ;
- démographie ;
- services publics ;
- environnement urbain.

### Automatisation

Automatique.

Les alertes urgentes peuvent également alimenter le fil info.

## 14. Page Politique

### Mission

Couvrir les institutions, les décisions publiques et la vie démocratique.

### Inclut

- Gouvernement ;
- Conseil général ;
- lois et règlements ;
- politiques publiques ;
- élections ;
- relations institutionnelles ;
- analyse politique issue de sources journalistiques.

### Règle des partis politiques

Un article journalistique parlant d’un parti peut relever de `POLITIQUE`.

Un contenu provenant directement d’un parti ou mouvement relève de `ILS_EN_PARLENT`.

### Automatisation

Automatique avec attribution stricte de la provenance.

## 15. Page Ils en parlent

### Mission

Présenter séparément les communications directes des partis et mouvements politiques.

### Règles

- source clairement affichée ;
- attribution explicite ;
- ordre principalement chronologique ;
- absence de présentation comme information indépendante de la rédaction ;
- exclusion automatique de la page d’accueil ;
- absence de statut `featured` ;
- conservation du pluralisme lorsque plusieurs organisations publient.

### Automatisation

Automatique pour les sources politiques authentifiées.

## 16. Page International

### Mission

Présenter l’actualité internationale pertinente pour le public andorran.

### Priorités

- Union européenne ;
- France ;
- Espagne ;
- relations diplomatiques ;
- organismes internationaux ;
- événements mondiaux ayant un effet direct ou majeur.

### Exclut

- flux international générique ;
- faits divers étrangers sans pertinence ;
- remplissage automatique sans lien avec le public andorran.

### Automatisation

Automatique mais fortement sélective.

## 17. Page Sports

### Mission

Couvrir le sport andorran et les compétitions pertinentes.

### Inclut

- clubs ;
- fédérations ;
- athlètes ;
- résultats ;
- calendriers ;
- transferts confirmés ;
- compétitions nationales et internationales pertinentes.

### Règles

- priorité aux acteurs andorrans ;
- distinction entre annonce, rumeur et confirmation ;
- un résultat remplace l’annonce d’avant-match lorsqu’il est disponible ;
- limitation de la répétition d’un même club dans les zones principales.

### Automatisation

Automatique.

## 18. Page Montagne

### Mission

Couvrir la montagne comme espace de vie, de sécurité, d’environnement et d’activité.

### Inclut

- météo ;
- sécurité ;
- stations ;
- environnement ;
- mobilité ;
- tourisme ;
- activités ;
- événements en montagne.

### Règles

Les alertes de sécurité sont prioritaires dans le fil info et peuvent remonter temporairement sur l’accueil.

### Automatisation

Automatique.

## 19. Page Culture

### Mission

Valoriser la création, les arts et le patrimoine.

### Inclut

- arts ;
- patrimoine ;
- littérature ;
- spectacles ;
- expositions ;
- création andorrane ;
- événements culturels.

### Exclut

- annonces purement commerciales ;
- contenus sans dimension culturelle identifiable.

### Automatisation

Automatique avec contrôle de la valeur éditoriale.

## 20. Page Loisirs

### Mission

Proposer des contenus pratiques et des idées d’activités.

### Inclut

- agenda ;
- sorties ;
- gastronomie ;
- activités familiales ;
- bien-être ;
- découvertes locales.

### Exclut

- publicité déguisée ;
- promotion sans information utile ;
- contenu sponsorisé non identifié.

### Automatisation

Automatique avec détection promotionnelle.

## 21. Fil info

### Mission

Présenter un flux chronologique d’informations courtes et immédiatement utiles.

### Règles

- ordre chronologique ;
- informations factuelles ;
- aucune opinion ;
- absence de doublons ;
- actualisation en cas d’évolution ;
- priorité aux urgences, perturbations, résultats et annonces immédiates ;
- lien vers l’article complet lorsqu’il existe ;
- possibilité d’épinglage humain temporaire.

### Automatisation

Très automatisée, avec contrôle de fraîcheur et de duplication.

## 22. Page Éditorial

### Mission

Présenter une position, une analyse ou un choix assumé de la rédaction.

### Règles

- décision humaine obligatoire ;
- auteur clairement identifié ;
- distinction visuelle avec l’information ;
- aucune publication autonome par l’IA ;
- l’IA peut assister la correction ou la structuration ;
- l’IA ne choisit ni la position ni la conclusion.

## 23. Page Article

Chaque page article doit afficher ou permettre d’identifier :

- le titre ;
- la date de publication ;
- la date de mise à jour, si nécessaire ;
- l’auteur ou la source ;
- la catégorie ;
- le contenu ;
- les médias ;
- les langues disponibles ;
- la provenance de l’information lorsque cela est pertinent.

Une traduction archivée ou non publiée ne doit pas être accessible publiquement.

## 24. Arbitrage entre plusieurs catégories

Lorsqu’un article touche plusieurs thèmes :

1. identifier son sujet principal ;
2. choisir une seule catégorie canonique ;
3. conserver les thèmes secondaires comme métadonnées éventuelles ;
4. ne pas créer plusieurs copies du même article ;
5. utiliser les publications et placements pour le présenter sur plusieurs espaces si nécessaire.

## 25. Intervention humaine

Un administrateur autorisé peut :

- corriger une catégorie ;
- modifier un titre ou un contenu ;
- verrouiller un emplacement ;
- retirer un article ;
- archiver une traduction ;
- interrompre l’automatisation ;
- remplacer une composition IA ;
- demander une nouvelle génération.

Toute intervention importante doit être enregistrée dans l’historique éditorial.

## 26. Traçabilité des décisions IA

Chaque décision automatique doit enregistrer :

- la date ;
- le modèle utilisé ;
- la version de la politique ;
- les candidats examinés ;
- les scores ;
- les motifs de sélection ;
- les motifs d’exclusion ;
- les emplacements attribués ;
- les éventuels changements humains ultérieurs.

## 27. Arrêt d’urgence et reprise

Chaque automatisation importante doit disposer :

- d’un interrupteur d’activation ;
- d’un arrêt d’urgence ;
- d’un mode simulation ;
- d’un journal d’erreurs ;
- d’un mécanisme de reprise sans doublon.

En cas d’indisponibilité de l’IA :

- ne pas vider les pages ;
- conserver la dernière composition valide ;
- ne pas remplacer les choix humains ;
- journaliser l’échec ;
- permettre une reprise ultérieure.

## 28. Déploiement progressif

Toute nouvelle automatisation suit les étapes suivantes :

1. tests unitaires ;
2. simulation locale ;
3. mode `shadow` sans effet public ;
4. comparaison avec une sélection humaine ;
5. mode assisté ;
6. activation automatique limitée ;
7. contrôle des résultats ;
8. généralisation éventuelle.

## 29. Gouvernance de la charte

Toute modification importante de cette charte doit :

- être versionnée ;
- être relue ;
- être associée à des tests lorsque la règle est automatisable ;
- préciser sa date d’entrée en vigueur ;
- conserver l’historique des versions.

La règle la plus restrictive prévaut lorsqu’une situation entre dans plusieurs cas.

## 30. Principe final

L’IA peut publier et composer les pages d’ANDORRE 360, y compris la page d’accueil.

Elle agit toutefois dans un cadre explicite :

> l’IA hiérarchise et propose ; le code garantit la sécurité, la qualité, la diversité et la traçabilité ; la rédaction conserve toujours le dernier mot.
