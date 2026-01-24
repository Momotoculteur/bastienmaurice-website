# TP Noté - Analyse de Conteneurs avec Trivy

## Informations pratiques

- **Type :** Travail individuel ou Groupe
- **Notation :** /20
- **Rendu :** Rapport PDF + fichiers de configuration + captures d'écran + lien GitLab
- **Date limite :** 1 semaine

## Contexte du TP

Vous êtes DevSecOps dans une équipe qui développe une application web conteneurisée. La direction souhaite renforcer la sécurité de la chaîne de build et déploiement. 

Votre mission est d'intégrer Trivy pour détecter automatiquement les vulnérabilités dans vos images Docker avant leur déploiement en production.


## Prérequis techniques

- Docker installé et fonctionnel
- Compte GitLab avec runners configurés
- Notions de base en CI/CD
- Un langage de programmation au choix (Python, Node.js, Go, etc.) pour créer une application exemple.



## Partie 1 : Prise en main de Trivy en local (6 points)

### Contexte

Vous devez d'abord installer et tester Trivy en local sur votre machine pour comprendre son fonctionnement, ses commandes de base et apprendre à interpréter ses rapports.

### Question 1.1 : Préparation d'une image Docker vulnérable (1 point)

**Tâche :** 

Créez une application web simple dans le langage de votre choix (ex: Python/Flask, Node.js/Express) et construisez une image Docker pour celle-ci. 

Intentionnellement, utilisez une image de base obsolète et connue pour contenir des vulnérabilités (ex: node:14-alpine, python:3.7-slim, nginx:1.18).

**Questions à répondre :**

1. Quel langage et quelle image de base avez-vous choisis ? Pourquoi ces choix sont-ils propices à la détection de vulnérabilités ?
2. Décrivez brièvement les étapes de construction de votre image (Dockerfile).
3. Quelle commande utilisez-vous pour construire et taguer l'image (ex: myapp:v1.0) ?

**À fournir :**

- Le code source complet de votre application.
- Le contenu de votre Dockerfile.
- La commande docker build utilisée.
- Une capture d'écran de la sortie de docker images montrant votre image.

### Question 1.2 : Installation et premier scan (2 points)

**Tâche :** 

Installez Trivy sur votre machine selon la méthode recommandée pour votre OS (voir documentation). Utilisez-le pour scanner l'image que vous venez de créer.

**Questions à répondre :**

1. Quelle méthode d'installation avez-vous utilisée (curl, package manager, etc.) ?
2. Quelle commande Trivy permet de scanner une image Docker locale ?
3. Combien de vulnérabilités au total sont détectées dans votre image ? Classez-les par niveau de sévérité (CRITICAL, HIGH, MEDIUM, LOW).
4. Identifiez une vulnérabilité CRITICAL ou HIGH. Quel est son identifiant CVE ? Quel est son score CVSS ? Quel paquet logiciel est concerné ?

**À fournir :**

- La commande exacte d'installation de Trivy.
- La commande de scan et la sortie complète (console) du premier scan.
- Un tableau récapitulatif du nombre de vulnérabilités par niveau de sévérité.
- Une capture d'écran zoomée sur les détails d'une vulnérabilité critique ou haute.

### Question 1.3 : Scan d'un Dockerfile et d'un répertoire (2 points)

**Tâche :** 

Utilisez Trivy pour analyser votre Dockerfile (trivy config), puis pour analyser le répertoire de votre projet (trivy fs).

**Questions à répondre :**

1. Quelle est la différence entre trivy image, trivy config et trivy fs ?
2. L'analyse du Dockerfile (trivy config) donne-t-elle des résultats différents de trivy imagee ? Expliquez.
3. L'analyse du système de fichiers (trivy fs .) détecte-t-elle des vulnérabilités dans les dépendances de votre projet (ex: package.json, requirements.txt) ? Si oui, listez-en deux.

**À fournir :**

- Les commandes et sorties pour trivy config Dockerfile et trivy fs ..
- Une analyse comparative expliquant la valeur de chaque type de scan dans un processus DevSecOps.


### Question 1.4 : Filtrage et ignorance des résultats (1 point)

**Tâche :** 

Utilisez les options de Trivy pour :
1. N'afficher que les vulnérabilités de niveau HIGH et CRITICAL.
2. Ignorer les vulnérabilités qui n'ont pas encore de correctif disponible (--ignore-unfixed).
3. Créez un fichier .trivyignore pour ignorer une CVE spécifique détectée dans votre scan.

**Questions à répondre :**

1. Comment l'option --ignore-unfixed modifie-t-elle la philosophie de gestion des risques ?
2. Dans quels cas légitimes pourrait-on utiliser un fichier .trivyignore ? Quels sont les risques associés ?
3. Quelle est la syntaxe pour ignorer une CVE jusqu'à une date spécifique dans .trivyignore ?

**À fournir :**

- Les commandes avec les flags --severity et --ignore-unfixed.
- Le contenu de votre fichier .trivyignore.
- Une capture d'écran comparant les résultats avant et après l'application des filtres.


## Partie 2 : Intégration de Trivy dans une pipeline CI/CD (6 points)
### Contexte

Pour automatiser la détection des vulnérabilités, vous devez intégrer Trivy directement dans vos pipelines d'intégration continue (CI/CD), afin que chaque modification du code déclenche une analyse.

### Question 2.1 : Intégration basique avec GitLab CI/CD (2 points)

**Tâche :** 

Créez un pipeline GitLab CI/CD (fichier .gitlab-ci.yml) qui, sur chaque push vers la branche main :
1. Construit l'image Docker de votre application.
2. Scanne cette image avec Trivy.
3. Génère un rapport au format JSON (--format json) et l'enregistre comme artifact.

**Questions à répondre :**

1. Pourquoi est-il important de scanner l'image après l'étape de build et non une image tierce ?
2. Comment avez-vous sécurisé l'exécution de Trivy dans le runner GitLab (utilisation de l'image Docker aquasec/trivy) ?
3. Quel est l'avantage de sauvegarder le rapport JSON en tant qu'artifact ?

**À fournir :**

- Le contenu complet de votre .gitlab-ci.yml.
- Une capture d'écran de la pipeline en cours d'exécution dans GitLab.
- Un extrait du rapport JSON artifacté.

### Question 2.2 : Mise en place d'une politique de sécurité (2 points)

**Tâche :** 

Modifiez votre pipeline pour qu'elle échoue si Trivy détecte au moins une vulnérabilité de sévérité CRITICAL. Utilisez le code de sortie de Trivy (--exit-code 1).

**Questions à répondre :**

1. Comment la commande Trivy --exit-code 1 fonctionne-t-elle avec --severity CRITICAL ?
2. Cette approche "fail fast" est-elle adaptée à toutes les phases d'un projet (développement, production) ? Pourquoi ?
3. Proposez une stratégie pour appliquer des seuils de tolérance différents selon les branches (ex: warning sur les branches de features, échec sur main).

**À fournir :**

- La section mise à jour de votre .gitlab-ci.yml avec la politique d'échec.
- Une capture d'écran d'une pipeline qui échoue à cause d'une vulnérabilité critique.
- Les logs du job Trivy montrant le code de sortie.


## Partie 3 : Déploiement en mode client-serveur et scan avancé (6 points)
### Contexte

Pour les environnements professionnels avec de nombreux scans, l'utilisation du mode client-serveur de Trivy est recommandée pour centraliser la base de données de vulnérabilités et améliorer les performances.

### Question 3.1 : Déploiement du serveur Trivy avec Docker Compose (2 points)
**Tâche :** 

Déployez une instance du serveur Trivy en local à l'aide de Docker Compose. Le fichier doit inclure :

- Le service trivy-server (image ghcr.io/aquasecurity/trivy-db ou utilisation du mode --server de l'image officielle).
- Une configuration réseau appropriée.
- Un volume pour persister la base de données des vulnérabilités.
- Un token d'accès pour l'authentification

**Questions à répondre :**

1. Quel est l'avantage principal du mode client-serveur par rapport à l'utilisation en standalone ?
2. À quelle URL et port votre serveur Trivy est-il accessible ?
3. Comment vérifiez-vous que le serveur est opérationnel ?

**À fournir :**

- Le contenu complet de votre docker-compose.yml.
- Une capture d'écran de la commande docker-compose ps montrant les services en cours d'exécution.
- Les logs de démarrage du serveur Trivy.

### Question 3.2 : Configuration du client Trivy pour utiliser le serveur (2 points)

**Tâche :** 

Configurez le client Trivy en ligne de commande pour qu'il utilise votre serveur local au lieu de télécharger sa propre base de données.

**Questions à répondre :**

1. Quelle variable d'environnement ou quel flag de commande permet de pointer vers un serveur Trivy ?
2. Comparez le temps d'exécution d'un scan avec et sans serveur local (pour la même image). Quelle est la différence ?
3. Dans un contexte d'entreprise, où déploieriez-vous le serveur Trivy (réseau local, cloud) ?

**À fournir :**

- La commande client Trivy configurée pour utiliser votre serveur.

### Question 3.3 : Scan d'un dépôt Git distant (2 points)

**Tâche :** 

Utilisez Trivy pour scanner un dépôt Git public directement depuis son URL (ex: un projet connu comme https://github.com/nodejs/node). Ciblez une branche spécifique.

**Questions à répondre :**

1. Quelle commande permet de scanner un dépôt Git distant ?
2. Ce type de scan est-il utile pour évaluer la sécurité d'une bibliothèque tierce que vous souhaitez intégrer ? Expliquez.
3. Quelles sont les limites d'un scan de dépôt Git par rapport à un scan d'image Docker ?

**À fournir :**

- La commande trivy repo utilisée.
- Un extrait des résultats du scan sur le dépôt cible.
- Votre analyse sur l'utilité de cette fonctionnalité dans un processus d'approbation de dépendances.









## Partie 4 : Automatisation et intégration avancée (2 points)
**Contexte**

Maintenant que vous maîtrisez les fonctionnalités de base de Trivy, vous allez aller plus loin dans l'automatisation. 

Dans un environnement professionnel, il ne suffit pas de détecter les vulnérabilités, il faut aussi créer des tickets pour les traiter et automatiser leur remédiation.

Cette partie vous permettra de développer un script qui transforme les résultats de Trivy en actions concrètes dans votre outil de suivi de tickets.

### Question 4.1 : Script de traitement des résultats Trivy et création d'issues GitLab (1 points)
**Contexte**
Votre équipe souhaite automatiser la création de tickets de suivi pour chaque vulnérabilité critique détectée par Trivy. Cela permettrait d'éviter que les problèmes ne restent invisibles et de les assigner automatiquement aux développeurs concernés.

**Tâche**
Écrivez un script (en Python, Bash ou Node.js) qui :

- Parse le rapport JSON généré par Trivy (trivy image --format json -o results.json myimage:latest).
- Identifie les packages vulnérables pour lesquels une version corrigée est disponible (champ FixedVersion non vide).
- Filtre uniquement les vulnérabilités de niveau CRITICAL.
- Génère automatiquement une issue GitLab pour chaque CVE CRITICAL trouvée, avec un template structuré.

**Questions à répondre**

1. Quelles bibliothèques/modules utilisez-vous pour parser le JSON et interagir avec l'API GitLab ?
2. Comment gérez-vous les doublons (une même issue pour la même CVE ne devrait être créée qu'une fois) ?
3. Quel template d'issue proposez-vous ? Quelles informations de la sortie Trivy incluez-vous (CVE ID, package, version vulnérable, version corrigée, score CVSS, lien d'information) ?
4. Comment assignez-vous l'issue (à une personne spécifique, à une équipe, via des labels) ?

**À fournir**

- Le code complet de votre script, bien commenté.
- Une capture d'écran montrant plusieurs issues créées automatiquement dans votre projet GitLab.
- La documentation d'utilisation du script (paramètres, variables d'environnement nécessaires).


### Question 4.2 : Intégration du script dans la pipeline et démonstration (1 points)
**Contexte**

Maintenant que votre script fonctionne en local, vous devez l'intégrer dans votre pipeline CI/CD pour qu'il s'exécute automatiquement après chaque scan Trivy, mais uniquement lorsque le scan détecte de nouvelles vulnérabilités critiques.

**Tâche**
- Modifiez votre pipeline GitLab CI/CD (ou GitHub Actions) pour :
    - Exécuter Trivy et générer le rapport JSON.
    - Exécuter votre script de création d'issues seulement si le job Trivy a détecté au moins une vulnérabilité CRITICAL.
    - Ne pas créer de doublons d'issues pour des CVE déjà présentes dans le projet.
- Démontrez le fonctionnement complet en simulant deux scénarios :
    - Scénario A : Une nouvelle image avec une CVE CRITICAL non encore traitée déclenche la création d'une issue.
    - Scénario B : La même image scannée à nouveau (CVE toujours présente) ne crée pas de doublon.

**Questions à répondre**

1. Comment conditionnez-vous l'exécution du script dans la pipeline (utilisation de rules:, when:, ou conditions dans le script) ?
2. Quelles variables d'environnement sécurisées (secrets) devez-vous configurer dans GitLab/GitHub pour l'authentification à l'API ?
3. Comment votre script évite-t-il de créer des doublons (vérification du titre, étiquette spécifique, recherche dans les issues existantes) ?
4. Quelle stratégie proposez-vous pour fermer automatiquement les issues lorsqu'une vulnérabilité est corrigée (scan suivant sans la CVE) ?

**À fournir**
- La nouvelle version de votre fichier .gitlab-ci.yml ou .github/workflows/trivy.yml avec l'intégration du script.
- Deux captures d'écran des pipelines correspondant aux scénarios A et B, avec les logs montrant :
    - Scénario A : "Creating issue for CVE-XXXX-XXXX"
    - Scénario B : "Issue already exists for CVE-XXXX-XXXX, skipping"
- Un aperçu de l'issue créée automatiquement dans GitLab/GitHub, montrant tous les champs remplis.



## Livrables attendus

Vous devez rendre un **dossier compressé** contenant :


1. **Repository GitLab contenant :**
      1. Code source de l'application
      2. Dockerfile(s) optimisé(ss)
      3. .gitlab-ci.yml complet et fonctionnel
      4. .trivyignore documenté
      5. Scripts d'automatisation
2. **Rapport technique (RAPPORT.md) incluant :**
      1. Réponses à toutes les questions
      2. Captures d'écran des résultats de scans
      3. Analyse comparative avant/après optimisation
      4. Documentation de la politique de sécurité
      5. Retour d'expérience et recommandations
3. **Artifacts de pipeline :**
      1. Rapports JSON des scans Trivy
      2. Rapport HTML généré
      3. SBOM de l'application


## Critères d'évaluation

### Technique (60%)

- Configurations fonctionnelles (Trivy local, CI/CD, serveur).
- Commandes appropriées et justifiées.
- Compréhension des concepts (CVE, CVSS, politiques de sécurité).
- Résolution des problèmes rencontrés.

### Analyse (30%)
- Qualité et profondeur des réponses aux questions.
- Esprit critique sur les résultats et les limites des outils.
- Comparaisons pertinentes (CLI vs CI/CD, Trivy vs Grype).
- Recommandations justifiées et adaptées au contexte.

### Présentation (10%)

- Clarté et structure du rapport PDF.
- Qualité, pertinence et légendes des captures d'écran.
- Code et configurations commentés et expliqués.
- Orthographe et syntaxe correctes.


## Conseils pour réussir

1. Lisez l'intégralité du sujet avant de commencer pour avoir une vision d'ensemble.
2. Testez chaque étape avant de passer à la suivante. Un scan local qui fonctionne est le prérequis de l'intégration CI/CD.
3. Prenez des captures d'écran systématiquement à chaque étape importante (installation, commande, résultat).
4. Commentez vos fichiers de configuration (.gitlab-ci.yml, docker-compose.yml) pour expliquer vos choix.
6. Commitez régulièrement sur Git avec des messages clairs. L'historique fait partie de l'évaluation.
7. Soignez la présentation finale : un rapport clair et professionnel vaut souvent la différence entre deux notes.
8. Ne commitez jamais de secrets ou credentials dans votre repository.


## Questions fréquentes

**Q : Trivy ne détecte aucune vulnérabilité sur mon image, que faire ?**

R : Vérifiez que vous utilisez bien une image de base ancienne et connue pour être vulnérable. Consultez les logs de Trivy (--debug) pour voir si la base de données a bien été téléchargée.

**Q : Mon pipeline GitLab CI échoue avec une erreur de permission Docker.**

R : Utilisez un runner GitLab avec le docker-in-docker (dind) service ou l'exécuteur shell si Docker est installé sur la machine hôte. Configurez les permissions correctement.

**Q : Puis-je utiliser un registre d'images privé pour mon scan ?**

R : Oui, Trivy supporte l'authentification. Vous devrez vous connecter via docker login avant le scan dans votre pipeline, ou passer les credentials via variables d'environnement.

## Contact

Pour toute question technique ou organisationnelle :

- Email : bastien_maurice@hotmail.com

**Bon courage et bonne analyse ! 🔍🛡️**
