# Blog [bastienmaurice.fr](https://bastienmaurice.fr)

Axé sur la culture DevOps, le cloud, l'infrastructure


## Docs
### PyEnv


### Affiche un ficher dans un md file
```
{% with pdf_file = "./ressource/cv/cv.pdf" %}

{% set solid_filepdf = '<i class="fas fa-file-pdf"></i>' %}
{% set empty_filepdf = '<i class="far fa-file-pdf"></i>' %}

## Example: Embedding a PDF file

<object data="{{ pdf_file }}" type="application/pdf">
<embed src="{{ pdf_file }}" type="application/pdf" />
</object>

## Example: Creating a link to a PDF file

<a href="{{ pdf_file }}" class="image fit">{{ solid_filepdf }}</a>

{% endwith %}
```

### Chouette cli
```
mkdocs serve --watch-theme
mkdocs serve --dirtyreload
mkdocs serve --livereload
```

### Reveal.Js + Highlight.js
Embarquer du codes propres dans les slides en markdown:
```
<pre class="stretch"><code data-trim data-noescape>
moncode()
</code></pre>
```

### Button center

```md
[SLIDES EN VERSION TEXTE](./sca-with-renovate-saas-and-self-hosted/main-slides.md){ .md-button }
{ .center-text }
```