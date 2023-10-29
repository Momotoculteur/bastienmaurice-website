## Exposer des métriques 
### Dans quel but ?
Monitorer son cluster a base de kubectl peut être long et fastidieux. Il y a des métriques en pagaille, tu ne sais probablement même pas à quoi elles correspondent toute, tu t'y perds. 
Mais si tu fais le trie, et que tu décortiques certaines qui puissent t'être utile, tu peux ensuite les remonter à des outils sur lesquelles tu vas pouvoir y créer des dashboard. Et là, c'est garanti d'avoir de l'information facilement compréhensible par tous.

## Kube State Metrics
### Mieux que les métriques de Kubernertes ?
De base, kubernetes expose des métriques. Voici une petite liste disponible ici : 
https://kubernetes.io/docs/reference/instrumentation/

Tu vas en avoir sur les nodes, les pods, les services et bien d'autres. Mais il en existe forcement pleins d'autres que tu n'as pas à disposition sur l'état de tes objets dans kubernetes. KSM t'apporte une multitude d'autres métriques que Kubernetes ne te fourni pas de base.

Grosso modo : 

- Métrique kubernetes se focus d'avantage sur les informations d'usage pour les ressources du cluster (CPU et memoire), et qui sont intéréssante sur la puissance de scaling de ton cluster
- KSM se focus d'avantage sur la santé des objets qui tournent dans ton cluster, leurs disponibilités, etc.

Donc avoir le combo est deux est forcement gagnant :smile:


### Installation
