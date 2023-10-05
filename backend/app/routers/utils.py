import mimetypes
from typing import Optional

from app.models.files import ContentType


def get_content_type(
    filename: str,
    content_type: Optional[str] = None,
):
    """Returns ContentType object given a content_tyoe, also guessed the content_type if none is provided

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
