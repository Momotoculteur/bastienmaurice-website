# Frontend
## Tools pré-requis
### NodeJS / Node Module Manager (NVM)
NVM est une CLI qui te permet de switch de version de NodeJS en une ligne de commande sans prise de tête, donc ultra pratique quand tu codes sur plusieurs projets.

Version [Windows](https://github.com/coreybutler/nvm-windows)  
Version [MacOS](https://github.com/nvm-sh/nvm)

Installer une nouvelle version de Node :  
```sh linenums="1"
nvm install 20 
```
Basculer sur la nouvelle version :  
```sh linenums="1"
nvm use 20
```

### Choix du packet manager
Choix du manage pour installer et gérer ses dependances : 

- **npm** : l'historique, installé de base avec NodeJS
- **yarn** : se veut plus rapide que npm
- **pnpm** : aussi plus rapide que npm

Chacun ont des algos différents pour résoudre l'arbre de dépendances de ton package-lock.json.

## Initialisation du projet
On débute avec l'utilisation d'un framework de frontend. Libre à toi d'utiliser :

- **Angular** : fait par google, le plus ancien
- **React** : fait pas facebook, c'est celui le plus en vogue
- **Vue** : le dernier petit qui se veut le plus disruptif

Selon ton framework, tu en as qui te permette d'être très permissible comme Vue, alors que d'autre sont plus rigide dans le développement d'app qui te force d'avoir un squelette plus normalisé mais moins customisable, qui est le cas d'Angular.  
<br>
React est un bon compromis entre les deux, mais ce n'est que mon point de vue.

### Framework - React
Create-react-app est un module NPM qui te permet de créer toute la structure de base d'un répo sous React. Du moins te donne un type d'architecture, avec pleins de settings déjà fait comme :  

- un index html déjà prêt
- la configuration de test pour Jest & React testing library
- la configuration de transpilation TS->JS  
- la configuration du bundler pour le hot reload, builder, etc.

!!! question
    **Hot-reloading ?** C'est une feature qui te permet de voir ton code en temps réel dans ton navigateur dès que tu sauvegardes ton fichier. Pratique pour itérer rapidement tes features !

Pour résumer, en une ligne de commande tu as une app, simple certe, mais qui tourne en moins de 30s.

!!! info
    C'est webpacket babel qui s'occupe de la transpilation et le bundle de ton app par défaut

Si t'es plutôt Javascript :  
```sh linenums="1"
npx create-react-app simple-project-frontend
```

Si t'es plutôt Typescript :  
```sh linenums="1"
npx create-react-app my-app --template typescript
```

### User interface - MaterialUI
On souhaite ajouter des composants : bouttons, menu, etc. Tu peux très bien les faire tous un à un toi même. C'est long. Ne ré-inventons pas la roue et partont sur des librairies qui seront plus stable que la tienne au vue de la communitée énorme front. Je te propose une qui implemente le design system de Google en React.

```sh linenums="1"
npm install @mui/material @emotion/react @emotion/styled
```

### API, requêtes & data
#### Mocker son api pour développer - JSONserver
Nous avons une application basique qui tourne, avec quelques éléments graphique qui s'affichent. Cependant, elle paraît une peu vide car nous n'avons aucune données à afficher. Afin d'itérer rapidement notre développement du frontend et de matcher idéallement avec l'API du Backend, on va déployer un serveur en un rien de temps, qui va repprendre le job du backend, à savoir exposer des APIs REST afin de nous envoyer des données, à savoir : 

- Requêtes GET, POST, PUT, PATCH, DELETE
- Possibilité d'utiliser des params query (recherche d'un objet sur un id, etc.)
- Customisation de tes routes, middleware...
- Pagination, sort, slice, opérateurs, etc
</br>

On a ainsi aucun besoin de charger une lourde application de backend ou d'autre avec de vrais données, et on peut réelleent découpler le développement entre équipe de Frontend et de Backend comme cela.

Ici je te propose un module NPM qui va nous faciliter la vie :  
```sh linenums="1"
npm install --save-dev json-server
```

On va rajouter un script afin de lancer notre json-server avec quelques paramètres:
```json linenums="1"
# package.json
{
   "db": "json-server --watch ./json-server/db.json --port 5000 --routes routes.json"
}
```

Deux choses en plus à faire.

La première est que notre front est servi sur le port 3000 de base, et le json server de même. Ajoutons un proxy afin que notre frontend aille requêter sur un autre port :
On ajoute une ligne à notre package.json : 
```json linenums="1"
# package.json
{
    "proxy": "http://localhost:5000"
}
```

La seconde est que tu vas pouvoir commencer à définir tes mock d'API dans un seul fichier. Je défini une simple API get, qui renvoi une liste de string :
```json linenums="1"
# db.json
{
    "cars": [
        "Ford",
        "Citroen",
        "Renault"
    ]
}
```
Dans ce simple cas, je vais servir mes données sur **http://localhost:5000/cars**. 


Mais json-server te permet de faire des choses bien plus chouette, par example de définir des customs routes avec un seconde fichier qui va gérer ces matchings de route :
```json linenums="1"
# route.json
{
    "my/custom/route": "cars"
}
```
Dans ce cas là, on expose les data qui à la clée **cars** sur **http://localhost:5000/my/custom/route**


!!!! tips
        Ces routes peuvent s'apparenter très pratiques dans le cas ou on commence à avoir des query parameters ou des requête plus complexe


Script à mettre à jour si besoin avec ces customs routes:
```json linenums="1"
# package.json
{
   "db": "json-server --watch ./json-server/db.json --port 5000 --routes routes.json"
}
```

#### Simple requête au backend - Axios
Echanger avec un Backend te permet de charger des données depuis des bases de données de ton backend ou d'ailleurs, et de les organiser et les afficher dans ton frontend. 
Pour cela, Axios te permet de définir en NodeJS facilement la création de ces requêtes là.
```sh linenums="1"
npm install axios
```

!!!! note
    A partir de maintenant il te faut 2 consoles d'ouverte : une pour le serveur de dév de React, et une autre pour le mock de l'API par le json-server

On créer une requête des plus basiques en se servant des données exposés par notre json-server, à savoir récuper nos datas qui sont servies sur *http://localhost:5000/cars*
```typescript linenums="1"
# getCars.tsx
import axios from 'axios';

export async function getCars() {
  const resp = await axios.get('/cars',);
  return resp.data;
}
```

!!!! tip
    Lors de l'écriture d'une fonction asynchrone, profite de la lisibilité des **async/await** par rapport aux traditionnels **promesses** 


Maintenant que l'on a notre fonction qui tape sur notre backend, on va l'insérer dans un bloc de notre frontend 
```typescript linenums="1"
# app.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import { getCars } from './api/getCars';

function App() {
  const [cars, setCars] = React.useState([''])    // Hook fourni par React
  
  React.useEffect(()=>{                           // Hook fourni par React
    getCars().then(resp => setCars(resp))
  }, [])

  return (
    <Box>
      <Box>{cars}</Box>
    </Box>
  );
}
```

Le **useState** permet de sauvegarder la valeur d'une variable et de l'avoir dynamique. Pratique si tu utilises le contenu de cette var pour des données provenant d'un backend par example. En effet, au lancement de l'application, celle-ci sera par default **['']**. Mais on va executer Axios qui va aller récupérer des données, et une fois celle-ci récupéré, vont aller mettre à jour notre variable **cars**. Le raffraichissement de cette variable par une nouvelle valeur va permettre à du contenu dans l'UI de se mettre à jour automatiqument, et donc afficher nos données à l'instant même ou celle-ci sont être récupérés.
Le **useEffect** est un hook qui permet de call le code à l'intérieur de celui-ci sous certains conditions. Dans ce cas là, notre le second argument **[]** de cette fonction. Un Array vide veut dire que ce code sera executé une seule et unique fois au lancement de mon app.


J'ai fais quelque chose de relativement simple ici. Mais lorsque on fait appelle à Axios, on peut avoir des attributs supplémentaire dans la réponse de la requête, par exemple :

- Renvoyer des données que l'on ré-organise dans notre fonction afin de s'adapter à une structure custom dans notre frontend par la suite
- Renvoyer des données vide si la requête n'aboutie pas 
- Gérer les cas d'erreurs avec du **try-catch**, gestion des erreurs et de leurs affichages pour l'utilisateur selon le status code de retour, etc.

#### Requête dynamique au backend - ReactQuery
On a vu précedemment pour faire une requête simple. Ca correspond à bon nombre d'application que l'on veut faire. On arrive sur une site, ça charge les data, et basta.
</br> 

Quid pour un site ou on veut du dynamique, un site ou on a des données qui change en temps réel comme un site de paris sportifs en ligne (Betlic les best 😏) ou tu as des côtes qui change en temps réel selon les actions qui se passe dans le match, Axios ne peut savoir car c'est une fonction passive que tu appelles qu'une seule fois. Si tu veux dynamiser avec Axios tu es donc obliger de re-call ta fonction, filtrer tes données comme tu le souhaites, les ré-afficher, pour au final faire quelque chose qui s'actualise tout les xx temps, et n'est donc pas au final une vrai bonne solution pour ce genre d'application web.
</br>

Je te propose ReactQuery. Un module NPM qui te permet justement ce cas là, de re-trigger automatiquement si t'as des changes côté backend. Les données sont stocké dans un hook spécifique à React pour refresh l'UI facilement.

```sh linenums="1"
npm istall @tanstack/react-query
```


## NodeJS - Commencer à dev
### Squelette
```md linenums="1"
├── src             # Code source de ton projet fronted
│   ├── index.js    # Le main de ton application React
├── public
│   ├── index.html  # Point d'entrée pour depuis le browser de ton app
├── dist            # Dossier crée lorsque tu build ton application
├── node_modules    # Cache et code source des modules NPM que tu installes 
├── package.json
├── package-lock.json 
└── .gitignore
```

Je voudrais revenir sur 2 fichiers qui sont les plus importants lorsque tu bosses sous le framework NodeJS :  

- **package.json** : C'est le main de tout ton projet NodeJS. Tu y renseignes les modules NPM que tu souhaites installer, un paquet de meta-data sur ton projets, les scripts en CLI que tu souhaites pour automatiser tes tâches de lint, build, testing, etc.
- **package-lock.json** : Celui-ci est un arbre qui défini l'ensemble des modules NPM que tu as installé, et de leurs versions à un instant T. Comme un module NPM est composé de pleins d'autres, cela te permet de figer l'ensemble de tes dépendances. Cela permet à NPM ou tout autre package manager de savoir quoi installer quand tu bosses sur ton projet, que tu ouvres une nouvelle branche, que tu le clones, build, etc.

### Dependances
Pour faciliter ton développement, la communauté développe des scripts pour tous. Libre à toi même d'en proposer toi même et le distribuer afin d'en fai profiter à tous.
Tu peux en trouver deux types différentes dans ton projet :  

-  **deps** : qui seront embarqué dans ton build de production. Exemple, ta librairie de UI, ton framework de front (React, etc.), etc.  
-  **devDeps** : celle-ci ne seront embarqué que lorsque tu dév en local. Example,  packages de lint, de test, etc.

### Commande de base
|**Commandes NPM général**|**Infos**|
|--|--|
|npm install |Installe un package du registry NPM en dépendance|
|npm install --save-dev|Installe un package du registry en dépendances de dev NPM|
|npm uninstall|Supprime un package|
|npm audit|Analyse tes packets et detecte si ils ont des vulnérabilités|
|npm outdated|Compare la version actuel de tes packages avec celle disponible sur le registry pour connaître si il y a des mises à jours|


### Commande propre à ton projet
|Commandes NPM d'un projet initial|Infos|
|--|--|
|npm run start|Lance le projet avec hot-reloading|
|npm run build|Crér un build pour la production|
|npm run test|Lance les tests via Jest|
Et libre à toi d'en rajoute autant que tu le veux !


!!! question
    Pourquoi c'est directement la commande, des fois préfixé par **'run'** ?

Si tu veux une commande de NPM, du packager, tu l'appelles directement cf `npm audit`.  
Si tu veux une commande spéficique à ton projet, elle est forcement défini dans ton package.json, onglet *script*. Tu dois donc la préfixer du mot clé *run*

### Npx CLI
NodeJS te donne une commande pour executer des commandes de modules NPM directement dans ton code.
Petit exemple, tu veux lint ton code TS/JS, tu devrais faire de la sorte :

1. Ajouter le module à ton projet via `npm install eslint`
2. Ajouter un script dans ton package.json : 
```json
{
  "script": {
    "lint": "eslint ."
  }
}
```
3. Lancer la commande de lint via `npm run lint`


Si par exemple tu as un cas d'utilisation ou tu veux t'affranchir d'alourdir tes modules de ton projet, tu peux utiliser la CLI npx. Reprenons le cas précédent, pour linter ton projet, par example ce coup-ci dans ta CI/CD:

1. Appelle la commande souhaité via `npx eslint .`

Bien plus simple et rapide quand tu as besoin de module NPM rapidement !

!!! tip
    Pense à versionner tes modules lors de ton utilisation de npx, ça t'évitera d'éventuels regression ou breaking changes !  
    Tu peux ainsi tagger une version spécifique, par exemple `npx eslint@1.0.0 .` via le SEMVER

## Mise en production & deploiement
Quand tu build ton application en mode production via **npm run build**, tu vas avoir un dossier, */build* par défaut, qui va contenir tout ton site web statique :

- Ton entrée principal, index.html
- Ton Typescript transpiler en JS sous plusieurs versions histoire d'être compris par un ensemble différent de navigateur, plus ou moins ancien
- Tes ressources, images, etc.

ReactScripts étant agnostique tu peux utiliser n'importe quelle solution proposé par la suite pour host ton site web.

### Via un serveur statique - Serve, http-server, nginx
Tu as le choix entre une multitude de modules NPM comme **serve**, **http-server**, etc. Tu peux encore utiliser d'autre tools comme le célèbre NGINX, etc.

```sh linenums="1"
npm install -g serve
serve -s build
```

```sh linenums="1"
npm install -g http-server
http-server .
```

### Via du code - Express
De façon programatique avec Express, un module NPM : 

```javascript linenums="1"
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {    // '/*' si tu utilises un routeur côté client, comme ReactRouter
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(9000);
```

On expose bête et mechant les fichiers de façon statique. Tu demandes une page, le serveur te sert un fichier à afficher.