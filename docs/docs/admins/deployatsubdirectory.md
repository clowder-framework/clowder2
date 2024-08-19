# Deploying Application to Subdirectory "clowder"

This guide will walk you through the steps to deploy your frontend and backend applications to the
subdirectory `/clowder`, ensuring that both the frontend and backend are accessible under this path.

## Step 1: Build the Frontend Image

To deploy the frontend application under `/clowder`, build the Docker image with the appropriate build arguments:

```bash
docker build --no-cache -t clowder/clowder2-frontend:basename \
    --build-arg BASE_URL_ROUTE=clowder \
    --build-arg CLOWDER_REMOTE_HOSTNAME="http://localhost/clowder" \
    .
```

- **`BASE_URL_ROUTE=clowder`**: Configures the frontend to operate under the `/clowder` subdirectory.
- **`CLOWDER_REMOTE_HOSTNAME=clowder`**: Point to the backend service that frontend will request, which should match
  the subdirectory "/clowder" as well.

## Step 2: Modify `docker-compose.yml` to Use the Built Image

In your `docker-compose.yml`, update the frontend service to use the newly built image:

```yaml
frontend:
  image: "clowder/clowder2-frontend:basename"
```

This ensures that the correct image, configured for the `/clowder` subdirectory, is used when deploying.

## Step 3: Set the `BASE_URL_ROUTE` Environment Variable

Before running Docker Compose, make sure the `BASE_URL_ROUTE` environment variable is set to `clowder`. This ensures
that both the frontend and backend services are configured to operate under the `/clowder` subdirectory.

```bash
export BASE_URL_ROUTE=clowder
echo $BASE_URL_ROUTE
```

- This environment variable ensures that the backend is also aware that it needs to operate under the `/clowder`
  subdirectory.

## Step 4: Start the Services with Docker Compose

Now, start your services using Docker Compose:

```bash
docker-compose up
```

- **Backend**: The backend service will be accessible at `http://localhost/clowder/api/v2`.
- **Frontend**: The frontend service will be accessible at `http://localhost/clowder`.

By following these steps, both your backend and frontend services will be correctly deployed under the `/clowder`
subdirectory, making them accessible through the configured paths.
