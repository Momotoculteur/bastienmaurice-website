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

!!!info
    Ici je vous ais laissé un extra argurments pour la prise en compte d'applicaton Golang, qui ne le sont pas de base. Je voud le montre à titre d'example seulement car ici je test avec une application Python


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

### Otel sidecar vs deploy ?


### Otel auto instrumentation
discuter OTEL en mode deploy + initcontainer injection by mutating webhook

### Otel SK instrumentation

