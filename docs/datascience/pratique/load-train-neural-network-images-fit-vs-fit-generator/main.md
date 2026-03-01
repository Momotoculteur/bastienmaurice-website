Petit comparatif sur deux méthodes permettant de chargeur un dataset pour entrainer un réseau de neurones via Tensorflow et Keras.

## Fit()

Cela permet d'envoyer en un seul coup l'ensemble du dataset au réseau de neurones. En conséquence, on doit être sur que le dataset puisse rentrer en RAM.

C'est donc plutôt adapté pour les petits dataset.

### Générer les fichiers numpy en local

On commence par définir nos tableau qui vont contenir nos images. Pour cela je vous donne deux méthodes différentes :

```python linenums="1" title="generateNpyFiles.py"
# Méthode 1
X_train = np.zeros((len(os.listdir(dirImgSrc)), IMG_HEIGHT, IMG_WIDTH, IMG_CHANNELS), dtype=np.uint8)

# Méthode 2
X_train = []
```

Maintenant on va parcourir un dossier supposé contenant nos images que l'on souhaite ajouter à nos deux précédents tableau. Je vous montre selon les deux types d'initialisation faîte précédemment. 

Pour chaque image que l'on aura, on va devoir les ouvrir et les transformer en tenseur de taille 3 (largeur x hauteur x canal, ou canal=3 si RGB ou canal=1 si Noir/Blanc). Une couleur peut avoir un gradient allant de 0 à 255, selon son intensité. 

Pour chaque pixel, on aura alors des triplets (0<Intensité rouge<255, 0<intensité vert<255, 0<intensité bleu<255). Pour des raisons d'optimisation, les réseaux apprennent plus facilement sur des valeurs normalisés. Pour cela, je vais divisé par 255 les valeurs, pour avoir des valeurs comprises entre 0 et 1.

```python linenums="1" title="generateNpyFiles.py"
import os
from PIL import Image
import numpy as np
from keras.preprocessing.image import img_to_array, load_img


for imgPath in os.listdir("path/to/images"):
  # Méthode 1, avec une ouverture via Keras
  img = load_img(imgPath, color_mode=COLOR_MODE)
  img = img_to_array(loadedImg)
  X_train[id] = img / 255.
  
  # Méthode 2, avec une ouverture avec Pillow
  img = Image.open(imgPath)
  img.load()
  img = np.asarray(img, dtype=np.uint8)
  X_train.append(data)
```

Maintenant on les enregistre en local :

```python linenums="1" title="generateNpyFiles.py "
# Valable pour méthode 1 & 2
np.save(os.path.join("path/to/save", "name_file.npy"), X_train)
```

### Charger les fichiers numpy

On a plus qu'a charger les fichiers précédemment sauvegardé en local, et de les fournir directement au réseau via la méthode fit():

```python linenums="1" title="openNpyFiles.py "
X_Train = np.load(os.path.join("path/to/save", "name_file.npy"))
model.fit(X_Train, XYTrain, batch_size=2, nb_epoch=10....)
```

## Fit_Generator()

On se sert de générateurs afin d'envoyer des mini-lots (batch) de notre dataset au réseau.

C'est donc plutôt adapté pour les grands dataset et convient donc mieux aux problématiques rencontré dans la vie réel. Cela permet en plus d'ajouter de la data augmentation à la volée, donc pratique !

### Besoin de data augmentation ?

C'est ici que l'on défini notre data augmentation. Vous pouvez laisser vide si vous n'en souhaitez pas. On laisse juste la normalisation des données, comme vu précédemment :

```python linenums="1" title="generators.py"
image_datagen = ImageDataGenerator(rescale=1./255.,
                                    #rotation_range=0.2,
                                    #width_shift_range=0.05,
                                    #height_shift_range=0.05,
                                    #shear_range=0.05,
                                    #zoom_range=0.05,
                                    #horizontal_flip=True)
mask_datagen = ImageDataGenerator(rescale=1./255.)
```

### Chargement des données

On peut charger les données directement via un dossier spécifique ou via un dataframe de pandas. Gardez un seed identique permettant de synchro les deux générateurs sur les mêmes images en entrée entre sa donnée et son label.

#### Via un dossier spécifique

```python linenums="1" title="generators.py"
def trainGenerator( xDir, yDir, batchSize, seed=1):
    x_gen = image_datagen.flow_from_directory(
      seed=seed,
      batch_size=batchSize,
      directory=xDir,
    )
    y_gen = mask_datagen.flow_from_directory(
      seed=seed,
      batch_size=batchSize,
      directory=yDir,
    )

    train_generator = zip(x_gen, y_gen)
    for (x,y) in train_generator:
      yield (x,y)
  
trainGen = trainGenerator(xDir, yDir, BATCH_SIZE)

# Entrainement du modele
model.fit_generator(trainGen, steps_per_epoch=NUM_SAMPLES/BATCH_SIZE, epochs=EPOCH)
```

#### Via un datafame pandas

```python linenums="1" title="generators.py"
# Lecture du fichier des classes
CLASSE = pd.read_csv("mes_classe.csv", sep=',')

# Lecture du DF des datas
df = pd.read_csv("mon_dataset.csv")

# GLOBAL VAR
#NB_CLASSES = CLASSE.shape[0] 998 classe original
NB_CLASSES = 994 # Permet de fix le nombre de classe manquante du dataset
NB_EPOCH = 1
IMG_SIZE = (96,96)
TRAINSIZE_RATIO = 0.8
TRAINSIZE = int(df.shape[0] * TRAINSIZE_RATIO)
LIST_CLASS = ['...','..'.]
DIRECTORY_TRAINED_MODEL = 'model.hdf5'
COLOR_MODE ="rgb"

# Contient les images pour le jeu d'entrainement
train_generator=datagen.flow_from_dataframe(dataframe=df[:TRAINSIZE],
                                            directory=DIRECTORY_DATA,
                                            x_col="path",
                                            y_col="labels",
                                            batch_size=2,
                                            seed=42,
                                            shuffle=True,
                                            class_mode="categorical",
                                            classes=LIST_CLASS,
                                            target_size=IMG_SIZE,
                                            color_mode=COLOR_MODE)

# Contient les images pour le jeu de validation
valid_generator=test_datagen.flow_from_dataframe(dataframe=df[TRAINSIZE:],
                                                 directory=DIRECTORY_DATA,
                                                 x_col="path",
                                                 y_col="labels",
                                                 batch_size=2,
                                                 seed=42,
                                                 shuffle=True,
                                                 class_mode="categorical",
                                                 classes=LIST_CLASS,
                                                 target_size=IMG_SIZE,
                                                 color_mode=COLOR_MODE)
                                                 
STEP_SIZE_TRAIN=train_generator.n//train_generator.batch_size
STEP_SIZE_VALID=valid_generator.n//valid_generator.batch_size

# Entrainement du modele
model.fit_generator(generator=train_generator,
                    steps_per_epoch=STEP_SIZE_TRAIN,
                    validation_data=valid_generator,
                    validation_steps=STEP_SIZE_VALID,
                    epochs=NB_EPOCH,
                    callbacks=[earlystopping, modelchekpoint....],
                    verbose=1
)
```
 

#### Train & Validation set depuis un même dossier commun

Simple exemple pour de la segmentation d'image. Mais selon votre problématique vous devrez changez dans la méthode `flow_from_directory/dataframe` le `class_mode` (type de vos données en Y, catégorie, binaire, etc.) et le classes` (liste de vos classes **[chiens, chats, etc.]**)


```python linenums="1" title="customGenerator.py"
def trainGenerator(trainPath, imageDir, maskDir, batchSize, VAL_SPLIT, seed=1 ):
    """
    Générateur pour le jeu de TRAIN
    @param trainPath: dossier parent
    @param imageDir: dossier contenant les X
    @param maskDir: dossier contenant les Y
    @param batchSize: nombre d'image par mini lot
    @param VAL_SPLIT: ratio qui définit le trai/val set
    @param seed: IMPORTANT afin d'avoir le bon Y (classe, label correspondant) avec le X courant
    @return: 
    """
    xTrain = ImageDataGenerator(validation_split=VAL_SPLIT)
    yTrain = ImageDataGenerator(validation_split=VAL_SPLIT)

    xGenerator = xTrain.flow_from_directory(
        seed=seed,
        batch_size=batchSize,
        class_mode=None,
        directory=trainPath,
        classes=[imageDir],
        color_mode = "rgb",
        subset='training'
    )
    yGenerator = yTrain.flow_from_directory(
        seed=seed,
        batch_size=batchSize,
        class_mode=None,
        directory=trainPath,
        classes=[maskDir],
        color_mode = "grayscale",
        subset='training'
    )

    trainZip = zip(xGenerator, yGenerator)
    for (x,y) in trainZip:
        img,mask = adjustData(x,y)
        yield (img,mask)


def validationGenerator(trainPath, imageDir, maskDir, batchSize, VAL_SPLIT, seed=1):
    """
    Générateur pour le jeu de VALIDATION
    @param trainPath: dossier parent
    @param imageDir: dossier contenant les X
    @param maskDir: dossier contenant les Y
    @param batchSize: nombre d'image par mini lot
    @param VAL_SPLIT: ratio qui définit le trai/val set
    @param seed: IMPORTANT afin d'avoir le bon Y (classe, label correspondant) avec le X courant
    @return: 
    """
    xValidation = ImageDataGenerator(validation_split=VAL_SPLIT)
    yValidation = ImageDataGenerator(validation_split=VAL_SPLIT)

    xGenerator = xValidation.flow_from_directory(
        seed=seed,
        batch_size=batchSize,
        class_mode=None,
        directory=trainPath,
        classes=[imageDir],
        color_mode = "rgb",
        subset='validation'
    )
    yGenerator = yValidation.flow_from_directory(
        seed=seed,
        batch_size=batchSize,
        class_mode=None,
        directory=trainPath,
        classes=[maskDir],
        color_mode = "grayscale",
        subset='validation'
    )

    # On zip les deux générateurs, avec un seed identique on aura le bon couple X/Y
    validationZip = zip(xGenerator, yGenerator)
    
    # Cette sous étape non obligatoire, nous permet d'affecter des transformations à nos images
    # avant d'être envoyé au réseau
    for (x,y) in validationZip:
        img,mask = adjustData(x,y)
        yield (img,mask)
        
def adjustData(img,mask):
    """
    Fonction appelé pour effectuer des transformations, data aug, etc...
    @param img: mon image
    @param mask: son masque associé (pour de la segmention semantique de pixel)
    @return: 
    """
    # le réseau interprete mieux les valeurs normalisés
    # Les images sont RGB ( en couleurs, donc 3 cannaux ), et une valeur d'un pixel pour un cannal donnée est entre 0 et 255 pour
    # définit l'intensité d'une couleur
    # On passe de 0<x<255 à 0<x<1
    img = img / 255

    return (img,mask)
    
    
if __name__ == "__main__":
    # Définition des step par epochs
    batch_size = 32
    TRAIN_STEPS = len(mon_dossier_d'image) // batch_size
    VALIDATION_STEPS = len(mon_dossier_d'image(le meme que precedent)) // batch_size
    
    # Définition des path
    # img et mask sont dans le dossier image
    # img correspond à mon X et mask à mon Y
    TRAIN_PATH = "/image"
    IMG_DIR_NAME = "/img"
    MASK_DIR_NAME = "/mask"
    
    # 80% pour Train, 20% pour Validation
    VAL_RATIO = 0.2
    
    trainGen = trainGenerator(TRAIN_PATH, IMG_DIR_NAME, MASK_DIR_NAME, BATCH_SIZE, VAL_RATIO)
    validationGen = validationGenerator(TRAIN_PATH, IMG_DIR_NAME, MASK_DIR_NAME, BATCH_SIZE, VAL_RATIO)
    
    model.fit_generator(generator=trainGen,
                    validation_data=validationGen,
                    steps_per_epoch=TRAIN_STEPS,
                    validation_steps=VALIDATION_STEPS,
                    epochs=EPOCH,
                    #callbacks=[csv_logger, savemodelCallback, earlyStopping, reduceLearningrate],
                    #use_multiprocessing=True,
                    #workers=16
                    #shuffle=True
                    )
```
