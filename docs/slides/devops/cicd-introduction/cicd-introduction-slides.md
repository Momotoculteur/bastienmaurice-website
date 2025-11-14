## Avant la CI/CD...

- Déploiements **manuels** via FTP, SCP, etc.
- Tests réalisés **localement** ou sur un serveur unique
- Environnements de prod/test souvent **non homogènes**
- Bugs critiques détectés **tardivement**
- Risques élevés lors des mises en production
- Livraisons **peu fréquentes** et **stressantes**


---



## Qu'est-ce que la CI/CD ?

- **CI** = *Continuous Integration*
- **CD** = *Continuous Delivery* / *Continuous Deployment*

> Automatiser la validation, le test, le packaging et le déploiement de votre code à chaque changement




---



## Continuous Integration (CI)

- Teste automatiquement chaque commit/push
- Vérifie que le code est fonctionnel (tests unitaires, lint, etc.)
- Facilite le travail en équipe (moins de conflits)
- Détecte rapidement les erreurs
  


---


## Continuous Delivery / Deployment (CD)

- **Delivery** : build/test déployé automatiquement jusqu'à un environnement staging

- **Deployment** : mise en production automatique (optionnellement validée par l’humain)



---


## Avantages de la CI/CD

- Détection rapide des bugs
- Intégration continue = code toujours testable
- Déploiement rapide et fréquent
- Moins de stress en production
- Homogénéité des environnements
- Meilleure qualité de code sur la durée

</br></br>

|                  | Avant CI/CD      | Avec CI/CD                |
| ---------------------- | ---------------- | ------------------------- |
| **Tests**                  | Manuels, oubliés | Automatisés à chaque push |
| **Déploiement**            | Manuel, risqué   | Automatisé, fréquent      |
| **Fréquence de livraison** | Rare, par lot    | Continue, incrémentale    |
| **Fiabilité**              | Faible           | Élevée grâce aux tests    |
| **Temps de mise en prod**  | Long             | Rapide                    |



