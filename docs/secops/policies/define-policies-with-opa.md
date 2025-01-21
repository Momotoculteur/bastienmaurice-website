L'Open Policy Agent, ou OPA pour les intimes, est un moteur de politique open-source qui te permet de définir et d'appliquer des règles (ou politiques) de manière centralisée. Plutôt que d'avoir des règles éparpillées dans ton code, tu les écris une fois avec OPA, et il s'occupe du reste. 

## Comment ça marche ?
Imagine que ton application doit prendre une décision, comme vérifier si un utilisateur a le droit d'accéder à une ressource. Au lieu de coder cette logique directement, ton appli envoie une requête à OPA avec les infos nécessaires. OPA analyse ces données en fonction des politiques que tu as définies et renvoie une décision, par exemple "autorisé" ou "refusé". 


## Le langage Rego
Pour écrire tes politiques, OPA utilise un langage appelé Rego. C'est un langage déclaratif qui te permet d'exprimer des règles complexes de manière simple. Avec Rego, tu peux définir qui a accès à quoi, quelles configurations sont autorisées, et bien plus encore. 

## Pourquoi utiliser OPA ?
- **Centralisation** : Toutes tes politiques sont au même endroit, ce qui facilite leur gestion.
- **Flexibilité** : OPA s'intègre avec plein de systèmes comme Kubernetes, les microservices, les pipelines CI/CD, etc.
- **Maintenance simplifiée** : En séparant les politiques du code, tu peux les modifier sans toucher à ton application.


## Example de code 
### Limiter l'installation de dependances 
J'ai lu il a de cela quelque temps que des dev avait crée un module NPM (everything ou encore no-one-left-behind), qui lui même embarquait des dependances. Ici rien d'anormal, sauf que ses dependances faisait réf à l'ensemble des packages disponible de la plateforme NPM. Cela se résume à installer des milliers voir millions de packages.

!!! question
    Quelles conséquences me diriez vous ?

Vous risquez d'avoir des couts exorbitant que cela soit en network, ou disk usage. Possiblement faire des dommages réel à votre plateforme de CI.

Faisons ici un simple exemple de régle permettant d'empêcher sur notre plateforme de CI l'installation de tels modules. On va créer une rule en rego, et intéroger OPA afin de lui demander si notre package.json qui contient l'ensemble des dépendances de notre projet ne contient pas de packages interdit.

J'ai un projet NodeJS avec un package.json définit comme suit :

```json
{
  "name": "open-agent-policy",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

Je défini en Rego ma policy suivant :

```rego
package ci

# On défini de base à faux
default allow = false

# On liste les blacklisted
blacklist = {
    "lodash"
}

# On save ceux qui sont interdit
violations[pkg] if {
    input.dependencies[pkg]
    blacklist[pkg]
}

# Return True seulement si on a zéro interdit
allow if {
    count(violations) == 0
}
```

Je peux faire cette évaluation en local directement avec OPA :

```bash
opa eval --input package.json --data rules/ci.rego --format pretty 'data.ci'
{
  "allow": false,
  "blacklist": [
    "lodash"
  ],
  "violations": {
    "lodash": true
  }
}
```

OPA nous empêche donc bien notre action. Quelques explications à propos de cette commande : 

- **--input**: permet de renseigner notre fichier package.json qui contient les modules NPM que l'on souhaite analyser
- **--data**: ici on défini la policy écrite en rego qui doit être evalué
- **--format**: permet d'afficher en console de façon indenté
- le dernier argument **data.ci** permet d'afficher en sortie le résultat de l'évaluation. A tester aussi data.ci.violations ou data.ci.violations selon la verbosité souhaité

### Example avec de l'IaC
Si tu fais de l'infra as code avec du Terraform, tu devrais surement avoir un répo ou tu centralises tout ton code sur un répo Github. Tu pourrais très bien définir des rules afin d'enforce certaines bonnes pratiques. En pensant de la manière que j'ai réalisé l'infra de même blog que tu lis, j'ai défini un bucket public afin que mon site soit disponible sur le net. 

Mais quid d'un bucket publique que tu définirais au sein même de ton entreprise ? Cela serait une belle faute. On va donc ici réaliser pour cet exemple comment s'assurer qu'avant même d'apply ton bucket en prod, que celui-ci soit bien en privée exclusivement.