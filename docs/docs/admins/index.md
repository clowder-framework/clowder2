# How to deploy

Clowder v2 relies heavily on Docker containers for both development and production. There are two options to deploy v2
in production: docker compose and kubernetes helm charts.

The easiest way to get started is to clone the repository and run `docker compose up` in the main directory. This will
start all the services and the web interface. Internally, docker compose will run
[traeifk](https://traefik.io/traefik/) as a reverse proxy and make all services available on the host machine.

```
docker compose up
open http://localhost
```

While this works find for single node instances, if you want to scale the system, you can use the helm charts to deploy
the application on a kubernetes cluster. The helm charts are available in the `deployments/kubernetes/charts` directory.
See *README.md* in that directory for more information.
