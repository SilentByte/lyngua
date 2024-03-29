import logging
from fastapi import APIRouter
import re
from lyngua_api.common import blob, audio
from lyngua_api.common.cognitive import SpeechAPI
from pydantic import BaseModel
from typing import List, Optional
from pydantic import ValidationError
get_video_router = APIRouter()
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
    return [dict(Word=x['Word'], Offset=x['Offset'], Duration=x['Duration']) for x in words]

# https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#speech-to-text
azure_languages = dict(
    en="en-us",
    de="de-de",
    fr="fr-fr",
    it="it-it",
    pt="pt-br"
)
@get_video_router.get("/getvideo")
def getvideo(v: str, l: Optional[str]):
    data = None
    video = v

    ## We're sending languages as the short form. We want the long form,

    if l is None:
        # Default to english if missing
        language='en-US'
    else:
        language = azure_languages[l.lower()]

    logging.info(f'Python HTTP trigger function processed a request. video {video}')
    # Lots of possible video formats
    # video_code = strip_video(video)
    video_code = v
    logging.info(f'Video code {video_code}')
    data = blob.get_blob(video_code + language)
    if data is None:
        vid = audio.fetch_youtube_audio(video_code)
        try:
            data = cognitive_api.speech_to_text(vid,language=language).dict()
        except ValidationError:
            # Normal errors will 500 out
            data = []

        blob.insert_blob(blobname=video_code + language, data=data)
    return fix_data(data)
