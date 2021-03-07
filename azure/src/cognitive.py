import requests
from typing import List, Optional
from src import settings
import base64
from json import dumps
from src.cognitive_models import TranslationResponse, LanguageDiscoverResponse, PronounceResponse, SpeechToTextResponse

# We're only supporting languages that are supported by Immersive reader
# language codes https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-languages
# Todo figure this out dynamically with https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation
azure_languages = dict(
    japanese="ja",
    chinese="zh",
    english="en",
    german="de"
)


def _dict_to_base64_json(data: dict) -> str:
    return base64.b64encode(dumps(data).encode('utf-8')).decode('utf-8')


class SpeechAPI():  # Basics, transforming should be done in the azure function itself
    # refactor the header stuff into a assisted_request that retries if token expired and a few other things
    endpoint = settings.AZURE_SPEECH_ENDPOINT
    region = endpoint.split('//')[1].split(".")[0]
    auth_endpoint = f"https://{region}.api.cognitive.microsoft.com"

    def _request_speech_token(self) -> str:  # Todo retry policy
        response = requests.post(
            f"{self.auth_endpoint}/sts/v1.0/issuetoken",
            headers={
                'Ocp-Apim-Subscription-Key': settings.AZURE_SPEECH_API_KEY,
            }
        )
        response.raise_for_status()
        return response.content.decode('utf-8')

    def __init__(self):
        self.base_header = {
            'Authorization': f"Bearer {self._request_speech_token()}",
            "Accept": "application/json",
            'Ocp-Apim-Subscription-Key': settings.AZURE_SPEECH_API_KEY
        }

    def speech_to_text(self, wav_data: bytes) -> SpeechToTextResponse:
        header = self.base_header.copy()
        header['Content-Type'] = 'audio/wav'
        response = requests.post(
            url=f"{self.endpoint}/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed&wordLevelTimestamps=true&profanity=raw",
            data=wav_data, headers=header)
        response.raise_for_status()
        return SpeechToTextResponse(**response.json())

    def speech_to_prounounciation(self, wav_data: bytes, words: str) -> PronounceResponse:
        assessment = {
            'ReferenceText': words,
            'GradingSystem': 'HundredMark',
            'Granularity': 'FullText',
            'Dimension': 'Comprehensive'}
        header = self.base_header.copy()
        header['Content-Type'] = 'audio/wav'
        header['Pronunciation-Assessment'] = _dict_to_base64_json(assessment)
        response = requests.post(
            url=f"{self.endpoint}/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed&wordLevelTimestamps=true&profanity=raw",
            data=wav_data,
            headers=header)
        response.raise_for_status()
        return PronounceResponse(**response.json())


class TranslatorAPI():
    translate_endpoint = "https://api.cognitive.microsofttranslator.com"
    headers = {"Ocp-Apim-Subscription-Key": settings.AZURE_TRANSLATE_KEY,
               'Ocp-Apim-Subscription-Region': 'eastus',  # Todo switch this to global endpoint
               "Content-type": "application/json"}

    def discover_language(self, text: str) -> List[LanguageDiscoverResponse]:
        response = requests.post(url=f"{self.translate_endpoint}/detect?api-version=3.0",
                                 headers=self.headers,
                                 data=dumps([dict(text=text)])
                                 )
        response.raise_for_status()
        return [LanguageDiscoverResponse(**x) for x in response.json()]

    def translate_string(self, text_to_translate: str, from_language: Optional[str], to_language: str) -> List[
        TranslationResponse]:
        header = self.headers.copy()
        header['charset'] = 'UTF-8'
        for language in [from_language, to_language]:
            if language.lower() not in azure_languages.keys():
                raise KeyError(f"Language {language} not supported")
        response = requests.post(
            url=f"{self.translate_endpoint}/translate?api-version=3.0&from={azure_languages[from_language]}&to={azure_languages[to_language]}",
            data=dumps([dict(Text=text_to_translate)]),
            headers=header)
        response.raise_for_status()
        return [TranslationResponse(**x) for x in response.json()]
