import logging
import azure.functions as func
from json import dumps
import re
from src import blob, audio
from src.cognitive import SpeechAPI

cognitive_api = SpeechAPI()

def strip_video(video_url:str) -> str:
    """ pull out video code from url, eg 
    https://youtu.be/XnYaTgv7eMA?t=35 becomes XnYaTgv7eMA
    https://www.youtube.com/watch?v=rEq1Z0bjdwc becomes rEq1Z0bjdwc
    Apparently there are way more youtube formats than you'd expect
    https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486#gistcomment-3627766
    """
    match = re.search(pattern=r'(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)',string=video_url)
    if not match:
        raise ValueError("It's not a youtube video that I can parse")
    else:
        return match.group(1)


def main(req: func.HttpRequest) -> func.HttpResponse:
    video = req.params.get('v')
    logging.info(f'Python HTTP trigger function processed a request. video {video}')
    # Lots of possible video formats
    video_code = strip_video(video)
    logging.info(f'Video code {video_code}')
    data = blob.get_blob(video)
    if data is None:
        audio =audio.fetch_youtube_audio(video_code)
        data = cognitive_api.speech_to_text(audio)
        blob.insert_blob(blobname=video_code,file=data)
    return func.HttpResponse(status_code=200,body=dumps(data))
