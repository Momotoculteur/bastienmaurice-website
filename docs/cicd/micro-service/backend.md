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

app.get('/cars', (req, res) => {
    const data = ['Ford', 'Renault', 'BMW'];
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```
### Documenter son API - OpenAPI & Swagger UI
OpenAPI est une spécification qui te permet de définir et standardisé toute ton API. Tu définis tes endpoints, les types de paramètres en query ou en body, les réponses et status code associé, les token d'autorisation et pleins d'entres en-têtes.
[TODO]

### Securiser son API
#### Gérer ses headers - HelmetJS
HelmetJS est un super packet NPM qui te permet de vérifier pleins de régles concernant ton serveur ExpressJS. Il se concentre essentiellement à paramétrer les en-têtes HTTP. Très simple d'utilisation, tu peux l'utiliser avec tout ses règles par defaut via : 
```javascript linenums="1"
const app = express();

app.use(helmet());
```

Libre à vous par la suite de n'activer que certains règles et de les customiser une à une.

#### Valider ses requêtes - OpenAPIExpressValidator
Ce module permet de :

- valider une requête entrante du frontend et ses paramètres/input
- valider une réponse


On ajoute le module via `npm install express-openapi-validator`


Custom message derreur /endpoint non existant
{"message":"not found","errors":[{"path":"/carss","message":"not found"}]}

Exemple string au lieu de int
{"message":"request/params/id must be integer","errors":[{"path":"/params/id","message":"must be integer","errorCode":"type.openapi.validation"}]}


[TODO]