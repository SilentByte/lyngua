import logging
import azure.functions as func
from json import dumps
import re
from src.common import blob, audio
from src.common.cognitive import SpeechAPI
from pydantic import BaseModel
from typing import List

cognitive_api = SpeechAPI()


class GetVideoDataResponse(BaseModel):
    Word: str
    Offset: int
    Duration: int


def strip_video(video_url: str) -> str:
    """ pull out video code from url, eg 
    https://youtu.be/XnYaTgv7eMA?t=35 becomes XnYaTgv7eMA
    https://www.youtube.com/watch?v=rEq1Z0bjdwc becomes rEq1Z0bjdwc
    Apparently there are way more youtube formats than you'd expect
    https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486#gistcomment-3627766
    """
    match = re.search(pattern=r'(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)', string=video_url)
    if not match:
        raise ValueError("It's not a youtube video that I can parse")
    else:
        return match.group(1)


def fix_data(data: dict) -> List[dict]:
    words = data['NBest'][0]['Words']  # only ever have one item in the list
    return [dict(Word=x['Word'],Offset=x['Offset'] / 1000,Duration=x['Duration'] / 1000) for x in words]


def main(req: func.HttpRequest) -> func.HttpResponse:
    data = None
    video = req.params.get('v')
    logging.info(f'Python HTTP trigger function processed a request. video {video}')
    # Lots of possible video formats
    video_code = strip_video(video)
    logging.info(f'Video code {video_code}')
    data = blob.get_blob(video_code)
    if data is None:
        vid = audio.fetch_youtube_audio(video_code)
        data = cognitive_api.speech_to_text(vid).dict()
        blob.insert_blob(blobname=video_code, data=data)
    return func.HttpResponse(status_code=200, body=dumps(fix_data(data)))
