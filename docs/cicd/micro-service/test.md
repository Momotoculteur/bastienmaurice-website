# Test

## Tools pré-requis
Identique que [Frontend](./frontend.md#tools-pre-requis)

## Orchestrateur de test 
Il existe une multitude d'orchestrateur : Mocha, Vitest, Selenium, WebdriverIO, Cypress, Jasmine, Puppeeteer, TestCafe, AVA

De mon point de vue l'état de l'art est :

- **Orchestrateur** : Jest
- **Test cross browser** : Playwright
- **Framework de front** : Testing Library

### Testing

#### Unitaire - Jest

Example de test unitaire sous Jest pour une fonction. Plusieurs mots clés ici propre à Jest :

- **describe** : décrit un bloc de test  
- **test** : défini un test d'une feature  
- **expect** : une condition à vérifier, un résulat attendu précis  


```typescript linenums="1"
// myfunc.test.tsx
import { myfunc } from './func'

describe("Simple unit test", () => {
  test('renders learn react link', () => {
    expect(myfunc()).toBe(30)
  });
})
```

Jest te donne une multitude de condition afin de tester au mieux tes cas d'usages de fonction :

- Egale à une valeur
- Throw une erreur
- A été appelé x fois avec x paramètres
- Doit avoir ce type 
- Et bien d'autres...

<br>

#### Visuel - (React) Testing Library
Ici parlons d'UI. Je souhaite vérifier sur l'accueil de mon application la présence par example d'un champ de texte *Mon Titre de Site*

```typescript linenums="1"
// myfunc.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe("Simple UI test", () => {
  test('render', () => {
    render(<App />);
    const linkElement = screen.getByText(/Mon Titre de Site/i);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toBeVisible()
  });
});
```

La première étape de render permet à ma lib de test d'afficher le contenu HTML de mon composant React. Ainsi, il va pouvoir créer le DOM HTML de ma page et y effectuer tout les expect que je souhaite. Par exemple ici, je recherche si mon champ de text que je demande sous forme de regex, est présent dans le document et qu'il est bien visible (pas de balise CSS en hidden par example)


## Divers astuces

### Mock d'API, de module, de fonctions...
Quand tu vas souhaiter réaliser des tests unitaire, tu veux test une chose bien précise. Mais des fois tu vas être bloqué dans des cas ou dans la fonction que tu souhaites tester celle-ci en appelle d'autre. Ou face des appels à des fonctions défini dans des librairies. Ou encore des appels API, et tout un tas d'autres compléxités.

<br>
Tu as des moyens de **mocker**, terme qui veut simplement dire de faker, de remplacer la fonction d'une fonction, par une autre que tu auras choisis.

Example : Tu as une page d'accueil qui affiche un titre, et un paragraphe de donnée peuplé par une requête Axios. Tu souhaites tester que la requête est bien appellé et qu'elle remplis bien ton paragraphe. Soucis, tes datas dans ton application en production est peuplé par ton backend. 

<br>
Quand bien même tu lances tes tests avec un json-server pour faker tes datas, tu peux avoir un moyen encore plus simple sans pour autant lancer quelquonque serveur ou service en tâche de fond. 

<br>
Jest (ou d'autres modules le fond aussi si tu préfères avoir une lib npm particulière dédié à ça) te propose des fonctions pour mocker tes fonctions. Example de mock pour ta lib Axios :

- Mocker le module Axios dans son intégralité, ainsi plus d'erreur quand tu test 
- Mocker une fonction particulière seulement, par exemple un axios.get() pour mocker les requêtes de type axios.GET()
- Mocker des datas de retour que tu décides selon si tu appelles une fois ou n fois ton endpoint, avoir des data différentes entre chaque appels
- Mocker des erreurs, afin de tester comment ton app se comporte si le backend est HS, si présence de spinner et autre message d'alerte pour l'utilisateur
- etc.

En mockant ces APIs, tu peux vraiment tester une multitude de cas, quand ton app fonctionne, quand tu as une erreur lors de l'appel à la requête, que tu as peu ou beaucoup de data, etc.

<br>
Je te montre un simple example ici, avec du React, Jest, et ReactQuary (qui embarque de l'axios en soit).

On commence par importer le nécéssaire. Le **useGetCars** est un hook ReactQuery que j'ai utilisé pour simplement taper sur un endpoint d'un backend et qui renvois des données. On mock ainsi cette fonction par jest.
```typescript linenums="1"
// app.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useGetCars } from './api/useGetCars';

const mockedQuery = useGetCars;
jest.mock("./api/useGetCars");
```

<br>
Ici on initialise le client ReactQuery, et on créer un wrapper. Il va se charger d'insérer un composant React et lui insérer la dép nécéssaire au bon fonctionement de ReactQuery en lui fournissant le client.

```typescript linenums="1"
// app.test.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

<br>
On mock l'implémentation de la fonction qui est appellé dans notre composant React. On mock la valeur de retour que l'on veut. Ici je fausse avec une liste de data.

```typescript linenums="1"
// app.test.tsx
describe("Simple unit test", () => {
  test('Test react query sous status SUCCESS', () => {
    mockedQuery.mockImplementation(() => ({
      data : [
        "Ford"
      ]
    }));

    render(<App />, { wrapper });

    const linkElement = screen.getByText(/Ford/i);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toBeVisible()
  });
```

!!! note
    Vous pouvez renvoyer ce que vous voulez. Un objet, une liste, une promesse, etc.

!!! warning
    Attention à bien mocker vos données de retour pour imiter au mieux une utilisation réel de votre application avec les modules que vous appellez. Ici je sais que ReactQuery renvoi un object avec un champ *data* lorsque celui est vraiment appelé

### Jest hook
Une chose qui te sera très utile, et que Jest te propose l'utilisation de hook pour automatiser des tâches qui vont te permette de préparer tes tests, l'environnement, et de bien pouvoir les enchaînes entre eux de façon distinct.

Exemple d'un hook autour de l'utilisation des mocks comme vu précédemment :
```typescript linenums="1"
describe("Simple test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('render', () => {});
});
```

Tu peux avoir des fonctions qui vont être appellé automatiquement :

- Avant chaque test
- Après chaque test : 
- Avant chaque bloc de test (describe)
- Après chaque bloc de test (describe)

Ainsi tu vas pouvoir reset des par examples des mocks entre chaque test (beforeEach) ou encore setup la connection à une database en début de bloc définit par un *describe* (beforeAll)

