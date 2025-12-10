# TP Noté : Analyse de qualité de code avec SonarQube

---

## Informations pratiques

- **Type :** Travail individuel ou Groupe
- **Notation :** /20
- **Rendu :** Rapport PDF + fichiers de configuration + captures d'écran + lien GitLab
- **Date limite :** 1 semaine

---

## Contexte du TP

Vous êtes développeur dans une équipe qui souhaite améliorer la qualité et la sécurité de son code. La direction technique a décidé d'adopter SonarQube pour détecter automatiquement les bugs, vulnérabilités et code smells. 

Votre mission est de mettre en place SonarQube selon trois approches : SaaS (SonarCloud), puis Self-hosted, et enfin avec des Quality Gates personnalisés.

---

## Prérequis techniques

Avant de commencer, vérifiez que vous disposez de :

- Git et un compte GitLab (gitlab.com ou instance self-hosted)
- Docker et Docker Compose
- Un langage de programmation au choix (Python, Java, JavaScript, etc.)
- Compte SonarCloud (gratuit pour projets publics)
- Connaissances de base en CI/CD GitLab

---

## Partie 1 : Configuration de base avec SonarCloud (6 points)

### Contexte
Vous devez d'abord tester SonarQube en mode SaaS via SonarCloud pour analyser rapidement un projet sans infrastructure à gérer.

### Question 1.1 : Préparation du projet (1 point)

**Tâche :**
Créez ou choisissez un projet existant avec les caractéristiques suivantes :

- Un dépôt GitLab (public ou privé)
- Au moins 200 lignes de code
- Contient des fichiers sources dans un langage supporté (Python, Java, JavaScript, TypeScript, etc.)
- Possède un fichier README.md décrivant le projet

Si vous n'avez pas de projet, créez une application simple :

- **Option Python** : API REST avec Flask/FastAPI
- **Option JavaScript** : Application React ou Node.js
- **Option Java** : Application Spring Boot basique

**Questions à répondre :**

1. Quel langage de programmation avez-vous choisi et pourquoi ?
2. Décrivez brièvement votre projet (fonctionnalités, architecture)
3. Combien de lignes de code contient votre projet actuellement ?

**À fournir :**

- Lien vers votre dépôt GitLab
- Capture d'écran de la structure de votre projet
- Extrait du README.md
- Statistiques du projet (nombre de fichiers, lignes de code)

---

### Question 1.2 : Configuration de SonarCloud (2 points)

**Tâche :**

1. Créez un compte sur SonarCloud (https://sonarcloud.io)
2. Connectez SonarCloud à votre compte GitLab
3. Importez votre projet dans SonarCloud
4. Récupérez votre token d'authentification SonarCloud
5. Notez l'organization key et le project key générés

**Questions à répondre :**

1. Quelles permissions SonarCloud demande-t-il lors de la connexion à GitLab ?
2. Quelle est la différence entre "organization key" et "project key" dans SonarCloud ?
3. SonarCloud détecte-t-il automatiquement le langage de votre projet ? Comment ?
4. Pourquoi ne doit-on jamais commiter le token SonarCloud dans Git ?
5. Comparez SonarCloud et SonarQube : quels sont les avantages et limitations de la version SaaS ?

**À fournir :**

- Captures d'écran du processus de configuration sur SonarCloud
- Capture d'écran de la page du projet créé
- Votre organization key et project key (masquez partiellement si sensible)
- Capture d'écran montrant les langages détectés

---

### Question 1.3 : Intégration avec GitLab CI/CD (2 points)

**Tâche :**
Créez un fichier `.gitlab-ci.yml` pour automatiser l'analyse SonarQube à chaque push.

Votre pipeline doit contenir au minimum :

- Un stage `test` ou `quality`
- Un job qui exécute l'analyse SonarQube
- Utilisation de variables CI/CD pour stocker le token
- Cache approprié pour optimiser les analyses

**Example GitlabCI:** 

```yaml
sonarqube-check:
  stage: test
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
    GIT_DEPTH: "0"
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner # A compléter
  only:
    - main
    - merge_requests
```


Créez également un fichier `sonar-project.properties` :

```properties
sonar.projectKey=VOTRE_PROJECT_KEY
sonar.organization=VOTRE_ORG_KEY
sonar.host.url=https://sonarcloud.io
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/venv/**,**/*.test.js
```

**Questions à répondre :**

1. Que signifie `GIT_DEPTH: "0"` et pourquoi est-ce important pour SonarQube ?
2. Expliquez l'utilité du cache dans ce contexte
3. Pourquoi limiter l'analyse aux branches `main` et `merge_requests` ?
4. Que se passe-t-il si le token SonarCloud est invalide ou expiré ?
5. Comment sécurisez-vous le token dans GitLab CI/CD ?

**À fournir :**

- Contenu complet de votre `.gitlab-ci.yml`
- Contenu de votre `sonar-project.properties`
- Capture d'écran des variables CI/CD configurées dans GitLab (masquez les valeurs sensibles)
- Capture d'écran de la pipeline GitLab en cours d'exécution
- Logs pertinents du job SonarQube

---

### Question 1.4 : Analyse des résultats (1 point)

**Tâche :**
Consultez les résultats de l'analyse dans SonarCloud.

**Questions à répondre :**

1. Combien de bugs, vulnérabilités et code smells ont été détectés ?
2. Quelle est la couverture de code actuelle de votre projet ?
3. Quel est le taux de duplication de code ?
4. Quel est le "Maintainability Rating" (A, B, C, D, E) ?
5. Quelle est la "dette technique" estimée (en temps) ?
6. Identifiez et expliquez les 3 problèmes les plus critiques détectés

**À fournir :**

- Capture d'écran du dashboard SonarCloud complet
- Captures d'écran des différentes sections (Bugs, Vulnerabilities, Code Smells, Coverage, Duplications)
- Tableau récapitulatif des métriques principales
- Analyse détaillée des 3 problèmes les plus critiques avec votre compréhension

---

## Partie 2 : Détection et correction de vulnérabilités (6 points)

### Contexte
Pour tester l'efficacité de SonarQube, vous allez volontairement introduire des vulnérabilités de sécurité courantes dans votre code, puis les corriger en suivant les recommandations.

### Question 2.1 : Injection de vulnérabilités (2 points)

**Tâche :**
Ajoutez **au minimum 5 vulnérabilités différentes** dans votre code. Inspirez-vous des exemples ci-dessous selon votre langage :

**Python - Exemples de vulnérabilités à injecter :**

```python
# 1. Injection SQL (CWE-89)
def get_user_unsafe(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)  # VULNÉRABLE !
    return cursor.fetchone()

# 2. Utilisation de eval() (CWE-95)
def calculate_unsafe(expression):
    result = eval(expression)  # VULNÉRABLE !
    return result

# 3. Mot de passe en dur (CWE-798)
DB_PASSWORD = "admin123"  # VULNÉRABLE !
connection = connect(host="localhost", password=DB_PASSWORD)

# 4. Désérialisation non sécurisée (CWE-502)
import pickle
def load_data_unsafe(data):
    return pickle.loads(data)  # VULNÉRABLE !

# 5. Génération de nombres aléatoires faible (CWE-330)
import random
token = random.randint(1000, 9999)  # VULNÉRABLE pour sécurité !

# 6. Path traversal (CWE-22)
def read_file_unsafe(filename):
    with open(f"/data/{filename}") as f:  # VULNÉRABLE !
        return f.read()

# 7. Commande système non sécurisée (CWE-78)
import os
def execute_command_unsafe(cmd):
    os.system(cmd)  # VULNÉRABLE !
```

**JavaScript/Node.js - Exemples :**

```javascript
// 1. Injection SQL
function getUserUnsafe(username) {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  db.query(query);  // VULNÉRABLE !
}

// 2. eval() usage
function calculateUnsafe(expression) {
  return eval(expression);  // VULNÉRABLE !
}

// 3. Hardcoded credentials
const API_KEY = "sk_live_123456789";  // VULNÉRABLE !

// 4. XSS vulnerability
function renderUnsafe(userInput) {
  document.innerHTML = userInput;  // VULNÉRABLE !
}

// 5. Weak random
function generateToken() {
  return Math.random().toString(36);  // VULNÉRABLE !
}

// 6. Regex DoS
function validateEmail(email) {
  return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);  // VULNÉRABLE !
}

// 7. Unsafe redirect
function redirect(url) {
  window.location = url;  // VULNÉRABLE si url vient de l'utilisateur
}
```

**Java - Exemples :**

```java
// 1. Injection SQL
public User getUserUnsafe(String username) {
    String query = "SELECT * FROM users WHERE username = '" + username + "'";
    return jdbcTemplate.queryForObject(query, User.class);  // VULNÉRABLE !
}

// 2. Hardcoded password
private static final String PASSWORD = "admin123";  // VULNÉRABLE !

// 3. Weak cryptography
public String hashPassword(String password) {
    return DigestUtils.md5Hex(password);  // VULNÉRABLE !
}

// 4. Path traversal
public String readFile(String filename) {
    return new String(Files.readAllBytes(Paths.get("/data/" + filename)));  // VULNÉRABLE !
}

// 5. XML External Entity (XXE)
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
// factory.setFeature(...) manquant - VULNÉRABLE !
DocumentBuilder builder = factory.newDocumentBuilder();
```

**Questions à répondre :**

1. Pour chaque vulnérabilité injectée, expliquez :
   - Le type de vulnérabilité (CWE, OWASP Top 10)
   - Le risque de sécurité associé
   - Un scénario d'attaque possible
2. Pourquoi ces vulnérabilités sont-elles dangereuses en production ?
3. Comment un attaquant pourrait-il exploiter chacune de ces failles ?

**À fournir :**

- Code source complet contenant les vulnérabilités (avec commentaires)
- Tableau récapitulatif de toutes les vulnérabilités injectées
- Scénarios d'exploitation pour chaque vulnérabilité

---

### Question 2.2 : Analyse SonarQube des vulnérabilités (2 points)

**Tâche :**

1. Commitez et pushez le code vulnérable
2. Attendez que la pipeline s'exécute
3. Consultez les résultats dans SonarCloud

**Questions à répondre :**

1. Combien de vulnérabilités SonarQube a-t-il détectées au total ?
2. SonarQube a-t-il détecté TOUTES vos vulnérabilités injectées ? Si non, lesquelles ont été manquées ?
3. Pour chaque vulnérabilité détectée par SonarQube :
   - Quelle est sa sévérité (Blocker, Critical, Major, Minor, Info) ?
   - Quelle est la règle SonarQube violée ?
   - Quelle recommandation SonarQube donne-t-il ?
4. Y a-t-il des faux positifs (problèmes signalés à tort) ?
5. Comparez les vulnérabilités détectées vs non détectées : quelles conclusions en tirez-vous sur les limites de l'analyse statique ?

**À fournir :**
- Capture d'écran du dashboard Security montrant toutes les vulnérabilités
- Captures d'écran détaillées de 3 vulnérabilités (description complète de SonarQube)
- Tableau comparatif : vulnérabilités injectées vs détectées
- Analyse critique des limites de SonarQube

---

### Question 2.3 : Correction des vulnérabilités (2 points)

**Tâche :**
Corrigez TOUTES les vulnérabilités en suivant les bonnes pratiques de sécurité.

**Exemples de corrections :**

**Python - Corrections :**

```python
# 1. Injection SQL CORRIGÉE - Requêtes paramétrées
def get_user_safe(username):
    query = "SELECT * FROM users WHERE username = %s"
    cursor.execute(query, (username,))  # ✅ SÉCURISÉ
    return cursor.fetchone()

# 2. eval() CORRIGÉ - Utiliser ast.literal_eval ou parser sécurisé
import ast
def calculate_safe(expression):
    return ast.literal_eval(expression)  # ✅ SÉCURISÉ (pour expressions simples)

# 3. Mot de passe CORRIGÉ - Variables d'environnement
import os
DB_PASSWORD = os.getenv("DB_PASSWORD")  # ✅ SÉCURISÉ
connection = connect(host="localhost", password=DB_PASSWORD)

# 4. Désérialisation CORRIGÉE - JSON au lieu de pickle
import json
def load_data_safe(data):
    return json.loads(data)  # ✅ SÉCURISÉ

# 5. Random CORRIGÉ - secrets pour cryptographie
import secrets
token = secrets.token_urlsafe(32)  # ✅ SÉCURISÉ

# 6. Path traversal CORRIGÉ - Validation du chemin
from pathlib import Path
def read_file_safe(filename):
    base_path = Path("/data")
    file_path = (base_path / filename).resolve()
    if not file_path.is_relative_to(base_path):
        raise ValueError("Invalid path")
    with open(file_path) as f:  # ✅ SÉCURISÉ
        return f.read()

# 7. Commande système CORRIGÉE - subprocess avec liste
import subprocess
def execute_command_safe(cmd_parts):
    subprocess.run(cmd_parts, check=True)  # ✅ SÉCURISÉ avec liste
```

**JavaScript - Corrections :**

```javascript
// 1. Injection SQL CORRIGÉE
function getUserSafe(username) {
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username]);  // ✅ SÉCURISÉ
}

// 2. eval() CORRIGÉ - Function constructor ou parser sécurisé
function calculateSafe(expression) {
  return new Function('return ' + expression)();  // ✅ Plus sûr (ou éviter totalement)
}

// 3. Credentials CORRIGÉ
const API_KEY = process.env.API_KEY;  // ✅ SÉCURISÉ

// 4. XSS CORRIGÉ
function renderSafe(userInput) {
  const div = document.createElement('div');
  div.textContent = userInput;  // ✅ SÉCURISÉ (échappement automatique)
  container.appendChild(div);
}

// 5. Random CORRIGÉ
const crypto = require('crypto');
function generateToken() {
  return crypto.randomBytes(32).toString('hex');  // ✅ SÉCURISÉ
}

// 6. Regex DoS CORRIGÉ - Regex simplifiée
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);  // ✅ SÉCURISÉ
}

// 7. Redirect CORRIGÉ - Whitelist
function redirect(url) {
  const allowedDomains = ['example.com', 'trusted.com'];
  const urlObj = new URL(url);
  if (allowedDomains.includes(urlObj.hostname)) {
    window.location = url;  // ✅ SÉCURISÉ
  }
}
```

**Questions à répondre :**

1. Pour chaque correction, expliquez la technique de sécurisation utilisée
2. Quelles bibliothèques ou fonctions sécurisées avez-vous utilisées ?
3. Comment validez-vous que vos corrections sont efficaces ?
4. Relancez l'analyse SonarQube : combien de vulnérabilités restent-elles ?
5. Si des vulnérabilités persistent, pourquoi et comment les résoudriez-vous ?

**À fournir :**

- Code source complet après corrections (avec commentaires expliquant chaque correction)
- Capture d'écran du dashboard SonarCloud après corrections
- Comparaison avant/après (nombre de vulnérabilités)
- Capture d'écran de la pipeline GitLab réussie
- Analyse de l'amélioration de la qualité (Security Rating, etc.)

---

## Partie 3 : SonarQube Self-Hosted et Quality Gates personnalisés (8 points)

### Contexte
Le mode SaaS gratuit de SonarCloud ne permet pas de créer des Quality Gates personnalisés. Pour avoir un contrôle total, vous devez déployer SonarQube en self-hosted.

### Question 3.1 : Installation de SonarQube avec Docker Compose (2 points)

**Tâche :**
Déployez SonarQube en local avec Docker Compose incluant :

- SonarQube Community Edition (dernière version)
- PostgreSQL comme base de données
- Configuration des volumes persistants
- Configuration réseau appropriée

**Fichier `docker-compose.yml` à créer :**

```yaml
services:
  sonarqube:
    # A compléter

  postgres:
    # A compléter

volumes:
    # A compléter

network: 
    # A compléter
```

**Questions à répondre :**

1. Pourquoi utiliser PostgreSQL plutôt que la base H2 intégrée ?
2. Expliquez l'utilité de chaque volume monté
3. Quelles sont les ressources système minimales recommandées pour SonarQube ?
4. Comment accédez-vous à l'interface SonarQube une fois démarrée ?
5. Quels sont les identifiants par défaut et comment les changez-vous ?
6. Comment vérifiez-vous que les conteneurs fonctionnent correctement ?

**À fournir :**

- Contenu complet de votre `docker-compose.yml`
- Commandes pour démarrer et vérifier les services
- Capture d'écran de `docker-compose ps`
- Capture d'écran de la page de login SonarQube
- Logs de démarrage pertinents (extraits)

---

### Question 3.2 : Configuration du projet dans SonarQube Self-Hosted (1 point)

**Tâche :**

1. Connectez-vous à SonarQube (http://localhost:9000)
2. Créez un nouveau projet manuellement
3. Générez un token d'authentification
4. Configurez le projet avec les mêmes paramètres que dans la partie 1

**Questions à répondre :**

1. Quelle est la différence entre "Automatic Analysis" et "CI-based Analysis" ?
2. Pourquoi choisir "CI-based Analysis" pour ce TP ?
3. Comment SonarQube local se compare-t-il à SonarCloud en termes de fonctionnalités ?

**À fournir :**

- Capture d'écran de la création du projet
- Capture d'écran du token généré (masqué partiellement)
- Configuration du projet (captures)

---

### Question 3.3 : Exposition de SonarQube via tunnel (2 points)

**Tâche :**
Pour que GitLab CI/CD puisse communiquer avec votre SonarQube local, vous devez l'exposer sur Internet. Choisissez UNE des approches suivantes :

**Option A : Ngrok**
```bash
# Installer ngrok

# Authentification
./ngrok config add-authtoken VOTRE_TOKEN

# Exposer SonarQube
./ngrok http 9000
```

**Option B : Cloudflare Tunnel**
```bash
# Installer cloudflared

# Authentification
cloudflared tunnel login

# Créer et configurer le tunnel
cloudflared tunnel create sonarqube
cloudflared tunnel route dns sonarqube sonar.votredomaine.com
cloudflared tunnel run sonarqube
```

**Option C : Intégration dans Docker Compose**
```yaml
# Ajouter à votre docker-compose.yml
  ngrok:
    image: ngrok/ngrok:latest
    container_name: ngrok-sonar
    command:
      - "http"
      - "sonarqube:9000"
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
    ports:
      - "4040:4040"
    depends_on:
      - sonarqube
```

**Questions à répondre :**

1. Quelle solution avez-vous choisie et pourquoi ?
2. Quelle est l'URL publique de votre SonarQube ?
3. Quels sont les risques de sécurité d'exposer SonarQube publiquement ?
4. Comment sécuriseriez-vous davantage cette exposition (authentification, firewall, etc.) ?
5. En production, quelle architecture recommanderiez-vous pour un SonarQube d'entreprise ?
6. SonarQube peut-il communiquer avec GitLab SaaS sans être exposé publiquement ? Expliquez le sens des communications

**À fournir :**

- Commandes utilisées pour configurer le tunnel
- URL publique obtenue (capture d'écran)
- Capture d'écran montrant que SonarQube est accessible via l'URL publique
- Schéma d'architecture montrant le flux de communication : GitLab CI → Tunnel → SonarQube local

---

### Question 3.4 : Mise à jour de la pipeline GitLab (1 point)

**Tâche :**
Modifiez votre `.gitlab-ci.yml` pour pointer vers votre instance SonarQube self-hosted au lieu de SonarCloud.

**Modifications nécessaires :**

```yaml
sonarqube-selfhosted:
  stage: test
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
    GIT_DEPTH: "0"
    SONAR_HOST_URL: "${SONAR_HOST_URL}"  # URL de votre tunnel
    SONAR_TOKEN: "${SONAR_TOKEN}"        # Token de votre SonarQube local
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
  only:
    - main
    - merge_requests
```

Mettez à jour `sonar-project.properties` :
```properties
sonar.projectKey=mon-projet-local
sonar.sources=.
sonar.host.url=${SONAR_HOST_URL}
sonar.login=${SONAR_TOKEN}
```

**Questions à répondre :**

1. Quelles sont les différences principales entre la configuration SonarCloud et self-hosted ?
2. Comment configurez-vous les variables `SONAR_HOST_URL` et `SONAR_TOKEN` dans GitLab CI ?
3. Que se passe-t-il si le tunnel se ferme pendant l'analyse ?

**À fournir :**

- `.gitlab-ci.yml` mis à jour
- `sonar-project.properties` mis à jour
- Capture d'écran des variables CI/CD configurées
- Capture d'écran de la pipeline en cours d'exécution
- Capture d'écran des résultats dans votre SonarQube local

---

### Question 3.5 : Création d'un Quality Gate personnalisé (2 points)

**Tâche :**
Créez un Quality Gate strict nommé "Production Ready" avec les conditions suivantes :

**Conditions obligatoires :**

- **Vulnérabilités** : 0 Critical ou Blocker sur New Code
- **Bugs** : 0 Critical ou Blocker sur New Code
- **Couverture de code** : Minimum 70% sur New Code
- **Duplication** : Maximum 5% sur New Code
- **Maintainability Rating** : A ou B sur New Code
- **Reliability Rating** : A sur New Code
- **Security Rating** : A sur New Code
- **Code Smells** : Maximum 10 sur New Code

**Étapes :**

1. Dans SonarQube : Quality Gates → Create
2. Configurez toutes les conditions ci-dessus
3. Appliquez ce Quality Gate à votre projet
4. Modifiez la pipeline pour faire échouer le build si le Quality Gate échoue :

```yaml
sonarqube-quality-gate:
  stage: test
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
    GIT_DEPTH: "0"
    SONAR_HOST_URL: "${SONAR_HOST_URL}"
    SONAR_TOKEN: "${SONAR_TOKEN}"
  script:
    - sonar-scanner
    - |
      # Attendre le résultat du Quality Gate
      status="PENDING"
      while [ "$status" = "PENDING" ]; do
        sleep 10
        status=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=mon-projet-local" | jq -r '.projectStatus.status')
      done
      
      echo "Quality Gate Status: $status"
      
      if [ "$status" != "OK" ]; then
        echo "Quality Gate FAILED!"
        exit 1
      fi
  allow_failure: false
  only:
    - main
    - merge_requests
```

**Questions à répondre :**

1. Que signifie "New Code" dans SonarQube et pourquoi est-ce important ?
2. Expliquez chaque condition du Quality Gate et sa pertinence
3. Pourquoi un Quality Gate strict peut-il être problématique ? Proposez des stratégies d'adoption progressive
4. Comment SonarQube différencie-t-il "Overall Code" et "New Code" ?
5. Quelle est la différence entre `allow_failure: true` et `allow_failure: false` ?

**À fournir :**

- Capture d'écran complète de votre Quality Gate personnalisé (toutes les conditions visibles)
- Capture d'écran de l'application du Quality Gate au projet
- `.gitlab-ci.yml` avec la vérification du Quality Gate
- Capture d'écran d'une pipeline qui ÉCHOUE à cause du Quality Gate
- Capture d'écran d'une pipeline qui RÉUSSIT après corrections

---

### Question 3.6 : Test du Quality Gate (bonus - 1 point)

**Tâche :**
Testez votre Quality Gate en introduisant volontairement du code de mauvaise qualité :

**Exemple - Code à ajouter pour faire échouer le Quality Gate :**

```python
# Code dupliqué (pour tester la duplication)
def process_data_1(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

def process_data_2(data):  # Duplication !
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

# Code complexe (pour tester la maintenabilité)
def complex_function(a, b, c, d, e, f, g):
    if a > 0:
        if b > 0:
            if c > 0:
                if d > 0:
                    if e > 0:
                        if f > 0:
                            if g > 0:
                                return a + b + c + d + e + f + g
    return 0

# Code smell - variables inutilisées
def unused_variables():
    x = 10  # Jamais utilisé
    y = 20  # Jamais utilisé
    z = 30  # Jamais utilisé
    return 5
```

**Questions à répondre :**

1. Votre pipeline a-t-elle échoué comme prévu ? Montrez les logs
2. Quel message d'erreur le Quality Gate a-t-il renvoyé ?
3. Comment avez-vous corrigé le code pour passer le Quality Gate ?
4. Combien de temps avez-vous mis pour satisfaire toutes les conditions ?

**À fournir :**

- Code de mauvaise qualité ajouté
- Capture d'écran de la pipeline échouée avec les détails de l'échec
- Rapport SonarQube montrant pourquoi le Quality Gate a échoué
- Code corrigé
- Capture d'écran de la pipeline réussie

---

## Partie 4 : Analyse comparative et bonnes pratiques (Bonus - 3 points)

### Question 4.1 : Comparaison SonarCloud vs Self-Hosted (1 point)

**Tâche :**
Créez un tableau comparatif détaillé entre SonarCloud et SonarQube self-hosted selon les critères suivants :

| Critère | SonarCloud | SonarQube Self-Hosted |
|---------|------------|----------------------|
| Coût | | |
| Infrastructure | | |
| Maintenance | | |
| Fonctionnalités | | |
| Quality Gates | | |
| Performance | | |
| Sécurité des données | | |
| Intégration CI/CD | | |
| Scalabilité | | |
| Plugins | | |

**Questions à répondre :**

1. Dans quel contexte recommanderiez-vous SonarCloud ?
2. Dans quel contexte recommanderiez-vous SonarQube self-hosted ?
3. Quels sont les coûts cachés du self-hosting ?

---

### Question 4.2 : Bonnes pratiques DevSecOps (1 point)

**Questions à répondre :**

1. À quelle fréquence devriez-vous lancer une analyse SonarQube ? Justifiez
2. Comment intégrer SonarQube dans une stratégie "Shift-Left Security" ?
3. Proposez une stratégie pour gérer la dette technique détectée par SonarQube
4. Comment convaincre une équipe réticente d'adopter SonarQube ?
5. Quelles métriques SonarQube devriez-vous suivre dans un dashboard d'équipe ?

---

### Question 4.3 : Retour d'expérience personnel (1 point)

**Questions à répondre :**

1. Quelle partie du TP avez-vous trouvée la plus difficile et pourquoi ?
2. Quelles surprises avez-vous eues en découvrant les résultats de l'analyse ?
3. Comment SonarQube a-t-il changé votre perception de la qualité de code ?
4. Utiliseriez-vous SonarQube dans vos projets personnels ? Pourquoi ?
5. Quelles limitations de SonarQube avez-vous identifiées ?
6. Proposez 3 améliorations que vous aimeriez voir dans SonarQube

---

## Livrables attendus

Vous devez rendre un **dossier compressé** contenant :

### 1. Rapport PDF (obligatoire)

Structure recommandée :

- **Page de garde** : Nom, prénom, master, date
- **Sommaire**
- **Introduction** (contexte, objectifs)
- **Partie 1** : SonarCloud (réponses détaillées)
- **Partie 2** : Vulnérabilités (code avant/après, analyses)
- **Partie 3** : Self-Hosted & Quality Gates
- **Partie 4** : Analyse comparative (si bonus réalisé)
- **Conclusion** : Retour d'expérience, apprentissages
- **Annexes** : Configurations complètes, logs

### 2. Code source et configurations (obligatoires)

```
/rendu_tp_sonarqube/
├── rapport.pdf
├── code_source/
│   ├── avant_corrections/
│   │   └── fichiers_vulnerables.py
│   └── apres_corrections/
│       └── fichiers_securises.py
├── configurations/
│   ├── sonarcloud/
│   │   ├── .gitlab-ci.yml
│   │   └── sonar-project.properties
│   ├── selfhosted/
│   │   ├── docker-compose.yml
│   │   ├── .gitlab-ci.yml
│   │   └── sonar-project.properties
│   └── tunnel/
│       └── ngrok_ou_cloudflare_config.txt
└── captures/
    ├── partie1/
    ├── partie2/
    └── partie3/
```

### 3. Liens (obligatoires)

Dans le rapport, incluez :

- URL du dépôt GitLab
- URL du projet SonarCloud
- URL des pipelines GitLab

---

## Barème détaillé

| Partie | Points | Détail |
|--------|--------|--------|
| **Partie 1 - SonarCloud** | 6 | Q1.1: 1pt, Q1.2: 2pts, Q1.3: 2pts, Q1.4: 1pt |
| **Partie 2 - Vulnérabilités** | 6 | Q2.1: 2pts, Q2.2: 2pts, Q2.3: 2pts |
| **Partie 3 - Self-Hosted** | 8 | Q3.1: 2pts, Q3.2: 1pt, Q3.3: 2pts, Q3.4: 1pt, Q3.5: 2pts |
| **Bonus - Q3.6 Test QG** | 1 | Test complet du Quality Gate |
| **Bonus - Partie 4** | 3 | Q4.1: 1pt, Q4.2: 1pt, Q4.3: 1pt |
| **Qualité du rapport** | - | Propreté, orthographe (-2pts max si insuffisant) |
| **TOTAL** | 20 | (24 points possibles avec bonus) |

---

## Critères d'évaluation

### Technique (60%)

- Configurations fonctionnelles (SonarCloud, Self-hosted, CI/CD)
- Vulnérabilités correctement injectées et corrigées
- Quality Gate créé et testé
- Pipeline fonctionnelle avec vérification QG

### Analyse (30%)

- Compréhension des vulnérabilités et risques
- Analyse critique des résultats SonarQube
- Réflexion sur les limites et cas d'usage
- Propositions d'améliorations pertinentes

### Présentation (10%)

- Clarté et structure du rapport
- Qualité et pertinence des captures d'écran
- Code commenté et expliqué
- Orthographe et syntaxe

---

## Conseils pour réussir

1. **Lisez tout le sujet** avant de commencer
2. **Testez au fur et à mesure** : ne passez pas à la question suivante si la précédente ne fonctionne pas
3. **Prenez des captures systématiquement** : avant/après chaque action importante
4. **Commentez votre code** : expliquez chaque vulnérabilité et correction
5. **Gardez une trace de vos commandes** : historique bash, notes
6. **Sauvegardez régulièrement** : commitez souvent sur Git

---

## Ressources autorisées

### Documentation officielle

- Documentation SonarQube : https://docs.sonarqube.org/
- Documentation SonarCloud : https://docs.sonarcloud.io/
- GitLab CI/CD : https://docs.gitlab.com/ee/ci/
- OWASP Top 10 : https://owasp.org/www-project-top-ten/
- CWE : https://cwe.mitre.org/

### Outils

- SonarLint (plugin IDE pour tester en local)
- JQ pour parser le JSON
- Postman pour tester l'API SonarQube

### Recherches

- Google, Stack Overflow
- Documentation des langages (Python, JavaScript, Java, etc.)
- Blogs techniques sur la sécurité applicative

**Non autorisés :**

- Copie entre étudiants
- Utilisation d'IA générative pour générer les réponses (sauf recherche)
- Partage de tokens ou accès aux instances SonarQube

---

## Questions fréquentes (FAQ)

**Q: Mon SonarQube local ne démarre pas, que faire ?**

R: Vérifiez les logs avec `docker-compose logs`. Problèmes courants :

- Pas assez de RAM (minimum 2GB recommandés)
- Port 9000 déjà utilisé

**Q: L'analyse SonarQube prend beaucoup de temps, c'est normal ?**

R: Oui, la première analyse peut prendre 5-10 minutes selon la taille du projet. Les analyses suivantes sont plus rapides grâce au cache.

**Q: GitLab CI ne peut pas atteindre mon SonarQube local, pourquoi ?**

R: Vérifiez que :

- Votre tunnel (ngrok/cloudflare) est actif
- L'URL dans `SONAR_HOST_URL` est correcte
- Le token est valide
- SonarQube est bien démarré

**Q: SonarQube ne détecte pas mes vulnérabilités, que faire ?**

R: Assurez-vous que :

- Le bon analyzer est installé pour votre langage
- Les fichiers sont bien inclus dans `sonar.sources`
- Les règles de sécurité sont activées dans le Quality Profile

**Q: Puis-je utiliser GitHub au lieu de GitLab ?**

R: Oui, mais adaptez les configurations CI/CD en conséquence (GitHub Actions)

**Q: Le Quality Gate échoue toujours, comment débugger ?**

R: Consultez l'onglet "Quality Gate" dans SonarQube pour voir quelle(s) condition(s) échoue(nt). Regardez aussi les métriques "New Code" vs "Overall Code"

**Q: Mon tunnel ngrok/cloudflare se déconnecte, que faire ?**

R: Solutions :

- Ngrok : lancez-le en mode daemon ou dans un screen/tmux
- Cloudflare : utilisez systemd pour le maintenir actif
- Alternativement : utilisez un VPS avec IP publique fixe

---

## Contact

Pour toute question technique ou organisationnelle :

- Email : bastien_maurice@hotmail.com

---

**Bon courage et bonne analyse ! 🔍🛡️**
