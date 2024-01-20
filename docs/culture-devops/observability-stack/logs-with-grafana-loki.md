## Présentation de Grafana Loki
On connait tous la stack Grafana Mimir qui permet de gérer le stockage des métriques. Grafana Loki est la même chôse, mais pour les logs. 

### Type de database

## Installation
Je te montre ici comment installer cette stack sur un cluster kubernetes. Pas trop de complication via ArgoCD, on applique bête et méchant le helm chart **loki-distributed**, c'est à dire la version hautement scalable et qui est composé que de micro-services. 

!!! note
    Si tu veux juste essayer la stack avec quelque chose de plus simple sans prise de tête, préfère utiliser le chart **loki** qui est la version monolitic, ou la verson **loki-simple-scalable** qui est une version simplifié de la distributed

TODOOOOOOOOOOO 
On dispose de ces micro-services à la suite de notre installation : 
- distributor: 
- ingester: 
- compactor:

## Configuration et optimisation

## Long term storage des données 
### AWS S3 Bucket 
Il te faut un service pour stocker tes données si tu souhaites garder tes métriques afin de pouvoir les requêter depuis Grafana sur des mois et des mois. Ici je te propose simple en utilisant le service AWS S3.

Occupons nous de la création du bucket : 
```terraform linenums="1"
resource "aws_s3_bucket" "loki_bucket" {
  bucket = "loki_bucket"
}
```


### Configuration du stockage des index
Loki utilise permet au cours du temps de changer les schema du contenu que l'on stock. Cela permet de faire des mise à jour de nos données sans tout casser. Pour cela on va stocker des version de schéma qui vont être daté. Nos données ingéré suivront donc une version spécifique du schéma. On va stocker celui-ci sur AWS S3.

```terraform linenums="1"
loki = {
    schemaConfig = {
        configs = [
            {
                from = "2024-01-01"
                index = {
                    period = "24h"
                    prefix = "index_"
                }
                object_store = "s3"
                schema       = "v12"
                store        = "tsdb"
            }
        ]
    }
}
```

On mentionne ici l'utilisation d'une **tsdb** (time series database) qui est recommandé par Grafana, et qui est la nouvelle génération. On mentionne le s3 comme **store**

### Configuration des chunks de data
On va devoir indiquer à loki comment sauvegarder nos données compactés.

```terraform linenums="1"
loki = {
    structuredConfig = {
        aws = {
            s3               = "s3://${aws_s3_bucket.loki_bucket.region}/${aws_s3_bucket.loki_bucket.id}"
            bucketnames      = aws_s3_bucket.loki_bucket.id
            //endpoint       = "s3.${aws_s3_bucket.loki_bucket.region}.amazonaws.com"
            region           = aws_s3_bucket.loki_bucket.region
            s3forcepathstyle = true
        }
    }
}
```

!!! warning
    Ne pas renseigner la property **endpoint** si vous utilisez des shorts term credentials via le service sts de AWS pour s'authentifier via webIdentityProviderOIDC, celle-ci cause une issue

<br>

On set certains directories ou on va utiliser le cache, et le stockage des données sur le s3 
```terraform linenums="1"
loki = {
    structuredConfig = {
        tsdb_shipper = {
            active_index_directory = "/var/loki/data/loki/tsdb-shipper-active"
            cache_location         = "/var/loki/data/loki/tsdb-shipper-cache"
            shared_store           = "s3"
        }
    }
}
```

<br>

On set aussi le directory du filesystem 
```terraform linenums="1"
loki = {
    structuredConfig = {
        filesystem = {
            directory = "/var/loki/data/loki/chunks"
        }
    }
}
```


### Configuration des autres composants
On va utiliser le compactor fin d'ajouter une rétention max, sur la durée, de nos données stocké sur le s3 afin de ne pas exploser notre quota aws :
```terraform linenums="1"
loki = {
    structuredConfig = {
        compactor = {
            retention_enabled      = true
            retention_delete_delay = "48h"
            shared_store           = "s3"
            working_directory      = "/data/compactor"
        }
    }
}
```
Ici je montre comment garder que les logs dont l'ancienneté est inférieur à 2j.

<br>

Enfin une petite optimisation, est de passer la compression de gzip à snappy pour des données de type chaude :
```terraform linenums="1"
loki = {
    structuredConfig = {
        ingester_client = {
            grpc_client_config = {
                grpc_compression = "snappy"
            }
        }
    }
}
```

!!! tips
    On préfère néanmoins l'inverse, à savoir la compression gzip pour des données de type froide

### Permissions 

On commence par terraformer l'iam role qui serra assumé par le sercice account de Loki. 
```terraform linenums="1"
resource "aws_iam_role" "loki_role" {
  name = "loki_role"

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
            "<mon_oidc_prodiver_url>:sub" : "system:serviceaccount:<namespace_ou_run_loki>:<mimir_nom_du_service_account>"
            "<mon_oidc_prodiver_url>:aud" : "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}
```

Celui-ci devra demander un token pour bien être authentifié et donc autorisé à avoir les autorisation suivante.

<br>

On continu ici par créer une policy, qui va être attaché au rôle prédent. Cette policy va décrire les accès que l'on va donner à Loki
```terraform linenums="1"
resource "aws_iam_role_policy" "loki_policy" {
  name = "loki_policy"
  role = aws_iam_role.loki_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:ListBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        "Resource" : [
          "${aws_s3_bucket.loki_bucket.arn}",
          "${aws_s3_bucket.loki_bucket.arn}/*"
        ]
      }
    ]
  })
}
```

Mais celle-ci va aller encore plus loin, via l'attribut ressource, permettant de définir ces accès là à seulement le bucket que je souhaite stocker les données.
 
<br>

Une fois le role créer, on va l'attribuer à notre service account de Loki comme suit dans les values du chart : 
``` terraform linenums="1"
serviceAccount = {
    create = true
    name   = "mon_service_account_name"
    annotations = {
        "eks.amazonaws.com/role-arn" = "${aws_iam_role.loki_role.arn}"
    }
}
```

Arrivé ici, on devrait avoir une stack Grafana Loki qui tourne bien sur Kubernetes. Celle-ci peut dès à présent recevoir des logs, qu'elle ira stocker sur notre S3 Bucket via le role et ses autorisations données.

### Promtail
### Vector
