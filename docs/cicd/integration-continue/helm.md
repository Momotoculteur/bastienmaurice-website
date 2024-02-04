Dans le cas ou tu souhaites déployer une application sur un cluster Kubernetes tu vas avoir plusieurs moyens. Lors de l'appel de ce job, assure toi d'avoir en préambule une image docker de ton application de buildé.

## Préparer l'application pour Kubernetes: Raw, Helm, Kustomize ?

Tu peux très bien directement embarquer ton application dans un objet Kubernetes type **Deployment**, **StatefulSet**, **DaemonSet** ou encore **ReplicaSet** afin de la déployer. La façon la plus simple, mais pas vraiment ouf pour gérer du **multi-environnement**.

Tu peux utiliser **Kustomize** ou encore **Helm** qui va te permettre de packager ton application/image docker dans un format qui va pouvoir être customizé. C'est à dire qu'avec un même package et un language de customization, tu vas pouvoir customizer ton application pour être lancé avec un fichier de configuration, appelé **values**. C'est donc extremement pratique car sur un vrai projet tu vas surement avoir plusieurs environnements : 

- Dev
- QA
- Stage1
- Stage2
- Prod
- Etc.

Tu vas pouvoir adapter très facilement le comportement de ton application selon dans quel environnement elle est déployée. En effet, tu souhaites surement dans un env de **dev** avoir des ressources minimales afin d'économiser des couts de développement. Alors qu'à l'inverse, tu souhaites que ton application si elle est déployée sur un env de **prod**, qu'elle soit hautement scalable selon les pics de charges d'utilisateurs que tu vas rencontrer. On souhaite simplement à suvire la charge de traffic. C'est ce que va te permettre Kustomize et Helm pour t'adapter très simplement. 

Ici je vais te montrer comment packager ton application dans un package helm, appellé **Helm Chart**.

## Exemple de code
### Package du Chart
Je ne détaille pas ici comme créer un Helm Chart car j'ai déjà fait un chapitre là dessus, non plus sur comment créer un image Docker de ton application. On estime qu'a partir d'ici on a packagé notre chart avece nos **values** que l'on souhaite.

Ici cette étape est utile si tu souhaites enregistrer ton Helm Chart sur un repository d'artifact, comme JFrog Artifactory, ou si tu utilises une CD comme FluxCD par exemple. Pas besoin si tu es sous ArgoCD.

Pour faire simple dans cet exemple, je créer un helm chart avec une version fixé à 1.0.0

```yaml linenums="1"
package:
    stage: helm
    image: 
        name: alpine/helm:3.14.0
        entrypoint: [""]
    script:
        - helm lint ./simple-project
        - helm package ./simple-project --version 1.0.0
        # - helm package ./simple-project --version ${CI_COMMIT_SHA}
    #artifacts:
        #expire_in: 1 day
        #paths:
        #- ${CI_PROJECT_DIR}/simple-project-1.0.0.tgz
        # - ${CI_PROJECT_DIR}/simple-project-${CI_COMMIT_SHA}.tgz
```

1. J'utilise une image docker avec Helm de pré-installé. Je surcharge l'entrypoint afin de mettre pour la suite mes propes commandes sh.
2. J'appelle la commande pour lint mon chart. Cela me permet de vérifier si tout est bien formatté
3. Je package ensuite, en specifiant le dossier de mon chart

!!! tips
    Je te met en commentaire les best-practices à appliquer, à savoir de variabiliser tes packages en suivant le SEMVER. A toi selon si tu veux un chart par commit, ou un par branche, etc. Utilise les variables pré-défini par Gitlab, elles te seront extremement utiles.

### Valider la conformité du Chart
On va aller un peu plus loin ici, en utilisant un outils qui va pouvoir valider si l'utilisation de toute les API que j'utilise dans mon Helm Chart, est conforme avec une version de Kubernetes que je vais lui spécifier. Ainsi en faisant cette opération, je m'assure que mon Helm Chart est 100% compatible avec mon cluster Kubernetes, sur des **versions spéficique**.  

En effet cela m'est déjà arrivé de déployé un Chart sans avoir installé les CRDs qui lui correspondent, me donnant des erreurs assez bizarres dans mon cluster. Il est donc utile de bien s'assurer que tout se passe avant même de deployer notre chart au moment de son packaging avec GitlabCI. Ou encore de vérifier que certaines api en beta ou alpha soit bien prise en compte.

Je vais utiliser ici **KubeConform**.

Si tu utilises des CRDs, tu peux donner ces mêmes specifications à KubeConform. Ainsi il va pouvoir analyser tes charts qui ont des ressources qui ne sont pas natives à Kubernetes, et ça c'est le feu ! 🔥


```yaml linenums="1"
validate:
    stage: helm
    image:
        name: ghcr.io/yannh/kubeconform:v0.6.4-alpine
        entrypoint: [""]
    script:
        - /kubeconform -summary -output json './simple-project' -kubernetes-version 1.29.1
```

1. Ici on surcharge l'entrypoint de l'image afin d'accèder au **/bin/sh** afin d'y passer des commandes à notre image
2. On lance l'outil en spécifiant une version de Kubernetes sur laquelle on souhaite tester la compatiblité des APIs utilisé dans notre Chart


Je te montre ici un exemple de retour que Kubeconform peut te donner :

```json
{
    {
        "filename": "simple-project/Chart.yaml",
        "kind": "",
        "name": "",
        "version": "v2",
        "status": "statusError",
        "msg": "error while parsing: missing 'kind' key"
    },
    {
        ...
    },
    "summary": {
        "valid": 0,
        "invalid": 0,
        "errors": 10,
        "skipped": 0
    } 
}
```