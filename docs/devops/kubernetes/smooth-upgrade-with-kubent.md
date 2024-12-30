## Introduction

Lors de la mise à jour des clusters Kubernetes, il est essentiel de s'assurer que les objets déployés sont compatibles avec la version cible. Kubernetes déprécie régulièrement des API et des fonctionnalités, les rendant obsolètes ou les supprimant complètement dans les versions ultérieures. Ces changements peuvent provoquer des interruptions ou des erreurs si des objets utilisant des API obsolètes subsistent dans le cluster.

kube-no-trouble est un outil open-source qui analyse un cluster Kubernetes pour identifier les ressources utilisant des API dépréciées ou supprimées, aidant ainsi les équipes à préparer les mises à jour de manière proactive.



## Fonctionnalités principales 

- **Identifie les API obsolètes** : Repère rapidement les ressources incompatibles avec une version donnée de Kubernetes.
- **Facilite les migrations** : Fournit des informations sur les API à mettre à jour avant d'effectuer une mise à jour du cluster.
- **Économise du temps** : Évite de devoir parcourir manuellement toutes les ressources et configurations.
- **Open-source** : Gratuit et facile à intégrer dans vos workflows.


## Utilisation

Set bien en avance ton context via un `kubectx`

```bash
$ ./kubent

6:25PM INF >>> Kube No Trouble `kubent` <<<
6:25PM INF Initializing collectors and retrieving data
6:25PM INF Retrieved 103 resources from collector name=Cluster
6:25PM INF Retrieved 0 resources from collector name="Helm v3"
6:25PM INF Loaded ruleset name=deprecated-1-16.rego
6:25PM INF Loaded ruleset name=deprecated-1-20.rego
__________________________________________________________________________________________
>>> 1.16 Deprecated APIs <<<
------------------------------------------------------------------------------------------
KIND         NAMESPACE     NAME                    API_VERSION
Deployment   default       nginx-deployment-old    apps/v1beta1
Deployment   kube-system   event-exporter-v0.2.5   apps/v1beta1
Deployment   kube-system   k8s-snapshots           extensions/v1beta1
Deployment   kube-system   kube-dns                extensions/v1beta1
__________________________________________________________________________________________
>>> 1.20 Deprecated APIs <<<
------------------------------------------------------------------------------------------
KIND      NAMESPACE   NAME           API_VERSION
Ingress   default     test-ingress   extensions/v1beta1
```