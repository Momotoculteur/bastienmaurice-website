## Introduction
Quand on veut construire des images Docker dans un environnement Kubernetes, plusieurs solutions s'offrent à nous. Mais toutes ne se valent pas. Ce cours va te guider à travers trois grandes étapes :

D’abord, on va comparer les outils les plus courants pour construire des images : Docker-in-Docker, Kaniko, et Buildx/BuildKit.

Ensuite, tu verras comment déployer une infrastructure BuildKit sur Kubernetes, capable de monter en charge.

Et enfin, on terminera par une mise en pratique avec une pipeline GitLab qui utilise ce cluster de build pour générer une image.

## Les outils de build : quelles différences, quels choix ?
Quand tu construis une image Docker dans un cluster, tu ne peux pas juste lancer un docker build comme en local. Il faut un environnement d’exécution qui supporte ça. Voici les trois grandes approches.

### Docker-in-Docker : la méthode "à l'ancienne"
Docker-in-Docker, ou DinD pour les intimes, consiste à démarrer un conteneur… dans lequel tourne le démon Docker lui-même. C’est comme si tu miniaturisais ton environnement Docker classique à l’intérieur d’un pod Kubernetes.

C’est simple à mettre en place, et ça fonctionne bien avec les outils Docker traditionnels. Mais ce n’est pas sans contrepartie. Pour fonctionner correctement, DinD a souvent besoin du mode --privileged, ce qui pose de gros problèmes de sécurité. Et dans un cluster, ce genre de contournement peut rapidement devenir instable. Bref, ça dépanne, mais on évite en production.

### Kaniko : la solution cloud-native
Kaniko a été créé par Google pour contourner les limites de DinD. L’idée est élégante : on construit une image Docker sans démon Docker, en lisant et en interprétant le Dockerfile directement.

C’est très séduisant, surtout dans un monde Kubernetes, car c’est sécurisé, simple à déployer et conçu pour fonctionner dans des environnements sans privilèges. Mais Kaniko a aussi ses limites : les performances ne sont pas folles, et le support de certaines fonctionnalités avancées de Dockerfile est incomplet.

### BuildKit + Buildx : la version moderne et puissante
Et puis, il y a BuildKit. C’est l’outil de build Docker nouvelle génération, développé par les créateurs de Docker. Il est pensé pour la performance, le parallélisme, et la construction distribuée. Buildx, c’est l’outil en ligne de commande qui permet de piloter BuildKit comme un chef.

Avec BuildKit, tu peux compiler pour plusieurs architectures, bénéficier du cache entre les builds, et connecter des workers sur différents nœuds. Bref, c’est rapide, moderne, et ultra flexible.

Alors pourquoi ne l’utilise-t-on pas partout ? Tout simplement parce qu’il demande un peu plus d’infrastructure. Il faut installer et configurer un pool de builders dans ton cluster.

## Déployer un cluster BuildKit sur Kubernetes (avec scaling)
Bon, maintenant qu’on a choisi notre arme (spoiler : c’est BuildKit), voyons comment mettre tout ça en place dans un cluster Kubernetes.

Une infrastructure à base de pods buildkitd
Le cœur de l’architecture, c’est un déploiement de pods qui exécutent le démon buildkitd. Chaque pod écoute sur un port gRPC et peut accepter des requêtes de build. Tu peux les exposer via un service Kubernetes classique (LoadBalancer, ClusterIP, etc.).

Tu peux démarrer avec 2 ou 3 pods, puis monter progressivement si besoin. Et si tu veux que le cluster adapte automatiquement sa capacité à la charge, tu peux ajouter un autoscaler (HPA ou même KEDA pour de l’event-driven).


## Intégrer BuildKit à GitLab CI : une pipeline simple et efficace
Maintenant, place à la pratique. Imaginons que tu veux builder une image Docker simple depuis un job GitLab, mais au lieu d’utiliser DinD ou Kaniko, tu veux utiliser ton pool BuildKit sur Kubernetes.


## Conclusion
BuildKit, c’est vraiment la solution la plus moderne et scalable pour construire des images Docker dans un environnement Kubernetes. Couplé à GitLab CI par exemple, il te permet de sortir des vieilles pratiques risquées (comme DinD), tout en profitant de performances et de flexibilité inégalées.

Et en prime, tu peux scaler ton infra BuildKit automatiquement, pour que ton cluster soit prêt à répondre aux pics de builds... sans jamais trop consommer en temps normal.
