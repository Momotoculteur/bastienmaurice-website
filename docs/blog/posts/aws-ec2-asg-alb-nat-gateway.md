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

# Deployer un serveur Wordpress sur des EC2, géré via un Auto Scaling Group (ASG) avec un Application Load Balancer (ALB) dans un subnet privée via Virtual Private Cloud (VPC), Internet et NAT Gateway

Je te propose de deployer une application sur des machines sur AWS avec de la haute disponibilité et haute résilience, dans un cloud privé et sécurisé 😎

Je te montre Wordpress, mais c'est adaptable pour n'importe quelle application, serveur, Docker, etc.

<!-- more -->

(TODOOOOO___)


## Introduction

Schema 
quel projet

## Setup du réseau
### Ajout du Virtual Private Cloud - VPC
### Ajout du subnet public
### Ajout des subnets privés
### Ajout de l'Internet Gatewat - IGW
### Ajout de la NAT Gateway
### Ajout des routes publiques
#### Routes publiques
#### Routes privés
## Setup de l'Application Load Balancer - ALB
## Setup de l'Auto Scaling Group - ASG
### Init de l'ASG
### Init des EC2
### Init du script de lancement des EC2
## Setup d'un Bastion
### Creation de l'instance
### Setup SSH