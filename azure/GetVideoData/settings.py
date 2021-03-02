"""
    LYNGUA LANGUAGE LEARNING EXPERIENCE
    Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
"""

import os
from typing import Union

from dotenv import load_dotenv


def truthy(value: Union[str, bool]):
    value = str(value)
    return len(value) != 0 and value.lower() not in ('false', 'no')


def required(name: str):
    return os.environ[name]


def optional(name: str, default_value: str):
    return os.getenv(name, default_value)


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(BASE_DIR, '.env'))

DEBUG = truthy(optional('DEBUG', 'False'))
DEVELOPMENT = truthy(optional('DEVELOPMENT', 'False'))

if DEBUG and not DEVELOPMENT:
    raise Exception('DEBUG cannot be ON if DEVELOPMENT is OFF')

AZURE_SPEECH_API_KEY = required('AZURE_SPEECH_API_KEY')

AZURE_STORAGE_CONNECTION_STRING = required('AZURE_STORAGE_CONNECTION_STRING')

AZURE_STORAGE_CONTAINER = required('AZURE_STORAGE_CONTAINER')

AZURE_COSMOS_ENDPOINT = required('AZURE_COSMOS_ENDPOINT') # Todo make a list to cycle the two

AZURE_COSMOS_KEY = required('AZURE_COSMOS_KEY') # Todo make a list to cycle the two

AZURE_COSMOS_DB_NAME = optional('AZURE_COSMOS_DB_NAME','lyngua')

AZURE_COSMOS_CONTAINER_NAME= optional('AZURE_COSMOS_CONTAINER_NAME','blobs')