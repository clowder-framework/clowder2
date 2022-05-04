# Clowder 2 FastAPI Backend

## Running in Docker

To run the full stack in Docker compose please use the following instructions:

1. Build images with `docker compose -f docker-compose.yml build`

2. Run all docker services with `docker compose up --scale backend=4`. This will start the services with four instances of the backend
running in parallel.

3. Default url for backend will be `http://clowder.docker.localhost/` using a web browser. If using a different client (for
example postman set the `HOST` header to `clowder.docker.localhost`).
This variable is set using the `traefik.http.routers.backend.rule` for the backend service.

4. To access the traefik dashboard go to `http://localhost:8080`. For the raw settings see `http://localhost:8080/api/rawdata`.

5. Minio console is available at `minioconsole.docker.localhost`.

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



