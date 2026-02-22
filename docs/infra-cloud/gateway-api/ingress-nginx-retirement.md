## Pourquoi Ingress Nginx arrive en fin de vie ?

Ingress NGINX, c'est ce contrôleur super populaire dans Kubernetes qui gère le trafic entrant vers tes services. Il est maintenu par la communauté Kubernetes, mais voilà, les choses changent. L'annonce officielle a été faite le 11 novembre 2025 par le **Kubernetes SIG Network et le Security Response Committee**. 

En gros, le projet va être retiré en mars 2026. Pourquoi ?

- **Manque de ressources humaines** : Pendant des années, c'était tenu par juste 1 ou 2 devs qui bossaient sur leur temps libre, le soir et les weekends. Ils ont épuisé toutes les tentatives pour recruter plus de contributeurs.
- **Problèmes de sécurité récents** : Il y a eu une série de vulnérabilités graves en 2025, comme le fameux "IngressNightmare" (CVE-2025-1974), qui a exposé des failles critiques comme des exécutions de code à distance sans authentification. Ça a mis en lumière que le projet n'avait plus les moyens de gérer la sécurité correctement.
- **Priorité à la sécurité de l'écosystème** : Pour éviter de mettre en danger les users, ils préfèrent arrêter. Jusqu'en mars 2026, c'est du "best-effort" : des mises à jour minimales si possible, mais après, plus rien, pas de bugfixes, pas de patches de sécurité, et les repos GitHub passent en read-only.

Tes déploiements existants continueront de tourner, mais sans support, c'est comme une voiture sans entretien : ça roule encore, mais pour combien de temps ?


## Risques de laisser ton SI tourner tel quel

Migrer, c'est chiant, je sais, mais laisser Ingress NGINX en l'état après mars 2026, c'est risquer gros. Voici les principaux dangers, basés sur ce que disent les experts et les annonces officielles.

- **Risques de sécurité majeurs** : Une fois EOL, toute nouvelle vulnérabilité découverte restera sans patch. Si ton Ingress est exposé à internet (ce qui est souvent le cas pour les workloads publics), c'est une porte ouverte aux attaques. Pense à des trucs comme des injections, des RCE, ou des DDoS non mitigés. Des sources comme le Kubernetes Steering Committee insistent : "Rester sur Ingress NGINX après retirement te rend vulnérable aux attaques." Et avec l'historique récent d'IngressNightmare, c'est pas théorique.
- **Instabilité et bugs non résolus** : Pas de fixes pour les problèmes de perf, de compatibilité avec les nouvelles versions de Kubernetes, ou même des crashes aléatoires. Ton SI pourrait devenir instable au fil du temps, surtout si tu upgrandes ton cluster.
- **Problèmes de compliance et audits** : Dans un environnement pro, avoir du logiciel non maintenu à l'entrée de ton infra, c'est un red flag pour les audits sécurité. Ça peut compliquer tes certifications (ISO, SOC2, etc.) et augmenter tes risques légaux si y a une brèche.
- **Impact sur l'équipe** : Tes devs et ops vont perdre du temps à gérer des issues sans support communautaire. Et si tu attends le dernier moment, la migration deviendra une urgence stressante.

!!! warning
    Continuer à utiliser un composant en fin de vie, c’est un peu comme habiter une maison dont on ne répare plus le toit. Les conséquences peuvent être graves.

## Options de migration

Deux grandes voies s’offrent à toi : une transition en douceur vers un autre contrôleur Ingress « classique », ou un saut vers la nouvelle génération avec la Gateway API.

### Option simple : migrer vers HAProxy ou Traefik en conservant la norme Ingress

Si tu cherches une solution **rapide, avec un minimum de réécriture**, remplacer le contrôleur Ingress Nginx par **HAProxy Ingress** ou **Traefik** est tentant. Ces deux projets supportent la ressource standard `Ingress` et proposent des annotations très proches de celles d’Nginx.

**Pourquoi c'est simple ?**

- **Traefik** : Ils ont ajouté un "NGINX Provider" en version 3.5+ qui supporte nativement 80% des annotations courantes d'Ingress NGINX (comme rewrite-target, ssl-redirect, etc.). Tes Ingress objects marchent sans modif. Migration zéro downtime : installe Traefik à côté, vérifie le trafic, puis switch et désinstalle NGINX.
- **HAProxy** : Ils proposent un "Migration Assistant" avec un mapping direct des annotations. Par exemple, nginx.ingress.kubernetes.io/rewrite-target devient une annotation HAProxy équivalente. C'est performant et fiable, avec des outils pour convertir tes configs automatiquement.

**Avantages :**  

- **Courbe d’apprentissage faible** : tes manifestes Ingress actuels restent valides, seules les annotations changent (parfois même avec des correspondances directes).  
- **Pas de rupture conceptuelle** : tu restes dans le paradigme Ingress que tes équipes maîtrisent.  
- **Délai de migration court** : un simple remplacement du déploiement du contrôleur et une validation des règles peuvent suffire.

**Inconvénients :**  

- **Tu repousses seulement l’échéance** : à terme, la norme Ingress est appelée à être dépréciée au profit de la Gateway API. Tu devras probablement migrer à nouveau dans quelques années.  
- **Fonctionnalités limitées** : tu restes coincé dans le modèle Ingress, moins riche que la Gateway API pour des cas complexes.

Cette option est idéale si tu as besoin de **gagner du temps** ou si ton usage d’Ingress est simple (routage basique, TLS, quelques annotations). HAProxy et Traefik sont matures et activement maintenus.


### Option durable : migrer vers la Gateway API

La **Gateway API** est la nouvelle spécification officielle de Kubernetes pour le routage du trafic. Elle introduit plusieurs ressources (`GatewayClass`, `Gateway`, `HTTPRoute`, `TLSRoute`, etc.) permettant un contrôle bien plus fin et une meilleure séparation des responsabilités entre les équipes infra et applicatives.

**Pourquoi c’est « durable » ?**  

- La spec est soutenue par tous les gros acteurs (Google, AWS, Azure, Red Hat, Istio, Contour, etc.).  
- Elle évolue pour couvrir des besoins jusqu’alors laissés aux annotations propriétaires (timeouts, retries, mirroring, canary, etc.).  
- Utilise l'outil ingress2gateway pour convertir automatiquement tes Ingress en Gateway resources. Mais après, faut auditer et tester manuellement.

**La complexité à prévoir :**  

- **Changement de paradigme** : il faut repenser la façon dont tu déclares le routage. Les routes ne sont plus attachées à un Ingress mais à des Gateway, qui représentent l’entrée du cluster.  
- **La spec n’est pas encore figée** : bien que stable en version v1.0 pour les ressources de base, certaines fonctionnalités avancées sont encore expérimentales. Les contrôleurs (GKE Ingress, AWS Gateway API Controller, Istio, etc.) n’implémentent pas tous la même version de la spec, ni les mêmes extensions. Certains features seront communes à tous les controllers (CORE), d'autres à voir dans le temps(EXTENDED) et certaines unique à tel ou tel controlleur (Implementation-specific).
- **Tests de conformité** : avant d’adopter un contrôleur, il est crucial de vérifier son niveau de conformité via la [suite de tests officielle](https://gateway-api.org/conformance/). Certains sont encore en retard sur les derniers CRD. Tu as donc un diff potentiel entre les possibilités de la SPEC de la GatewayAPI et les feats proposé à l'heure actuelle avec ton Controlleur qui implémente cet spéc, plus ou moins rapidement. 
- **Réécriture des manifests** : impossible de coller tes anciens Ingress ; il faut recréer des `HTTPRoute` et probablement redéfinir tes règles SSL, ce qui peut être fastidieux.

**Quand choisir cette option ?**  

- Si tu construis une plateforme pour les 5 à 10 ans à venir.  
- Si tu as besoin de fonctionnalités avancées non couvertes par Ingress.  
- Si tu veux harmoniser la gestion du trafic entre clusters, clouds et mesh.

!!! danger
    Je le redis ici c'est super important. La maturité des implémentations varie. Par exemple, le contrôleur EnvoyGateway ou encore KGateway est assez avancé, tandis que d’autres peuvent être moins complets. Une phase de Proof of Concept est **indispensable**.


## En résumé : que choisir ?

| Critère | Migration simple (HAProxy/Traefik) | Migration Gateway API |
|--------|--------------------------------------|------------------------|
| **Effort** | Faible (changement de contrôleur, adaptation annotations) | Élevé (nouveaux concepts, réécriture) |
| **Délai** | Court | Long (apprentissage, tests, adaptation, docs & commu moins mature) |
| **Pérennité** | Limitée (Ingress sera déprécié un jour) | Durable (standard de l’industrie) |
| **Richesse fonctionnelle** | Modérée (dépend des annotations) | Très élevée (routage fin, mesh, multi-équipes role-based, meilleure sécurité) |
| **Risques** | Faibles si usage simple | Risques de maturité des implémentations <br> Controlleur en retard sur la spec <br> Annotations manquante |

**Recommandation personnelle :**  

- Si tes besoins sont simples et que tu veux sécuriser rapidement ton SI, **pars sur HAProxy ou Traefik avec Ingress**. Cela te donne quelques années de répit pour préparer sereinement une migration vers la Gateway API.  
- Si tu as la capacité d’investir maintenant dans une refonte, **saute le pas vers la Gateway API**. Anticipe une phase d’expérimentation pour valider que le contrôleur choisi (Envoy Gateway, Istio, GKE, etc.) couvre bien tes cas d’usage et respecte la conformité annoncée.

Dans tous les cas, **ne reste pas sur Ingress Nginx en fin de vie**. Le risque de sécurité et d’incompatibilité grandit chaque mois. Commence dès aujourd’hui à planifier ta migration, même si elle se fait en plusieurs étapes.
