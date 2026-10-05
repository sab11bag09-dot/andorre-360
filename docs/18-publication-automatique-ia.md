# Fiche 18 — Publication automatique par IA

## 1. Objet du chantier

Permettre à Andorre 360 de publier automatiquement certains contenus générés par l’IA, sans validation humaine préalable, tout en conservant la traçabilité, la possibilité de reprise humaine et un arrêt d’urgence.

Le mode automatique ne signifie pas que l’IA dispose d’une liberté éditoriale illimitée : elle agit dans un cadre de sources, de formats, de règles et de contrôles techniques prédéfinis.

## 2. Décision produit

Toutes les sources peuvent être éligibles au mode `AUTO`.

L’éligibilité ne garantit toutefois pas la publication de chaque contenu. Avant publication, le système doit vérifier que :

- l’observation possède une URL et une source identifiables ;
- le contenu collecté est exploitable ;
- le texte généré reste fidèle à l’observation ;
- les champs obligatoires sont présents ;
- aucune règle de sécurité ou de cohérence n’est déclenchée.

Un journaliste peut reprendre la main à tout moment, corriger, dépublier ou désactiver l’automatisation.

## 3. Chaîne fonctionnelle cible

```text
Source
  ↓
Observation
  ↓
Analyse et extraction des faits
  ↓
Génération de l’article
  ↓
Contrôles de cohérence
  ↓
Traductions FR / CA / ES
  ↓
Contrôles des traductions
  ↓
Publication automatique
  ↓
Pages, Fil info et canaux de diffusion
  ↓
Historique et supervision
```

La source collectée ne doit jamais être transformée directement en publication sans passer par l’étape de génération et les contrôles associés.

## 4. Contenus concernés

Le mode `AUTO` peut produire :

- articles courts issus de communiqués ou actualités structurées ;
- brèves factuelles ;
- résultats et informations sportives ;
- événements et agenda ;
- informations météo ;
- communiqués institutionnels ;
- versions courtes pour le Fil info ;
- métadonnées SEO ;
- traductions en français, catalan et espagnol.

Les formats et la longueur doivent être déterminés par des règles éditoriales, et non uniquement par le modèle.

## 5. Contrôles avant publication

La publication doit être bloquée si :

- le contenu source est vide, trop court ou inaccessible ;
- l’URL source est absente ou invalide ;
- le titre ou le corps est manquant ;
- le texte introduit des faits, chiffres, noms ou citations absents de la source ;
- des dates ou lieux importants sont incohérents ;
- une traduction supprime ou modifie une information vérifiable ;
- le modèle renvoie une réponse incomplète ou non conforme ;
- une source est signalée comme défaillante ;
- le système d’arrêt global est activé.

Un blocage doit être explicable et visible dans l’administration.

## 6. Traçabilité obligatoire

Pour chaque contenu publié automatiquement, conserver :

- l’identifiant de la source ;
- l’identifiant de l’observation ;
- l’URL originale ;
- la date de collecte ;
- la date de génération ;
- le modèle utilisé et sa version ;
- la configuration ou le mode éditorial ;
- les langues générées ;
- les résultats des contrôles ;
- la date et l’auteur technique de la publication ;
- les corrections, dépublications et reprises humaines.

L’historique doit permettre de répondre à la question : « pourquoi cet article a-t-il été publié ? »

## 7. Supervision et reprise humaine

L’administration doit proposer :

- un bouton d’arrêt global de la publication automatique ;
- un arrêt par source ;
- un arrêt par catégorie ou format ;
- une liste des publications automatiques récentes ;
- un indicateur des publications bloquées ;
- une dépublication immédiate ;
- une reprise manuelle avec conservation de l’historique ;
- une possibilité de repasser une source de `AUTO` à `ASSISTÉ` ou `MANUEL`.

La reprise humaine ne doit pas effacer les données produites par l’IA : elle doit créer un nouvel événement éditorial.

## 8. Gestion des erreurs

Les erreurs doivent être classées :

- collecte impossible ;
- contenu insuffisant ;
- génération IA échouée ;
- contrôle de cohérence échoué ;
- traduction échouée ;
- publication échouée ;
- dépublication ou reprise humaine.

Chaque erreur doit être journalisée avec un message lisible et un identifiant permettant le diagnostic.

Une erreur ne doit jamais provoquer une publication partielle silencieuse.

## 9. Plan de mise en œuvre

1. Auditer le pipeline actuel `Observation → Article → Traductions → Publication`.
2. Identifier les endroits où une validation humaine est aujourd’hui obligatoire.
3. Ajouter le mode `AUTO` au niveau des sources et des formats.
4. Centraliser les contrôles prépublication.
5. Ajouter l’enregistrement complet des événements IA.
6. Implémenter l’arrêt global et les arrêts ciblés.
7. Ajouter les tests de publication automatique et de blocage.
8. Tester les traductions et les reprises humaines.
9. Activer progressivement l’automatisation sur des sources représentatives.
10. Vérifier les journaux et les procédures de dépublication avant généralisation.

## 10. Critères d’acceptation

Le chantier sera considéré comme terminé lorsque :

- une source configurée en `AUTO` peut publier sans intervention ;
- une observation reste liée à l’article publié ;
- les trois langues configurées sont traçables séparément ;
- les contrôles bloquent les contenus incomplets ou incohérents ;
- une erreur est visible et explicable dans l’administration ;
- un administrateur peut arrêter toute l’automatisation ;
- un journaliste peut corriger ou dépublier immédiatement ;
- chaque action IA et humaine apparaît dans l’historique ;
- les tests couvrent les succès, les échecs, les traductions et les reprises ;
- la CI et le build sont verts.

## 11. Principe éditorial

L’IA peut publier automatiquement, mais elle ne doit jamais devenir une boîte noire éditoriale.

La publication automatique est acceptable uniquement si le système conserve :

- une source identifiable ;
- une chaîne de décision reconstituable ;
- des contrôles vérifiables ;
- une reprise humaine immédiate ;
- un mécanisme d’arrêt fiable.


## 12. Audit du pipeline réel

### Conclusion

L’automatisation IA complète n’est pas encore implémentée. Le système fonctionne actuellement selon cette chaîne :

```text
Observation → brouillon d’article → traductions AI_DRAFT → validation → publication
```

### Fonctionnalités présentes

- Une observation peut générer un brouillon d’article.
- L’observation reste liée à l’article créé.
- Les traductions catalane et espagnole sont enregistrées en statut `AI_DRAFT`.
- La publication exige un article `APPROVED` ou déjà `PUBLISHED`.
- Les actions d’administration sont protégées.
- Les événements éditoriaux et les mutations de traduction sont tracés.

### Écarts constatés

1. Le champ `SourcePublicationMode.AUTO` existe en base, mais n’est pas utilisé pour déclencher une publication.
2. La génération d’article par défaut utilise `DeterministicEditorialGenerator`, qui reprend et reformate le contenu source.
3. OpenAI est actuellement utilisé pour les traductions, pas pour la préparation principale de l’article.
4. La création directe d’un article publié est explicitement bloquée.
5. Le modèle, le prompt, la version de génération et les résultats de contrôle ne sont pas encore conservés.
6. Les contrôles existants vérifient surtout la présence du contenu et le statut éditorial ; ils ne contrôlent pas encore systématiquement les faits, chiffres, dates, noms ou contradictions.

### Verdict

Le produit est actuellement en mode assisté/manuellement validé. Le mode `AUTO` autorisant une publication sans validation humaine reste à construire.

### Travaux nécessaires

- brancher réellement `SourcePublicationMode.AUTO` ;
- ajouter la génération IA des articles ;
- contrôler la fidélité à l’observation ;
- contrôler la complétude et les contradictions ;
- contrôler les traductions ;
- enregistrer modèle, prompt, version et résultats ;
- publier automatiquement uniquement après contrôles réussis ;
- ajouter l’arrêt global et la dépublication immédiate.
