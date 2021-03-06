import pytest
import unittest
import requests

# TODO docker container test to spin up the functions
@pytest.skip("This is prototype, to be fixed when I switch function runtime env to docker")
class TestIt(unittest.TestCase):
    # Todo fix this with the whole docker testing
    def test_initial():
        pass