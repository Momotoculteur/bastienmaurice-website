Vector est un tool de data pipeline. En quelques mots, il te va te permettre de récupérer pleins d'infos utiles, que cela soit des métriques, logs applicatif/d'erreur/d'infos, etc. Afin de les renvoyer vers une database afin d'y être stocker, et pourquoi pas exposer via des dashboard Grafana ou Datadog afin d'en créer de la valeurs, de te permettre de comprendre ce qui se passe dans ton cluster, et en cas de problémes, que celui-ci te soit remonter de façon simple et visuel sans devoir y mettre les mains dans le code afin de créer une alerte à tes équipes sous la forme que tu souhaites.

## Installation

- A la main façon kubectl
- ArgoCD ou FluxCD

## Principes d'une pipeline
Il est important de comprendre les concepts de bases d'une configuration d'une pipeline sous Vector, qui est composé de 3 principaux elements : 

1. Source
2. Transform
3. Sink

### Source
Vector va pouvoir ingérer des données. Que cela soit des métriques ou des logs, que cela viennent directement de kubernetes, de tes services applicatifs, ou d'autres services tiers, on appelle cela une **source**

<br>
Example d'une configuration : 
``` yaml linenums="1"
# vector-configmap.yml
sources:
    exemple_prometheus:
        endpoints:
        - http://mon_prometheus_service.mon_prometheus_namespace.svc.cluster.local:8080/metrics
        scrape_interval_secs: 30
        type: prometheu_scrape
```
Ici une première source example, *exemple_prometheus*, on imagine dans ton cluster k8s que tu aies un server prometheus qui s'occupe de scrap certains de tes pods applicatifs qui ont l'annotation adéquate de Prometheus pour être scrap. On va taper sur le endpoint du service qui gère ton prometheus pour récup les métriques voulu, une fois toute les 30secondes.

### Transform
Une fois que tu ingéres des données dans Vector, provenant de multiples sources, tu vas avoir un sacré tas de données en tout genre. On appelle un **transform**, toute étape qui permet de réaliser : 

- supprimer des champs dans tes métriques/logs
- les aggreger, faire toute opération mathématiques que tu souhaites
- les filtrer, router vers des structures plus complexe
- et bien d'autres opérations :)

<br>
Example d'une configuration : 
``` yaml linenums="1"
# vector-configmap.yml
transforms:
    example_filter:
        type: filter
        condition:
            type: vrl
            source: .name == "ma_metrique_voulu"
        inputs:
        - exemple_prometheus
```
Ici dans cette example, on à une étape de transformation, *example_filter*, qui va aller tester chacune de mes métriques provenant de ma source *exemple_prometheus*, afin de savoir si la props *name* vaut *ma_metrique_voulu*. Si c'est *true*, la métrique est gardé, dans le cas contraire celle-ci est supprimé depuis cet étape là. Tu peux avoir pleins d'autres types, comme la *route* qui te permet selon des conditions de splitter tes logs dans des composants séparé, un *remap* qui te permet de faire sur les props de tes logs des suppressions, des reformatages,  etc.

### Sink
Maintenant que tu as customisé tes données comme tu l'entends, tu va pouvoir les redirigerer vers toute sorte de sortie, appelées **sink**, comme par example :

- exporter les métriques vers un endpoint Datadog pour faire des dashboard
- exporter les logs applicatifs vers une database comme VictoriaMetrics ou Grafana mimir
- exporter des erreurs qui parte dans un PagerDuty pour de l'alerting
- etc.

<br>
Example d'une configuration : 
``` yaml linenums="1"
# vector-configmap.yml
sinks:
    example_output:
        type: prometheus_remote_write
        endpoint: "http://mon_vm_svc.mon_vm_namespace.svc.cluster.local/api/v1/write"
            healthcheck:
              enabled: false
        inputs:
        - "example_filter"
```
Ici on récupère la sortie du composant *example_filter*, et l'on va l'envoyer vers une instance VictoriaMetrics qui tourne dans notre cluster.

## Architecture Vector
Tu peux avoir plusieurs types d'architecture pour ton installation de Vector dans ton cluster. Je te fais plus bas quelques mots sur ces différentes architecture et use case que tu peux rencontrer. Je te met [ici](https://vector.dev/docs/setup/going-to-prod/arch/) si tu veux les consulter plus en détails.


### Aggregator
Pour des uses cases les plus simples, ou tu souhaites manipuler peu de data, opte pour l'architecture en  aggregator. Tu vas avoir un seul pod qui tourne et qui traite à lui seul toute les données (deployment)

### Agent
Pour une utilisation un peu plus intensive, passe en mode Agent. Tu vas avoir un pod par node qui tourne (daemonset)

### Unified
C'est le paradigme le plus conseillé. Haute disponibilité et resilience, tu vas utiliser les 2 modes précédents:  

- Chaque node aura un vector-agent qui tourne et qui va traiter les datas de son côté. Il va s'occuper de récuperer les données de son environement, les filtrer au maximum afin d'optimiser la suite.
- Un autre pod unique,  **vector-aggregator** qui tournera. Il va prendre en entrée, les données qui seront les outputs des pods des vector-agent. Il s'occupera comme son nom l'indique, d'aggreger toute ces données et de faire les différents outputs vers les services concernés.

<br>

!!! question
    Mais comment envoyer des logs d'un vector-agent vers un vector-aggregator ?

<br>

Example d'une configuration d'un vector-agent :
``` yaml linenums="1"
# vector-agent-configmap.yml
sink:
    vector_aggregator:
        address: vector-aggregator-headless.vector_agg_namespace:9000
        inputs:
        - une_datasource
        type: vector
```

<br>


Example d'une configuration d'un vector-aggregator :
``` yaml linenums="1"
# vector-aggregator-configmap.yml
sources:
    vector_agent:
        address: 0.0.0.0:9000
        type: vector
```

<br>

Libre à toi pour **vector-agent** d'y ajouter les *datasources* que tu souhaites parser.
Ainsi que pour **vector-aggregator** d'y faire les *remaps* que tu souhaites et de les envoyer vers un *sink* final.

## Quid de la meilleure data pipeline ? Vector VS Prometheus

Je parle qu'en bon de Vector. Comme quoi il outpass la concurrence en étant : 

- plus simple d'utilisation
- plus optimisé en CPU et memoire
- multitude de sources (data input)
- modification des données
- multitude de sinks (data output)
- racheté par Datadog, c'est pas n'importe qui qui suit ce projet 😉

Ce qui fait de lui un outils extremement complet. Mais attention à ne pas le remplacer partout dans votre collectes de logs et métriques. Un cas bien précis est mal géré de sa part, nous allons voir ça en détails.  


### Cas N°1 : scrap d'un service de type Deployment, Statefulset ou Replicaset - Vector win
On a vu plus haut le cas d'un service qui expose des métriques via un endpoint façons prometheus sur le **/metrics**. Pour ce genre de cas, on a aucuns soucis avec Vector il peut aller le scrap directement pour récuperer les données. Cela peut donc bien marcher pour des services tel que kube state metrics, un service à vous particulier avec un seul replica. Même si votre service scale, cela continue de fonctionner tant que votre endpoint expose les mêmes métriques. Vector pourra en scrap un via la redirection du service.


### Cas N°2 : scrap d'une multitude de service, de type Daemonset - Prometheus win

Mais quid d'un service, comme **cAdvisor** (vous donnes des métriques sur vos containers) qui tourne avec une instance sur chaque node de votre cluster, donc on mode **daemonset**. Ici si on a un seul Vector qui tourne on pourrait quand même avoir une config comme vu plus haut. 

Vous vous dîtes surement, si on utilise un Vector en mode Agent et non plus en mode Aggregator, on va pouvoir avoir un agent vector qui tourne sur chaque node, et qui va pouvoir communiquer directement avec le cAdvisor qui est sur son même noeud. Mais cela est impossible dans kubernetes, on est obliger de passer par le service de l'application qui elle même va rediriger la requête vers une instance du service. On aura bien entendu plus de métriques de scrapper étant donné que l'on utilise autant d'instance de vector que de cAdvisor, mais on ne peut garantir de tout remonter ce qui est problématique. Voilà une faiblesse de Vector.

<br>
Aucun soucis pour Prometheus qui va pouvoir grace à ses **CRD (custom ressource definition)**,  utiliser des **PodMonitor** ou des **ServiceMonitor**. Cela permet de communiquer sur l'ensemble des pods ou des services et donc de garantir de pouvoir remonter tout les informations de chaque instance de cAdvisor qui tourne sur l'ensemble du cluster. 


Attention donc au cas d'usage que vous rencontrez dans votre propre cas. A vous de coupler ces deux outils afin d'optimiser cout des ressources et fonctionnalités.
