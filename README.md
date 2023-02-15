# Clowder v2 (in development)

*For current version please see [v1](https://github.com/clowder-framework/clowder).*

Clowder v2 is a reimagining of the [Clowder](https://clowderframework.org/) scientific data management system 
using a different technology stack. While the Clowder v1 codebase has served us well, many of the underlying
technologies and libraries have not received enough support in recent years and new developers have a difficult
time learning how to contribute to it. Clowder2 is also an opportunity to leverage our experience working with scientific data in Clowder and deliver
a better solution to common problems scientists encounter when working with data.

In this version of Clowder, the application is clearly divided into a backend and a frontend. While this was the case with v1 
as well, v1 uses the playframework and the fronted was created serverside, next to a standalone web API. In v2, the
fronend is a standalone React application and the backend a standalone Fastapi web API. We countinue to leverage
Mongodb, Rabbitma and Elasticsearch. We also use Minio out of the box as the default blob store.

## Running in Docker

To run the full stack in Docker compose please use the following instructions:

1. Run all docker services with `docker compose up --scale backend=4 --build`. This will start the services with four instances of the backend
running in parallel. Note the `--build` flag used to build the images first. If using default containers that flag can be removed. The
images can also be build with `docker compose build`.

2. The application will be available at `http://localhost`.

3. To access the traefik dashboard go to `http://localhost:8080`. For the raw settings see `http://localhost:8080/api/rawdata`.

## Developing

When developing, the required services can be run using [Docker](https://www.docker.com/). You can then run the backend 
and frontend standalone from the command line or in your favorite IDE (to make debugging easier). We use Pycharm and have
made our run configurations available in the `.run` folder. Pycharm should automatically pick it up, but you will have
to change the path to the Python virtual environment to point to your path on your host.

### Required Services

- `./docker-dev.sh up` brings up the required services in the background.
- `docker-compose logs -f` shows and follows the logs for all container. To look at the logs of individual containers 
  provide the container's name. For example for the backaned logs `docker-compose logs -f backend`.
- `./docker-dev.sh down` takes down the stack.

### Backend

After starting up the required services, setup and run the backend. 

The backend is developed using [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Motor](https://motor.readthedocs.io/en/stable/).
We recommend using Python v3.9 and [pipenv](https://github.com/pypa/pipenv) for dependency management.

You can run the backend using the Pycharm run configuration provided under `.run` or from the command line using the 
following steps.

1. Switch to backend directory `cd backend`.
2. Install dependencies using `pipenv install --dev`.
3. Run app from command line (if you set it up in PyCharm you can use its debug functions):
    ```pipenv run uvicorn app.main:app --reload```
4. API docs are available at `http://localhost:8000/docs`. Default API is deployed at `http://localhost:8000/api/v2`.
5. Create a user using `POST /api/v2/users` and getting a JWT token by using `POST /api/v2/login`. Place the token in
   header of requests that require authentications using the `Authorization: Bearer <your token>` HTTP header.
    * You can also run the frontend below and use the Login link available there. 
6. Manually run tests before pushing with `pipenv run pytest -v` or right-clicking on `test` folder and clicking `Run` in PyCharm.
7. Linting is done using [Black]((https://black.readthedocs.io/en/stable/)). You can set up PyCharm to automatically
run it when you save a file using these [instructions](https://black.readthedocs.io/en/stable/integrations/editors.html).
The git repository includes an action to run Black on push and pull_request. 
8. Before pushing new code, please make sure all files are properly formatted by running the following command in the `/backend` directory:
   ```pipenv run black app```


### Frontend

To run the frontend, both required services and backend must be running successfully.

The frontend is developed using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/),
[Material UI](https://mui.com/), [Redux](https://redux.js.org/), [webpack](https://webpack.js.org/),
[Node.js](https://nodejs.org). We recommend using Node v16.15 LTS.

You can run the backend using the Pycharm run configuration provided under `.run` or from the command line using the 
following steps.

1. Switch to frontend directory `cd ../frontend`.
2. Install dependencies:
`npm install`
3. Run for development: `npm run start:dev`
4. By default backend runs at `http://localhost:8000`. If running at different url/port, use:
`CLOWDER_REMOTE_HOSTNAME=http://somewhere:9999 npm start`
5. After modifying backend API, update autogenerated client function calls (backend must be running):
`CLOWDER_REMOTE_HOSTNAME=http://localhost:8000 npm run codegen:v2`


### Configuring Keycloak
- If you are developer running the dev stack on your local machine, please import the keycloak realm setting file
`/scripts/keycloak/clowder-realm-dev.json`
- If you are running production docker compose on local machine, please import the keycloak realm setting file
`/scripts/keycloak/clowder-realm-prod.json`
- If you are deploying on the kubernetes cluster (https://clowder2.software-dev.ncsa.cloud/), please import the 
  keycloak realm setting file `/scripts/keycloak/mini-kube-clowder-realm-prod.json`
  
For more details on how to set up keycloak, please refer to []()

