# État des lieux général — Andorra 360

_Date : 13 août 2026_

## Ce qui fonctionne

- Architecture du site et interface publique en place.
- Administration des sources, observations, articles et médias opérationnelle.
- Collecte RSS et HTML fonctionnelle.
- 63 sources actuellement accessibles.
- Réécriture IA des articles et des titres activée pour les sources configurées.
- Traductions françaises, catalanes et espagnoles intégrées.
- Publication automatique fonctionnelle lorsqu’une observation respecte les critères.
- Contrôles d’auto-publication présents : longueur, contenu, source et niveau de confiance.
- Médiathèque disponible pour les images.
- Pages éditoriales principales créées : Une, Actualité, Fil info, Économie, Société, Politique, Sports, Culture, Montagne et Loisirs.
- Vérification globale des sources disponible.

## Fonctionnement partiel

Certaines sources accessibles ne produisent pas encore d’observations exploitables. Des règles spécifiques restent nécessaires notamment pour ARI, FAF et BCA.

Certains contenus sont trop courts pour la publication automatique. Les titres courts peuvent également bloquer la publication.

Les sources politiques doivent rester exclues de la Une et les catégories doivent être contrôlées systématiquement.

## Principal problème actuel

Les pages éditoriales restent sensibles au nombre et à la longueur des articles disponibles. L’arrivée d’un nouvel article peut encore provoquer un déplacement vertical, un espace vide, une hauteur différente entre les cartes ou un mauvais alignement.

Des hauteurs fixes et des limites de titres ont été ajoutées sur plusieurs pages, mais l’ensemble doit encore être uniformisé.

## Chaîne d’automatisation

```text
Source
→ collecte
→ observation
→ réécriture IA
→ traduction
→ contrôle éditorial
→ publication automatique
```

Le déclenchement automatique toutes les 15 minutes n’est pas encore confirmé en production. Les collectes sont actuellement principalement déclenchées depuis l’administration.

## Sécurité

Une clé OpenAI ayant été exposée précédemment, elle doit être révoquée et remplacée avant la mise en production.

Il faut également vérifier qu’aucune clé ne figure dans GitHub, les logs ou les variables publiques.

## Sources

Dernière vérification connue :

- 63 sources conservées ;
- 63 accessibles ;
- 0 échec de disponibilité.

Les sources BCA, FAF et ARI nécessitent encore une adaptation de collecte. Les sources supprimées doivent également être retirées des variables `.env` si leurs identifiants y figurent encore.

## Priorités avant la production

1. Révoquer et remplacer la clé OpenAI.
2. Mettre en place le cron réel toutes les 15 minutes.
3. Corriger les sources importantes qui ne collectent rien.
4. Vérifier les catégories et les règles de publication.
5. Interdire définitivement les articles politiques en Une.
6. Uniformiser les hauteurs des blocs.
7. Limiter les titres et chapôs sans créer d’espaces incohérents.
8. Stabiliser les photos automatiques.
9. Corriger les erreurs d’hydratation et de syntaxe.
10. Tester l’arrivée simultanée de plusieurs nouveaux articles.

## Conclusion

Le site est fonctionnel en environnement local et le cœur de l’automatisation est en place. Il n’est pas encore prêt pour une production totalement autonome.

La prochaine phase doit se concentrer sur la stabilisation des sources, de la publication automatique, du classement éditorial, de la mise en page, de la sécurité et du déclenchement périodique en production.
