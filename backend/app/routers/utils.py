import mimetypes
from typing import Optional

from keycloak import KeycloakOpenID

from app.config import settings
from app.models.files import ContentType
from app.models.tokens import TokenDB
from app.models.users import UserDB


def get_content_type(
    filename: str,
    content_type: Optional[str] = None,
):
    """Returns ContentType object given a content_type, also guessed the content_type if none is provided

    Arguments:
        content_type: content_type of a file to be uploaded
        file: byte to be uploaded
    """

    if content_type is None:
        content_type = mimetypes.guess_type(filename)
        content_type = content_type[0] if len(content_type) > 1 else content_type
        # If still cant guess the content_type, set it to default
        if content_type is None:
            content_type = "application/octet-stream"
    type_main = content_type.split("/")[0] if type(content_type) is str else "N/A"
    return ContentType(content_type=content_type, main_type=type_main)


async def save_refresh_token(refresh_token: str, email: str):
    """Store/update refresh token and link to that userid."""
    token_exist = await TokenDB.find_one(TokenDB.email == email)
    if token_exist is not None:
        token_exist.refresh_token = refresh_token
        await token_exist.save()
    else:
        token_created = TokenDB(email=email, refresh_token=refresh_token)
        await token_created.insert()


async def get_token(
    code: str,
    *,
    server_url=settings.auth_server_url,
    client_id=settings.auth_client_id,
    realm_name=settings.auth_realm,
    client_secret_key=settings.auth_client_secret,
    auth_redirect_uri=settings.auth_redirect_uri,
    verify=True,
):
    keycloak_openid = KeycloakOpenID(
        server_url=server_url,
        client_id=client_id,
        realm_name=realm_name,
        client_secret_key=client_secret_key,
        verify=verify,
    )

    # get token from Keycloak
    token_body = keycloak_openid.token(
        grant_type="authorization_code",
        code=code,
        redirect_uri=auth_redirect_uri,
    )

    access_token = token_body["access_token"]
    refresh_token = token_body["refresh_token"]

    # create user in db if it doesn't already exist; get the user_id
    userinfo = keycloak_openid.userinfo(access_token)
    keycloak_id = userinfo["sub"]
    given_name = userinfo.get("given_name", " ")
    family_name = userinfo.get("family_name", " ")
    email = userinfo["email"]

    # check if this is the 1st user, make it admin
    count = await UserDB.count()

    if count == 0:
        user = UserDB(
            email=email,
            first_name=given_name,
            last_name=family_name,
            hashed_password="",
            keycloak_id=keycloak_id,
            admin=True,
        )
    else:
        user = UserDB(
            email=email,
            first_name=given_name,
            last_name=family_name,
            hashed_password="",
            keycloak_id=keycloak_id,
            admin=False,
        )
    matched_user = await UserDB.find_one(UserDB.email == email)
    if matched_user is None:
        await user.insert()

    # store/update refresh token and link to that userid
    token_exist = await TokenDB.find_one(TokenDB.email == email)
    if token_exist is not None:
        token_exist.refresh_token = refresh_token
        await token_exist.save()
    else:
        token_created = TokenDB(email=email, refresh_token=refresh_token)
        await token_created.insert()

    return token_body
