## Introduction

Helm est un gestionnaire de packages pour Kubernetes, qui permet de déployer, gérer et mettre à jour des applications sur Kubernetes via des "charts".  
</br> 
Un chart est un ensemble de fichiers décrivant les ressources Kubernetes nécessaires au déploiement d'une application.  
</br> 
Ce cours couvre les bases de Helm et progresse vers des concepts plus avancés.



---


## Concepts de base de Helm

Helm est un outil qui permet de :  
- Déployer des applications Kubernetes en utilisant des charts.
- Gérer les versions d'application et effectuer des mises à jour sans avoir à tout réinstaller.
- Organiser des configurations complexes de manière simple et modulaire.  

</br> </br> 

**Vocabulaire clé**  
- **Chart** : Un package Helm contenant les définitions d'objets Kubernetes (déploiements, services, config maps, etc.).
- **Release** : Une instance d'un chart déployée dans un cluster Kubernetes.
- **Repository** : Un stockage de charts Helm où l’on peut publier et récupérer des charts.



---



## Commandes de base Helm

**Installer un chart :**  
```helm install <nom-release> <chart>```

**Lister les releases installées :**  
`helm install <nom-release> <chart>`

**Mettre à jour une release :**  
```helm upgrade <nom-release> <chart>```

**Supprimer une release :**  
```helm uninstall <nom-release>```



---



## Structure d'un Chart Helm - Chart

Un chart Helm est organisé selon une structure bien définie :

```
my-chart/
├── Chart.yaml         # Fichier contenant les métadonnées du chart
├── values.yaml        # Fichier de configuration par défaut
├── templates/         # Contient les fichiers YAML Kubernetes (déploiements, services, etc.)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ...
└── charts/            # Contient des dépendances (autres charts)
```

</br></br>

**Fichier Chart.yaml**  
Le fichier Chart.yaml contient les métadonnées du chart comme son nom, sa version et une description.
```
apiVersion: v2
name: my-app
version: 1.0.0
description: Un simple chart pour déployer mon application
```


---



## Structure d'un Chart Helm - Values

Un chart Helm est organisé selon une structure bien définie :

```
my-chart/
├── Chart.yaml         # Fichier contenant les métadonnées du chart
├── values.yaml        # Fichier de configuration par défaut
├── templates/         # Contient les fichiers YAML Kubernetes (déploiements, services, etc.)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ...
└── charts/            # Contient des dépendances (autres charts)
```
</br></br>

**Fichier values.yaml**  
Le fichier values.yaml contient les valeurs par défaut qui sont injectées dans les templates. Vous pouvez personnaliser ces valeurs lors de l'installation d'une release.

```
replicaCount: 2
image:
  repository: nginx
  tag: "1.19"
service:
  type: ClusterIP
  port: 80
```

---



## Structure d'un Chart Helm - Templates

Un chart Helm est organisé selon une structure bien définie :

```
my-chart/
├── Chart.yaml         # Fichier contenant les métadonnées du chart
├── values.yaml        # Fichier de configuration par défaut
├── templates/         # Contient les fichiers YAML Kubernetes (déploiements, services, etc.)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ...
└── charts/            # Contient des dépendances (autres charts)
```

</br></br>

**Dossier templates/**  
Ce dossier contient des fichiers Kubernetes YAML (déploiements, services, etc.) avec des variables qui sont substituées par les valeurs définies dans values.yaml.  

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
      - name: {{ .Release.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
```

**Variables dans les templates**  
- {{ .Values.<key> }} : Récupère une valeur du fichier values.yaml.
- {{ .Release.Name }} : Utilise le nom de la release pour personnaliser les noms des ressources.

---

 
## Gestion des versions et des dépendances - Mise à jour d'une release
Pour mettre à jour une release existante, utilisez la commande helm upgrade :  

```
helm upgrade <nom-release> <chart>
```

Cela permet de changer des valeurs ou des versions d'images dans le chart sans supprimer l'application.



---

 
## Gestion des versions et des dépendances - Gestion des dépendances

Helm vous permet d’ajouter des charts dépendants à un chart principal via le fichier **requirements.yaml** (ou **Chart.yaml** dans Helm 3).  

```
dependencies:
  - name: mysql
    version: "8.0.0"
    repository: "https://charts.bitnami.com/bitnami"
```
</br></br>

**Pour installer les dépendances :**  
`helm dependency update`

---


## Utilisation avancée de Helm - Paramétrage de values.yaml

Lors de l'installation d'un chart, vous pouvez personnaliser les valeurs du fichier values.yaml directement via la ligne de commande.  
```helm install <nom-release> <chart> --set replicaCount=3 --set image.tag="1.20"```

Ou via un fichier customisé :  
```helm install <nom-release> <chart> -f my-values.yaml```



---


 
## Gestion des versions et des dépendances - Rollback d'une release
Helm garde un historique des déploiements.  
Si une mise à jour échoue, vous pouvez facilement revenir à une version précédente.  

```helm rollback <nom-release> <revision>```



---


## Gestion des versions et des dépendances - Testing avec Helm

Helm permet également d'ajouter des tests pour vérifier si une application est bien installée. Il suffit de créer un fichier YAML dans le dossier templates/tests/ et d'y inclure un test, comme un Pod qui vérifie l'état de l'application.  

```
apiVersion: v1
kind: Pod
metadata:
  name: "{{ .Release.Name }}-test-connection"
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: wget
      image: busybox
      command: ['wget']
      args: ['{{ template "my-chart.fullname" . }}:{{ .Values.service.port }}']
  restartPolicy: Never
```

</br></br>

**Pour exécuter les tests :**  
```helm test <nom-release>```



---



## Helm et CI/CD  

**Helm et GitOps avec ArgoCD**  
Helm est souvent utilisé avec des outils GitOps comme ArgoCD pour automatiser les déploiements continus.  
ArgoCD surveille les dépôts Git pour détecter les changements dans les charts Helm et applique automatiquement les modifications aux clusters Kubernetes.

</br></br>

**Helm dans des pipelines CI/CD**  
Helm peut être intégré dans des pipelines CI/CD pour tester et déployer des applications. Voici un exemple de pipeline CI utilisant Helm :

```
stages:
  - name: Deploy
    actions:
      - run: |
          helm upgrade --install my-release ./chart --namespace my-namespace --values ./values.yaml
```


---



## Conclusion

Helm simplifie grandement la gestion des applications dans Kubernetes en permettant une gestion modulaire et reproductible des configurations.  
</br></br>
En maîtrisant Helm, vous serez capable de déployer, mettre à jour et superviser vos applications Kubernetes de manière efficace et scalable.




