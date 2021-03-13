from lyngua_api.common.cognitive import TranslatorAPI
from json import loads
from typing import Any
from fastapi import APIRouter

api = TranslatorAPI()
translate_router = APIRouter()


@translate_router.post("/translate/")
def translate(req: Any):
    body = loads(req.get_json().decode('utf-8'))
    text_to_translate = body.get('text_to_translate')
    from_language = body.get('from_language')
    to_language = body.get('to_language')

    return [x.dict() for x in api.translate_string(from_language=from_language, to_language=to_language,
                                                   text_to_translate=text_to_translate)]
