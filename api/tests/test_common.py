from sys import path
from pathlib import Path

from lyngua_api.common.audio import fetch_youtube_audio
from lyngua_api.common.cognitive import SpeechAPI, TranslatorAPI
from lyngua_api.routes.translate import translatev2, TranslateFormat
from unittest import TestCase


class TestVidFetch(TestCase):
    def test_vid(self):
        fetch_youtube_audio(video_id='GQHVQvePdtI')


class TestSpeechFunctions(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.api = SpeechAPI()
        cls.video = fetch_youtube_audio(video_id='U8wLBOlCKPU')
        cls.video_text = "It's over Anakin I have the high ground. You underestimate my power. Don't try it"

    def test_sst(self):
        response = self.api.speech_to_text(wav_data=self.video)
        self.assertEquals(response.RecognitionStatus, 'Success')

    def test_pronounciation(self):
        response = self.api.speech_to_prounounciation(wav_data=self.video, words=self.video_text)
        self.assertEquals(response.RecognitionStatus, 'Success')


class TestTranslateFunctions(TestCase):
    def setUp(self):
        self.video_text = "It's over Anakin I have the high ground. You underestimate my power. Don't try it"
        self.api = TranslatorAPI()

    def test_language_discover(self):
        response = self.api.discover_language(self.video_text)

    def test_translate(self):
        response = self.api.translate_string(text_to_translate=self.video_text.split(" "), from_language='en',
                                             to_language='de')

    def test_dictionary(self):
        translated = []
        response = self.api.translate_string(text_to_translate=self.video_text.split(" "), from_language='en',
                                             to_language='de')
        for index, word in enumerate(self.video_text.split(" ")):
            translated.append(dict(Text=word, Translation=response[index].translations[0].text))
        response = self.api.dictionary_lookup(words=translated, from_language='en', to_language='de')


class TestFunction(TestCase):
    def test_translate_v2(self):
        input = TranslateFormat(
            **dict(text_to_translate="A set of words that are more than 10 but still reasonable".split(" "),
                   from_language="en",
                   to_language="de"
                   ))
        translatev2(input)
