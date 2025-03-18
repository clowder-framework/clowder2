from datetime import datetime
from typing import Optional

from app.models.authorization import Provenance
from beanie import Document
from pydantic import BaseModel


class LicenseBase(BaseModel):
    name: str
    description: str = None
    url: str = None
    version: Optional[str] = None
    holders: Optional[str] = None
    expiration_date: Optional[datetime] = None


class LicenseIn(LicenseBase):
    pass


class LicenseDB(Document, LicenseBase, Provenance):
    class Settings:
        name = "licenses"


class LicenseOut(LicenseDB):
    class Config:
        fields = {"id": "id"}


# Define a  model for standard license options
class LicenseOption(BaseModel):
    id: str
    description: str = None
    url: str = None


# Define standard license options
standard_licenses = [
    LicenseOption(
        id="CC BY",
        description="This license enables reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use. CC BY includes the following elements:\n BY: credit must be given to the creator.",
        url="https://creativecommons.org/licenses/by/4.0/",
    ),
    LicenseOption(
        id="CC BY-SA",
        description="This license enables reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use. If you remix, adapt, or build upon the material, you must license the modified material under identical terms. CC BY-SA includes the following elements:\n BY: credit must be given to the creator. \nSA: Adaptations must be shared under the same terms.",
        url="https://creativecommons.org/licenses/by-sa/4.0/",
    ),
    LicenseOption(
        id="CC BY-NC",
        description="This license enables reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. CC BY-NC includes the following elements:\nBY: credit must be given to the creator.\nNC: Only noncommercial uses of the work are permitted.",
        url="https://creativecommons.org/licenses/by-nc/4.0/",
    ),
    LicenseOption(
        id="CC BY-NC-SA",
        description="This license enables reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. If you remix, adapt, or build upon the material, you must license the modified material under identical terms. CC BY-NC-SA includes the following elements:\nBY: credit must be given to the creator.\nNC: Only noncommercial uses of the work are permitted.\nSA: Adaptations must be shared under the same terms.",
        url="https://creativecommons.org/licenses/by-nc-sa/4.0/",
    ),
    LicenseOption(
        id="CC BY-ND",
        description="This license enables reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator. The license allows for commercial use. CC BY-ND includes the following elements:\nBY: credit must be given to the creator.\nND: No derivatives or adaptations of the work are permitted.",
        url="https://creativecommons.org/licenses/by-nd/4.0/",
    ),
    LicenseOption(
        id="CC BY-NC-ND",
        description="This license enables reusers to copy and distribute the material in any medium or format in unadapted form only, for noncommercial purposes only, and only so long as attribution is given to the creator. CC BY-NC-ND includes the following elements:\nBY: credit must be given to the creator.\nNC: Only noncommercial uses of the work are permitted.\nND: No derivatives or adaptations of the work are permitted.",
        url="https://creativecommons.org/licenses/by-nc-nd/4.0/",
    ),
    LicenseOption(
        id="CCO Public Domain Dedication",
        description="CC0 (aka CC Zero) is a public dedication tool, which enables creators to give up their copyright and put their works into the worldwide public domain. CC0 enables reusers to distribute, remix, adapt, and build upon the material in any medium or format, with no conditions.",
        url="https://creativecommons.org/publicdomain/zero/1.0/",
    ),
    LicenseOption(id="Custom", description="Create your own custom license", url=""),
    # Add more standard license options as needed
]
