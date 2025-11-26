document$.subscribe(function() {
  var lazyIframes = document.querySelectorAll("iframe[data-src]");

  lazyIframes.forEach(function(iframe) {
    if (iframe.parentNode.classList.contains('reveal-wrapper')) return;

    // --- CORRECTION MOBILE START ---
    // Si l'iframe est dans un <p>, on l'en sort pour éviter le bug de rendu
    if (iframe.parentNode.tagName === 'P') {
        var p = iframe.parentNode;
        // On insère l'iframe juste avant le P
        p.parentNode.insertBefore(iframe, p);
        // Si le P est vide après ça, on le supprime pour nettoyer
        if (p.innerHTML.trim() === "") {
            p.remove();
        }
    }
    // --- CORRECTION MOBILE END ---

    var width = iframe.getAttribute('width') || 960;
    var height = iframe.getAttribute('height') || 500;
    // Calcul du ratio pour le CSS (ex: 52.08%)
    var ratioPercent = (height / width) * 100; 

    var wrapper = document.createElement('div');
    wrapper.className = 'reveal-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '100%';
    // On utilise padding-bottom au lieu d'aspect-ratio pour une compatibilité maximale mobile
    wrapper.style.height = 'auto'; 
    wrapper.style.aspectRatio = width + " / " + height;
    
    iframe.parentNode.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);

    var content = document.createElement('div');
    content.className = 'reveal-placeholder-content';
    content.innerHTML = `
        <p>Présentation</p>
        <button class="md-button md-button--primary" style="z-index:20;">Charger les slides</button>
    `;
    
    wrapper.appendChild(content);

    var button = content.querySelector('button');
    button.onclick = function(e) {
      e.preventDefault(); // Empêche le scroll ou comportements bizarres sur mobile
      button.innerText = "Chargement...";
      button.disabled = true;
      
      iframe.src = iframe.dataset.src;
      
      iframe.onload = function() {
          wrapper.classList.add('active');
          setTimeout(function(){ content.remove(); }, 500);
      };
    };
  });
});