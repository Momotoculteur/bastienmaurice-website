Il peut être intéréssant, lorsque vous développer une bibliothèque graphique, le design system d'une app de votre entreprise, ou un frontend qui risque d'être solicité par beaucoup de client, il peut être intéréssant d'ajouter une nouvelle batterie de test. 

Je vous propose ici de discuter de test de régression visuel.

On discutera de deux principaux tools que j'ai utilisé qui sont :

- BackstopJS, qui est open source. Tourne en local
- Browserstack Percy, qui lui est inner source et payant. Il fonctionne comme un SaaS


## Introduction
Le but ici de ces tests sont de permettre une verification entre le visuel d'un produit qui est en production (ici d'un point de vue dév, je veux dire un produit qui est sur une branche master, qui tourne en production) avec une nouvelle version que les dévs préparent en local sur leurs branches de features.

Cela à pour but d'ajouter une étape de vérification supplémentaire lorsque la feature est ajouté en production.

## Browserstack Percy
Je commence par celui-ci car c'est pour moi le plus simple à mettre en place, le plus intuitif dans son utilisation, et celui qui propose le meilleur produit pour nos tests. 

Son fonctionnement est le suivant : 

- On va devoir réaliser un build de notre application frontend ou mobile
- On va devoir le lancer en local via un serveur web (serve, http-server, appache...) pour qu'il puisse être accessible
- Percy va donc pouvoir récuperer le DOM du site.
- Percy réaliser des snapshot de notre application, et va les render avec differents browser et différents largeur pour imiter plusieurs ratio de devices différents
- C'est ici qu'il va enfin réaliser ses screenshots et faire les comparaisons entre la baseline et la feature

Il fonctionne avec de nombreux framework de test. Je vous montre ici comment l'utiliser avec la CLI officiel de Percy

### Installation de la CLI
On installe la CLI via `npm install @percy/cli`

### Setup de Percy
On ajoute un nouveau fichier de configuration à la racine 

```yaml linenums="1"
# snapshots.yaml

serve: . 
snapshots:
  - name: Home Page
    url: http://localhost:3000
```

On indique ici simplement de réaliser une comparaison sur la page d'accueil de mon site web. Je mentionne ici localhost car comme dit précédemment, je dois servir mon site web pour qu'il puisse être consulter.

#### Lancement en local
On va ajouter un nouveau script NPM afin de lancer la CLI de Percy : 

```json linenums="1"
# package.json

{
    "scripts": {
        "percy": "percy snapshot snapshots.yml"
    }
}
```


#### Lancement en CI/CD

On commence par setter en variable d'environnement de pipeline la variable **PERCY_TOKEN**, avec le bon acces token, disponible sur son compte Percy.

Je créer un nouveau job, avec une base de Linux Alpine. J'y installe Chromium en spécifiant bien le path de son executable. 

J'installe mes dépendances NPM, créer un build de mon application React, et lance une commande en background permettant de servir mon app web via un serveur http basique. 

Je n'ai plus qu'à lancer la CLI de Percy.

```yaml linenums="1"
# .gitlab-ci.yml

stages:
  - visual

test-visual:
  stage: visual
  image: node:20-alpine3.19
  variables:
    PERCY_BROWSER_EXECUTABLE: "/usr/bin/chromium-browser"
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
  script:
    - apk add chromium
    - npm ci 
    - npm run build
    - npx serve ./build &
    - npm run percy
```


![percy-browserstack](./img/percy-browserstack.png)

A moi maintenant de valider ou non les changes directement depuis leur application. Celui-ci renverra un code de retour à ma pipeline, permettant qu'elle soit validé ou en erreur.

## BackstopJS
Celui-ci
