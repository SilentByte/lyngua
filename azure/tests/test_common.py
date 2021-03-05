from sys import path
from pathlib import Path
# shim in src because it doesn't have tests associated with it
path.insert(Path(__file__).parent.parent)

from src.audio import fetch_youtube_audio
from src.cognitive import SpeechAPI
from unittest import TestCase

class TestVidFetch(TestCase):
    def test_vid(self):
        fetch_youtube_audio(video_id='GQHVQvePdtI')

class TestCognitiveFunctions(TestCase):
    def setUp(self):
        self.api = SpeechAPI()
        self.video = fetch_youtube_audio(video_id='U8wLBOlCKPU')
        self.video_text = "It's over Anakin I have the high ground. You underestimate my power. Don't try it"

    def test_sst(self):
        self.api.speech_to_text(wav_data=self.video)

    def test_pronounciation(self):
        self.api.speech_to_prounounciation(wav_data=self.video,words=self.video_text)
    
    def test_language_discover(self):
        self.api.discover_language(self.video_text)
        # todo check english
    
    def test_translate(self):
        self.api.translate_string(text_to_translate=self.video_text,from_language='english',to_language='german')

