from sys import path
from pathlib import Path

# shim in src because it doesn't have tests associated with it
path.insert(0, Path(__file__).parent.parent)
path.insert(0, Path(__file__).parent.parent / 'src')
from src.audio import fetch_youtube_audio
from src.cognitive import SpeechAPI, TranslatorAPI
from unittest import TestCase
from src.cognitive_models import SpeechToTextResponse, PronounceResponse, TranslationResponse, LanguageDiscoverResponse


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
        self.assertEquals(response.RecognitionStatus,'Success')

    def test_pronounciation(self):
        response = self.api.speech_to_prounounciation(wav_data=self.video, words=self.video_text)
        self.assertEquals(response.RecognitionStatus,'Success')


class TestTranslateFunctions(TestCase):
    def setUp(self):
        self.video_text = "It's over Anakin I have the high ground. You underestimate my power. Don't try it"
        self.api = TranslatorAPI()

    def test_language_discover(self):
        response = self.api.discover_language(self.video_text)

    def test_translate(self):
        response = self.api.translate_string(text_to_translate=self.video_text, from_language='english',
                                             to_language='german')
