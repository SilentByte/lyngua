import pytest
from unittest import TestCase
from requests import post, get
from json import dumps, loads
from typing import Optional
from getvideodata import main as video_data_main
from getvideodata import GetVideoDataResponse
from pronounciation import main as pronouce_main
from translate import main as translate_main
from azure.functions import HttpResponse
from src.audio import fetch_youtube_audio
import base64


class FakeAZRequest():
    def __init__(self, params: Optional[dict] = None, body: Optional[dict] = None):
        self._body = body
        self.params = params

    def get_json(self):
        return dumps(self._body).encode('utf-8')


class TestStatic(TestCase):
    address = "https://www.youtube.com/watch?v=U8wLBOlCKPU"

    def test_video_data(self):  # TODO also try with patched get_blob and insertblob
        req = FakeAZRequest(params=dict(v=self.address))
        response = video_data_main(req)
        self.assertEqual(response.status_code, 200)
        body = loads(response.get_body().decode('utf-8'))
        self.assertGreater(len(body), 1)
        for item in body:
            GetVideoDataResponse(**item)  # will fail if data is invalid

    def test_translate(self):
        req = FakeAZRequest(body=dict(text_to_translate="hello there",
                                      from_language="english",  # Todo: auto detect language, this field can be missing
                                      to_language="german"))
        response = translate_main(req)
        self.assertEqual(response.status_code, 200)

    def test_pronounce(self):
        audio = fetch_youtube_audio('eaEMSKzqGAg')
        req = FakeAZRequest(body=dict(
            data=base64.encode(audio.decode('utf-8'), 'utf-8'),
            words="Hello there"))
        response = pronouce_main(req)
        self.assertEqual(response.status_code, 200)
