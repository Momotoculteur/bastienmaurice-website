## Introduction

Le traçage distribué est une technique permettant de suivre le parcours de requêtes à travers plusieurs services d'une architecture distribuée.  

Elle est essentielle pour surveiller et déboguer les systèmes complexes, où les requêtes peuvent traverser plusieurs microservices ou services dans le cloud.  

Des outils comme Grafana Tempo, Jaeger, et Zipkin offrent des solutions robustes pour gérer et analyser ces traces, en les stockant de manière optimisée dans une TSDB (Time Series Database).



---


## Qu'est-ce qu'une trace distribuée ?

Une trace est une série d'événements chronologiques capturant les étapes d'une requête au sein d'un système distribué.  

Chaque étape, ou span, représente une opération unique (comme une requête HTTP, une opération de base de données, etc.).  

Les spans sont regroupés pour former une trace, qui montre comment une requête se déplace à travers le système.


---


## TSDB pour le traçage

Les TSDB sont idéales pour le traçage en raison de leur capacité à gérer de grandes quantités de données chronologiques.  

En traçage, les traces sont indexées par leur horodatage et peuvent être interrogées pour analyser les performances et diagnostiquer les pannes.  

La TSDB permet de stocker efficacement les traces et leurs métadonnées pour des analyses en temps réel.


---


## Collecte et ingestion des traces - OpenTelemetry : la norme de collecte

OpenTelemetry est une norme ouverte pour la collecte de traces et de métriques dans les applications.  

Il permet de capturer les spans et de les exporter vers une solution de stockage compatible comme Tempo, Jaeger, ou Zipkin.  

Exemple de configuration OpenTelemetry pour envoyer des traces à un backend :  

```yaml
exporters:
  otlp:
    endpoint: "tempo-collector:4317"

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]
```


---


## Collecte et ingestion des traces - Ingestion des données

Les traces sont envoyées à la TSDB sous forme de spans, souvent via des collecteurs tels qu'OpenTelemetry Collector ou Jaeger Agent.  

Ces collecteurs permettent de recevoir des données de différents services et de les rediriger vers une base de données de traces.  


---


## Structure d'une trace et modèle de données - Spans et attributs

Chaque trace est composée de plusieurs spans. Un span contient :  
- Un identifiant unique.
- Un timestamp de début et une durée.
- Des attributs qui détaillent le contexte, comme le nom du service, l'URL appelée, les statuts d’erreurs, etc.
- Des relations parent-enfant entre les spans, montrant le chemin de la requête.


---


## Structure d'une trace et modèle de données - Indexation par trace ID et tags

Pour faciliter les recherches, chaque trace est associée à un Trace ID unique, qui permet de retrouver une trace spécifique.  

Des tags ou attributs supplémentaires, comme status="error" ou http.method="GET", permettent de filtrer et de rechercher les traces efficacement.


---


## Requêtage et analyse des traces - Requêtes de base

Les traces peuvent être interrogées par Trace ID ou filtrées en fonction de critères spécifiques.  

Par exemple, on peut vouloir voir toutes les traces d'un service spécifique ou identifier les erreurs rencontrées dans un chemin de requêtes.

Exemples de requêtes :

- Rechercher une trace par ID :
```
traceID = "abcd-1234"
```

- Rechercher les traces d'un service spécifique ayant des erreurs :
```
service="checkout" AND status="error"
```


---


## Requêtage et analyse des traces - Analyse des latences et erreurs

Le traçage permet d’analyser les latences et erreurs en visualisant le parcours complet d'une requête à travers différents services.  

Vous pouvez détecter les goulots d’étranglement en identifiant les spans les plus longs dans une trace et remonter aux services sources des erreurs.


---


## Optimisation du stockage des traces - Politique de rétention

Les traces peuvent nécessiter un stockage à long terme pour les audits ou à court terme pour une analyse immédiate.  

Une politique de rétention est donc essentielle pour gérer l’espace de stockage.  

Par exemple, les traces de requêtes réussies peuvent être conservées moins longtemps que les traces d’erreurs.

Exemple de configuration pour une rétention des traces de 7 jours dans Tempo :
```yaml
storage:
  trace:
    ttl: 168h  # 7 jours
```


---


## Optimisation du stockage des traces - Compression et indexation

Pour optimiser l’espace disque, les TSDB utilisent des techniques de compression et d’indexation.  

Les index permettent de retrouver rapidement les traces par leurs tags et attributs, et la compression réduit la taille des données stockées.


---


## Scalabilité et haute disponibilité - Scalabilité horizontale

Les solutions comme Grafana Tempo, Jaeger, et Zipkin permettent la scalabilité horizontale pour gérer des volumes massifs de données.  

Cela signifie que l’on peut ajouter des nœuds pour distribuer la charge et améliorer la performance des requêtes de traces.


---


## Scalabilité et haute disponibilité - Tolérance aux pannes

Ces solutions assurent la disponibilité des données en cas de panne d’un nœud. Les traces peuvent être répliquées sur plusieurs nœuds, de sorte que les données restent accessibles même si une partie de l'infrastructure tombe en panne.


---


## Bonnes pratiques pour le traçage distribué - Minimiser l'overhead

Bien que le traçage distribué soit utile, il peut ajouter un certain overhead aux applications.  

Assurez-vous de n'activer le traçage que pour les services critiques ou en mode débogage pour limiter l'impact sur la performance.



---


## Bonnes pratiques pour le traçage distribué - Utilisation efficace des tags

Les tags sont essentiels pour organiser et filtrer les traces.  

Choisissez des tags pertinents pour vos analyses (par exemple, service, env, http.method), et évitez d’en ajouter trop pour ne pas alourdir les requêtes et augmenter la consommation d’espace.


---


## Récap

L’utilisation d’une TSDB pour le traitement des traces permet d’obtenir une vue complète et chronologique des requêtes dans une architecture distribuée.  

Avec des outils comme Grafana Tempo, Jaeger, et Zipkin, vous pouvez facilement capturer, stocker, et analyser les traces de vos systèmes pour en assurer la performance et la fiabilité.  

En configurant correctement l’ingestion, le stockage et la requête des traces, vous disposez d’une solution puissante pour surveiller et optimiser vos applications distribuées.





