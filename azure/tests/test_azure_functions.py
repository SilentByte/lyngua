from sys import path
from pathlib import Path
# shim in src because it doesn't have tests associated with it
path.insert(Path(__file__).parent.parent)

from GetVideoData import main as vid_data_endpoint
