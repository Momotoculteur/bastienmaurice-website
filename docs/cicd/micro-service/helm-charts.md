# Helm Charts
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

### Dry run
Tu peux utiliser `helm template <mon_chart>` pour avoir un rendu de ton chart avec les values qui template ton chart. Cela te donne une idée de ce que tu vas installer, et te permet de vérifier que tu as bien ce que tu souhaites de templatisé.

### Packaging de ton chart
Tu peux avoir besoin de packager ton chart. Que cela soit à des fins de stockage sur un registry tel que Artifactory afin de pouvoir le distribuer. Tu peux notemment en avoir besoin si tu passes pas pour du déploiement continue, par FluxCD par example, d'avoir un .tgz de ton chart, permettant une installation simplifié au sein de ton cluster Kubernetes.

Pour cela tu devras utiliser `helm package <mon_chart>`

### Lint du chart
`helm lint <mon_chart>`