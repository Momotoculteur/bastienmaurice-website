## Distribution-based Loss

### Binary Cross-Entropy

Fonction la plus connue, définissant comme mesure de la différence entre deux probabilité de distribution pour une variable prise aléatoirement.

**Quand l'utiliser ?** 

Utilisé pour de la classification binaire, ou classification multi-classes ou l'on souhaite plusieurs label en sortie. Utilisable aussi pour de la segmentation sémantique. Fonction basé sur la distribution de Bernoulli.

Référence de base à utiliser comme première fonction pour tout nouveau réseau. Non adapté à des datasets biaisé/déséquilibré.

 

### Categorical Cross-Entropy

Utilisé pour de la classification multi-classes, mais en souhaitant un seul label en sortie.

**Quand l'utiliser ?** 

Pour de la classification multi-class à simple label de sortie.

 

### Weighted Cross-Entropy

C'est une variante de la Binary Cross-Entropy. Elle permet de rectifier la faiblesse de la BCE pour les datasets déséquilibrés, en ajoutant des poids selon des coefficients, pour les exemples positifs.

**Quand l'utiliser ?** 

Pour des datasets biaisé/déséquilibré.

 

### Balenced Cross-Entropy

Elle est similaire à la Weighted Cross-Entropy.  A la différence prêt, qu'elle pénalise en plus des exemples positives, les exemples négatifs

**Quand l'utiliser ?** 

Pour des datasets biaisé/déséquilibré.

 

### Focal 

Elle est similaire à la Binary Cross-Entropy. Elle excelle dans les datasets déséquilibrés pour la raison qu'elle diminue le poids lors de la prédiction d'exemples facile, pour permettre au réseau de se focaliser pour l'apprentissage des exemples complexes.

**Quand l'utiliser ?** 

Pour des datasets TRES biaisé/déséquilibré.

 

## Region-based Loss

### Pixel-Wise Cross-Entropy

Fonction la plus connue pour des tâches d'image segmentation. Celle-ci examine chaque pixel de façon individuelle. On compare la classe prédite du pixel par notre réseau à notre One Hot encoding de notre masque original.

Etant donnée que le calcul se fait selon la moyenne des pixels, on suppose d'avoir des classes en répartition égales sur nos images. Peut donc poser des problèmes si on a des classes non équilibré. Par exemple pour un algo ou l'on souhaite détecter piétons, ciel et route dans des photos, on sait déjà d'avance que les classes ciel et route seront bien plus présente que les piétons. Résultant ainsi dans un réseau avec des prédisposition à détecter d'avantage les classes les plus présentes.

**Quand l'utiliser ?** 

Référence de base à utiliser comme première fonction pour tout nouveau réseau de segmentation d'image. Non adapté à des datasets biaisé/déséquilibré.

 

### Dice 

Inspiré des coefficients Dice, métriques utilisé pour évaluer la performance d'un réseau de segmentation sémantique d'image en mesurant le chevauchement entre deux objets.

**Quand l'utiliser ?** 

Très apprécié pour des problématiques de segmentation d'image.

 

### Soft Dice

Calcul la probabilité de chaque classe de façon indépendante, pour ensuite donner un score final résultant d'une moyenne.

 

### Focal

Utile pour des dataset extrêmement déséquilibré ou les cas positifs restent très rare.

**Quand l'utiliser ?** 

Apprécié pour des problématiques de segmentation d'image.

 

### Tversky 

Similaire à la Dice. Elle ajoute un poids aux éléments FP (Faux Positif) et FN (Faux Négatif). Conçu à la base pour palier contre les datasets déséquilibré d'origine médical. Des constantes y sont ajoutés (alpha et beta) afin de pénaliser différents types d'erreurs (FP et FN) à plus haut dégrés à mesure que leurs valeurs augmentent.

**Quand l'utiliser ?** 

Très apprécié pour des problématiques de segmentation d'image.

 

### Focal Tversky

Mélange de la Focal, qui focus l'entrainement sur les exemples complexe en diminuant le poids des exemples simples, comme par exemple pour les petits ROI (Region of Interest) avec la Tversky.

**Quand l'utiliser ?** 

Très apprécié pour des problématiques de segmentation d'image.

 

### BCE-Dice 

Mélange entre la Dice et la Binary Cross-Entropy. Permet d'avoir quelque peu de diversité, tout en bénéficiant de la stabilité de la BCE.

**Quand l'utiliser ?** 

Très apprécié pour des problématiques de segmentation d'image.

 

### Jaccard / Intersection Over Union (IoU)

Inspiré des coefficients IoU ou communément appelé index de Jaccard, métriques utilisé pour évaluer la performance d'un réseau de segmentation sémantique d'image. C'est le ratio entre le chevauchage de l'instance prédite avec la réelle.

**Quand l'utiliser ?** 

Très apprécié pour des problématiques de segmentation d'image.

 

### Lovasz Hinge

Conçu comme étant une IoU optimisé à des fin de segmentations d'images à multi-classes.

 

### Combo

Combination de la Dice loss avec une version modifié de la Cross-Entropy, avec des constantes qui pénalise les FP et FN plus spécifiquement.
