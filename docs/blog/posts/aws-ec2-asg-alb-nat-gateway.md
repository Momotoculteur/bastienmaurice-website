---
date: 2024-02-26
authors: [bmaurice]
title: Deployer un serveur Wordpress sur des EC2, géré via un Auto Scaling Group (ASG) avec un Application Load Balancer (ALB) dans un subnet privée via un Virtual Private Cloud (VPC), accessible via un Internet et NAT Gateway (TODOOOOO___)
categories:
  - AWS
  - Cloud
comments: true
tags:
  - ASG
  - ALB
  - Nat
  - Gateway
  - EC2
  - VPC
  - Infra as code
  - Terraform
---

# Deployer un serveur Wordpress sur des EC2 avec database RDS, géré via un Auto Scaling Group (ASG) avec un Application Load Balancer (ALB) dans un subnet privée via Virtual Private Cloud (VPC), Internet et NAT Gateway sous Terraform

Je te propose de deployer une application sur des machines sur AWS avec de la haute disponibilité et haute résilience, dans un cloud privé et sécurisé 😎

Je te montre ici un Wordpress, mais c'est adaptable pour n'importe quelle application, serveur, Docker, etc.


<!-- more -->

## Introduction 

On va se réaliser une petite installation très basique, pour toute personne qui souhaite découvrir l'environnement AWS.

On va se monter un serveur Wordpress, mais libre à toi de servir ce que tu souhaites comme service. On va rendre ce serveur hautement disponible sous plusieurs avaibility zone (AZ) et aussi hautement disponible avec un application load balancer qui va distribuer à un auto scaling group, avec une RDS comme database SQL.

Un bastion sera disponible afin d'avoir un point d'entrée au serveur Wordpress via SSH.

Et comme on fait du clean code ici, on va se faire tout ça as code avec Terraform.

### Presentation des ressources nécessaire

Dans ce post je vais parler avec des abbréviations. C'est pour cela que je te les définis toutes ici avant d'aller plus loin. Pour ce chapitre on aura besoin de 

- **VPC / Virtual Private Cloud** : c'est un espace dans lequel on va pouvoir défini l'ensemble de notre installations. Sa particularité est qu'il est isolé.
- **IGW / Internet Gateway** : Element qui va permettre d'amener le réseau dans notre VPC
- **NGW / Nat Gateway** : Element qui permet d'amener du network dans un subnet privée
- **ALB / Application Load Balancer** : Comme son nom l'indique, il va permettre de distribuer la charge à des applications selon des métriques afin de répartir de façon équilibré les accès entre toute nos machines à notre disposition
- **EC2 / Elastic Compute Service** : C'est un service qui va nous permettre de faire pop des machines virtuelles (VM)
- **ASG / Auto Scaling Group** : Cet élément ci va nous permettre de faire scale-up et scale-down nos EC2 afin de pouvoir encaisser des pics de traffic

On aura besoin d'avoir 2 AZ différentes dans la même région, afin d'utiliser la RDS.

### Pré-requis

Je ne perdrais pas trop de temps ici, mais il est nécéssaire d'avoir setté son Terraform, la configuration de son state qu'il soit en local ou en remote (bien mieux).

## Initialisation du network

### Création du VPC
C'est cet élément qui va contenir l'ensemble de mon network. On commence donc par le définir : 


```terraform linenums="1"
# vpc.tf

resource "aws_vpc" "main_vpc" {
  cidr_block = local.cidr_block
}

```

### Création du subnet public

On va créer 2 subnets public qui hebergeront les bastions, ainsi que les internet gateway.


```terraform linenums="1"
#subnet_public.tf

resource "aws_subnet" "public_subnet1" {
  vpc_id                  = aws_vpc.main_vpc.id
  map_public_ip_on_launch = true
  cidr_block              = local.public_subnet1
  availability_zone       = local.availability_zone[0]

  tags = {
    Name = "public-subnet1"
  }

}

resource "aws_subnet" "public_subnet2" {
  vpc_id                  = aws_vpc.main_vpc.id
  map_public_ip_on_launch = true
  cidr_block              = local.public_subnet2
  availability_zone       = local.availability_zone[1]

  tags = {
    Name = "public-subnet2"
  }
}
```

### Création du subnet privée

Ici on va créer 2 subnets privées qui vont heberher la RDS et les EC2


```terraform linenums="1"
#subnet_private.tf

resource "aws_subnet" "subnet1" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = local.private_subnet1
  availability_zone = local.availability_zone[0]
  tags = {
    Name = "private-subnet1"
  }
}

resource "aws_subnet" "subnet2" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = local.private_subnet2
  availability_zone = local.availability_zone[1]
  tags = {
    Name = "private-subnet2"
  }
}
```

### Création de l'internet gateway

L'internet gateway et la ressource qui va pouvoir relier nos public subnet à internet.

```terraform linenums="1"
# internet_gateway.tf 

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
}
```

### Création des NAT gateway

Le NAT gateaway va te permettre de connecter tes subnets privés à internet, via le subnet public par cet gateway.

On lui affecte une ip publique pour cela.

```terraform linenums="1"
# nat-gateway.tf

resource "aws_eip" "nat_eip_sub1" {
  domain = "vpc"
}

resource "aws_eip" "nat_eip_sub2" {
  domain = "vpc"
}
```

Chaque NAT gateway doit avoir une adresse IP public, rendu possible via AWS Elastic IP. On ajoute un NAT gateway par public subnet.

```terraform linenums="1"
# nat-gateway.tf

resource "aws_nat_gateway" "nat_sub1" {
  allocation_id = aws_eip.nat_eip_sub1.id
  subnet_id     = aws_subnet.public_subnet1.id
  tags = {
    Name = "Nat-sub1"
  }
}

resource "aws_nat_gateway" "nat_sub2" {
  allocation_id = aws_eip.nat_eip_sub2.id
  subnet_id     = aws_subnet.public_subnet2.id
  tags = {
    Name = "Nat-sub2"
  }
}
```

### Création des tables de routage - subnet public

Cela va permettre de faire transiter le traffic de l'extérieur du VPC, vers le subnet public.

On commence par créer une table de routage 

```terraform linenums="1"
# public-route.tf

resource "aws_route_table" "public_routetable" {  
    vpc_id = aws_vpc.main_vpc.id
}
```

On fait une association par subnet

```terraform linenums="1"
# public-route.tf

resource "aws_route_table_association" "public_subnet_1" {  
    subnet_id      = aws_subnet.public_subnet1.id
    route_table_id = aws_route_table.public_routetable.id
}

resource "aws_route_table_association" "public_subnet_2" {  
    subnet_id      = aws_subnet.public_subnet2.id
    route_table_id = aws_route_table.public_routetable.id
}
```

On associe une nouvelle route pour distribuer le trafic du réseau public au réseau privé.

```terraform linenums="1"
# public-route.tf

resource "aws_route" "public_route" {  
    route_table_id         = aws_route_table.public_routetable.id
    destination_cidr_block = "0.0.0.0/0"  
    gateway_id             = aws_internet_gateway.igw.id
}
```

### Création des tables de routage - subnet privé

Cela va permettre de faire transiter le traffic du subnet public au subnet privé

On défini ici une table de routage pour chacun de nos 2 subnets privés
```terraform linenums="1"
# private-route.tf

resource "aws_route_table" "private_routetable1" {
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_route_table" "private_routetable2" {
  vpc_id = aws_vpc.main_vpc.id
}
```

On fait l'association d'une table à un subnet.

```terraform linenums="1"
# private-route.tf

resource "aws_route_table_association" "private_subnet_1" {
  subnet_id      = aws_subnet.subnet1.id
  route_table_id = aws_route_table.private_routetable1.id
}

resource "aws_route_table_association" "private_subnet_2" {
  subnet_id      = aws_subnet.subnet2.id
  route_table_id = aws_route_table.private_routetable2.id
}
```

Dans chacun des tables de routage, on ajoute une nouvelle entrée. L'ajout de la route permet de faire passer les paquets.

```terraform linenums="1"
# private-route.tf

resource "aws_route" "nat_route1_sub1" {
  route_table_id         = aws_route_table.private_routetable1.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_sub1.id
}

resource "aws_route" "nat_route1_sub2" {
  route_table_id         = aws_route_table.private_routetable2.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_sub1.id
}
```

### Locals des subnets

Je te met ici les locals que j'ai utilisé pour définir mes 4 subnets : 

```terraform linenums="1"
# locals.tf

locals {
  cidr_block      = "10.1.0.0/16"
  private_subnet1 = "10.1.0.0/24"
  private_subnet2 = "10.1.1.0/24"
  public_subnet1  = "10.1.2.0/24"
  public_subnet2  = "10.1.3.0/24"

  availability_zone = [
    "eu-west-3a",
    "eu-west-3c"
  ]
}
```

Ici je défini des range d'IPs différents histoire qu'elle ne se surperpose pas.

## Partie ALB - Application Load Balancer

L'ALB va être responsable de distribuer le traffic.

```terraform linenums="1"
# alb.tf

resource "aws_lb" "main_alb" {
  name               = "main-alb"
  load_balancer_type = "application"

  subnets = [
    aws_subnet.public_subnet1.id,
    aws_subnet.public_subnet2.id
  ]
  security_groups = [aws_security_group.alb_sg.id]
}
```

Ici on va lui spécifier de balancer notre traffic vers une certaine ressource, un target group.

```terraform linenums="1"
# alb.tf

resource "aws_lb_listener" "alb_listener" {
  load_balancer_arn = aws_lb.main_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main_alb_target_group.arn
  }
}
```

On créer ici le target group. On spécifie le traffic ici en http. On fait ici simple, mais à toi de gérer plutôt la redirection de l'http vers https afin d'être secure. Il te faudra donc te fournir un certificat SSL pour cela.

On défini un healthcheck. Celui-ci permettra de tester un endpoint vers nos machines EC2, vers **localhost:80/** afin de vérifier que le code de retour est bien compris entre 200 et 499. Si tel est le cas, la machine sera défini comme pouvant recevoir du traffic.

```terraform linenums="1"
# alb.tf

resource "aws_lb_target_group" "main_alb_target_group" {
  name     = "main-alb-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main_vpc.id


  health_check {
    enabled  = true
    port     = 80
    protocol = "HTTP"
    path     = "/"
    matcher  = "200-499"
  }
}
```

Ici on défini une association entre l'ASG et le target group défini de l'ALB.

```terraform linenums="1"
# alb.tf

resource "aws_autoscaling_attachment" "asg_attachment_bar" {
  autoscaling_group_name = aws_autoscaling_group.main_asg.id
  lb_target_group_arn    = aws_lb_target_group.main_alb_target_group.arn
}
```


## Partie ASG - Auto Scaling Group pour Wordpress

On va réaliser tout le setup nécéssaire à nos machines EC2 pour monter une application Wordpress dessus.

On commence par définir ici l'ASG. C'est lui qui va être responsable de scale-up et scale-down nos EC2 en fonction des peaks de traffic afin de s'adapter à la demande.

```terraform linenums="1"
# asg.tf

resource "aws_autoscaling_group" "main_asg" {
  name              = "main-asg"
  min_size          = 1
  desired_capacity  = 1
  max_size          = 2
  target_group_arns = [aws_lb_target_group.main_alb_target_group.arn]

  health_check_type = "ELB"

  vpc_zone_identifier = [
    aws_subnet.subnet1.id,
    aws_subnet.subnet2.id,
  ]

  launch_template {
    id      = aws_launch_template.launch_template.id
    version = "$Latest"
  }
}
```

Pour la suite, on va défini un script bash, qui embarque tout le nécéssaire afin de monter de façon automatique l'app Wordpress et ses dépendances nécéssaire à son bon fonctionnement.

Grosso modo, on va avoir besoin des dependances suivantes : 

- httpd : serveur web pour servir notre wordpress
- php : le language dont est codé wordpress afin d'être lancé
- Quelques autres deps de php

On souhaite ensuite télécharger la dernière version de wordpress. On la dézippe, et on la place au bon endroit afin d'être servi par notre serveur web.

On appeller à l'outil **sed** afin de faire quelques changes dans notre fichier de configuration du serveur wordpress pour le bon lancement. En effet, il doit se connecter à notre database RDS SQL.

On lui injectera donc les bonnes valeurs pour :

- nom de la database
- un username et password qui servira de connexion string à la database
- une adresse, qui est l'endpoint de notre AWS RDS 

Une fois la configuration setté, on lance notre serveur web.

```bash linenums="1"
#!/bin/bash

sudo yum update -y
sudo yum install httpd -y
sudo yum install php -y
sudo yum install php-bcmath php-intl php-zip -y
sudo yum install php-mysqli -y
sudo service httpd start
sudo chkconfig httpd on
cd /var/www/html/

sudo yum install wget -y
sudo wget https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz
sudo mv wordpress/* .
sudo rm -rf wordpress latest.tar.gz

sudo mv wp-config-sample.php wp-config.php

sed -i 's/database_name_here/${DATABASE_NAME}/' wp-config.php
sed -i 's/username_here/${DATABASE_USERNAME}/' ./wp-config.php
sed -i 's/password_here/${DATABASE_PASSWORD}/' ./wp-config.php
sed -i 's/localhost/${DATABASE_ENDPOINT}/' ./wp-config.php

sudo systemctl restart httpd
```

Ce script sera automatiquement éxécuté à chaque nouvelle instance qui démarrera.

Et pour binder ce script précédent qui setup correctement nos EC2 à notre ASG qui les fait spawn, on utilise un **launch template**

La props **user_data** est resonsable du lancement du script au démarrage. On lui injecte notre script bash, et on le surcharge avec plusieurs variable.

```terraform linenums="1"
# asg.tf

resource "aws_launch_template" "launch_template" {
  name_prefix = "ec2-"
  image_id    = local.ami
  key_name      = aws_key_pair.ssh_key.key_name

  instance_type          = local.instance_type
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  depends_on = [aws_db_instance.ec2_database]
  user_data = base64encode("${templatefile("${path.module}/init-ec2.sh", {
    DATABASE_NAME     = local.db_name
    DATABASE_USERNAME = local.db_username
    DATABASE_PASSWORD = local.db_password
    DATABASE_ENDPOINT = aws_db_instance.ec2_database.address
  })}")
}
```

Je te montre ici les quelques variables que j'ai du utiliser pour la définition des ressources précédent.

```terraform linenums="1"
# locals.tf

locals {
  ami             = "ami-03f12ae727bb56d85"
  instance_type   = "t2.micro"
  ssh_pubkey_path = "/Users/b.maurice/momotoculteur/gitlab/simple-vpc-alb-asg-ec2/projet-perso-aws.pub"

  db_name = "basiquedb"
  db_username = "admin"
  db_password = "adminadmin"
}
```


## Partie RDS - Database SQL
L'application Wordpress à besoin d'une database de type SQL pour fonctionner.

Amazon propose le service managé RDS qui peut nous fournir ce que l'on a besoin. Elle scale up et down d'un point de vue stockage de donnée. On peut lui ajouter des read-replicas pour plus de performances, et aussi du multi-AZ pour avoir une plus grande réplication géographique des données.

```terraform linenums="1"
# rds.tf

resource "aws_db_instance" "ec2_database" {
  allocated_storage      = 10
  username               = local.db_username
  password               = local.db_password
  db_name                = local.db_name
  instance_class         = "db.t2.micro"
  db_subnet_group_name   = aws_db_subnet_group.ec2_database_subnet.name
  vpc_security_group_ids = [aws_security_group.database_sg.id]
  engine                 = "mysql"
  skip_final_snapshot = true
}
```

On lui défini dans quel subnet on souhaite qu'elle fonctionne. Il lui faut de base au moins 2 subnets dans 2 AZ différents.

```terraform linenums="1"
resource "aws_db_subnet_group" "ec2_database_subnet" {
  subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
}
```

!!! danger
    Tu pourrais te dire qu'installer une MariaDB directement sur les EC2 serait une meilleure opération. Etant donnée que les EC2 peuvent scale-up et scale-down, tu supprimerais automatiquement toute database par ces même opérations. C'est pour cela que l'on crée une RDS qui soit dissocié des EC2, et hautement disponible et scalable à tout moment. Ou alors avoir une MariaDB qu'a des fins de tests seulement

## Partie debug avec l'ajout d'un EC2 Bastion

On appelle ici Bastion, une simple machine EC2. Celle-ci aura pour rôle de nous avoir un accès en SSH, afin de réaliser d'éventuelles maintenances ou tout autre service de débuggage sur nos serveurs hebergant Wordpress.

On utilise le port 22 pour ce protocol.

### Ajout de l'EC2

On créer une nouvelle machine comme suit :

```terraform linenums="1"
# bastion.tf

resource "aws_instance" "bastion" {
  ami = "ami-03f12ae727bb56d85"
  instance_type = local.instance_type
  key_name      = aws_key_pair.ssh_key.key_name
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  subnet_id                   = aws_subnet.public_subnet1.id
  tags = {
    Name = "Bastion"
  }
}
```

### Ajout de la clé SSH
Tu as pu voir une option **key_name** dans la partie précedente.

Ici je créer une clée SSH, sur mon poste en local avec mon ssh-agent. Je vais garder sur mon poste la clée privée pour m'authentifier et créer un fichier dans mon workspace **projet-perso-aws.pub**. 

Celle-ci va contenir la clée publique ce coup-ci. C'est elle qui sera disponible à la fois sur le Bastion, mais aussi sur mes diverses EC2 lancé par mon auto scaling group.

Je déclare le path qui mène vers ma clée publique :

```terraform linenums="1"
# locals.tf

locals {
  ssh_pubkey_path = "/Users/b.maurice/momotoculteur/gitlab/simple-vpc-alb-asg-ec2/projet-perso-aws.pub"
}
```

Et je créer la ressource associé contenant ma clée publique, avec mon fichier local précédent :

```terraform linenums="1"
# ssh.tf

resource "aws_key_pair" "ssh_key" {
  key_name   = "ssh_key"
  public_key = file(local.ssh_pubkey_path)
}
```

## Partie sécurité avec l'ajout de security group
### SG pour l'ALB

Ici tu peux réaliser plusieurs opérations.

Si tu souhaites autoriser le protocol http, ouvre le port 80

Si tu souhaites autoriser le protocol https, ouvre le port 443

On autorise ici tout le traffic sortant.

```terraform linenums="1"
# sg-alb.tf

resource "aws_security_group" "alb_sg" {
  name   = "alb"
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_security_group_rule" "ingress_alb_http_traffic" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  security_group_id = aws_security_group.alb_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "ingress_alb_https_traffic" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.alb_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "egress_alb_traffic" {
  type                     = "egress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  security_group_id        = aws_security_group.alb_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}
```

### SG pour l'ASG

Ici tu peux réaliser plusieurs opérations.

Si tu souhaites autoriser le protocol http, ouvre le port 80

Si tu souhaites autoriser le protocol https, ouvre le port 443

Ouvre le port 22 si tu souhaites autoriser le SSH, notemment pour faire fonctionner un bastion.

```terraform linenums="1"
# sg-asg.tf

resource "aws_security_group" "ec2_sg" {
  name   = "ec2"
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_security_group_rule" "ingress_ec2_traffic_http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "ingress_ec2_traffic_db" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "ingress_ec2_traffic_https" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "egress_ec2_traffic" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "ingress_ec2_bastion" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}
```

### SG pour le bastion

Ici on souhaite autoriser pour l'ingress, le SSH vers nos EC2 qui hebergent notre application Wordpress. Il faut donc autoriser le port 22. Ajoute le port 80 si tu as besoin du net, pour réaliser d'autre type de débugage.

On laisse sortir tout traffic, concernant l'egress.


```terraform linenums="1"
# sg-bastion.tf

resource "aws_security_group" "bastion_sg" {
  name   = "bastion"
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_security_group_rule" "ingress_bastion" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  security_group_id = aws_security_group.bastion_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "egress_bastion" {
  type                     = "egress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  cidr_blocks = ["0.0.0.0/0"]
  security_group_id        = aws_security_group.bastion_sg.id
}
```

### SG pour la RDS

Concernant la RDS, on doit lui ouvrir les ports 3306, qui est le port par default des databases MySQL pour l'ingress.

On laisse sortir tout traffic concernant l'egress.

```terraform linenums="1"
# sg-rds.tf

resource "aws_security_group" "database_sg" {
  name   = "database-sg"
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_security_group_rule" "ingress_database_traffic" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  security_group_id = aws_security_group.database_sg.id
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "egress_database_traffic" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.database_sg.id
  cidr_blocks       = ["0.0.0.0/0"]
}
```



## Optimisations possible
### Récuperer les AMI les plus récentes via un Data
Si tu souhaites avoir quelque chose de plus dynamique pour le choix de ton AMI pour tes différentes EC2, tu peux utiliser un **data** de terraform afin d'avoir par exemple la dernière version de cette image. Pratique pour notre use case !

```terraform linenums="1"
# data.tf

data "aws_ami" "amazon-linux-2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }
}
```

Une fois que l'on défini une regex pour notre image souhaité,  on peut ainsi l'appeller dans nos EC2 avec :
```terraform linenums="1"

resource "aws_instance" "ec2" {
  data.aws_ami.amazon-linux-2.id
}
```

### Sécuriser le mot de passe de la RDS & EC2 via AWS Secret Manager

On a fait une première version de notre application, de la façon la plus simple et intuitif possible pour débuter sur AWS. 

Mais si vous devions utiliser ce code pour de la production, nous ferions une grave bêtise, d'un point de vue sécurité. Nous avons commis la faute d'inscrire le mot de passe de la RDS en dur, dans le code. Quiquonque accéde à notre répository Github, peut accéder à notre RDS, dump les data et absolument tout péter de notre application si il la souhaite.

Réalisons dans le prochain point, quelque chose de plus secure.


On commence par créer une nouvelle ressource qui va nous permettre de créer un mot de passe aléatoire

```terraform linenums="1"
resource "random_password" "random_rds_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}
```

On créer un nouveau secret

```terraform linenums="1"
resource "aws_secretsmanager_secret" "rds_secret" {
  name = "rds_secret"
}
```

On update ce précédent secret, et on lui ajoute notre mot de passe randomisé en value

```terraform linenums="1"
resource "aws_secretsmanager_secret_version" "rds_secret_version" {
  secret_id     = aws_secretsmanager_secret.rds_secret.id
  secret_string = jsonencode({
    password = random_password.rds_password.result
  })}
```

On peut maintenant mettre à jour les templates de nos EC2 lancé via notre ASG. De même pour notre bastion

```terraform linenums="1"
  user_data_base64 = base64encode("${templatefile("${path.module}/init-ec2.sh", {
    DATABASE_NAME = local.db_name
    DATABASE_USERNAME = local.db_username
    DATABASE_PASSWORD = jsondecode(aws_secretsmanager_secret_version.rds_secret_version.secret_string)["password"]
    DATABASE_ENDPOINT = aws_db_instance.ec2_database.address
  })}")

```

Ne pas oublier biensur de mettre à jour ce même password, lors de la création de notre RDS
```terraform linenums="1"
resource "aws_db_instance" "my_rds_instance" {
  password          = jsondecode(aws_secretsmanager_secret_version.rds_secret_version.secret_string)["password"]
}
```

!!! note
    On aurait très bien pu utiliser un mot de passe que l'on souhaite et non randomisé. Pour cela, il foudra qu'il soit dans le répository, de façon crypté avec SOPS par exemple, lié à un Keyvault. Ainsi, plus de soucis qu'il soit dans le code Github.

### Security groups & sources id
Pour améliorer l'aspect sécurité, on peut ajouter quelques optimisations au niveau des divers security groups.

En effet, quand on défini des sg de type ingress par exemple, on définit seulement un port entrant et sortant.
```terraform linenums="1"
resource "aws_security_group_rule" "ingress_database_traffic" {
  type              = "ingress"
  security_group_id = aws_security_group.database_sg.id
}
```

On peut très bien ajouter depuis quelle source, quelle origine provient le traffic. Et donc ajouter un **source_security_group_id** définissant quel security group on laisse passer. Exemple ici du security group appliqué à la RDS. On lui affecte en entrée le security group de l'auto scaling group, qui fait spawn nos EC2 qui contiennent wordpress.

```terraform linenums="1"
resource "aws_security_group_rule" "ingress_database_traffic" {
  type              = "ingress"
  security_group_id = aws_security_group.database_sg.id
  source_security_group_id = aws_security_group.ec2_sg.id
}
```

### Redondance & optisation des subnets

Ici j'ai fais un projet des plus simplistes en utilisant seulement 2 subnets publics et 2 subnets privés. Mais tu te doute bien qu'un projet d'une vrai entreprise en production est bien plus complexe.

A toi de diviser le projet en plusieurs sous modules que tu appelleras individuellement afin de découpler les diverses ressources entre elles.

N'oublis pas d'utiliser les fonctions built-in de terraform (for_each, etc) afin de définir tes subnets et leurs appels de façon plus propre et factorisé.