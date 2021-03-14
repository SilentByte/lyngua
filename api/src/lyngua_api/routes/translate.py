from lyngua_api.common.cognitive import TranslatorAPI
from json import loads
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

api = TranslatorAPI()
translate_router = APIRouter()

class InputFormat(BaseModel):
    text_to_translate:str
    from_language:str
    to_language:str


@translate_router.post("/translate/")
def translate(req: InputFormat):
    text_to_translate = req.text_to_translate
    from_language = req.from_language
    to_language = req.to_language

    return [x.dict() for x in api.translate_string(from_language=from_language, to_language=to_language,
                                                   text_to_translate=text_to_translate)]
