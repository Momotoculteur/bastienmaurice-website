---
date: 2023-08-11
authors: [bmaurice]
title: Les bonnes pratiques pour l'initialisation d'un nouveau projet Terraform (tf.state)
description: >
  test maurice
categories:
  - Terraform
tags:
  - Terraform
  - Infra as code
  - State
  - Remote backend
  - Provider
comments: true
---

# Les bonnes pratiques pour l'initialisation d'un nouveau projet Terraform (tf.state)

Je te montre les best practices pour ton Terraform State, en minimisant les erreurs manuelles, le leak de secrets, la gestion du locking. Bref, comment gérer le partage du tf.state dans une équiep de dév.  
Cas concret avec un remote backend sur du AWS Bucket S3 et DynamoDB.

<!-- more -->
<br>

J'ai souhaité récemment me faire un petit blog sur le net et l'heberger sur du AWS. J'ai voulu faire les choses propres et me faire mon infra as code avec Terraform. Mais avant de pouvoir plan et apply mes nouvelles ressources dont j'ai besoin, j'ai du me confronté à l'initialisation d'un projet Terraform.

<br>
Et si tu veux faire les choses bien, je peux te montrer quelques good practices concernant la gestion de ton tf.state ;)


Je te montre ça sur du AWS, mais tu peux faire exactement la même chose sur les autres clouds provider. Seul le noms des ressources vont changer de l'un à l'autre !

## Pré-requis
Tools :   

- Terraform

## tf.state
### C'est quoi ?
Quand tu vas définir la création, la mise à jour ou la suppression de ressource via des fichiers Terraform, lui même doit savoir dans quel ordre réaliser ces instructions. Les ressources ayant des specifications différentes, et des dépénendances entre elle plus ou moins forte, Terraform va se faire un bon gros fichier JSON resencent l'ensemble de ces instructions dans le bon ordre.

### Quels sont les soucis de ce tf.state ?
Aucun pour une utilisation simple. Realisant moi même en solo ce blog, je peux très bien faire un simple terraform init et commencer à dév mon infra sans soucis, le tout en local. Mais quid sur un vrai projet avec plusieurs dev travaillant ensemble ? C'est là ou les choses vont se compliquer.

- Partager le tf.state à plusieurs : Si chacun des membres de l'équipe doit mettre à jour cet infra, ils doivent pouvoir avoir librement accès à ce fichier
- Verouiller le tf.state : Soucis de bosser à plusieurs, c'est que ce fichier ne doit être utiliser que par une seule et unique personne sur un instant T. Si tu essayes de faire un accès concurrent à ce fichier tu peux finir avec une corruption du tf.state et mettre en peril ton infra
- Isoler le tf.state : Plus ton infra grandi, plus les plan/apply risque d'être long. Isoler en une multitude de plus petits tf.state te permet de travailler plus vite, et surtout en cas de soucis de ne pas casser toute ton infra.

### Comment partager ce tf.state ? 
#### Git ? Non !

Tu le sais déjà, mais on va être obliger à un moment donné d'utiliser Git. Mais cela n'est pas possible car cela engendre plusieurs problèmes :

- Erreur manuelle: on oublie trop souvent de pull le latest change sur ton repo Git, ça peut donc t'amener très rapidement à des régréssions d'infra
- Verouillage: Impossible de verouiller un fichier à un accès concurrentiel, qui empêcherais donc 2 membres d'une même équipe d'y accéder au même moment
- Secret: Et enfin le plus important, c'est que ce fichier tf.state contient tout les infos de ton infra en texte clair. Ce qui signifie que tout secret, token, ou données sensible peut être leak sur ton git.

#### Remote backend ? OUI !
C'est le feu car ça résolve les 3 problématiques que je viens de vous exposer :

- Erreur manuelle: Terraform va automatiquement charger le tf.state a chaque fois que tu effecue un terraform plan ou apply, et automatiquement renvoyer sur le remote backend le nouveau tf.state fraichement crée
- Verouillage: la plupart des remotes backend supportent nativement le locking. Et si quelqu'un d'autre à aquéri le lock à un instant T, tu vas devoir attendre qu'il ait fini. Il existe une commande, plutôt cet argument ci: *-lock-timeout=<temps>* qui te permet de dire à terraform d'attendre jusqu'a cette période là pour effectuer ta commande
- Secret: La plupart des remotes backend supportent aussi nativement l'encryptage, de configurer les permissions d'accès et donc de définir quel utilisateur à le droit

#### Exemple avec un AWS S3 bucket
Dans mon cas on va faire avec un service managé par AWS qui te rend ultra simple cet ajout là, le S3. Qu'apporte t-il ?

- Service managé, donc ballek de maintenir une infra supplémentaire pour ce cas d'usage
- Niveau durabilité et disponibilité, on est à 99,99.....%, donc tu crains pas d'avoir des soucis pour y acceder à tout heure
- Support l'encryptage, ce qui est plutôt cool avec les données sensibles stocké dedans le tf.state. Example avec de l'AES-256 niveau encryption côté Amazon, et on utilise du TLS pour la communication AWS <-> Terraform
- Verouillage avec du DynamoDB
- Versionnage: te permet de définir des incrementations de versions du tf.state, pratique donc de rollback sur une ancienne version si tu casses ton infra !
- Pas bien cher, tu va fit avec le free tier si tu veux tester pour t'entrainer !

## Let's code !
### Définition du provider
On commence par ajouter le provider : 

```terraform linenums="1"
# provider.tf
provider {
    region = "eu-west-3"
}
```

!!! note "Authentication du provider"
        Je le montre pas ici, mais tu dois permettre à Terraform de s'authentifier à ta console de management AWS. C'est pas la best practices, mais ici j'ai défini un **access_id** et **secret_id** généré depuis mon user root d'AWS dans un *./aws/* folder. Je ne défini pas de *profil_name* en particulier dans mon *provider*, donc il prend le default de base.

### Création du S3 Bucket
On défini notre S3 bucket. Il va nous permettre de garder sur disque notre tf.state.

```terraform linenums="1"
# state_s3.tf
resource "aws_s3_bucket" "s3_state" {
  bucket = local.bucket_state_name
  tags   = local.commonTags

  lifecycle {
    prevent_destroy = true
  }
}
```

!!! tips "lifecycle"
        Je rajoute un hook ici, une sécurité si je fais par mégarde un **terraform destroy**. Sans trop faire gaffe je pourrais delete le contenu de tout le bucket. Ici on n'empêche d'apply le destroy

<br>
J'ai utilisé des variables locales dans le code précédent, rien de particulier ici à préciser mais je te donne mes valeurs à titre d'example:
```terraform linenums="1"
# locals.tf
locals {
  bucket_state_name   = "bastienmaurice-website-infra-state"
  dynamodb_state_name = "bastienmaurice-website-infra-state"
}
```

### Ajout du versionning
On active le versionning sur notre bucket. Cela permet de générer un nouveau folder sur notre bucket pour chaque nouveau tf.state que l'on pousse, suite à une mise à jour de notre infrastructure. Pratique en cas de rollback à une version antérieur, si on casse tout à un certains moment ! 😉
```terraform linenums="1"
# state_s3.tf
resource "aws_s3_bucket_versioning" "s3_versionning" {
  bucket = aws_s3_bucket.s3_state.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

### Activation de l'encryptage
Histoire d'augmenter le niveau de sécurité, on encrypte le contenu du bucket S3. Super important, car tout token, secret et autre donnée sensible se retrouve en plain text sur le tf.state. Bonjour le leak si une persionne malveillante arrive sur ton bucket ! 😅

```terraform linenums="1"
# state_s3.tf
resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encryption" {
  bucket = aws_s3_bucket.s3_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

### Rendre le S3 privé
On va rendre le bucket en mode privée afin d'éviter que de mauvaises personnes mal-intentioné récup des infos sensible :
```terraform linenums="1"
# state_s3.tf
resource "aws_s3_bucket_public_access_block" "s3_access" {
  bucket = aws_s3_bucket.s3_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### Gestion du locking
On ajoute une table sous DynamoDB pour gérer le vérouillage du tf.state. C'est une DB géré par Amazon en mode distribué pour des paires clé-valeur. Une sorte de redis qui devrait d'avantage te parler.
```terraform linenums="1"
# state_dynamobdb.tf
resource "aws_dynamodb_table" "tf_lock" {
    name = local.dynamodb_state_name
    tags = local.commonTags
    
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "LockID"
    attribute {
        name = "LockID"
        type = "S"
    }
}
```

### Initialisation de l'infra - part1
A partir de là, tu peux commencer à faire un **terraform init**, puis **terraform plan** et enfin **terraform apply**. Tu vas avoir ton S3 Bucket et ta table sous DynamoDB de crées. 

!!! question
        Bizarre, je ne vois aucun tf.state dans mon bucket qui défini mon infra actuelle

<br>
Et c'est normal ma gueule. On à encore la sauvegarde du tf.state en local, vu que ton provider initiallement crée au début du tutoriel target ton local.
<br>

#### From Local Backend to Remote Backend
On touche du doigt la fin du chapitre. C'est ici que l'on va modifier notre configuration de notre provider, afin de lui dire d'aller target le backend disponible en ligne sur notre S3

```terraform linenums="1"
# providers.tf
terraform {
  required_providers { # Nouveau bloc
    aws = {
      source  = "hashicorp/aws"
      version = "5.11.0"
    }
  }

  backend "s3" { # Nouveau bloc
    bucket = "bastienmaurice-website-infra-state"
    key    = "terraform/state/terraform.tfstate"
    region = "eu-west-3"

    dynamodb_table = "bastienmaurice-website-infra-state"
    encrypt        = true
  }
}
```

- **required_providers**: un bloc permettant de définir une version du prodiver que tu uitlises, très utile si tu bosses sur la même infra avec plusieurs dév dessus.  ça t'évitera des soucis de compatibilité et avoir une version commun  
- **backend**: C'est ici que l'on target notre S3 fraichement crée. On y renseigne le nom de notre bucket qui contient notre tf.state, et aussi notre DynamoDB qui va gérer le locking de ce fichier, permettant les accès concurentiel et empêcher toute corruption de celui-ci

### Initialisation de l'infra - part2
Tu vas pouvoir refaire un second *terraform init*. A partir de là terraform va te dire que tu as déjà un tf.state en local, et va te demander si tu souhaites desormais l'avoir sur ton s3 en partant de ton actuel. Tape *yes* et Finito, tu as bien ton tf.state sur AWS et qui suit les bonnes pratiques :)


## Conclusion & résumé
Comme tu as pu le voir, tu as quelques manips à faire : 
1.  Ecrire une première partie de l'infra sous terraform pour créer ton bucket S3 et ta table sous DynamoDB avec un tf.state en local
2. Ajouter un remote backend et le configure pour qu'il puisse utiliser le S3 et ta DB précédement crée, et refaire un *terraform init* pour copier ton tf.state local que tu as déjà utilisé.

<br>
Petit tips, si tu veux supprimer ton infra existante, tâche de faire ces étapes à l'envers ; à savoir :

1. Supprimer le remote backend de la configuration terraform, et re-run le *terraform init* pour avoir ton tf.state en local
2. Premier terraform init/plan/apply.
3. Lance ton *terraform destroy* pour supprimer ton bucket S3 et ton DynamoDB
4. Second terraform init/plan/apply, avec migration de ton state local courant, vers le remote.

