---
date: 2023-08-11
authors: [bmaurice]
title: Créer un site web statique HTTPS/SSL avec AWS Bucket S3, AWS Zone53 (DNS), AWS CloudFront (CDN) et Terraform (IAC)
categories:
  - Terraform
  - AWS
tags:
  - Terraform
  - AWS
  - Zone53
  - Cloudfront
  - S3
  - CDN
  - DNS
  - site
  - statique
  - Infra as code
  - SSL
  - HTTPS
  - certificate
comments: true
---

# Créer un site web statique HTTPS/SSL avec AWS Bucket S3, AWS Zone53 (DNS), AWS CloudFront (CDN) et Terraform (IAC)

Je te montre comment deploy un site static sur AWS avec toute ton infrastructure as code avec Terraform :)   
Au programme du Bucket S3, Route 53 et CloudFront au programme.

<!-- more -->

Je vous propose d'heberger un simple site web statique sur AWS, pour un coût entre 1$ et 3$ le tout. Ce tuto est d'ailleurs écrit avec l'expérience obtenu en faisant ce propre blog :)

Et on va faire le tout bien propre, avec du Terraform.


## Pré-requis
Tools :  
- Terraform  
- AWS Cli

Compte:
- Compte AWS avec les bon IAM et roles défini

Projet:
- Un repository avec un projet terraform déjà initialisé/paramétré, auquel tu peux déjà faire tes plan/apply
- Un site statique déjà buildé

 
## Hebergement - AWS S3 Bucket
S3 pour Simple Storage Service te propose d'heberger n'importe quel type de données. Tu vois ton disque dur avec la vue de ton File explorer ? Ben c'est la même chose. On va se servir de ce service d'amazon pour envoyer les fichiers statiques et les render dans le browser du client.

### Locals nécéssaire
On commence par crér un fichier contenant des var locals que l'on risque d'utiliser souvent pour la suite du tuto 
```terraform linenums="1"
# locals.tf

locals {
  domain_name         = "bastienmaurice.fr"
  bucket_name         = "bastienmaurice.fr"
 
  commonTags = {
    createdBy     = "terraform"
    orga          = "Momotoculteur"
    repositoryFor = "bastienmaurice-website"
  }
}
```

Ici, le commonTags est juste recommandé pour se retrouver dans ta console d'AWS et faire la différence entre des ressources crées par terraform, et celle crée manuellement pour du testing.
On créer deux var :
- **domain_name** : nom de ton domaine, de ton site web.
- **bucket_name** : nom du bucket. Doit être identique à ton nom de domaine


### Bucket principal pour l'hebergement
On focus ici sur ton bucket principal. C'est lui que tu vas remplir des fichiers de ton site web.
```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket" "root_bucket" {
  bucket = local.bucket_name
  tags = local.commonTags
}
```

On rajoute la partie ownership :
```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket_ownership_controls" "root_owner" {
  bucket = aws_s3_bucket.root_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}
```

On va modifier la partie Public Access Block (ACL). Cela va nous permettre de rendre dans un second temps le bucket public. On ne peux mofidier cette visibilité sans désactiver ces blocs ci :



```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket_public_access_block" "root_access" {
  bucket = aws_s3_bucket.root_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
```

On peut maintenant modifier la visibilité de notre bucket, de privé à public:
```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket_acl" "acl_root" {
  bucket = aws_s3_bucket.root_bucket.id
  acl    = "public-read"  # cette prop ne peut être modifié sans le bloc précédent
  depends_on = [
    aws_s3_bucket_ownership_controls.root_owner,
    aws_s3_bucket_public_access_block.root_access
  ]
}
```

Ici on va activer le web hosting sur notre bucket, et mentionner la page principal et une page d'erreur :
```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket_website_configuration" "config_root" {
  bucket = aws_s3_bucket.root_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

}
```

Dernière étape, il faut que l'on ajoute une **Ressource based Policy**. Celle-ci va permettre à qui-quonque de lire le contenu de notre bucket S3 :
```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket_policy" "policy_root" {
  bucket = aws_s3_bucket.root_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
        ]
        Resource = [
          aws_s3_bucket.root_bucket.arn,
          "${aws_s3_bucket.root_bucket.arn}/*",
        ]
      },
    ]
  })
}
```


### Bucket secondaire pour la redirection
Ici, ce bucket secondaire est optionnel. Sa seul tâche à pour but de rediriger les requêtes www.ton-site.fr à ton-site.fr. 
Autant prendre ce cas d'utilisation 😀
 
 ```terraform linenums="1"
# s3.tf

resource "aws_s3_bucket" "www_bucket" {
  bucket = "www.${local.bucket_name}"
  tags = local.commonTags
}
```

On paramètre la configuration du bucket afin d'activer la redirection vers le bucket principal :
```terraform linenums="1"
# s3.tf
resource "aws_s3_bucket_website_configuration" "config_www" {
  bucket = aws_s3_bucket.www_bucket.id
  redirect_all_requests_to {  # on redirige toute requête 'www.' vers notre bucket principal
    # a changer une fois le certif
    protocol = "https"
    host_name = local.domain_name
  }
}
```
Le **protocol** est à changer selon tes souhaits. Soit tu laisses en http, soit tu mets le https. Mais dans ce dernier cas, tu devras rajouter un certificat SSL pour activer cette liaison sécurisé



## DNS
Alors ici, deux cas de figures possibles : 
- Soit vous vous la jouer gros rat et vous achetez votre nom de domaine au moins cher possible (ou vous en avez un sous le tapis qui prend déjà la poussière)
- Soit vous voulez pousser l'aspect Terraform un poil plus loin et/ou tout céder à AWS, et dans ce cas-là on utilise Route53

## Custom dns
Allez sur votre provider, et rendez vous sur l'onglet Zone DNS. Le but va être de repartir sur une base propre, et de supprimer toute entrée crée de base par votre provider.

On va ensuite rajouter la notre afin que le nom de domaine que vous avez acheté redirige vers l'adresse du AWS S3 bucket. Pour cela, ajouter un record dans votre Zone DNS :
- Subdomain: ceci est votre domaine, soit le nom de votre site. Chez moi, **bastienmaurice.fr**
- Hostname: ceci doit pointé sur l'adresse de votre S3 qui contient tout le contenu de votre site. Le mien est **http://bastienmaurice.fr.s3-website.eu-west-3.amazonaws.com**
- Type: il existe plusieurs types de record, ici on veut pointer un nom de domaine vers une adresse et non une IP, on choisi donc le type **CNAME**


### AWS Route53


### Nom de domaine par un autre provider
C'est ce que j'ai fais initialement ; Prendre mon nom de domaine sur un bon vieux OVH, ou j'ai déjà mon vieu Wordpress.

## Résumé & Fin - Partie 1 
On arrive ici à la fin de la première partie. On a actuellement :
- un bucket S3 qui sert de stockage de notre site web
- une zone DNS qui nous permet d'utiliser le nom de domaine que l'on a acheté, et de transiter les visiteurs sur notre bucket S3
- une redirection des requêtes en *www.* vers notre nom de domaine principal, grace au second bucket

L'atout majeur est que l'on reste sur une mise en place plutôt simple et rapide.

## Partie 2 - Certificat SSL et connexion sécurisé via HTTPS
Nous nous sommes arrêté sur un hebergement de site simple. Peut être même trop simple, car l'ensemble des données du bucket est entiérement public. Si l'on souhaite avoir quelque chose de plus secure pour la suite, je vous propose une seconde partie qui n'était pas prévue. On va générer un certificat SSL afin de garantir une connexion sécurité en HTTPS. Le tout bien sur via terraform 😀

Il y aura quelques partie du code à refactorer seulement :
- Rendre notre bucket principal privé, supprimer la ressource based policy présente, supprimer l'option de web static hosting
- Créer un service de CDN. C'est lui qui va faire le lien et recevoir la requête des utilisateurs. Il va ensuite faire suivre au bucket et avoir un pont sécurité via ssl. Ce n'est plus le bucket lui même qui renvoit les pages.
- Update notre DNS, et modifier le record actuel de notre nom de domaine pour qu'il pointe vers CloudFront et non plus vers le S3 bucket.
- Ajouter une nouvelle ressource based policy au bucket, permettant seulement l'accès de son contenu depuis CloudFront

## CDN
Ici en bonus, on peut aller plus loin et ajouter un CDN ; Celui-ci va permettre de répliquer notre contenu dans des serveurs un peu partout dans le monde, améliorant ainsi la disponibilité et latence de notre site. Ceci est donc clairement optionnel. Cloudflare en es un des plus connu.

### AWS CloudFront
Histoire de rester sur la même stack, je vous propose de test celui d'amazon.

### Modification de la politique du S3 Bucket

### Modification de Route53


TODO

1. Ecrire la partie terraform de la partie 1


2. Faire les modifs tf suivante
Changer route53 le record domain name de bastienmaurice => du website s3 au domain name de cloudfront

 
S3 principal
desactiver stockage site sur le principal
supprimer la policy courante + update de l'actuelle
rendre bucker prive (acl): ACLs disabled (recommended)



## Problèmes courants
### Nom de domaine transféré
Si tu as souhaité faire un transfert de domaine avant de te lancer sur ce tuto, tu peux tomber sur un soucis.
En effet, une fois le transfert fini vers ton nouveau cloud provider, il se peut qu'il ait gardé en configuration tes anciens DNS déclaré par ton ancien fournisseur. Le soucis ? Impossible de faire la validation de tes certificats, vu que ton ancienne zone DNS est supprimé.