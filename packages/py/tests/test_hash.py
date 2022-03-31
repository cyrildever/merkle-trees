from unittest import TestCase
from .context import *
from merklepy.hash import is_correct_hash, SHA_256


class TestHash(TestCase):

    def test_is_correct_hash(self):
        correct = bytes.fromhex(
            '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        found = is_correct_hash(correct, SHA_256)
        self.assertTrue(found)

        incorrect = bytes('incorrect', 'utf-8')
        found = is_correct_hash(incorrect, SHA_256)
        self.assertFalse(found)

        found = is_correct_hash(correct, 'wrong-engine')
        self.assertFalse(found)
