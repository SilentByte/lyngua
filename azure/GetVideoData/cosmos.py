from azure.cosmos import CosmosClient
from .settings import AZURE_COSMOS_ENDPOINT,AZURE_COSMOS_KEY, AZURE_COSMOS_DB_NAME, AZURE_COSMOS_CONTAINER_NAME
from typing import TypedDict, List

class TypedWordValues(TypedDict):
    word: str
    offset: int
    duration: int

client = CosmosClient(url='',credential='')
database = client.create_database_if_not_exists(id=AZURE_COSMOS_DB_NAME)
container = database.create_container_if_not_exists(id=AZURE_COSMOS_CONTAINER_NAME,partition_key="/url")

def get_data_from_cosmos() -> List[TypedWordValues]:
    pass

def write_data_to_cosmos() -> None:

    pass