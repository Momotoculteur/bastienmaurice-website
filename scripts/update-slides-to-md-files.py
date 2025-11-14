import os

# Dossier racine à parcourir
root_dir = "./docs/slides"

# Balises à supprimer
to_remove = [
    '<div style="text-align: left;">', 
    '</div>'
]

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(".mdtxt"):
            original_path = os.path.join(dirpath, filename)
            new_filename = filename.replace(".mdtxt", "-slides.md")
            new_path = os.path.join(dirpath, new_filename)

            # Lire le contenu
            with open(original_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Supprimer les balises
            for tag in to_remove:
                content = content.replace(tag, '')

            # Écrire le nouveau fichier
            with open(new_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"Transformé : {original_path} → {new_path}")
