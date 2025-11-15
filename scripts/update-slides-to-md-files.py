import os
import re

# Dossier racine à parcourir
root_dir = "./docs/slides"

# Balises à supprimer
to_remove = ['<div style="text-align: left;">', "</div>"]

# --- Fonction pour convertir <img ...> en Markdown ---
def convert_img_to_md(text):
    img_pattern = r'<img\s+([^>]+)>'

    def replace(match):
        attrs = match.group(1)

        # Chercher src="..."
        src_match = re.search(r'src="([^"]+)"', attrs)
        src = src_match.group(1) if src_match else ""

        # Chercher alt="..."
        alt_match = re.search(r'alt="([^"]+)"', attrs)
        alt = alt_match.group(1) if alt_match else ""

        # Retour en syntaxe Markdown
        return f'![{alt}]({src})'

    return re.sub(img_pattern, replace, text)

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(".mdtxt"):
            original_path = os.path.join(dirpath, filename)
            new_filename = filename.replace(".mdtxt", "-slides.md")
            new_path = os.path.join(dirpath, new_filename)

            # Lire le contenu
            with open(original_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Supprimer les balises
            for tag in to_remove:
                content = content.replace(tag, "")

            # Regex pour détecter le bloc d'en-tête précis
            header_pattern = re.compile(
                r"^#.*?\n"                       # Titre markdown sur la 1ère ligne
                r"Bastien MAURICE\s*\n"          # Ligne suivante contenant ton nom
                r"(?:<!--\s*\.slide.*?-->\s*\n)*"  # 0..n lignes slide
                r"---\s*\n",                      # Ligne séparatrice
                flags=re.DOTALL
            )

            # Supprimer le bloc uniquement si trouvé
            content, count = re.subn(header_pattern, '', content, count=1)


            # Conversion des <img ...> en ![alt](src)
            content = convert_img_to_md(content)

            # gere <img ... alt="bastien_maurice"/>
            #img_pattern = r'<img[^>]*alt="bastien_maurice"[^>]*>'
            #content = re.sub(img_pattern, '', content)

            # Écrire le nouveau fichier
            with open(new_path, "w", encoding="utf-8") as f:
                f.write(content)

            print(f"Transformé : {original_path} → {new_path}")
