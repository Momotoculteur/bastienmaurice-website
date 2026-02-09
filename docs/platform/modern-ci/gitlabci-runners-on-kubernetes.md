Parce que l'executeur des Gitlab runners via Docker me permet de donner mes cours sans soucis, en proposant même un minimum de parralélisation via l'option *concurent* de l'executor, j'ai du pour la réalisation du cours de BuildX/BuildKit me faire un répo dédié avec un executor Kubernetes dédié, afin qu'ils puissent bien cmmuniquer tous ensemble.

## Installation des runners

On va maintenant utiliser Helm pour déployer le GitLab Runner dans Kubernetes.

Mais avant de lancer la commande magique, prépare un petit fichier values.yaml qui contiendra ta configuration personnalisée.

```yaml
# values.yaml
gitlabUrl: https://gitlab.com/
runnerRegistrationToken: "ton_token"
runners:
  config: |
    [[runners]]
      executor = "kubernetes"
      [runners.kubernetes]
        namespace = "{{.Release.Namespace}}"
        image = "alpine"
        helper_image = "gitlab/gitlab-runner-helper:arm64-v18.1.0"
    serviceAccount:
        create: true
    rbac:
        create: true
```

Plusieurs choses à dire ici:  

- Je set `gitlabUrl` sur l'url SaaS de Gitlab, je n'ai pas de self-hosted sous la main.  
- Le `token` à renseigner ici t'es donné via l'interface de Gitlab, quand tu vas dans les settings, dans la partie CI/CD, et que tu vas demander à register un nouveau runner.  
- La partie config, pour le champ `image`, ce sera la base image pull pour éxecuter tes jobs, si tu ne leur spécifie par une image. Quant à `helper_image`, j'ai du l'overwrite pour forcer la version en arm64 pour tourner sur mon macbook, car de base il me pullait la version x86_64 😭