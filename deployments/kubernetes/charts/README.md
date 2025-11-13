# Clowder v2 Helm Charts

Helm charts depend on some subcharts, make sure to have them installed if you plan on modifying the helm chart:

```bash
helm repo add bitnami https://raw.githubusercontent.com/bitnami/charts/archive-full-index/bitnami
helm dependency update
```

The chart has some common values, if you want to run this on your local machine you can use the following values (*
.clowder2.ncsa.illinois.edu is an DNS record that points to 127.0.0.1):

```yaml
minio:
  ingress:
    hostname: minio.clowder2.ncsa.illinois.edu
  apiIngress:
    hostname: minio.clowder2.ncsa.illinois.edu

rabbitmq:
  ingress:
    hostname: rabbitmq.clowder2.ncsa.illinois.edu
```

Now you can install (or upgrade) clowder using:

```bash
helm upgrade --install --namespace clowder2 --create-namespace --values local.yaml clowder2 .
```

## Ingress Controller

You will need an ingress controller. Traefik works well as ingress controller. You can install it with:

```bash
helm install --namespace traefik --create-namespace traefik traefik/traefik
```

If you want to enable the dashboard, you need the following file (dashboard.yaml):

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: dashboard
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`traefik.clowder2.ncsa.illinois.edu`)
      kind: Rule
      services:
        - name: api@internal
          kind: TraefikService
```

and apply it using:

```bash
kubectl -n traefik apply -f dashboard.yaml
```
