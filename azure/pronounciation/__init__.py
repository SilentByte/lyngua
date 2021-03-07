import logging

import azure.functions as func
from src.cognitive import SpeechAPI
from json import loads, dumps
import base64

api = SpeechAPI()


def main(req: func.HttpRequest) -> func.HttpResponse:
    body = loads(req.get_json().decode('utf-8'))
    data = body.get('data')
    words = body.get('words')
    response = api.speech_to_prounounciation(base64.decode(data, 'utf-8').encode('utf-8'), words=words)

    return func.HttpResponse(
        response,
        status_code=200
    )
