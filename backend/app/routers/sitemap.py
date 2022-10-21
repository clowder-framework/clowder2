import datetime
import hashlib
import io
import os
import shutil
import tempfile
import zipfile
from collections.abc import Mapping, Iterable
from typing import List, Optional, Union

import pika
from bson import ObjectId
from bson import json_util
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    File,
    UploadFile,
    Response,
    Request,
)
from minio import Minio
from pika.adapters.blocking_connection import BlockingChannel
from pymongo import MongoClient
from rocrate.model.person import Person
from rocrate.rocrate import ROCrate

from app import dependencies
from app import keycloak_auth
from app.config import settings
from app.keycloak_auth import get_user, get_current_user
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
)
from app.models.files import FileOut, FileDB
from app.models.folders import FolderOut, FolderIn, FolderDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.routers.files import add_file_entry, remove_file_entry

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")


def is_str(v):
    "string predicate"
    return type(v) is str


def is_dict(v):
    "dict predicate"
    return type(v) is dict


schemaOrg_mapping = {
    "id": "identifier",
    "first_name": "givenName",
    "last_name": "familyName",
    "created": "dateCreated",
    "modified": "dateModified",
    "views": "interactionStatistic",
    "downloads": "DataDownload",
}


def datasetout_str2jsonld(jstr):
    "map json-string keys to schema.org"
    if not is_str(jstr):
        jt = type(jstr)
        print(f"str2jsonld:{jstr},wrong type:{jt}")
        return None
    global schemaOrg_mapping
    for k, v in schemaOrg_mapping.items():
        if k in jstr:
            ks = f'"{k}":'
            vs = f'"{v}":'
            print(f"replace:{ks} with:{vs}")
            jstr = jstr.replace(ks, vs)
    print(f"==jstr:{jstr}")
    jstr = jstr.replace("{", '{"@context": {"@vocab": "https://schema.org/"},', 1)
    print(f"==jstr:{jstr}")
    return jstr


serializable_keys = ["name", "description", "status", "views", "downloads"]


def datasetout2jsonld(dso):
    "dataset attributes as jsonld"
    dt = type(dso)
    print(f"datasetout2jsonld:{dso},type:{dt}")
    if is_dict(dso):
        import json

        dso2 = {}
        for k, v in dso.items():
            if k in serializable_keys:
                dso2[k] = dso[k]
        print(f"dso2:{dso2}")
        jstr = json.dumps(dso2)
    elif isinstance(dso, DatasetOut):
        dt = type(dso)
        print(f".json for:{dt}")
        jstr = dso.json()
    else:
        jstr = ""
    if len(jstr) > 9:
        return datasetout_str2jsonld(jstr)
    else:
        return ""


def datasetout2jsonld_script(dso):
    "dataset attributes in scrapable jsonld"
    jld = datasetout2jsonld(dso)
    print(f'<script type="application/ld+json">{jld}</script>')


def datasets2sitemap(datasets):
    "given an array of datasetObjs put out sitemap.xml"
    top = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    """
    sm = "sitemap.xml"  # could write to string and ret it all
    outstr = ""
    if datasets and len(datasets) > 0:
        outstr += top  # put_txtfile(sm, top, "w")
        URLb = settings.frontend_url
        for ds in datasets:
            objid = getattr(ds, "id")
            if objid:
                id = str(objid)
                # put_txtfile(sm,f'<url><loc>{URLb}/datasets/{id}</loc></url> ')
                # put_txtfile( sm, f"<url><loc>{URLb}/datasets/{id}/summary.jsonld</loc></url> ")
                outstr += f"<url><loc>{URLb}/datasets/{id}/summary.jsonld</loc></url> "
        # put_txtfile(sm, "</urlset>")
        outstr += "</urlset>"
    return outstr


# get_datasets was ("", response_model=List[DatasetOut])
# @router.get("/sitemap.xml", response_model=String)
@router.get("/sitemap.xml")
async def sitemap(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 100,
    mine: bool = False,
):
    datasets = []
    for doc in (
        await db["datasets"]
        .find()
        .sort([("created", pymongo.DESCENDING)])
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    ):
        datasets.append(DatasetOut.from_mongo(doc))
        s = datasets2sitemap(datasets)
        print(f"sitemap={s}")
        return s


# get_dataset was ("/{dataset_id}", response_model=DatasetOut)
# @router.get("/{dataset_id}/summary.jsonld", response_model=String)
@router.get("/{dataset_id}/summary.jsonld")
async def get_dataset_jsonld(
    dataset_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # now can return the ld+json script
        dso = DatasetOut.from_mongo(dataset)
        dt = type(dso)
        print(f"= =dataset of:{dt}")
        # jlds = datasetout2jsonld_script(dso) #could do this in /summary_jsonld_script but now just the jsonld
        jlds = datasetout2jsonld(dso)
        print(f"get_dataset_jsonld:{jlds}")
        # return DatasetOut.from_mongo(dataset)
        return jlds
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
