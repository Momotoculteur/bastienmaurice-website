## Objectifs pédagogiques

- Comprendre les risques liés aux fuites de secrets dans les dépôts Git
- Installer et configurer Gitleaks
- Détecter des secrets exposés dans un historique Git
- Mettre en place des mesures préventives
- Intégrer Gitleaks dans un pipeline CI/CD



---

## Leaks & Théorie 
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---


## Secrets leaks : définitions

Une fuite de secrets survient lorsque des informations sensibles sont accidentellement exposées dans le code source ou l'historique Git. 

Ces secrets peuvent inclure :

- Clés API (AWS, Google Cloud, Stripe, etc.)
- Mots de passe de bases de données
- Tokens d'authentification (JWT, OAuth)
- Clés privées SSH ou certificats
- Chaînes de connexion à des services
- Secrets de chiffrement



---



## Secrets leaks : impacts

Les conséquences d'une fuite de secrets peuvent être catastrophiques :

1. **Accès non autorisé** : Un attaquant peut accéder à vos systèmes, bases de données ou services cloud
2. **Coûts financiers** : Utilisation frauduleuse de services cloud facturables
3. **Vol de données** : Exposition de données clients ou propriétaires
4. **Atteinte à la réputation** : Perte de confiance des clients et partenaires
5. **Conformité** : Violations RGPD, sanctions réglementaires



---



## Pourquoi l'historique Git est-il problématique ?

Même si vous supprimez un secret d'un fichier, il reste dans l'historique Git.  

Supprimer un commit récent ne suffit pas car :

- L'historique est distribué (clones, forks, mirrors)
- Les commits restent accessibles via leur hash
- Les sauvegardes peuvent conserver l'historique
- Les dépôts publics sont crawlés par des bots en temps réel



---

## Gitleaks & Pratique
<!-- .slide: data-background="#009485" -->
<!-- .slide: class="center" -->

---



## Présentation de Gitleaks

Gitleaks est un outil open-source de détection de secrets qui :

- Scanne l'historique complet d'un dépôt Git
- Utilise des expressions régulières et l'entropie pour détecter les secrets
- Propose des règles prédéfinies pour plus de 100 types de secrets
- S'intègre facilement dans les pipelines CI/CD via CLI
- Fonctionne en mode pré-commit pour prévenir les fuites

Architecture : Gitleaks analyse chaque commit, chaque fichier, chaque ligne pour identifier des patterns de secrets.



---



## Installation  de Gitleaks

**Sur Linux/macOS :**
```bash
# Via Homebrew
brew install gitleaks

# Via script d'installation
curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sh -s -- -b /usr/local/bin

# Vérifier l'installation
gitleaks version
```

**Sur Windows :**
```bash
# Via Chocolatey
choco install gitleaks

# Ou télécharger le binaire depuis GitHub
# https://github.com/gitleaks/gitleaks/releases
```



---



## Configuration de base

Gitleaks utilise un fichier `.gitleaks.toml` pour sa configuration

Voici un exemple basique :

```toml
title = "Configuration Gitleaks personnalisée"

[extend]
useDefault = true
```



---



## Configuration avancée

Ajout de règles custom, gérer les faux-positifs...

```toml
[[rules]]
id = "custom-api-key"
description = "Détection de clés API personnalisées"
regex = '''api[_-]?key[_-]?=[\s]*['""]?([a-zA-Z0-9]{32,})['""]?'''
tags = ["api", "key"]

[allowlist]
description = "Faux positifs autorisés"
paths = [
    '''node_modules/''',
]
regexes = [
    '''example\.com''',
]
```



---



## Exercice

**Objectifs :**

1. Créer un répository, y pousser un secret
2. Mise en place de Gitleaks sur CI/CD
3. Mise en place d'un pre-commit hook Git
4. Vérifier si on peut pousser un nouveau secret via un git commit/push

**Spécs :**

- 1 secret custom à trigger via **[[rules]]**
- 1 faux positif à exclure via **[allowlist]**


