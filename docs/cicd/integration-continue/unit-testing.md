Tu développes une application et tu souhaites automatiser tes tests unitaires en CI/CD. Très utile, puisque cela te permettra de verifier que tu as atteinds un minimum de couverture de code avec tes tests, garantissant un test de meilleure qualité. Cela peut aussi mettre en évidence des regressions qui peut arriver en ajoutant des features à ton application, et qu'en modifiant certaines parties du code, tu casses d'anciennces fonctionnalités.

## Example avec NodeJS
Il te faudra au préalable effectuer une installation de tes nodes modules. Tu peux aussi ajouter l'étape de lint comme job à réaliser avant.

### Ajout du script dans le package.json
Je te propose d'utiliser l'orchestrateur de test le plus utilisé du moment, à savoir **Jest**, initiallemnt développé par Facebook, puis donné à OpenJS fondation en open source. 

Installons le via `npm install jest`

On initialise un nouveau script dans notre fichier package.json, permettant de lancer Jest. N'oublsi pas 

```json linenums="1"
# package.json
{
    "scripts": {
        "test": "jest ."
    }
}
```

!!! info
    **Jest** dispose de nombreuses options, te permettant de lancer tes tests en sequentiel, parallèle, etc.

### Ajout d'un simple test de foncton 
Imaginons que j'ai une fonction dont je souhaite tester que sa valeur de retour soir un chiffre, 30 :

```ts linenums="1"
import {getAge} from './utils'

describe("Simple unit test", () => {
    test('renders learn react link', () => {
        expect(getAge()).toBe(30)
    });
  })
```

### Ajout d'un simple test visuel
Imaginons que je souhaite tester la présence d'un certain champ de texte, 'bg', sur ma page que je render dans mon test. Pour cela je vais vérifier dans cet example que ce texte soit visible sur ma page, ainsi que bien présent dans le DOM de mon application. J'utilise pour cela la best librairie pour cela concernant React, à savoir la **Testing Library**

```ts linenums="1"
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe("Simple unit test", () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/bg/i);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toBeVisible()
  });
})
```



### Ajout du stage & job en CI/CD
Nous n'avons plus qu'a créer un job, que l'on nomme ici **unit-test**, appartenant au stage (une sorte de groupement de job) **test**

```yaml linenums="1"
unit-test:
    stage: test
    dependencies:
    needs:
        - lint # optionnel
        - install-deps-client # optionnel
    image: node:20-alpine3.18
    script:
        - npm run test
```
