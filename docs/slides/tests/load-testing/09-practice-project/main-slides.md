# Fondamentaux et Scripting
## Module 9 : Projet Final Pratique
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Projet : Test Complet d'une Application E-commerce

**Contexte**

Vous devez tester une application e-commerce avant un événement Black Friday prévu dans 2 semaines 
L'entreprise attend :  

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

