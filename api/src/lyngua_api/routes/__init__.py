from fastapi import APIRouter, FastAPI
from .getvideo import get_video_router
from .pronounciation import pronounce_router
from .translate import translate_router
from .ping import ping_router
router = APIRouter()

def add_routes(app:FastAPI) -> None:
    app.include_router(get_video_router)
    app.include_router(pronounce_router)
    app.include_router(translate_router)
    app.include_router(ping_router)