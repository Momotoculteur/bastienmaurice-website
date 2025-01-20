Falco est un outil de sécurité cloud-native qui offre une protection en temps réel pour les hôtes, les conteneurs, les environnements Kubernetes et les services cloud. Il surveille les événements du noyau Linux et d'autres sources de données via des plugins, enrichissant ces événements avec des métadonnées contextuelles pour fournir des alertes en temps réel. Cela permet de détecter les comportements anormaux, les menaces potentielles et les violations de conformité. 

## Fonctionnalités principales de Falco 

- **Détection des menaces en temps réel** : Falco utilise eBPF pour surveiller l'activité du système et détecter les comportements malveillants sur les hôtes et les conteneurs, quelle que soit leur échelle.

- **Conformité réglementaire** : Grâce à sa surveillance intelligente et à sa détection basée sur des règles, Falco aide à maintenir la conformité dans les systèmes cloud-native.

- **Intégration étendue** : Les alertes de Falco peuvent être facilement transmises à plus de 50 systèmes tiers, facilitant l'analyse, le stockage ou les réactions appropriées. 

- **Open Source** : Développé au sein de la communauté cloud-native, Falco est une solution multi-fournisseurs largement adoptée, fonctionnant sur des architectures x64 et ARM, et déployable dans Kubernetes via un chart Helm officiel. 

## Drivers

Pour fonctionner on va devoir fournir à Falco un drivers spécifique. Quand je parle de driver il faut voir derrière cela comment Falco va pouvoir collecter les informations et l'ensemble des appels systèmes qui seront éffectué. A toi de choisir ce qui correspond le mieux selon l'environnement et les restritions que tu auras afin d'avoir l'approche la plus adapté.

Voici un tableau récapitulatif des avantages et inconvénients des différentes méthodes de collecte des appels système pour Falco :

| **Méthode**                             | **Avantages**                                                                                                                                                                                                                     | **Inconvénients**                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Module du noyau**                     | - Solution la plus légère, avec une surcharge minimale sur le système. <br>- Fonctionne indépendamment de la version du noyau. <br>- Peut être construit, hébergé et installé directement sur le système hôte.                    | - Étroitement lié au noyau hôte, ce qui peut introduire de la complexité lors de changements de version du noyau, d'architecture ou de système d'exploitation. <br>- Un module défectueux peut provoquer un plantage du noyau Linux. <br>- Le chargement de modules noyau peut être restreint ou interdit dans certains environnements. |
| **Sonde eBPF**                          | - Utilise la technologie eBPF, offrant une sécurité accrue par rapport au module du noyau. <br>- Requise dans certains environnements où les modules noyau ne sont pas autorisés, mais où les programmes eBPF le sont, comme GKE. | - Peut ne pas être compatible avec toutes les versions du noyau. <br>- Nécessite des fonctionnalités eBPF activées dans le noyau, ce qui peut ne pas être le cas sur tous les systèmes. <br>- Moins légère que le module du noyau, avec une surcharge système légèrement supérieure.                                                    |
| **Programme utilisateur (`ptrace(2)`)** | - Fonctionne entièrement en espace utilisateur, sans nécessiter de modules noyau ou de programmes eBPF.                                                                                                                           | - Peut introduire une surcharge significative en termes de performances. <br>- Moins efficace que les autres méthodes pour la collecte des appels système.                                                                                                                                                                              |

Dans l'ordre à tester je te conseillerai : 

1. eBFP
2. Kernel
3. ptrace

## Mise en place
### Intallation du chart

On va passer par le Helm chart officiel. Je vais l'installer avec mon provider terraform [argoproj-labs](https://registry.terraform.io/providers/argoproj-labs/argocd/latest/docs) qui me permet d'utiliser ArgoCD. 

Mais libre à toi pour un use case plus simple, de le deploy via la CLI Kubectl

```terraform
resource "argocd_application" "falco" {
  metadata {
    name      = "falco"
    namespace = "argocd"
  }

  spec {

    destination {
      server    = "https://kubernetes.default.svc"
      namespace = kubernetes_namespace.security.metadata[0].name
    }

    sync_policy {
      automated {
        prune       = false
        self_heal   = true
        allow_empty = true
      }

      sync_options = ["Validate=true"]
      retry {
        limit = "5"
        backoff {
          duration     = "30s"
          max_duration = "2m"
          factor       = "2"
        }
      }
    }

    source {
      repo_url        = "https://falcosecurity.github.io/charts"
      chart           = "falco"
      target_revision = "4.17.0"

      helm {
        release_name = "falco"
      }
    }
  }
}
```

### Mise en place des métriques

On va update notre chart avec ces values-ci. Les metrics seront accesible via le webserver sur l'adresse **http://localhost:8765/metrics**

```terraform
values = yamlencode({
    metrics = {
        enabled = true
    }
    ebpf = {
        enabled = true
        leastPrivileged = {
            enabled = true
        }
    }
    falco = {
        webserver = {
            prometheus_metrics_enabled = true
        }
    }
})
```

A toi de gérer selon ta stack de monitoring pour récuperer les logs et/ou metriques afin de te créer ton propre systeme afin d'avoir des alertes qui t'avertissent lors de potentiels attaques.


## Exemple pour trigger Falco

### Mise en place 
J'ai crée un simple pod que voici : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: alpine-pod
spec:
  containers:
    - name: alpine-container
      image: alpine:latest
      command: ["/bin/sh", "-c", "sleep 3600"]
      securityContext:
        runAsUser: 0
        allowPrivilegeEscalation: true
  restartPolicy: Never
```

Ici le but est d'avoir un pod qui se lance sous l'user **root** avec la possibilité d'acquérir des **privilèges supplémentaires (su, sudo...)**, tels que l'ajout de capacités ou l'exécution de commandes nécessitant des privilèges élevés.

### Example 1 : Alerte d'utilisation d'un terminal

On va avoir une première alerte remontée de la part de Falco, qui va me prévenir qu'un terminal à été ouvert sur un pod.

```bash
2025-01-06T14:52:30.037679658+01:00 13:29:16.039605364: Notice
  A shell was spawned in a container with an attached terminal
  evt_type=execve
  user=root
  user_uid=0
  user_loginuid=-1
  process=sh
  proc_exepath=/bin/busybox
  parent=containerd-shim
  command=sh -c command -v bash >/dev/null && exec bash || exec sh
  terminal=34816
  exe_flags=EXE_WRITABLE|EXE_LOWER_LAYER
  container_id=d857035a621a
  container_image=<NA>
  container_image_tag=<NA>
  container_name=<NA>
  k8s_ns=<NA>
  k8s_pod_name=<NA>
```

### Example 2 : Alerte d'éxecuter un binaire

Dans le terminal je vais executer la commande `sudo touch momo.sh`. Ici je veux imiter le fait de réaliser une commande sous les pleins pouvoirs avec le **sudo**

```bash
2025-01-06T14:02:03.338144717: Critical
  Executing binary not part of base image
  proc_exe=sudo
  proc_sname=sh
  gparent=sh
  proc_exe_ino_ctime=1736173475640000634
  proc_exe_ino_mtime=1733128624000000000
  proc_exe_ino_ctime_duration_proc_start=18446742721407406491
  proc_cwd=/
  container_start_ts=1736171734240852034
  evt_type=execve
  user=root
  user_uid=0
  user_loginuid=-1
  process=sudo
  proc_exepath=/usr/bin/sudo
  parent=sh
  command=sudo touch momo.sh
  terminal=34816
  exe_flags=EXE_WRITABLE|EXE_UPPER_LAYER
  container_id=d60da3400589
  container_image=<NA>
  container_image_tag=<NA>
  container_name=<NA>
  k8s_ns=<NA>
  k8s_pod_name=<NA>
```