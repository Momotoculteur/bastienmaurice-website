---
date: 2023-08-15
authors: [bmaurice]
title: Setter une Github Action pour deployer son infra-as-code (Terraform) sur AWS via OIDC
description: >
  test maurice
categories:
  - CICD
  - Terraform
comments: true
tags:
  - CICD
  - Terraform
  - AWS
  - OIDC
  - AssureRole
  - Github Action
  - Infra as code
---

# Setter une Github Action pour deployer son infra-as-code (Terraform) sur AWS via OIDC

Comment parametrer sa pipeline et ses credentials pour communiquer vers AWS depuis sa Github action, et utiliser ces services. <br><br>
Deploiement le tf.state de son Terraform vers un AWS S3 Bucket, deploy son infrastructure, etc.

<!-- more -->

Je continue de développer ce blog ci, et vains le moment ou j'ai voulu initialiser une première version de pipeline, avec Github Action. Je souhaite que pour toute PR qui est mergé sur ma branche master, que cela trigger un workflow.


## Pré-requis
Repo :  

- un répo configuré avec les github actions d'activé

Tool :  

- AWS compte déjà configuré


!!! tip "Github Self Hosted Runners"
    Pour t'éviter de cramer tes minutes gratos de github actions et de te retrouver à sec à ne plus pouvoir rien run, je te conseille de configurer ta machine pour heberger tes propres runners. T'as juste un .exe à éxecuter ça te prends 2min, et tu peux lancer autant de pipeline que tu veux sans te soucier de la consomation.


## Création de notre CICD (workflow, Github Action)
Pour l'exemple on va se baser sur le même exemple que j'ai fais pour automatiser ce site là. C'est un site sous MkDocs. On veut : 

### Main/Common
```yaml linenums="1"
# .github/workflows/cicd.yaml
name: cicd
on:
  workflow_dispatch:
  push:
    branches:
      - master 

permissions:
  id-token: write  # obligé pour request
  contents: read   # obligé pour action/checkout

env:
  BUILD_DIR: "public"
  BUCKET_NAME: "bastienmaurice.fr"
```

- **on**: ici je défini que je puisse trigger ma pipeline soit depuis l'interface web, soit sur un merge d'une PR sur ma branche master

- **env**: ici on s'en tape, ce n'est que des vars d'environnement propre à mon projet
<br>
!!! warning "Github Self Hosted Runners"

    permission: cette props est super importante. Si veux avoir la main pour requêter l'OIDC pour la demande de token JWT/jeton. 

<br>

Si tu veux la permission de request à travers tout ton workflow il te faut:
```yaml linenums="1"
# .github/workflows/cicd.yaml
permissions:
  id-token: write  # obligé pour request
  contents: read   # obligé pour action/checkout
```
<br>

Si tu veux request juste depuis un job:
```yaml linenums="1"
# .github/workflows/cicd.yaml

permissions:
  id-token: write  # obligé pour request
```

<br>
Plus tard je vais utiliser une props **runs-on** qui à pour value *self-hosted*. Ici je ne fais que run mes pipelines afin qu'elles target des runners qui sont labélisé *self-hosted*, qui tournent en local chez moi.


### Job Build
```yaml linenums="1"
# .github/workflows/cicd.yaml

jobs: 
  build:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11.4"
      - run: pip install -r requirements.txt
      - run: mkdocs build
      - uses: actions/cache/save@v3
        id: build_id
        with: 
          key: mkdocs-material-${{ github.event.repository.updated_at}}
          path: './${{ env.BUILD_DIR }}'
```

- **actions/checkout**: une action me permettant de checkout mon répository, sur ma branche ou tourne la pipeline, sur mon runner
- **actions/setup-python**: une action qui m'install python  

<br>
Par la suite je lance **pip** pour m'install mes dependances nécéssaire à mon projet python.  
Je build mon application Mkdocs, avec une commande de base de ce framerwork.

- **actions/cache/save**: cette action va me save en local le dossier de mon application web, fraichement buildé. Cela me permet de partager des données entre plusieurs jobs


### Job Deploy
C'est ici, le job le plus important. C'est ici que je vous montre comment configurer l'action github de AWS, afin de setter les credentials permettant de communiquer avec depuis le pipeline.

```yaml linenums="1"
# .github/workflows/cicd.yaml

deploy:
  runs-on: self-hosted
  needs: build
  steps:
    - uses: actions/cache/restore@v3
      id: build_id
      with:
        path: './${{ env.BUILD_DIR }}'
        key: mkdocs-material-${{ github.event.repository.updated_at}}
    - uses: aws-actions/configure-aws-credentials@v2
      with:
        role-to-assume: arn:aws:iam::288002323060:role/github-actions
        aws-region: eu-west-3
        role-session-name: githubactions
    - run: aws s3 sync --delete ./${{ env.BUILD_DIR }} s3://${{ env.BUCKET_NAME }}/
```

- **actions/cache/restore**: on récupère ici mon site web, du job précédent  

- **aws-actions/configure-aws-credentials**: c'est l'action de AWS. 
<br>

Voici les params obligatoires à décrire:
```yaml linenums="1"
# .github/workflows/cicd.yaml

- uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: arn:aws:iam::788:role/ton_role # l'IAM de l'assume role que tu créeras plus tard dans le tuto
    aws-region: eu-west-3                          # la région ou run tes services
    role-session-name: githubactions               # un nom de pour la session que tu lances ; utiles car apparaît dans tes logs
```

- **run: ....**: la commande finale. Maintenant que tu es authentifié, tu peux runs ce que tu veux :  
    - **terraform plan/apply/destroy...**: terraform va se connecter directement à ton Bucket S3 afin d'y récupérer son tf.state  
    - **aws s3 ....**: tu peux utiliser toute la CLI de AWS dans ta pipeline  
    - ...et bien d'autres !

## Création de l'identity provider (OIDC)
Il existe plusieurs façons de faire pour créer une authentication entre ta pipeline Github et AWS.

| **Identity Used**                                               | `aws-access-key-id` | `role-to-assume` | `web-identity-token-file` | `role-chaining` |
| --------------------------------------------------------------- | ------------------- | ---------------- | ------------------------- | - |
| [✅ Recommended] Assume Role directly using GitHub OIDC provider |                     | ✔                |                           | |
| IAM User                                                        | ✔                   |                  |                           | |
| Assume Role using IAM User credentials                          | ✔                   | ✔                |                           | |
| Assume Role using WebIdentity Token File credentials            |                     | ✔                | ✔                         | |
| Assume Role using existing credentials | | ✔ | | ✔ |

Ma première authentication du genre à été bête méchant. Récuperer un access_id et un secret depuis mon compte. Mais il existe deux soucis pour cette façon de faire. Alors oui je te l'accorde ça prends 2 copié collé et c'est très simple et rapide, mais pas la façon la plus secure de faire. De un, tu prends tes credentials de ton compte root. Tu te les fais voler d'un façon ou d'une autre, RIP. Le second points négatifs est que ce sont des crédentials que tu set une seule et une unique fois en var d'environnement de pipeline. Ils ne changent jamais et donc laisse une authentication à long terme.  
<br>

Pour ce tutoriel là, je te propose d'utiliser un OIDC. Flemme de t'expliquer ce que c'est, mais ça te permet d'avoir une authorité qui va aller intéroger AWS depuis ta pipeline, demander un token, qui lui sera temporaire. De plus, aucun credentials n'a besoin d'être configuré dans ton repository à la mano.  

La seule chose qui va apparaître dans ta pipeline sont :  

- **la région ou tourne tes services AWS**  
- **un assume role id (arn)**  


### Depuis la console AWS
1. On ouvre le service IAM
2. Onglet identity provider, créer un nouveau avec les infos suivantes:
    - **Type**: OpenID Connect
    - **Provider url**: token.actions.githubusercontent.com
    - **Public**: sts.amazonaws.com


### Depuis terraform
On récupère les infos d'un certificat TLS :

```terraform linenums="1"
# github-actions-runners-roles.tf

data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}
```
<br>
On créer notre ressource concernant le provider :
```terraform linenums="1"
# github-actions-runners-roles.tf

resource "aws_iam_openid_connect_provider" "github_actions_oidc_provider" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
}
```

## Création de l'IAM rôle qui va être assume par Github Actions
On peut desormais demander un token via l'identity provider configuré précédement. 

Il va nous falloir maintenant créer un rôle. On va devoir lui définir deux choses :

  - Une **Identity based policy** : celle-ci s'applique à un user, group ou rôle. Ici on souhaite ajouter des permissions d'accès à notre rôle. On va lui donner l'accès aux bucket S3, nous permettant d'upload notre site sur notre bucket.
  - Une **Ressource based Policy** : celle-ci s'applique seulement aux ressources, ici à notre S3. On souhaite ici restreindre qui peut assume ce rôle ( et donc avoir accès aux S3 buckets ), qui ne concerne que des identités qui ont reçu un token valide entre Gitub/AWS de notre OIDC crée précédemment, et qu'enfin cela ne puisse s'appliquer qu'a un seul repository 
  

### Depuis la console AWS
Ici on défini une politique pour assumer ce role. Ici on va donner le rôle précédement crée
1. On ouvre le service IAM
2. Crée un rôle
    - **Type**: web identity
    - **Identity provider**: token.actions.githubusercontent.com
    - **Audience**: sts.amazonaws.com
3. On ajoute les permissions. Ce sont les droits que vont avoir tes github actions, au sein de ton cloud provider. Pour l'exemple de cette pipeline qui ajout du contenu sur un S3 Bucket, j'ajoute seulement *AmazonS3FullAccess*
4. On ajoute une trust policy, celle-ci est un fichier JSON qui te défini pleins de chose.
```json linenums="1"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow", // L'action ici est une autorisation
            "Principal": {
                "Federated": "<iam_arn_de_ton_oidc_provider>" //
            },
            "Action": "sts:AssumeRoleWithWebIdentity", // te permet d'assumer un role si ton web identity t'y autorise
            "Condition": {
                "StringEquals": { // on veut une valeur égale strict
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": { // on veut une valeur qui respecte la condi, ici une * qui reprendre 'all'
                    "token.actions.githubusercontent.com:sub": "repo:Momotoculteur/bastienmaurice-website:*" // ici on target mon compte Github, sur un répo spécifique, dans sa globalité. Ce qui veut dire toute branche
                }
            }
        }
    ]
}
```
<br>

Example de policy pour une branche spécifique :
```json linenums="1"
"token.actions.githubusercontent.com:sub": "repo:<mon_compte_github>/<mon_repo>:ref:refs/heads/<ma_remote_branch>"
```


### Depuis terraform
On commence donc par crer le rôle, avec sa ressource based policy 
```terraform linenums="1"
# github-actions-runners-roles.tf

resource "aws_iam_role" "github_action_role" {  # Création d'un rôle
  name     = "github-actions-assume-role-access"

  assume_role_policy = jsonencode({   # Création de la policy
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow", # On autorise une action
        "Principal" : {
          "Federated" : "${aws_iam_openid_connect_provider.github_actions_oidc_provider.arn}" # On défini que cela provient de notre OIDC
        },
        "Action" : "sts:AssumeRoleWithWebIdentity", # L'action est d'assumer ce rôle via un token valide de l'OIDC
        "Condition" : {
          "StringEquals" : {
            "token.actions.githubusercontent.com:aud" : "sts.amazonaws.com",  # Communique avec le service de token de AWS
          },
          "StringLike" : {
            "token.actions.githubusercontent.com:sub" : ["repo:Momotoculteur/bastienmaurice-website:*"] # Ici on autorise d'assume le rôle de toute les branches d'un seul et unique répository github
          }
        }
      }
    ]
  })
}
```  

<br>
On a plus qu' attacher une idendity based policy à notre rôle. Maintenant que l'on a défini qui peut assume de rôle, on souhaite ajouter quel droit d'accès à notre rôle. Ici, on mentionne que l'on a tout les droits, à savoir lire un bucket, modifier, supprimer etc. Et cela concerne tout les bucket :
```terraform linenums="1"
# github-actions-runners-roles.tf

resource "aws_iam_role_policy" "github_action_role_permissions" {
  name = "github-actions-permissions"
  role = aws_iam_role.github_action_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:*"  # Droit de liste, update, supprimer, etc.
        ]
        Effect   = "Allow"
        Resource = "*"  # A le droit sur tout les bucket du compte
      },
    ]
  })
}
```
<br>

On souhaite avoir en sortie de *terraform apply* l'arn à inscrire dans notre github action du role à assume:
```terraform linenums="1"
# github-actions-runners-roles.tf

output "role_arn" {
  value = aws_iam_role.github_action_role.arn
}
```


## Update de l'IAM assume role de notre pipeline 
Maintenant que l'on a un identity provider, un rôle avec des droits, et un assume rôle défini sur ce rôle, on est bon. On n'a plus qu'a update une prop de l'action AWS dans notre pipeline pour setter les credentials. On récupère l'ARN de notre rôle et on l'ajoute comme ci-dessous :
```yaml linenums="1"
- uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: <arn_iam_de_ton_role_crée>
```