from unittest import TestCase
from src.blob import get_blob, insert_blob
from random import randint


class TestBlobStuff(TestCase): # Todo teardownclass delete created blobs
    @classmethod
    def setUpClass(cls) -> None:
        cls.random_name = f"TEST_VALUE_{randint(0, 1 * 10 ** 9)}"

    def test_blob_doesnt_exist(self):
        data_blob = get_blob(self.random_name)
        self.assertIsNone(data_blob)

    def test_insert_blob(self):
        insert_blob(data=dict(data="test"),blobname=self.random_name)

    def test_get_blob(self):
        print("If test insert blob failed then this will also fail")
        insert_blob(data=dict(data="test"), blobname=self.random_name + "success")
        fail_blob = get_blob(self.random_name + "should_fail")
        self.assertIsNone(fail_blob)
        success_blob = get_blob(self.random_name + "success")
        self.assertIsInstance(success_blob, dict)

