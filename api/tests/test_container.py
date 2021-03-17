from unittest import TestCase

from json import dumps, loads
from typing import Optional
from pathlib import Path
import docker
from docker.models.images import Image
from docker.models.containers import Container
from time import sleep, time
import requests

docker_client = docker.from_env()
from os import getenv

required_envs = ["AZURE_SPEECH_API_KEY", "AZURE_SPEECH_ENDPOINT", "AZURE_TRANSLATE_KEY",
                 "AZURE_STORAGE_CONNECTION_STRING"]


class DockerContainerMixin(object):  # todo start
    @classmethod
    def assert_required_env_set(cls):

        envs = [env_name for env_name in required_envs if getenv(env_name, None) is None]
        if len(envs) != 0:
            raise ValueError(f"Required environment variables not present for {envs}")

    @classmethod
    def build_container(cls, file_path: Path) -> str:
        if not file_path.exists():
            raise OSError(f"Expected to find a Dockerfile at {file_path}")
        image, _ = docker_client.images.build(path=str(file_path.parent), timeout=300) # assuming speedy internet
        return image.id

    @classmethod
    def tear_down_container(cls):
        try:
            if cls.running_contaner is not None:
                print("Tearing down container {cls.running_container.image}")
                cls.running_container.stop()
                docker_client.close()
            else:
                print("Docker container not running")
        except AttributeError:
            pass

    @classmethod
    def run_container(cls, image_name: str, timeout=120):
        cls.assert_required_env_set()
        port = {'80/tcp': ('127.0.0.1', 8080)}  # Ports based on defaults
        for container in docker_client.containers.list():
            if any('8080' in x for x in docker_client.containers.list()[0].ports):
                raise OSError(f"Container {container.image} is already running with ports {container.ports}, "
                              f"I need 8080")
        running_container = docker_client.containers.run(image=image_name, ports=port, detach=True,
                                                         environment={k: getenv(k) for k in required_envs})
        start_time = time()
        # Container will take a bit of time to start up
        while (time() - start_time) < timeout:
            try:
                req = requests.get('http://127.0.0.1:8080/docs')
                if req.status_code == 200:
                    return running_container
                else:
                    sleep(1)
            except Exception:
                pass
        raise ValueError(f"Couldn't start container in {timeout} seconds")

    @classmethod
    def setup_container(cls) -> None:
        """Sets cls.running_container for future use"""
        cls.container_image = cls.build_container(Path(__file__).parent.parent / "Dockerfile")
        cls.run_container(image_name=cls.container_image)


class TestStuff(TestCase, DockerContainerMixin):
    address = "https://www.youtube.com/watch?v=eaEMSKzqGAg"

    @classmethod
    def setUpClass(cls) -> None:
        cls.setup_container()
    def setUp(self) -> None:
        # I keep getting 429'd because my tests run too fast
        sleep(5)
    def test_getvideodata(self):
        resp = requests.get(f'http://127.0.0.1:8080/getvideo/?v={self.address}')
        self.assertEqual(resp.status_code, 200)

    def test_translate(self):
        text = "Rico I am 100% sure that the translate API supports more than 10 words at a time."
        resp = requests.post('http://127.0.0.1:8080/translatev2/', data=dumps(dict(text_to_translate=text.split(" "),
                                                                                 from_language="en",
                                                                                 to_language="de")))
        self.assertEqual(resp.status_code, 200)
        print(resp)

        resp = requests.post('http://127.0.0.1:8080/translatev2/', data=dumps(dict(text_to_translate=text.split(" "),
                                                                                 to_language="de")))
        self.assertEqual(resp.status_code, 200)
        print(resp)
        text = "this guy stole my package".split(" ")


    def test_pronounce(self):
        with open(Path(__file__).parent / "sampletext.txt") as fp:
            audio = fp.read()
        resp = requests.post('http://localhost:8080/pronounce/', data=dumps(dict(data=audio,
                                                                                 words="It's bad my dudes")))
        self.assertEqual(resp.status_code, 200)

    def test_ping(self):
        resp = requests.get('http://localhost:8080/ping')
        self.assertEqual(resp.status_code, 204)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.tear_down_container()
