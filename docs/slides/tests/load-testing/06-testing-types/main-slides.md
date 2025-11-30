# Fondamentaux et Scripting
## Module 6 : Types de Tests

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 6.1 Les Différents Types de Tests de Charge

#### 0. Test minimal (Smoke test)
**Objectif :** Vérifier le comportement logique  
**Profil :** Throughput faible & courte période  


```javascript
export const options = {
  scenarios: {
    smoke_load: {
      duration: '1m',
      vus: 3,
    },
  }
};
```

**Ce qu'on cherche :**

- Validation initiale d'un nouveau test
- Vérifier le fonctionnement des scripts existant après une mise à jour
- Permet d'itérer plus rapidement sur d'autres types de tests plus long


---



## 6.1 Les Différents Types de Tests de Charge

#### 1. Test de Charge (Average Load Testing)
**Objectif :** Vérifier le comportement sous charge normale/attendue  
**Profil :** Charge constante et stable  

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '30m', target: 100 }, 
    { duration: '5m', target: 0 }, 
  ],
};
```

**Métriques clés :**

- Temps de réponse moyen et P95/P99
- Throughput stable
- Taux d'erreur minimal


---


## 6.1 Les Différents Types de Tests de Charge

#### 2. Test d'Endurance (Soak Testing)
**Objectif :** Détecter les fuites mémoire, dégradations sur la durée  
**Profil :** Charge nominale prolongée (plusieurs heures)  

```javascript
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '8h', target: 100 }, 
    { duration: '5m', target: 0 },
  ],
};
```

**Ce qu'on cherche :**

- Stabilité des métriques dans le temps
- Pas de dégradation progressive
- Pas de fuites de ressources


---


## 6.1 Les Différents Types de Tests de Charge

#### 3. Test de Stress (Stress Testing)

**Objectif :** Identifier la limite de capacité du système  
**Profil :** Augmentation progressive jusqu'à la rupture  

```javascript
export const options = {
  stages: [
    { duration: '10m', target: 200 },
    { duration: '30m', target: 200 },
    { duration: '5m', target: 0 },
  ],
};
```

**Objectifs :**

- Trouver le point de rupture
- Observer le comportement en surcharge
- Vérifier la récupération après stress


---


## 6.1 Les Différents Types de Tests de Charge

#### 4. Test de Pic (Spike Testing)
**Objectif :** Vérifier le comportement lors de pics soudains  
**Profil :** Augmentation très rapide puis retour à la normale  

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 2000 },
    { duration: '1m', target: 0 },
  ],
};
```

**Ce qu'on teste :**

- Réponse aux pics (ex: promotions, événements)
- Auto-scaling
- Récupération après le pic
  


---


## 6.1 Les Différents Types de Tests de Charge

#### 5. Test de Rupture (Breakpoint Testing)
**Objectif :** Déterminer la capacité maximale absolue  
**Profil :** Augmentation continue jusqu'à l'échec total  

```javascript
export const options = {
  executor: 'ramping-arrival-rate', // Assure l'augmentation progressive de la charge même si le système ralenti
  stages: [
    { duration: '2h', target: 20000 }, 
  ],
};
```


---


### 6.2  Implémentation des Types de Tests

#### Exercice 1 : Test de Charge Nominal

**Objectif :** Créer un test de charge nominale

- Définir la charge attendue (ex: 100 req/s)
- Durée de 10 minutes
- Définir des thresholds appropriés
- Analyser si le système tient la charge

#### Exercice 2 : Test de Stress

**Objectif :** Pousser le système à ses limites

- Implémenter une rampe progressive
- Identifier le point où les erreurs commencent
- Observer la dégradation des performances
- Noter la capacité maximale


---


### 6.2  Implémentation des Types de Tests

#### Exercice 3 : Test de Pic

**Objectif :** Simuler un événement promotionnel

- Charge de fond : 50 req/s
- Pic soudain : 500 req/s pendant 2 minutes
- Retour à la normale
- Vérifier la récupération

#### Exercice 4 : Comparaison

**Objectif :** Analyser les résultats des différents tests

- Comparer les métriques (P95, taux d'erreur)
- Identifier les différences de comportement
- Déterminer quel test a révélé le plus de problèmes

