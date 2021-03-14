import azure.functions as func
from src.common.cognitive import TranslatorAPI
from json import loads, dumps

api = TranslatorAPI()


def main(req: func.HttpRequest) -> func.HttpResponse:
    body = loads(req.get_json().decode('utf-8'))
    text_to_translate = body.get('text_to_translate')
    from_language = body.get('from_language')
    to_language = body.get('to_language')

    return func.HttpResponse(
        dumps([x.dict() for x in api.translate_string(from_language=from_language, to_language=to_language,
                                   text_to_translate=text_to_translate)]),
        status_code=200
    )
