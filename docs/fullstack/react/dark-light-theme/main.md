Pour aujourd'hui je vous propose une petite implémentation d'un thème sous React avec la lib Material-Ui, l'implémentation de Material Design de Google.

Je vous met mon [dépot Github](https://github.com/Momotoculteur/React-material-ui-dark-light-custom-theme) pour avoir le code source complet du projet.

![react material ui theme light dark](images/react-material-ui-theme-light-dark.gif){ loading=lazy }
{ .center-text }

## Objectifs

- Thème dark & light dans toute l'app
- Système de sauvegarde des préférences utilisateurs via local-storage

## Initialisation de CssBaseline

On ajouter le composant CssBaseline en entrée de notre application. Mais à quoi set t-il ?

Il va nous permettre de remplacer certaines props CSS de base de notre app, faire certains reset. Cela va permettre d'éviter certains props de mal switcher entre Dark et Light theme.

Nous avons donc dans notre fichier root :

```javascript linenums="1" title="app.js"
import ContentApp from './Content/ContentApp'
import ThemeHandler from './Theme/ThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

function App() {
  return (
    <ThemeHandler>
      <CssBaseline />
      <ContentApp />
    </ThemeHandler>
  );
}

export default App;
```

- ThemeHandler: on va décrire ce composant juste ensuite ;)
- CssBaseline: notre composant pour le bon switch dark/light
- ContentApp: notre composant qui va contenir le reste de notre app

Disons qu'il fait un semblant de [normalize.css](https://github.com/necolas/normalize.css), mais pour Mui :)

## Création de la palette de notre thème

On va définir dans ce composant tout les hyperparamètre qui touche à l'aspect visuel du thème, ainsi que sa palette de couleurs.

On va définir les props suivants:

- **local_storage_key**: string/id de la props qui nous permet de savoir le thème courant de l'utilisateur. On va détailler le local storage plus tard dans l'article
- **baseTheme:** thème parent qui va définir les paramètres globaux qui seront utilisé à la fois pour le dark que le light
- **dark_theme:**  palette spécifique au thème dark
- **light_theme:** palette spécifique au thème light

```javascript linenums="1" title="theme.js"
import { createTheme } from "@material-ui/core/styles"

const LOCAL_STORAGE_KEY = "isDark";

const baseTheme = createTheme({
    typography: {
        fontFamily: "'Work Sans', sans-serif",
        fontSize: 14,
        fontFamilySecondary: "'Roboto Condensed', sans-serif"
    }
})

const DARK_THEME = createTheme({
    ...baseTheme,
    palette: {
        type: "dark",
        primary: {
            main: '#5c85ff',
        },
        secondary: {
            main: '#000000',
        },
        background: {
            default: '#353030',
        },
        text: {
            primary: '#f7f2f2',
        },
    }
})

const LIGHT_THEME = createTheme({
    ...baseTheme,
    palette: {
        type: "light",
        primary: {
            main: '#decb4a',
        },
        secondary: {
            main: "#26a27b"
        },
        background: {
            default: '#f9f6f6',
        },
        text: {
            primary: '#141414',
        },
    }
})

export { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY }
```

## Création du contexte du thème

On va définir un contexte pour notre thème. Cela va nous permettre au sein de l'ensemble de notre application de récupérer des informations à propos du thème. Il va nous être important dans la suite de l'article. Pour le moment on initialise un contexte vide : 

```javascript linenums="1" title="themeContext.js"
import * as React from 'react';

const ThemeContext = React.createContext({});

export default ThemeContext;
```

## Création du gestionnaire de thème

On souhaite maintenant un système de gestion de thème. On souhaite qu'il garde l'état actuel du thème (palette dark ou light), mais aussi qu'il ait une fonction permettant de switch de thème.
 
```javascript linenums="1" title="themeProvider.js"
import * as React from 'react';
import { ThemeProvider } from '@emotion/react';
import ThemeContext from './ThemeContext'
import { LOCAL_STORAGE_KEY, DARK_THEME, LIGHT_THEME } from "./Theme";

function ThemeHandler(props) {

    const [isDark, setDark] = React.useState(localStorage.getItem(LOCAL_STORAGE_KEY) === 'true');

    const ctxValue = {
        isDark: isDark,
        toggleTheme: toggleTheme
    }

    function toggleTheme (){
        setDark(!isDark)
        localStorage.setItem(LOCAL_STORAGE_KEY, !isDark);
    }

    function getTheme(){
        if(isDark){
            return DARK_THEME;
        } else {
            return LIGHT_THEME;
        }
    }

    return (
        <ThemeContext.Provider value={ctxValue}>
            <ThemeProvider theme={getTheme}>
                {props.children}
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeHandler;
```

Nous définissions en premier lieu un **useState**. Il va nous permettre de changer la valeur du thème en cours, mais aussi de la récupérer. On va l'initialiser avec le local storage de l'user. Il va nous permettre de garder la préférence de l'user dans le navigateur ( une sorte de cookie )

On init un objet de **contexte** avec :

- `isDark`: boolean si le thème en cours est dark
- `toggleTheme`: function permettant le switch de thème

La fonction `toggleTheme` permet de setter une nouvelle valeur du boolean, et permet de mettre à jour la valeur du local storage.

La fonction `getTheme` permet de retourner la bonne palette de couleurs en fonction du boolean courant.

D'un point de vue HTML, le composant **ThemeHandler** est composé de la sorte:

- `themeContext.Provider`: permet de consommer une valeur par défault de context ( on la init auparavant)
- `themeProvider`: permet de fournir un thème à notre application avec celui défini dans le context précédent
- `{props}`: permet d'insérer les nodes enfants que l'on fournira au composant

## Ajout de contenu pour notre app

Le système de switch et gestion de thème est mis en place. Il nous faut maintenant quelques composants UI avec un toggle, permettant de switch entre dark et light.

```javascript linenums="1" title="contentApp.js"
import Stack from '@material-ui/core/Stack';
import Button from '@material-ui/core/Button';
import { Switch, Typography } from '@material-ui/core';
import { Box } from '@material-ui/system';
import { useContext } from 'react';
import ThemeContext from '../Theme/ThemeContext';

function ContentApp() {

    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <Box>
            <Stack spacing={2} direction="row">
                <Button variant="text">Text</Button>
                <Button variant="contained" onClick={toggleTheme}>Change Theme button</Button>
                <Button variant="outlined">Outlined</Button>
            </Stack>

            <Typography>
                <Switch checked={isDark} onChange={toggleTheme} />
                Change Theme switch
            </Typography>
        </Box>
    )
}

export default ContentApp;
```

Grace au **useContext**, on va pouvoir récupérer le context du thème. Ceci va nous permettre de connaître le type de thème actuel au sein de notre application, ainsi que de la function pour switch de thème.

A partir de ce context, vous pouvez ajouter un bouton, un switch ou autre afin de le bind avec la function de switch de theme **toggleTheme**, et aussi d'initialiser votre composant avec l'état en cours via le **isDark**.
