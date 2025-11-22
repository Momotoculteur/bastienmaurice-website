document$.subscribe(function() {
  // On cible uniquement les iframes qui ont un data-src (donc pas encore chargées)
  var lazyIframes = document.querySelectorAll("iframe[data-src]");

  lazyIframes.forEach(function(iframe) {
    // Sécurité : si on a déjà traité cet iframe, on ignore (pour la navigation instantanée)
    if (iframe.parentNode.classList.contains('reveal-wrapper')) return;

    // 1. Récupérer les dimensions définies dans votre Markdown (960x500)
    var width = iframe.getAttribute('width') || 960;
    var height = iframe.getAttribute('height') || 500;

    // 2. Créer le conteneur (façade)
    var wrapper = document.createElement('div');
    wrapper.className = 'reveal-wrapper';
    wrapper.style.maxWidth = '100%';
    // On force le ratio pour éviter que la page ne "saute" au chargement
    wrapper.style.aspectRatio = width + " / " + height; 
    
    // 3. Insérer le wrapper dans le DOM
    iframe.parentNode.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);

    // 4. Créer le bouton et le message
    var content = document.createElement('div');
    content.className = 'reveal-placeholder-content';
    content.innerHTML = `
        <p>Présentation</p>
        <button class="md-button md-button--primary">Charger les slides</button>
    `;
    
    wrapper.appendChild(content);

    // 5. Gérer le clic
    var button = content.querySelector('button');
    button.onclick = function() {
      // Feedback visuel immédiat
      button.innerText = "Chargement...";
      button.disabled = true;
      
      // On injecte la vraie source
      iframe.src = iframe.dataset.src;
      
      // Une fois l'iframe chargée (environ), on affiche
      iframe.onload = function() {
          wrapper.classList.add('active');
          // On supprime le bouton pour libérer la mémoire
          setTimeout(function(){ content.remove(); }, 500);
      };
    };
  });
});