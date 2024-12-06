# Tracing Applicatif

## Introduction
Le tracing est une méthode d'observation des performances et des flux de données dans les applications. Il permet d'identifier les latences, les goulots d'étranglement et les erreurs dans des environnements complexes. Le tracing peut être appliqué au niveau d'une application unique ou bien d'une architecture 
distribuée avec plusieurs services ou microservices interconnectés.

## Définition
Le tracing applicatif est un traçage focalisé sur les transactions et opérations internes d'une application unique. Il s’agit principalement de tracer des appels de fonctions ou des requêtes locales pour analyser les performances ou les problèmes internes de l’application.

## Utilisations
- **Débogage des erreurs internes** : Permet d’identifier les sections de code générant des exceptions ou des erreurs.
- **Optimisation de la performance** : Donne une vue sur la durée d'exécution de différentes opérations internes (comme les requêtes de base de données).
- **Analyse de la latence interne** : Évaluer les fonctions ou requêtes les plus lentes pour prioriser les optimisations.


## Zero-code VS code-based tracing

### Tracing avec SDK
L’OpenTelemetry SDK permet d’ajouter manuellement des traces dans une application en intégrant directement des instructions de traçage dans le code source. Cela offre un contrôle fin sur ce qui est tracé et sur la structure des traces.

#### Avantages
- **Contrôle précis** : Permet de choisir spécifiquement les fonctions, les appels ou les sections de code à tracer.
- **Personnalisation des métadonnées** : Possibilité d’ajouter des attributs personnalisés aux spans pour des analyses approfondies.
- **Suivi de cas d’usage spécifiques** : Peut tracer des segments de code particuliers, en excluant certaines parties non pertinentes pour le traçage.
 
#### Limitations
- **Temps de développement** : Nécessite plus de temps pour ajouter et maintenir le code de traçage dans l’application.
- **Risques d’erreurs** : Le traçage manuel peut introduire des erreurs si mal configuré ou si certaines sections sont omises.

### Tracing avec Instrumentation Automatique
#### Définition
L’instrumentation automatique consiste à utiliser un agent OpenTelemetry pour détecter et tracer automatiquement les bibliothèques couramment utilisées sans modifier le code source de l’application. Cette méthode utilise des plugins ou des agents pour ajouter des spans automatiquement dans l’application.

#### Avantages
- **Mise en place rapide** : Aucune modification du code source, idéal pour les projets où l’accès ou la modification du code est limité.
- **Uniformité** : Ajoute automatiquement les traces aux composants supportés (ex. bases de données, frameworks HTTP).
- **Maintenance réduite** : Moins de maintenance manuelle des traces, car l’agent se met à jour avec OpenTelemetry.

#### Limitations
- **Moins de contrôle** : Les traces sont générées automatiquement, limitant la personnalisation.
- **Impact sur la performance** : Les agents peuvent légèrement ralentir l’application, surtout si de nombreuses bibliothèques sont instrumentées.
- **Support limité pour certains frameworks** : Tous les frameworks ne sont pas pris en charge, ce qui peut limiter l’efficacité de l’instrumentation automatique dans des cas spécifiques.

### Comparaison entre OpenTelemetry SDK et Instrumentation Automatique

| Aspect                        | OpenTelemetry SDK                                  | Instrumentation Automatique                               |
|-------------------------------|----------------------------------------------------|----------------------------------------------------------|
| **Niveau de contrôle**        | Contrôle fin et complet                            | Contrôle limité (défini par l'agent)                      |
| **Facilité de mise en œuvre** | Temps et effort élevés                             | Mise en œuvre rapide, aucun code à modifier               |
| **Personnalisation des traces** | Forte personnalisation des spans                  | Personnalisation limitée                                  |
| **Portée des traces**         | Choix des points de traçage spécifiques            | Instrumente automatiquement les bibliothèques supportées |
| **Maintenance**               | Maintenance manuelle des traces                    | Maintenance de l'agent et des mises à jour de l'outil    |
| **Cas d'utilisation typique** | Applications nécessitant un suivi précis et ciblé  | Applications standards avec des bibliothèques supportées  |

### Best practice entre SDK et Instrumentation Automatique

- **Utiliser l'instrumentation automatique pour les services standards** : Si votre application utilise des frameworks ou bibliothèques supportés, l'instrumentation automatique est un choix efficace pour gagner du temps.
- **Combiner les deux approches** : En général, il est recommandé de combiner les deux, en utilisant l'instrumentation automatique pour le traçage des composants standards, puis le SDK pour ajouter des traces personnalisées pour les cas d'usage spécifiques.
- **Mesurer l’impact** : Assurez-vous de surveiller la surcharge éventuelle des performances et d’ajuster les paramètres d’échantillonnage des traces si nécessaire.
- **Documentation et maintien des traces** : En cas d’utilisation du SDK, documentez bien les points de traçage ajoutés pour faciliter la maintenance à long terme.





## Installation & configuration du Helm chart OpenTelemetry Operator

```terraform
resource "argocd_application" "opentelemetry_operator" {
    spec {
        source {
            repo_url        = "https://open-telemetry.github.io/opentelemetry-helm-charts"
            chart           = "opentelemetry-operator"
            target_revision = "0.74.0"

            helm {
                release_name = "opentelemetry-operator"
                values = yamlencode({
                    manager = {
                        extraArgs = [
                            "--enable-go-instrumentation=true"
                        ]
                        collectorImage = {
                            repository = "otel/opentelemetry-collector"
                        }
                    }
                })
            }
        }
    }
}
```

!!! info
    Ici je vous ais laissé un extra argurments pour la prise en compte d'applicaton Golang, qui ne le sont pas de base. Je voud le montre à titre d'example seulement car ici je test avec une application Python


Une fois que l'opérateur est bien installé avec ses CRDs, il va pouvoir interpreter nos prochains manifest YAML.

Nous devons initialiser 2 éléments :  
- Le collecteur général  
- l'injecteur du traceur   

### Mise en place du Zero-code (auto-instrumentation)
#### Mise en place du collecteur global
On commence ici par créer un nouveau fichier qui va nous permettre de déclarer un collecteur.

Ici, on le déploit en mode **deployment**, mais qui peut aussi s'installer en mode **daemon**. 

Voyez OTEL en mode **Agent** ou en mode **Aggregator** via ces 2 types d'installations.

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
  namespace: otel
spec:
  mode: deployment
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    exporters:
      debug:
        verbosity: "detailed"
    processors: 
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
```


#### Mise en place de l'injecteur de l'auto-instrumentation
On va expliquer ici tout la magie de l'auto-instrumentation.

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: auto-injector-python
  namespace: otel
spec:
  exporter:
    endpoint: http://otel-collector.otel.svc.cluster.local:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
  python:
    env:
      - name: OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED
        value: 'true'
```

Quelques parties à expliquer ici : 

- **propagators** : cela permet de savoir quoi remonter dans les traces, quel contexte y ajouter. Plus d'infos vers la [documentation](https://opentelemetry.io/docs/languages/sdk-configuration/general/#otel_propagators)  
- **sampler** : cela permet de savoir quand et comment remonter les traces. Plus d'infos vers la [documentation](https://opentelemetry.io/docs/languages/sdk-configuration/general/#otel_traces_sampler)

#### Installation d'une app à instrumenter
Afin d'indiquer à OTEL de surveiller tel ou tel pod, il va falloir rajouter des annotations particulières. Ici je te montre un example pour un simple serveur **Flask** sous **Python** packagé avec Helm

```yaml
#values.yaml
podAnnotations:
  "instrumentation.opentelemetry.io/inject-python"        = "otel/auto-injector-python"
  "instrumentation.opentelemetry.io/otel-python-platform" = "glibc" 
```

A vous de bien surveiller la documentation afin d'y ajouter le bon language, mais aussi le bon framework de serveur web.

Example de framework pris en charge (liste non exhaustive):  

  - **JavaScript (Node.js)**  
    - Express, Fastify...
  - **Python**  
    - Flask, Django, FastAPI...
  - **Java**  
    - Spring Boot, Jersey...
  - **.NET**  
    - ASP.NET Core, Kestrel...
  - **Go**  
    - Frameworks utilisant les modules standards HTTP de Go, etc...
  - **Ruby**  
    - Rails, Sinatra...
  - **PHP**  
    - Les bibliothèques d'instrumentation pour les frameworks PHP sont encore limitées mais en développement actif.

Liste des [languages disponible](https://opentelemetry.io/docs/zero-code/) pour l'auto-instrumentation.

La première annotation permet d'indiquer l'injecteur que l'on souhaite utiliser.  

Elle peut avoir plusieurs valeurs comme true, false, Instrumentation_Name, Namespace/Instrumentation_Name, etc.

On appelle injecteur car il va agir comme un init-container.


???+ question  
    Mais comment mon application l'intègre avec un init container ? Comment fonctionne cette instrumentation auto ?


Et bien cela fonctionne avec les mutating webhook.  

!!! abstract  
    Un mutating webhook est une fonctionnalité dans Kubernetes qui permet d’intercepter 
    et de modifier les requêtes envoyées à l’API Server avant qu’elles ne soient persistées dans etcd. C'est un mécanisme puissant utilisé pour ajuster ou enrichir dynamiquement les ressources Kubernetes lors de leur création, mise à jour ou suppression.

En résumé OTEL utilise certaines ressources de kubernetes, qui va permettre d'aller modifier à la volée mon chart qui installe mon application et va alors pouvoir injecter au niveau kernel les élèments qu'il a besoin afin de récuperer toute nos traces. Une sorte de middleware :)

### Mise en place du SDK (code-based instrumentation)

Le but ici c'est d'instrumenter nos applications par nous même. On va avoir un peu plus de boulot ici mais on va pouvoir avoir des traces aux petits oignons et ajouter d'un grains beaucoup plus fins nos traces.



#### Mise en place du collecteur global


```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
  namespace: otel
spec:
  mode: sidecar
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    exporters:
      debug:
        verbosity: "detailed"
    processors: 
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
```

#### Mise en place du sidecar pour le SDK
Ici j'indique avec un example d'une application **Golang** packagé avec Helm, avec le framework web **net/http**

```yaml
#values.yaml
podAnnotations:
  "instrumentation.opentelemetry.io/inject-go" = "otel/otel-collector"
  "instrumentation.opentelemetry.io/otel-go-auto-target-exe" = "/hello-world"
```

Cette première annotation peut avoir plusieurs valeurs comme true, false, OpenTelemetryCollector_Name, Namespace/OpenTelemetryCollector_Name, etc.

La seconde permet d'indiquer à OTEL le main de mon application Go.

Ce sont ces 2 annotations qui vont permettre  de demander à OTEL Operator de nous ajouter un sidecar a notre application (revient à ajouter un container à notre pod, dans d'autres termes).

A vous par la suite d'utiliser les SDK d'OTEL dans votre application pour envoyer vos traces vers le **sidecar du Pod**.