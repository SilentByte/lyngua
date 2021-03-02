from youtube_dl import YoutubeDL
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobClient
from azure.core.exceptions import ServiceRequestError, ResourceNotFoundError
from .settings import AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER, AUDIO_MAX_LENGTH

Storage= BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
# Force container creation
Container= ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,container_name=AZURE_STORAGE_CONTAINER)
if not Container.exists():
    Container.create_container()

from logging import getLogger
logger = getLogger(__name__)

def fetch_youtube_audio(video_id: str) -> bytes:
    video_url = f'https://www.youtube.com/watch?v={video_id}'
    options = {
        'format': 'worstaudio/worst',
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

def blob_exists(blobname:str) -> bool:
    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,container_name=AZURE_STORAGE_CONTAINER,blob_name=blobname)
    if blob.exists():
        return True
    return False

def insert_blob(file:bytes,blobname:str) -> None:
    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,container_name=AZURE_STORAGE_CONTAINER,blob_name=blobname)
    blob.upload_blob(file)