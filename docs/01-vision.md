01 - Vision
1. Objectif

ANDORRE 360 est une plateforme éditoriale autonome capable de détecter, comprendre, produire et publier des informations en continu, tout en permettant à un journaliste de reprendre le contrôle de n'importe quel sujet à tout moment.

2. Le fonctionnement global
                    SOURCES

      RSS • Sites • API • PDF • Réseaux sociaux
                       │
                       ▼
              MOTEUR DE VEILLE
        Détection des nouveautés
                       │
                       ▼
              MOTEUR STORY
    Création ou mise à jour d'une Story
                       │
                       ▼
              MOTEUR IA
      Rédaction • SEO • Réseaux sociaux
                       │
                       ▼
           MOTEUR ÉDITORIAL
      Placement dans le journal
                       │
                       ▼
          MOTEUR DE PUBLICATION
 Site • Facebook • WhatsApp • Newsletter

Ce schéma doit devenir la carte du projet.

3. Les trois acteurs

Il n'y en a que trois.

Les Sources

Elles produisent l'information.

Les Agents IA

Ils traitent l'information.

Les Journalistes

Ils prennent les décisions éditoriales.

Tout le reste n'est que de la technique.

4. Le cycle de vie d'une information
Information détectée

↓

Story

↓

Story enrichie

↓

Article

↓

Publication

↓

Mise à jour

↓

Archive

C'est ici qu'on explique pourquoi Story est l'entité centrale.

5. Les modes de fonctionnement
AUTO

L'IA décide.

Elle publie.

ASSISTÉ

L'IA prépare.

Le journaliste valide.

MANUEL

Le journaliste écrit.

L'IA observe.

6. Les règles fondamentales

Par exemple :

une Story ne peut avoir qu'un seul propriétaire actif ;
une publication est toujours liée à un article ;
un article est toujours lié à une Story ;
une Story peut avoir plusieurs sources ;
une source peut produire plusieurs Stories ;
un journaliste est prioritaire sur une IA ;
chaque décision est traçable.

Ces règles guideront tout le développement.

7. Les objectifs du produit

Je mettrais des objectifs concrets plutôt que des fonctionnalités.

Par exemple :

détecter une information officielle en moins de 5 minutes ;
éviter les doublons sur un même événement ;
publier automatiquement les contenus de routine selon les règles définies ;
permettre au journaliste de reprendre la main instantanément ;
conserver l'historique complet des décisions.
Ensuite...

Une fois ce document terminé, je passerais directement à 03-domain-model.md.

C'est là que, selon moi, le projet va vraiment changer de dimension. On ne parlera plus de tables Prisma, mais du métier :

Source
Story
Fact
Article
Publication
Edition
Agent
Workflow
Decision

À mon avis, il manque déjà une entité qui sera essentielle : Fact.

Pourquoi ? Parce qu'une Story est composée de faits.

Exemple :

Story : Le Gouvernement annonce une nouvelle aide énergétique.

Les Facts associés pourraient être :

le montant de l'aide ;
la date d'entrée en vigueur ;
les bénéficiaires ;
le lien vers le décret.

Si un communiqué est mis à jour, ce sont les Facts qui changent, pas nécessairement toute la Story. C'est ce niveau de granularité qui permettra à l'IA de détecter précisément ce qui évolue, de mettre à jour un article existant plutôt que d'en créer un nouveau, et de conserver une traçabilité complète. C'est une approche qu'on retrouve dans les systèmes de gestion de connaissances et elle me paraît particulièrement adaptée à la vision d'ANDORRE 360.