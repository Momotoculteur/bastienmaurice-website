## Introduction

Kubernetes, souvent abrégé en "K8s", est un système open-source conçu pour automatiser le déploiement, la mise à l'échelle et la gestion des applications conteneurisées.  
</br></br>
Dans le contexte des architectures modernes, comme les microservices, Kubernetes permet de gérer efficacement des applications complexes réparties sur plusieurs nœuds.  



---



## Architecture de Kubernetes

L'architecture de Kubernetes repose sur plusieurs composants clés répartis en deux parties principales :  
- les **composants maîtres**
- et les  **composants de nœuds de travail**.



---



## Composants Maîtres

Les composants maîtres sont responsables de la gestion du cluster Kubernetes.  
Ils prennent des décisions globales concernant l'état du cluster, telles que le planning des pods et la gestion des échecs.  

- **API Server** : Expose l'API Kubernetes et agit comme le point d'entrée pour toutes les opérations administratives.
- **Etcd** : Stocke de manière persistante toutes les données de configuration et d'état du cluster.
- **Controller Manager** : Gère les contrôleurs qui surveillent l'état du cluster (par exemple, les contrôleurs de réplication, de nœud, etc.).
- **Scheduler** : Planifie l'exécution des pods sur les nœuds de travail en fonction des ressources disponibles.



---


## Composants des Nœuds de Travail

Les nœuds de travail hébergent les applications sous forme de conteneurs. Chaque nœud inclut les composants suivants :  

- **Kubelet** : Agent qui applique les configurations reçues de l'API server, en démarrant et surveillant les pods.
- **Kube-proxy** : Gère le réseau pour chaque nœud et permet la communication réseau entre les services Kubernetes.
- **Container Runtime** : Logiciel responsable de l'exécution des conteneurs (par exemple, Docker, containerd, etc.).




---




## Concepts Fondamentaux - Namespace

Les Namespaces sont des environnements virtuels qui permettent de diviser un cluster Kubernetes en plusieurs espaces de noms isolés.  
Cela permet de mieux gérer les ressources et de regrouper les objets selon des contextes spécifiques (par exemple, dev, staging, prod).

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-namespace
```




---



## Concepts Fondamentaux - Service

Un Service expose un ensemble de Pods à travers une IP stable ou un nom DNS.  
Il garantit que les applications communiquent de manière fiable, même si les pods sous-jacents changent.

**Types de Services**  
- **ClusterIP** : Expose le service uniquement à l'intérieur du cluster.
- **NodePort** : Expose le service via un port spécifique sur chaque nœud.
- **LoadBalancer** : Expose le service à l'extérieur du cluster en utilisant un load balancer externe.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
  type: LoadBalancer
```



---



## Concepts Fondamentaux - Volume

Les Volumes dans Kubernetes permettent de stocker des données persistantes au-delà du cycle de vie d'un Pod.  
Plusieurs types de volumes existent, tels que emptyDir, hostPath, PersistentVolume et PersistentVolumeClaim.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: nginx:latest
    volumeMounts:
    - mountPath: "/usr/share/nginx/html"
      name: my-volume
  volumes:
  - name: my-volume
    hostPath:
      path: "/data"
```



---




## Concepts Fondamentaux - PV & PVC

Kubernetes permet d'utiliser des volumes persistants (PV) pour stocker des données indépendamment du cycle de vie des Pods.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/data"


apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```



---


## Gestion des Applications - Pods

Le *Pod* est l'unité de base de Kubernetes.  
Chaque pod encapsule un ou plusieurs conteneurs qui partagent des ressources réseau et de stockage.  
Dans Kubernetes, les pods sont éphémères : ils sont créés, détruits et remplacés selon les besoins.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: nginx:latest
    ports:
    - containerPort: 80
```



---


## Gestion des Applications - ReplicaSet

Un ReplicaSet est un contrôleur qui garantit qu'un nombre défini de copies (répliques) d'un Pod est en cours d'exécution à tout moment.  
Si un Pod échoue, le ReplicaSet crée un nouveau Pod pour maintenir le nombre désiré de répliques.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
spec:
  replicas: 3  
  selector:
    matchLabels:
      app: nginx 
  template:
    metadata:
      labels:
        app: nginx 
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80  
```



---



## Gestion des Applications - Deployments

Les Deployments gèrent la mise à jour des Pods et s'assurent que le bon nombre de répliques d'une application est toujours en cours d'exécution.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-container
        image: nginx:latest
        ports:
        - containerPort: 80
```



---




## Gestion des Applications - StatefulSets

Un StatefulSet est utilisé pour déployer des applications avec un état, comme des bases de données.  
Contrairement aux Deployments, les Pods dans un StatefulSet sont ordonnés et persistants.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx-statefulset
spec:
  serviceName: "nginx"
  replicas: 3  # Nombre de répliques (Pods) à créer
  selector:
    matchLabels:
      app: nginx  # Doit correspondre aux labels définis dans template
  template:
    metadata:
      labels:
        app: nginx  # Label appliqué aux Pods
    spec:
      containers:
      - name: nginx
        image: nginx:1.19  # Image du conteneur à utiliser
        ports:
        - containerPort: 80  # Port exposé par le conteneur
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html  # Point de montage pour le volume persistant
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]  # Mode d'accès au volume
      resources:
        requests:
          storage: 1Gi  # Taille du volume persistant
```



---




## Gestion des Applications - DaemonSets

Un DaemonSet garantit qu'une copie d'un Pod est en cours d'exécution sur chaque nœud du cluster.  
C'est utile pour les applications comme des collecteurs de logs ou des agents de monitoring.





---



## Mise à l'échelle et Gestion des Mises à jour - Autoscaling

Kubernetes permet d'automatiser la mise à l'échelle des applications à l'aide de deux mécanismes principaux :  

- **Horizontal Pod Autoscaler (HPA)** : Augmente ou diminue le nombre de répliques de Pods en fonction de la charge.
- **Vertical Pod Autoscaler (VPA)** : Ajuste automatiquement les ressources CPU et mémoire des conteneurs.


---



## Gestion des Secrets et ConfigMaps - ConfigMap

Un ConfigMap est un objet utilisé pour stocker des configurations non sensibles sous forme de paires clé-valeur.  
Les ConfigMaps permettent de décorréler la configuration de l'application.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  config.properties: |
    key1=value1
    key2=value2
```


---


## Gestion des Secrets et ConfigMaps - Secret

Un Secret est un objet similaire à un ConfigMap mais qui contient des données sensibles comme des mots de passe ou des clés API.  
Les secrets sont stockés de manière sécurisée et peuvent être injectés dans les Pods.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
data:
  username: dXNlcm5hbWU=
  password: cGFzc3dvcmQ=
```


---



## Sécurité dans Kubernetes - Role-Based Access Control (RBAC)

RBAC permet de définir précisément qui peut accéder à quels objets au sein du cluster.  
Les Roles et ClusterRoles définissent les permissions, tandis que les RoleBindings et ClusterRoleBindings associent ces permissions à des utilisateurs ou des groupes.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: "john"
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```




---



## Sécurité dans Kubernetes - Politiques Réseau (Network Policies)

Les Network Policies contrôlent le trafic réseau entre les Pods.  
Par défaut, tous les Pods peuvent communiquer entre eux.  
Les Network Policies permettent de restreindre cette communication.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress: []
  egress: []
```



---




## Sécurité dans Kubernetes - Sécurité des Conteneurs

Il est important de garantir que les conteneurs fonctionnent de manière sécurisée :

- **Utiliser des images minimales** : Réduire la surface d'attaque en utilisant des images sans services inutiles (ex : alpine ou distroless).  
- **Limiter les permissions** : Utiliser la directive runAsUser pour exécuter les conteneurs avec un utilisateur non privilégié.


---


## Récap

Kubernetes est un puissant orchestrateur de conteneurs qui permet de gérer efficacement des applications à grande échelle.  
Son architecture modulaire et ses nombreuses fonctionnalités, comme la mise à l'échelle automatique, la gestion des déploiements, et la surveillance, en font un outil incontournable pour les équipes DevOps modernes.  
Il requiert cependant une bonne compréhension des concepts fondamentaux et des pratiques de gestion de cluster pour en tirer pleinement parti.

