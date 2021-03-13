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


class DockerContainerMixin(object):
    @classmethod
    def assert_required_env_set(cls):

        envs = [env_name for env_name in required_envs if getenv(env_name, None) is None]
        if len(envs) != 0:
            raise ValueError(f"Required environment variables not present for {envs}")

    @classmethod
    def build_container(cls, file_path: Path) -> str:
        if not file_path.exists():
            raise OSError(f"Expected to find a Dockerfile at {file_path}")
        image, _ = docker_client.images.build(path=str(file_path.parent))
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
    def run_container(cls, image_name: str, timeout=60):
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

    def test_getvideodata(self):
        resp = requests.get(f'http://127.0.0.1:8080/getvideo/?v={self.address}')
        self.assertEqual(resp.status_code, 200)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.tear_down_container()

# class old():
#     address = "https://www.youtube.com/watch?v=U8wLBOlCKPU"
#
#     def test_video_data(self):  # TODO also try with patched get_blob and insertblob
#         req = FakeAZRequest(params=dict(v=self.address))
#         response = video_data_main(req)
#         self.assertEqual(response.status_code, 200)
#         body = loads(response.get_body().decode('utf-8'))
#         self.assertGreater(len(body), 1)
#         for item in body:
#             GetVideoDataResponse(**item)  # will fail if data is invalid
#
#     def test_translate(self):
#         req = FakeAZRequest(body=dict(text_to_translate="hello there",
#                                       from_language="english",  # Todo: auto detect language, this field can be missing
#                                       to_language="german"))
#         response = translate_main(req)
#         self.assertEqual(response.status_code, 200)
#
#     def test_pronounce(self):
#         with open(Path(__file__).parent / "sampletext.txt") as fp:
#             audio = fp.read()
#         req = FakeAZRequest(body=dict(
#             data=audio,
#             words="It's wednesday my dudes"))
#         response = pronouce_main(req)
#         dat = loads(response.get_body().decode('utf-8'))
#         self.assertEqual(response.status_code, 200)
#
#         req = FakeAZRequest(body=dict(
#             data=audio,
#             words="its bad my dudes"))
#         response = pronouce_main(req)
#         dat = loads(response.get_body().decode('utf-8'))
#         self.assertEqual(response.status_code, 200)
