from lyngua_api.common.cognitive import TranslatorAPI
from json import loads
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

api = TranslatorAPI()
translate_router = APIRouter()


class TranslateFormat(BaseModel):
    text_to_translate: List[str]
    from_language: Optional[str]
    to_language: str


@translate_router.post("/translatev2/")
def translatev2(req: TranslateFormat):
    if req.from_language is None:
        language = api.discover_language(" ".join(req.text_to_translate))
        # First entry is the best
        language_code = language[0].language
    else:
        language_code = req.from_language
        translated = api.translate_string(text_to_translate=req.text_to_translate, from_language=language_code,
                                          to_language=req.to_language)
        translation_storage = []
        for index, word in enumerate(req.text_to_translate):
            translation_storage.append(dict(Text=word, Translation=translated[index].translations[0].text))

        words = api.dictionary_lookup(words=translation_storage, from_language=req.from_language,
                                      to_language=req.to_language)
        return words
