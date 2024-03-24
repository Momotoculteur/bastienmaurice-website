## Introduction
Je vais te proposer ici de t'expliquer comment deployer un site web static, développer sur un frontend de vue JS de type React, Angular ou encore VueJS vers Gitlab Pages. Ici je te propose donc une version qui concerne NodeJS, mais tu peux très bien faire cela en python, etc.

## Code
Le but d'un deploiement avec GitlabCI, est de pouvoir déposer son build de son site web dans un artifact avec un chemin bien particulier qui sera `public`. En effet, Gitlab hebergera si et seulement si votre build est dans ce dossier spécifique.

Ici on souhaite que ce deploiement ne se fasse que sur une production, à savoir lorsque on push des commits sur la branche principale du répository (qui est habituellement `main` ou `master`)


```yaml linenums="1"
# .gitlab-ci.yml
stages:
    - deploy

pages:
  stage: deploy
  image: node:20-alpine3.19
  script:
    - npm install
    - npm build
    - mn ./build ./public
  artifacts:
    paths:
      - public
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
```
