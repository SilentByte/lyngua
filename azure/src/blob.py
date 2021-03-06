from youtube_dl import YoutubeDL
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobClient
from azure.core.exceptions import ServiceRequestError, ResourceNotFoundError
import ffmpeg
from src.settings import AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER, AUDIO_MAX_LENGTH
from typing import Optional
from io import BytesIO
from json import load, dumps

Storage = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
# Force container creation
Container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                                   container_name=AZURE_STORAGE_CONTAINER)
if not Container.exists():
    Container.create_container()

from logging import getLogger

logger = getLogger(__name__)


def fetch_youtube_audio(video_id: str) -> bytes:
    video_url = f'https://www.youtube.com/watch?v={video_id}'
    options = {
        'format': 'worstaudio/worst',  # this is the worst
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


def get_blob(blobname: str) -> Optional[dict]:
    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                             container_name=AZURE_STORAGE_CONTAINER, blob_name=blobname)
    if blob.exists():
        tmp_bytes = BytesIO()
        tmp_bytes.write(blob.download_blob().readall())
        tmp_bytes.seek(0)
        return load(tmp_bytes)
    return None


def insert_blob(data: dict, blobname: str) -> None:
    data_bytes = dumps(data,indent=2).encode('utf-8')

    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                             container_name=AZURE_STORAGE_CONTAINER, blob_name=blobname)
    blob.upload_blob(data_bytes)

