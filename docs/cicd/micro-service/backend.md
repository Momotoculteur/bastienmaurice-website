# Backend

## Tools pré-requis
Identique que [Frontend](./frontend.md#tools-pre-requis)

## Initialisation du projet
On initialise un nouveau projet via `npm init`.  
On ajoute express via `npm install express`

### Serveur & Simple API - Express
On créer un simple endpoint **GET** sur **/cars**.
```javascript linenums="1"
const express = require('express')
const app = express()
const port = 5000

const data = ['Ford', 'Renault', 'BMW'];

app.get('/cars', (req, res) => {
  res.send(data)
})

app.get('/cars/:id', (req, res, next) => {
    res.send(data[req.params.id])
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```
### Documenter son API - OpenAPI & Swagger UI
OpenAPI est une spécification qui te permet de définir et standardiser toute ton API. Tu définis tes endpoints, les types de paramètres en query, path, ou en body, les réponses et status code associé, les token d'autorisation et pleins d'entres en-têtes.  
<br>
Je te montre ici le résultat que donne mon **openapi.yml** en mode graphique :

!!swagger openapi.json!!

J'ai fais quelque chose de simple ici avec deux endpoints. Mais lorsque tu arrives sur une vraie application avec des dizaines de endpoints malgré une architecture en micro-service (j'imagine même pas les bon gros monolitics à l'ancienne), ça peut t'aider d'une part à découper un peu l'ensemble afin d'y voir plus clair sur les fonctionnalités du service. Mais aussi à pouvoir tester ton API de façon dynamique directement via ce fichier en local, pour le peu que tu le host depuis ton serveur Express lorsque tu es en mode développement.

```yaml linenums="1"
openapi: 3.0.0
info:
  version: 1.0.0
  title: Sample API
  description: A sample API to illustrate OpenAPI concepts
tags:
  - name: car
    description: API about cars
paths:
  /cars/{id}:
    get:
      tags:
        - car
      parameters:
        - name: id
          in: path
          description: id of car 
          required: true
          schema:
            type: integer
            format: int32
      description: Returns a car             
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: string
                example: "Ford"
  /cars:
    get:
      tags:
        - car
      description: Returns a list of cars              
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  type: string
                  example: Ford,Renault
```


### Securiser son API
#### Gérer ses headers - HelmetJS
HelmetJS est un super packet NPM qui te permet de vérifier pleins de régles concernant ton serveur ExpressJS. Il se concentre essentiellement à paramétrer les en-têtes HTTP. Très simple d'utilisation, tu peux l'utiliser avec tout ses règles par defaut via : 
```javascript linenums="1"
const app = express();

app.use(helmet());
```

Libre à vous par la suite de n'activer que certains règles et de les customiser une à une.

<br>

#### Valider ses requêtes - OpenAPIExpressValidator
Je t'ai expliqué plus haut pourquoi il est conseillé de faire un fichier de specification OpenAPI/Swagger de ton micro-service. Cette section est dépendante de ce fichier là. On va installer un nouveau module qui va se baser sur ce fichier là. En effet, *OpenAPIExpressValidator* va charger cet OpenAPI et se baser sur l'ensemble des specs afin de créer une multitude de règles. Tu peux par example t'en servir pour :

- valider/rejeter une requête du frontend en vérifiant que ça target bien un endpoint valide et existant
- valider/rejeter une requête du frontend en vérifiant que les paramètres de query, path ou du body respectent les typages

<br>
On ajoute le module via `npm install express-openapi-validator`. Quelques modifications sont à faire dans notre `index.js`  

<br>

On commence par ajouter notre serveur **http** qui va exposer ce coup-ci notre **Express**. On défini quelques variables pour le port de l'application. On utilise de nouveaux **middlewares** qui vont nous permettre d'ajouter des fonctionnalités à Express comme parser le JSON

```js linenums="1"
// index.js
const express = require('express')
const http = require('http');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));
```

<br>

On ajoute le middleware **OpenApiValidator** à Express
```javascript linenums="1"
// index.js
app.use(
    OpenApiValidator.middleware({
        apiSpec: './openapi.yaml',
        validateRequests: true, // (default)
        validateResponses: true, // false by default
    }),
);
```

<br>

On défini l'ensemble de nos **APIs**
```javascript linenums="1"
// index.js
app.get('/cars', (req, res, next) => {...})

app.get('/cars/:id', (req, res, next) => {...})
```

<br>

Et dernière étape, on ajoute un logger qui permet de renvoyer les erreurs au frontend si on a un soucis. Et enfin on lance notre **Express** via **http**.
```javascript linenums="1"
// index.js
app.use((err, req, res, next) => {
    // format error
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

http.createServer(app).listen(port);
```

<br>

On en a maintanant fini pour le setup de ce nouveau middleware. Une fois le serveur lancé, on peut déjà avoir des examples de messages d'erreurs que l'on avait pas auparavant :

-  Example lorsque tu target un endpoint qui n'existe pas. Example ici pour /caars au lieu de /cars
`{"message":"not found","errors":[{"path":"/carss","message":"not found"}]}`

- Example d'une requête avec un path parameter de type string au lieu de int  
`{"message":"request/params/id must be integer","errors":[{"path":"/params/id","message":"must be integer","errorCode":"type.openapi.validation"}]}`

