import datetime
import io
import os
from typing import List, Optional
import zipfile
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Response
from fastapi import Form
from minio import Minio
from pymongo import MongoClient
from bson import json_util
import tempfile
import rocrate
import shutil
from rocrate.rocrate import ROCrate
from rocrate.model.person import Person
import hashlib
import json

from app import keycloak_auth
from app import dependencies
from app.keycloak_auth import get_user, get_current_user
from app.config import settings
from app.models.datasets import (
    DatasetBase,
    DatasetIn,
    DatasetDB,
    DatasetOut,
    DatasetPatch,
)
from app.models.files import FileIn, FileOut, FileVersion, FileDB
from app.models.folders import FolderOut, FolderIn, FolderDB
from app.models.pyobjectid import PyObjectId
from app.models.users import UserOut
from app.models.extractors import ExtractorIn
from app.models.metadata import (
    MongoDBRef,
    MetadataAgent,
    MetadataIn,
    MetadataDB,
    MetadataOut,
    MetadataPatch,
    validate_context,
    patch_metadata,
)

router = APIRouter()

clowder_bucket = os.getenv("MINIO_BUCKET_NAME", "clowder")

async def clean_out_tmp():
    temp_dir = os.path.join(os.getcwd(), 'tmp')
    files_inside = os.listdir()


async def get_folder_hierarchy(
    folder_id: str,
    hierarchy: str,
    db: MongoClient,
):
    found = await db["folders"].find_one({"_id": ObjectId(folder_id)})
    folder = FolderOut.from_mongo(found)
    folder_name = folder.name
    hierarchy = folder_name + "/" + hierarchy
    folder_parent = folder.parent_folder
    if folder_parent is not None:
        parent_folder_found = await db["folders"].find_one(
            {"_id": ObjectId(folder_parent)}
        )
        parent_folder = FolderOut.from_mongo(parent_folder_found)
        hierarchy = parent_folder.name + "/" + hierarchy
        parent_folder_parent = parent_folder.parent_folder
        if parent_folder_parent is not None:
            hierarchy = await get_folder_hierarchy(str(parent_folder.id), hierarchy, db)
    return hierarchy


@router.post("", response_model=DatasetOut)
async def save_dataset(
    dataset_in: DatasetIn,
    user=Depends(keycloak_auth.get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    dataset_db = DatasetDB(**dataset_in.dict(), author=user)
    new_dataset = await db["datasets"].insert_one(dataset_db.to_mongo())
    found = await db["datasets"].find_one({"_id": new_dataset.inserted_id})
    dataset_out = DatasetOut.from_mongo(found)
    return dataset_out


@router.get("", response_model=List[DatasetOut])
async def get_datasets(
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
    skip: int = 0,
    limit: int = 2,
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
    return datasets


@router.get("/{dataset_id}", response_model=DatasetOut)
async def get_dataset(dataset_id: str, db: MongoClient = Depends(dependencies.get_db)):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        return DatasetOut.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/files")
async def get_dataset_files(
    dataset_id: str,
    folder_id: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
):
    files = []
    if folder_id is None:
        async for f in db["files"].find(
            {"dataset_id": ObjectId(dataset_id), "folder_id": None}
        ):
            files.append(FileOut.from_mongo(f))
    else:
        async for f in db["files"].find(
            {
                "dataset_id": ObjectId(dataset_id),
                "folder_id": ObjectId(folder_id),
            }
        ):
            files.append(FileOut.from_mongo(f))
    return files


@router.put("/{dataset_id}", response_model=DatasetOut)
async def edit_dataset(
    dataset_id: str,
    dataset_info: DatasetBase,
    db: MongoClient = Depends(dependencies.get_db),
    user_id=Depends(get_user),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update(ds)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.patch("/{dataset_id}", response_model=DatasetOut)
async def patch_dataset(
    dataset_id: str,
    dataset_info: DatasetPatch,
    user_id=Depends(get_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        # TODO: Refactor this with permissions checks etc.
        ds = dict(dataset_info) if dataset_info is not None else {}
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        ds["author"] = UserOut(**user)
        ds["modified"] = datetime.datetime.utcnow()
        try:
            dataset.update((k, v) for k, v in ds.items() if v is not None)
            await db["datasets"].replace_one(
                {"_id": ObjectId(dataset_id)}, DatasetDB(**dataset).to_mongo()
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=e.args[0])
        return DatasetOut.from_mongo(dataset)


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (await db["datasets"].find_one({"_id": ObjectId(dataset_id)})) is not None:
        # delete dataset first to minimize files/folder being uploaded to a delete dataset
        await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        await db.metadata.delete_many({"resource.resource_id": ObjectId(dataset_id)})
        async for file in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            fs.remove_object(clowder_bucket, str(file))
            await db.metadata.delete_many(
                {"resource.resource_id": ObjectId(file["_id"])}
            )
            await db["file_versions"].delete_many({"file_id": ObjectId(file["_id"])})
        await db.files.delete_many({"dataset_id": ObjectId(dataset_id)})
        await db["folders"].delete_many({"dataset_id": ObjectId(dataset_id)})
        return {"deleted": dataset_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/folders", response_model=FolderOut)
async def add_folder(
    dataset_id: str,
    folder_in: FolderIn,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
):
    folder_db = FolderDB(
        **folder_in.dict(), author=user, dataset_id=PyObjectId(dataset_id)
    )
    parent_folder = folder_in.parent_folder
    if parent_folder is not None:
        folder = await db["folders"].find_one({"_id": ObjectId(parent_folder)})
        if folder is None:
            raise HTTPException(
                status_code=400, detail=f"Parent folder {parent_folder} not found"
            )
    new_folder = await db["folders"].insert_one(folder_db.to_mongo())
    found = await db["folders"].find_one({"_id": new_folder.inserted_id})
    folder_out = FolderOut.from_mongo(found)
    return folder_out


@router.get("/{dataset_id}/folders")
async def get_dataset_folders(
    dataset_id: str,
    parent_folder: Optional[str] = None,
    db: MongoClient = Depends(dependencies.get_db),
):
    folders = []
    if parent_folder is None:
        async for f in db["folders"].find(
            {"dataset_id": ObjectId(dataset_id), "parent_folder": None}
        ):
            folders.append(FolderDB.from_mongo(f))
    else:
        async for f in db["folders"].find(
            {
                "dataset_id": ObjectId(dataset_id),
                "parent_folder": ObjectId(parent_folder),
            }
        ):
            folders.append(FolderDB.from_mongo(f))
    return folders


@router.delete("/{dataset_id}/folder/{folder_id}")
async def delete_folder(
    dataset_id: str,
    folder_id: str,
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (await db["folder"].find_one({"_id": ObjectId(dataset_id)})) is not None:
        async for f in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            fs.remove_object(clowder_bucket, str(f))
        await db["datasets"].delete_one({"_id": ObjectId(dataset_id)})
        return {"deleted": dataset_id}
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.post("/{dataset_id}/files", response_model=FileOut)
async def save_file(
    dataset_id: str,
    folder_id: Optional[str] = Form(None),
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
    file: UploadFile = File(...),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        if user is None:
            raise HTTPException(
                status_code=401, detail=f"User not found. Session might have expired."
            )

        fileDB = FileDB(name=file.filename, creator=user, dataset_id=dataset["_id"])

        if folder_id is not None:
            if (
                folder := await db["folders"].find_one({"_id": ObjectId(folder_id)})
            ) is not None:
                folder = FolderOut.from_mongo(folder)
                fileDB.folder_id = folder.id
            else:
                raise HTTPException(
                    status_code=404, detail=f"Folder {folder_id} not found"
                )

        new_file = await db["files"].insert_one(fileDB.to_mongo())
        new_file_id = new_file.inserted_id

        # Use unique ID as key for Minio and get initial version ID
        version_id = None
        while content := file.file.read(
            settings.MINIO_UPLOAD_CHUNK_SIZE
        ):  # async read chunk
            response = fs.put_object(
                settings.MINIO_BUCKET_NAME,
                str(new_file_id),
                io.BytesIO(content),
                length=-1,
                part_size=settings.MINIO_UPLOAD_CHUNK_SIZE,
            )  # async write chunk to minio
            version_id = response.version_id
        if version_id is None:
            # TODO: This occurs in testing when minio is not running
            version_id = 999999999
        fileDB.version_id = version_id
        fileDB.version_num = 1
        print(fileDB)
        await db["files"].replace_one({"_id": ObjectId(new_file_id)}, fileDB.to_mongo())

        # Add FileVersion entry and update file
        new_version = FileVersion(
            version_id=version_id,
            file_id=new_file_id,
            creator=user,
        )
        await db["file_versions"].insert_one(new_version.to_mongo())
        return fileDB
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")


@router.get("/{dataset_id}/download", response_model=DatasetOut)
async def download_dataset(
    dataset_id: str,
    user=Depends(get_current_user),
    db: MongoClient = Depends(dependencies.get_db),
    fs: Minio = Depends(dependencies.get_fs),
):
    if (
        dataset := await db["datasets"].find_one({"_id": ObjectId(dataset_id)})
    ) is not None:
        current_temp_dir = tempfile.mkdtemp(prefix='rocratedownload')
        crate = ROCrate()
        user_first_name = user.first_name
        user_last_name = user.last_name
        user_full_name = user_first_name + " " + user_last_name
        user_crate_id = str(user.id)
        crate.add(Person(crate, user_crate_id, properties={'name': user_full_name}))

        manifest_path = os.path.join(current_temp_dir, 'manifest-md5.txt')
        bagit_path = os.path.join(current_temp_dir, 'bagit.txt')
        bag_info_path = os.path.join(current_temp_dir, 'bag-info.txt')
        tagmanifest_path = os.path.join(current_temp_dir, 'tagmanifest-md5.txt')

        bag_size = 0

        with open(bagit_path, 'w') as f:
            f.write('Bag-Software-Agent: clowder.ncsa.illinois.edu' + '\n')
            f.write('Bagging-Date: ' + str(datetime.datetime.now()) + '\n')

        with open(bag_info_path, 'w') as f:
            f.write('BagIt-Version: 0.97' + '\n')
            f.write('Tag-File-Character-Encoding: UTF-8' + '\n')

        file_count = 0

        async for f in db["files"].find({"dataset_id": ObjectId(dataset_id)}):
            file_count += 1
            file = FileOut.from_mongo(f)
            file_name = file.name

            if file.folder_id is not None:
                hierarchy = await get_folder_hierarchy(file.folder_id, "", db)
                file_name = "/" + hierarchy + file_name
            content = fs.get_object(settings.MINIO_BUCKET_NAME, str(file.id))
            current_file_path = os.path.join(current_temp_dir, file_name)
            f1 = open(current_file_path, 'wb')
            f1.write(content.data)
            current_file_size = os.path.getsize(current_file_path)
            bag_size += current_file_size
            file_md5_hash = hashlib.md5(content.data).hexdigest()
            with open(manifest_path, 'a') as mpf:
                mpf.write(file_md5_hash + ' ' + file_name + '\n')
            f1.close()
            crate.add_file(current_file_path, dest_path="data/"+file_name, properties={'name':file_name})
            content.close()
            content.release_conn()

            # TODO add file metadata
            query = {"resource.resource_id": ObjectId(file.id)}
            metadata = []
            async for md in db["metadata"].find(query):
                metadata.append(md)
            if len(metadata) > 0:
                metadata_filename = file_name + '_metadata.json'
                metadata_filename_temp_path = os.path.join(current_temp_dir, metadata_filename)
                metadata_content = json_util.dumps(metadata)
                with open(metadata_filename_temp_path, 'w') as f:
                    f.write(metadata_content)
                crate.add_file(metadata_filename_temp_path, dest_path="data/"+metadata_filename, properties={'name':metadata_filename})

        dataset_name = dataset['name']

        bag_size_kb = bag_size/1024

        with open(bagit_path, 'a') as f:
            f.write('Bag-Size: ' + str(bag_size_kb) + ' kB' + '\n')
            f.write('Payload-Oxum: ' + str(bag_size) + '.' + str(file_count)+ '\n')
            f.write('Internal-Sender-Identifier: ' + dataset_id + '\n')
            f.write('Internal-Sender-Description: ' + dataset['description'] + '\n')
            f.write('Contact-Name: ' + user_full_name + '\n')
            f.write('Contact-Email: ' + user.email + '\n')

        crate.add_file(manifest_path, dest_path='manifest-md5.txt', properties={'name': 'manifest-md5.txt'})
        crate.add_file(bag_info_path, dest_path='bag-info.txt', properties={'name': 'bag-info.txt'})
        crate.add_file(bagit_path, dest_path='bagit.txt', properties={'name': 'bagit.txt'})

        manifest_md5_hash = hashlib.md5(open(manifest_path,'rb').read()).hexdigest()
        bagit_md5_hash = hashlib.md5(open(bagit_path,'rb').read()).hexdigest()
        bag_info_md5_hash = hashlib.md5(open(bag_info_path,'rb').read()).hexdigest()

        with open(tagmanifest_path, 'w') as f:
            f.write(bagit_md5_hash + ' ' + 'bagit.txt' + '\n')
            f.write(manifest_md5_hash + ' ' + 'manifest-md5.txt' + '\n')
            f.write(bag_info_md5_hash + ' ' + 'bag-info.txt' + '\n')

        crate.add_file(tagmanifest_path, dest_path='tagmanifest-md5.txt', properties={'name': 'tagmanifest-md5.txt'})

        path_to_zip = os.path.join(current_temp_dir, dataset['name'] + '.zip')
        crate.write_zip(path_to_zip)
        f = open(path_to_zip, "rb", buffering=0)
        zip_bytes = f.read()
        stream = io.BytesIO(zip_bytes)
        f.close()
        try:
            shutil.rmtree(current_temp_dir)
        except Exception as e:
            print('could not delete file')
            print(e)
        return Response(
            stream.getvalue(),
            media_type="application/x-zip-compressed",
            headers={
                "Content-Disposition": f'attachment;filename={dataset_name + ".zip"}'
            },
        )
    else:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")
