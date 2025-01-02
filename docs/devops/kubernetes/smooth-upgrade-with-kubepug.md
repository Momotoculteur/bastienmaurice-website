## Introduction

KubePug (Kubernetes PreUpGrade Checker) est un outil open source conçu pour identifier les API Kubernetes obsolètes ou supprimées dans vos clusters ou fichiers de configuration. Son objectif principal est de faciliter les mises à niveau de Kubernetes en détectant les API dépréciées qui pourraient causer des problèmes lors de la transition vers une nouvelle version. 

## Fonctionnalités principales

- **Analyse des clusters Kubernetes** : KubePug peut se connecter à votre cluster Kubernetes en utilisant le fichier kubeconfig ou en se basant sur le cluster actuel, et identifier les objets utilisant des API dépréciées ou supprimées. 

- **Analyse des fichiers de configuration** : Il est également possible d'analyser des fichiers manifestes locaux pour détecter les API obsolètes, ce qui est particulièrement utile avant de déployer des configurations dans un cluster. 

- **Spécification de la version cible de Kubernetes** : KubePug permet de définir la version spécifique de Kubernetes contre laquelle vous souhaitez vérifier vos manifestes, vous aidant ainsi à anticiper les dépréciations dans les futures versions. 

- **Fourniture d'alternatives aux API dépréciées** : L'outil suggère les API de remplacement à utiliser, facilitant ainsi la mise à jour de vos configurations. 

## Utilisation

Un exemple de remonté d'API déprécié : 
```bash
RESULTS:
Deprecated APIs:
PodSecurityPolicy found in policy/v1beta1
	 ├─ Deprecated at: 1.21
	 ├─ PodSecurityPolicy governs the ability to make requests that affect the Security Contextthat will be applied to a pod and container.Deprecated in 1.21.
		-> OBJECT: restrictive namespace: default

Deleted APIs:
	 APIs REMOVED FROM THE CURRENT VERSION AND SHOULD BE MIGRATED IMMEDIATELY!!
Ingress found in extensions/v1beta1
	 ├─ Deleted at: 1.22
	 ├─ Replacement: networking.k8s.io/v1/Ingress
	 ├─ Ingress is a collection of rules that allow inbound connections to reach theendpoints defined by a backend. An Ingress can be configured to give servicesexternally-reachable urls, load balance traffic, terminate SSL, offer namebased virtual hosting etc.DEPRECATED - This group version of Ingress is deprecated by networking.k8s.io/v1beta1 Ingress. See the release notes for more information.
		-> OBJECT: bla namespace: blabla
```

### Target une version spécifique de K8s
Set bien en avance ton context via un `kubectx`

```bash
kubepug --k8s-version=v1.22 --input-file=./manifests/
```

### Target des manifest en local
```bash
kubepug --k8s-version=v1.22 --input-file=./manifests/
```