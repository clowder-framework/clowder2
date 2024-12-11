# Getting Started

The core app is divided into two modules: backend and frontend. The frontend module is a standalone [React](https://react.dev/)
application and the backend, a  standalone [FastAPI](https://fastapi.tiangolo.com/lo/) web API. We leverage [MongoDB](https://www.mongodb.com/), [RabbitMQ](https://www.rabbitmq.com/),
and [Elasticsearch](https://www.elastic.co/). We also use [MinIO](https://min.io/) out of the box as the default object store and [Traefik](https://traefik.io/traefik/) as
the web proxy.

There are two simple ways to run Clowder v2:
1. using Docker to run the full stack in Docker using the `docker-compose.yml`
2. running required services in docker using `docker-compose.dev.yml` and running backend and frontend modules from the
command line or in your favorite IDE (to make debugging easier).

## Running Full Stack in Docker

To run the full stack using [Docker](https://www.docker.com/) (recommended), please use the following instructions:

1. Run all Docker services with `docker compose up --scale backend=4 --build`. This will start the services with four
   instances of the backend module running in parallel. Note the `--build` flag used to build the images first. If using
   default images, that flag can be removed. The images can also be built with `docker compose build`.

2. The application will be running and available at `http://localhost`.

3. To access the Traefik dashboard, go to `http://localhost:8080`. To view the raw
   settings, go to `http://localhost:8080/api/rawdata`.

## Running in Development Mode

When developing, the required services can be run using Docker. You can then run the backend
and frontend modules from the command line or in your favorite IDE (to make debugging easier). We recommend
using [PyCharm](https://www.jetbrains.com/pycharm/) and have
made our run configurations available in the `.run` folder. PyCharm should automatically import it, but you will have
to change the path to the Python virtual environment to point to your path on your host (see Initial Dependencies
section below).

### Initial Development Dependencies

- Run `python3 -m venv venv` to create a Python Virtual Environment and add it to PyCharm by navigating to
  `PyCharm -> Settings... -> Project: clowder2 -> Python Interpreter -> Add Interpreter`.
- Run `source venv/bin/activate && pip install --upgrade pip` to activate the created Python Virtual Environment and
  upgrade
  pip.
- Run `pip install pipenv` to install [Pipenv](https://pipenv.pypa.io/en/latest/).

### Required Services

- Running `./docker-dev.sh up` brings up the required services in the background.
- Running `docker-compose logs -f` displays the live logs for all containers. To view the logs of individual containers,
  provide the container name. For example, for viewing the backend module logs, run `docker-compose logs -f backend`.
- Running `./docker-dev.sh down` brings down the required services.
- If you want to run the jupyterhub, you can run `./docker-dev.sh jupyter up`. The jupyterhub will be available at
  `http://localhost:8765`. You can bring it down using `./docker-dev.sh jupyter down`.

**Note:** `./docker-dev.sh` sets the project name flag to `-p clowder2-dev`. This is so that the dev containers
don't get mixed with the production containers if the user is running both on the same machine using `docker-compose.yml`.
If this is not used, the keycloak container will use the volume created with the other docker compose and it will be
unable to run as the information stored in the postgres database is different.

### Backend Module

After starting up the required services, setup and run the backend module.

The backend module is developed using [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/),
and [Motor](https://motor.readthedocs.io/en/stable/).
We recommend using [Python 3.9](https://www.python.org/downloads/)
and Pipenv for dependency management.

#### Install Backend Dependencies

1. Switch to backend module directory `cd backend`.
2. Install dependencies using `pipenv install --dev`.

#### Run Backend Module

You can run the backend module using either of the below options:

- Using the PyCharm's run configuration by navigating to `PyCharm -> Run -> Run...` and clicking `uvicorn`. Running
  directly from PyCharm helps the developer by providing easy access to its debugging features.
- From the command line by running `pipenv run uvicorn app.main:app --host 0.0.0.0 --reload`.
- To run the backend module with multiple workers, similar to production, run
  `pipenv run uvicorn app.main:app --host 0.0.0.0 --workers 17`

Additional steps/details:

1. API docs are available at `http://localhost:8000/docs`. The API base URL is `http://localhost:8000/api/v2`.
2. Create a user using `POST /api/v2/users` and getting a JWT token by using `POST /api/v2/login`. Place the token in
   header of requests that require authentications using the `Authorization: Bearer <your token>` HTTP header.
    * You can also run the frontend module below and use the Login link available there.
3. Manually run tests before pushing with `pipenv run pytest -v` or right-clicking on `test` folder and clicking `Run`
   in PyCharm.
4. Linting is done using [Black](https://black.readthedocs.io/en/stable/). You can set up PyCharm to automatically
   run it when you save a file using
   these [instructions](https://black.readthedocs.io/en/stable/integrations/editors.html).
   The git repository includes an action to run Black on push and pull_request.
5. Before pushing new code, please make sure all files are properly formatted by running the following command in
   the `/backend` directory:
   ```pipenv run black app```

### Frontend Module

To run the frontend, both required services and the backend module must be running successfully.

The frontend module is developed using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/),
[Material UI](https://mui.com/), [Redux](https://redux.js.org/), [webpack](https://webpack.js.org/),
[Node.js](https://nodejs.org). We recommend using Node v16.15 LTS.

#### Install Frontend Dependencies

1. Switch to frontend directory `cd ../frontend`.
2. Install dependencies: `npm install`

#### Run Frontend Module

You can run the frontend module using either of the below options:

- Using the PyCharm's run configuration by navigating to `PyCharm -> Run -> Run...` and clicking `start:dev`. Running
  directly from PyCharm helps the developer by providing easy access to its debugging features.
- From the command line by running `npm run start:dev`
    - By default, the backend module runs at `http://localhost:8000`. If running at different URL/port, use:
      `CLOWDER_REMOTE_HOSTNAME=http://<hostname or IP address>:<port number> npm start`
    - After modifying the backend module API, update autogenerated client function calls:
        - Backend module must be running
        - Run codegen: `npm run codegen:v2:dev`

### Configuring Keycloak

- If you are developer running the dev stack on your local machine, please import
  the [Keycloak](https://www.keycloak.org/) realm setting file `/scripts/keycloak/clowder-realm-dev.json`
- If you are running production docker compose on local machine, please import the Keycloak realm setting file
  `/scripts/keycloak/clowder-realm-prod.json`
- If you are deploying on the kubernetes cluster (https://clowder2.software-dev.ncsa.cloud/), please import the
  Keycloak realm setting file `/scripts/keycloak/mini-kube-clowder-realm-prod.json`

For more details on how to set up Keycloak, please refer to [keycloak setup](keycloak.md).

### Pre-commit Hooks and Linting

We use [pre-commit](https://pre-commit.com/) to run linting and formatting checks before committing code. To install
pre-commit, run `pip install pre-commit` and then `pre-commit install` in the root directory of the repository. This
will install the pre-commit hooks and run them on every commit. If any of the hooks fail, the commit will be aborted.
Once ran, the hooks will be in place for all future commits and branches since they are stored in the `.git/hooks`.
To run the hooks manually, run `pre-commit run --all-files`. To skip the hooks, run `git commit --no-verify` (or click
on cog in PyCharm and uncheck `Run Git hooks`).

See .pre-commit-config.yaml for the list of hooks that are run. The hooks are run in the order they are listed in the
file. The hooks are run on all files that are staged for commit. To run the hooks on all files, run `pre-commit run
--all-files`.

Hooks include:

- Python style checks and formatting using black, isort and flake8.
- Custom script to create openapi.json file from the backend FastAPI app.
- Eslint and prettier for frontend code.


#### Eslint and Prettier

Use `npx eslint-config-prettier src/index.tsx` to check for conflicts between eslint and prettier. To run eslint use
`npx eslint src`.
