## Introduction

Kubernetes (K8s) est une plateforme open-source de **gestion de conteneurs**.  

Développée initialement par Google, elle est désormais maintenue par la Cloud Native Computing Foundation (CNCF).  

Kubernetes permet d'**automatiser le déploiement**, la gestion et la mise à l'**échelle d'applications conteneurisées**.




---


## Avantages

- **Évolutivité** : Gère facilement les charges de travail croissantes.
- **Automatisation** : Planifie les conteneurs sur les nœuds disponibles.
- **Self-healing** : Redémarre les conteneurs défaillants.
- **Portabilité** : Fonctionne sur n'importe quel cloud ou infrastructure on-premise.


---


## Composants clés - Control plane

- **API Server** : Point d'entrée pour les interactions avec le cluster.
- **etcd** : Stockage distribué pour les données du cluster.
- **Controller Manager** : Gère les contrôleurs (ex : réplique, nœuds).
- **Scheduler** : Planifie les pods sur les nœuds disponibles.


---


## Composants clés - Worker node

- **Kubelet** : Agent qui s'exécute sur chaque nœud, communique avec l'API Server.
- **Kube-proxy** : Gère le réseau du cluster.
- **Runtime des conteneurs** : Exécute les conteneurs (Docker, containerd, CRI-O).



---


## Objets Kubernetes de base

- **Pods** : Unité de base regroupant un ou plusieurs conteneurs.
- **Services** : Expose des pods via une adresse IP stable.
- **Deployments** : Gestion de versions et mises à jour des applications.
- **ConfigMaps & Secrets** : Gestion des configurations et secrets.
- **Ingress** : Routage HTTP/HTTPS vers des services.


---


## Commandes essentielles (kubectl)

Créer un pod :
```bash
kubectl run my-app --image=nginx
```

Lister les ressources :
```bash
kubectl get pods,services
```

Déployer une application :
```bash
kubectl apply -f deployment.yaml
```

Debugging :
```bash
kubectl logs <pod-name>

```
