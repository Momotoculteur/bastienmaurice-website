# Helm
Si tu veux deployer ton application sur un service type Kubernetes, tu vas forcement tomber sur du Helm. En quelques mots, cela va te permettre de packager ton application avec l'image docker de ton service, pour donner les spécifications
et autre indications à K8s sur la manière dont :

- est deployé ton application dans ton cluster
- est géré sa haute disponibilité, scaling, et resilience si le service est down
- est géré son accès à un disque dur
- est géré son accès aux ressources RAM et CPU
- etc.

## Packaging de ton application
### Initialisation 
On commence par initialiser un helm chart, avec un template de base dans ton application via `helm create un_nom_de_projet`
```
un_nom_de_projet/
  |- .helmignore        # fichier à ignore
  |- Chart.yaml         # infos global du chart
  |- values.yaml        # values pour template
  |- charts/            # ressource k8s pour ton chart
  |- templates/         # fichier de template
  |- templates/tests/   # fichier de test de template
```