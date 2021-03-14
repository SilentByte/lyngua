from azure.storage.blob import BlobServiceClient, ContainerClient, BlobClient
from lyngua_api.settings import AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER, AUDIO_MAX_LENGTH
from typing import Optional
from io import BytesIO
from json import load, loads, dumps

Storage = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
# Force container creation
Container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                                   container_name=AZURE_STORAGE_CONTAINER)
if not Container.exists():
    Container.create_container()

from logging import getLogger

logger = getLogger(__name__)


def get_blob(blobname: str) -> Optional[dict]:
    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                             container_name=AZURE_STORAGE_CONTAINER, blob_name=blobname)
    if blob.exists():
        tmp_bytes = BytesIO()
        tmp_bytes.write(blob.download_blob().readall())
        tmp_bytes.seek(0)
        data = load(tmp_bytes)
        if isinstance(data, str):
            return loads(data)
        else:
            return data
    return None


def insert_blob(data: dict, blobname: str) -> None:
    data_bytes = dumps(data, indent=2).encode('utf-8')

    blob = BlobClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING,
                                             container_name=AZURE_STORAGE_CONTAINER, blob_name=blobname)
    blob.upload_blob(data_bytes)
