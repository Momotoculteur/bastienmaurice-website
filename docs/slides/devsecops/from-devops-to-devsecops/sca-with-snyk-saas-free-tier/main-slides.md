## Objectifs pédagogiques

- Installer et utiliser Snyk CLI pour scanner des dépendances en local
- Configurer et utiliser la plateforme Snyk SaaS
- Intégrer Snyk dans une pipeline GitLab CI/CD
- Interpréter et gérer les résultats de scan
- Mettre en place des stratégies de remédiation
- Configurer des politiques de sécurité personnalisées



---

# Snyk & Théorie 
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Présentation de Snyk

Snyk est une plateforme de **sécurité applicative** qui permet de :

- Scanner les dépendances open source (SCA)
- Analyser le code source (SAST)
- Scanner les images de conteneurs
- Scanner les configurations Infrastructure as Code (IaC)

**Architecture Snyk :**

- Snyk CLI : outil en ligne de commande pour l'analyse locale
- Snyk SaaS Platform : plateforme web pour la gestion centralisée
- Snyk API : pour l'intégration et l'automatisation
- Intégrations IDE : plugins pour VSCode, IntelliJ, etc.
- Intégrations CI/CD : GitLab CI, GitHub Actions, Jenkins, etc.


---


## Modèle de licence Snyk

**Free Tier :**

- 200 tests par mois
- Projets open source illimités
- Accès à toutes les fonctionnalités de base
- Idéal pour les tests et petits projets

**Plans payants :**

- Team, Business, Enterprise
- Tests illimités
- Fonctionnalités avancées (RBAC, SSO, reporting, etc.)


---

# Snyk & Pratique 
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Installation de Snyk CLI

**MacOS**

```bash
# Avec Homebrew
brew tap snyk/tap
brew install snyk
```

**Linux**

```bash
# Téléchargement direct
curl https://static.snyk.io/cli/latest/snyk-linux -o snyk
chmod +x snyk
sudo mv snyk /usr/local/bin/
```

**Windows**

```bash
# Avec Scoop
scoop bucket add snyk https://github.com/snyk/scoop-snyk
scoop install snyk
```


---


## Principales commandes - Authentification interactive

**Cette commande :**

1. Ouvre votre navigateur
2. Vous demande de vous connecter à Snyk
3. Génère et stocke un token automatiquement

```bash
# Ouvrir le navigateur pour authentification
snyk auth
```


---


## Principales commandes - Scan de base des dépendances

**Scanner un projet Node.js**

```bash
snyk test
```

**Divers :**

```bash
# Projet Python
snyk test --file=requirements.txt

# Projet Java/Maven
snyk test --file=pom.xml

# Projet Java/Gradle
snyk test --file=build.gradle

# Projet .NET
snyk test --file=packages.config

# Projet Ruby
snyk test --file=Gemfile.lock

# Projet Go
snyk test --file=go.mod

# Projet PHP/Composer
snyk test --file=composer.lock
```


---


## Principales commandes - Options d'affichage

```bash
# Format JSON
snyk test --json

# Format JSON avec sortie dans fichier
snyk test --json > snyk-report.json

# Format SARIF (pour GitLab Security Dashboard)
snyk test --sarif

# Afficher uniquement les vulnérabilités high et critical
snyk test --severity-threshold=high

# Afficher des informations détaillées
snyk test --print-deps
```


---


## Monitoring continu

**Enregistrer un projet pour monitoring**

1. Envoie un snapshot des dépendances à Snyk
2. Active le monitoring continu
3. Vous recevrez des alertes lors de nouvelles vulnérabilités

```bash
snyk monitor
```


---


## Options avancées

**Ignorer des vulnérabilités**

Créer un fichier .snyk à la racine du projet :

```yaml
# .snyk
ignore:
  SNYK-JS-BSON-561052:
    - mongodb > mongodb-core > bson:
        reason: None given
  SNYK-JS-BSON-561052:
    - '*':
        reason: None Given
```

Lancer un test : 

```bash
snyk test --policy-path=.snyk
```


---


## Options avancées

**Scanner avec des seuils personnalisés**

```bash
# Échouer uniquement sur critical
snyk test --severity-threshold=critical

# Échouer sur high ou critical
snyk test --severity-threshold=high
```


---


## Merge Requests automatiques

Pour les dépendances vulnérables, Snyk peut ouvrir automatiquement une PR de correction :

- upgrade de version
- remplacement de libraries
- patchs temporaires

Cela fonctionne pour :

- Node.js
- Python
- Go
- Java
- Maven
- Terraform
- Docker


---


## Merge Requests automatiques

Configurer les Fix MRs : Settings → Integrations → GitLab → Settings

**Stratégies de MR :**

- Option A : Single MR
    - Une seule MR regroupant toutes les corrections
    - Plus facile à reviewer et merger
    - Réduit le bruit dans GitLab
- Option B : Separate MRs
    - Une MR par dépendance
    - Permet des corrections progressives
    - Utile si les mises à jour sont risquées


---


## Merge Requests automatiques

**Workflow de revue des MRs Snyk**

1. Notification : MR créée automatiquement par Snyk
2. Review :
      - Vérifier les changements dans package.json/lock
      - Consulter les détails des vulnérabilités corrigées
      - Vérifier qu'il n'y a pas de breaking changes
3. Tests : Pipeline CI/CD se déclenche automatiquement
4. Validation :
      - Tests passent → Merge
      - Tests échouent → Investiguer (possibles breaking changes)
5. Merge : Intégrer à la branche principale


---


## Intégration CI/CD (GitLab CI)

**Préparation : variable secrète**

Ajoute dans ton GitLab :

- Settings → CI/CD → Variables
    - SNYK_TOKEN = ton token Snyk


---


## Intégration CI/CD (GitLab CI)

**Exemple de .gitlab-ci.yml :**

```yaml
stages:
  - security

snyk_sast:
  stage: security
  image:
    name: snyk/snyk:latest
    entrypoint: [""]
  script:
    - snyk auth $SNYK_TOKEN
    - snyk test --severity-threshold=high
    - snyk monitor
```

**Avec rapport JSON**

```yaml
  artifacts:
    when: always
    paths:
      - snyk-report.json
  script:
    - snyk test --json > snyk-report.json
```


---


## Gestion des vulnérabilités

**Comprendre le Priority Score**

Snyk attribue un Priority Score (0-1000) basé sur :

- Sévérité CVSS (Common Vulnerability Scoring System)
- Exploitabilité : existe-t-il un exploit public ?
- Maturité de l'exploit : Mature, Proof of Concept, No Known Exploit
- Accessibilité réseau : exploitable à distance ?
- Présence dans le code : la fonction vulnérable est-elle appelée ?
- Facteurs contextuels : OS, configuration, etc.


---


## Exercice - TP

- Etre capable de lancer Snyk en local (test/monitor)
- Etre capable de bien config le SaaS avec un projet
- Etre capable de réalicer une CI (test/monitor)

