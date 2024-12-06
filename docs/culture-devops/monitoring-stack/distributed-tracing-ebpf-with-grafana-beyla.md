# Tracing distribué avec eBPF

## Introduction
L'eBPF (Extended Berkeley Packet Filter) est une technologie permettant d'exécuter du code dans le noyau Linux sans modifier ce dernier. Initialement conçu pour filtrer les paquets réseaux, eBPF est aujourd’hui utilisé pour capturer et analyser les événements systèmes (syscalls, appels réseaux, etc.) en temps réel. Cette technologie est particulièrement puissante pour le tracing car elle peut observer des événements profonds au niveau du noyau avec une faible latence et sans affecter significativement les performances.

## Pourquoi utiliser eBPF pour le Tracing ?
**Visibilité en profondeur**  
eBPF peut observer tous les appels systèmes, les accès réseaux, et les événements de bas niveau, offrant une visibilité complète de l'exécution de l'application et de son environnement. Cela permet de capturer des événements qui ne sont souvent pas visibles avec les approches traditionnelles de tracing applicatif.

**Faible impact sur les performances**  
eBPF exécute le code au niveau du noyau Linux, ce qui le rend extrêmement performant et efficace. Contrairement à des outils de tracing user-space, il capture les événements de manière non-intrusive, sans modifier les processus utilisateurs ni ajouter de surcharge excessive.

**Flexibilité et extensibilité**  
eBPF peut être utilisé pour tracer différents types d'événements : appel réseau, accès aux fichiers, création de processus, etc. Il est facilement extensible pour créer des programmes de traçage adaptés à des besoins spécifiques.

**Cas d'Utilisation du Tracing avec eBPF**  

- **Surveillance des performances réseau** : Suivre et analyser les connexions TCP/UDP pour diagnostiquer les problèmes de latence réseau, de goulots d’étranglement, ou de pannes.
- **Détection d’anomalies** : Identifier des comportements suspects en analysant les appels systèmes inhabituels ou les volumes de trafic.
- **Suivi des ressources CPU et mémoire** : Observer l'utilisation des ressources pour chaque service, aidant à optimiser l’allocation des ressources dans des environnements multi-services comme Kubernetes.
- **Débogage d’applications** : Tracer en profondeur des applications natives ou des microservices dans un cluster Kubernetes pour identifier des latences ou des fuites de mémoire.

## Grafana Beyla

Grafana Beyla est un projet open-source de Grafana Labs, conçu pour la surveillance des applications au niveau de la performance et de l’expérience utilisateur. Son rôle principal est d’instrumenter les applications pour capturer des données de performances en temps réel, sans nécessiter de modifications de code.

### Collecteur de traces
Grafana Beyla est capable de capturer des traces applicatives qui mesurent les temps de réponse, la latence, et d’autres indicateurs de performance clés.  
En utilisant eBPF, Grafana Beyla peut instrumenter les applications directement au niveau du noyau, sans dépendance sur le code applicatif.

**Instrumentation Automatique avec eBPF**

- Grâce à la technologie eBPF (Extended Berkeley Packet Filter), Beyla intercepte les appels système et surveille les communications réseau, ce qui permet de capturer les traces et les métriques sans intervention directe dans le code.  
- eBPF offre une faible surcharge sur les performances, ce qui permet de monitorer les applications de manière plus efficace et discrète.

**Compatibilité et Envoi de Données**

- Grafana Beyla envoie les données collectées vers des systèmes de stockage de métriques et de traces, tels que Grafana Tempo pour les traces et Prometheus pour les métriques.  
- Les données peuvent ensuite être visualisées et analysées dans Grafana pour diagnostiquer les problèmes de performance, identifier les goulots d’étranglement et améliorer l’expérience utilisateur.


## Installation & configuration du Helm chart Beyla

```terraform
resource "argocd_application" "opentelemetry_beyla" {
    spec {
        source {
            repo_url        = "https://github.com/grafana/beyla.git"
            path            = "charts/beyla"
            target_revision = "v1.8.7"

            helm {
                release_name = "beyla"
                values = yamlencode({
                    env = {
                        "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" = "http://otel-collector.otel.svc.cluster.local:4317"
                    }
                    volumes = [
                        "/sys/kernel/security:/sys/kernel/security"
                    ]
                })
            }
        }
    }
}
```

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