# Clowder 2 FastAPI Backend

## Running in Docker

To run the full stack in Docker compose please use the following instructions:

1. Run all docker services with `docker compose up --scale backend=4 --build`. This will start the services with four instances of the backend
running in parallel. Note the `--build` flag used to build the images first. If using default containers that flag can be removed. The
images can also be build with `docker compose build`.

2. To access the traefik dashboard go to `http://localhost:8080`. For the raw settings see `http://localhost:8080/api/rawdata`.

3. Minio console is available at `minioconsole.docker.localhost`.

## Developing

When developing please follow the following instructions:

1. Start mongo and minio using provided development docker compose file:

   ```docker compose -f docker-compose.dev.yml up```

2. Install dependencies using `pipenv install`. See [pipenv](https://github.com/pypa/pipenv).

3. Run app from command line (if you set it up in PyCharm you can use its debug functions):

    ```uvicorn app.main:app --reload```

4. API docs are available at `http://localhost:8000/docs`. Default API is deployed at `http://localhost:8000/api/v2`.

5. Create a user using `POST /api/v2/users` and getting a JWT token by using `POST /api/v2/login`. Place the token in
   header of requests that require authentications using the `Authorization: Bearer <your token>` HTTP header.

6. Manually run tests before pushing with `pipenv run pytest -v` or right-clicking on `test` folder and clicking `Run` in PyCharm.

7. Linting is managed using [Black]((https://black.readthedocs.io/en/stable/)). You can set up PyCharm to automatically
run it when you save a file using these [instructions](https://black.readthedocs.io/en/stable/integrations/editors.html).
The git repository includes an action to run Black on push and pull_request.


Clowder2 React Frontend
============================================

**Work in Progress**

Fronted for [Clowder2 backend API](https://github.com/clowder-framework/clowder2-backend).
Written using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/),
[Material UI](https://mui.com/), [Redux](https://redux.js.org/), [webpack](https://webpack.js.org/),
[Node.js](https://nodejs.org).

Install dependencies:

`npm install`

Run for development:

`npm run start:dev`

By default backend runs at `http://localhost:8000`. If running at different url/port, use:

`CLOWDER_REMOTE_HOSTNAME=http://somewhere:9999 npm start`

Update calls to backend (if needed, backend must be running):

`CLOWDER_REMOTE_HOSTNAME=http://localhost:8000 npm run codegen:v2`

Build for production:

`npm run build`

Deployed using Docker:

`docker compose -t clowder/clowder2-frontend`

`CLOWDER_REMOTE_HOSTNAME=http://localhost:8000 docker compose up`




