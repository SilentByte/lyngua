from fastapi import APIRouter, Response

ping_router = APIRouter()


@ping_router.get('/ping', status_code=204, response_class=Response)
def ping() -> None:
    pass
