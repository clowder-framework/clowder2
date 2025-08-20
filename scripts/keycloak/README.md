# Keycloak Flow

There are three components used in the flow: keycloak, frontend, and backend.

For the most part the flow is as follows:

frontend <-> backend <-> keycloak

The backend plays the middle man to make sure that the state is properly captured in the database.

When a user tries to login in the frontend (see `frontend/src/components/auth/RedirectLogin`) the frontend
redirects to `Config.KeycloakLogin` by default `http://localhost/api/v2/auth/login`, or is required to do so (see `frontend/src/file.handleErrors()`,
the frontend makes a call to `Config.KeycloakRefresh`.

The backend receives a request at `http://localhost/api/v2/auth/login` and redirects to
`settings.auth_url=http://localhost/keycloak/realms/clowder/protocol/openid-connect/auth?client_id=clowder2-backend&response_type=code`.

Keycloak then requires the user to login. Once that is done, keycloak redirects the user to the
clowder1-backend client
``
