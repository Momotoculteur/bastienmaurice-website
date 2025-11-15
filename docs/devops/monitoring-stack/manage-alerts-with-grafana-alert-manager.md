Tu connais ce moment où ton appli crashe un samedi à 2h du mat’ et que personne n’est au courant ?  
C’est là qu’entre en scène Prometheus Alertmanager, ton pote fiable qui garde un œil sur tout et t’envoie un message (Slack, mail, PagerDuty…) quand ça chauffe.

Mais avant de le juger **comme** un simple "bot d’alertes", tu vas voir qu’il est en fait super malin

# C’est quoi Alertmanager, au juste ?

Alertmanager, c’est le cerveau qui gère les alertes dans tout l’écosystème Prometheus.  
Prometheus fait les mesures et détecte les problèmes…. 
Alertmanager, lui, s’occupe de te prévenir intelligemment.  

## Introduction 

- Prometheus : « Eh, le CPU est à 99% depuis 5 min ! »
- Alertmanager : « Ok cool, je regroupe les alertes similaires et j’envoie un message Slack à l’équipe Backend, mais sans spammer toutes les 30 secondes. »

C’est ça, son taf : router, regrouper, notifier, et éviter le bruit.

## Comment ça marche sous le capot ?
```bash
Prometheus → (alert rules) → Alertmanager → (routes) → Slack / Mail / etc
```

- Prometheus envoie des alertes au format JSON via HTTP.
- Alertmanager les reçoit, les trie, les groupe et les envoie aux bons destinataires.
- Et tout ça selon une config (alertmanager.yml) qui définit :
- Des routes → qui reçoit quoi
    - Des receivers → comment envoyer (Slack, email, webhook…)
    - Des silences → quand ne pas déranger
    - Des inhibitions → pour éviter les doublons

### Alertes
C’est Prometheus qui génère les alertes via des alert rules.

Exemple d’alerte simple :
```yaml
groups:
  - name: example-alerts
    rules:
      - alert: HighCPUUsage
        expr: avg(rate(process_cpu_seconds_total[5m])) > 0.9
        for: 2m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "CPU trop chaud 🔥"
          description: "L’utilisation CPU dépasse 90% depuis plus de 2 minutes."
```

💡 Ici, Prometheus enverra l’alerte à Alertmanager si le CPU est >90% pendant 2 minutes.

### Le routing : qui reçoit quoi (et quand)
Alertmanager peut router les alertes par équipe, par criticité, par cluster, etc.  
C’est ce qu’on appelle le routing tree.

Exemple simple :
```yaml
route:
  receiver: default
  group_by: ['alertname']
  routes:
    - match:
        team: backend
      receiver: slack-backend
    - match:
        team: frontend
      receiver: slack-frontend

receivers:
  - name: slack-backend
    slack_configs:
      - channel: '#alerts-backend'
        send_resolved: true
  - name: slack-frontend
    slack_configs:
      - channel: '#alerts-frontend'
        send_resolved: true
  - name: default
    slack_configs:
      - channel: '#ops-general'
```

Ici :

- Les alertes `team=backend` partent sur `#alerts-backend`
- Celles du `frontend` vont dans `#alerts-frontend`
- Tout le reste file dans `#ops-general`

Et Alertmanager groupe les alertes similaires pour éviter le spam.
Tu peux aussi définir des `group_wait` et `group_interval` pour contrôler quand envoyer les notifs.


### Les silences : le mode “Ne pas déranger”

T’as une maintenance prévue à 23h ?
Pas envie de te faire spammer d’alertes “Down” ?
➡️ Mets un silence.

Dans l’UI d’Alertmanager :

- Clique sur “Silences” → “New Silence”
- Choisis les labels concernés (team=backend, alertname=HighCPUUsage, etc.)
- Et donne une durée.

Tu peux aussi le faire via CLI ou API, mais l’UI est franchement top pour ça.


### Les inhibitions : éviter le bruit inutile

Imagine :

- Tu as une alerte “NodeDown”
- Et une autre “ServiceDown”

Pas besoin de deux notifications si le service dépend du node, non ?
👉 C’est là qu’intervient l’inhibition.

Exemple :
```yaml
inhibit_rules:
  - source_match:
      alertname: "NodeDown"
    target_match:
      alertname: "ServiceDown"
    equal: ['instance']
```

!!! notes
    Si “NodeDown” est actif, “ServiceDown” est automatiquement ignoré. Moins de bruit, plus de clarté.


### Les notifications : Slack, mail & cie

Alertmanager gère plein de canaux :

- 📬 Email
- 💬 Slack
- ☎️ PagerDuty
- 📱 Webhooks custom
- 🧠 OpsGenie, VictorOps, etc.

Exemple pour Slack :
```yaml
receivers:
  - name: slack-alerts
    slack_configs:
      - api_url: https://hooks.slack.com/services/XXXXX/YYYYY/ZZZZZ
        channel: '#alerts'
        text: |
          *{{ .CommonAnnotations.summary }}*
          {{ .CommonAnnotations.description }}
```

Et hop, tes alertes Prometheus arrivent directement dans ton canal Slack préféré.



## GoTemplate: customize tes alertes

### Exemple simple
Alertmanager te permet de customiser le contenu des messages envoyés à Slack, mail, etc.  
Il utilise la syntaxe Go templating, la même qu’on retrouve dans Hugo, Helm ou Kubernetes.

Tu peux accéder aux données d’alerte via des variables comme :

- `.Status` → firing ou resolved
- `.CommonLabels` → labels partagés entre les alertes groupées
- `.CommonAnnotations` → tes descriptions/summaries
- `.Alerts` → la liste complète des alertes

```yaml
Exemple simple:
receivers:
  - name: "slack-alerts"
    slack_configs:
      - api_url: https://hooks.slack.com/services/XXXX/YYYY/ZZZZ
        channel: "#alerts"
        text: |
          [{{ .Status | toUpper }}] 🚨 *{{ .CommonLabels.alertname }}*
          *Description:* {{ .CommonAnnotations.description }}
          *Instance:* {{ .CommonLabels.instance }}
          *Severity:* {{ .CommonLabels.severity }}
```

**{{ ... }}** = interpolation des variables.  
**|** = “pipe”, comme en bash → ici toUpper transforme le texte en majuscules.

### Conditions - if/else

Tu veux que les alertes “critical” s’affichent en rouge 🔴 et les “warning” en orange 🟠 ?
Facile :

```yaml
text: >
  {{ if eq .CommonLabels.severity "critical" }}
  🔥 *CRITICAL ALERT:* {{ .CommonAnnotations.summary }}
  {{ else if eq .CommonLabels.severity "warning" }}
  ⚠️ *Warning:* {{ .CommonAnnotations.summary }}
  {{ else }}
  💬 *Info:* {{ .CommonAnnotations.summary }}
  {{ end }}
```

if, else if, else et end fonctionnent comme en Go classique.  
 
eq = “equals”, ne = “not equal”, and, or aussi dispos.

### Conditions - range & group
Quand plusieurs alertes similaires sont groupées (par ex. plusieurs pods down), tu peux les lister :

```yaml
text: |
  *🚨 {{ .CommonLabels.alertname }} ({{ .Status }})*
  {{ range .Alerts }}
  - Instance: `{{ .Labels.instance }}`
    Status: `{{ .Status }}`
    Since: `{{ .StartsAt }}`
  {{ end }}
```

**range** parcourt une liste → ici `.Alerts`

Chaque élément a ses propres `.Labels`, `.Annotations`, etc.

### Conditions - with
Si tu veux “raccourcir” ton code et éviter de répéter `.CommonAnnotations.xxx` :

```yaml
text: |
  {{ with .CommonAnnotations }}
  *Summary:* {{ .summary }}
  *Description:* {{ .description }}
  {{ end }}
```

**with** définit un nouveau contexte local → . devient ton sous-objet.

### Bonus - fonctions utiles
Tu peux aussi utiliser des fonctions intégrées super pratiques :

| Fonction       | Description                         | Exemple                                              |                          |
| -------------- | ----------------------------------- | ---------------------------------------------------- | ------------------------ |
| `toUpper`      | Met en majuscule                    | `{{ .Status                                          | toUpper }}`              |
| `toLower`      | Met en minuscule                    | `{{ .Status                                          | toLower }}`              |
| `title`        | Met la première lettre en majuscule | `{{ .CommonLabels.alertname                          | title }}`                |
| `reReplaceAll` | Regex replace                       | `{{ reReplaceAll "instance=" "" .Labels.instance }}` |                          |
| `len`          | Taille d’une liste ou string        | `{{ len .Alerts }}`                                  |                          |
| `join`         | Joins une liste en string           | `{{ join "," .CommonLabels }}`                       |                          |
| `default`      | Valeur par défaut                   | `{{ .CommonAnnotations.summary                       | default "No summary" }}` |
