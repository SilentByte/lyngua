FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-slim
ENV APP_MODULE="lyngua_api:app"
COPY requirements.txt requirements.txt
RUN apt update -y && apt-get install ffmpeg -y && pip3 install -r requirements.txt
COPY setup.py setup.py
COPY readme.md readme.md
COPY src src
RUN pip3 install .