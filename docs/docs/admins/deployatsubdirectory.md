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

## Step 2: Modify `docker-compose.subdirectory.yml` to Use the Built Image

In your `docker-compose.subdirectory.yml`, update the frontend service to use the newly built image:
e.g.

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
docker compose -f docker-compose.subdirectory.yml up
```

- **Backend**: The backend service will be accessible at `http://localhost/clowder/api/v2`.
- **Frontend**: The frontend service will be accessible at `http://localhost/clowder/`.
- **Keycloak**: The Keycloak admin console will be accessible at `http://localhost/clowder/keycloak/`.

## Step 5: Configuring Keycloak (Optional)

If you're deploying Keycloak under a subdirectory other than `/clowder`, follow these steps to adjust the Keycloak
settings. If you're using `/clowder` as your subdirectory, this step is optional since the provided Docker Compose
setup will automatically load a pre-configured realm JSON file.

1. **Login to Keycloak Admin Console**: Navigate to `http://localhost/clowder/keycloak` in your browser.
2. **Login Credentials**:
    - **Username**: `admin`
    - **Password**: `admin`
3. **Navigate to the Clowder Realm**: Go to `Realm Settings` > `General`.
   4.**Change Frontend URL**:
    - Update the `Frontend URL` field to `http://localhost/clowder/keycloak`.
    - Click `Save` to apply the changes.
5. **Find the Client**:
    - Go to `Clients` in the Keycloak admin console.
    - Select the client with `clientId`: `clowder2-backend`.
6. **Update the Root URL**:
    - Set the `Root URL` to `http://localhost/clowder`.
7. **Update Redirect URIs**:
    - Ensure that the `Redirect URIs` field includes `http://localhost/clowder/api/v2/auth`.
8. **Update Web Origins**:
    - Ensure that the `Web Origins` field includes `http://localhost/clowder`.

By following these steps, both your backend and frontend services will be correctly deployed under the `/clowder`
subdirectory, making them accessible through the configured paths.
