Je vous propose d'heberger un simple site web statique sur AWS, pour un coût entre 1$ et 3$ le tout. Ce tuto est d'ailleurs écrit avec l'expérience obtenu en faisant ce propre blog :)

Et on va faire le tout bien propre, avec du Terraform.

Cheminement du tuto : 
1- Terraform du S3 Bucket

## 0. Pré-requis
- Terraform
- AWS Cli
- Compte AWS avec les bon IAM et roles défini
- Un site statique déjà buildé

## 1. Hebergement 
### 1.1 AWS S3 Bucket
S3 pour Simple Storage Service te propose d'heberger n'importe quel type de données. Tu vois ton disque dur avec la vue de ton File explorer ? Ben c'est la même chose. On va se servir de ce service d'amazon pour envoyer les fichiers statiques et les render dans le browser du client.

## 2. DNS
Alors ici, deux cas de figures possibles : 
- Soit vous vous la jouer gros rat et vous achetez votre nom de domaine au moins cher possible (ou vous en avez un sous le tapis qui prend déjà la poussière)
- Soit vous voulez pousser l'aspect Terraform un poil plus loin et/ou tout céder à AWS, et dans ce cas-là on utilise Route53

## 2.1 Custom dns
Allez sur votre provider, et rendez vous sur l'onglet Zone DNS. Le but va être de repartir sur une base propre, et de supprimer toute entrée crée de base par votre provider.

On va ensuite rajouter la notre afin que le nom de domaine que vous avez acheté redirige vers l'adresse du AWS S3 bucket. Pour cela, ajouter un record dans votre Zone DNS :
- Subdomain: ceci est votre domaine, soit le nom de votre site. Chez moi, **bastienmaurice.fr**
- Hostname: ceci doit pointé sur l'adresse de votre S3 qui contient tout le contenu de votre site. Le mien est **http://bastienmaurice.fr.s3-website.eu-west-3.amazonaws.com**
- Type: il existe plusieurs types de record, ici on veut pointer un nom de domaine vers une adresse et non une IP, on choisi donc le type **A**


### 2.2 AWS Route53


### Nom de domaine par un autre provider
C'est ce que j'ai fais initialement ; Prendre mon nom de domaine sur un bon vieux OVH, ou j'ai déjà mon vieu Wordpress.

## 3 CDN
Ici en bonus, on peut aller plus loin et ajouter un CDN ; Celui-ci va permettre de répliquer notre contenu dans des serveurs un peu partout dans le monde, améliorant ainsi la disponibilité et latence de notre site. Ceci est donc clairement optionnel. Cloudflare en es un des plus connu.

### 3.1 AWS CloudFront
Histoire de rester sur la même stack, je vous propose de test celui d'amazon.
