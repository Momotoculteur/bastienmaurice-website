## Hello ! 






2 ans Fullstack Engineer - Thales<br>
2 ans DevOps Engineer - Thales<br>
2 ans Platform Engineer - Betclic<br>

</br></br>

**Et vous ?**


---


## Informations Générales

**Durée totale :** 2 journées de 7 heures (14 heures)  
**Répartition :** 40% théorie / 60% pratique  
**Public :** Développeurs, testeurs, DevOps  
**Prérequis :** Connaissances de base en JavaScript, notions HTTP/API  


---


## Programme

**JOUR 1 - Fondamentaux et Scripting (7 heures)**
- 9h00 - 10h30 | Module 1 : Introduction aux Tests de Charge (1h30)
- 10h30 - 10h45 | Pause (15 min)
- 10h45 - 12h30 | Module 2 : Scripting Fondamental (1h45)
- 12h30 - 13h30 | Pause Déjeuner (1h)
- 13h30 - 15h00 | Module 3 : Structuration et Organisation (1h30)
- 15h15 - 17h00 | Module 4 : Paramètres et Dynamisme (1h45)


**JOUR 2 - Modélisation et Résultats (7 heures)**
- 9h00 - 10h30 | Module 5 : Modélisation de Scénarios (1h30)- 
- 10h30 - 10h45 | Pause (15 min)
- 10h45 - 12h30 | Module 6 : Types de Tests (1h45)
- 12h30 - 13h30 | Pause Déjeuner (1h)
- 13h30 - 15h00 | Module 7 : Thresholds, Objectifs & CICD (1h30)
- 15h00 - 15h15 | Pause (15 min)
- 15h15 - 16h45 | Module 8 : Résultats et Grafana (1h30)
- 17h00 - 18h00 | Module 9 : Projet Final Pratique (1h)


---

# Fondamentaux et Scripting
## Module 1 : Introduction aux Tests de Charge

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 1.1 Fondamentaux du Test de Charge

**Qu'est-ce qu'un test de charge ?**

- **Définition :** Processus de simulation de charges réalistes sur un système pour évaluer son comportement
- **Objectifs principaux :**
  - Identifier les limites de performance
  - Détecter les goulots d'étranglement
  - Valider les SLA (Service Level Agreements)
  - Prévenir les incidents en production


---


## 1.1 Fondamentaux du Test de Charge

**Pourquoi tester les performances ?**

- **Coût des pannes :** Temps d'arrêt = perte financière
- **Expérience utilisateur :** Performance = satisfaction client
- **Scalabilité :** Planifier la croissance
- **Conformité :** Respecter les engagements contractuels



---


## 1.1 Fondamentaux du Test de Charge

**Métriques clés à surveiller**

- **Temps de réponse :** Latence moyenne, médiane, P95, P99
- **Throughput :** Nombre de requêtes/seconde
- **Taux d'erreur :** Pourcentage de requêtes échouées
- **Utilisation des ressources :** CPU, mémoire, I/O, bande passante


---


## 1.1 Fondamentaux du Test de Charge

**Introduction à K6**

- **Historique :** Créé par Load Impact, maintenu par Grafana Labs
- **Philosophie :** Developer-centric, CLI-based, scriptable
- **Avantages :**
  - Scripts en JavaScript (ES6+)
  - Open source et gratuit
  - Performance élevée (Go sous le capot)
  - Intégration CI/CD facile
  - Cloud ou local
- **Écosystème :** K6 OSS, K6 Cloud, K6 Extensions


---


## 1.2 Installation et Premier Test 

**Installation de K6**

**macOS (Homebrew)**
```bash
brew install k6
```

**Linux (Debian/Ubuntu)**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey)**
```bash
choco install k6
```


---


## 1.2 Installation et Premier Test

**Vérification de l'installation**

```bash
k6 version
```

**Premier script de test**

```javascript
// test-simple.js
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('https://test.k6.io');
  sleep(1);
}
```

**Exécution du test**

```bash
k6 run test-simple.js
```


---



## 1.2 Installation et Premier Test

**Exercice pratique**

**Objectif :** Créer et exécuter votre premier test K6
- Créer un script qui teste une API publique (ex: https://jsonplaceholder.typicode.com)
- Lancer le test avec 10 utilisateurs virtuels pendant 30 secondes
- Observer les résultats dans la console


---

# Pause

<!-- .slide: class="center" -->
<!-- .slide: data-background="#434eefff" -->

---

# Fondamentaux et Scripting
## Module 2 : Scripting Fondamental

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 2.1 Cycle de Vie d'un Script K6

**Structure d'un script K6**

```javascript
// 1. Code d'initialisation (exécuté une fois)
import http from 'k6/http';
import { check, sleep } from 'k6';

// 2. Options de configuration
export const options = {
  vus: 10,
  duration: '30s',
};

// 3. Fonction setup (optionnelle, exécutée une fois avant les VUs)
export function setup() {
  // Préparation des données
  return { token: 'abc123' };
}

// 4. Fonction default (code de test, exécuté par chaque VU)
export default function (data) {
  // Logique de test
  http.get('https://api.example.com', {
    headers: { Authorization: `Bearer ${data.token}` }
  });
  sleep(1);
}

// 5. Fonction teardown (optionnelle, exécutée une fois après les VUs)
export function teardown(data) {
  // Nettoyage
}
```

**Les 4 phases du cycle de vie**

1. **Init context :** Chargement des modules, définition des variables globales
2. **Setup :** Préparation unique (création de données de test, authentification)
3. **VU context :** Exécution répétée du code de test
4. **Teardown :** Nettoyage final


---


## 2.1 Cycle de Vie d'un Script K6

**Métriques natives de K6**

- `http_reqs` : Nombre total de requêtes HTTP
- `http_req_duration` : Temps total de requête
- `http_req_blocked` : Temps bloqué avant la connexion
- `http_req_connecting` : Temps d'établissement de connexion
- `http_req_sending` : Temps d'envoi des données
- `http_req_waiting` : Temps d'attente (TTFB)
- `http_req_receiving` : Temps de réception des données
- `iterations` : Nombre d'itérations complétées
- `vus` : Nombre d'utilisateurs virtuels actifs


---


## 2.1 Cycle de Vie d'un Script K6
**Métriques custom**

- Counter (Compteur) : compte le nombre total d'événements
  - Exemple : nombre total de requêtes POST
- Gauge (Jauge) : valeur instantanée qui peut monter/descendre
  - Exemple : nombre d'utilisateurs actifs en temps réel
- Rate (Taux) : pourcentage entre 0 et 1
  - Exemple : taux d'erreur, taux de succès
- Trend (Tendance) : collecte des statistiques (min, max, moyenne, percentiles)
  - Exemple : temps de réponse personnalisé

```js
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const postRequests = new Counter('posts_requests_total'); // Compteur : nombre total de requêtes
const activeUsers = new Gauge('active_users'); // Jauge : valeur instantanée
const errorRate = new Rate('error_rate'); // Taux : pourcentage (0-1)
const responseTime = new Trend('custom_response_time'); // Tendance : stats (min, max, avg, percentiles)

export default function () {
  // Simuler un utilisateur actif
  activeUsers.add(1);
  ...
}
```


---


## 2.2 Création de Requêtes HTTP

**Types de requêtes HTTP**

```javascript
import http from 'k6/http';

export default function () {
  // GET
  const getRes = http.get('https://httpbin.org/get');
  
  // POST avec JSON
  const payload = JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const postRes = http.post('https://httpbin.org/post', payload, params);
  
  // PUT
  http.put('https://httpbin.org/put', payload, params);
  
  // DELETE
  http.del('https://httpbin.org/delete');
  
  // PATCH
  http.patch('https://httpbin.org/patch', payload, params);
}
```


---



## 2.2 Création de Requêtes HTTP

**Requêtes batch (parallèles)**

- `http.batch()` : méthode k6 qui exécute plusieurs requêtes HTTP simultanément
- Plus efficace que de les faire séquentiellement
- Retourne un tableau de réponses

```javascript
import http from 'k6/http';

export default function () {
  const responses = http.batch([
    ['GET', 'https://httpbin.org/get'],
    ['POST', 'https://httpbin.org/post', JSON.stringify({ test: 'data' })],
    ['GET', 'https://httpbin.org/delay/1'],
  ]);
  
  // Accéder aux réponses
  console.log(responses[0].status); // 200
}
```


---


## 2.2 Création de Requêtes HTTP

**Exercice pratique**

**Objectif :** Créer un script avec différentes requêtes HTTP
- Créer un test qui utilise l'API JSONPlaceholder
- Implémenter GET /posts, POST /posts, PUT /posts/1, DELETE /posts/1
- Mesurer le temps de réponse de chaque type de requête


---


## 2.3 Checks, Thresholds & Gestion d'Erreurs
**Checks : Validations sans échec**

- Validations qui n'arrêtent pas le test (mesurent le taux de succès)
- Pour valider la logique métier (données correctes, format JSON, etc.)


```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://httpbin.org/get');
  
  check(res, {
    'status est 200': (r) => r.status === 200,
    'temps de réponse < 500ms': (r) => r.timings.duration < 500,
    'body contient origin': (r) => r.body.includes('origin'),
    'header content-type est JSON': (r) => 
      r.headers['Content-Type'].includes('application/json'),
  });
}
```


---


## 2.3 Checks, Thresholds & Gestion d'Erreurs

**Thresholds : Validations sans échec**

- Critères qui déterminent si le test passe ou échoue
- Pour définir des SLA de performance (temps max, taux d'erreur acceptable, etc.)
- Définit les limites acceptables de performance
- Permet l'intégration CI/CD (exit code 1 si échec)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
    ... 
    thresholds: {
        // Le test ÉCHOUE si ces conditions ne sont pas remplies :
        'http_req_duration': ['p(95)<500'],      // 95% des requêtes < 500ms
        'http_req_duration': ['avg<300'],        // Temps moyen < 300ms
        'http_req_failed': ['rate<0.05'],        // Moins de 5% d'erreurs
        'http_reqs': ['rate>10'],                // Au moins 10 requêtes/seconde
    },
};

export default function () {
  const res = http.get('https://httpbin.org/get');
}
```




---


## 2.3 Checks et Gestion d'Erreurs

**1. Vérifier le status HTTP avec check()**

- Continue le test même si ça échoue

```javascript
check(response, {
  'Status est 200': (r) => r.status === 200,
});
```


---



## 2.3 Checks et Gestion d'Erreurs

**2. Gérer les timeouts**

```javascript
http.get(url, { timeout: '5s' });
if (response.status === 0) {
  // Erreur réseau ou timeout
}
```


---



## 2.3 Checks et Gestion d'Erreurs

**3. Parser le JSON avec try-catch**

```javascript
try {
  const data = JSON.parse(response.body);
} catch (error) {
  console.error('Erreur parsing JSON');
}
```


---



## 2.3 Checks et Gestion d'Erreurs

**4. Arrêter le test avec `fail()`**

- Arrête immédiatement le VU

```javascript
if (response.status === 0) {
  fail('Service indisponible - Arrêt');
}
```


---



## 2.3 Checks et Gestion d'Erreurs

**5. Catégoriser les erreurs**

```javascript
if (response.status >= 500) {
  // Erreur serveur
} else if (response.status >= 400) {
  // Erreur client
}
```



---


## 2.3 Checks et Gestion d'Erreurs

**6. Retry automatique**

```javascript
for (let i = 0; i < 3; i++) {
  response = http.get(url);
  if (response.status === 200) break;
  sleep(2);
}
```


---


**Exercice pratique**

**Objectif :** Implémenter des checks robustes
- Ajouter des checks sur status, temps de réponse, et contenu
- Tester avec des endpoints qui retournent différents codes HTTP
- Observer le taux de succès des checks


---

# Fondamentaux et Scripting
## Module 3 : Structuration et Organisation

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 3.1 Groupes et Organisation 
**Avantages des groupes**

- Organiser logiquement les tests (thresholds spécifiques...)
- Mesures séparées par groupe
- Facilite l'analyse des résultats (metrics...)
- Meilleure lisibilité & analyse par catégorie


```javascript
import http from 'k6/http';
import { group, check } from 'k6';

export default function () {
  group('Page d\'accueil', function () {
    const res = http.get('https://test.k6.io');
    check(res, { 'status 200': (r) => r.status === 200 });
  });
  
  group('API Utilisateurs', function () {
    group('Liste', function () {
      http.get('https://test.k6.io/contacts.php');
    });
    
    group('Détail', function () {
      http.get('https://test.k6.io/contacts.php?id=1');
    });
  });
}
```




---


### 3.2 Options de Configuration

**Options principales**

```javascript
export const options = {
  // Utilisateurs virtuels et durée
  vus: 10,
  duration: '30s',
  
  // Itérations
  iterations: 100,
  
  // Seuils (thresholds)
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes < 500ms
    http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs
  },
  
  // Tags
  tags: {
    environment: 'staging',
    team: 'backend',
  },
  
  // No Connection Reuse
  noConnectionReuse: false,
  
  // User Agent
  userAgent: 'K6TestAgent/1.0',
  
  // Max Redirects
  maxRedirects: 4,
  
  // Batch
  batch: 10,
  batchPerHost: 6,
};
```

---


## 3.3 Gestion des Cookies et Sessions

**Cookies automatiques**

```javascript
import http from 'k6/http';

export default function () {
  // K6 gère automatiquement les cookies entre requêtes
  const loginRes = http.post('https://httpbin.org/cookies/set?session=abc123');
  const protectedRes = http.get('https://httpbin.org/cookies');
  
  console.log(protectedRes.body); // Contient le cookie session
}
```

**Gestion manuelle des cookies**

```javascript
import http from 'k6/http';

export default function () {
  const jar = http.cookieJar();
  
  // Définir un cookie
  jar.set('https://httpbin.org/cookies', 'my_cookie', 'my_value');
  
  // Récupérer les cookies
  const cookies = jar.cookiesForURL('https://httpbin.org/cookies');
  console.log(cookies);
}
```

---


## 3.3 Gestion des Cookies et Sessions

**Exercice pratique**

**Objectif :** Créer un scénario d'authentification
- Implémenter une connexion qui retourne un token/cookie
- Utiliser ce token pour des requêtes authentifiées
- Grouper les actions par fonctionnalité
- Ajouter des checks appropriés


---

# Fondamentaux et Scripting
## Module 4 : Paramètres et Dynamisme

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 4.1 Outils Divers

**Récupérer des informations contenue dans une requête**

```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  // Extraction depuis JSON
  const res = http.get('https://httpbin.org/json');
  const data = res.json();
  const slideshow = data.slideshow.author;
  console.log(`Auteur: ${slideshow}`);
  
  // Extraction depuis headers
  const locationHeader = res.headers['Location'];
  
  // Extraction avec regex
  const body = res.body;
  const tokenMatch = body.match(/token":"([^"]+)"/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    console.log(`Token extrait: ${token}`);
  }
}
```

---


## 4.1 Outils Divers

**Chaînage de requêtes**

```javascript
export default function () {
  // 1. Créer une ressource
  const createRes = http.post('https://httpbin.org/post', 
    JSON.stringify({ name: 'Test' })
  );
  const createdId = createRes.json().id;
  
  // 2. Récupérer la ressource créée
  const getRes = http.get(`https://httpbin.org/get?id=${createdId}`);
  
  // 3. Mettre à jour
  http.put(`https://httpbin.org/put?id=${createdId}`, 
    JSON.stringify({ name: 'Updated' })
  );
}
```


---


## 4.2 Données Externes

**Utilisation de fichiers CSV**

```javascript
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import papaparse from 'papaparse';

const csvData = new SharedArray('users', function () {
  return papaparse.parse(open('./users.csv'), { header: true }).data;
});

export default function () {
  const user = csvData[Math.floor(Math.random() * csvData.length)];
  
  const payload = JSON.stringify({
    username: user.username,
    email: user.email,
  });
  
  http.post('https://httpbin.org/post', payload);
}
```

Fichier `users.csv` :
```csv
username,email
user1,user1@example.com
user2,user2@example.com
user3,user3@example.com
```


---


## 4.2 Données Externes

**Utilisation de fichiers JSON**

```javascript
import { SharedArray } from 'k6/data';
import http from 'k6/http';

const data = new SharedArray('products', function () {
  return JSON.parse(open('./products.json'));
});

export default function () {
  const product = data[__VU % data.length];
  http.get(`https://api.example.com/products/${product.id}`);
}
```

Fichier `products.json` :
```json
[
  {
    "id": 1,
    "name": "Laptop"
  },
  {
    "id": 2,
    "name": "Smartphone"
  },...
]
```


---


## 4.2 Données Externes

Le **SharedArray** dans k6 est une structure de données spéciale qui permet de partager des données en lecture seule entre tous les VUs (Virtual Users) de manière mémoire-efficiente.

- Le fichier JSON n'est lu et parsé qu'une seule fois au début du test (read-only)
- Les données sont stockées dans une zone mémoire partagée (évite la duplication des données en mémoire)
- Tous les VUs accèdent aux mêmes données sans duplication

```js
const data = new SharedArray('products', function () {
  return JSON.parse(open('./products.json'));
});
```

</br></br>

**Exemple concret**  
Avec 100 VUs et un fichier de 1 000 produits :

- Sans SharedArray : 100 copies × 1 000 produits = 100 000 objets en mémoire
- Avec SharedArray : 1 copie × 1 000 produits = 1 000 objets en mémoire


---


## 4.2 Données Externes

**Variables d'environnement**

```javascript
import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';
const API_KEY = __ENV.API_KEY || 'default-key';

export default function () {
  http.get(`${BASE_URL}/api`, {
    headers: { 'X-API-Key': API_KEY },
  });
}
```

Exécution :
```bash
k6 run -e BASE_URL=https://staging.example.com -e API_KEY=secret123 script.js
```


---


## 4.2  Données Externes

**Exercice pratique**

**Objectif :** Créer un test avec données dynamiques
- Créer un fichier CSV avec des utilisateurs de test
- Implémenter un script qui utilise ces données
- Extraire un token de la réponse de login
- Utiliser ce token pour des requêtes suivantes



---


## 4.3 Théorie et Introduction : K6 Browser
**K6 browser** est une extension de Grafana k6 qui permet de réaliser des tests de charge basés sur un navigateur réel, en simulant le comportement d’un utilisateur humain dans un vrai navigateur Chromium embarqué.

C’est une évolution majeure par rapport au **k6 "classique"**, qui ne teste que la charge HTTP au niveau protocolaire (sans navigateur, donc sans rendu DOM, JS, CSS, etc.).

</br></br>

**Cas d'usage**
- Basé sur Playwright/Chromium
- Tester des flux utilisateurs complets
- Applications Single Page (React, Vue, Angular)
- Tests de bout en bout avec charge
- Complément aux tests API


---


## 4.3 Théorie et Introduction : K6 Browser 

| Caractéristique     | k6 “classique”                      | k6 browser                                           |
| ------------------- | ----------------------------------- | ---------------------------------------------------- |
| Type de test        | Backend / API                       | Frontend (navigateur)                                |
| Niveau de test      | Protocolaire HTTP                   | Réel (navigateur complet)                            |
| Rendu graphique     | ❌ Non                               | ✅ Oui (Chromium embarqué)                            |
| Scénarios possibles | Appels API, endpoints REST, GraphQL | Navigation web, clics, formulaires, interactions DOM |
| Mesures collectées  | Latence, taux d’erreur, throughput  | TTFB, LCP, FCP, DOMContentLoaded, layout shifts...   |



---


## 4.3 Théorie et Introduction : K6 Browser

**Script de base K6 Browser**

```javascript
import { browser } from 'k6/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    browser: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();
  
  try {
    await page.goto('https://test.k6.io');
    
    await page.locator('input[name="login"]').type('admin');
    await page.locator('input[name="password"]').type('123');
    
    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type="submit"]').click(),
    ]);
    
    check(page, {
      'header': page.locator('h2').textContent() == 'Welcome, admin!',
    });
  } finally {
    page.close();
  }
}
```


---

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

#### Modèles fermés vs ouverts

**Modèle fermé**
- Nombre fixe d'utilisateurs
- Chaque VU attend la fin de la requête avant la suivante
- Simule des utilisateurs réels avec think time
- Executor : `constant-vus`, `ramping-vus`

```javascript
export const options = {
  scenarios: {
    closed_model: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
  },
};
```

---


## 5.1 Utilisateurs Virtuels et Modèles de Charge
#### Modèles fermés vs ouverts

**Modèle ouvert**
- Taux d'arrivée fixe (RPS)
- Nouveaux utilisateurs arrivent indépendamment
- Simule un flux constant de requêtes
- Executor : `constant-arrival-rate`, `ramping-arrival-rate`

```javascript
export const options = {
  scenarios: {
    open_model: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 itérations par seconde
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};
```


---


## 5.1 Utilisateurs Virtuels et Modèles de Charge
#### Modèles fermés vs ouverts



![grafana k6 open-vs-closed-models](./img/open-vs-closed-models.png)

---


## 5.1 Utilisateurs Virtuels et Modèles de Charge

Les Executors dans k6 sont des moteurs d'exécution qui définissent comment et quand les VUs (Virtual Users) exécutent les itérations de test.

Ils déterminent le pattern de charge de votre test :  
- Combien de VUs sont actives
- Quand elles démarrent/arrêtent
- Comment la charge évolue dans le temps

</br></br>

**Choix de l'Executor**

|Besoin|	Executor Recommandé|
|---|---|
|Charge| stable	constant-vus|
|Montée progressive|	ramping-vus|
Débit constant de requêtes|	constant-arrival-rate|
Débit variable de requêtes|	ramping-arrival-rate|
Nombre total d'itérations|	shared-iterations|
Itérations par VU|	per-vu-iterations|
Contrôle externe|	externally-controlled|

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



---

---
# Pause
<!-- .slide: class="center" -->
<!-- .slide: data-background="#434eefff" -->
---
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


---

# Pause
<!-- .slide: class="center" -->
<!-- .slide: data-background="#434eefff" -->
---
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

---

# Pause

<!-- .slide: class="center" -->
<!-- .slide: data-background="#434eefff" -->

---
# Fondamentaux et Scripting
## Module 8 : Résultats et Grafana
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 8.1 Formats de Sortie

**Sortie console par défaut**
```bash
k6 run script.js
```

**Export JSON**
```bash
k6 run --out json=results.json script.js
```

**Export CSV**
```bash
k6 run --out csv=results.csv script.js
```



---


## 8.2  K6 Web Dashboards TODO


---


## 8.2  Installation et Configuration Grafana TODO

**Installation avec Docker Compose**

Créer `docker-compose.yml` :
```yaml
version: '3.8'

services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6
      - INFLUXDB_ADMIN_USER=admin
      - INFLUXDB_ADMIN_PASSWORD=admin
    volumes:
      - influxdb-data:/var/lib/influxdb

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - influxdb

volumes:
  influxdb-data:
  grafana-data:
```

Lancer :
```bash
docker-compose up -d
```

---


## 8.2  Installation et Configuration Grafana TODO

**Configuration de la datasource InfluxDB dans Grafana**

1. Accéder à Grafana : http://localhost:3000
2. Configuration > Data Sources > Add data source
3. Sélectionner InfluxDB
4. Configurer :
   - URL: http://influxdb:8086
   - Database: k6
   - User: admin
   - Password: admin

**Import du dashboard K6**

1. Dashboards > Import
2. ID : 2587 (Dashboard K6 Load Testing Results)
3. Sélectionner la datasource InfluxDB

**Lancer un test avec export InfluxDB**

```bash
k6 run --out influxdb=http://localhost:8086/k6 script.js
```


---


## 8.2 Grafana - Metrics

k6	Prometheus	Name label
Counter	Counter	k6_*_total
Gauge	Gauge	k6_*_<unit-suffix>
Rate	Gauge	k6_*_rate
Trend	Counter and Gauges (default) or Native Histogram	k6_*_<unit-suffix>



---


## 8.2  Installation et Configuration Grafana

**Exercice pratique**

**Objectif :** Visualiser un test en temps réel
- Lancer un test de 5 minutes avec rampe
- Observer en temps réel dans Grafana
- Identifier les métriques clés
- Créer des annotations pour marquer des événements


---


## 8.3  Génération et Analyse de Rapports

**Rapport HTML avec k6-reporter**

Installation :
```bash
npm install -g k6-html-reporter
```

Script avec summary :
```javascript
import http from 'k6/http';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export default function () {
  http.get('https://test.k6.io');
}

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    "summary.json": JSON.stringify(data),
  };
}
```


---


## 8.3  Génération et Analyse de Rapports

**Custom Summary**

```javascript
export function handleSummary(data) {
  // Summary personnalisé en console
  console.log('Test terminé !');
  console.log(`Requêtes totales: ${data.metrics.http_reqs.values.count}`);
  console.log(`Durée P95: ${data.metrics.http_req_duration.values['p(95)']} ms`);
  console.log(`Taux d'erreur: ${data.metrics.http_req_failed.values.rate * 100}%`);
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}
```

---


## 8.3  Génération et Analyse de Rapports

**Analyse des métriques importantes**

**Latence :**
- P50 (médiane) : Expérience typique
- P95 : 95% des utilisateurs
- P99 : Cas extrêmes
- Max : Pire cas

**Throughput :**
- http_reqs rate : Requêtes par seconde
- data_received : Données reçues
- data_sent : Données envoyées

**Erreurs :**
- http_req_failed rate : Taux d'échec
- Checks passed rate : Validations réussies


---


## 8.3  Génération et Analyse de Rapports

**Exercice pratique**

**Objectif :** Analyser un rapport de test
- Exécuter un test de stress complet
- Générer un rapport HTML
- Identifier dans le rapport :
  - Le point de rupture
  - Les métriques qui se dégradent en premier
  - Le comportement des erreurs
  - Les recommandations d'optimisation


---

# Pause 
<!-- .slide: class="center" -->
<!-- .slide: data-background="#434eefff" -->
---
# Fondamentaux et Scripting
## Module 9 : Projet Final Pratique
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Projet : Test Complet d'une Application E-commerce

**Contexte**

Vous devez tester une application e-commerce avant un événement Black Friday prévu dans 2 semaines. L'entreprise attend :
- 10 000 utilisateurs simultanés au pic
- 500 commandes par minute
- Temps de réponse < 2s pour 95% des utilisateurs

</br></br>

**Objectifs du projet**

1. Créer plusieurs scénarios utilisateurs
2. Implémenter différents types de tests
3. Définir des thresholds basés sur les SLA
4. Utiliser des données externes
5. Générer des rapports détaillés
6. Visualiser dans Grafana

---


## Projet : Test Complet d'une Application E-commerce

#### Scénarios à implémenter

**Scénario 1 : Navigation (60% des utilisateurs)**
- Accéder à la page d'accueil
- Rechercher des produits
- Consulter 3-5 pages produits
- Think time : 2-5 secondes


---


## Projet : Test Complet d'une Application E-commerce
#### Scénarios à implémenter
**Scénario 2 : Achat (30% des utilisateurs)**
- Parcourir des produits
- Ajouter au panier
- Aller au checkout
- Remplir les informations
- Valider le paiement
- Think time : 1-3 secondes


---


## Projet : Test Complet d'une Application E-commerce
#### Scénarios à implémenter
**Scénario 3 : Compte utilisateur (10% des utilisateurs)**
- Se connecter
- Consulter l'historique
- Modifier le profil
- Se déconnecter


---


## Projet : Test Complet d'une Application E-commerce
#### Types de tests à effectuer
1. **Test nominal :** Charge quotidienne moyenne (1000 VUs)
2. **Test de stress :** Monter progressivement jusqu'à 10 000 VUs
3. **Test de pic :** Simuler le début des soldes (pic instantané)

</br></br>

#### Livrables attendus
- Scripts K6 organisés et commentés
- Fichiers de données (CSV/JSON)
- Configuration Grafana
- Rapports HTML générés
- Document d'analyse avec recommandations

---


## Projet : Test Complet d'une Application E-commerce
#### Structure de fichiers suggérée
```
project/
├── config/
│   ├── environments.js
│   └── thresholds.js
├── data/
│   ├── users.csv
│   └── products.json
├── scenarios/
│   ├── browse.js
│   ├── purchase.js
│   └── account.js
├── tests/
│   ├── nominal-load.js
│   ├── stress.js
│   └── spike.js
├── utils/
│   ├── helpers.js
│   └── checks.js
└── results/
    ├── reports/
    └── logs/
```

#### Critères d'évaluation
- ✅ Complétude des scénarios
- ✅ Pertinence des thresholds
- ✅ Qualité du code (lisibilité, réutilisabilité)
- ✅ Utilisation de données externes
- ✅ Visualisation Grafana configurée
- ✅ Analyse et recommandations



---


## Ressources Complémentaires
**Documentation officielle :**
- https://k6.io/docs/
- https://grafana.com/docs/k6/latest/

**Community :**
- Forum K6 : https://community.grafana.com/c/grafana-k6/
- GitHub : https://github.com/grafana/k6
- Slack : https://k6.io/slack

**Extensions K6 :**
- https://k6.io/docs/extensions/
- k6-operator (Kubernetes)
- xk6-browser
- xk6-sql
- xk6-kafka

**Exemples de scripts :**
- https://github.com/grafana/k6-learn
- https://k6.io/docs/examples/



---



## Ressources Complémentaires
**Certification et Suite**
- K6 n'a pas de certification officielle
- Pratiquer avec des projets réels
- Contribuer à la communauté
- Explorer les extensions

**Questions / Réponses**
- Session ouverte pour questions
- Échange d'expériences
- Conseils pour démarrer dans votre contexte


---


## Annexes
#### A. Commandes K6 Utiles

```bash
# Exécution basique
k6 run script.js

# Avec paramètres
k6 run --vus 10 --duration 30s script.js

# Variables d'environnement
k6 run -e BASE_URL=https://prod.example.com script.js

# Output vers plusieurs destinations
k6 run --out json=results.json --out influxdb=http://localhost:8086/k6 script.js

# Mode cloud
k6 cloud script.js

# Inspection sans exécution
k6 inspect script.js

# Archives (bundle)
k6 archive script.js
k6 run archive.tar

# Pause/Resume
k6 run --paused script.js
# Dans un autre terminal : k6 resume
```

---


## Annexes
#### B. Checklist de Test

**Avant le test :**
- [ ] Environnement de test isolé
- [ ] Données de test préparées
- [ ] Monitoring en place (Grafana, logs)
- [ ] Notifications configurées
- [ ] Backup de données si nécessaire
- [ ] Communication aux équipes


---


## Annexes
#### B. Checklist de Test

**Pendant le test :**
- [ ] Surveillance en temps réel
- [ ] Vérification des métriques système
- [ ] Logs d'erreurs
- [ ] Note des événements inhabituels


---


## Annexes
#### B. Checklist de Test

**Après le test :**
- [ ] Génération des rapports
- [ ] Analyse des résultats
- [ ] Identification des goulots
- [ ] Recommandations
- [ ] Documentation
- [ ] Partage avec les équipes


---


## Annexes
#### C. Troubleshooting Commun

**Problème : "context deadline exceeded"**
- Solution : Augmenter les timeouts dans options

**Problème : Trop de VUs, pas assez de ressources**
- Solution : Distribuer la charge (k6 cloud ou plusieurs machines)

**Problème : Résultats incohérents**
- Solution : Vérifier la stabilité de l'environnement de test, refaire plusieurs runs

**Problème : Connexions refusées**
- Solution : Augmenter les limites système (ulimit), vérifier les connexions max du serveur

**Problème : Métriques manquantes dans Grafana**
- Solution : Vérifier la connexion InfluxDB, le nom de la database, les timestamps


---


## Annexes
#### D. Bonnes Pratiques

**Organisation du code :**
- Séparer la configuration du code
- Utiliser des modules réutilisables
- Commenter le code complexe
- Versionner les scripts (Git)

**Performance des scripts :**
- Limiter les logs en production
- Utiliser SharedArray pour données partagées
- Éviter les opérations lourdes dans VU context
- Batch les requêtes quand possible



---


## Annexes
#### D. Bonnes Pratiques

**Sécurité :**
- Ne jamais commiter de credentials
- Utiliser des variables d'environnement
- Masquer les données sensibles dans les logs
- Respecter les politiques de test

**Interprétation des résultats :**
- Toujours comparer avec une baseline
- Tester plusieurs fois pour confirmer
- Considérer les conditions réseau
- Analyser les logs applicatifs en parallèle


---


## Annexes
#### E. **Glossaire**

- **VU (Virtual User) :** Instance d'exécution d'un script
- **Iteration :** Une exécution complète de la fonction default
- **RPS (Requests Per Second) :** Requêtes par seconde
- **Throughput :** Débit, volume de données traitées
- **Latency :** Temps de réponse
- **P95/P99 :** 95e/99e percentile
- **TTFB (Time To First Byte) :** Temps jusqu'au premier octet
- **Check :** Validation qui n'arrête pas le test
- **Threshold :** Critère de succès/échec du test
- **Executor :** Modèle d'exécution du test
- **Scenario :** Configuration d'exécution avec executor
- **Stage :** Phase d'un test avec rampe
- **Think Time :** Pause simulant la réflexion utilisateur
- **Graceful Stop :** Arrêt propre permettant de finir les itérations en cours


