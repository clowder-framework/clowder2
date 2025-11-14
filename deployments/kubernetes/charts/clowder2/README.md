# Clowder v2 Helm Charts

Helm charts depend on some subcharts, make sure to have them installed if you plan on modifying the helm chart:

```bash
helm repo add bitnami https://raw.githubusercontent.com/bitnami/charts/archive-full-index/bitnami
helm dependency update
```

The chart has some common values; you can overwrite with your own values following below examples:

```yaml
# helm upgrade --namespace clowder2 --values clowder2-software-dev.yaml clowder2 clowder2

hostname: { your hostname. E.g. clowder2.software-dev.ncsa.illinois.edu }

frontend:
  image:
    repository: clowder/clowder2-frontend
    tag: 2.0.0-beta.4
    pullPolicy: Always

backend:
  image:
    repository: clowder/clowder2-backend
    tag: 2.0.0-beta.4
    pullPolicy: Always

geoserver:
  enabled: true
  username: { your geoserver username }
  password: { your geoserver password }
  persistence:
    storageClass: { your storage class name }
    size: { your geoserver storage size e.g. 8Gi }
  ingress:
    hostname: { your hostname }

minio:
  auth:
    rootUser: { your minio username }
    rootPassword: { your minio password }
  persistence:
    storageClass: { your storage class name }
    size: { your minio storage size e.g. 20Gi }
  ingress:
    hostname: { "minio."+ hostname }
  apiIngress:
    hostname: { "minio-api." + hostname }

rabbitmq:
  # login
  auth:
    username: { your rabbitmq username }
    password: { your rabbitmq password }
    erlangCookie: { your rabbitmq cookie }
  ingress:
    hostname: { "rabbitmq." + hostname }
  persistence:
    storageClass: { your storage class name e.g.csi-cinder-sc-delete }
    size: { your rabbitmq storage size e.g. 8Gi }

mongodb:
  persistence:
    storageClass: { your storage class name e.g. csi-cinder-sc-delete }
    size: { your mongodb storage size e.g. 8Gi }

elasticsearch:
  master:
    persistence:
      storageClass: { your storage class name e.g. csi-cinder-sc-delete }
      size: { your elasticsearch storage size e.g. 8Gi }
  data:
    persistence:
      storageClass: { your storage class name e.g. csi-cinder-sc-delete }
      size: { your elasticsearch storage size e.g. 8Gi }

keycloak:
  auth:
    adminUser: { your keycloak admin username }
    adminPassword: { your keycloak admin password }
  ingress:
    hostname: { hostname }
  postgresql:
    auth:
      password: { your postgresql password }
      postgresPassword: { your postgresql password }
    primary:
      persistence:
        storageClass: { your storage class name e.g. csi-cinder-sc-delete }
        size: { your postgresql storage size e.g. 8Gi }

message:
  image:
    repository: clowder/clowder2-messages
    tag: main

heartbeat:
  image:
    repository: clowder/clowder2-heartbeat
    tag: main
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
