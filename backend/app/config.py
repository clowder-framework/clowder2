from typing import List

from pydantic import AnyHttpUrl, BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Clowder"
    API_HOST: str = "http://localhost:8000"
    API_V2_STR: str = "/api/v2"
    admin_email: str = "devnull@ncsa.illinois.edu"
    frontend_url: str = "http://localhost:3000"
    version: str = "2.0.0-beta.2"

    # Unique secret for hashing API keys. Generate with `openssl rand -hex 32`
    local_auth_secret = "clowder_secret_key"
    local_auth_expiration = 30  # default number of minutes before invalidating API key (can be individually overridden)

    # exposing default ports for fronted
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    # Mongo database connection
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGO_DATABASE: str = "clowder2"

    # Minio (file storage) information
    MINIO_SERVER_URL: str = "localhost:9000"
    MINIO_EXTERNAL_SERVER_URL: str = "localhost:9000"
    MINIO_BUCKET_NAME: str = "clowder"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_UPLOAD_CHUNK_SIZE: int = 10 * 1024 * 1024
    MINIO_EXPIRES: int = 3600  # seconds
    MINIO_SECURE: str = "False"  # http vs https
    MINIO_EXTERNAL_SECURE: str = "False"  # http vs https
    MINIO_VERSIONING_ENABLED: str = "True"

    # Files in the listed directories can be added to Clowder without copying them elsewhere
    LOCAL_WHITELIST: List[str] = []

    # Keycloak server
    auth_base = "http://localhost:8080"
    auth_realm = "clowder"
    auth_client_id = "clowder2-backend"
    auth_redirect_uri = f"{API_HOST}{API_V2_STR}/auth"
    auth_url = f"{auth_base}/keycloak/realms/{auth_realm}/protocol/openid-connect/auth?client_id={auth_client_id}&response_type=code"
    oauth2_scheme_auth_url = f"{auth_base}/auth/realms/{auth_realm}/protocol/openid-connect/auth?client_id={auth_client_id}&response_type=code"
    # scope=openid email&redirect_uri=http://<domain.com>/<redirect-path>&kc_locale=<two-digit-lang-code>
    auth_register_url = (
        f"{auth_base}/keycloak/realms/{auth_realm}/protocol/openid-connect/registrations?client_id"
        f"={auth_client_id}&response_type=code"
    )
    auth_token_url = (
        f"{auth_base}/keycloak/realms/{auth_realm}/protocol/openid-connect/token"
    )
    auth_server_url = f"{auth_base}/keycloak/"
    auth_client_secret = ""

    # keycloak local config
    keycloak_username = "admin"
    keycloak_password = "admin"
    # user here means where the token will be requested from
    keycloak_user_realm_name = "master"
    # this is the realm in which the user will be created
    keycloak_realm_name = auth_realm
    keycloak_client_id = auth_client_id
    # identity providers registered in keycloak, for example cilogon, globus, twitter
    keycloak_ipds = ["cilogon", "globus"]
    keycloak_default_enabled = True

    # Elasticsearch local config
    elasticsearch_url = "http://localhost:9200"
    elasticsearch_no_of_shards = 5
    elasticsearch_no_of_replicas = 5
    elasticsearch_setting = {
        "number_of_shards": elasticsearch_no_of_shards,
        "number_of_replicas": elasticsearch_no_of_replicas,
    }
    elasticsearch_index = "clowder"

    # RabbitMQ message bus
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"
    RABBITMQ_HOST: str = "127.0.0.1"
    HEARTBEAT_EXCHANGE: str = "extractors"

    # defautl listener heartbeat time interval in seconds 5 minutes
    listener_heartbeat_interval = 5 * 60


settings = Settings()
