from typing import Optional, List

from fastapi import APIRouter, HTTPException, Body, Request
from fastapi.encoders import jsonable_encoder
from starlette import status
from starlette.responses import JSONResponse
from app.models.items import Item

router = APIRouter()


@router.get("/items/{item_id}", response_model=Item)
async def read_item(item_id: str, request: Request, q: Optional[str] = None):
    if (item := await request.app.db["items"].find_one({"_id": item_id})) is not None:
        return item

    raise HTTPException(status_code=404, detail=f"Item {item_id} not found")


@router.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}


@router.post("/items", response_description="Add a new item", response_model=Item)
async def update_item(request: Request, item: Item = Body(...)):
    parsed_item = jsonable_encoder(item)
    item_status = await request.app.db["items"].insert_one(parsed_item)
    created = await request.app.db["items"].find_one({"_id": item_status.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=Item.from_mongo(created))


@router.get("/items", response_description="List items", response_model=List[Item])
async def read_items(request: Request, skip: int = 0, limit: int = 2):
    tasks = []
    for doc in await request.app.db["items"].find().skip(skip).limit(limit).to_list(length=limit):
        tasks.append(doc)
    return tasks
