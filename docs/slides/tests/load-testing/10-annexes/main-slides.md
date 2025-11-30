# Annexes
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

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


