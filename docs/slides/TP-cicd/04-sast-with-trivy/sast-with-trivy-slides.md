## Introduction à Trivy

Trivy est un outil open-source développé par Aqua Security qui analyse les vulnérabilités dans :
- Les images Docker et conteneurs,
- Les dépendances de projet (en utilisant les fichiers comme package.json, Gemfile.lock, etc.),
- Les infrastructures comme code (IaC) : Kubernetes, Dockerfile, etc.

Trivy se distingue par :
- Sa rapidité et son efficacité,
- La capacité à analyser plusieurs types d’artefacts,
- Sa facilité d'intégration dans les pipelines CI/CD.



---



## Fonctionnalités principales

- **Analyse de vulnérabilités** : Identifie les vulnérabilités connues.
- **Analyse de configuration** : Vérifie les fichiers de configuration pour des problèmes de sécurité (ex. : fichiers YAML, Terraform).
- **Rapports de licence** : Identifie les problèmes potentiels de licences dans les dépendances.



---



## Utilisation de Trivy

Trivy permet d'analyser différents types de ressources. Voici quelques commandes courantes :

**Analyser une image Docker**

```bash
trivy image mydockerimage:latest
```

**Analyser un fichier de configuration Kubernetes**

```bash
trivy config --exit-code 1 --severity HIGH /path/to/k8s-config.yaml
```

**Analyser les dépendances d’un projet**

```bash
trivy fs /path/to/project
```

**La commande trivy image produit un rapport en listant :**  
- Le nom de la vulnérabilité,
- Le package vulnérable,
- La version corrigée (si disponible),
- Le niveau de sévérité (LOW, MEDIUM, HIGH, CRITICAL).



---



## Intégration de Trivy dans GitLab CI/CD

Un exemple de pipeline GitLab CI pour analyser une image Docker avec Trivy :

```yaml
# .gitlab-ci.yml

stages:
  - scan

# Job pour scanner les vulnérabilités dans l'image Docker
trivy_scan:
  stage: scan
  image: aquasec/trivy:latest
  script:
    # Scanne l'image Docker avec la sévérité définie
    - trivy image --exit-code 1 --severity "HIGH,CRITICAL" mydockerimage:latest
```


