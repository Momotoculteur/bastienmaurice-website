# TP Noté : Automatisation des dépendances avec Renovate

---

## Informations pratiques

- **Durée :** 4 heures
- **Type :** Travail individuel
- **Notation :** /20
- **Rendu :** Rapport PDF + fichiers de configuration + captures d'écran
- **Date limite :** 1 semaine

---

## Contexte du TP

Vous êtes développeur DevOps dans une entreprise qui gère plusieurs projets logiciels. La direction souhaite améliorer la gestion des dépendances pour réduire la dette technique et les vulnérabilités de sécurité. Votre mission est d'évaluer et de mettre en place l'outil Renovate selon trois approches différentes.

---

## Prérequis techniques

Avant de commencer, vérifiez que vous disposez de :
- Node.js et npm
- Docker et Docker Compose
- Git
- Un compte GitHub
- Un éditeur de code

---

## Partie 1 : Installation et utilisation locale de Renovate (6 points)

### Contexte
Vous devez d'abord tester Renovate en local sur un projet existant pour comprendre son fonctionnement avant de le déployer en production.

### Question 1.1 : Préparation du projet (1 point)

**Tâche :**
Créez un nouveau projet Node.js nommé `renovate-test-local` avec les caractéristiques suivantes :
- Initialisez un dépôt Git
- Créez un fichier `package.json` avec npm init
- Installez **intentionnellement** des versions obsolètes des dépendances suivantes :
  - express version 4.17.1
  - axios version 0.21.1
  - lodash version 4.17.20
  - moment version 2.29.1

**À fournir dans votre rapport :**
- La commande exacte utilisée pour installer ces dépendances
- Une capture d'écran de votre fichier `package.json`
- Le premier commit Git (capture de `git log`)

---

### Question 1.2 : Installation de Renovate CLI (1 point)

**Tâche :**
Installez Renovate en mode CLI sur votre machine.

**Questions à répondre :**
1. Quelle commande avez-vous utilisée pour installer Renovate globalement ?
2. Comment vérifiez-vous que l'installation a réussi ?
3. Quelle est la version de Renovate installée sur votre machine ?

**À fournir :**
- Les commandes exécutées
- Une capture d'écran montrant la version installée

---

### Question 1.3 : Configuration initiale (2 points)

**Tâche :**
Créez deux fichiers de configuration pour Renovate :

1. **Fichier `renovate.json`** à la racine du projet avec les règles suivantes :
   - Utiliser la configuration de base (`config:base`)
   - Grouper toutes les mises à jour mineures et patch ensemble
   - Séparer les mises à jour majeures
   - Activer les alertes de vulnérabilité

2. **Fichier `config.js`** pour l'exécution locale avec :
   - Mode platform: 'local'
   - Repository: './'
   - Mode dry-run activé
   - Configuration optionnelle

**Questions à répondre :**
1. Expliquez ce que signifie "dry-run" et pourquoi c'est utile en mode local
2. Quelle est la différence entre `renovate.json` et `config.js` ?
3. Pourquoi le mode "local" n'a-t-il pas besoin de token d'authentification ?

**À fournir :**
- Le contenu complet de vos deux fichiers de configuration
- Vos réponses aux questions

---

### Question 1.4 : Exécution et analyse (2 points)

**Tâche :**
Exécutez Renovate en mode local avec le niveau de log "debug".

**Questions à répondre :**
1. Quelle commande complète avez-vous utilisée pour lancer Renovate ?
2. Combien de dépendances obsolètes Renovate a-t-il détectées ?
3. Pour chaque dépendance, indiquez :
   - La version actuelle
   - La version proposée
   - Le type de mise à jour (patch/minor/major)
4. Pourquoi Renovate propose-t-il ces versions spécifiques ?
5. Y a-t-il des vulnérabilités de sécurité détectées ? Si oui, lesquelles ?

**À fournir :**
- Capture d'écran de l'exécution complète
- Un tableau récapitulatif des dépendances analysées
- Les logs les plus importants (extraits)

---

## Partie 2 : Déploiement SaaS avec GitHub Application (6 points)

### Contexte
L'équipe souhaite automatiser complètement le processus. Vous devez configurer Renovate via l'application GitHub pour qu'il scanne automatiquement le dépôt et crée des Pull Requests.

### Question 2.1 : Mise en place du dépôt GitHub (1 point)

**Tâche :**
1. Créez un nouveau dépôt public sur GitHub nommé `renovate-test-saas`
2. Créez un projet Node.js identique à la partie 1 (mêmes dépendances obsolètes)
3. Ajoutez un fichier README.md expliquant le projet
4. Poussez votre code sur GitHub

**À fournir :**
- L'URL de votre dépôt GitHub
- Capture d'écran du dépôt sur GitHub

---

### Question 2.2 : Installation de l'application Renovate (1 point)

**Tâche :**
Installez l'application GitHub Renovate sur votre dépôt.

**Questions à répondre :**
1. Quelles permissions Renovate demande-t-il lors de l'installation ?
2. Pourquoi ces permissions sont-elles nécessaires ?
3. Combien de temps après l'installation la première PR apparaît-elle ?

**À fournir :**
- Capture d'écran du processus d'installation
- Capture d'écran des permissions accordées

---

### Question 2.3 : Analyse de la PR d'onboarding (2 points)

**Tâche :**
Examinez attentivement la Pull Request d'onboarding créée automatiquement par Renovate.

**Questions à répondre :**
1. Quel fichier Renovate propose-t-il d'ajouter dans cette PR ?
2. Quelle configuration par défaut est suggérée ?
3. Listez toutes les mises à jour détectées avec leur type (major/minor/patch)
4. Expliquez la différence entre "Renovate dashboard" et les PR de mise à jour

**À fournir :**
- Capture d'écran complète de la PR d'onboarding
- Capture d'écran du "Renovate dashboard" dans les issues
- Vos réponses détaillées

---

### Question 2.4 : Configuration personnalisée (2 points)

**Tâche :**
Avant de merger la PR d'onboarding, modifiez le fichier `renovate.json` proposé avec la configuration suivante :
- Timezone: Europe/Paris
- Planning: uniquement le dimanche après 21h
- Labels: "dependencies" et "renovate"
- Automerge activé pour les mises à jour minor et patch (sans les major)
- Assignation automatique à vous-même
- Commits sémantiques activés (conventional naming)

**Questions à répondre :**
1. Pourquoi est-il judicieux de planifier les scans en dehors des heures de travail ?
2. Qu'est-ce que l'automerge et quels sont ses risques ?
3. Proposez une stratégie pour sécuriser l'automerge (tests, conditions, etc.)
4. Que sont les "commits sémantiques" et quel est leur intérêt ?

**À fournir :**
- Le contenu complet de votre `renovate.json` personnalisé
- Capture d'écran montrant le fichier modifié dans la PR
- Capture d'écran après avoir mergé la PR d'onboarding
- Les nouvelles PR créées par Renovate avec votre configuration

---

## Partie 3 : Installation Self-Hosted avec Docker Compose - Gitlab (8 points)

### Contexte
L'entreprise gère des dépôts privés sensibles et souhaite héberger Renovate en interne pour garder le contrôle total des données et de l'infrastructure.

### Question 3.1 : Préparation de l'environnement (1 point)

**Tâche :**
1. Créez un Personal Access Token (PAT) sur GitHub avec les permissions nécessaires
2. Créez un nouveau dossier `renovate-selfhosted`
3. Préparez la structure de fichiers nécessaire

**Questions à répondre :**
1. Quelles permissions minimales le token doit-il avoir ?
2. Pourquoi ne doit-on jamais commiter le token dans Git ?
3. Proposez deux méthodes pour sécuriser le stockage du token

**À fournir :**
- Capture d'écran de la création du token (masquez la valeur du token)
- Liste des permissions sélectionnées
- Structure de dossiers créée (arborescence)

---

### Question 3.2 : Configuration Docker Compose (2 points)

**Tâche :**
Créez un fichier `docker-compose.yml` pour déployer Renovate avec les spécifications suivantes :
- Image: ghcr.io/mend/renovate-ce: # Replace <X.Y.Z>
- Variables d'environnement nécessaires (RENOVATE_PLATFORM, RENOVATE_TOKEN, etc.)
- Montage d'un volume pour les logs
- Attention au ports, webhook url à définir...

**Questions à répondre :**
1. Comment gérer & rediriger les appels du webhook entre notre Renovate qui tourne en localhost vers le Github SaaS pour la communication ? (Trigger des dependency dash, etc)
2. Quelles sont les variables d'environnement absolument minimales et obligatoires à définir pour que l'instance de Renovate sache où chercher les dépôts et comment interagir (selon la documentation de Renovate) ? Donnez leur nom complet (ex. : RENOVATE_XXX)

**À fournir :**
- Le contenu complet de votre `docker-compose.yml`
- Justification de chacun de vos choix de configuration

---

### Question 3.3 : Configuration Renovate avancée (2 points)

**Tâche :**
Créez une configuration avancée sur docker-compose incluant :
- Configuration de la plateforme (GitHub)
- Liste des repositories à scanner (votre dépôt `renovate-test-saas`)
- Désactivation de l'autodiscovery
- Configuration du branchPrefix personnalisé
- Règles de packaging pour :
  - Grouper les dépendances de développement
  - Automerge pour les patch uniquement
  - Labels personnalisés selon le type de mise à jour
- Activation des alertes de vulnérabilité

**Questions à répondre :**
1. Quelle est la différence entre `autodiscover: true` et spécifier manuellement les repositories ?
2. Dans quel cas utiliseriez-vous l'autodiscovery ?
3. Comment Renovate gère-t-il plusieurs dépôts avec des configurations différentes ?
4. Expliquez le concept de "branchPrefix" et son utilité

**À fournir :**
- Le contenu complet et commenté de votre `docker-compose.yaml`
- Un schéma expliquant le flux de traitement d'un repository

---

### Question 3.4 : Déploiement et tests (2 points)

**Tâche :**
1. Lancez Renovate avec Docker Compose
2. Surveillez les logs pendant l'exécution
3. Vérifiez que des PR/DependencyDashboard sont créées sur votre dépôt GitHub

**Questions à répondre :**
1. Quelle commande utilisez-vous pour valider votre docker-compose.yml avant de le lancer ?
2. Comment vérifiez-vous que le conteneur est bien démarré et fonctionne ?
3. Quelle commande permet de suivre les logs en temps réel ?
4. Que se passe-t-il si le token GitHub est invalide ? Décrivez le comportement observé
5. Comment redémarrez-vous Renovate après une modification de config.js ?

**À fournir :**
- Contenu du fichier `docker-compose.yaml` (masquez les token/secrets)
- Capture d'écran de `docker-compose ps`
- Extraits significatifs des logs (connexion, scan, création de PR)
- Capture d'écran des PR créées sur GitHub avec le branchPrefix personnalisé

---

### Question 3.5 : Automatisation avec planification (1 point)

**Tâche :**
Modifiez votre configuration pour que Renovate s'exécute automatiquement toutes les 6 heures au lieu d'une seule fois.

**Questions à répondre :**
1. Quelle approche avez-vous choisie (cron dans le conteneur, restart policy, script externe) ? Justifiez votre choix
2. Comment vérifieriez-vous que la planification fonctionne correctement ?
3. Proposez une solution pour recevoir des notifications en cas d'échec

**À fournir :**
- Le fichier docker-compose.yml modifié
- Explication de votre implémentation
- Logs montrant plusieurs exécutions successives

---

## Partie 4 : Analyse comparative et recommandations (Bonus - 3 points)

### Question 4.1 : Tableau comparatif (1 point)

**Tâche :**
Créez un tableau comparatif détaillé des trois modes d'installation selon les critères suivants :
- Coût (infrastructure, maintenance)
- Complexité de mise en place
- Temps de configuration
- Niveau de contrôle
- Sécurité des données
- Scalabilité
- Facilité de débogage
- Adapté pour (type de projet/entreprise)

---

### Question 4.2 : Retour d'expérience (1 point)

**Questions à répondre :**
1. Quel mode avez-vous trouvé le plus simple à mettre en place ? Pourquoi ?
2. Quel mode avez-vous trouvé le plus complexe ? Quelles difficultés avez-vous rencontrées ?
3. Pour votre projet personnel, quel mode choisiriez-vous ? Justifiez
4. Quels sont les principaux pièges à éviter avec Renovate ?

---

### Question 4.3 : Recommandations professionnelles (1 point)

**Tâche :**
Rédigez des recommandations pour trois scénarios d'entreprise :

**Scénario A :** Startup de 5 personnes, 3 projets open-source, budget limité
- Quel mode recommandez-vous ?
- Quelle configuration suggérez-vous ?
- Justifiez votre choix

**Scénario B :** PME de 50 développeurs, 30 projets privés, données sensibles
- Quel mode recommandez-vous ?
- Quelle infrastructure serait nécessaire ?
- Quels coûts estimez-vous ?

**Scénario C :** Grande entreprise bancaire, 500 développeurs, contraintes réglementaires strictes
- Quel mode recommandez-vous ?
- Quelles mesures de sécurité supplémentaires proposez-vous ?
- Comment organiseriez-vous la gouvernance ?

---

## Livrables attendus

Vous devez rendre un **dossier compressé** contenant :

### 1. Rapport PDF (obligatoire)
- Page de garde avec vos informations
- Réponses à toutes les questions dans l'ordre
- Captures d'écran légendées et lisibles
- Tableaux et schémas si pertinents
- Analyse et conclusions personnelles

### 2. Fichiers de configuration (obligatoires)
```
/partie1/
  ├── package.json
  ├── renovate.json
  └── config.js

/partie2/
  ├── README.md
  └── renovate.json

/partie3/
  ├── docker-compose.yml
  ├── config.js
  ├── .env.example (sans les vrais tokens)
  └── logs/ (extraits pertinents)
```

### 3. Captures d'écran (dans le rapport)
- Minimum de captures d'écran pertinentes et légendées
- Qualité suffisante pour être lisibles
- Annotations si nécessaire

### 4. Liens
- URL du/des dépôts GitHub
- URL des PR créées par Renovate

---

## Barème détaillé

| Partie | Points | Détail |
|--------|--------|--------|
| **Partie 1 - Local** | 6 | Q1.1: 1pt, Q1.2: 1pt, Q1.3: 2pts, Q1.4: 2pts |
| **Partie 2 - SaaS** | 6 | Q2.1: 1pt, Q2.2: 1pt, Q2.3: 2pts, Q2.4: 2pts |
| **Partie 3 - Self-hosted** | 8 | Q3.1: 1pt, Q3.2: 2pts, Q3.3: 2pts, Q3.4: 2pts, Q3.5: 1pt |
| **Bonus - Analyse** | 3 | Q4.1: 1pt, Q4.2: 1pt, Q4.3: 1pt |
| **Qualité du rapport** | - | Propreté, orthographe, présentation (-2pts max si insuffisant) |
| **TOTAL** | 20 | (23 points possibles avec le bonus) |

---

## Critères d'évaluation

### Technique (60%)
- Configurations fonctionnelles et correctes
- Commandes appropriées et justifiées
- Compréhension des concepts
- Résolution des problèmes rencontrés

### Analyse (30%)
- Qualité des réponses aux questions
- Esprit critique et propositions
- Comparaisons pertinentes
- Recommandations justifiées

### Présentation (10%)
- Clarté du rapport
- Qualité des captures d'écran
- Organisation logique
- Orthographe et syntaxe

---

## Conseils pour réussir

1. **Lisez tout le sujet avant de commencer**
2. **Testez chaque étape avant de passer à la suivante**
3. **Prenez des captures d'écran au fur et à mesure**
4. **Commentez vos fichiers de configuration**
5. **Gardez une trace de vos commandes (historique bash)**
6. **Ne copiez pas bêtement : comprenez ce que vous faites**
7. **Gérez votre temps : 1h30 par partie environ**
8. **Soignez la présentation de votre rapport**

---

## Ressources autorisées

- Documentation officielle Renovate
- Documentation Docker et Docker Compose
- Documentation GitHub
- Recherches Google
- Stack Overflow

**Non autorisés :**
- Copier-coller de configurations complètes sans les comprendre
- Partage de code entre étudiants
- Utilisation d'IA générative pour les réponses (sauf recherche)

---

## Questions fréquentes

**Q: Mon token GitHub ne fonctionne pas, que faire ?**
R: Vérifiez les permissions, la date d'expiration, et que vous l'avez bien copié entièrement.

**Q: Renovate ne détecte aucune mise à jour en local, pourquoi ?**
R: Vérifiez que vos dépendances sont bien obsolètes et que le format de votre package.json est correct.

**Q: Le conteneur Docker se ferme immédiatement, que faire ?**
R: Consultez les logs avec `docker-compose logs`. Vérifiez votre configuration et vos variables d'environnement.

**Q: Puis-je utiliser GitLab au lieu de GitHub ?**
R: Oui, mais vous devrez adapter les configurations en conséquence.

---

## Contact

Pour toute question technique ou organisationnelle :
- Email : [bastien_maurice@hotmail.com]

---

**Bon courage et bon travail ! 🚀**