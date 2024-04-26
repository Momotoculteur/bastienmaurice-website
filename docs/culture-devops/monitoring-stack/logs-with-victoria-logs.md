## Présentation de VictoriaLogs
## Pré-requis
### Provider Terraform
Pour la suite du cours je vais te donner l'ensemble du code réaliser avec Terraform. Cela va nous permettre d'amener résilience et robustesse. On sera heureux d'un seul call terraform on puisse retrouver notre cluster en bonne santé :)

Utilisant déjà ArgoCD comme outils pour déploiyer nos helm charts, on va devoir utiliser un provider sous terraform. Je te montre ma configuration que j'utilise, sachant que j'utilise minikube avec un ArgoCD non exposé au net, donc juste appellable en local.


Ici tu peux utiliser soit le traditionnel **username:password** ou un **auth_token** généré par ArgoCD avec ton compte admin. On mentionne en context le nom de notre cluster, ainsi que le namespace ou est installé notre **argocd-server**.

```terraform linenums="1"
terraform {
  required_providers {
    argocd = {
      source  = "oboukili/argocd"
      version = "6.1.1"
    }
}

provider "argocd" {
  #auth_token                  = ".bjphcGlLZXkiLCJuYmYiOjE3MTQ"
  username                    = "admin"
  password                    = "2b0KGZnVMgGqg8y3"
  port_forward_with_namespace = "argocd"
  kubernetes {
    config_context = "minikube"
  }
}
```

!!! notes
    Pense à adapter le **password** que je renseigne avec le tiens, qui est dans le *secret* de ton cluster sous le nom de **argocd-initial-admin-secret**

## Installation



On va installer notre VictoriaLogs en mode **single**, c'est une version plus light que la version **cluster**, qui elle est vraiment dédiée pour des installations qui nécéssite une scalabilité hors-norme.


```terraform linenums="1"
resource "argocd_application" "victoria_logs" {
  metadata {
    name      = "victoria-logs"
    namespace = "argocd"
  }

  spec {

    destination {
      server    = "https://kubernetes.default.svc"
      namespace = "argocd"
    }

    sync_policy {
      automated {
        prune       = false
        self_heal   = true
        allow_empty = true
      }

      sync_options = ["Validate=true"]
      retry {
        limit = "5"
        backoff {
          duration     = "30s"
          max_duration = "2m"
          factor       = "2"
        }
      }
    }

    source {
      repo_url        = "https://victoriametrics.github.io/helm-charts"
      chart           = "victoria-logs-single"
      target_revision = "0.3.4"

      helm {
        release_name = "victoria-logs"
        values = yamlencode({
            # CUSTOM VALUES A AJOUTER
        })
      }
    }
  }
}
```



## Ajouter VictoriaLogs à Grafana
On va devoir pour cela ajouter le plugin [vl-grafana](https://github.com/VictoriaMetrics/victorialogs-datasource) dans Grafana afin de créer une data source propre à VictoriaLogs

### Pré-requis
On va installer le provider grafana afin de faire notre data source as code avec Terraform

Ici on fait simple, notre Grafana n'étant pas exposé, on va simplement faire un port-forward sur le pod de ce service. Je l'expose sur **http://localhost:3000/**

```terraform linenums="1"
terraform {
  required_providers {
    grafana = {
      source  = "grafana/grafana"
      version = "2.18.0"
    }
  }
}

provider "grafana" {
  auth = "admin:admin"
  url  = "http://localhost:3000/"
}
```

!!! notes
    Pense à adapter le **password** que je renseigne avec le tiens, qui est dans le *secret* de ton cluster sous le nom de **grafana**


### Création de la data source

Nous avons plus qu'a créer notre data source basé sur ce plugin custom. Pensez à mettre votre endpooint vers votre propre cluster VictoriaLogs.

```terraform linenums="1"
resource "grafana_data_source" "vl" {
  type = "victorialogs-datasource"
  name = "vl-datasource"
  url  = "http://victoria-logs-victoria-logs-single-server-0.argocd.svc.cluster.local:9428"
}
```

Nous pouvons désormais avoir accès à nos métriques stocké sur Victoria depuis Grafana !