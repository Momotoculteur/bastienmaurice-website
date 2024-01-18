## Presentation de la stack Grafana Mimir

Grafana Mimir c'est un peu LA stack de référence en terme de TSDB (Time Series Data Base) et la plus connue quand on parle d'observabilité pour les métriques. C'est un all-in-one.
On va s'intérésser ici à la version **distributed**, c'est à dire la version hautement scalable et qui est composé que de micro-services.

## Installation
Je te montre ici comment l'installer sous ArgoCD. On va y claquer le helm chart correspondant à **mimir-distributed** 

Cela va être à toi de choisir ce que tu veux comme element qui tourne sur ta stack, mais le minimal va être d'avoir ces services ci :  

- distributor: C'est lui qui reçoit en premier les métriques et qui va les distribuer  
- ingester: Reçoit les logs du distributor. Il va s'occuper d'aller écrire sur la TSDB database les données qu'il reçoit  
- compactor: au fur et à mesure que tu store des chunks de données, Mimir va stocker a terme, ces données à froid sur ton storage final depuis la mémoire qu'il va flush une fois qu'il réalise un block TSDB au complet. En compactant des donnée, cela permet d'avoir de meilleures perfs quand tu consultes d'anciennes données, et de limiter le stockage de ceux-ci à long terme  

<br>

!!! tips
    Pour des données dîtes *'hot'*, préfères une compression de type **snappy**. A l'inverse, pour des données de type *'cold'* préfère une compression de type **gzip**

### Configuration du compactor
Comme dit précédemment, Mimir va avoir une pile de mémoire ou il va recevoir les données en premier lieux. Une fois qu'il a reçu assez de donnée pour réaliser un block TSDB au complet, celui-ci va être **marqué** par le compactor.  

Cette étape consiste à compacter ce bloc qui contient des hot data, de les optimiser selon un algo en fonction de son timestamp, et de l'envoyer vers un storage long terme, comme un bucket AWS S3. Une fois celui-ci envoyé, il est flush de la mémoire de Mimir.

Le compactor pour réaliser ce job, va télécharger dans son coin les blocs afin de les optimiser, et cette opération peut vite échouer. Alors assure toi de lui laisser assez d'espace disque pour réaliser ses opération dans son coin :

``` terraform linenums="1"
compactor = {
    persistentVolume = {
        enabled = true
        size = "50Gi"
    }
}
```

## Long term storage des données 
### AWS S3 Bucket 
Il te faut un service pour stocker tes données si tu souhaites garder tes métriques afin de pouvoir les requêter depuis Grafana sur des mois et des mois. Ici je te propose simple en utilisant le service AWS S3. Configurons les values du helm chart afin de forcer Mimir à utiliser un storage de type s3 :

``` terraform linenums="1"
mimir = {
    structuredConfig = {
        blocks_storage = {
            s3 = {
                region      = "<mon_aws_region>"
                bucket_name = <mon_bucket_name>
                endpoint    = "s3.<mon_aws_region>.amazonaws.com"
            }
        }
    }
}
```

!!! note
    Si tu utilise d'autre services de Mimir, tel que alertManager ou le ruler, assure toi de bien les configurer vers ton long term storage aussi

Occupons nous de la création du bucket qui va être utilisé par Mimir : 
```terraform linenums="1"
resource "aws_s3_bucket" "mimir_bucket" {
  bucket = "mimir_bucket"
}
```

### Permissions 
On va devoir donner des permissions à notre Mimir afin qu'il communique entre notre cluster Kubernetes et notre service AWS précedemment crée. Ici on souhaite éviter les traditionnels access key et secret key pour deux choses :

- La première est que on préfère utiliser des short term credentials, question de sécurité via **sts** pour récupérer des tokens via un webidentityOIDC
- On n'écrit aucun secrets dans le code. Preferrez d'utiliser des iam role binder avec des iam policy et des trust relationship 

On va donc vouloir que le service account de Mimir puisse assumer un rôle, qui lui donnera le pleins droits pour accéder au bucket.

On commence par terraformer l'iam role qui serra assumé par le sercice account de Mimir. 
```terraform linenums="1"
resource "aws_iam_role" "mimir_role" {
  name = "mimir_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = "arn:aws:iam::<mon_compte_aws_id>:oidc-provider/<mon_oidc_prodiver_url>"
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringEquals = {
            "<mon_oidc_prodiver_url>:sub" : "system:serviceaccount:<namespace_ou_run_mimir>:<mimir_nom_du_service_account>"
            "<mon_oidc_prodiver_url>:aud": "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}
```

Celui-ci devra demander un token pour bien être authentifié et donc autorisé à avoir les autorisation suivante.

On continu ici par créer une policy, qui va être attaché au rôle prédent. Cette policy va décrire les accès que l'on va donner à Mimir
```terraform linenums="1"
resource "aws_iam_role_policy" "mimir_policy" {
  name = "mimir_policy"
  role = aws_iam_role.mimir_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : [
            "s3:AbortMultipartUpload",
            "s3:DeleteObject",
            "s3:GetObject",
            "s3:ListMultipartUploadParts",
            "s3:PutObject",
            "s3:ListBucket"
        ],
        "Resource" : [
          "${aws_s3_bucket.mimir_bucket.arn}",
          "${aws_s3_bucket.mimir_bucket.arn}/*"
        ]
      }
    ]
  })
}
```

Mais celle-ci va aller encore plus loin, via l'attribut ressource, permettant de définir ces accès là à seulement le bucket que je souhaite stocker les données.
 

Une fois le role créer, on va l'attribuer à notre service account de Mimir comme suit : 
``` terraform linenums="1"
serviceAccount = {
    create = true
    name   = "mon_service_account_name"
    annotations = {
        "eks.amazonaws.com/role-arn" = "${aws_iam_role.mimir_role.arn}"
    }
}
```


Arrivé ici, on devrait avoir une stack Grafana Mimir qui tourne bien sur Kubernetes. Celle-ci peut dès à présent recevoir des données, qu'elle ira stocker sur notre S3 Bucket via le role et ses autorisations données.



## Data pipeline
On souhaite maintenant avoir un outils qui tourne sur notre cluster k8s qui permet de scrapper des metrics et de les envoyer à Mimir afin d'y être traiter. Il existe une multitude d'outils pour faire ça, je t'en montre deux :

- Vector.dev: Racheté par datadog, c'est le plus complet. Il est très facile d'utilisation, extrement performant face à la concurence, et permet de manipuler simplement nos données. Il a une multitude de datasource pour y ingérer des données en input, et une multitude de sink en sortie pour envoyer les données. On l'utilisera en priorité selon le type de source, mais aussi pour les pods, service et container déployé en mode **replicaset**, **deployment**, ou **statefulset**.
- Prometheus: L'agent de base recommandé et developpé par Grafana. Il est cependant très gourmant. C'est pour cela que on va l'utiliser pour scrapper des metrics de pods, service et container déploye en mode **daemonset** uniquement

### Vector
#### Configuration general
Je vais pas trop perdre de temps à présenter comment le déployer via ArgoCD, mais on utilise comme d'habitude le helm chart associé. Je te donne un example de configuration Vector en mode Aggregator. Ce mode donne un seul replicat. Le mode agent s'apparente à le deployer en daemonset, non utile dans notre cas.


```terraform linenums="1"
role = "Aggregator"
```

#### Configuration sources
Je te propose ici un example simple, on imagine que l'on a un Kube-state-metrics qui tourne dans notre cluster, et qui expose sur son localhost:9090/metrics les metriques, exposer façon prometheus. On utilisera la configuration suivant pour récuperer les données :

```terraform linenums="1"
customConfig = {
    sources = {
        prometheus = {
            endpoints = [
                "http://kube-prometheus-stack-prometheus.<namespace_ou_run_ksm>.svc.cluster.local:9090/metrics"
            ],
            type                 = "prometheus_scrape"
            scrape_interval_secs = 60
        }
    }
}
```

!!! note
    Ici je te montre comment scrapper un endpoint d'un service, mais regarde la doc de Vector.dev il existe un nombre monumental d'inputs de services différents !!

#### Configuration transforms

On peux utiliser un tas de **transformation** provenant de Vector permettant de manipuler les données, de les supprimer, modifier, ajouter, d'y effectuer toute sorte d'opération mathématique, ou de renomage ou de fonction simple pour y ajouter de la logique.  

On pense à bien prendre en inputs la data source précedement crée :

```terraform linenums="1"
customConfig = {
    transforms = {
        filter_example = {
            type = "filter"
            inputs = [
                "prometheus"
            ]
        },
        remap_example = {
            type = "remap"
            inputs = [
                "prometheus"
            ]
        },
        {
            ...
        }
    }
}
```

#### Configuration sinks
Une fois que l'on a manipulé, et épuré nos données à notre souhait, c'est l'étape finale de l'envoyer à Mimir via un sink :

```terraform linenums="1"
customConfig = {
    sinks = {
        output_to_mimir = {
            type = "prometheus_remote_write"
            inputs = [
                "prometheus",
                //"filter_example",
                //"remap_example"
            ]
            endpoint = "http://mimir-distributed-nginx.<namespace_ou_run_ksm>.svc.cluster.local/api/v1/push"
            healthcheck = {
                enabled = false
            }
        }
    }
}
```

!!! warning
    Pensez à bien désactiver le healthcheck, sinon ça ne marchera pas

Et voilà, nos données partent désormais bien vers Grafana Mimir d'un façon simple et surtout cost effective.

### Prometheus
Dans cette example on va partir sur **kube-prometheus-stack**, qui comprends un opérateur pour installer et maintenir Prometheus.

On commence par quelques paramètres, notemment ici on ne souhaite pas self monitorer l'operateur 

```terraform linenums="1"
defaultRules = {
    create = false
}

prometheusOperator = {
    serviceMonitor = {
        selfMonitor = false
    }
}
```

Ce chart self monitor pas mal de services de base. Faisons simple et ne gardons que l'essentiel, je vais en desactiver quelques-uns :

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


Petite astuces ici optionnel, pour ceux qui souhaitent avoir les metrics de **cAdvisor**, pas besoin d'installer le chart correspondant. En effet, une version tourne déjà sur les nodes via le kubelet. On peut le scrap comme ceci : 

```terraform linenums="1"
kubelet = {
    enabled = true
    serviceMonitor = {
        cAdvisor     = true
        probes       = false
        resource     = false
        resourcePath = "/metrics/resource"

        cAdvisorMetricRelabelings = [
            {
                sourceLabels = ["__name__"],
                regex        = "(metrics_1|metrics2|...)",
                action       = "keep"
            },
            {
                regex  = "(label_to_drop_1|label_to_drop_2|...)"
                action = "labeldrop"
            }
        ],
        metricRelabelings = [
            {
                sourceLabels = ["__metrics_path__"]
                regex        = "/metrics/cadvisor"
                action       = "keep"
            }
        ]
    }
}
```

Ici on ne garde que les metrics de cAdvisor, mais vous pouvez récuperer celles provenant des probes ou des ressources. 

**cAdvisorMetricRelabelings** permet de manipuler les metrics. Ici j'y ais ajouté une rule permettant d'utiliser une regex pour n'en garder que quelques une, ou encore une autre regex me permettant de modifier certains label. 
**metricRelabelings** permet quand à lui de faire un second filtre, car ici on scrappe d'autres metrics de base en plus de celles de cAvisor. j'y ajoute une rule me permettant de ne garder que celle de cAdvisor.

Maintenant finissons par nous attaquer au plus important, à savoir envoyer nos données vers Grafana Mimir : 

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
                url = "http://mimir-distributed-nginx.<namespace>.svc.cluster.local/api/v1/push"
            },
        ],
    }
}
```

!!! tip
    Le mode **agent** de prometheus est une optimisation à ne surtout pas louper. En effet cela permet de configurer et d'utiliser Prometheus en simple scrapper, permettant d'éviter d'avoir une database d'instancier pour stocker les logs sur notre cluster, et donc une consomation de ressources plus conséquente et non utile dans notre cas. On l'utilise ici en tant que simple scrapper et forwarder de logs.

Mais quid de si je veux envoyer mes données non pas directement vers Mimir, mais vouloir les envoyer dans un vector aggregator afin d'y effectuer des transformations plus poussées que celle effectués précédemment ? Change juste ton **remoteWrite** : 

```terraform linenums="1"
{
    url = "http://vector-aggregator-headless.grafana-stack:9090"
}
```