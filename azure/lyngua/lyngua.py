"""
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
"""

import json
import base64
import logging
import requests
import youtube_dl
import ffmpeg

from typing import List
from dataclasses import dataclass

from lyngua import settings

log = logging.getLogger(__name__)

AUDIO_MAX_LENGTH = 60


class LynguaError(Exception):
    pass


def _dict_to_base64_json(data: dict) -> str:
    return base64.b64encode(json.dumps(data).encode('utf-8')).decode('utf-8')


def _request_speech_token() -> str:
    response = requests.post(
        "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
        headers={
            'Ocp-Apim-Subscription-Key': settings.AZURE_SPEECH_API_KEY,
        },
    )

    response.raise_for_status()
    return response.content.decode('utf-8')


def _fetch_youtube_audio(video_id: str):
    video_url = f'https://www.youtube.com/watch?v={video_id}'
    options = {
        'format': 'worstaudio/worst',
        'simulate': True,
        'logger': log,
    }

    with youtube_dl.YoutubeDL(options) as ydl:
        video_info = ydl.extract_info(video_url, download=False)

    stream = (
        ffmpeg
            .input(video_info['url'])
            .audio
            .output('pipe:', format='wav',
                    ar=16_000, ac=1,
                    ss=0, to=AUDIO_MAX_LENGTH)
    )

    log.info(f'Running {ffmpeg.compile(stream)}')
    wav_data, _ = ffmpeg.run(stream, capture_stdout=True)

    return wav_data


@dataclass
class Word:
    text: str
    display: str
    offset: float
    duration: float


@dataclass
class ScoredWord:
    text: str
    display: str
    offset: float
    duration: float
    accuracy: float
    error: str


def speech_to_text(wav_data: bytes) -> List[Word]:
    token = _request_speech_token()
    response = requests.post(
        url="https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed&wordLevelTimestamps=true&profanity=raw",
        data=wav_data,
        headers={
            'Content-Type': 'audio/wav',
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': settings.AZURE_SPEECH_API_KEY,
        },
    )

    response.raise_for_status()
    speech_data: dict = response.json()

    log.info('Speech to Text API returned data', extra=speech_data)

    if speech_data.get('RecognitionStatus') != 'Success':
        raise LynguaError('Speech API returned an error')

    return [
        Word(
            text=w['Word'],
            display=w['Word'],  # TODO: Figure out a way to extract/correlate words with punctuation.
            offset=w['Offset'] / 10_000_000,
            duration=w['Duration'] / 10_000_000,
        )
        for w in speech_data['NBest'][0]['Words']
    ]


def score_pronunciation(reference_text: str, wav_data: bytes) -> List[ScoredWord]:
    token = _request_speech_token()
    assessment = {
        'ReferenceText': reference_text,
        'GradingSystem': 'HundredMark',
        'Granularity': 'FullText',
        'Dimension': 'Comprehensive',
    }

    response = requests.post(
        url="https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed&wordLevelTimestamps=true&profanity=raw",
        data=wav_data,
        headers={
            'Content-Type': 'audio/wav',
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': settings.AZURE_SPEECH_API_KEY,
            'Pronunciation-Assessment': _dict_to_base64_json(assessment),
        },
    )

    response.raise_for_status()
    score_data: dict = response.json()

    log.info('Pronunciation Score API returned data', extra=score_data)

    if score_data.get('RecognitionStatus') != 'Success':
        raise LynguaError('Speech API returned an error')

    return [
        ScoredWord(
            text=w['Word'],
            display=w['Word'],  # TODO: Figure out a way to extract/correlate words with punctuation.
            offset=w['Offset'] / 10_000_000,
            duration=w['Duration'] / 10_000_000,
            accuracy=w['AccuracyScore'] / 100,
            error=w['ErrorType'].lower(),
        )
        for w in score_data['NBest'][0]['Words']
    ]
