from fastapi import APIRouter
from lyngua_api.common.cognitive import SpeechAPI
from json import loads
import base64
from typing import Any
pronounce_router = APIRouter()
api = SpeechAPI()


@pronounce_router.post("/pronounce/")
def pronounce(text: Any):
    body = loads(text.get_json().decode('utf-8'))
    data = base64.b64decode(body.get('data'))
    words = body.get('words')
    response = api.speech_to_prounounciation(data, words=words)
    return response.dict()