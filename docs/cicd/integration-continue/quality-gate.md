Le développement est devenu un travail colaboratif avec Git. On peut travailler à plusieurs sur un même projet, à plusieurs sur une même feature.  

Chaque développeur ayant fait ses propres études, à ses propres expériences et façon de travailler, tu peux rapidement avoir un projet qui diverge selon si c'est tel ou tel personne qui ait codé cette portion là.  

Afin de garantir un code propre, et de garantir que l'on respecte les meilleurs pratiques afin d'avoir un code clean, lisible, fonctionne et durable dans le temps en terme de maintenabilité, il existe des outils te permettant de réaliser ces opérations de vérifications.  

## SonarQube

C'est l'OUTIL le plus utilisé, connu et commun de tous pour la réalisation de cette tâche-ci.

Sonar dispone de scanner, appelé par ta pipeline, qui va analyser ton code source de ton application et calculer pas mal d'informations et te faire un report global sur la qualité générale de ton application.

Il te permet de définir l'ensemble des points précedents via deux choses :

- **Quality Profile** : Un Profile va recencer un ensemble de régles qui organise les bonnes pratiques, sur un language spécifique. Tu peux donc faire des quality profile sur du Pyhon, NodeJS, Golang, etc. Il va te définir des règles sur comment définir une variable, comme indenter ton code, gérer des normes de compléxité sur ton code, etc.
- **Quality Gate** : Une Gate est un ensemble de métriques que ton projet va devoir atteindre et respecter si tu veux avoir le tampon de Sonar pour valider ta merge request en cours sur laquelle tu analyses ton code. Tu vas ainsi spécifier que tu souhaites une couverte de code avec l'ensemble de tes tests de X pourcentage, que tu souhaites un niveau de code smell de X rangs, que tu souhaites X issues maximum sur ton projet, etc.

### Se faire une instance de test en local
Pour lancer une analyse Sonar, il te faudra forcement une instance de Sonarqube qui tourne déjà. Si tu souhaites juste t'exercer sur l'application à des fins de simple tests, tu peux te lancer un Sonar en local avec Docker Desktop ou le deployer via un Helm Chart dans un cluter kubernetes en local, via Minikube par example.

#### Via Helm Chart
Pas besoin de moi pour ajouter sur un ArgoCD une nouvelle application avec `https://SonarSource.github.io/helm-chart-sonarqube` comme source du helm chart, avec `sonarqube/sonarqube` comme nom de Chart.

#### Via Docker

On se lance une instance en local. On target la version community qui est free avec `docker run -d --name sonarqube -p 9000:9000 sonarqube:10.4.0-community`. On expose un port specifique afin de pouvoir aller ouvrir un onglet sur ton browser préféré sur `localhost:9000`. 

#### Accès au pannel d'administration

Connecte toi sur l'interface avec `admin` comme username, ainsi qu'en password, sur l'adresse et le port sur laquelle tu fais tourner ton application. Si c'est en local, cela sera forcement sous forme `localhost:<ton_port>`

#### Token
Afin que la pipeline ait les droits de trigger des infos venant de Sonarqube, tu vas devoir créer un token dans ton espace perso **Compte -> Security -> Générer token**.

#### Récupérer la base URL de Sonar
Nous avons sur notre projet des gitlab runners self-hosted sous forme de container docker. Nous avons un second docker container qui run notre instance de Sonarqube en local, accessible via localhost:9000.

!!! question
    Comment indiquer depuis notre pipeline Gitlab, via la CLI de SonarScaner la communication vers notre instance sonar pour lui faire analyser notre projet ?

Il faut faire attention ici. On ne peut simplement donner *localhost:9000* comme *host URL* en pipeline. En effet, nos 2 services tournant sur des containers docker, ils sont absolument isolés, même d'un point de vue réseau. Ils ont donc chacun leur propre localhost.

Afin d'assurer la bonne communication entre nos 2 services, on va devoir récupérer l'IP temporaire du container qui execute notre container sonarqube avec :
`docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' sonarqube`

C'est celle-ci que l'on mentionnera en argument de la CLI de sonnar scanner avec l'argument **-Dsonar.host.url**

### Example de code

```yaml linenums="1"
sonarqube-check:
  stage: quality-gate
  image:
    name: sonarsource/sonar-scanner-cli:latest
    entrypoint: [""]
  variables:
    GIT_DEPTH: "0"  # Fetch toute branche du projet, requis par Sonar
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner -Dsonar.qualitygate.wait=true -Dsonar.host.url=http://<ip_du_container_sonarqube>:9000 -Dsonar.token=<token_generé> -Dsonar.sources=<source_de_ton_projet_a_analyser>
```

A toi de customiser l'appel de sonar via la cli de son scanner avec certaines options importantes :

- **sonar.host.url** : spécifié l'url de ton instance de Sonar
- **sonar.token** : spécifié le token généré, de préférence sans expiration et via un compte de service globale à ton entreprise. Appelle le via un secret de pipeline GitlabCI qu'il ne soit jamais affiché en log via *${TON_SECRET_ENV_VAR}*
- **sonar.sources** : spécifié une liste de dossiers que tu souhaites analyser par Sonar


Tu peux spécifier pleins d'autres, comme des regex aussi de dossier que tu souhaites ignorer lors de l'analyse, etc.