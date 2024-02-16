C'est la première étape de ta CI/CD. Ici je vais te montrer comment installer les dependances nécessaire à ton projet pour builder.

## Example avec NodeJS
### Mais pourquoi faire ?

Je te montre un example ici sous NodeJS. On souhaite installer les dependances de tes packages NPM. 
Tu en as besoin initialement pour développer en local tes features, lancer ton serveur en mode dév pour développer des features (te permettant des fonctionnalités comme le hot-reload), etc. 

<br>

!!! question
    Mais pourquoi j'en aurais besoin d'avoir mon dossier de node_modules présent en CI/CD ?

<br>

Tot ou tard tu vas souhaiter build ton projet. Que cela soit une application que tu souhaites distribuer sous forme d'image Docker pour un Helm Chart, ou encore une simple lib NPM. Il va te falloir passer par un bundler, comme par exemple esBuild, Webpack, Vite, Parcel, Rollup, etc. Et pour cela, il te faudra forcement d'installé en local tes dependances.

Tu peux egalement en avoir besoin pour lancer tes scripts de ton package.json, que cela soit pour le build, testing, etc. en pipeline. Il te faudra donc tes modules d'installé encore une fois en local.

### Exemple de code

1. On crée un nouveau job `install-deps` appartement au stage `dependencies`
2. Etant a la racine, on lance `npm ci`. C'est l'équivalent de `npm install`, mais en plus rapide et donc optimisé pour les environnements CI/CD. En effet il ne va pas s'embêter à re-calculer tout l'arbre des dépendances et appliquer comme tel est spécifié dans le `package-lock.json`

```yaml linenums="1"
install-deps:
  stage: dependencies
  image: node:20-alpine3.18
  script:
    - npm ci
  artifacts:
    expire_in: 1 day
    paths:
      - ./node_modules/
```

!!! tip
    Etant donnée que tu risques d'avoir besoin du dossier `node_modules` contenant tout tes modules NPM dans d'autres jobs, et afin de les installer une seule et unique fois dans toute ta pipeline, cela te fera un gain de temps 😎 On utilise la prop `artifacts`

