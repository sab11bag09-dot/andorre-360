# Déploiement du pipeline multilingue

Date : 1 août 2026

Ce document décrit la mise en production progressive des pages françaises,
catalanes et espagnoles. Il complète le plan
`docs/09-multilingual-delivery-plan.md`.

## 1. Condition préalable d'hébergement

Le projet utilise actuellement SQLite avec `better-sqlite3`. La base doit donc
résider sur un volume persistant, sauvegardé et accessible par une seule
application qui effectue les écritures.

Ne pas déployer la base SQLite sur un système de fichiers éphémère. Un
hébergement serverless sans volume persistant exige d'abord une migration vers
une base gérée compatible avec Prisma. Tant que cette décision n'est pas prise,
le déploiement de production est bloqué ; le déploiement local et de recette
sur une machine avec disque persistant reste possible.

## 2. Variables d'environnement

Le fichier `.env.example` fournit uniquement des valeurs factices.

| Variable | Production | Usage |
|---|---:|---|
| `DATABASE_URL` | obligatoire | URL SQLite pointant vers le volume persistant |
| `AUTH_SECRET` | obligatoire | chiffrement et sessions Auth.js |
| `NEXT_PUBLIC_SITE_URL` | obligatoire | origine des canonical, `hreflang` et métadonnées sociales |
| `MULTILINGUAL_PUBLICATION_ENABLED` | obligatoire | coupe-circuit de nouvelle publication |
| `OPENAI_API_KEY` | facultative | génération réelle CA/ES ; ne jamais l'exposer au navigateur |
| `OPENAI_TRANSLATION_MODEL` | facultative | modèle OpenAI, `gpt-5.6-terra` par défaut |
| `ADMIN_*` | initialisation uniquement | création du premier administrateur |

`NEXT_PUBLIC_SITE_URL` doit contenir l'origine HTTPS finale, sans barre oblique
terminale. Les secrets sont configurés dans l'environnement d'hébergement et
ne sont jamais commités.

Le déploiement commence avec :

```dotenv
MULTILINGUAL_PUBLICATION_ENABLED="false"
```

La génération OpenAI reste indisponible sans clé ou sans crédits, mais les
brouillons existants, la relecture et les retraits de publication restent
utilisables.

## 3. Routes livrées

| Usage | Route |
|---|---|
| Article français | `/article/[slug]` |
| Article catalan publié | `/ca/article/[slug]` |
| Article espagnol publié | `/es/article/[slug]` |
| Édition d'une traduction | `/admin/articles/[id]/translations/[locale]` |
| Aperçu administrateur | `/admin/articles/[id]/translations/[locale]/preview` |

Les routes publiques CA et ES retournent une page introuvable pour `DRAFT`,
`AI_DRAFT`, `REVIEW`, `APPROVED`, `ARCHIVED`, un slug inconnu ou une langue non
prise en charge.

## 4. Contrôles avant déploiement

Exécuter depuis un arbre Git propre :

```bash
git status -sb
npx prisma migrate status
npx tsc --noEmit
npm test -- --run
npm run build
```

Résultat de référence au 3 août 2026 : 38 fichiers de tests et 205 tests. Les
tests d'intégration créent leur propre base temporaire et ne touchent pas à la
base configurée par `DATABASE_URL`.

Vérifier également qu'aucun secret n'est suivi :

```bash
git ls-files '.env*'
git grep -n '[s]k-proj-' -- ':!package-lock.json'
```

La seule sortie attendue de la première commande est `.env.example`. La seconde
commande ne doit rien retourner.

## 5. Sauvegarde SQLite

Mettre l'application en maintenance ou arrêter les écritures avant la
sauvegarde. Remplacer les deux chemins ci-dessous par des chemins absolus et
précis :

```bash
DB_PATH="/chemin/persistant/andorre-360.db"
BACKUP_PATH="/chemin/sauvegardes/andorre-360-before-multilingual.db"

sqlite3 "$DB_PATH" ".backup '$BACKUP_PATH'"
sqlite3 "$BACKUP_PATH" 'PRAGMA integrity_check;'
shasum -a 256 "$BACKUP_PATH"
```

`PRAGMA integrity_check` doit retourner `ok`. Conserver la sauvegarde hors du
dépôt et tester régulièrement une restauration sur une base séparée.

Avant la migration, enregistrer les volumes de référence :

```bash
sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM Article;'
sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM ArticleTranslation;'
```

## 6. Migration et démarrage

Sur l'environnement cible, avec `MULTILINGUAL_PUBLICATION_ENABLED=false` :

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
npm run build
npm run start
```

Ne jamais utiliser `prisma migrate dev` en production. Le statut doit confirmer
que les 25 migrations sont appliquées.

## 7. Ouverture progressive

1. Se connecter comme administrateur.
2. Vérifier les écrans FR, CA et ES et l'aperçu protégé.
3. Choisir une seule traduction de recette en statut `APPROVED`.
4. Passer `MULTILINGUAL_PUBLICATION_ENABLED=true`, puis redémarrer ou
   redéployer l'application.
5. Publier uniquement cette traduction.
6. Vérifier la page localisée, le canonical, les `hreflang`, l'image et le
   contenu.
7. Vérifier que l'autre langue et le français n'ont pas changé.
8. Retirer la traduction : elle doit devenir `ARCHIVED` et retourner une page
   introuvable publiquement.
9. Réactiver la publication seulement après validation de ce parcours.

Exemple de contrôle des liens SEO :

```bash
curl -s "https://example.com/ca/article/slug-de-test" \
  | grep -oE '<link[^>]+>' \
  | grep -E 'canonical|alternate'
```

Les liens alternatifs ne doivent mentionner que les versions réellement
publiées.

## 8. Retour arrière

Ordre recommandé :

1. remettre `MULTILINGUAL_PUBLICATION_ENABLED=false` et redéployer ;
2. retirer depuis l'administration chaque traduction déjà publiée afin de la
   passer à `ARCHIVED` ;
3. revenir à la version applicative stable précédente par le mécanisme de
   déploiement ou par un `git revert` contrôlé ;
4. restaurer la base uniquement si une migration a réellement endommagé les
   données, application arrêtée et après conservation de la base défaillante.

Ne jamais supprimer une traduction pour annuler sa publication. Le retrait
conserve son contenu, son historique et sa date de première publication.

## 9. Critère de sortie

Le déploiement est accepté lorsqu'une traduction de recette peut être publiée,
contrôlée puis retirée sans modifier le français ni l'autre langue, et lorsque
la restauration de la sauvegarde a été testée sur une base séparée.
