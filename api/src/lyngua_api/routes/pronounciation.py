from fastapi import APIRouter
from lyngua_api.common.cognitive import SpeechAPI
from json import loads
import base64
from typing import Any
from pydantic import BaseModel

pronounce_router = APIRouter()
api = SpeechAPI()

class InputFormat(BaseModel):
    data:str
    words: str

@pronounce_router.post("/pronounce")
def pronounce(text: InputFormat):
    data = base64.b64decode(text.data)
    words = text.words
    response = api.speech_to_prounounciation(data, words=words)
    return response.dict()