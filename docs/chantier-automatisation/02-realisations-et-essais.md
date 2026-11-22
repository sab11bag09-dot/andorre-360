# ANDORRE 360 — Réalisations, essais et anomalies

[Sommaire](README.md) · Guide du chantier d’automatisation éditoriale, parties 5 à 11.

## 5. Ce qui a déjà été développé

### 5.1 Simulation automatisée de la page d’accueil

La pull request **#119** a introduit la simulation automatisée de l’accueil.

Référence Git :

- commit `469c60b` ;
- intitulé : `feat(editorial): automatiser la simulation de l’accueil`.

Le moteur peut évaluer des candidats et proposer une répartition dans les zones disponibles, sans appliquer immédiatement cette proposition.

### 5.2 Application et retour arrière

La pull request **#120** a ajouté :

- l’application manuelle d’une proposition ;
- l’enregistrement d’un run ;
- la possibilité d’annuler ce run ;
- la conservation des choix humains verrouillés ;
- les événements d’audit associés.

Référence Git :

- commit `00d7200` ;
- intitulé : `feat(editorial): appliquer et restaurer la composition automatique de l’accueil`.

### 5.3 Guide d’activation supervisée

La pull request **#121** a ajouté un premier guide opérationnel.

Référence Git :

- commit `dd5640b` ;
- intitulé : `docs(editorial): ajouter le guide d’activation supervisée`.

### 5.4 Application fidèle de la proposition examinée

La pull request **#122** a corrigé plusieurs points importants :

- la proposition réellement appliquée correspond à celle affichée à l’utilisateur ;
- un jeton protège la proposition contre un changement silencieux entre la simulation et l’application ;
- les cartes manquantes peuvent être complétées par un mécanisme de secours ;
- une zone « grand format » volontairement non pourvue reste vide ;
- un article exclu de la composition automatique n’est pas réintroduit par erreur dans une zone automatisée ;
- les choix humains restent prioritaires.

Référence Git :

- commit `822aff4` ;
- intitulé : `fix(editorial): appliquer fidèlement la composition examinée (#122)`.

Cette correction a notamment résolu un cas où l’article sur les carburants apparaissait en grand format alors que la simulation l’avait classé parmi les candidats exclus.

Une précision importante a ensuite été adoptée : lorsqu’une composition automatique active existe, une zone automatique vide doit conserver son contenant visuel, mais son contenu éditorial doit rester vide. Lorsqu’il n’existe plus de composition automatisée active, après un retour arrière par exemple, les mécanismes habituels de la Une peuvent à nouveau remplir la page.

### 5.5 Sécurisation de la création des brouillons IA

La pull request **#123** a séparé clairement :

- une demande humaine de création ou de régénération ;
- une future demande provenant d’un orchestrateur autonome autorisé.

Référence Git :

- commit de fusion `0590c6d63c6f3007707a5d919f7dccd5003c522b` ;
- intitulé : `fix(editorial): sécuriser la création des brouillons IA (#123)` ;
- fusion effectuée le 9 septembre 2026.

Désormais, une action humaine depuis l’écran des observations demande explicitement :

```ts
allowAutoPublication: false
```

Le résultat reste donc un brouillon, même si d’autres variables d’automatisation autoriseraient normalement une publication.

Le futur orchestrateur autonome pourra demander explicitement :

```ts
allowAutoPublication: true
```

Cette distinction évite qu’un clic humain destiné à examiner un brouillon déclenche involontairement sa publication.

Elle ne bloque pas l’automatisation future : elle impose simplement que l’acteur autonome se déclare explicitement.

---

## 6. Les vérifications déjà réussies

Après le correctif de sécurisation des brouillons, les contrôles complets ont donné :

- 94 fichiers de tests réussis ;
- 549 tests réussis ;
- aucune erreur ESLint ;
- 10 avertissements ESLint déjà connus ;
- validation TypeScript ;
- build Next.js réussi ;
- `git diff --check` réussi ;
- CI GitHub réussie.

La pull request #123 a été fusionnée dans la branche `audit/studio-v4`.

Au moment de cette fusion, la branche de référence était propre et synchronisée avec son dépôt distant.

---

## 7. État local du chantier

### 7.1 Base de données

Le projet utilise actuellement SQLite avec le fichier local :

```text
./dev.db
```

Prisma a confirmé :

- 31 migrations présentes ;
- schéma de la base à jour.

Avant l’essai supervisé, une sauvegarde a été créée :

```text
/var/folders/44/r5395xmn7sv7290gdmf8ncd80000gn/T/andorre-360-dev-before-supervised-run-20260908-215526.db
```

Cette sauvegarde faisait environ 7,1 Mo.

Les vérifications effectuées sur cette copie ont indiqué :

- intégrité SQLite : `ok` ;
- aucune erreur de clé étrangère ;
- 185 publications ;
- 450 événements éditoriaux ;
- 2 runs d’automatisation de l’accueil.

Cette adresse est propre au Mac de développement. Il faut donc toujours vérifier que le fichier existe encore avant de compter dessus.

### 7.2 Variables de sécurité utilisées pendant le test

Pendant le chantier local, les réglages observés étaient :

```dotenv
AI_HOME_COMPOSITION_APPLY_ENABLED=true
AI_HOME_COMPOSITION_ROLLBACK_ENABLED=true
AI_HOME_COMPOSITION_EMERGENCY_STOP=false
MULTILINGUAL_PUBLICATION_ENABLED=true
AI_AUTO_PUBLICATION_ENABLED=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=true
```

La liste des sources autorisées à la publication automatique a été conservée, mais la publication automatique elle-même était désactivée et son arrêt d’urgence activé.

La collecte planifiée a également reçu un secret local `SOURCE_COLLECTION_SECRET`.

**La valeur de ce secret ne doit jamais être écrite dans un document, un commit, une capture d’écran ou un message.**

---

## 8. Premier essai de collecte supervisée

### 8.1 Ce qui a été lancé

La route interne utilisée est :

```text
POST /api/internal/sources/collect
```

Elle exige un en-tête d’autorisation contenant le secret de collecte.

La taille de lot par défaut est de 10 sources. Le maximum prévu par le code est de 50.

### 8.2 Résultat

Avant l’essai, la table `Observation` contenait 1 558 lignes.

Le premier lot a produit :

```json
{
  "attempted": 10,
  "succeeded": 10,
  "failed": 0,
  "collected": 146,
  "created": 50,
  "failures": []
}
```

Après l’essai :

- 1 608 observations étaient enregistrées ;
- 50 nouvelles observations avaient donc été créées ;
- les 10 sources avaient un état disponible ;
- les dates de dernière vérification et de dernier succès avaient été mises à jour ;
- aucune erreur de clé étrangère n’était présente.

### 8.3 Ce que cela prouve

Cela prouve que la collecte par lot fonctionne sur ces dix sources dans l’environnement local.

Cela ne prouve pas encore que :

- toutes les sources fonctionnent ;
- toutes les dates collectées sont correctes ;
- toutes les observations sont de bonne qualité ;
- la génération d’articles peut fonctionner sans surveillance ;
- la publication automatique est prête.

La collecte crée des observations. Elle ne doit pas, à elle seule, être assimilée à une publication.

---

## 9. Essai de simulation de la page d’accueil

Une simulation réalisée le 8 septembre 2026 vers 22 h 01 a donné :

- 30 candidats évalués ;
- 3 articles retenus ;
- les 3 articles retenus correspondaient à des sélections humaines verrouillées ;
- 1 emplacement grand format non pourvu ;
- 5 cartes éditoriales non pourvues ;
- 2 brèves non pourvues.

Cette situation était cohérente avec les données disponibles : les articles publics les plus récents dataient du 1er septembre 2026, donc ils avaient dépassé la fenêtre de fraîcheur de sept jours utilisée par la simulation.

Le moteur a préféré laisser des emplacements vides plutôt que d’utiliser automatiquement des articles trop anciens ou non admissibles.

La simulation n’a pas été appliquée.

---

## 10. Les anomalies découvertes

### 10.1 Dates futures incorrectes

Plusieurs observations provenant de la source « altaveu test 2 » possèdent des dates futures :

- observations 1768, 1769 et 1770 : décembre 2026 ;
- observation 1771 : novembre 2026.

Ces dates sont incohérentes avec la date du chantier, septembre 2026.

La cause probable est une mauvaise interprétation d’un format de date, par exemple une confusion entre :

- jour/mois ;
- mois/jour.

Ces observations ne doivent pas être sélectionnées par un futur orchestrateur tant que le parseur n’est pas corrigé.

Il ne faut pas modifier manuellement leurs dates uniquement pour faire passer un test. Le correctif doit être réalisé dans le code, couvert par des tests et applicable aux prochaines collectes.

### 10.2 Qualité insuffisante du brouillon test

L’observation 2156 a servi de test.

Elle concernait les travaux d’une installation photovoltaïque au Complexe sportif et socioculturel d’Encamp.

Caractéristiques de l’observation :

- source : Encamp ;
- niveau de confiance : `HIGH` ;
- mode de publication de la source : `AUTO` ;
- contenu : environ 2 032 caractères ;
- date d’origine : 2 septembre 2026 ;
- aucun article correspondant n’existait avant le test.

Le moteur a créé l’article 492 :

- statut : `AI_DRAFT` ;
- publié : non ;
- observation marquée comme traitée ;
- observation reliée à l’article 492 ;
- aucune traduction publiée ;
- événement d’audit enregistré ;
- motif de non-publication : `emergency_stop`.

Le mécanisme de sécurité a donc fonctionné.

En revanche, l’examen éditorial du contenu a révélé plusieurs défauts :

- le texte ressemble trop à une traduction de la source et pas assez à une réécriture journalistique originale ;
- l’expression « ce matin » perd son sens lorsque l’article est généré plusieurs jours plus tard ;
- `Escola Bressol` a été rendu par « École maternelle », alors qu’il s’agit plutôt d’une structure de petite enfance ou d’une crèche ;
- certains nombres utilisent une typographie peu naturelle en français ;
- des espaces manquent dans certains passages, par exemple `estde` ou `bâtimentscommunaux` ;
- l’acronyme `LITECC` n’est pas expliqué ;
- l’image est encore une image générique ;
- la source est affichée comme auteur, ce qui demande une clarification éditoriale ;
- l’audit indiquait un générateur déterministe, alors que le chemin de génération réellement utilisé doit être vérifié.

Conclusion : la création technique du brouillon fonctionne, mais sa qualité n’est pas encore suffisante pour une publication autonome.

### 10.3 Dates de référence et fraîcheur

Le générateur doit connaître :

- la date de publication annoncée par la source ;
- la date réelle de génération ;
- éventuellement la date de l’événement.

Sans ce contexte, il risque de conserver des expressions relatives devenues fausses :

- aujourd’hui ;
- hier ;
- demain ;
- ce matin ;
- la semaine prochaine.

Le futur moteur devra transformer ces expressions en dates absolues ou les reformuler.

---

## 11. Pourquoi la publication automatique a été désactivée pendant l’essai

Elle a été désactivée afin d’observer séparément :

1. la collecte ;
2. la création du brouillon ;
3. la qualité du texte ;
4. la décision de publication.

Cette précaution a permis de constater les défauts du brouillon 492 sans les exposer au public.

Le danger n’était pas « l’IA » en elle-même. Le danger venait de l’enchaînement immédiat de plusieurs actions alors que nous n’avions pas encore vérifié :

- la date ;
- la qualité linguistique ;
- la fidélité aux faits ;
- l’image ;
- les traductions ;
- la bonne attribution ;
- les règles de publication ;
- la capacité de retour arrière.

Lorsque le moteur autonome sera prêt, il devra évidemment pouvoir publier automatiquement. Le correctif #123 prévoit déjà cette possibilité avec `allowAutoPublication: true`.

La règle actuelle est donc :

- action humaine dans le Studio : création d’un brouillon ;
- futur orchestrateur autonome explicitement autorisé : publication automatique possible, sous réserve de tous les autres contrôles.

---
