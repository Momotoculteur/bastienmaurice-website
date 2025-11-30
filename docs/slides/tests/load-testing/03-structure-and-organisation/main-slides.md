# Fondamentaux et Scripting
## Module 3 : Structuration et Organisation

<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## 3.1 Groupes et Organisation 
**Avantages des groupes**

**Rôle Principal**   

- Structurer le Test : Organise le script de charge en étapes logiques ou scénarios utilisateur (ex: Connexion, Ajouter au panier).
- Lisibilité : Rend les scripts longs faciles à lire et à maintenir.
- Utile pour : Connaître la performance de l'expérience utilisateur complète (plus pertinent qu'une seule requête HTTP).
- Tagging Automatique : Applique un tag group (avec le nom du groupe) à toutes les métriques (requêtes, vérifications) générées à l'intérieur. Permet de filtrer, agréger et visualiser les résultats dans Grafana par fonctionnalité ou étape.

```javascript
import { group, check } from 'k6';
import http from 'k6/http';

export default function () {
    group('01_Visiter la Page d\'Accueil', function () {
        const res = http.get('https://example.com/');
        check(res, { 'status est 200': (r) => r.status === 200 });
        // La durée de cette requête est incluse dans 'group_duration{"group":"01_Visiter la Page d'Accueil"}'
    });

    group('02_Processus d\'Achat', function () {
        // Un groupe peut contenir d'autres groupes (imbrication)
        group('02a_Ajouter au Panier', function () {
            // Requêtes et vérifications liées à l'ajout
        });
        group('02b_Procéder au Paiement', function () {
            // Requêtes et vérifications liées au paiement
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

Aucun besoin de base d'écrire de code spécifique pour gérer les cookies, car le module http les gère lui-même (il maintient un cookie jar pour chaque utilisateur virtuel - VU)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
    // Première requête : le serveur définit un cookie
    const res = http.get('https://example.com/login');

    check(res, {
        'statut 200': (r) => r.status === 200,
        'le cookie de session est défini': (r) => r.headers['Set-Cookie'] !== undefined,
    });

    const jar = http.cookieJar();
    // jar.cookiesForURL() retourne un objet : { nom_cookie: ['valeur1', 'valeur2'] }
    const sessionCookies = jar.cookiesForURL(res.url);
    const sessionID = sessionCookies['session_id'] ? sessionCookies['session_id'][0] : 'non trouvé';

    console.log(`ID de session récupéré : ${sessionID}`);
}
```

*Cet ID sera automatiquement envoyée dans les requêtes suivantes vers le même domaine*



---


## 3.3 Gestion des Cookies et Sessions

**Gestion manuelle des cookies**

```javascript
import http from 'k6/http';

export default function () {
    const jar = http.cookieJar();
    const targetURL = 'https://example.com/profil';

    // jar.set(url, name, value, options)
    jar.set(targetURL, 'user_pref_theme', 'dark', {
        domain: 'example.com',
        path: '/',
        secure: true,
        max_age: 3600, // Expiration en secondes
    });

    // La requête suivante vers 'targetURL' inclura automatiquement ce cookie dans l'en-tête 'Cookie'.
    const res = http.get(targetURL);

    console.log(`Cookie 'user_pref_theme=dark' a été envoyé.`);
}
```


---


## 3.3 Gestion des Cookies et Sessions

**Gestion manuelle des cookies - requête individuelle**

```js
import http from 'k6/http';

export default function () {
    // Le cookie est envoyé uniquement dans cette requête, et non enregistré pour les suivantes.
    const res = http.get('https://example.com/page', {
        cookies: {
            'user_pref_theme': 'dark'
        }
    });
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

