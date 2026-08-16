# État des lieux général — Andorra 360

Date d’archivage : 16 août 2026  
Branche : `audit/studio-v4`

## Ce qui fonctionne

- Architecture du site et interface publique en place.
- Administration des sources, observations, articles et médias opérationnelle.
- Collecte RSS et HTML fonctionnelle.
- 63 sources actuellement accessibles.
- Collecte globale testée avec plusieurs centaines d’observations.
- Réécriture IA des articles et des titres activée pour les sources configurées.
- Traductions françaises, catalanes et espagnoles intégrées.
- Publication automatique fonctionnelle lorsqu’une observation respecte les critères.
- Contrôles d’auto-publication présents : longueur, contenu, source, confiance.
- Médiathèque disponible et utilisée pour les images.
- Pages éditoriales principales créées : Une, Actualité, Fil info, Économie, Société, Politique, Sports, Culture, Montagne, Loisirs.
- Organisation des sources par catégorie et niveau de confiance commencée.
- Vérification globale des sources disponible.

## Ce qui fonctionne partiellement

- Les sources accessibles ne produisent pas toutes des observations.
- Certaines sources nécessitent encore une règle spécifique : ARI, FAF, BCA et certaines pages institutionnelles.
- Certains contenus sont trop courts pour être publiés automatiquement.
- Les titres courts peuvent bloquer la publication.
- Les sources politiques doivent rester exclues de la Une.
- Les catégories des articles doivent encore être contrôlées systématiquement.
- Les photos automatiques sont disponibles, mais leur association doit être fiabilisée partout.

## Principal problème actuel

Les pages éditoriales restent dépendantes du nombre et de la longueur des articles disponibles. L’arrivée d’un nouvel article peut provoquer un déplacement vertical des blocs, un espace vide, une hauteur différente entre les cartes, un mauvais alignement entre deux colonnes, une mauvaise répartition des articles ou une erreur d’affichage/hydratation.

Des hauteurs fixes et des limites de titres ont été ajoutées sur plusieurs pages, mais l’ensemble n’est pas encore uniformisé.

## Automatisation

Le moteur suit le flux :

```
Source → collecte → observation → réécriture IA → traduction
→ contrôle éditorial → publication automatique
```

Le déclenchement automatique toutes les 15 minutes n’est pas encore confirmé en production. Les collectes sont surtout déclenchées manuellement depuis l’administration.

## Sécurité

Une clé OpenAI a été exposée précédemment dans un message. Elle doit être révoquée et remplacée avant la mise en production.

À vérifier :

- aucune clé dans GitHub ;
- aucune clé dans les logs ;
- variables de production correctement configurées.

## Sources

Dernière vérification connue :

- 63 sources conservées ;
- 63 accessibles ;
- 0 échec de disponibilité.

Sources restant à traiter au niveau de la collecte :

- BCA : flux ou page non reconnu ;
- FAF : page accessible mais zéro observation ;
- ARI : page accessible mais zéro observation ;
- sources avec contenus trop courts ;
- sources supprimées récemment à retirer éventuellement des variables `.env`.

## Reste avant la mise en production

### Priorité 1

1. Révoquer et remplacer la clé OpenAI.
2. Mettre en place le cron réel toutes les 15 minutes.
3. Corriger les sources importantes qui ne collectent rien.
4. Vérifier les catégories et les règles de publication.
5. Interdire définitivement les articles politiques en Une.

### Priorité 2

6. Uniformiser les hauteurs des blocs.
7. Limiter les titres et chapôs sans créer d’espaces incohérents.
8. Stabiliser les photos automatiques.
9. Corriger les erreurs d’hydratation et de syntaxe.
10. Tester l’arrivée simultanée de plusieurs nouveaux articles.

## Conclusion

Le site est fonctionnel en environnement local et le cœur de l’automatisation est en place. Il n’est toutefois pas encore prêt pour une production totalement autonome.

La priorité est maintenant de stabiliser les sources, la publication automatique, le classement éditorial, la mise en page, la sécurité et le déclenchement périodique en production.
