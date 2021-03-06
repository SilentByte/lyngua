from youtube_dl import YoutubeDL
import ffmpeg
from logging import getLogger
from src.settings import AUDIO_MAX_LENGTH
logger = getLogger(__name__)

def fetch_youtube_audio(video_id: str) -> bytes:
    video_url = f'https://www.youtube.com/watch?v={video_id}'
    options = {
        'format': 'worstaudio/worst', # this is the worst
        'simulate': True,
        'logger': logger,
    }

    with YoutubeDL(options) as ydl:
        video_info = ydl.extract_info(video_url, download=False)

    stream = (
        ffmpeg
            .input(video_info['url'])
            .audio
            .output('pipe:', format='wav',
                    ar=16_000, ac=1,
                    ss=0, to=AUDIO_MAX_LENGTH)
    )

    logger.info(f'Running {ffmpeg.compile(stream)}')
    wav_data, _ = ffmpeg.run(stream, capture_stdout=True)
    return wav_data