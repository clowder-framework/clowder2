# Clowder 2

This depends on some subcharts, make sure to have them installed if you plan on modifying the helm chart:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm dep build
```

The chart has some common values, if you want to run this on your local machine you can use the following values (*.clowder2.ncsa.cloud is an DNS record that points to 127.0.0.1):

```yaml
minio:
  ingress:
    hostname: minio.clowder2.ncsa.cloud
  apiIngress:
    hostname: minio.clowder2.ncsa.cloud

rabbitmq:
  ingress:
    hostname: rabbitmq.clowder2.ncsa.cloud
```

Now you can install (or upgrade) clowder using:
```bash
helm upgrade --install --namespace clowder2 --create-namespace --values local.yaml clowder2 .
```



# Docker Desktop

You will need an ingress controller, I like Traefik as my ingress controller. You install this with:

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
    - match: Host(`traefik.clowder2.ncsa.cloud`)
      kind: Rule
      services:
        - name: api@internal
          kind: TraefikService
```

and apply it using:

```bash
kubectl -n traefik apply -f dashboard.yaml
```

