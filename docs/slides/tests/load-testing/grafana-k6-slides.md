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


