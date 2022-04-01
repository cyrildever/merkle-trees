from unittest import TestCase
from .context import *

from merklepy.exception import InvalidEngineError
from merklepy.hash import build_hash_function, is_correct_hash, SHA_256, sort_hashes


class TestHash(TestCase):

    def test_build_hash_function(self):
        sha256 = build_hash_function(SHA_256)
        expected = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
        found = sha256(bytes('test', 'utf-8'))
        self.assertEqual(found.hex(), expected)

        doubleSha256 = build_hash_function(SHA_256, True)
        expected = '954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4'
        found = doubleSha256(bytes('test', 'utf-8'))
        self.assertEqual(found.hex(), expected)

        self.assertRaises(InvalidEngineError,
                          build_hash_function, 'wrong-engine')

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

    def test_sort_hashes(self):
        hashes = [
            bytes.fromhex(
                'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'),
            bytes.fromhex(
                '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
            bytes.fromhex(
                'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        ]
        expected = [
            bytes.fromhex(
                '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
            bytes.fromhex(
                'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
            bytes.fromhex(
                'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789')
        ]
        found = sort_hashes(hashes)
        self.assertEqual(len(found), 3)
        self.assertEqual(
            found[0].hex(),
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        )
        self.assertEqual(found, expected)
