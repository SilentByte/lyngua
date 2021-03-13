import azure.functions as func
from src.common.cognitive import SpeechAPI
from json import loads, dumps
import base64

api = SpeechAPI()


def main(req: func.HttpRequest) -> func.HttpResponse:
    body = loads(req.get_json().decode('utf-8'))
    data = base64.b64decode(body.get('data'))
    words = body.get('words')
    response = api.speech_to_prounounciation(data, words=words)

    return func.HttpResponse(
        dumps(response.dict()),
        status_code=200
    )
