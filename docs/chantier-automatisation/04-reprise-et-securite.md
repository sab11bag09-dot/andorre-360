# ANDORRE 360 — Reprise du chantier, sécurité et confusions à éviter

[Sommaire](README.md) · Guide du chantier d’automatisation éditoriale, parties 15 à 17.

## 15. Procédure de reprise du chantier

### Étape 1 — Vérifier la branche principale de travail

```bash
git switch audit/studio-v4
git pull --ff-only origin audit/studio-v4
git status -sb
git log --oneline -4
```

Le commit `0590c6d` ou un commit plus récent doit apparaître dans l’historique.

Le statut Git doit être propre avant de créer une nouvelle branche.

### Étape 2 — Vérifier la base locale

```bash
npx prisma migrate status
```

Avant toute écriture importante, créer une sauvegarde SQLite et vérifier :

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```

### Étape 3 — Vérifier les protections

Ne jamais afficher la valeur des secrets.

Vérifier seulement la présence et l’état des variables nécessaires.

Pour le prochain correctif, la publication automatique doit rester désactivée :

```dotenv
AI_AUTO_PUBLICATION_ENABLED=false
AI_AUTO_PUBLICATION_EMERGENCY_STOP=true
```

### Étape 4 — Créer la branche du prochain lot

```bash
git switch -c fix/reject-future-observation-dates
```

### Étape 5 — Corriger avec des tests

Ordre conseillé :

1. écrire un test reproduisant une date mal interprétée ;
2. vérifier que le test échoue avant le correctif ;
3. corriger le parseur ;
4. ajouter une protection générique ;
5. relancer les tests ciblés ;
6. lancer les tests complets, ESLint, TypeScript et le build ;
7. vérifier `git diff --check`.

### Étape 6 — Sauvegarder dans Git

Créer un commit concentré sur un seul sujet.

Ensuite :

1. pousser la branche ;
2. créer une pull request vers `audit/studio-v4` ;
3. attendre la CI ;
4. examiner le diff ;
5. fusionner uniquement si tout est vert ;
6. supprimer la branche après fusion ;
7. vérifier que la branche locale de référence est synchronisée.

---

## 16. Règles de sécurité du chantier

### Avant une modification de données

- identifier précisément ce qui va être modifié ;
- créer une sauvegarde ;
- vérifier l’intégrité ;
- noter les compteurs utiles ;
- conserver un moyen de revenir en arrière.

### Pendant un test

- modifier un seul mécanisme à la fois ;
- conserver l’arrêt d’urgence ;
- lire les événements d’audit ;
- vérifier les statuts en base ;
- ne pas conclure à partir de la seule apparence de l’interface.

### Après un test

- vérifier les publications actives ;
- vérifier les observations traitées ;
- vérifier les articles créés ;
- vérifier les traductions ;
- vérifier les événements ;
- exécuter `PRAGMA foreign_key_check` ;
- comparer avec l’état attendu.

### Pour le code

- une branche par lot cohérent ;
- tests ciblés puis suite complète ;
- pas de secret dans le dépôt ;
- pas de correction manuelle de données pour cacher un bug ;
- pas de déploiement implicite ;
- pas de fusion si la CI échoue ;
- documenter les décisions qui changent le comportement éditorial.

---

## 17. Les confusions à éviter

### « La collecte a fonctionné, donc l’article est publié »

Faux. La collecte crée une observation.

### « Une observation est un article »

Faux. L’observation est la matière première. L’article est un contenu éditorial distinct.

### « Un brouillon dans le Studio est visible sur le site »

Faux. Un brouillon `AI_DRAFT` avec `published = 0` n’est pas public.

### « Le mode AUTO de la source impose toujours la publication »

Faux. Plusieurs contrôles supplémentaires s’appliquent :

- activation générale ;
- arrêt d’urgence ;
- liste d’autorisation ;
- confiance ;
- qualité ;
- cohérence des adresses ;
- autorisation explicite de l’appelant.

### « La simulation modifie la page d’accueil »

Faux. Elle reste une proposition tant que l’application manuelle n’est pas confirmée.

### « Un emplacement non pourvu doit être rempli à tout prix »

Faux. Pendant une composition automatisée active, laisser le contenu vide peut être la bonne décision. Le contenant visuel peut rester présent.

### « Le retour arrière supprime le contenant de la page »

Faux. Il retire les publications créées par le run. Une fois le run inactif, les règles habituelles de la page peuvent de nouveau fournir du contenu.

### « Un test local réussi signifie que la production est prête »

Faux. La production demande en plus une infrastructure, une supervision, des sauvegardes, une gestion des secrets et une validation éditoriale complète.

---
