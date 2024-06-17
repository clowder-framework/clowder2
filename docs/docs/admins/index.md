# Overview

Clowder relies heavily on [Docker](https://www.docker.com/) containers for both development and production. There are
two options to deploy Clowder in production: [Docker Compose]((dockercompose.md)) and [Kubernetes Helm
charts](https://helm.sh/).

## Docker Compose

The easiest way to get started is to clone the repository and run `docker compose up` in the main directory. This will
start all the services and the web interface. Internally, docker compose will run
[traeifk](https://traefik.io/traefik/) as a reverse proxy and make all services available on the host machine.

```
docker compose up
open http://localhost
```

For more information on using docker compose see [Docker Compose](dockercompose.md).

## Kubernetes Helm Charts

While this works find for single node instances, if you want to scale the system, you can use the Helm charts to deploy
the application on a Kubernetes cluster. The Helm charts are available in the `deployments/kubernetes/charts` directory.
See *README.md* in that directory for more information.

For more information on kubernetes and Helm see [Kubernetes](kubernetes.md).
