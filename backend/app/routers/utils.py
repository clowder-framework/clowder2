import mimetypes
from typing import Optional

from app.models.files import ContentType
from app.models.tokens import TokenDB


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
