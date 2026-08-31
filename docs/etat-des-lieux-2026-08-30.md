# État des lieux général — Andorra 360

Date de référence : 30 août 2026
Branche : `audit/studio-v4`
Commit de référence initial : `554af4e01ec664a3a076443da5ca2f82525fe143`
Statut : socle fonctionnel et activement développé, préparation de la recette à poursuivre.

## Synthèse

Andorra 360 dispose d’un socle éditorial conséquent, testé et cohérent.

Le projet comprend notamment :

* un site public organisé en rubriques ;
* un Fil info ;
* une administration éditoriale ;
* la gestion des articles, sources, observations et médias ;
* un workflow de publication ;
* la collecte de sources RSS, HTML et API ;
* la réécriture assistée par IA ;
* les traductions française, catalane et espagnole ;
* la publication automatique sous conditions ;
* un historique éditorial ;
* la gestion des vidéos ;
* un premier système publicitaire.

La chaîne d’intégration continue exécute les tests, le contrôle TypeScript, ESLint et le build Next.js.

Le projet n’est cependant pas encore prêt pour une production entièrement autonome. Les prochaines étapes concernent principalement l’infrastructure, la recette distante, la supervision et la validation des automatismes.

## Évaluation globale

| Domaine                          | État                                                |
| -------------------------------- | --------------------------------------------------- |
| Socle applicatif                 | Bon                                                 |
| Fonctionnalités éditoriales      | Bien avancées                                       |
| Qualité du code                  | Bonne, avec dette structurelle                      |
| Tests unitaires et d’intégration | Bons                                                |
| Intégration continue             | Opérationnelle                                      |
| Sécurité applicative             | Bonne base                                          |
| Gestion du dépôt                 | Renforcée                                           |
| Données et sauvegardes           | Stratégie à finaliser                               |
| Infrastructure de production     | Non décidée                                         |
| Exploitation et supervision      | À construire                                        |
| Documentation                    | Riche, à maintenir synchronisée                     |
| Publication autonome par IA      | Fonctionnelle sous garde-fous, à valider en recette |

## État du dépôt

Au moment de l’audit :

* le dépôt est public ;
* la branche par défaut est `audit/studio-v4` ;
* la CI est active ;
* les migrations Prisma sont versionnées ;
* aucune release officielle n’est encore publiée ;
* plusieurs branches historiques restent à inventorier ;
* les évolutions doivent désormais passer par des pull requests.

Une règle de protection active couvre la branche par défaut.

Elle impose notamment :

* une pull request avant intégration ;
* la réussite de la CI ;
* une branche à jour avant fusion ;
* la résolution des conversations ;
* un historique linéaire ;
* l’interdiction des suppressions et des envois forcés.

## Architecture technique

Le projet est une application full-stack construite autour de :

* Next.js 16.2.11 ;
* React 19.2.4 ;
* TypeScript strict ;
* Node.js 22 dans la CI ;
* Prisma 7.9.1 ;
* SQLite ;
* `better-sqlite3` ;
* Auth.js / NextAuth v5 bêta ;
* Tailwind CSS 4 ;
* Vitest ;
* OpenAI pour certaines opérations éditoriales ;
* un stockage local des médias.

Le dépôt comprend notamment :

* plus de 400 fichiers suivis ;
* plus de 300 fichiers TypeScript et TSX ;
* plus de 50 fichiers de tests ;
* un historique complet de migrations Prisma ;
* une documentation métier détaillée.

## Fonctions opérationnelles ou bien avancées

### Site public

Les éléments suivants sont présents :

* page d’accueil ;
* page Actualité ;
* Fil info ;
* rubriques éditoriales ;
* fiches d’articles ;
* pages localisées ;
* affichage des vidéos ;
* liens partenaires ;
* publicités sur Actualité.

### Administration

L’administration comprend :

* gestion des articles ;
* gestion des catégories ;
* gestion des sources ;
* gestion des observations ;
* médiathèque ;
* gestion des vidéos externes ;
* diffusion et composition éditoriale ;
* historique éditorial ;
* édition et publication des traductions.

### Collecte

Le moteur prend en charge plusieurs modes de collecte :

* RSS ;
* HTML ;
* API ;
* PDF ;
* sources externes configurées.

Les contenus collectés sont enregistrés comme observations avant leur traitement éditorial.

### Workflow éditorial

Les principaux états disponibles sont :

* `DRAFT` ;
* `AI_DRAFT` ;
* `REVIEW` ;
* `APPROVED` ;
* `PUBLISHED` ;
* `ARCHIVED`.

Les mutations importantes sont enregistrées dans l’historique éditorial.

### Multilingue

Le système gère :

* le français ;
* le catalan ;
* l’espagnol ;
* les slugs localisés ;
* les métadonnées SEO ;
* les balises canonical et `hreflang` ;
* la génération et la correction des traductions ;
* la publication indépendante des variantes.

### Publication automatique

La publication automatique comprend plusieurs garde-fous :

* activation explicite ;
* arrêt d’urgence ;
* liste blanche de sources ;
* contrôle du niveau de confiance ;
* contrôle du contenu ;
* contrôle de la longueur ;
* contrôle du statut éditorial ;
* journalisation des décisions.

Elle doit rester fermée par défaut tant que la recette et les procédures d’exploitation ne sont pas validées.

## Qualité et validation

La CI exécute :

1. l’installation déterministe des dépendances ;
2. la génération du client Prisma ;
3. l’application des migrations ;
4. les tests Vitest ;
5. le contrôle TypeScript ;
6. ESLint ;
7. le build Next.js.

Les tests couvrent notamment :

* les autorisations administratives ;
* les règles de visibilité publique ;
* la publication ;
* les traductions ;
* la génération éditoriale ;
* l’orchestration automatique ;
* la collecte ;
* le Fil info ;
* les médias ;
* l’historique éditorial ;
* le SEO ;
* la revalidation des pages.

## Sécurité et hygiène du dépôt

Une revue spécifique des artefacts de développement a été menée.

Les mesures suivantes ont été appliquées :

* retrait des sauvegardes locales du suivi Git ;
* exclusion des fichiers SQLite ;
* exclusion du dossier local de sauvegardes ;
* conservation des sauvegardes en dehors du dépôt ;
* protection de la branche principale ;
* passage obligatoire par pull request ;
* CI obligatoire avant fusion.

Avant la production, il restera à définir :

* le stockage privé des sauvegardes ;
* leur chiffrement ;
* la durée de conservation ;
* la procédure de restauration ;
* la rotation des secrets ;
* la séparation des secrets de développement, recette et production.

## Dette technique

### Composants historiques

Plusieurs variantes de composants coexistent encore, notamment pour :

* les pages de catégories ;
* la page d’accueil éditoriale ;
* les différentes versions de l’éditeur d’articles.

Un inventaire des imports et routes réellement utilisés doit précéder toute suppression.

### README

Le README doit être actualisé pour documenter :

* l’architecture réelle ;
* l’initialisation de la base ;
* la création du premier administrateur ;
* les variables d’environnement ;
* la collecte ;
* les fonctions IA ;
* les garde-fous ;
* les procédures de validation ;
* le déploiement ;
* la sauvegarde et la restauration.

### Configuration de production

Les besoins suivants doivent encore être évalués :

* headers de sécurité ;
* politique des images distantes ;
* limites des uploads ;
* redirections ;
* gestion du cache ;
* observabilité ;
* stockage des médias.

### Médias

Le stockage local actuel devra être réévalué avant un déploiement distribué ou multi-instance.

## Mise en page

Les pages éditoriales restent sensibles au nombre et à la longueur des contenus.

Les cas suivants doivent continuer à être testés :

* titres très courts ou très longs ;
* chapôs de tailles variables ;
* manque temporaire d’articles ;
* arrivée simultanée de plusieurs contenus ;
* alignement des colonnes ;
* affichage responsive ;
* absence de duplication entre les blocs ;
* erreurs d’hydratation.

## Sources et collecte

Les sources accessibles ne produisent pas toutes nécessairement des observations exploitables.

Le suivi doit couvrir :

* les collectes vides ;
* les modifications de structure HTML ;
* les délais réseau ;
* les erreurs répétées ;
* les contenus trop courts ;
* les changements de format ;
* les alertes après plusieurs échecs.

Le déclenchement automatique périodique doit être validé sur l’infrastructure de recette.

## Éléments à valider avant production

Les éléments suivants doivent encore être vérifiés en conditions réelles :

* fiabilité des sources importantes ;
* association automatique des médias ;
* collecte périodique ;
* règles de classement éditorial ;
* appels OpenAI réels ;
* contrôle des coûts IA ;
* performances avec un volume croissant ;
* sauvegarde et restauration ;
* exploitation HTTPS ;
* publication autonome ;
* supervision et alertes.

## Capacités d’exploitation à construire

Le dispositif de production devra comprendre :

* un environnement de recette ;
* une supervision centralisée ;
* des alertes ;
* une agrégation des erreurs ;
* une procédure d’incident ;
* un tableau de santé ;
* des releases versionnées ;
* une politique de sauvegarde ;
* un test de reprise après incident ;
* une procédure de retour arrière.

## Plan de travail priorisé

### Priorité 1 — Maintenir la gouvernance Git

* conserver le passage obligatoire par pull request ;
* maintenir la CI obligatoire ;
* inventorier les branches historiques ;
* fermer ou actualiser les travaux obsolètes ;
* définir une stratégie de versions et de releases.

### Priorité 2 — Choisir l’infrastructure

Choisir entre :

* une machine unique avec SQLite et volume persistant ;
* une base gérée accompagnée d’un stockage objet pour les médias.

Définir ensuite :

* la sauvegarde ;
* la restauration ;
* la rétention ;
* les secrets ;
* les journaux ;
* les alertes.

### Priorité 3 — Construire une recette réelle

* créer une URL HTTPS dédiée ;
* utiliser des données non sensibles ;
* déployer avec les fonctions IA fermées ;
* appliquer les migrations ;
* tester les parcours administratifs ;
* tester les parcours publics ;
* tester les médias ;
* tester une sauvegarde et une restauration ;
* tester un appel OpenAI contrôlé ;
* tester le retour arrière.

### Priorité 4 — Renforcer la qualité

* ajouter des tests E2E ;
* ajouter une détection automatisée des secrets ;
* ajouter une analyse statique ;
* ajouter l’audit des dépendances ;
* ajouter des smoke tests ;
* contrôler les migrations ;
* définir une politique de couverture.

### Priorité 5 — Stabiliser le produit

* finaliser la limitation des connexions ;
* fiabiliser les sources importantes ;
* confirmer la collecte périodique ;
* stabiliser les catégories automatiques ;
* renforcer les règles de la Une ;
* stabiliser les médias automatiques ;
* uniformiser les composants éditoriaux ;
* tester les arrivées simultanées d’articles.

### Priorité 6 — Réduire la dette technique

* inventorier les composants dupliqués ;
* retirer les variantes inutilisées ;
* découper les composants les plus volumineux ;
* actualiser le README ;
* clarifier la configuration Next.js ;
* nettoyer les branches obsolètes ;
* mettre en place une stratégie de releases.

## Suivi des priorités — 31 août 2026

### Rotation et protection de la clé OpenAI

État : **contrôle du dépôt terminé**.

* la clé utilisée par le projet a été remplacée récemment ;
* aucun motif correspondant à une clé OpenAI complète n’a été détecté dans les fichiers suivis ;
* les deux anciens commits signalés par une recherche large ne contiennent pas de motif de clé complet ;
* seul `.env.example` est suivi par Git et il contient des valeurs factices ;
* la révocation de l’ancienne clé doit rester confirmée dans le compte OpenAI.

### Collecte automatique toutes les 15 minutes

État : **socle techniquement prêt, activation différée jusqu’au choix de l’hébergeur**.

Les éléments déjà disponibles sont :

* la route interne `GET` ou `POST /api/internal/sources/collect` ;
* une authentification par `Authorization: Bearer <secret>` ;
* une comparaison sécurisée du secret ;
* le refus explicite de fonctionner sans `SOURCE_COLLECTION_SECRET` ;
* une taille de lot configurable par `SOURCE_COLLECTION_BATCH_SIZE`, égale à 10 par défaut ;
* des tests couvrant l’absence de secret, le secret invalide et le déclenchement autorisé ;
* un intervalle de collecte de 15 minutes par défaut pour les sources.

Aucun planificateur de production n’est encore configuré, car l’application n’est pas déployée et l’hébergeur sera choisi ultérieurement.

Au moment du déploiement, il faudra :

1. créer un secret de production distinct ;
2. configurer `SOURCE_COLLECTION_SECRET` chez l’hébergeur ;
3. appeler la route toutes les 15 minutes avec l’en-tête d’autorisation ;
4. contrôler les réponses HTTP et mettre en place une alerte en cas d’échec.

La prochaine priorité active est la fiabilisation des sources importantes qui ne produisent pas encore d’observations exploitables.

## Conclusion

Andorra 360 n’est plus un simple prototype.

Le cœur éditorial est conséquent, les fonctions métier sont nombreuses et la base de tests est sérieuse.

Le risque principal n’est plus l’absence de fonctionnalités, mais le passage trop rapide d’un environnement de développement actif à une exploitation autonome.

Les prochaines décisions doivent donc porter sur :

* l’architecture de production ;
* la persistance des données ;
* la sauvegarde et la restauration ;
* la recette distante ;
* la supervision ;
* la validation progressive des automatismes.

Ce document constitue le point de reprise public du projet au 30 août 2026.
