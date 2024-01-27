Si tu souhaites récupere les logs de tes services qui tournent dans un cluster Kubernetes, Prometheus, distribué par le groupe Grafana est la solution la plus commune. 

## Introduction

Je t'ai déjà présenté Vector.dev, développé par Datadog, qui est une meirveille permettant de la collecte de log, de métriques de sources variés. Un cas typique d'usage que tu peux rencontrer et que Vector ne peut remplir, et la collecte de logs/metrics pour des deploiement d'application en mode **Daemonset**.  

Je te montre ici comment utiliser Prometheus en remplacement pour ce genre d'usage.

## Pourquoi Prometheus ?
### Cas d'usage et faiblesse de Vector
Il se peut que tu deploies dans ton cluster des services en mode Daemonset. Ceux-ci on pour propriété de tourner une instance sur l'ensemble des noeux de ton cluster. Ce qui est pratique par exemple pour des services qui te remontent des métriques, telle que **cAdvisor**, **Node-Exporter**, etc. Ainsi cela te permet de monitorer les noeuds de ton cluster et de te remonter des informations bien utiles quant à son utilisation.

Tu souhaites donc avoir un agent qui tourne et qui puissent récolter ces métriques sur l'ensemble des noeuds. Chose facile quand tu as un seul noeud et une seule instance qui tourne avec Vector, mais qui n'est point possible si tu en a une multitude

Comment peut on donc addresser l'ensemble des instances de notre service qui tournent sur des noeuds différents ? 


### Prometheus & CRD
Kubernetes utilise des objets natif à lui. Exemple avec un Pod. 

Prometheus peut aller collecter nos logs de nos applications qui tournent en Daemonset via des objets à lui. Ceux-ci vont pouvoir être compris de Kubernetes via une CRD installé avec Prometheus.

!!! note
    **CRD**, pour Custom Ressource Definition. Cela permet de décrire de nouvelles ressources dans Kubernetes


### PodMonitor & ServiceMonitor
Prometheus va déclarer deux nouvelles ressources : 

- **PodMonitor**: permet de target un ensemble de pods 
- **ServiceMonitor**: permet de target unensemble de Service, et donc de pods

Ainsi le système de tracking des pods que l'on souhaite scrapper repose sur l'activation d'une de ces 2 CRD sur notre service de logs ou métriques. 



## Installation
Je te propose de l'installer via un Helm Chart, avec ArgoCD, sur ton cluster. Il existe une multitude de Prometheus, livré seul, via un opérateur, ou encore avec toute une stack all-in-one avec une Time-Series database du style Mimir.


Ici je voudrais te montrer Prometheus en tant que simple collecteur de logs. A toi de choisir ensuite une TSDB pour stocker les logs, que cela soit avec VictoriaMetrics, Mimir, Thanos, Cortex, etc.

Et pour avoir Prometheus qui soit juste un simple forwarder de logs, on doit activer le mode **Agent**, qui est *experimental* pour le moment, et utilisable qu'avec le chart de l'opérateur.

Let's go pour le chart **kube-prometheus-stack**. Je te montre pas en détails, claquer un Helm Chart reste très simple à faire.

### Configuration et optimisation
On va devoir configurer les values de notre chart. Ce chart propose de base de monitorer pas mal de chose dont on s'en tape un peu. Prometheus peu très vite être un service consommateur en CPU mais surtout en mémoire, donc autant bien maitriser et scrapper seulement les choses dont on a besoin.

Faisons un peut de netoyage en désactivant le self monitoring de l'opérateur :

```terraform linenums="1"
"defaultRules" = {
    create = false
}

prometheusOperator = {
    serviceMonitor = {
        selfMonitor = false
    }
}
```

<br>

On desactive les CRD pour les composants de base :
```terraform linenums="1"
kubernetesServiceMonitors = {
    enabled = true
}

alertmanager = {
    enabled = false
}

grafana = {
    enabled = false
}

kubeStateMetrics = {
    enabled = false
}

kubeApiServer = {
    enabled = false
}

kubeEtcd = {
    enabled = false
}

kubeScheduler = {
    enabled = false
}

nodeExporter = {
    enabled = false
}

kubeControllerManager = {
    enabled = false
}

coreDns = {
    enabled = false
}

kubeDns = {
    enabled = false
}

kubeProxy = {
    enabled = false
}
```

<br>

Le plus important maintenant est d'activer le mode **Agent**. On desactive le self monitoring. On définit un interval à laquelle on va scrapper nos applications par l'intermédiaire de nos CRD. Enfin, on défini un sink vers ou envoyer nos données scrappés. Je te montre un exemple de sink vers Grafana Mimir, et un second vers un Vector si tu souhaites faire de la customisation plus poussé de tes logs.

```terraform linenums="1"
prometheus = {
    serviceMonitor = {
        selfMonitor = false
    },
    agentMode = true
    prometheusSpec = {
        replicaExternalLabelNameClear    = true,
        prometheusExternalLabelNameClear = true,
        scrapeInterval                   = "60s",
        remoteWrite = [
            {
                url = "http://mimir-distributed-nginx.<mon_namespace>.svc.cluster.local/api/v1/push"
            },
            {
                url = "http://vector-aggregator-headless.<mon_namespace>:9090"
            }
        ]
    }
}
```

### Target les CRDS de nos applications via Labels
On a maintenant un Prometheus qui tourne via un opérateur, en mode Agent qui target les CRDs.  

On doit activer les **PodMonitor** ou les **ServiceMonitor** des services que l'on souhaite scrapper. Mais en plus de cela, on va devoir ajouter un **Label** sur ceux-ci afin qu'ils soit bien targetable. Pour cela je te montre un exemple : 

```terraform linenums="1"
prometheus = {
    monitor = {
        enabled = true
        additionalLabels = {
            // Label obligatoire pour être scrappé 
            "release" = "kube-prometheus-stack"
        }
        // Interval de scrapping
        interval = "60s",
        // Permet de customiser les metriques
        metricRelabelings = [
            {   // Exemple de ne garder que certaines métrics basé sur leurs noms
                sourceLabels = ["__name__"],
                regex        = "(metrics_1|metrics_...)",
                action       = "keep"
            }
        ],
        // Permet de customiser les labels des métriques
        relabelings = [
            {   // Exemple d'échange de nom de label
                sourceLabels = ["__meta_kubernetes_pod_node_name"]
                action       = "replace"
                targetLabel  = "new_label"
            }
        ]
    }
}
```

!!! tips
    Fait bien attention, de base avec cette stack, le label doit être **"release" = "kube-prometheus-stack"** pour être target par notre agent prometheus

### Tips pour cAvisor via Kubelet
Petite astuce dont je ne savait pas, est que Kubernetes fait tourner un cAdvisor de base via son kubelet. Pas besoin d'installer ce service soit même tu peux aller le scrapp directement comme ceci:

```terraform linenums="1"
kubelet = {
    enabled = true
    serviceMonitor = {
        cAdvisor     = true
        probes       = false
        resource     = false
        resourcePath = "/metrics/resource"

        // concerne que cAdvisor
        cAdvisorMetricRelabelings = [
            { 
                // Si tu souhaites keep seulement quelques metrics de cAdvisor
                sourceLabels = ["__name__"],
                regex        = "(metrics_1|metrics_2|metrics_...)",
                action       = "keep"
            },
            { 
                // Si tu veux drop certains label histoire de ne garder que les essentiels
                regex  = "(label_1|label_2|label_...)"
                action = "labeldrop"
            }
        ],
        // concerne tout kubelet
        metricRelabelings = [
            { 
                // Permet de ne garder que les metrics de cAdvisor et non du kubelet
                sourceLabels = ["__metrics_path__"]
                regex        = "/metrics/cadvisor"
                action       = "keep"
            }
        ]
    }
}
```

