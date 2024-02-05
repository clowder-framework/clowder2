# Clowder v2 Helm Charts

Helm charts depend on some subcharts, make sure to have them installed if you plan on modifying the helm chart:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm dep build
```
