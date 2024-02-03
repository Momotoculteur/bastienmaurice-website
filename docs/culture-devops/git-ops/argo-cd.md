## Introduction

Je te montre ici comment utiliser un outil de CD pour déployer des applications, packagé en Helm Chart, sur un cluster Kubernetes. On parlera notemment de méthodologie GitOps ;)

## Common Installation
On va appliquer le helm chart officiel dans le bon namespace que l'on souhaite

Version avec UI : 
```bash linenums="1"
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Version minimaliste :

```bash linenums="1"
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/core-install.yaml
```

On peut avec un port-forward sur le pod d'ArgoCD pouvoir acceder à l'UI pour manager notre cluster.

## Push based configuration

Je te propose ici si tu veux adapter une installation de ArgoCD en mode **push**. Avec ce mode de configuration, c'est toi qui pousse les changes sur ton cluster kubernetes.

Tu peux très bien gérer cela entierement avec l'UI fourni par ArgoCD lui même. Tu devrais néanmoins, pour avoir une approche Devops et avoir les best practices, faire cette configuration as code, avec Terraform par exemple. Mais imagine que ton cluster tomber pour n'importe quelle raison, tu perdrais toute ta configuration. Avec Terarform, un coup de **terraform apply** et tu retrouves en moins d'un minute ton cluster entier.

### Ajout d'une application via ArgoCD UI

La façon la plus simple et rapide, pour des projets de tests.

Je ne vais m'égarrer trop longtemps ici car c'est une opération simple. Allons sur l'ui via :

- Fait un port forward de ton pod **argocd-server**
- Récupère le secret du compte admin dans le secret **argocd-initial-admin-secret**
- Lance un navigateur sur localhost:8080, en utilisant les credentials du point précédent

<br>

Te voilà authentifié sur l'interface. C'est à partir de celle-ci que tu vas pouvoir créer une nouvelle application.

En créant une nouvelle application tu vas devoir remplir des champs pour indiquer à ArgoCD ou aller récuperer le Helm Chart qui va être appliqué au cluster : 
- URL git du repository
- Ajout de values pour configuration du chart
- Rentrer des metadata pour spécifier dans quel namespace tu souhaites faire tourner cette application, etc.


### Ajout d'une application via Terraform

C'est la façon que tu dois faire pour un cluster en production.

Ici on va passer par un provider Terraform qui va nous simplifier la vie. Celui-ci va être capable avec du code terraform, de communiquer avec notre instance d'ArgoCD, qui soit en local ou sur un cloud provider, et d'appliquer nos applications, nos configurations, etc.

<br>

#### Update Admin roles

On commence par modificer notre confimap argocd-cm, afin d'ajouter des droits à notre user, qui ne peut seulement se logger actuellement à l'interface : 
``` yaml
data:
    accounts.admin: apiKey, login
```

<br>

Nous pouvons aller dans ArgoCD afin de créer un token d'authentification, utilise pour notre provider dans terraform.  
`Settings -> Account -> Admin -> Generate new token`

<br>

#### Mise en place du provider Terraform

On commence par setter notre local backend qui contiendra notre tf.state, on fait simple. On créer un nouveau fichier provider.tf avec ce contenu ci :

``` terraform
# provider.tf

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
  required_providers {
    argocd = {
      source  = "oboukili/argocd"
      version = "6.0.3"
    }
  }
}
```

On initialise notre installation avec un `terraform init` qui va nous permettre de récuperer les infos du providers.

On peut noter l'ajout d'un provider custom disponible sur la marketplace de Terraform. On peut y ajouter un module qui provient de la communauté. Il va nous faciliter l'ajout d'application :)

<br>

On vient de configurer les providers essentiels à notre projet. On va maintenant configurer notre provider afin qu'il puisse communiquer avec notre cluster et déployer de nouvelles applications via ArgoCD. 

``` terraform
# provider.tf

provider "argocd" {
  auth_token                  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJhZG1pbjphcGlLZXkiLCJuYmYiOjE3MDY5NzI3MzYsImlhdCI6MTcwNjk3MjczNiwianRpIjoiNDFhNTEyNDAtOTUwOC00MGY5LTkzZmQtZjcyY2E5NTgxZGNiIn0.mY8zRxOFqvCaQDWlcwGJ8Cqqe48Fr0qgdhFFYcPgMMM"
  port_forward_with_namespace = "argocd"
  kubernetes {
    config_context = "minikube"
  }
}
```

Ici on défini plusieurs choses : 

- **config_context**: c'est le nom de notre cluster
- **port_forward_with_namespace**: dans quel namespace se situe notre ArgoCD
- **auth_token**: ici c'est le token généré dans l'étape précédente


On est maintenant capable de réaliser un `terraform plan`.


### Installation d'un Helm Chart

Comme exemple je vais montrer comment installer un Helm Chart, avec comme service kube-state-metrics.

Je créer un nouveau fichier qui va contenir l'ensemble de la configuration de mon chart :

``` terraform
# app_ksm.tf

resource "argocd_application" "ksm" {
    ...
}
```

<br>

Le premier bloc que l'on défini dedans, si on fait les choses proprement, est de définir des labels. Cela nous permettra de classer nos applications. Utile en production quand tu auras des centaines d'applications.

``` terraform
# app_ksm.tf

metadata {
    name      = "ksm"
    namespace = "argocd"
}
```

<br>

On défini ensuite la destination du chart, ou dans le cluster on souhaite l'installer. Je mentionne mon cluster local, et un namespace.

``` terraform
# app_ksm.tf

spec {
    project = "argocd"

    destination {
        server    = "https://kubernetes.default.svc"
        namespace = "argocd"
    }
}
```

<br>

Ici je défini une politique de comment je souhaite que mon application soit réconcilié par ArgoCD. Définir le comportement de comment je souhaite appliquer mon helm chart, de comment il se comporte si l'installation echoue, ou si une mise à jour d'un chart existant fail, etc.

``` terraform
# app_ksm.tf

spec {
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
}
```

<br>

Ici je défini l'application, le chart que je souhaite installer avec une version.
``` terraform
# app_ksm.tf

spec {   
    source {
      repo_url        = "https://prometheus-community.github.io/helm-charts"
      chart           = "kube-state-metrics"
      target_revision = "5.16.0"
    }
}
```

<br>

Tu n'as plus qu'a renseigner les values que tu souhaites pour customize ton chart comme bon te semble.

``` terraform
# app_ksm.tf
spec {   

    source {

        helm {
            release_name = "kube-state-metrics"

            values = yamlencode({
                resources = {
                    limits = {
                    cpu    = "100m"
                    memory = "256Mi"
                    },
                    requests = {
                    cpu    = "50m"
                    memory = "64Mi"
                    }
                }
            })
        }
    }
}
```

<br>

**Tadaaa ! Ta première application déployé avec ArgoCD :)**

![kube-state-metrics](./img/kube-state-metrics.png)

## Pull based configuration

Ici je te propose la version en mode **pull**. Cela veut dire que l'on va avoir un opérateur dans notre cluster qui va s'assurer que la configuration des applications défini dans notre repository Git, est bien en accord avec ce qui tourne à un instant T dans notre cluster. Ainsi, lors d'un commit, d'une PR ou tout changes sur la branches Master/Main, puisse trigger le controller sur notre cluster pour applique les changes, update ou autres modification sur le cluster en temps réel.