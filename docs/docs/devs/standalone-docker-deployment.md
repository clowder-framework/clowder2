# Standalone Docker Deployment

A brief guide on how to setup Clowder2 on a host.

## Prerequisites
- Docker
- Git

## Steps
1. Clone the repository
```bash
git clone https://github.com/clowder-framework/clowder2.git
```

2. Create a docker-compose.override.yml file with the following content. Replace `{{IP_ADDRESS}}` with the IP address of the host.

```yaml
version: '3.9'

services:
  #traefik:
  #  profiles:
  #    - dont-start

  traefik:
    ports:
      # The HTTP port
      - "80:80"
      # The Web UI (enabled by --api.insecure=true)
      - "8080:8080"
    networks:
      - clowder2
  backend:
    environment:
      API_HOST: {{IP_ADDRESS}}
      auth_base: {{IP_ADDRESS}}
      auth_url: {{IP_ADDRESS}}/keycloak/realms/clowder/protocol/openid-connect/auth?client_id=clowder2-backend&response_type=code
      oauth2_scheme_auth_url: {{IP_ADDRESS}}/keycloak/realms/clowder/protocol/openid-connect/auth?client_id=clowder2-backend&response_type=code
      auth_register_url: {{IP_ADDRESS}}/keycloak/realms/clowder/protocol/openid-connect/registrations?client_id=clowder2-backend&response_type=code
      auth_token_url: {{IP_ADDRESS}}/keycloak/realms/clowder/protocol/openid-connect/token
      auth_server_url: {{IP_ADDRESS}}/keycloak/
      auth_redirect_uri: {{IP_ADDRESS}}/api/v2/auth
      frontend_url: {{IP_ADDRESS}}


  frontend:
    environment:
      CLOWDER_REMOTE_HOSTNAME: {{IP_ADDRESS}}

networks:
  clowder2:
```


3. Run docker-compose up with the following command
```bash
cd clowder2
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

4. Access the keycloak admin console at `http://{{IP_ADDRESS}}/keycloak/` and login with the credentials from the `docker-compose.yml` file and finish the steps in [Keycloak](keycloak.md), using the same IP address as the `{hostname}` placeholder.

You shall be able to log in now at `http://{{IP_ADDRESS}}/`.
