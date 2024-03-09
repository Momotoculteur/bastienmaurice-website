Les test d'intégration sont une step encore plus évolué que le simple test unitaire.

On a bien souvent besoin de dependances pour la réalisation de ceux-ci. 

Un exemple courant peut être, lors du développement d'un micro service backend qui fourni différents endpoint afin d'envoyer au frontend, les datas nécéssaires provenant d'une base de donnée, d'avoir à la fois de lancé :

- Le backend qui est lancé en arrière plan, 
- d'avoir en plus d'avoir nos tests lancé, 
- Et enfin d'avoir une database de lancé afin de pouvoir tester notre API qui discute bien avec notre base de donnée

Il va falloir s'organiser d'avantage pour cette section afin de lancer l'ensemble de nos services et dans le bon ordre.

## Introduction

Ici je vais te montrer comment dérouler des tests avec :

- Jest, comme orchestrateur de test
- Docker-compose, permettant de lancer nos services en fond, pour les tests d'intégrations lancés en local
- Gitlab Services, permettant de lancer nos services en fond, pour les tests d'intégrations lancés en CI/CD

## Lancement des tests en local
### Creation d'un backend qui fourni une API

On commence cette section par réaliser un petit serveur web, qui expose un seul end point. On fais quelque chose de simple ici, un endpoint POST qui va aller enregistrer une props lorsque l'on requête ce endpoint, et l'inscrire dans une database NoSQL, MongoDB.

```js linenums="1"
// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // ou tout autre port de votre choix

// Middleware pour parser le corps des requêtes HTTP
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(`mongodb://localhost:27017/mydatabase`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
  console.log('Connecté à MongoDB');
});

// MongoDB modèle de schéma
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model('Item', itemSchema);

// Endpoint pour ajouter une donnée
app.post('/addData', async (req, res) => {
  try {
    const itemName = req.body.name;

    if (!itemName) {
      return res.status(400).json({ error: 'Le champ "name" est requis.' });
    }

    const newItem = new Item({
      name: itemName,
    });

    await newItem.save();
    return res.status(200).json({ message: 'Donnée ajoutée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la donnée :', error);
    return res.status(500).json({ error: 'Erreur lors de l\'ajout de la donnée.' });
  }
});

// Export du module app pour les tests Jest
module.exports = app;

// Démarrer le serveur si le fichier est exécuté directement
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
  });
}
```

Ici on défini un serveur express qui tourne sur localhost:3000.

On a crée un seul endpoint, accessible sur localhost:3000/addData. 

Attention, bien effectuer sur ce endpoint la requête avec un POST, et y ajouter en body de requête un attribut **name**, avec une valeure associée.

Mongoose permettant de nous faciliter les échanges avec la database MongoDB.


### Creation de la database en local avec Docker-Compose

On a un serveur qui tourne, mais il nous faut bien lancer une database avec laquelle il va communiquer sur l'adresse **mongodb://localhost:27017/mydatabase**, défini dans le précédent fichier.

On va utiliser docker compose, nous permettant de lancer des services en tâche de fond.

Pour cela on va créer un docker-compose.yml comme suit :

```yaml linenums="1"
# docker-compose.yml

version: '3'
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - ./data/db:/data/db
```


### Ajout des tests avec Jest
Je propose ici deux tests. On va vérifier que notre unique end point sur /addData, réponds bien lorsque la requête reçoit en body le bon paramètre, et que cet endpoint tombe en erreur lorsque l'on oubli ce parametre.

Pour cela on créer le fichier de test suivant :


```js linenums="1"
//app.test.js

const request = require('supertest')
const app = require('./app')
const mongoose = require("mongoose");

describe('Test endpoint POST /addData', () => {
    beforeEach(async () => {
        await mongoose.connect(`mongodb://localhost:27017/mydatabase`);
    });

    afterEach(async () => {
        await mongoose.connection.close();
    });

    it('Simple test Visuel - OK', async () => {

        const response = await request(app)
            .post('/addData')
            .send({ name: 'Test Data' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Donnée ajoutée avec succès.');
    });

    it('Simple test Visuel - KO', async () => {
        const response = await request(app)
            .post('/addData')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Le champ "name" est requis.');
    });
});
```

Petite subtilité ici, est l'utilisations des hooks beforeEach et afterEach provenant de la librairie de test Jest, permettant :

- d'initialiser la connexion à mongodb avant l'exécution d'un test
- la fermeture de connexion à mongodb après l'execution d'un test

Cela permet le bon déroulement des tests et d'éviter des fuites si on oublie de fermer la connexion.

### Lancement des tests en local

Maintenant que l'on a le code de notre application, nos tests de prêt, et une mongodb en local avec docker-compose, faisons un dernier point sur les scripts que l'on va mettre en place dans notre package.json :

```js linenums="1"
//package.json

{
  "scripts": {
    "start": "node app.js",
    "test": "jest --runInBand"
  }
}
```

Ici deux scripts mis en plance :
 
- start: permet de lancer mon backend en local
- test: permet de lancer mon jeu de test avec Jest

Maintenant, pour lancer nos 3 services ensembles et dans le bon ordre : 

1. Lancer notre mongodb
2. Lancer notre backend
3. Lancer nos tests

<br>

Nous allons faire un petit script bash nous facilitant la tâche :

```bash linenums="1"
#runTest.sh

#!/bin/bash
docker-compose up -d
sleep 5

npm run test
docker-compose down
```

!!! warning
    N'oubliez pas de stopper votre **docker-compose** en fin de test

<br>

Le but ici est de pouvoir tout lancer avec une simple et unique commande que cela soit en local, ou en CI/CD avec `./runTest.sh`

!!! tip
    Pensez bien à autoriser les droits d'éxecution de ce script avec `chmod +x ./runtTest.sh`


## Comment gérer les tests en local et en CI/CD avec les variables

On sait que la connexion string pour un mongodb lancé en local est **mongodb://localhost:27017**. On le verra plus tard, mais nous allons avoir une tout autre connexion string lorsque on lancera nos tests sur Gitlab. 

Je vais spoil un peu, mais celle-ci sera **mongodb://mongo:27017**, nous le verrons pourquoi par la suite.

Nous devons donc gérer une **variabilisation** de cette connexion string, afin de pouvoir lancer avec une même et unique commande nos tests en local mais aussi en CI/CD afin d'avoir un code propre et efficace. Sinon cela risque d'être un gros merdier si on doit maintenir 2 code différents 🫠

### Creation de fichiers .env

On commence donc par créer 2 fichiers d'environnements, nous permettant de distinguer les 2 differentes connexion string à mongo, et d'en avoir une chargé selon le type d'environnement ou on execute le test.

```bash linenums="1"
# .env.ci

DB_HOST=mongo
```

```bash linenums="1"
# .env.local

DB_HOST=localhost
```

On va vouloir, charger la bonne configuration, injecter ces valeurs en variables d'environnements selon le bon type d'environnement ou tu lances tes tests.


### Update du Backend
#### Update du code
Maintenante que nous utilisations une variable d'environnement pour setter notre connexion string pour la MongoDB, nous allons mettre à jour la fonction qui nous connecte à celle-ci avec cette varible :

```js linenums="1"
// app.js

mongoose.connect(`mongodb://${process.env.DB_HOST}:27017/mydatabase`, { useNewUrlParser: true, useUnifiedTopology: true });
```

### Update du package.json pour le lancement du backend
Nous devons modifier notre script NPM de lancement du backend afin de lui injecter la variable

```json linenums="1"
// package.json

{
    "scripts": {
        "start": "node --env-file .env.local app.js",
        "test": "jest --runInBand"
    }
}
```

On peut desormais lancer notre backend pour le developpement en local avec `npm run start` qui va aller taper sur la nouvelle connexion string.


### Update des Tests
#### Update du code
Faisons la même chose pour notre test Jest :

```js linenums="1"
// app.test.js

beforeEach(async () => {
    await mongoose.connect(`mongodb://${process.env.DB_HOST}:27017/mydatabase`);
});
```

<br>

#### Update de Jest pour le lancement des tests
Ici on va devoir faire un peu plus de modification afin de lancer Jest avec les bonnes variables selon ton environnement.

Ici on ajoute un fichier, qui défini des paramètres pour l'éxecution de Jest. On ajoute une option permettant de charger un fichier JS qui s'executera avant le lancement de Jest et des tests.

```js linenums="1"
// jest.config.json

{
    "globalSetup": "<rootDir>/dotenv-test.js"
}
```
<br>

On va donc creer un nouveau fichier qui va s'occuper d'injecter la bonne variable selon ton environnement :

```js linenums="1"
// dotenv-test.js

const path = require('path');
const dotenv = require('dotenv');

let envFilepath = ""

if (process.env.CI) {
    envFilepath = ".env.ci"
} else {
    envFilepath = ".env.local"
}

module.exports = async () => {
    dotenv.config({ path: path.resolve(__dirname, envFilepath) });
};
```

Ici rien de bien complexe. Je me base, pour selectioner le bon fichier d'env à injecter, selon si on a setter une var d'env **CI** ou non. Le but ici est, en local de n'en avoir aucune et donc d'injecter **.env.local** par défaut, et donc en CI/CD, de setter une var `CI: true` qui ira donc charger le fichier **.env.ci** ce coup-ci.



## Lancement des tests en CI/CD avec Gitlab Services
Maintenance que l'on a un code qui s'adapte selon si il est lancé en local ou CI, nous n'avons plus qu'a créer un nouveau job sur Gitlab :

```yaml linenums="1"
# integration-testing.yaml

integration-testing:
  stage: it
  image: node:20-alpine3.19
  variables:
    CI: true
  services:
    - name: mongo:latest
      alias: mongo
  script:
    - npm install
    - npm run test
```

Ici nous avons besoin d'une alpine avec NodeJs d'intégré.

Comme je l'ai dit dans la partie précédente, afin d'activer le bon environnement au lancement de Jest, on set une var d'env `CI:true`

On utilise ici un nouvel attribut de Gitlab, **services**, qui agit ici comme notre docker-compose en local. Il va simplement charger une image mongo et la faire tourner en arrière-plan. L'alias ici permet de différencier nos services le jour ou nous devons en faire tourner plusieurs. C'est très utile car cela permet de leur setter un hostname différent entre eux.
