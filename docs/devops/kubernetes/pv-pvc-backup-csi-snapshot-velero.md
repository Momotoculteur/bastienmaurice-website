## Introduction

Je vais te présenter comment réaliser des sauvegardes de tes workloads stateful afin de gagner en résilience, ce qui pourrait t'être utile dans plusieurs cas : 

- Préparer une mise à jour d'application
- Préparer une mise à jour de cluster
- Backup en cas de problèmes

!!! info
    A toi de gérer de ton côté la partie installation de Velero/VeleroCLI. Je ne discuterais ici que de son utilisation

## Concepts clés

### Le Stockage : PV et PVC
- **PV (PersistentVolume)** : C'est le morceau de stockage physique (ou virtuel) réel. Imaginez-le comme un disque dur branché dans le datacenter (ici, une instance Google Filestore). Il a une existence propre, indépendante des Pods.
- **PVC (PersistentVolumeClaim)** : C'est la "revendication" ou le "ticket de réservation". Le développeur crée un PVC pour demander du stockage (ex: "Je veux 10Go"). Kubernetes cherche alors un PV disponible qui correspond et les lie ensemble (Binding).

### L'interface : CSI (Container Storage Interface)
C'est le standard universel qui permet à Kubernetes de parler à n'importe quel fournisseur de stockage (AWS EBS, Azure Disk, Google Filestore, etc.) sans avoir à changer le code de Kubernetes lui-même.

### Les Instantanés (Snapshots)
C'est ici que la magie opère pour le backup.

- **VolumeSnapshot** : C'est la demande de l'utilisateur. "Je veux prendre une photo de mon disque à l'instant T". C'est un objet Kubernetes standard.
- **VolumeSnapshotContent** : C'est l'objet qui représente la photo réelle sur le stockage physique (l'identifiant du snapshot chez Google Cloud). C'est l'équivalent du PV, mais pour les snapshots.
- **VolumeSnapshotClass** : C'est le profil de configuration. Il dit à Kubernetes : "Quand on demande un snapshot, utilise tel driver CSI (ex: Google Filestore) avec tels paramètres". C'est l'équivalent de StorageClass mais pour les snapshots.

### Le chef d'orchestre : Velero

Velero est un outil open-source (plus pour longtemps, coucou VMWare 🙃) pour backup, restore et migration de ressources Kubernetes et de volumes persistants.

Velero ne "copie" pas les données lui-même octet par octet (dans ce mode CSI). Velero agit comme un chef d'orchestre :

1. Il contacte l'API Kubernetes pour demander un VolumeSnapshot.
2. Le driver CSI exécute le snapshot sur l'infrastructure Cloud.
3. Velero sauvegarde la configuration (YAML) du PVC, du PV et du Snapshot dans un Bucket (Object Storage).
4. Au moment du restore, il recrée les objets et demande au CSI de créer un nouveau volume à partir du snapshot.

## Un peu de pratique
On va essayer de se faire dans cet ordre ci l'ensemble des manips du TP : 

- Créer un PV/PVC avec des données simples (fichiers texte)
- Installer Velero et configurer les CSI snapshots
- Trigger un backup ou schedule via Velero CLI
- Restore dans un autre namespace
- Vérifier avec un pod-inspector (un pod simple qui monte le PVC et permet d'inspecter les fichiers via kubectl exec)

### Pré-requis

- Un cluster GKE avec l'add-on Filestore CSI activé (pour mon exemple)
- Velero installé sur le cluster
- Le feature flag **--features=EnableCSI** activé sur Velero (via helm, CLI...)

!!! warning
    je vais te montrer ici avec du NFS et le driver filestore.csi.storage.gke.io, attention velero ne fonctionne qu'avec du single share. Certains classe built-in à Google Kubernetes Engine te propose du multi share (cf. enterprise)


### Étape 1 : Configuration des Classes

On commence par définir notre *StorageClass* qui sera consomé par les PVC de nos apps : 

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: filestore-sc
provisioner: filestore.csi.storage.gke.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  tier: standard # selon ton tiers choisi
  network: default # idem aussi
```

On ajoute ensuite un *VolumeSnapshotClass* qui permettre de donner les bonnes indications à Velero pour target le bon driver que l'on utlise précédement :

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: filestore-snap-class
  labels:
    velero.io/csi-volumesnapshot-class: "true" # Important pour que Velero le détecte
driver: filestore.csi.storage.gke.io
deletionPolicy: Retain
```

### Étape 2 : Création de la Source et des Données
Ici pour l'example je vais fake le contenu d'un PV, mais à toi de bien setter le PV/PVC de ton app statefullset.

Simple namespace ici : 

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backup-source
```

On crée un fake PVC pour le tp :

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pv-test
  namespace: backup-source
spec:
  accessModes:
  - ReadWriteMany
  storageClassName: filestore-sc
  resources:
    requests:
      storage: 100Gi
```

Un simple pod ici que l'on monte avec le volume précédent, avec une simple donnée que l'on va persister le plus simplement au monde :

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: data-creator
  namespace: backup-source
spec:
  containers:
  - name: alpine
    image: alpine:latest
    command: ["/bin/sh", "-c"]
    # On écrit la date et un message secret dans le fichier, puis on sleep infini pour garder le pod en vie
    args: ["echo 'Backup réussi le: ' $(date) > /data/preuve.txt && echo 'Ceci est une donnée critique' >> /data/preuve.txt && sleep 3600"]
    volumeMounts:
    - mountPath: /data
      name: data-vol
  volumes:
  - name: data-vol
    persistentVolumeClaim:
      claimName: pv-test
```

### Étape 3 : Exécution du Backup via Velero CLI
C'est le moment critique ici, on va demander à Velero de sauvegarder tout le namespace backup-source. Grâce à l'intégration CSI, il va détecter le PVC et créer un VolumeSnapshot.

```bash
# Lancer le backup
velero backup create backup-cours-01 \

# Vérifier les détails du backup pour voir si le snapshot a été pris
velero backup describe backup-cours-01 --details
```

Si tu utilises comme moi les scheduleBackup de velero, tu peux aussi trigger la création d'un backup depuis celui-ci via s: 

```bash
velero backup create --from-schedule example-schedule-01
```

!!! note
    Dans la sortie de la commande describe, tu devrais avoir la section "CSIVolumeSnapshots" de bien rempli


### Étape 4 : Restauration dans un NOUVEAU Namespace
On va pouvoir ici restaurer les données dans un namespace différent nommé restore-target pour montrer la flexibilité de Velero


```bash
velero restore create <RESTORE_NAME> 
    --from-backup backup-cours-01 \
    --namespace-mappings backup-source:restore-target
```

### Étape 5 : Vérification avec le Pod Inspector
Le Pod data-creator a été restauré, mais pour l'exo, on va créer un nouveau pod "inspecteur" dans le nouveau namespace pour aller lire le volume restauré

```yaml
# inspector.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-inspector
  namespace: restore-target 
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    volumeMounts:
    - mountPath: /data-restored
      name: restored-vol
  volumes:
  - name: restored-vol
    persistentVolumeClaim:
      claimName: pv-test # Le nom du PVC reste le même, mais il est dans le nouveau namespace
```

Appliquez et vérifiez :

```bash
# Appliquer l'inspecteur
kubectl apply -f inspector.yaml

# Attendre qu'il démarre (le temps que le volume soit provisionné depuis le snapshot)
kubectl get pods -n restore-target -w

# LA PREUVE FINALE
echo "Lecture du fichier restauré :"
kubectl exec -n restore-target pod-inspector -- cat /data-restored/preuve.txt
```

## Résultat attendu

Si tout a fonctionné, la dernière commande affichera le texte écrit à l'étape 2 🥳 :

*Backup réussi le: [Date d'origine] Ceci est une donnée critique*