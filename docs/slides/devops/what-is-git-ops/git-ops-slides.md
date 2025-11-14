## GitOps - Type de modèle 1/2

**Push**  
- Principe de base d'une CI/CD
- Pousse les artifacts, Image, Build etc. sur un dépôt distant


![push-pipeline](./img/push-pipeline.png)<!-- .element: class="r-stretch" -->

---


## GitOps - Type de modèle 2/2
**Pull**  
- Le cluster est en permanence réconciliation
- Il récupère image, fichier de configuration, etc 


![pull-pipeline](./img/pull-pipeline.png)<!-- .element: class="r-stretch" -->

---



## GitOps - ArgoCD et FluxCD  
- Un **opérateur** est un système qui tourne sur le cluster
- A pour objectif de monitorer et déployer selon une configuration
- Pour monitorer ces états il utilise des **CRD**
- Le model Pull est utilisé, et evite d'exposer certains secrets ou token en dehors du cluster  


![full-git-ops-pipeline](./img/full-git-ops-pipeline.png)<!-- .element: class="r-stretch" -->

