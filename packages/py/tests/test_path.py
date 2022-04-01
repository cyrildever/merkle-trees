from unittest import TestCase
from .context import *

from merklepy.path import build_path


class TestPath(TestCase):

    def test_build_path(self):
        expected = '0'
        found = build_path(index=1, size=2, depth=1)
        self.assertEqual(found, expected)

        expected = '10'
        found = build_path(index=1, size=4, depth=2)
        self.assertEqual(found, expected)

        expected = '110'
        found = build_path(index=1, size=5, depth=3)
        self.assertEqual(found, expected)

        expected = '101'
        found = build_path(index=2, size=5, depth=3)
        self.assertEqual(found, expected)

        expected = '1110'
        found = build_path(index=1, size=9, depth=4)
        self.assertEqual(found, expected)

        expected = '0111'
        found = build_path(index=8, size=9, depth=4)
        self.assertEqual(found, expected)
