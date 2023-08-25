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
- npm : l'historique, installé de base avec NodeJS
- yarn : se veut plus rapide que npm
- pnpm : aussi plus rapide que npm

Chacun ont des algos différents pour résoudre l'arbre de dépendances de ton package-lock.json.

## Initialisation du projet
### Framework - React
Create-react-app est un module NPM qui te permet de créer toute la structure de base d'un répo sous React. Du moins te donne un type d'architecture, avec pleins de settings déjà fait comme :
- un index html déjà prêt
- la configuration de test pour Jest & React testing library
- la configuration de transpilation TS->JS
- la configuration du bundler pour le hot reload, builder, etc.

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

Pas beaucoup de commande à savoir :
- npm build
- npm run test

!!! question
    Pourquoi c'est directement la commande, des fois préfixé par 'run' ?

Si tu veux une commande de NPM, du packager, tu l'appelles directement (*cf npm build*).  
Si tu veux une commande spéficique à ton projet, elle est forcement défini dans ton package.json, onglet *script*. Tu dois donc la préfixer du mot clé *run*

### User interface - MaterialUI
On souhaite ajouter des composants : bouttons, menu, etc. Tu peux très bien les faire tous un à un toi même. C'est long. Ne ré-inventons pas la roue et partont sur des librairies qui seront plus stable que la tienne au vue de la communitée énorme front. Je te propose une qui implemente le design system de Google en React.

```sh linenums="1"
npm install @mui/material @emotion/react @emotion/styled
```

### API - Axios, ReactQuery
#### Mocker son api - JSONserver
Nous avons une application basique qui tourne, avec quelques éléments graphique qui s'affichent. Cependant, elle paraît une peu vide car nous n'avons aucune données à afficher. Afin d'itérer rapidement notre développement du frontend, on va déployer un serveur en un rien de temps, qui va repprendre le job du backend, à savoir exposer des APIs REST afin de nous envoyer des données.

</br>
Ici je te propose un module NPM qui va nous faciliter la vie :  
```sh linenums="1"
npm install --save-dev json-server
```

## Build
### Créer un build de production
npm run build









