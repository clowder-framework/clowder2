# Configuration

Each instance of Clowder can be configured at deployment time using the config file. The config file is located
in `backend/app/config.py`. At run time, environmental variables passed into the container will override the defaults
in the config file. When using Docker Compose, the environmental variables are set in the `docker-compose.yml` file or
in `.env` file. In the case of Kubernetes, the environmental variables are set in the `values.yaml` file.
