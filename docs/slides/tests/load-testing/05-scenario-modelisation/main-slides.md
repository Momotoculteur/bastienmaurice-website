# Modélisation et Résultats
## Module 5 : Modélisation de Scénarios

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

**Comprendre les VUs (Virtual Users)**

- **VU :** Instance d'exécution indépendante du script
- Chaque VU exécute le code en boucle
- Les VUs ne partagent pas d'état (sauf SharedArray)

**Think Times**

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io');
  sleep(1); // Pause de 1 seconde (think time)
  
  http.get('https://test.k6.io/contacts.php');
  sleep(Math.random() * 5); // Think time aléatoire (0-5s)
}
```

**Dynamic Think Times**
```js
import { sleep } from 'k6';
import { randomIntBetween } from 'k6-utils';

export default function () {
  sleep(randomIntBetween(1, 5)); // Think time entre 1 and 5 secondes
}
```


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

**Modèle fermé**

Le modèle fermé maintient **un nombre fixe d'utilisateurs virtuels** actifs  
Un nouveau scénario ne commence que lorsque le VU précédent **a terminé son scénario**

**Fonctionnement**

- Le nombre de VU est plafonné. Si le système ralentit, le temps entre les itérations augmente, ce qui réduit automatiquement le taux de requêtes envoyées
- Le système est protégé de la surcharge, car il n'y a jamais plus de N utilisateurs en même temps
- Le débit (nombre de requêtes par seconde) est directement corrélé au temps de réponse de votre application.

**Cas d'Usage**

- Test de capacité : Déterminer le nombre maximum de VU que le système peut gérer tout en conservant un temps de réponse acceptable
- Systèmes à ressources limitées : Simuler des systèmes où les utilisateurs doivent attendre qu'une ressource (comme un thread ou une connexion) se libère

*Executor : `constant-vus`, `ramping-vus`*


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

**Modèle ouvert**
Le modèle ouvert se concentre sur le **taux d'arrivée des requêtes (ou sessions)**, sans se soucier du statut du système (surcharge ou disponibilité des VU)

**Fonctionnement**

- k6 injecte de **nouveaux utilisateurs virtuels (VU)** à **un taux prédéfini** (par exemple, 10 VU par seconde), que les VU précédents aient terminé ou non leur scénario
- C'est la méthode idéale pour simuler le trafic dans **le monde réel**, où le taux d'arrivée des utilisateurs est constant et ne dépend pas du temps de réponse de votre application

**Cas d'Usage**
- Test de trafic réel : Simuler des accès utilisateurs constants à un site web ou une API publique
- Identification du goulot d'étranglement : Tester comment le système se comporte lorsque le temps de réponse augmente (ce qui signifie que la file d'attente des requêtes s'allonge)

*Executor : `constant-arrival-rate`, `ramping-arrival-rate`*



---


## 5.1 Utilisateurs Virtuels et Modèles de Charge
#### Modèles fermés vs ouverts

| Caractéristique       | Modèle Ouvert (Arrival Rate)                                    | Modèle Fermé (Constant VUs)                                      |
|-----------------------|-----------------------------------------------------------------|------------------------------------------------------------------|
| Variable Contrôlée    | Taux d'arrivée de nouveaux utilisateurs/sessions.              | Nombre d'utilisateurs virtuels (VU) actifs simultanément.       |
| Impact du Ralentissement | La file d'attente s'allonge.                                 | Le taux de requêtes diminue.                                     |
| Objectif Principal    | Simuler le trafic réel et identifier les goulots d'étranglement causés par la queue. | Tester la capacité maximale de la plateforme sous une charge fixe. |
| Executors k6          | `constant-arrival-rate`, `ramping-arrival-rate`               | `constant-vus`, `ramping-vus`                                   |



![grafana k6 open-vs-closed-models](../img/open-vs-closed-models.png)

---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

Les Executors dans k6 sont des moteurs d'exécution qui définissent comment et quand les VUs (Virtual Users) exécutent les itérations de test.

Ils déterminent le pattern de charge de votre test :  

- Combien de VUs sont actives
- Quand elles démarrent/arrêtent
- Comment la charge évolue dans le temps

</br></br>

**Choix de l'Executor**

| Besoin                     | Executor recommandé    | Modèle ouvert / fermé |
| -------------------------- | ---------------------- | ----------------------|
| Charge stable              | constant-vus           | Fermé                 |
| Montée progressive         | ramping-vus            | Fermé                 |
| Débit constant de requêtes | constant-arrival-rate  | Ouvert                |
| Débit variable de requêtes | ramping-arrival-rate   | Ouvert                |
| Nombre total d'itérations  | shared-iterations      | Fermé                 |
| Itérations par VU          | per-vu-iterations      | Fermé                 |
| Contrôle externe           | externally-controlled  | Fermé (piloté)        |


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge
**Shared Iterations** `(shared-iterations)`  
Distribue un nombre fixe d'itérations entre tous les VUs en parallèle  
Chaque VU exécute jusqu'à ce que le quota soit épuisé  

```js
executor: 'shared-iterations',
options: {
  vus: 10,
  iterations: 100  // 100 itérations totales réparties entre les 10 VUs
}
``` 
Cas d'usage : tester un nombre défini de requêtes sans durée limite.

</br></br>

**Per-VU Iterations** `(per-vu-iterations)`  
Chaque VU exécute exactement le même nombre d'itérations indépendamment  
```js
executor: 'per-vu-iterations',
options: {
  vus: 10,
  iterations: 50  // Chaque VU fait 50 itérations = 500 totales
}
```
Cas d'usage : chaque utilisateur simulé fait un parcours identique.


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge
**Constant VUs** `(constant-vus)`  
Maintient un nombre constant de VUs pendant une durée définie  
Le plus simple et classique  
```js
executor: 'constant-vus',
options: {
  vus: 100,
  duration: '5m'  // 100 VUs pendant 5 minutes
}
```
Cas d'usage : charge stable, test de performance baseline.

</br></br>

**Ramping VUs** `(ramping-vus)`  
Augmente/diminue progressivement le nombre de VUs  
Simule l'arrivée progressive d'utilisateurs
```js
executor: 'ramping-vus',
options: {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 0 }
  ]
}
```
Cas d'usage : simuler une journée réelle avec montée progressive, puis descente.


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

**Constant Arrival Rate** `(constant-arrival-rate)`  
Maintient un taux d'arrivée constant (X requêtes par seconde)  
Les VUs s'ajustent automatiquement pour maintenir le débit  

```js
executor: 'constant-arrival-rate',
options: {
  rate: 100,           // 100 requêtes/sec
  timeUnit: '1s',
  duration: '5m',
  preAllocatedVUs: 50, // VUs pré-alloués
  maxVUs: 200          // Limite max si besoin d'en créer plus
}
```
Cas d'usage : charge réaliste orientée débit (SLA par requête/sec)

</br></br>

**Ramping Arrival Rate** `(ramping-arrival-rate)`
Le taux d'arrivée augmente/diminue progressivement  
```js
executor: 'ramping-arrival-rate',
options: {
  stages: [
    { duration: '2m', target: 50 },   // Rampe jusqu'à 50 req/sec
    { duration: '3m', target: 100 },  // Puis 100 req/sec
    { duration: '2m', target: 0 }     // Descente
  ],
  preAllocatedVUs: 100,
  maxVUs: 300
}
``` 
Cas d'usage : stress progressif avec débit contrôlé




---


## 5.2  Création de Scénarios Réalistes

#### Scénarios multiples
```javascript
export const options = {
  scenarios: {
    // Charge de fond constante
    background_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      exec: 'readScenario',
    },
    // Pic de charge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '10s', target: 0 },
      ],
      startTime: '5m', // Commence après 5 minutes
      exec: 'writeScenario',
    },
  },
};

export function readScenario() {
  http.get('https://test.k6.io');
  sleep(1);
}

export function writeScenario() {
  http.post('https://test.k6.io/posts', JSON.stringify({ test: 'data' }));
  sleep(0.5);
}
```

---


## 5.2  Création de Scénarios Réalistes

#### Exercice pratique
**Objectif :** Créer un scénario e-commerce réaliste

- Navigation (70% des utilisateurs) : parcourir produits, rechercher
- Achat (20% des utilisateurs) : ajouter au panier, payer
- Administration (10% des utilisateurs) : gérer inventaire
- Utiliser des think times réalistes
- Implémenter une rampe de charge progressive


---


## 5.3  Options intéréssantes - GracefulStop

C'est est une période de grâce qui permet aux itérations en cours de se terminer proprement avant l'arrêt forcé d'un scénario.

**Sans GracefulStop (comportement par défaut)**

- Les itérations en cours sont interrompues brutalement
- Métriques incomplètes (requêtes HTTP non terminées)
- Données corrompues dans les résultats

```js
const options = {
  scenarios: {
    my_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 }, // Arrêt IMMÉDIAT à la fin
      ],
    },
  },
};
```


---


## 5.3  Options intéréssantes - GracefulStop

**Avec GracefulStop**

- Évite les métriques partielles
- Préserve l'intégrité des données
- Permet aux transactions de se compléter
- Résultats de test plus précis

```js
const options = {...
    executor: 'ramping-vus',
    gracefulStop: '30s', // Période de grâce de 30 secondes
    stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
    ],
};
```

**Comment ça fonctionne ?**  
Durée totale du test : 9m  
├── 2m : Montée à 100 VUs  
├── 5m : Maintien à 100 VUs   
├── 2m : Descente à 0 VUs  
└── 30s : GracefulStop (extra)  



---


## 5.3  Options intéréssantes - Preallocated VU  
Pré-allouer les VUs au démarrage pour éviter la création progressive  
Réduit les "cold start" et lisse les résultats  

**Sans Preallocated VUs (comportement par défaut)**  

- Les VUs sont créées progressivement pendant la montée en charge
- Démarrage lent au début du test

```js
options = {
  stages: [
    { duration: '1m', target: 100 }, // Monte à 100 VUs en 1 minute
  ],
};
```

**Avec Preallocated VUs**

- 50 VUs sont déjà en mémoire quand le test commence
- Démarrage immédiat d'une partie de la charge

```js
options = {
  preAllocatedVUs: 50, // 50 VUs préchargées dès le début
  stages: [
    { duration: '1m', target: 100 },
  ],
};
```


