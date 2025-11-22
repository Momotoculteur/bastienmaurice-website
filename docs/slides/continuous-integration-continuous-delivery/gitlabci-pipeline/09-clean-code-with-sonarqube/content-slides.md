## Introduction 

SonarQube est une **plateforme d'analyse de code statique** qui aide à maintenir une haute qualité de code en identifiant **les bugs**, **vulnérabilités et dettes techniques**.  

Il prend en charge plusieurs langages et s'intègre facilement avec des pipelines CI/CD, comme ceux de GitLab, pour automatiser **les contrôles de qualité**.


---


## Fonctionnalités principales de SonarQube

#### Analyse multi-langages
- Prise en charge de plus de 25 langages, notamment Java, Python, JavaScript, Go, et C#.
- Identification des problèmes spécifiques à chaque langage.


---


## Fonctionnalités principales de SonarQube

#### Détection de problèmes
- **Bugs** : Comportements inattendus dans le code.
- **Vulnérabilités** : Failles de sécurité potentielles.
- **Code Smells** : Mauvaises pratiques rendant le code difficile à maintenir.
- **Duplication de code** : Sections dupliquées augmentant la dette technique.


---


## Fonctionnalités principales de SonarQube

#### Surveillance de métriques
- **Coverage** : Pourcentage de code couvert par les tests.
- **Complexité cyclomatique** : Mesure de la complexité du flux d'exécution.
- **Debt Ratio** : Temps estimé pour résoudre les problèmes détectés.


---


## Fonctionnalités principales de SonarQube

#### Quality Gates

- Une **Quality Gate** est un ensemble de règles qui déterminent si une analyse est réussie ou échouée.
- Par défaut, un Quality Gate inclut des seuils pour la couverture des tests, le nombre de bugs, etc.
- Les Quality Gates permettent de bloquer des déploiements en cas de non-conformité.


---


## Fonctionnalités principales de SonarQube

#### Gestion des branches et PR
- SonarQube analyse les branches et les Pull Requests individuellement.
- Génère des rapports spécifiques pour éviter d'introduire de nouveaux problèmes.


---


## Fonctionnalités principales de SonarQube

#### Extensions et intégrations
- Prise en charge de plugins pour des fonctionnalités supplémentaires.
- Intégration avec GitLab, Jenkins, Azure DevOps, et d'autres outils CI/CD.


---


## Concepts clés de SonarQube

#### Projet
Un projet dans SonarQube correspond à un référentiel ou une application. Chaque projet dispose d’un tableau de bord avec des métriques spécifiques.
</br></br>

#### Problèmes (Issues)
- **Severity** : Chaque problème est classé par gravité (Blocker, Critical, Major, Minor, Info).
- **Type** : Bug, Vulnérabilité, ou Code Smell.
</br></br>

#### Debt (Dette technique)
Le temps nécessaire pour corriger les problèmes détectés. SonarQube offre une vue globale de la dette technique par projet.


---


## Intégration avec GitLab CI

```yaml
sonarqube-check:
  stage: quality-gate
  image:
    name: sonarsource/sonar-scanner-cli:latest
    entrypoint: [""]
  variables:
    GIT_DEPTH: "0"  # Fetch toute branche du projet, requis par Sonar
  script:
    - sonar-scanner -Dsonar.qualitygate.wait=true -Dsonar.host.url=http://<ip_du_container_sonarqube>:9000 -Dsonar token=<token_generé> -Dsonar.sources=<source_de_ton_projet_a_analyser>
```


---


---


---

