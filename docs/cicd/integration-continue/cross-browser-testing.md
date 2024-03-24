Avec l'évolution des devices mobiles et ayant chacun leurs spécificités techniques bien précise, tu te retrouves avec des combinaisons infini de configuration différentes :  

- Taille de l'écran
- Résolution de l'écran
- Type du navigateur
- Version du navigateur
- Version de l'OS du device
- Etc...

!!! question
    Mais comment s'assurer en tant que développeur, ton application fonctionne sur l'ensemble de cette base de devices ?


## Payant & SaaS : Browserstack Automate
### Pour quelle use case ?
Je te présente ici un tool en SaaS que j'ai du mettre en place auparavant. Il te permet de lancer ton application sur une ferme de device à distance.  

 L'hebergeur de cette application comporte un grand nombre d'ordinateurs et de smartphone dans ses propres locaux, avec des OS, Browser et versions différentes de ces deux derniers. Tu peux ainsi t'assurer que ton application fonctionne bien chez un ensemble d'utilisateur de ton app. 

 Tu peux définir toi même une matrice de devices spécifiques que tu conçois auquel tu souhaites valider ton application.

 Pour valider que ton application fonctionne sur l'ensemble de ces devices, c'est à toi de rédiger des tests end-to-end pour valider que la navigation soit fluide selon des métriques, si l'utilisateur voit bien ses pages, boutons, etc, si il a bien accès à ses pages personnel. Tu disposes de languages et framework différents pour réaliser cela. 

!!! tip
    A des fins de maintenabilité, je te conseille d'avoir une seule codebase qui puisse target l'ensemble des devices que Browserstack te propose.

Pour cela tu devrais écrire tes tests en Javascript/Typescript, avec Selenium. En utlisant d'autres Framework comme Puppeteer, Playwright, Cypress, Appium, Espresso, tu ne vas pouvoir target que des devices mobiles, ou seulement des ordinateurs, ou encore que des browser ou OS spécifique.

### Example de code
#### Installations des dependances
On commence ici par installer les dependances necessaires. Je vous liste dont j'ai eu besoin qui sont dans mon package.json :


```json linenums="1"
// package.json

{
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "browserstack-local": "^1.5.5",
    "browserstack-node-sdk": "^1.31.25",
    "jest": "^29.7.0",
    "selenium-webdriver": "^4.18.1"
  }
}
```

#### Configuration de Browserstack
On créer un nouveau fichier à la racine du projet

```yaml linenums="1"
# browserstack.yml

platforms:
  - os: Windows
    osVersion: 10
    browserName: Chrome
    browserVersion: 120.0
  #- os: OS X
    #osVersion: Monterey
    #browserName: Safari
    #browserVersion: 15.6
  #- deviceName: iPhone 13
    #osVersion: 15
    #browserName: Chromium
    #deviceOrientation: portrait
parallelsPerPlatform: 1
browserstackLocal: true
buildName: test-build
projectName: BrowserStack Test
debug: false
networkLogs: false
consoleLogs: errors
```

C'est ici que l'on va pouvoir créer toute les configurations possible des devices sur lesquelles on souhaite lancer nos tests. Pour exemple j'en affiche 3 ici.

#### Baseline des codes de test

Ici on va écrire nos tests en NodeJS, lancé par Jest, et utilisant Selenium. 

!!! question
    Pourquoi ici je préconise Selenium contrairement à d'autres framework qui pourrait être soir plus performants, ou avec une syntaxe plus lisible ? 

C'est qu'avec Selenium et seulement ce framework, avec une seule et même unique baseline de code, que l'on va pouvoir target à la fois du Windows, du MacOS, Android et iOS.  
Les autres framework de test ne peuvent pas target autant de devices en même temps, ce qui est problématique car on va devoir écrire un même code, sous une syntaxe différentes. Ceci va donc créer une sacrée duplication de code et une lourde maintenabilité.

Ecrivons un simple test :

```js linenums="1"
// test.spec.js

const { Builder, Capabilities } = require("selenium-webdriver");

describe("Test browserstack", () => {
    let driver;

    beforeAll(() => {

        driver = new Builder()
            .usingServer(`http://localhost:4444/wd/hub`)
            .withCapabilities(Capabilities.chrome())
            .build();
    });

    afterAll(async () => {
        await driver.quit();
    })


    it('should open Google homepage', async () => {
        await driver.get('https://www.google.com');
        expect(await driver.getTitle()).toContain('Google');
    });
});
```

Ici je te propose un code des plus simple qui va :

1. Initier une connexion vers les devices de Browserstack
2. Lancer un seul test permettant d'aller sur google, et de verifier le titre de la page
3. Fermer la connexion


#### Setter les token pour le lancement en local
On va créer un fichier `.env.local`. On y settera les variables `BROWSERSTACK_USERNAME` et `BROWSERSTACK_ACCESS_KEY`

#### Setter les tokens pour le lancement en CI/CD
Ici nous allons faire simple et setter en variables de CI/CD, des var de type secrets pour `BROWSERSTACK_USERNAME` et `BROWSERSTACK_ACCESS_KEY`

#### Ajouts des scripts de lancement 
Ici on va créer deux nouveaux scripts :

- **test-cicd** : permettant de lancer nos tests en CI/CD
- **test-local** : permettant de lancer nos tests en local, avec une touche en plus permettant de chargé notre fichiers local de variable

#### Mise en place de la CI/CD
Voici le code GitlabCI permettant de lancer nos tests :

```yaml linenums="1"
# .gitlab-ci.yml

stages:
  - test

automate: 
  image: node:20-alpine3.19
  variables:
    CI: true
    BROWSERSTACK_USERNAME: '$BROWSERSTACK_USERNAME'
    BROWSERSTACK_ACCESS_KEY: '$BROWSERSTACK_ACCESS_KEY'
  stage: test
  script:
    - npm install
    - npm run test-cicd
```
