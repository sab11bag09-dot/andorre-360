# Intégrer correctement une source

Ce guide décrit la procédure complète pour ajouter une source réelle à ANDORRE 360, la tester et éviter les observations vides ou les pages de rubrique prises pour des articles.

La collecte crée des **observations**. Elle ne doit jamais publier directement un article. Pendant toute l’intégration, utiliser le mode de publication **Manuelle**.

## 1. Choisir le bon mode de collecte

Privilégier les modes dans cet ordre :

1. **RSS** : choix recommandé lorsqu’un flux officiel existe. Sa structure est généralement plus stable et chaque entrée possède déjà un titre et une URL.
2. **HTML** : utiliser uniquement en l’absence de flux RSS exploitable. Il faut alors définir et tester des sélecteurs propres au site.
3. Les modes API, PDF, Facebook, X, YouTube et e-mail sont visibles dans l’administration, mais aucun collecteur n’est encore disponible pour eux.

Ne pas remplacer une source HTML généraliste par un flux RSS thématique sans vérifier le besoin. Deux sources du même média peuvent coexister si leurs URL sont différentes, mais il faut surveiller les doublons éditoriaux.

## 2. Vérifications préalables

Avant d’enregistrer une source :

- ouvrir l’URL dans un navigateur privé ;
- vérifier qu’elle est publique et accessible sans authentification ;
- confirmer qu’il s’agit de l’URL canonique en HTTPS ;
- pour un flux RSS, vérifier la présence d’éléments `item` ou `entry` ;
- pour une page HTML, identifier les liens vers les vrais articles et le conteneur du corps de l’article ;
- refuser les URL locales, privées ou techniques (`localhost`, adresses IP internes, interfaces d’administration) ;
- consulter les conditions d’utilisation et respecter une fréquence raisonnable.

## 3. Créer la source dans l’administration

Ouvrir `/admin/sources/nouveau`, puis renseigner :

- un nom explicite, avec la rubrique pour un flux thématique ;
- l’URL exacte du flux ou de la page de liste ;
- le type d’organisation ;
- le mode de collecte RSS ou HTML ;
- le mode de publication **Manuelle** ;
- le niveau de confiance approprié ;
- une catégorie facultative ;
- une fréquence de 15 à 60 minutes pour les premiers essais ;
- la source active seulement lorsqu’elle doit entrer dans la collecte planifiée.

Pour une première intégration, il est préférable de créer la source inactive, de la tester manuellement, puis de l’activer.

## 4. Intégrer un flux RSS

Le collecteur RSS se trouve dans `lib/source-engine/collectors/RssCollector.ts`. Il accepte RSS et Atom, normalise les URL relatives et lit notamment :

- le titre ;
- le lien ou le GUID ;
- la date de publication ;
- le contenu, la description ou le résumé.

### Contrôle RSS

1. Cliquer sur **Vérifier** dans la fiche de la source.
2. Cliquer sur **Collecter maintenant**.
3. Contrôler le terminal : la requête doit finir avec un statut `200`.
4. Ouvrir `/admin/observations`.
5. Vérifier plusieurs observations, pas seulement la première.

Une source RSS est acceptable lorsque chaque observation possède au minimum un titre et une URL d’article. Un résumé court peut être normal ; un contenu vide sur toutes les entrées indique que le flux ne fournit que des liens et qu’un enrichissement HTML devra être ajouté ultérieurement.

## 5. Intégrer une source HTML

Les règles propres aux sites sont centralisées dans :

`lib/source-engine/collectors/siteRules.ts`

Une règle contient :

- `listing` : sélecteurs des liens vers les articles ;
- `content` : sélecteurs du corps éditorial ;
- `remove` : éléments à retirer du corps ;
- `articlePathPattern` : filtre facultatif appliqué au chemin de l’URL.

Exemple :

```ts
"www.example.ad": {
  listing: ['article h2 a'],
  articlePathPattern: /^\/noticies\/[^/]+\/[^/]+\/?$/,
  content: ['.article-body'],
  remove: ['.share', '.related', '.advertisement'],
},
```

Le nom de domaine doit correspondre exactement à `new URL(source.url).hostname`. Une règle pour `www.example.ad` ne s’applique pas automatiquement à `example.ad`.

### Choisir le sélecteur de liste

Le sélecteur doit viser les liens des cartes d’articles, pas la navigation entière.

À éviter :

```ts
listing: ['a[href^="/noticies/"]']
```

Ce sélecteur peut aussi capturer `/noticies/societat` ou `/noticies/cultura`.

Préférer un sélecteur structurel précis :

```ts
listing: ['article h2 a[href^="/noticies/"]']
```

Si le site ne permet pas un sélecteur suffisamment précis, ajouter `articlePathPattern`. Le motif doit accepter les vrais chemins et refuser explicitement les pages de rubrique.

### Choisir le sélecteur de contenu

Le sélecteur doit entourer uniquement le texte éditorial. Il ne doit pas englober toute la page.

Vérifier qu’il contient plusieurs paragraphes sur différents articles. Ajouter dans `remove` les blocs de partage, publicités, recommandations, tags, commentaires et contenus associés.

Le collecteur ignore un contenu extrait de moins de 50 caractères. Une mauvaise règle peut donc produire une observation valide par son titre et son URL, mais avec `content: null`.

## 6. Éviter les articles vides

Les causes les plus fréquentes sont :

| Cause | Symptôme | Correction |
|---|---|---|
| Page de rubrique capturée | URL courte comme `/noticies/cultura` | Préciser `listing` ou ajouter `articlePathPattern` |
| Sélecteur de contenu obsolète | Toutes les longueurs valent `0` | Inspecter un article récent et actualiser `content` |
| Contenu rendu uniquement en JavaScript | HTML reçu sans corps d’article | Chercher un RSS ou une API publique ; ne pas publier l’observation vide |
| Mur d’abonnement ou anti-robot | Statut HTTP d’erreur ou page technique | Désactiver la source et choisir une voie autorisée |
| Mauvais domaine dans `siteRules` | Les sélecteurs spécifiques ne sont jamais utilisés | Aligner exactement le hostname |
| Texte trop court | `contentLength: 0` malgré une page accessible | Choisir un conteneur plus large, sans inclure navigation et pied de page |

Avant de valider une source HTML, contrôler au moins cinq articles appartenant à plusieurs rubriques. Aucun lien de navigation ou de catégorie ne doit apparaître parmi les observations.

## 7. Ajouter un test de non-régression

Modifier `lib/source-engine/__tests__/HtmlCollector.test.ts` avec un faux client HTML. Le test doit fournir :

- une page de liste contenant au moins une vraie URL d’article ;
- une ou plusieurs URL de catégories à exclure ;
- une page d’article avec un corps de plus de 50 caractères.

Il doit vérifier :

1. qu’une seule observation est produite ;
2. que son titre et son URL sont corrects ;
3. que le client ne télécharge jamais les pages de catégories.

Lancer ensuite :

```bash
npm test -- --run lib/source-engine/__tests__/HtmlCollector.test.ts
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

## 8. Faire le contrôle réel

Lancer l’application :

```bash
npm run dev
```

Depuis la fiche de la source, exécuter une collecte manuelle et surveiller le terminal. Les lignes du dépôt d’observations indiquent notamment :

```text
[ObservationRepository] observation mise à jour {
  id: 123,
  url: 'https://www.example.ad/noticies/rubrique/article',
  contentLength: 1450
}
```

Un `contentLength` positif confirme l’extraction. Un résultat `0` doit être examiné avant toute activation planifiée.

La collecte met à jour une observation existante ayant le même couple `sourceId + url`. Elle ne remet pas une observation déjà traitée dans la file éditoriale.

## 9. Diagnostiquer la base locale

Compter les observations d’une source :

```bash
sqlite3 dev.db "SELECT sourceId, COUNT(*) FROM Observation WHERE sourceId=ID_SOURCE GROUP BY sourceId;"
```

Repérer les contenus absents :

```bash
sqlite3 dev.db "SELECT id, url FROM Observation WHERE sourceId=ID_SOURCE AND (content IS NULL OR trim(content)='') ORDER BY id DESC;"
```

Ne jamais supprimer toutes les observations d’une source par réflexe. Supprimer uniquement des URL identifiées et confirmer le nombre de lignes :

```bash
sqlite3 dev.db "DELETE FROM Observation WHERE sourceId=ID_SOURCE AND url IN ('URL_FAUSSE_1','URL_FAUSSE_2'); SELECT changes();"
```

Ces commandes concernent `dev.db`. Toute intervention sur une base de staging ou de production doit suivre une procédure sauvegardée et validée séparément.

## 10. Activer la collecte planifiée

Une source peut être activée lorsque :

- la vérification réussit ;
- deux collectes manuelles successives réussissent ;
- les doublons techniques sont maîtrisés ;
- les observations contiennent des URL d’articles ;
- la qualité du contenu a été vérifiée ;
- le mode de publication reste adapté au niveau de confiance.

Le planificateur appelle `/api/internal/sources/collect`. Il nécessite :

```env
SOURCE_COLLECTION_SECRET=un-secret-long-et-aleatoire
SOURCE_COLLECTION_BATCH_SIZE=10
```

L’appel doit transmettre :

```http
Authorization: Bearer <SOURCE_COLLECTION_SECRET>
```

Ne jamais placer ce secret dans le dépôt, une URL ou une capture d’écran. Le planificateur traite les sources actives arrivées à échéance, respecte la taille du lot et isole l’échec d’une source des autres.

## 11. Checklist de validation

- [ ] URL publique, canonique et en HTTPS
- [ ] RSS préféré lorsqu’il existe
- [ ] Publication manuelle pendant l’intégration
- [ ] Sélecteurs limités aux vrais articles
- [ ] Pages de catégories exclues
- [ ] Corps éditorial de longueur suffisante
- [ ] Cinq observations inspectées manuellement
- [ ] Aucune publication automatique déclenchée
- [ ] Test de non-régression ajouté pour une nouvelle règle HTML
- [ ] Suite de tests, TypeScript, ESLint et build réussis
- [ ] Deux collectes manuelles successives réussies
- [ ] Source activée pour le planificateur seulement après validation

## 12. Stratégie recommandée pour ANDORRE 360

Intégrer les sources une par une. Pour chaque média ou organisme :

1. rechercher un flux RSS officiel ;
2. tester la collecte en mode manuel ;
3. inspecter les observations ;
4. ajouter ou corriger une règle HTML seulement si nécessaire ;
5. mesurer les contenus vides et les doublons ;
6. activer la planification ;
7. attendre plusieurs cycles avant de passer à la source suivante.

Cette progression évite qu’une mauvaise règle remplisse la veille de pages inutiles et rend chaque source facile à diagnostiquer.
