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
    # print(f'==jstr:{jstr}')
    jstr = jstr.replace("{", '{"@context": {"@vocab": "https://schema.org/"},', 1)
    # print(f'==jstr:{jstr}')
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
    else:
        dt = type(dso)
        print(f".json for:{dt}")
        jstr = dso.json()
    return datasetout_str2jsonld(jstr)


def datasetout2jsonld_script(dso):
    "dataset attributes in scrapable jsonld"
    jld = datasetout2jsonld(dso)
    print(f'<script type="application/ld+json">{jld}</script>')


def put_txtfile(fn, s, wa="a"):
    with open(fn, wa) as f:
        return f.write(s)


def datasets2sitemap(datasets):
    "given an array of datasetObjs put out sitemap.xml"
    top = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    """
    sm = "sitemap.xml"  # could write to string and ret it all
    if datasets and len(datasets) > 0:
        put_txtfile(sm, top, "w")
        URLb = settings.frontend_url
        for ds in datasets:
            objid = getattr(ds, "id")
            if objid:
                id = str(objid)
                # put_txtfile(sm,f'<url><loc>{URLb}/datasets/{id}</loc></url> ')
                put_txtfile(
                    sm, f"<url><loc>{URLb}/datasets/{id}/summary.jsonld</loc></url> "
                )
        put_txtfile(sm, "</urlset>")


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 10,
    mine: bool = False,
):
    datasets = []
    if mine:
        for doc in (
            await db["datasets"]
            .find({"author.email": user_id})
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
    else:
        for doc in (
            await db["datasets"].find().skip(skip).limit(limit).to_list(length=limit)
        ):
            datasets.append(DatasetOut.from_mongo(doc))
            # for now print here, till decide on route/etc
            datasets2sitemap(datasets)  # write out sitemap.xml
            if datasets and len(datasets) > 0:
                for ds in datasets:
                    dt = type(ds)
                    print(f"__dataset of:{dt}")
                    jld = datasetout2jsonld(ds)
                    print(f'<script type="application/ld+json">{jld}</script>')
                    print(f"ds:{ds}")
                    objid = getattr(ds, "id")
                    ot = type(objid)
                    print(f"__objid of:{ot}")
                    # print(f'id:{id}')
                    # id= "_mongo_id_"
                    if objid:
                        # id=objid.toString()
                        # id= "_mongo_id_"
                        id = str(objid)
                        print(f"_id:{id}")
                        dataset_url = f"{settings.frontend_url}/datasets/"
                        ds_url = dataset_url + id
                        print(f"ds_url:{ds_url}")
    return datasets


# would sitemap.xml route be similar to the function above?
# could it call it to get the url for each; which is mostly around the '_id'
# I could get these url's together, but I revisit my Q about openness
# if google needs an token to crawl the pages, it won't happen
# but I think I can see them w/o, and the route will have auth to make them


def get_txtfile(fn):
    "ret str from file"
    with open(fn, "r") as f:
        return f.read()


# @router.get("/sitemap.xml", response_model=string)
@router.get("/sitemap_xml")
async def sitemap() -> str:
    datasets = get_datasets()
    # could compare len(datasets) w/len of sitemapfile to see if could use cached one
    datasets2sitemap(datasets)  # creates the sitemap.xml file, in case want to cache it
    s = get_txtfile("sitemap.xml")
    return s


# should this be a route?
# def get_datasets_jsonld
# def get_dataset_jsonld


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(dataset_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # for now print here, till decide on route/etc
        dso = DatasetOut.from_mongo(dataset)
        dt = type(dso)
        print(f"===dataset of:{dt}")
        jlds = datasetout2jsonld_script(dso)
        print(f"get_dataset ld:{jlds}")
        # return DatasetOut.from_mongo(dataset)
        return dso
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


# this one does not get excercised by the site yet
# @router.get("/{dataset_id}/jsonld", response_model=DatasetOut)
@router.get("/{dataset_id}/summary.jsonld", response_model=DatasetOut)
async def get_dataset_jsonld(
    dataset_id: str, db: MongoClient = Depends(dependencies.get_db)
):
    #  dataset=get_dataset(dataset_id, db)
    #  jlds=datasetout2jsonld_script(dataset)
    #  print(f'get_dataset:{jlds}')
    #  return jlds
    # or
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # now can return the ld+json script
        dso = DatasetOut.from_mongo(dataset)
        dt = type(dso)
        print(f"= =dataset of:{dt}")
        jlds = datasetout2jsonld_script(dso)
        print(f"get_dataset_jsonld:{jlds}")
        # return DatasetOut.from_mongo(dataset)
        return jlds
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
