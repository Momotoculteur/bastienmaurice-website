On souhaite garantir une certaine qualité de code. Avec des outils tel que Sonarqube, tu peux avoir des feedback, te procurant des métriques sur d'eventuelles code smell ou bug, valider selon des quality profiles et quality gates, que nous verrons dans un prochain chapitre 😋

En attendant pour ce chapitre ci, on va s'interesser à l'étape de Lint. Cette opération d'analyse statique de ton code va te permettre de mettre d'éventuels ereurs dans ton code par des vérifications rudimentaires.

Tu pourras en plus d'associer cette étape de vérificaiton, une étape de formatage de ton code te permettant d'avoir un code mieux formatté, et donc plus lisible pour les développeurs lorsqu'ils travaillent de façon collaborative afin de garantir et respecter certains standerd et best practices.


## Example avec NodeJS
Il te faudra au préalable effectuer une installation de tes nodes modules.

### Verification du code 

Installe ton linteur favori. Ici je te propose le plus standard pour du NodeJS, à savoir `eslint`

Installe le avec `npm install eslint`

Tu peux initialiser eslint toi même, ou de facçon automatique via `npm init @eslint/config`


On ajoute une nouvelle ligne de script dans notre package.json afin d'appeller notre module :

```json linenums="1"
# package.json
{
    "scripts": {
        "lint": "eslint ."
    }
}
```

!!! info    
    **Eslint** inclus de nombreuses options avec lui. A savoir si tu veux lint un directory particulier, fix les erreurs en même temps, etc. Tu peux ajouter d'avantages npm module afin de linter du code de framework particulier (Ex: React, CommonJS, ESM, etc.) ou encore des règles de formatage du code (Ex: Airbnb style, Google style, etc.)

Côté gitlab on aura :

```yaml linenums="1"
lint:
    stage: static-analysis
    image: node:20-alpine3.18
    needs:
        - install-deps
    script: 
        - npm run lint
```


### Verification des modules 

Rajoutons dans le même stage un nouveau job. Ajoutons le en mode informatif, c'est à dire qu'il apparaisse dans notre workflow mais qu'il ne stop pas la pipeline si celui fail, via la property `allow_failure`.  

Une commande `npm outdated` du package manager peut s'averer utile pour informer le developpeur, de connaître l'état de santé des modules qu'il utilise. Il pourra ainsi avoir une idée de l'ensemble de ses modules, si ils sont à jour ou non.  

On ne souhaite pas seulement qu'un développeur développe des features, selon une user story qu'il aurait pris dans son backlog.  

Cela permet de rendre le développeur d'avantage impliqué à maintenir les dépendances de son projets, à des fins de sécurité (notion de **ShiftLeft** & de **DevOps**), et non pas seulement à se focus à seulement développer sa feature. Le développeur doit prendre d'avantage de responsabilités.

!!! info
    Les notions de **user story**, **backlog** ou encore de **sprint** appartiennent au framework **Scrum**, une méthodologie **Agile**

<br>

Notons ici une property `needs`, qui permet à mon job courant de ne s'executer qu'à la suite de `install-deps`, et si et seulement-ci celui-ci passe sans erreur.

```yaml linenums="1"
npm-outdated:
    stage: static-analysis
    image: node:20-alpine3.18
    allow_failure: true
    needs:
        - install-deps
    script:
        - npm outdated
```
