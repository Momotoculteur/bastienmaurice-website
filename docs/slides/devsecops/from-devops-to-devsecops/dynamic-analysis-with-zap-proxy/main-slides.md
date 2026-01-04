## Objectifs pédagogiques

- Comprendre les principes du DAST (Dynamic Application Security Testing)
- Configurer et utiliser OWASP ZAP en local pour analyser des applications web
- Intégrer OWASP ZAP dans une pipeline GitLab CI/CD automatisée
- Interpréter les résultats des scans et prioriser les corrections
- Comparer et compléter les approches SAST et DAST



---


## Introduction au DAST

**Qu'est-ce que le DAST ?**

Le DAST (Dynamic Application Security Testing) est une méthode d'analyse de sécurité qui examine des **applications en cours d'exécution**

Contrairement au SAST, le DAST n'accède pas au code source mais teste **l'application de l'extérieur**, simulant les attaques d'un agresseur réel


**Caractéristiques principales :**

- Analyse en environnement d'exécution (application déployée)
- Détection de vulnérabilités réelles et exploitables
- Perspective "boîte noire" (pas d'accès au code source)
- Tests des composants d'exécution : serveurs, bases de données, APIs


---


## Introduction au DAST

**Avantages du DAST :**

- Détection des vulnérabilités liées à l'exécution
- Tests des configurations serveur et infrastructure
- Identification des problèmes d'authentification et de session
- Faible taux de faux positifs pour les vulnérabilités détectées
- Complément idéal au SAST (approche défense en profondeur)

**Limites du DAST :**

- Nécessite une application déployée et fonctionnelle
- Couverture limitée (pas aussi solide que plusieurs prog spé)
- Détection tardive dans le cycle de développement


---

# OWASP ZAP : Présentation
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Qu'est-ce qu'OWASP ZAP ?

OWASP ZAP (Zed Attack Proxy) est un outil open-source de test de sécurité d'applications web maintenu par l'OWASP (Open Web Application Security Project)

C'est l'un des outils de sécurité les plus populaires au monde, utilisé aussi bien par les développeurs que par les testeurs de sécurité


---


## Qu'est-ce qu'OWASP ZAP ?

**Fonctionnalités principales :**

- Proxy : Interception, inspection et modification du trafic HTTP/S entre le navigateur et l'application
- Active Scanner (Attaque) : Tentative d'exploiter les vulnérabilités en injectant des requêtes malveillantes (e.g., SQL Injection, XSS)
- Passive Scanner : Analyse les requêtes et réponses interceptées sans les modifier, cherchant des failles comme des en-têtes de sécurité manquants
- Spider (Explorateur) : Parcourt automatiquement l'application pour découvrir les URL et les fonctionnalités
- API/Daemon Mode : Conçu pour s'intégrer facilement dans les pipelines CI/CD


---


## Qu'est-ce qu'OWASP ZAP ?

**Modes d'opération :**

- Mode manuel : Contrôle total via l'interface graphique
- Mode automatique : Scan automatisé avec configuration prédéfinie
- Mode daemon : Exécution en arrière-plan pour l'intégration CI/CD
- Mode API : Contrôle programmatique via l'API REST

**Vulnérabilités détectées :**

- Injection SQL, XSS, CSRF
- Authentification cassée et problèmes de session
- Configurations serveur incorrectes
- Exposition de données sensibles
- Composants avec vulnérabilités connues



---


## ZAP - Workflow 

1. **Configuration du proxy** : Définition du point d'écoute et des règles
2. **Exploration de l'application** : Navigation manuelle ou spider automatique
3. **Analyse passive** : Détection automatique pendant la navigation
4. **Analyse active** : Tests intrusifs avec risque contrôlé
5. **Génération de rapports** : Export des résultats en différents formats


---

# OWASP ZAP : Mise en place
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Installation et configuration

**Option 1 : Docker**

```bash 
# Version stable
docker pull owasp/zap2docker-stable

# Version hebdomadaire (features récentes)
docker pull owasp/zap2docker-weekly
```

**Option 2 : Package natif**

- Windows : Installateur disponible sur le site OWASP
- macOS : brew install zaproxy
- Linux : Packages disponibles pour les distributions principales
  

---


## Configuration initiale

**Lancement avec interface graphique :**

```bash
zap.sh  # Linux/macOS
zap.bat  # Windows
```

**Paramètres recommandés :**

```bash
# Mode daemon avec API
zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true

# Mode avec clé API
zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.key=your-secret-key
```


---


## Exploration de l'application

1. **Navigation manuelle :**
   - Parcourir l'application normalement
   - ZAP enregistre automatiquement toutes les requêtes
   - Couvrir tous les chemins fonctionnels
2. **Spider traditionnel :**
   - Saisir l'URL de départ
   - Configurer la portée (scope)
   - Lancer le spider pour découvrir les pages
3. **AJAX Spider :**
   - Pour les applications JavaScript lourdes
   - Utilise un navigateur headless
   - Découvre le contenu généré dynamiquement


---


## Automatisation avec ZAP

**API REST de ZAP**

ZAP expose une API REST complète pour l'automatisation :

```bash
# Exemples d'endpoints :
/core/action/newSession/        # Nouvelle session
/core/action/accessUrl/         # Accéder à une URL
/spider/action/scan/            # Lancer un spider
/ascan/action/scan/             # Lancer une analyse active
/alert/view/alerts/             # Récupérer les alertes
/core/action/stop/              # Arrêter ZAP
```


---


## Scripts d'automatisation

**Python avec zapv2 :**


```python
from zapv2 import ZAPv2

# Connexion à ZAP
zap = ZAPv2(apikey='your-api-key', proxies={'http': 'http://localhost:8080'})

# Nouvelle session
zap.core.new_session()

# Accès à l'application cible
zap.core.access_url('http://example.com')

# Exploration avec spider
scan_id = zap.spider.scan('http://example.com')
while int(zap.spider.status(scan_id)) < 100:
    time.sleep(5)

# Analyse active
scan_id = zap.ascan.scan('http://example.com')
while int(zap.ascan.status(scan_id)) < 100:
    time.sleep(5)

# Récupération des alertes
alerts = zap.core.alerts()
```



---


## Exemple configuration GitLab CI/CD

**Exemple minimal .gitlab-ci.yml :**

```yaml
stages:
  - dast-scan

variables:
  STAGING_URL: "http://staging.example.com"

# Scan DAST avec ZAP
dast-scan:
  stage: dast-scan
  image: 
    name: owasp/zap2docker-stable
    entrypoint: [""]
  variables:
    ZAP_HOST: "localhost"
    ZAP_PORT: "8080"
  script:
    # Démarrer ZAP en mode daemon
    - zap.sh -daemon -host 0.0.0.0 -port $ZAP_PORT -config api.disablekey=true &
    
    # Attendre que ZAP soit prêt
    - sleep 30 # Pouvant être fait via zapv2
    
    # Exécuter le scan
    - |
      zap-cli quick-scan \
        --start-options "-config api.disablekey=true" \
        --spider \
        --ajax-spider \
        --active-scan \
        --scanners all \
        --recursive \
        --report-html zap-report.html \
        $STAGING_URL
```



---


## Exemple configuration GitLab CI/CD

**Pipeline avec configuration personnalisée :**

```yaml
dast-scan-advanced:
  stage: dast-scan
  image: owasp/zap2docker-stable
  script:
    # Copier la configuration
    - cp zap-config.properties /zap/config/
    
    # Démarrer ZAP avec configuration
    - zap.sh -daemon -configfile /zap/config/zap-config.properties
    
    # Script de scan personnalisé
    - |
      python /zap/scripts/custom_scan.py \
        --target $STAGING_URL \
        --config /zap/config/zap-config.properties \
        --output reports/
  artifacts:
    paths:
      - reports/
```


---


## Configuration avancée

**Fichier de configuration ZAP :**
```yaml
# zap-config.properties
# Configuration de base
connection.timeoutInSecs=60
connection.proxyChain.enabled=false

# Paramètres de scan
scanner.threadPerHost=2
scanner.maxRuleDurationInMins=10
scanner.delayInMs=10

# Politique de scan
scanner.attackStrength=MEDIUM
scanner.alertThreshold=MEDIUM

# Plugins à désactiver
scanner.excludeScanTypes=00001,00002
```



