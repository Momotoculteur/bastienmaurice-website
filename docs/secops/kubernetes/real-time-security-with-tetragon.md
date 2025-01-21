Tetragon est un outil open-source basé sur eBPF qui offre une observabilité en temps réel et une application des politiques de sécurité au niveau du noyau. 

Il permet de surveiller les événements système critiques, tels que les exécutions de processus, les activités des appels système et les accès aux E/S, y compris le réseau et les fichiers. 


## Utilisations principales

- **Observabilité des processus** : Surveille les événements liés aux processus, comme les créations, exécutions et terminaisons, fournissant une vue détaillée des activités du système.

- **Surveillance des appels système** : Capture les appels système pour détecter des comportements potentiellement malveillants ou non autorisés.

- **Audit des activités réseau et fichiers** : Suit les ouvertures de sockets, les communications inter-processus et les accès aux fichiers pour identifier des activités suspectes.

- **Application des politiques de sécurité** : Permet l'application en temps réel de politiques de sécurité directement au niveau du noyau, bloquant les activités malveillantes avant qu'elles n'affectent le système.