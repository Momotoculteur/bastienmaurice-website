Nous avons vu dans le chapitre précédent comment stocker en local des données simples.

On va s'attarder cette fois-ci à comment stocker des informations plus nombreuses, plus complexes et ce de façon plus ordonnée, en utilisant des bases de données SQL.

On va réaliser une simple _to-do app_, avec possibilité d'ajouter une note, ou d'en supprimer, avec une liste permettant de toute les afficher.

Code source du chapitre disponible sur [Github](https://github.com/Momotoculteur/ReactNative_Expo_Formation/tree/Chap6).

 
!!! info
    On ne peut utiliser n'importe quel outils pour persister des données car nous sommes sur un projet Expo, nous empêchant d'accéder aux modules natifs de iOS et Android. SQLite est un moyen fonctionnant avec des projets Expo

## Objectifs

- Stocker localement des informations via une base de donnée SQL


![react native sqlite](images/demo-chap-6-gif-169x300.gif){ loading=lazy }
{ .center-text }


### Prérequis

Installez le package pour utiliser SQLite :

```
expo install expo-sqlite
```

Nous l'importerons dans nos fichiers de la manière suivante :

`import * as SQLite from 'expo-sqlite';`

## Base de données & CRUD

**CRUD** : diminutif correspondant aux requêtes basique, à savoir **C**reate, **R**ead, **U**pdate et **D**elete.

### Création de la base de données

Rien de plus simple, une seule ligne suffit :

```tsx linenums="1" title="DatabaseManager.tsx"

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("database.db");

export default class DatabaseManager {
  
}
```

On donne un nom à notre base, en argument. Celle-ci n'est crée qu'une seule et unique fois. Si on rappelle cette même méthode, on récupère la base de donnée crée auparavant, aucun risque de doublon.

### Création de la table NOTE

On va maintenant créer notre table. Je vous montre la façon la plus simple de réaliser des transaction SQL vers notre base :

```tsx linenums="1" title="DatabaseManager.tsx "
export default class DatabaseManager {

  static initializeDatabase(): void {
        db.transaction(tx => {
            tx.executeSql(
                "create table if not exists\
                    note (\
                        note_id integer primary key autoincrement not null,\
                        text text not null\
                );"
            );
        }, (e) => { console.log("ERREUR + " + e) },
            () => { console.log("OK + ") }
        );
    }

}
```

Requête SQL des plus basique avec le mot clé **CREATE TABLE**. On lui donne un nom de table, ainsi que la définitions de nos colonnes. Un **ID** auto-incrémenté pour garantir l'unicité de nos données, ainsi qu'un attribut **TEXT** qui contiendra le contenu de nos notes.

Nos deux attributs ne peuvent être **null**, et on leur défini un type, soit **Text** ou **Integer**.

### Optimiser les requêtes

Je préfère une autre annotation que la précédente pour questionner la base de données, récupérer nos objets et leurs affecter des transformations. Je trouve plus clair et simple à l'utilisation. On définit notre modèle de requête avec une promesse :

```tsx linenums="1" title="DatabaseManager.tsx "
static ExecuteQuery = (sql, params = []) => new Promise((resolve, reject) => {
    db.transaction((trans) => {
        trans.executeSql(sql, params, (trans, results) => {
            resolve(results);
        },
            (error) => {
                reject(error);
            });
    });
});
```

On pourra utiliser ce modèle dans des fonctions **async**, via un appel par un **await**. On pourra utiliser des **then()** et **catch()** à l'appel du service dans nos vues, permettant par exemple d'afficher à l'utilisateur dans une popup si une note à bien été ajouté ou si dans le cas inverse afficher un message d'erreur avec son origine.

#### Récupérer toute les notes

On définit une interface pour les objets que l'on va récupérer en base. Cela nous facilitera leurs manipulations au sein de notre application :

```tsx linenums="1" title="INote.tsx"
export interface INote {
    id: number,
    text: string
}
```

On fait appel à notre modèle pour questionner la base :

```tsx linenums="1" title="DatabaseManager.tsx"
static async getAllNote() {

    let result: INote[] = [];
    let selectQuery = await this.ExecuteQuery("SELECT * FROM note", []);
    
    var rows = selectQuery.rows;
    for (let i = 0; i < rows.length; i++) {
        var item = rows.item(i);
        result.push({
            text: item.text,
            id: item.note_id
        } as INote);
    }

    return result;
}
```

On récupère nos objets via la requête. On va itérer sur notre résultat de requête pour re-typer correctement nos objets.

#### Ajouter une note

Seule différence, on va ici passer en argument le contenu de ma note que l'on souhaite persister en base. Pas besoin de lui passer un ID pour la note, car celle-ci est généré automatiquement en base. Nous avons défini cette option tout à l'heure, lors de la création de la table.

```tsx linenums="1" title="DatabaseManager.tsx"
static async createNote(note: string) {
    await this.ExecuteQuery("insert into note(text) values(?)", [note]);
}
view raw
```

#### Supprimer une note

Quasiment identique au point précédent, sauf qu'ici on lui passe un **ID** de note à notre fonction, étant donné que c'est l'attribut qui défini l'unicité de mes items dans ma table **NOTE** :

```tsx linenums="1" title="DatabaseManager.tsx"
static async deleteNoteWithId(id: number) {
    await this.ExecuteQuery("DELETE FROM note WHERE note_id=?", [id]);
}
```

## Récupération des items dans la vue

Nous venons de créer notre base ainsi que des opérations CRUD permettant d'interagir avec elle. On va désormais créer une nouvelle vue, avec un champ de texte permettant de donner du contenu à une note, un bouton pour ajouter cette note, une liste scrollable permettant de naviguer sur l'ensemble de nos notes en base, et leur associé à chacun un bouton pour les supprimer.


### Définition du state de notre vue

On commence par créer le squelette de base de notre vue :

```tsx linenums="1" title="todo-page.tsx"
interface IProps {
}
interface iState {
    myNoteList: INote[];
    note: string;
}
export default class TodoPage extends React.Component<IProps, iState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            myNoteList: [],
            note: ''
        }
    }
}
```

On utilise ici un composant de classe et non un composant fonctionnel. On a besoin d'utiliser un state pour l'affichage dynamique du contenu de notre liste scrollable. On défini un attribut **myNoteList** correspondant à une liste de l'ensemble de nos notes en base, ainsi qu'un second attribut **note** correspondant au champ de texte remplissable par l'utilisateur pour créer une nouvelle note. On initialise les deux attributs dans le constructeur.

 

### Définition des méthodes de notre vue

On défini les méthodes pour mettre à jour nos éléments, pour ajouter une note, ainsi que la supprimer :

```tsx linenums="1" title="todo-page.tsx"
componentDidMount(): void {
    this.updateListNote();
}

updateListNote(): void {
    DatabaseManager.getAllNote()
        .then((result: INote[]) => {
            this.setState({
                myNoteList: result
            })
        });
}

addNote(): void {
    DatabaseManager.createNote(this.state.note)
        .then(() => {
            this.updateListNote();
            this.setState({ note: '' })
        });
}

deleteNote(id: number): void {
    DatabaseManager.deleteNoteWithId(id)
        .then(() => {
            this.updateListNote();
        });
}
```

La méthode **componentDidMount()** est une méthode standardisé de React, permettant d'être appelé une seule et unique fois et ce à la fin de la création du composant. On lui demande à l'ouverture de notre page, d'initialiser notre liste avec le contenu de notre base de données.

### Définition des éléments visuels de notre vue

Ici rien de bien complexe. J'ai créer un titre de page, un champ de texte avec un bouton pour ajouter une note. Une liste scrollable présentant l'ensemble des notes en base, ainsi qu'une option permettant de les supprimer :

```tsx linenums="1" title="todo-page.tsx"
render() {
    return (
        <View style={{ paddingTop: Constants.statusBarHeight, flex: 1, flexDirection: 'column' }}>

            <Text style={{ flex: 1, fontSize: 30, fontWeight: 'bold', textAlign: 'center', textAlignVertical: 'center' }}>A faire</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <TextInput
                    placeholder="Ajouter note"
                    value={this.state.note}
                    onChangeText={text => this.setState({ note: text })}
                />
                <TouchableOpacity
                    style={{...styles.buttonStyle}}
                    onPress={() => this.addNote()}>
                    <Ionicons name={Platform.OS === 'ios' ? "ios-add" : 'md-add'} size={30} color='gray' />
                </TouchableOpacity >
            </View>

            <View style={{ flex: 5, flexDirection: 'column' }}>
                <ScrollView >
                    {
                        this.state.myNoteList.map((item: INote, index) => {
                            return (
                                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10 }}>
                                    <Text style={{textAlignVertical: 'center', flex: 1}}>{item.text}</Text>
                                    <TouchableOpacity
                                        style={styles.buttonDelete}
                                        onPress={() => this.deleteNote(item.id)}>
                                            <Ionicons name={Platform.OS === 'ios' ? "ios-trash" : 'md-trash'} size={30} color='red' />
                                    </TouchableOpacity >
                                </View>
                            );
                        })
                    }
                </ScrollView>
            </View>
        </View>
    );
}
```

J'ai utilisé des icones **Ionicons** inclus dans Expo, qui s'adapte en fonction de si vous êtes sur Android ou iOS via la méthode **Platform.OS**, encapsulé dans des **TouchableOpacity**, pour rendre un peu plus esthétique mes boutons d'interactions, ainsi que des **flexbox** pour avoir une touche de responsive design.

## Conclusion

Vous venez de voir comment créer très simplement une base de donnée pour votre application React Native tournant sous Expo, comment l'interroger et surtout comment récupérer et afficher le résultats dans une belle vue responsive.

