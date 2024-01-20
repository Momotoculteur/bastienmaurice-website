## Installation
On va appliquer le helm chart officiel dans le bon namespace que l'on souhaite

Version avec UI : 
```bash linenums="1"
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Version minimaliste :

```bash linenums="1"
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/core-install.yaml
```