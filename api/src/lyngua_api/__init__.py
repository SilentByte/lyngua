from fastapi import FastAPI
from lyngua_api.routes import add_routes
import uvicorn
app = FastAPI()
add_routes(app)


if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8080)