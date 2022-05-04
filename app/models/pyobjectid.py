# Convert ObjectIds to strings before storing them as the _id
# See https://developer.mongodb.com/quickstart/python-quickstart-fastapi/
from bson import ObjectId
from bson.errors import InvalidId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class ObjectIdStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        try:
            ObjectId(str(v))
        except InvalidId:
            raise ValueError("Not a valid ObjectId")
        return str(v)


#
# class PydanticObjectId(ObjectId):
#     """
#     Object Id field. Compatible with Pydantic.
#     """
#
#     @classmethod
#     def __get_validators__(cls):
#         yield cls.validate
#
#     @classmethod
#     def validate(cls, v):
#         if isinstance(v, bytes):
#             v = v.decode("utf-8")
#         try:
#             return PydanticObjectId(v)
#         except InvalidId:
#             raise TypeError("Id must be of type PydanticObjectId")
#
#     @classmethod
#     def __modify_schema__(cls, field_schema):
#         field_schema.update(
#             type="string",
#             examples=["5eb7cf5a86d9755df3a6c593", "5eb7cfb05e32e07750a1756a"],
#         )
#
