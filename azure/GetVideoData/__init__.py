import logging
import azure.functions as func
import re
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
    logging.info('Python HTTP trigger function processed a request.')
    video = req.params.get('v')
    return func.HttpResponse(
        f'video is {strip_video(video)}',
            status_code=200
    )
