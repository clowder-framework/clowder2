# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Configuration file for JupyterHub
import os

from customauthenticator.custom import CustomTokenAuthenticator

c = get_config()  # noqa: F821

# We rely on environment variables to configure JupyterHub so that we
# avoid having to rebuild the JupyterHub container every time we change a
# configuration parameter.

# Base URL of the Hub
c.JupyterHub.base_url = "/jupyterhub"


# Important proxy settings to work with Traefik
c.JupyterHub.proxy_class = "jupyterhub.proxy.ConfigurableHTTPProxy"
c.ConfigurableHTTPProxy.command = ["configurable-http-proxy"]


# Spawn single-user servers as Docker containers
c.JupyterHub.spawner_class = "dockerspawner.DockerSpawner"

# Spawn containers from this image
c.DockerSpawner.image = os.environ["DOCKER_NOTEBOOK_IMAGE"]

# Connect containers to this Docker network
network_name = os.environ["DOCKER_NETWORK_NAME"]
c.DockerSpawner.use_internal_ip = True
c.DockerSpawner.network_name = network_name

# Explicitly set notebook directory because we'll be mounting a volume to it.
# Most `jupyter/docker-stacks` *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
notebook_dir = os.environ.get("DOCKER_NOTEBOOK_DIR", "/home/jovyan/work")
c.DockerSpawner.notebook_dir = notebook_dir

# Mount the real user's Docker volume on the host to the notebook user's
# notebook directory in the container
c.DockerSpawner.volumes = {"jupyterhub-user-{username}": notebook_dir}

# Remove containers once they are stopped
c.DockerSpawner.remove = True

# For debugging arguments passed to spawned containers
c.DockerSpawner.debug = True

# User containers will access hub by container name on the Docker network
c.JupyterHub.hub_ip = "jupyterhub"
c.JupyterHub.hub_port = 8080

# Persist hub data on volume mounted inside container
# c.JupyterHub.cookie_secret_file = "/data/jupyterhub_cookie_secret"
c.JupyterHub.db_url = "sqlite:////data/jupyterhub.sqlite"

# # Authenticate users with Native Authenticator
# c.JupyterHub.authenticator_class = "nativeauthenticator.NativeAuthenticator"
#
# # Allow anyone to sign-up without approval
# c.NativeAuthenticator.open_signup = True

# Authenticate with Custom Token Authenticator
c.Spawner.cmd = ["start.sh", "jupyterhub-singleuser", "--allow-root"]
c.KubeSpawner.args = ["--allow-root"]
c.JupyterHub.authenticator_class = CustomTokenAuthenticator
# TODO:Change this keycloak_url as required

c.CustomTokenAuthenticator.auth_cookie_header = "Authorization"
c.CustomTokenAuthenticator.auth_username_key = "preferred_username"
c.CustomTokenAuthenticator.auth_uid_number_key = "uid_number"
c.CustomTokenAuthenticator.enable_auth_state = True
c.CustomTokenAuthenticator.auto_login = True

if os.getenv("PROD_DEPLOYMENT") == "true":
    c.CustomTokenAuthenticator.keycloak_url = "https://%s/realms/%s/" % (
        os.getenv("KEYCLOAK_HOSTNAME"),
        os.getenv("KEYCLOAK_REALM"),
    )
    c.CustomTokenAuthenticator.landing_page_login_url = "https://" + os.getenv(
        "KEYCLOAK_HOSTNAME"
    )
    c.CustomTokenAuthenticator.landing_page_logout_url = (
        "https://" + os.getenv("CLOWDER_URL") + "/auth/logout"
    )

else:
    c.CustomTokenAuthenticator.keycloak_url = "http://%s/realms/%s/" % (
        os.getenv("KEYCLOAK_HOSTNAME"),
        os.getenv("KEYCLOAK_REALM"),
    )
    c.CustomTokenAuthenticator.landing_page_login_url = "http://" + os.getenv(
        "KEYCLOAK_HOSTNAME"
    )
    c.CustomTokenAuthenticator.landing_page_logout_url = (
        "http://" + os.getenv("CLOWDER_URL") + "/auth/logout"
    )

c.JupyterHub.cookie_secret = os.getenv("JUPYTERHUB_CRYPT_KEY")

# Allowed admins
admin = os.environ.get("JUPYTERHUB_ADMIN")
if admin:
    c.Authenticator.admin_users = [admin]
