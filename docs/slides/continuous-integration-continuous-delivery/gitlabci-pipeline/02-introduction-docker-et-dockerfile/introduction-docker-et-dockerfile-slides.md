## Introduction 

Docker est une plateforme open-source qui permet d’automatiser le déploiement d’applications à l’intérieur de conteneurs légers et portables.  </br></br>
Un conteneur regroupe tout ce dont une application a besoin pour fonctionner : le code, les bibliothèques, les dépendances et le système d'exploitation léger.</br></br>
Cela permet de s’assurer que l’application fonctionne de manière cohérente, indépendamment de l’environnement.



---



## Concepts de base

- **Images** : Les images sont des instantanés d’applications. Elles sont immuables et servent de modèles pour les conteneurs. Elles sont créées à partir d’un Dockerfile.
- **Conteneurs** : Les conteneurs sont des instances d’images qui tournent. Ils sont légers et portables.
- **Dockerfile** : Un fichier texte qui contient les instructions pour construire une image Docker.



---


## Avantages de Docker

- **Portabilité** : Fonctionne de manière identique sur tous les environnements.
- **Isolation** : Les conteneurs isolent l’application, ses dépendances et les processus.
- **Rapidité** : Les conteneurs démarrent rapidement grâce à leur légèreté.
- **Scalabilité** : Facile à scaler en utilisant des systèmes d'orchestration comme Kubernetes.



---


## Création d'un Dockerfile

Un **Dockerfile** est un fichier texte qui contient une série d'instructions permettant de construire une image Docker.</br></br>

Explication des directives principales :
- **FROM** : Spécifie l’image de base à utiliser (ici une image Node.js).
- **WORKDIR** : Définit le répertoire de travail à l’intérieur du conteneur.
- **COPY** : Copie les fichiers de l’hôte dans le conteneur.
- **RUN** : Exécute une commande pendant la construction de l’image.
- **EXPOSE** : Indique le port sur lequel l’application sera exposée.
- **CMD** : Spécifie la commande par défaut à exécuter lorsque le conteneur démarre.



---


## Structure d’un Dockerfile

Voici un exemple de Dockerfile simple pour une application Node.js :

<pre class="stretch"><code data-trim data-noescape>
# 1. Spécifiez l'image de base
FROM node:14

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# 3. Copier le fichier package.json et package-lock.json
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Exposer le port sur lequel l'application va tourner
EXPOSE 3000

# 6. Commande pour démarrer l'application
CMD ["node", "app.js"]
</code></pre>




---



## Optimisations possibles

Pour améliorer les performances et la taille de vos images Docker, voici quelques bonnes pratiques :

1. Utilisation des images légères
<br>
Il est préférable d’utiliser des images de base légères, comme alpine, pour réduire la taille de l’image :

<pre><code data-trim data-noescape>
FROM node:14-alpine
</code></pre>

Cela permet de réduire considérablement la taille de l’image.



---



## Optimisations possibles

2. Réduction du nombre de couches  
<br>
Chaque instruction Docker crée une nouvelle couche. Pour réduire la taille des images, combinez les instructions RUN :

<pre><code data-trim data-noescape>
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean
</code></pre>




---



## Optimisations possibles

3. Nettoyage après installation
<br>
Lorsque vous installez des dépendances ou des outils, nettoyez les fichiers inutiles après :

<pre><code data-trim data-noescape>
RUN apt-get update && apt-get install -y \
    build-essential \
 && rm -rf /var/lib/apt/lists/*
</code></pre>



---



## Optimisations possibles

4. Utilisation de multi-stage builds
<br>
Les multi-stage builds permettent de réduire la taille de l’image finale en ne conservant que les fichiers essentiels à l’exécution de l’application. Par exemple :

<pre><code data-trim data-noescape>
# Étape 1: Construction
FROM node:14 as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2: Production
FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "dist/app.js"]
</code></pre>

Ici, la première étape construit l’application, et la deuxième étape ne conserve que les fichiers nécessaires pour l’exécution.




---


## Bonnes pratiques
- **Minimalisme** : Essayez de garder vos images aussi petites que possible pour des raisons de performance et de sécurité.
- **Utilisez .dockerignore** : Tout comme .gitignore, ce fichier permet d’exclure certains fichiers inutiles (ex : fichiers de logs, dépendances locales) lors de la création de l’image.
- **Sécurité** : Évitez d’inclure des informations sensibles comme des clés API dans le Dockerfile. Utilisez des variables d’environnement à la place.
- **Versionner vos images** : Utilisez des tags pour versionner vos images Docker et éviter de toujours utiliser latest, qui peut mener à des comportements inattendus.
- **Testez vos images localement** : Avant de pousser une image en production, assurez-vous qu’elle fonctionne comme attendu dans votre environnement local.



---


# Récap

Docker est un outil puissant pour le déploiement et la gestion d’applications dans des environnements isolés et reproductibles. En suivant les bonnes pratiques, il est possible de créer des images légères, performantes et sécurisées, tout en améliorant la portabilité de vos applications.



---

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

# Let's build !

---


## Build Docker Image avec Docker-in-Docker (DinD)

Le principe du Docker-in-Docker (DinD) est de permettre d'exécuter Docker à l'intérieur d'un conteneur Docker.  

<pre><code data-trim data-noescape>
# .gitlab-ci.yml
stages:
  - build

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_HOST: tcp://docker:2375  # Utilisation du démon Docker
  DOCKER_TLS_CERTDIR: ""

services:
  - docker:dind  # Démarre le service DinD pour que le démon Docker soit disponible

build_image:
  stage: build
  image: docker:latest  # Utilisation de l'image Docker
  script:
    - docker info  # Vérifie que Docker fonctionne bien
    - docker build -t my-app .  # Construction de l'image Docker
    - docker images  # Liste les images construites
</code></pre>

- **Services** : GitLab CI démarre un conteneur Docker en mode démon via le service docker:dind, permettant d’utiliser Docker dans le pipeline.  
- **Variables** : La variable DOCKER_HOST permet à Docker de communiquer avec le démon.  
- **Image Docker** : Le pipeline utilise l’image officielle docker:latest pour pouvoir utiliser Docker dans la tâche.  
- **Script** : La commande docker build permet de construire une image à partir du Dockerfile présent dans le dépôt.  




---



## Build Docker Image avec Kaniko

Kaniko est une alternative à DinD pour construire des images Docker sans avoir besoin d'exécuter le démon Docker. Cela le rend plus sécurisé, car il ne nécessite pas l'accès privilégié.

<pre class="stretch"><code data-trim data-noescape>
# .gitlab-ci.yml
stages:
  - build

variables:
  # Chemin où est situé le fichier Dockerfile
  DOCKERFILE_PATH: $CI_PROJECT_DIR/Dockerfile
  # Image que l'on souhaite construire et pousser
  IMAGE_NAME: registry.example.com/my-app

build_image:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:latest  # Image de Kaniko
    entrypoint: [""]  # Nécessaire car Kaniko utilise une entrypoint par défaut
  script:
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"$CI_REGISTRY\":{\"username\":\"$CI_REGISTRY_USER\",\"password\":\"$CI_REGISTRY_PASSWORD\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor --dockerfile $DOCKERFILE_PATH --context $CI_PROJECT_DIR --destination $IMAGE_NAME
</code></pre>

- **Image Kaniko** : Utilisation de l'image officielle gcr.io/kaniko-project/executor qui contient tout ce qu'il faut pour construire des images sans le démon Docker.
- **Configuration Docker** : Kaniko utilise un fichier de configuration JSON pour l'authentification au registre Docker. Ici, les informations sont injectées via des variables d'environnement.
- **Commande Kaniko** : La commande /kaniko/executor construit l'image à partir du Dockerfile et du contexte spécifié, puis la pousse vers le registre spécifié.



---



## Benchmark

**DinD :**
- Plus simple à utiliser si vous êtes déjà familier avec Docker.
- Besoin d'exécuter Docker en mode privilégié, ce qui peut présenter des risques de sécurité. (Préferrez DinD-rootless)
- Parallélisation de build  

**Kaniko :**
- Plus sécurisé car il ne nécessite pas l'accès au démon Docker.
- Build un poil plus long


