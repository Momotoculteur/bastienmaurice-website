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