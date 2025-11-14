## Prometheus & Grafana

**⬇️ Prometheus**  
- Récupération des métriques par **pull**  
- Stockage et requêtage des données métriques  
- Système d’**alerting** intégré  

**📈 Grafana**  
- Création de **dashboards** visuels personnalisés  
- Visualisation en temps réel des métriques et alertes  
- Supporte plusieurs sources de données  

💡 **Objectif Cloud Native** : surveillance proactive et analyse visuelle centralisée !





<img src="./img/grafana-dashboard.png" alt="grafana-dashboard" width="40%"/>


---



## Logging et Tracing

**📚 Logging**
- **Fluentd**, **Loki** : collecte, centralisation et recherche des logs  
- Logs essentiels pour le debug et monitoring

**🕵️‍♂️ Tracing**
- **Jaeger** : suivi des requêtes distribuées  
- Analyse des performances et goulots d’étranglement

**📏 OpenTelemetry**
- Standard ouvert d’instrumentation  
- Unifie collecte de métriques, logs, traces

</br></br>

💡 **Focus Cloud Native** : observabilité complète pour diagnostiquer efficacement !



---



## Questions : Observabilité

1. Quelle est la différence entre Prometheus et Grafana ?

2. Quel outil permet de centraliser les logs ?

3. Quel protocole est utilisé pour les traces distribuées ?



---

# Cloud Native Application Delivery
#### Apps fundamentals, GitOps, CI/CD...kcna 
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---



## CI/CD et GitOps

**🔧 CI/CD (Intégration & Déploiement continus)**
- **Jenkins**, **GitLab CI** : automatisent build, tests, déploiement
- Pipelines décrits sous forme de fichiers (`Jenkinsfile`, `.gitlab-ci.yml`)

</br></br>

**🌿 GitOps**
- Déploiement **déclaratif** via Git (source de vérité)
- Ex : **ArgoCD**, **FluxCD**
- Suivi des changements via Git → synchronisation automatique avec le cluster

</br></br>

💡 **Objectif Cloud Native** : automatiser, versionner et sécuriser les déploiements !




---



## Sécurité de livraison 

**🚦 Admission Controllers**  
- Contrôlent et valident les requêtes API avant leur application  
- Permettent d’imposer des politiques de sécurité, conformité, bonnes pratiques  
  
**1. Built-in Admission Controllers**
| Nom                   | Rôle                                                      |
| --------------------- | --------------------------------------------------------- |
| **NamespaceLifecycle**  | Empêche de créer des objets dans des namespaces supprimés |
| **LimitRanger**         | Implique des limites de CPU/mémoire par défaut            |
| **DefaultStorageClass** | Assigne une StorageClass si absente                       |

**2. Dynamic Admission Controllers (Webhooks)**  

📌 Mutating Admission Webhook
- Peut modifier la requête (ex. injection automatique de sidecar Istio)
- Exécuté avant validation

📌 Validating Admission Webhook
- Peut refuser ou valider la requête
- Exécuté après mutation

| Élément                     | Description                                                       |
| --------------------------- | --------------------------------------------------------------    |
| **Admission Controller** | Plugin de l’API Server, mutateur ou validateur                     |
| **Built-in**             | Activé côté kube-apiserver (ex: LimitRanger)                       |
| **Webhook**              | Service HTTP/HTTPS externe, flexible (ex: OPA Gatekeeper, Kyverno) |




---


## Sécurité de livraison 

**🛡️ OPA & Gatekeeper**  
- **OPA (Open Policy Agent)**
  - C’est un moteur de décision généraliste basé sur un langage de policy : Rego.
  - Tu lui envoies des données, il renvoie une décision (allow, deny, etc.).
- **Gatekeeper**
  - Intègre OPA en tant que moteur de policy (controller)
  - Gère les règles et contraintes via des CRDs
  - Se comporte comme un Validating Admission Webhook
```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-label
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    labels: ["team"]
```
→ Cela refuse tous les pods qui ne déclarent pas metadata.labels.team.



---


## Sécurité de livraison 

**🔍 Scan d’images**  
- **Trivy**, **Snyk** : détectent vulnérabilités, failles de sécurité dans les images conteneurs  
- Intégration possible dans pipelines CI/CD pour blocage précoce  

</br></br>

💡 **But : garantir la sécurité et la conformité avant déploiement en production !**



---



## Questions : Delivery

1. Qu'est-ce que GitOps ?

2. Quelle est la différence entre un pipeline CI et CD ?

3. Quel outil permet de scanner une image de conteneur ?



---

# CNCF
#### Structure, memberships, boards...

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## CNCF – Cloud Native Computing Foundation

Fondation sous la Linux Foundation  
Soutient l’écosystème **Cloud Native**  
Accueille des projets comme Kubernetes, Prometheus...  

</br></br>

**Gouvernance structurée** 
- 📜 **Governing Board** (stratégie & finance)
- 🧠 **Technical Oversight Committee (TOC)** (feuille de route technique)
- 🛠️ **Special Interest Groups (SIGs)** (groupes d’experts thématiques)

</br></br>

| Structure              | Niveau                  | Rôle principal                         | Responsabilités clés                                                 | Membres typiques                      |
| ---------------------- | ----------------------- | -------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| 📜 **Governing Board** | Stratégique             | Vision, stratégie, financement         | Budgets, partenariats, décisions juridiques, croissance du projet    | Représentants des entreprises membres |
| 🧠 **TOC**             | Technique (stratégique) | Supervision technique globale          | Feuille de route, cohérence des projets, validation technique        | Experts techniques élus ou nommés     |
| 🛠️ **SIGs**           | Opérationnel            | Travail technique ciblé sur un domaine | Développement, maintenance, revue de code, support aux contributeurs | Mainteneurs, développeurs             |



---



## CNCF – Governing Board

**🎯 Rôle**  
Le Governing Board est l’instance décisionnelle stratégique et financière d’un projet ou d’une fondation.


**⚙️ Responsabilités principales**  
- Définir la stratégie globale (vision, expansion, partenariats)
- Allouer les budgets (marketing, événements, développement, sécurité, etc.)
- Gérer les relations avec les sponsors, membres fondateurs, et partenaires
- Superviser les aspects juridiques et contractuels
- Valider ou influencer les grandes décisions comme :
  - L’admission de nouveaux projets dans la fondation
  - Les changements de licence
  - Les dépenses exceptionnelles

**👥 Composition**  
Généralement constitué de représentants des entreprises membres (ex : Platinum Members dans la CNCF) ou d’élus.



---


## CNCF – Technical Oversight Committee (TOC)

**🎯 Rôle**  
Le TOC est le garant de la cohérence technique du projet ou de l’écosystème soutenu par la fondation.

**⚙️ Responsabilités principales**  
- Définir la feuille de route technique
- Évaluer les projets candidats à une incubation ou graduation (ex. dans la CNCF : Envoy, Prometheus, OpenTelemetry…)
- Maintenir la cohérence architecturale entre les projets
- Piloter les bonnes pratiques, les exigences de sécurité, d’interopérabilité, de documentation…
- Évaluer les projets abandonnés ou obsolètes

**👥 Composition**  
Des experts techniques indépendants, souvent élus ou nommés par leurs pairs. Ils ont une vision neutre et long terme.



---


## CNCF – Special Interest Groups (SIGs)

**🎯 Rôle**  
Les SIGs sont des groupes de travail thématiques. Ils opèrent au plus près du code et des usages.

**⚙️ Responsabilités principales**  
- Gérer une sous-partie technique du projet ou un domaine fonctionnel spécifique (ex : SIG Networking, SIG Security, SIG Observability…)
- Proposer des améliorations, rédiger des Kubernetes Enhancement Proposals (KEP) ou équivalents
- Revoir du code, proposer des APIs, expérimenter des features
- Servir de point d’entrée pour les contributeurs
- Participer à la documentation, tests et intégration continue

**👥 Composition**  
Ouverts à tous les contributeurs  
Menés par des mainteneurs ou leads, souvent nommés par mérite  
Fonctionnent via des réunions régulières, Slack, mailing lists, GitHub…  



---


## CNCF Tech Radar

- Publication communautaire (trimestrielle)
- Classe les technologies selon l’adoption :
  - ✅ **Adopt**
  - 🔬 **Trial**
  - 🧪 **Assess**
  - 🚫 **Hold**

**Objectif** 
- Aider les équipes à comprendre les tendances réelles
- Donne une **vue concrète** sur ce qui marche en production

📊 Basé sur des retours de membres du End User Community



---



## CNCF Memberships

**Types** 
- 🥇 **Platinum**
  - 1 personne admise au Governing Board
- 🥈 **Gold**
  - 1 personne admise au Governing Board pour 5 members (max 3)
- 🥉 **Silver**
  - 1 personne admise au Governing Board pour 1O members (max 3)
- 👨‍🏫 **Academic / Nonprofit institution**

**Avantages** 
- Visibilité dans la communauté
- Droit de vote au Governing Board (selon le niveau)
- Influence sur la feuille de route CNCF

💡 Plus de 160 membres, dont Google, Red Hat, Microsoft...


---



## Quizz - Examen blanc



---



## Conseils de préparation

- 🎯 **60 questions gratuites** disponibles sur [app.exampro.co](https://app.exampro.co)  
- 💸 **Séries supplémentaires** disponibles sur Udemy (payantes)
- ⏱️ **Entraîne-toi au rythme réel** : ~1min30 par question  
  → Ne reste pas bloqué trop longtemps
- 💡 **Se méfier des pièges de vocabulaire**  
  Lire attentivement chaque proposition.



---



**🎓 Concepts fondamentaux**
- Qu’est-ce qu’un cluster Kubernetes ?
- Architecture : Control Plane vs Workers
- Principales ressources : Pod, Service, Deployment, ConfigMap, Secret

**⚙️ Outils CLI**
- `kubectl` : commandes de base (`get`, `describe`, `logs`, `apply`, `delete`)
- Notions de contexte (`kubectl config use-context`)

**📦 Conteneurs & images**
- Docker / containerd / OCI
- Fichier Dockerfile & `docker build`

**🌐 Réseau & Services**
- ClusterIP, NodePort, LoadBalancer
- DNS interne, communication entre pods

**☁️ Écosystème CNCF**
- Open source, projets CNCF (Prometheus, Helm, etc.)
- CNCF Landscape et notions de Cloud Native

