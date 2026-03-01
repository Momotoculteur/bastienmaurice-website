## Pourquoi faire son custom loader de données ?

Nous avons vu dans l'article *Charger & entrainer le réseau sur des images : fit() vs fit_generator()*, qu'il est préférable d'utiliser un générateur pour charger l'ensemble de ses données à son réseau de neurones via des mini-lots de données, par rapport à envoyer le dataset dans sa globalité via un fichier (numpy par exemple).

Vous pouvez gagner du temps en utilisant les générateurs intégré à Keras :

- `flow` : charge des données via une variable
- `flow_from_dataframe` : charge des données via un dataframe Pandas
- `flow_from_directory` : charge des données via un dossier spécifique sur l'ordinateur

Vous répondre à une problématique simple, ils feront largement l'affaire. Mais ils vous imposent certaines choses :

- Train/Validation dataset : ça peut devenir un peu tricky pour définir ces deux jeux de données via Keras. Par exemple construire ces deux jeux avec des données dans un dossier unique. Vous pouvez à la rigueur vous en sortir comme cela :
- Réaliser des opérations spécifiques, comme de la data augmentation à la volée, avant qu'elles ne soient envoyé au réseau. Keras en propose quelque une via sa classe **ImageDataGenerator**, mais reste limiter.

Cette solution nous permet donc de nous adapter face à de large dataset plus facilement, et évite tout saturation de RAM ou celle du GPU. On profitera en plus du calcul parallèles via les threads de votre CPU.

## Etat actuel des choses

Vous devriez avoir pour le moment quelques choses comme ceci comme cheminement pour charger vos données. Je minimalise l'exemple pour la compréhension :

```python linenums="1" title="base.py"
# Imports
import numpy as np
import keras

# Chargement du dataset, en entier, via des fichiers numpy
X = np.load('image.npy')
Y = np.load('label.npy')

# Création d'un modèle, VGG16 par exemple ici
model = VGG16(n_classe, activation, weights, etc)
model.compile(optimisers, loss, metrics, etc)

# Entrainement
model.fit(x=X, y=y)
```

1. On charge le dataset dans sa globalité via Numpy
2. On créer son modèle et le compile selon son optimiser et diverses métriques souhaités
3. On entraine notre modèle sur nos données précédemment chargé

 

## Réalisation du générateur

### Squelette de base

Voici le squelette de base que je préconise. Votre classe doit hériter de la classe `Keras.utils.Sequence` :

```python linenums="1" title="customGenerator.py"
import keras

class DatasetLoader(keras.utils.Sequence):
    def __init__(): 
    def __len__(self):
    def on_epoch_end(self):
    def __getitem__(self, index):
```

Cette classe parente vous assure dans le cas ou vous souhaitez utiliser du calcul parallèle avec vos threads, de garantir de parcourir une seule et unique fois vos données au cours d'une époch, contrairement à pures custom générateurs maison que j'ai déjà vu sur des forums qui ne se synchronisaient pas entre eux. On verra plus tard dans le tutoriel comment utiliser ce multiprocess.

 

#### Implémentation du constructeur

Obligatoire à écrire, et défini dans l'objet de base de `Keras.utils.Sequence`. Permet d'instancier un nouvel objet.

```python linenums="1" title="customGenerator.py"
def __init__(self, data, xLabel, yLabel, batchSize, shuffle):
    self.xData = data[xLabel]
    self.yData = data[yLabel]
    self.batchSize = batchSize
    self.shuffle = shuffle
    self.targetSize = targetSize
    self.on_epoch_end()
```

Vous aurez besoin au minima besoin de vos données X et Y. Je vous montre ici un exemple :

- `data` : nos données dans un dataframe Pandas
- `xLabel` : nom de colonne du df contenant nos données X
- `yLabel` : nom de colonne du df contenant nos données Y
- `batchSize` : taille d'un mini lot de données
- `shuffle` : booléen si on souhaite envoyer des données de façon aléatoire, ou dans l'ordre de l'index du `dataframe`
- `targetSize` : afin de resize nos images

 

#### Implémentation __len__

Obligatoire à écrire, et défini dans l'objet de base de `Keras.utils.Sequence`. Définie le nombre de batch durant une époch.

```python linenums="1" title="customGenerator.py"
def __len__(self):
    return int(np.floor(len(self.xData) / self.batchSize))
```

 

#### Implémentation on_epoch_end

Défini dans l'objet de base de `Keras.utils.Sequence`. Appelé à chaque fin d'epoch. On va s'en servir ici afin de rendre aléatoire l'ordre de la liste des ID des items à envoyer pour constituer le batch de données courant.

```python linenums="1" title="customGenerator.py"
def on_epoch_end(self):
    # [0,1,2,3,4... nb_image]
    self.indexes = np.arange(len(self.xData))

    # [2,4,1,3,0... nb_image]
    if self.shuffle == True:
        np.random.shuffle(self.indexes)
```

#### Implémentation __getitem__

Obligatoire à écrire, et défini dans l'objet de base de `Keras.utils.Sequence`. Génère un batch de données.

Concrètement je récupère une liste d'ID qui correspond à des items spécifiques (X et Y) contenu dans le dataframe de données, de taille batchSize.  Ici pour l'exemple je ne fais que charger des images dans un tableau Numpy

```python linenums="1" title="customGenerator.py"
def __getitem__(self, index):
    # Genere batchSize nombre d'ID de row de DATA (batchSize=2, [0,1])
    currentBatchIdsRow = self.indexes[index * self.batchSize:(index + 1) * self.batchSize]
    
    xTrain = np.zeros((self.batchSize, *self.targetSize, 3), dtype=np.float32)
    yTrain = np.zeros((self.batchSize, *self.targetSize, 1), dtype=np.float32)
    
    # Traitement de vos données
    for i, rowId in enumerate(currentBatchIdsRow):
        xTrain[i, ] = Image.open(self.xData.iloc[rowId]).convert('RGB')
        yTrain[i, ] = Image.open(self.yData.iloc[rowId]).convert('L')

    return x, y
```

A vous d'effectuer vos transformation souhaités sur vos données, selon votre problématique. A savoir normaliser les données (diviser par 255 les valeurs des images par exemple pour passer de `0<x<255 à 0<x<1`), réaliser de la data augmentation, etc.

 

### Appel à notre générateur

On a plus qu'a créer un générateur pour le jeu d'entrainement, et un second pour le jeu de validation à partir de notre classe custom. On lui fourni un dataframe avec un nombre d'élément spécifique à chaque type de jeu de données spécifié avec un ratio de` 0,8/0,2`.

```python linenums="1" title="train.py"
DATASET = pd.read_csv("mon_dataset.csv", sep=',', index_col=0)
TRAINSIZE_RATIO = 0.8
NUM_SAMPLES = len(os.listdir("path/to/dataset/image))
SAMPLE_TRAIN = int(NUM_SAMPLES * TRAINSIZE_RATIO)

trainGen = DatasetLoader(data=DATASET[:SAMPLE_TRAIN],
                         xLabel='x_path',
                         yLabel='y_path',
                         batchSize=2,
                         shuffle=True)
validationGen = DatasetLoader(data=DATASET[SAMPLE_TRAIN:],
                              xLabel='x_path',
                              yLabel='y_path',
                              batchSize=2,
                              shuffle=True)

model.fit_generator(generator=trainGen,
                    validation_data=validationGen,
                    use_multiprocessing=True,
                    workers=16
                    )
```

On fourni ainsi nos deux générateurs au modèle via la méthode **fit_generator()**. On peut spécifier si on souhaite utiliser nos threads afin de paralléliser le chargement des données du disque dur vers le GPU.

 

### Data augmentation à la volée

Vous pouvez très bien réaliser une data augmentation sur votre fichier de données en même temps que vos masques, en local, au préalable. L'utilisation du générateur prendra en compte l'ensemble des fichiers de vos deux dossiers.

Vous pouvez néanmoins réaliser de la data augmentation au sein même du générateur, à la volée. Cela permet de stocker votre dataset de base, sans avoir des dizaines et dizaines de giga-octets supplémentaire et ainsi d'économiser du stockage sur votre disque dur. Cependant vous aurez alors un points négatif dans cette affaire. Vous perdrez légèrement en temps de chargement des données vers le GPU. En effet, en plus de lire et charger les images en local, on ajoute une petit étape ici, de créer de nouveaux échantillons à la volée avant de tout envoyer au GPU. A vous de voir quel moyen au final est le plus adapté selon votre type de dataset, votre hardware et votre approche pour répondre à votre problématique.

Ici je vous montre les quelques changements à réaliser pour adapter notre précédent générateur, afin d'y ajouter de la data augmentation à la volée.

#### Modification du constructeur

On va initialiser ici un nouvel attribut, **batchSizeAugmented** :

```python linenums="1" title="customGenerator.py"
class DatasetLoader(keras.utils.Sequence):
    def __init__(self,batchSize=2, batchSizeAugmented=32):
        self.batchSize = batchSize
        self.batchSizeAugmented = batchSizeAugmented
```

- **batchSizeAugmented** : nombre d'image total du batch
- **batchSize** : nombre d'image lu en local de notre dataset d'origine

Ici comme exemple, je prends **batchSize** =2 et **batchSizeAugmented** =32. Dans mon raisonnement, je souhaite que pour une image lu en local, je crée 15 nouvelles images augmentées avec divers effets. Donc si je lis 2 images, j'aurais 30 images augmentés. Ce qui fait 2 + 30 = 32 images au total.

#### Modification de __len__

Rappelez vous cette méthode défini le nombre de batch par époch. On remplace alors **batchSize** par **batchSizeAugmented** :

```python linenums="1" title="customGenerator.py"
def __len__(self):
    return int(np.floor(len(self.xData) / self.batchSizeAugmented))
```

#### Modification de \_\_getitem\_\_

On souhaite générer des images augmentés (30) à partir d'image local (2), aucun changement donc pour l'objet **currentBatchIdsRow.** 

On change cependant la première dimension de **xTrain** et **yTrain** de **batchSize** à **batchSizeAugmented**, qui correspond au nombre total d'image par batch ( donc les images locales en plus des augmentés).

```python linenums="1" title="customGenerator.py"
def __getitem__(self, index):
    # Genere batchSize nombre d'ID de row de DATA (batchSize=2, [0,1])
    currentBatchIdsRow = self.indexes[index * self.batchSize:(index + 1) * self.batchSize]
    
    xTrain = np.zeros((self.batchSizeAugmented, *self.targetSize, 3), dtype=np.float32)
    yTrain = np.zeros((self.batchSizeAugmented, *self.targetSize, 1), dtype=np.float32)
    
    copyPerImg = (self.batchSizeAugmented - self.batchSize ) / self.batchSize
    
    # Traitement de vos données
    for i, rowId in enumerate(currentBatchIdsRow):
        xTrain[i, ] = Image.open(self.xData.iloc[rowId]).convert('RGB')
        yTrain[i, ] = Image.open(self.yData.iloc[rowId]).convert('L')
        
        # Nouvelle boucle. C'est ici que l'on gère la data aug sur de nouveaux échantillons
        for j in range(copyPerImg):
            xTrain[(i-1)*copyPerImg + j + i, ] = xTrain.iloc[i, ].augmented_with_imgaug_or_albumentations
            yTrain[(i-1)*copyPerImg + j + i, ] = xTrain.iloc[i, ].augmented_with_imgaug_or_albumentations

    return x, y
```

On ajoute une nouvelle boucle dans la première , et c'est ici que vous allez opérez vos transformations pour générer de nouvelles images.
