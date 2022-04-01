from unittest import TestCase
from .context import *

from merklepy.hash import SHA_256
from merklepy.options import MerkleTreeOptions


class TestOptions(TestCase):

    def test_merkle_tree_options(self):
        found = MerkleTreeOptions()
        self.assertFalse(found.doubleHash)
        self.assertEqual(found.engine, SHA_256)
        self.assertFalse(found.sort)

        defaultOptions = found.to_json()
        self.assertEqual(
            defaultOptions, '{"doubleHash":false,"engine":"sha-256","sort":false}')
