import json
import os
import urllib.parse

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError
from tornado import web
from traitlets import Unicode

from jupyterhub.auth import Authenticator
from jupyterhub.handlers import LoginHandler, LogoutHandler


class CustomTokenAuthenticator(Authenticator):
    """
    Accept the authenticated Access Token from cookie.
    """

    auth_cookie_header = Unicode(
        os.environ.get("AUTH_COOKIE_HEADER", ""),
        config=True,
        help="the cookie header we put in browser to retrieve token",
    )

    auth_username_key = Unicode(
        os.environ.get("AUTH_USERNAME_KEY", ""),
        config=True,
        help="the key to retreive username from the json",
    )

    landing_page_login_url = Unicode(
        os.environ.get("LANDING_PAGE_LOGIN_URL", ""),
        config=True,
        help="the landing page login entry",
    )

    landing_page_logout_url = Unicode(
        os.environ.get("LANDING_PAGE_LOGOUT", ""),
        config=True,
        help="the landing page logout entry",
    )

    keycloak_url = Unicode(
        os.environ.get("KEYCLOAK_URL", ""),
        config=True,
        help="the URL where keycloak is installed",
    )

    keycloak_audience = Unicode(
        os.environ.get("KEYCLOAK_AUDIENCE", ""),
        config=True,
        help="the audience for keycloak to check",
    )

    keycloak_pem_key = Unicode(
        os.environ.get("KEYCLOAK_PEM_KEY", ""),
        config=True,
        help="the RSA pem key with proper header and footer (deprecated)",
    )

    space_service_url = Unicode(
        os.environ.get("SPACE_SERVICE_URL", ""),
        config=True,
        help="the internal space service url",
    )

    quotas = None

    def get_handlers(self, app):
        return [
            (r"/", LoginHandler),
            (r"/user", LoginHandler),
            (r"/lab", LoginHandler),
            (r"/login", LoginHandler),
            (r"/logout", CustomTokenLogoutHandler),
        ]

    def get_keycloak_pem(self):
        if not self.keycloak_url:
            raise web.HTTPError(
                500, log_message="JupyterHub is not correctly configured."
            )

        # fetch the key
        response = urllib.request.urlopen(self.keycloak_url)
        if response.code >= 200 or response <= 299:
            encoding = response.info().get_content_charset("utf-8")
            result = json.loads(response.read().decode(encoding))
            self.keycloak_pem_key = (
                f"-----BEGIN PUBLIC KEY-----\n"
                f"{result['public_key']}\n"
                f"-----END PUBLIC KEY-----"
            )
        else:
            raise web.HTTPError(500, log_message="Could not get key from keycloak.")

    def check_jwt_token(self, access_token):
        # make sure we have the pem cert
        if not self.keycloak_pem_key:
            self.get_keycloak_pem()

        # make sure audience is set
        if not self.keycloak_audience:
            raise web.HTTPError(
                403, log_message="JupyterHub is not correctly configured."
            )

        # no token in the cookie
        if not access_token:
            raise web.HTTPError(401, log_message="Please login to access Clowder.")

        # make sure it is a valid token
        if len(access_token.split(" ")) != 2 or access_token.split(" ")[0] != "Bearer":
            raise web.HTTPError(
                403, log_message="Token format not valid, it has to be bearer xxxx!"
            )

        # decode jwt token instead of sending it to userinfo endpoint:
        access_token = access_token.split(" ")[1]
        public_key = self.keycloak_pem_key
        audience = self.keycloak_audience
        try:
            resp_json = jwt.decode(access_token, public_key, audience=audience)
        except ExpiredSignatureError:
            raise web.HTTPError(
                403,
                log_message="JWT Expired Signature Error: token signature has expired",
            )
        except JWTClaimsError:
            raise web.HTTPError(
                403, log_message="JWT Claims Error: token signature is invalid"
            )
        except JWTError:
            raise web.HTTPError(
                403, log_message="JWT Error: token signature is invalid"
            )
        except Exception:
            raise web.HTTPError(403, log_message="Not a valid jwt token!")

        # make sure we know username
        if self.auth_username_key not in resp_json.keys():
            raise web.HTTPError(
                500,
                log_message=f"Required field {self.auth_username_key} does not exist in jwt token",
            )
        username = resp_json[self.auth_username_key]

        self.log.info(f"username={username}")
        return {"name": username}

    async def authenticate(self, handler, data):
        self.log.info("Authenticate")
        try:
            access_token = urllib.parse.unquote(
                handler.get_cookie(self.auth_cookie_header, "")
            )
            if not access_token:
                raise web.HTTPError(401, log_message="Please login to access Clowder.")

            # check token and authorization
            user = self.check_jwt_token(access_token)
            return user
        except web.HTTPError as e:
            if e.log_message:
                error_msg = urllib.parse.quote(e.log_message.encode("utf-8"))
            else:
                error_msg = (
                    urllib.parse.quote(f"Error {e}".encode("utf-8"))
                    + ". Please login to access Clowder."
                )
            handler.redirect(f"{self.landing_page_login_url}?error={error_msg}")

    # async def pre_spawn_start(self, user, spawner):
    #     auth_state = await user.get_auth_state()
    #     if not auth_state:
    #         self.log.error("No auth state")
    #         return
    #
    #     spawner.environment['NB_USER'] = user.name
    #     spawner.environment['NB_UID'] = str(auth_state['uid'])
    #
    #     quota = self.find_quota(user, auth_state)
    #     if "cpu" in quota:
    #         spawner.cpu_guarantee = quota["cpu"][0]
    #         spawner.cpu_limit = quota["cpu"][1]
    #     else:
    #         spawner.cpu_guarantee = 1
    #         spawner.cpu_limit = 2
    #     if "mem" in quota:
    #         spawner.mem_guarantee = f"{quota['mem'][0]}G"
    #         spawner.mem_limit = f"{quota['mem'][1]}G"
    #     else:
    #         spawner.mem_guarantee = "2G"
    #         spawner.mem_limit = "4G"


#
#    # This is called from the jupyterlab so there is no cookies that this depends on
#    async def refresh_user(self, user, handler):
#        self.log.info("Refresh User")
#        try:
#            access_token = urllib.parse.unquote(handler.get_cookie(self.auth_cookie_header, ""))
#            # if no token present
#            if not access_token:
#                return False
#
#            # if token present, check token and authorization
#            if self.check_jwt_token(access_token):
#                True
#            return False
#        except:
#            self.log.exception("Error in refresh user")
#            return False


class CustomTokenLogoutHandler(LogoutHandler):
    async def handle_logout(self):
        # remove clowder token on logout
        self.log.info("Remove clowder token on logout")
        self.log.info(
            "You have logged out of Clowder system from Clowder . Please login again if you want to use "
            "Clowder components."
        )
        self.set_cookie(self.authenticator.auth_cookie_header, "")
        self.redirect(f"{self.authenticator.landing_page_logout_url}")
