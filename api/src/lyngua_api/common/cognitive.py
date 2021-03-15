import requests
from typing import List, Optional
from lyngua_api import settings
import base64
from json import dumps
from lyngua_api.models.cognitive_models import TranslationResponse, LanguageDiscoverResponse, PronounceResponse, \
    SpeechToTextResponse
from typing_extensions import TypedDict
from itertools import islice

azure_languages = dict(
    en="english",
    de="german",
    fr="french",
    it="italian",
    pt="portuguese"
)


class TranslateDict(TypedDict):
    Text: str
    Translation: str


# We're only supporting languages that are supported by Immersive reader
# language codes https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-languages
# Todo figure this out dynamically with https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation


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

    def translate_string(self, text_to_translate: List[str], from_language: str, to_language: str) -> List[
        TranslationResponse]:
        header = self.headers.copy()
        header['charset'] = 'UTF-8'
        for language in [from_language, to_language]:
            if language.lower() not in azure_languages.keys():
                raise KeyError(f"Language {language} not supported")
        response = requests.post(
            url=f"{self.translate_endpoint}/translate?api-version=3.0&from={from_language}&to={to_language}",
            data=dumps([dict(Text=word) for word in text_to_translate]),
            headers=header)
        response.raise_for_status()
        return [TranslationResponse(**x) for x in response.json()]

    def dictionary_lookup(self, words: List[TranslateDict], from_language: str, to_language: str):
        # Wrapper for the private method to ensure that I only send 10 (limit of API) words at a time
        responses = []

        def split_seq(iterable, size):
            it = iter(iterable)
            item = list(islice(it, size))
            while item:
                yield item
                item = list(islice(it, size))

        for myslice in split_seq(words, 10):
            responses += self._dictionary_lookup(myslice, from_language, to_language)

        return_vals = []
        for resp in responses:
            if len(resp['translations']) == 0:
                return_vals.append(dict(
                    source_word=resp['displaySource'],
                    translated_word=None,
                    word_type=None,
                    confidence=None,
                    backTranslations=None))
            else:
                back_translations = [a['displayText'] for a in resp['translations'][0]['backTranslations']]


                return_vals.append(dict(source_word=resp['displaySource'],
                                        translated_word=resp['translations'][0]['displayTarget'],
                                        word_type=resp['translations'][0]['posTag'],
                                        confidence=resp['translations'][0]['confidence'],
                                        backTranslations=back_translations
                                        ))


        return return_vals


    def _dictionary_lookup(self, words: List[TranslateDict], from_language: str, to_language: str):
        for language in [from_language, to_language]:
            if language.lower() not in azure_languages.keys():
                raise KeyError(f"Language {language} not supported")
        response = requests.post(
            url=f"{self.translate_endpoint}/dictionary/lookup?api-version=3.0&from={from_language}&to={to_language}",
            headers=self.headers,
            data=dumps(words[0:9])
        )
        response.raise_for_status()
        return response.json()
