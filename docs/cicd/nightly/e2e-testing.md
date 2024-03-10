Au fur et à mesure que les dévs sortes de nouvelles features sur l'environnement de dév, il se peut qu'ils cassent des fonctionnalités précédente.

!!! question
    Comment vérifier la non présence de récession dans une application ?

Cela va être du ressort des tests end-to-end. Ils vont avoir comme but de tester des scénarios et use cases complexe que des utilisateurs peuvent réaliser au sein de ton app.

## Différents tools pour différents cas d'usage

Je te propose dans la suite de cette section un petit scénario de test que l'on va mettre en place tel que :

1. On lance notre outils de tests
2. On lance un browser
3. On se connecte sur http://example.com
4. Et on réaliser un **expect** qui vérifie la présence d'un titre en **H1**, avec un certain texte précis

### Puppeteer 
C'est un peu le soft basique pour ce genre de test, le plus connu et qui à posé pas mal de base.

#### Mise en place
On commence par un `npm init` afin de setter un projet de base, afin d'avoir notre package.json

On y ajoute une nouvelle ligne dans ce fichier, et on y ajoute un nouveau script qui va nous permettre de lancer nos tests en local :
```json linenums="1"
# package.json
{
    "scripts": {
        "test": "jest"
    }
}
```

On y installe nos dépendances nécéssaire au bon fonctionnement du projet avec `npm install jest puppeteer jest-puppeteer`

On va créer un nouveau fichier à la racine de notre projet **jest.config.json** afin d'y ajouter :
```json linenums="1"
// jest.config.json

{
    "preset": "jest-puppeteer"
}
```

Cela nous permet de lancer tout un ensemble de configuration pré-défini avec jest nous permettant un gain de temps

#### Code du test
```js linenums="1"
// example.spec.js

const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
});

test('Vérifie la présence du titre H1 avec le texte "Example Domain"', async () => {
  // Navigation vers le site
  await page.goto('https://example.com');

  // Recherche du titre H1
  const h1Selector = 'h1';
  const h1Text = await page.$eval(h1Selector, (element) => element.innerText);

  // Vérification de la présence du texte "Example Domain"
  expect(h1Text).toBe('Example Domain');
});
```

Ici j'utilise les hooks Jest **beforeAll** et **afterAll** afin de lancer un nouvel instance du navigateur, qui se lance sur une nouvelle page.
Je défini ici un seul et unique test. J'indique au navigateur d'aller sur le site que je souhaite, verifiant par la suite la bonne présence de mon texte H1 avec un selecteur bien défini.

#### Mise en place en CI/CD

Je distingue 2 stages bien défini :

- **deps** : qui va s'occuper d'installer les node_modules du projet 
- **puppeteer** : qui va s'occuper de récuperer les dépendances du stage précédent, installer chromium, indiquer la bonne variable d'environnement pour le path de l'executable du chromium, installer les dépendances nécessaires pour puppeteer pour enfin lancer les tests

```yaml linenums="1"
# .gitlab-ci.yml

stages:
  - deps
  - puppeteer

install:
  image: node:20-alpine3.19
  stage: deps
  script:
    - npm ci
  artifacts:
    expire_in: 1 day
    paths:
      - node_modules/

e2e-example:
  image: node:20-alpine3.19
  stage: puppeteer
  variables:
    PUPPETEER_EXECUTABLE_PATH: /usr/bin/chromium-browser
  needs:
    - install
  script:
    - npx puppeteer browsers install chrome
    - apk add chromium
    - npm run test
```

### Playwright
C'est le petit nouveau, dont les mains dévs de Puppeteer ont basculé sur ce projet et qui à donc la côté en ce moment.


#### Mise en place
On commence par un `npm init` afin de setter un projet de base, afin d'avoir notre package.json

On y ajoute une nouvelle ligne dans ce fichier, et on y ajoute un nouveau script qui va nous permettre de lancer nos tests en local :

```json linenums="1"
# package.json
{
    "scripts": {
        "test": "playwright test"
    }
}
```

Ici c'est pratique car on ne va même pas avoir besoin d'installer nos packages à la main, playwright nous fourni une commande pour tout initialiser avec les bonnes configurations avec `npm init playwright@latest`

On va avoir un nouveau fichier à la racine *playwright.config.ts*.

#### Code du test

A nous de créer notre test qui suit le scénario décrit comme sur notre introduction de cette section

```js linenums="1"
// example.spec.js
const { test, expect } = require('@playwright/test');

test('Vérifie la présence du titre H1 avec le texte "Example Domain"', async ({ page }) => {
  // Navigation vers le site
  await page.goto('https://example.com');

  // Recherche du titre H1
  const h1Selector = 'h1';
  const h1Text = await page.$eval(h1Selector, (element) => element.innerText);

  // Vérification de la présence du texte "Example Domain"
  expect(h1Text).toBe('Example Domain');
});
```

Ici, le code est encore plus simple qu'avec puppeteer.  On indique directement la page que l'on souhaite ouvrir, et on y réaliser l'**expect** permettant de verifier la présence ou non de notre titre H1.

#### Mise en place en CI/CD

Ici encore 2 stages que je défini tel que :

- **deps** : permettant l'installation des node_modules
- **playwright** : permettant de lancer les tests

```yaml linenums="1"
# .gitlab-ci.yml

stages:
  - deps
  - playwright

install:
  image: node:20-alpine3.19
  stage: deps
  script:
  - npm ci
  artifacts:
    expire_in: 1 day
    paths:
      - node_modules/

e2e-example:
  image: mcr.microsoft.com/playwright:v1.42.1-jammy
  stage: playwright
  needs:
    - install
  script:
    - npm run test
```

!!! warning
    Attention, dans ce second stage ou je lance les tests, je n'utilise plus mon alpine-node, mais bien, une image recommandé par les équipes de playwright. Celle-ci embarque directement tout les navigateurs, binaires et autre extensions nécessaire pour le lancement de ces tests