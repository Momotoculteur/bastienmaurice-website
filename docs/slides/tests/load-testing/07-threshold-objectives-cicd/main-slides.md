# Fondamentaux et Scripting
## Module 7 : Thresholds, Objectifs & CICD

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 7.1 Définir des Seuils de Performance

**Syntaxe des Thresholds**

```javascript
export const options = {
  thresholds: {
    // Durée des requêtes HTTP
    http_req_duration: [
      'p(95)<500',  // 95% des requêtes < 500ms
      'p(99)<1000', // 99% des requêtes < 1s
      'avg<300',    // Moyenne < 300ms
      'max<2000',   // Maximum < 2s
    ],
    
    // Taux d'erreur
    http_req_failed: [
      'rate<0.01',  // Moins de 1% d'erreur
    ],
    
    // Throughput
    http_reqs: [
      'count>1000', // Au moins 1000 requêtes
      'rate>50',    // Au moins 50 req/s
    ],
    
    // Checks
    checks: [
      'rate>0.95',  // 95% des checks passent
    ],
  },
};
```

---


## 7.1 Définir des Seuils de Performance

**Thresholds sur métriques custom**

```javascript
import http from 'k6/http';
import { Trend, Counter } from 'k6/metrics';

const loginDuration = new Trend('login_duration');
const failedLogins = new Counter('failed_logins');

export const options = {
  thresholds: {
    'login_duration': ['p(95)<1000'],
    'failed_logins': ['count<10'],
  },
};

export default function () {
  const start = Date.now();
  const res = http.post('https://test.k6.io/login', {
    username: 'test',
    password: 'test',
  });
  const duration = Date.now() - start;
  
  loginDuration.add(duration);
  
  if (res.status !== 200) {
    failedLogins.add(1);
  }
}
```

---


## 7.1 Définir des Seuils de Performance

**Thresholds par tag ou groupe**

```javascript
export const options = {
  thresholds: {
    'http_req_duration{type:api}': ['p(95)<300'],
    'http_req_duration{type:static}': ['p(95)<100'],
    'group_duration{group:::API Login}': ['p(95)<500'],
  },
};

export default function () {
  http.get('https://test.k6.io/api', { tags: { type: 'api' } });
  http.get('https://test.k6.io/style.css', { tags: { type: 'static' } });
  
  group('API Login', function () {
    http.post('https://test.k6.io/login');
  });
}
```

---


## 7.1 Définir des Seuils de Performance

**Abort on Fail**

```javascript
export const options = {
  thresholds: {
    http_req_failed: [
      { threshold: 'rate<0.1', abortOnFail: true },
    ],
  },
};
```

---


## 7.2  Définir des Objectifs de Performance

**Exercice 1 : SLA E-commerce**

**Objectif :** Définir des thresholds basés sur un SLA réel

Contraintes SLA :

- 95% des pages doivent charger en < 2s
- 99% des pages doivent charger en < 5s
- Disponibilité de 99,9% (0,1% d'erreurs max)
- Minimum 100 req/s de throughput

Implémenter les thresholds correspondants et tester.

**Exercice 2 : Métriques Custom**

**Objectif :** Créer et surveiller des métriques métier

Créer des métriques pour :

- Temps de connexion utilisateur
- Temps de checkout (panier → paiement)
- Nombre de produits consultés
- Taux de conversion (vues → achats)

Définir des thresholds sur ces métriques.


---


## 7.2  Définir des Objectifs de Performance

**Exercice 3 : Thresholds Avancés**

**Objectif :** Utiliser des thresholds conditionnels

- Différents seuils pour API vs pages statiques
- Thresholds par groupe fonctionnel
- Abort on fail pour erreurs critiques
- Thresholds progressifs (plus stricts au fil du test)

