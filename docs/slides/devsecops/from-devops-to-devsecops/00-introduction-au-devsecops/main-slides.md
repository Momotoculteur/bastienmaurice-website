## Objectif du cours

Le but, c’est d’avoir une vision simple de **comment on met la sécurité dans un cycle de dev moderne**

On va voir :

- d’où vient le DevSecOps
- comment il prolonge le DevOps
- quels types de risques il aide à couvrir
- et comment les outils actuels rendent tout ça beaucoup plus facile

</br></br>

L’idée n’est pas juste de connaître les concepts :  
on va aussi apprendre à **anticiper les risques, automatiser leur détection**, et **poser une vraie stratégie de sécurité** adaptée au projet


---


## Objectifs pédagogiques

À la fin du cours, vous serez capables de :

- expliquer clairement ce qu’est le **DevSecOps**
- reconnaître **les risques classiques** dans un projet logiciel
- et voir **comment les intégrer dans un pipeline CI/CD**

</br></br>

Vous saurez aussi :

- quels outils utiliser pour analyser le code, les dépendances, les conteneurs et l’infra,
- et comment les brancher dans **un processus automatisé** pour gagner du temps et sécuriser le projet
  

---

## Le DevOps : fondations essentielles
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---



## Le DevOps : une culture avant tout

Le DevOps, ce n’est pas un outil : c’est **une façon de travailler**

L’idée, c’est de mieux collaborer, d’automatiser un maximum, et de livrer plus souvent, avec plus de fiabilité

En gros, on casse les barrières entre devs et ops pour rendre tout le flux plus fluide

Et c’est justement cette fluidité qui permet d’intégrer la **sécurité** dans un modèle **DevSecOps**


---


## Les pratiques clés du DevOps

Dans un environnement DevOps, on retrouve quelques pratiques clés :

- intégration continue
- déploiement continu
- automatisation poussée
- et surveillance constante des applis en prod

Le DevSecOps ne remplace pas tout ça : il **renforce ces pratiques** en y ajoutant la **sécurité à chaque étape**


---


## Le cycle DevOps en un regard

On peut résumer le cycle DevOps à **une boucle continue** :

```
Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
```

Le DevSecOps vient simplement s’intégrer dans cette boucle en ajoutant une couche de sécurité à chaque étape


---

## Pourquoi intégrer la sécurité dès le départ ?
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->
---


## Le contexte actuel

**Pourquoi tout est plus chaud**

- Nos applis modernes ont des centaines de dépendances 
- Tout est dans des conteneurs sur des clouds complexes
- Les mises en prod s’enchaînent à un rythme rapide

**L'Explosion du Risque**

- Les risques ne disparaissent pas, ils se multiplient
- Impossible de tout contrôler manuellement

**La solution**  

- C'est là que le **DevSecOps devient indispensable**


---


## Le principe du Shift Left

L’idée centrale du DevSecOps, c’est d’intégrer la sécurité le plus tôt possible dans le cycle

**Plus on détecte tard, plus ça coûte cher**

- Détecter pendant le développement ou le build
- Coûte beaucoup moins cher que de corriger en production

**Le principe de Shift Left, c’est justement ça**

- On déplace les contrôles de sécurité vers la gauche
- Vers les premières étapes du processus
- Là où c'est plus efficace et plus facile à automatiser


---


## DevSecOps : une extension naturelle

On peut voir le DevSecOps comme une couche supplémentaire qui s’ajoute naturellement aux pratiques DevOps :

```
Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
↑ Sécurité intégrée sur toute la chaîne ↑
```

**Objectif Principal**

- On ne veut pas ralentir les équipes
- Assurer les bonnes pratiques à chaque étape
- Sans intervention lourde des équipes Sécurité
- Le minimum requis pour avancer vite et en toute sécurité


---

## Les risques dans un pipeline moderne
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->
---


## Les risques auxquels on fait face

Un pipeline de développement, c’est plein de points sensibles

**Où sont les risques ?**

1. Le Code & les Dépendances :
   - Vulnérabilités classiques (injections, mauvaises validations)
   - Failles critiques cachées dans les dépendances (bibliothèques)
2. Les Conteneurs :
   - Images avec packages obsolètes ou en mode root (élévation de privilèges)
3. L'Infrastructure-as-Code (IaC) :
   - Configurations (Terraform, YAML) qui exposent des ports ou donnent trop de permissions
4. Le Pipeline CI/CD :
   - Une cible potentielle s'il manipule des secrets ou exécute du code non contrôlé


---


## Exemples réels

**Log4Shell** : La vulnérabilité Log4Shell (CVE-2021-44228) a permis l'exécution de code à distance dans des millions d'applications Java

**Secrets en public** : Des mots de passe qui finissent sur GitHub et provoquent des compromissions énormes

Aujourd'hui, **la chaîne d'approvisionnement logicielle** (nos dépendances, nos configs) est souvent **plus vulnérable que notre propre code**


---

## Automatiser la sécurité
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->
---


## Pourquoi automatiser ?

Nos environnements sont trop rapides et trop complexes pour la sécurité manuelle

**Le rôle de l'Automatisation**

- Intégrer des contrôles systémiques
- Vérifier en continu :
  - Les vulnérabilités
  - Les erreurs de configuration
  - Les dépendances à risque

Ces contrôles deviennent **une barrière automatique** qui évite d’introduire des failles dans le pipeline


---


## Sécurité du code : l’analyse statique (SAST)

**Qu'est-ce que c'est**

- On examine directement le code source (sans le faire tourner)
- On repère les failles les plus courantes

**Ce que ça trouve**

- Risques d'injections (SQL, etc.)
- Fuites de données
- Erreurs de vérification ou de logique

**L’avantage** : on peut corriger les problèmes avant même le build, ce qui réduit énormément les risques et les coûts


---


## Sécurité des dépendances : l’analyse de composition (SCA)

Les **dépendances** représentent aujourd’hui une énorme partie de la **surface d’attaque**

**Ce que fait l'outil SCA**  

- Détecter les versions vulnérables
- Suivre les annonces de nouvelles failles (CVE)
- Même vérifier la conformité des licences (bonus)

**Résultat** : on garde une vision claire de tout le code tiers qu’on intègre dans le projet


---


## Sécurité des conteneurs

**Le Risque**

- Les images Docker héritent de failles (packages système vulnérables, etc)
- Risque de configurations dangereuses (mode root, fichiers sensibles)

**Ce que fait le Scan**

- Identifier les failles cachées dans les différentes couches
- Repérer les mauvaises configurations

Avec le temps, ce contrôle devient **indispensable** pour construire des images fiables


---


## Sécurité de l’infrastructure (IaC)

**Pourquoi scanner l'IaC**  

Notre infrastructure est du code (Terraform, CloudFormation, K8s YAML)  
Elle doit être vérifiée avec la même rigueur que le code applicatif

**Detecte**

- Ports exposés
- Permissions trop larges
- Mots de passe codés en dur
- etc.

**Objectif** : éviter que ces erreurs de config arrivent jusqu’en production


---

## Politiques de sécurité automatiques
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->
---


## L’intérêt d’une politique de sécurité

Pour garder un niveau de sécurité cohérent dans toute l’équipe, il faut définir des règles communes

**Le rôle des règles**

- Déterminer ce que le pipeline a le droit de faire ou de bloquer
- C'est notre garde-fou automatique
  
**Exemples de blocages**

- Interdire les images non signées
- Bloquer un déploiement si une CVE Critique est trouvée
- Empêcher un conteneur de tourner en mode root
  

---


## Policy as Code

**Les Outils**

- On utilise des outils comme OPA, Conftest, Kyverno...
- Nos règles de gouvernance sont écrites sous forme de code

**L'Intégration Facile**

- On intègre ce code directement dans le pipeline CI/CD
- Les règles deviennent automatiquement vérifiables et exécutables
- Zéro intervention humaine nécessaire

**Résultat** : tous les projets respectent une même base de sécurité, sans effort supplémentaire


---

## Conclusion
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->
---


## Synthèse

Le **DevSecOps** est devenu incontournable dans les environnements de dev actuels

Il ajoute la sécurité **à chaque étape** du cycle DevOps grâce à l’automatisation, aux scans de code et de dépendances, aux analyses de conteneurs et à l’audit de l’infra

**Objectif** : garder des projets sécurisés, tout en conservant la vitesse et la flexibilité des workflows modernes


