J'ai souhaité récemment me faire un petit blog sur le net et l'heberger sur du AWS. J'ai voulu faire les choses propres et me faire mon infra as code avec Terraform. Mais avant de pouvoir plan et apply mes nouvelles ressources dont j'ai besoin, j'ai du me confronté à l'initialisation d'un projet Terraform.
Et si tu veux faire les choses bien, je peux te montrer quelques good practices concernant la gestion de ton tf.state ;)

Je te montre ça sur du AWS, mais tu peux faire exactement la même chose sur les autres clouds provider. Seul le noms des ressources vont changer de l'un à l'autre !

## 0. Pré-requis
Tools : 
- Terraform

## 1. tf.state
### 1.1 C'est quoi ?
Quand tu vas définir la création, la mise à jour ou la suppression de ressource via des fichiers Terraform, lui même doit savoir dans quel ordre réaliser ces instructions. Les ressources ayant des specifications différentes, et des dépénendances entre elle plus ou moins forte, Terraform va se faire un bon gros fichier JSON resencent l'ensemble de ces instructions dans le bon ordre.

### 1.2 Quels sont les soucis de ce tf.state ?
Aucun pour une utilisation simple. Realisant moi même en solo ce blog, je peux très bien faire un simple terraform init et commencer à dév mon infra sans soucis, le tout en local. Mais quid sur un vrai projet avec plusieurs dev travaillant ensemble ? C'est là ou les choses vont se compliquer.

- Partager le tf.state à plusieurs : Si chacun des membres de l'équipe doit mettre à jour cet infra, ils doivent pouvoir avoir librement accès à ce fichier
- Verouiller le tf.state : Soucis de bosser à plusieurs, c'est que ce fichier ne doit être utiliser que par une seule et unique personne sur un instant T. Si tu essayes de faire un accès concurrent à ce fichier tu peux finir avec une corruption du tf.state et mettre en peril ton infra
- Isoler le tf.state : Plus ton infra grandi, plus les plan/apply risque d'être long. Isoler en une multitude de plus petits tf.state te permet de travailler plus vite, et surtout en cas de soucis de ne pas casser toute ton infra.

### 1.3 Comment partager ce tf.state ? 
#### 1.3.1 Git ? Non !

Tu le sais déjà, mais on va être obliger à un moment donné d'utiliser Git. Mais cela n'est pas possible car cela engendre plusieurs problèmes :

- Erreur manuel : on oublie trop souvent de pull le latest change sur ton repo Git, ça peut donc t'amener très rapidement à des régréssions d'infra
- Verouillage : Impossible de verouiller un fichier à un accès concurrentiel, qui empêcherais donc 2 membres d'une même équipe d'y accéder au même moment
- Secret: Et enfin le plus important, c'est que ce fichier tf.state contient tout les infos de ton infra en texte clair. Ce qui signifie que tout secret, token, ou données sensible peut être leak sur ton git.

#### 1.3.2 Remote backend ? OUI !


## 2. Let's code !
### 2.1 Définition du provider
### 2.2 Création du S3 Bucket
### 2.3 Ajout de DynamoDB