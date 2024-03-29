# Docker
Docker te permet de créer un env isolé de ton application. Tu vas pouvoir la lancer ou tu veux, tu peux être sur qu'elle fonctionnera. C'est donc pratique pour distribuer. C'est d'ailleurs le moyen utilisé si tu veux deployer ton application sur un cluster Kubernetes, ou via Helm pour faire des templates très utile, ou encore via les outils des cloud provider (AWS Fargate, Azure container apps, Google cloud run, etc.)


## Tools pré-requis
- Docker desktop (ou Rancher desktop)

## Créer un simple Dockerfile
### Frontend app en mode dév
Ici un basique docker file qui expose une application en React. Celle-ci est servi en mode developpement, donc à des tests interne seulement. Vous ne devez pas distribuer cette application.

```docker linenums="1"
FROM node:20-alpine3.18 as client-builder

COPY client/package*.json .
RUN npm ci
COPY client/. ./

EXPOSE 3000

CMD ["npm", "start"]
```

- L1. On défini l'image sur lequel on travaille. Bossant sur une application React, il nous faut obligatoirement NodeJS.
- L2. Ici on défini dans quel répertoire de l'image définie précédemment on bosse
- L3. On copy les fichiers package.json et package-lock.json qui nous permettent de savoir quel - module node on a besoin pour faire fonctionner le projet
- L4. On lance un install des modules nécéssaire
- L5. On copie le projet avec les déps installé dans notre workdir de notre image
- L7. On expose un port pour notre app docker
- L9. Commande lancé au lancement de notre container, ici on veut simplement lancer notre app via le script *start*


### Frontend app en mode prod
Je vous propose ici de faire une seconde version que l'on va build en mode production.

```docker linenums="1"
FROM node:20-alpine3.18 as client-builder

COPY client/package*.json .
RUN npm ci
COPY client/. ./

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build"]
```

- L7. On rajoute ici la commande pour builder notre application afin de faire une prod
- L9. On installe **serve**, en mode global. Cela nous permet de servir notre build de production.

Ici je vous propose de servir votre application via le module serve. Libre à vous de partir sur un autre comme **http-server** pour ne citer qu'un example.
Une autre méthode encore, vous pouvez aussi partir d'une autre image, **FROM nginx:alpîne** par example, et servir avec les bon argument dans **CMD ["nginx", "-g"]** pour servir votre application depuis un NGINX.

### Backend app
Si vous faîte un backend basique sous ExpressJS par example, vous n'avez pas besoin comme le frontend de build votre application, étant donnée que celle-ci est faîte en pure JS et non Typescript et autre fichier .tsx qui contient des fonctionnalités propre à React. 
Vous avez donc juste à lancer votre main de votre serveur via `node index.js` 

```docker linenums="1"
FROM node:20-alpine3.18 as client-builder
WORKDIR /app

COPY package*.json .
COPY index.js .
COPY openapi.yaml .

RUN npm ci

EXPOSE 5000

CMD ["node", "/app/index.js"]
```

- L4 : on copie les fichiers package.json et package-lock.json
- L5 : on copie le fichier d'entrée de notre serveur
- L6 : on copie notre OpenAPI qui spec tout nos endpoints du serveur pour validation des requêtes et réponses
- L10 : on ouvre le port 5000 de notre container 
- L12 : on lance le main de notre serveur 

!!! info
    Attention, ici je code mon backend en mode **CommonJS (cjs)** qui ne nécessite donc pas de build. Mais pour profiter des nouvelles features et des imports style ES, tu peux très bien coder façon **EcmaScript Module (esm)**. Si tu dev sur cette seconde façon, là par contre tu devrais passer par un bundler qui te transorme en pure javascript compréhensible par le moteur de NodeJS. Tu peux utiliser de toute sorte : esbuild, webpack, vite.js, rollup, parcel, etc.

## Optimiser son Dockerfile
### Choix de l'image : Alpine Linux, Distroless, Scratch...
Vous pensez faire un bon choix de partir sur une image nodejs pure si vous faîtes une application React comme vu précedemment. Mais il existe des images qui embarque à la fois NodeJS, mais qui se veulent bien plus légère en plus d'être d'avantage maintenu en terme de sécurité. Je pense notemment aux distribution **Alpine Linux**.  
Example: 

- node:20 => 1.10go
- node:20-alpine3.18 => 180mo

Soit une image 5 fois plus légère.

Vous pouvez aussi avoir des images **scratch**. Celle-ci est une image completement vide. Pratique si vous devez faire des binaires, comme par exemple développer une application en Golang (Go)


### Multi-stage
Vous pouvez encore optimiser la taille de votre image en utilisant le multi-staging. Le but est de composer votre Docker file en une multitude d'étape. Cela permet de n'embarquer dans votre image finale que ceux dont vous avez besoin comme tools, framework et binaire. Vous évitez ainsi tout cache des packets managers quand vous ajoutez une extension, ou autre fichier temporaire dont vous auriez pu oublier.

On repprend l'example d'une application React servi par un ExpressJS :

```docker linenums="1"
FROM node:20-alpine3.18 as client-builder
WORKDIR /app
COPY client/package*.json .
RUN npm ci
COPY client/. ./
RUN npm run build


FROM node:20-alpine3.18 as server-builder
WORKDIR /app
COPY server/package*.json .
RUN npm ci --omit=dev
COPY server/. ./


FROM node:20-alpine3.18 as server
WORKDIR /app
COPY --from=client-builder /app/build ./build
COPY --from=server-builder /app/index.js index.js
COPY --from=server-builder /app/node_modules ./node_modules

EXPOSE 5000

CMD ["node", "/app/index.js"]
```

- L1-6 : Un premier stage **client-builder** qui permet d'installer les dépendances et de build notre application en production
- L9-13 : Un second stage **server-builder** qui permet d'installer que les dépendances de prod pour servir le front
- L16-20 : On selectionne que le strict nécéssaire pour le **client-builder**, à savoir le dossier */build*. On récupère dans le **server-builder** seulement le *index.js* qui est le serveur Express et ses dépendances de prod.
- L22 : On ouvre le port 5000 ou tourne notre application
- L24 : On sert votre app React via ExpressJs

!!! note
    Pas besoin pour le **client-builder** de définir à la main la récupération des dépendances de prod. Celles-ci sont transpiler et packager par react-script (webpack) ou votre builder que vous avez setter si vous l'avez changer.