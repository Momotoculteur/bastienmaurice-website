Imagine ton application, lors d'un gros évenement que cela soir sportif, lors des soldes, ou des fêtes. Le moment de l'année ou tu dois réaliser le plus gros chiffre d'affaire. Les visiteurs afflue, comme les ventes. Jusqu'au moment critique. BAM, trop de de monde, ton application devient down. RIP ta soirée de records de ventes, bonjour la mauvaise publicité avec des clients frustré et insatisfait, qui file chez la concurrence chez qui tout fonctionne.  


!!! question
    Comment pallier à ce problème et se preparer à l'avance lors de ce genre d'évenements ?

Effectuer ses propres tests de charge permet de connaitre à l'avance le flux maximal que peux recevoir ton application, ton infrastructure, ta base de donnée, chaque brique que compose ton application. Cela permet de vérifier si tu as des bottleneck, des maillons faibles qui pourrait soit ralentir le flux ou pire être indisponible.
En foncton de tes résulstats, tu peux alors connaître ou mettre tes efforts pour combler de soucis.  

**En réalisant cette opération tu t'assures que l'ensemble de ton système est hautement résilient et disponible et scalable.**  

## k6
C'est le tool développé pas Grafana. Open source, il est très simple à utiliser. C'est un peu l'outsider, le petit dernier crée du trio et qui se veut pour les team qui produisent des outils de type SaaS

### Extensions disponibles 

Il a une marketplace avec quelques extensions lui donnant d'avantage d'utilités: 

- Tester d'avantage de type de protocol différents comme un client Prometheus via remote_write, de tester un container registry type Harbor, Loki, NoSQL Mongo, etc.

- Avoir des outputs différents de tes résultatas comme par example un ElasticSearch, un Kafka

- Pleins d'autres choses comme la possibilité d'avoir des systèmes de notifications variés, de proxy ou encore de protocol de Crypto

!!! note
    Pour installer et utiliser ces extensions dans ton installation de k6, tu vas devoir recompiler son binaire en utilisant Go ou Docker. Mais pas de panique, c'est super intuitif comme sytème 😉

### Example de code
todo

## Gatling
todo

### Example de code
todo

## jmeter
todo

### Example de code
todo
