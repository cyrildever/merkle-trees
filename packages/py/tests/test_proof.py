from unittest import TestCase
from .context import *
import base64

from merklepy.exception import InvalidMerkleProofError
from merklepy.hash import SHA_256
from merklepy.proof import Proof, proof_from


class TestProof(TestCase):

    def test_to_string(self):
        hashes = [
            bytes.fromhex(
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
            bytes.fromhex(
                'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789')
        ]
        proof = Proof(hashes, '101', 5)
        expected = base64.b64encode(bytes(
            '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789.101.sha-256.5', 'utf-8')).decode('utf-8')
        found = proof.to_string()
        self.assertEqual(found, expected)

    def test_proof_from(self):
        proof = 'MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZmFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODkuMTAxLnNoYS0yNTYuNQ=='

        found = proof_from(proof)
        self.assertEqual(found.engine, SHA_256)
        self.assertEqual(found.path, '101')
        self.assertEqual(found.size, 5)
        self.assertEqual(len(found.trail), 2)
        self.assertEqual(found.trail[0], bytes.fromhex(
            '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'))
        self.assertEqual(found.trail[1], bytes.fromhex(
            'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'))
        self.assertEqual(found.to_string(), proof)

        self.assertRaises(InvalidMerkleProofError,
                          proof_from, 'not-a-valid-proof')
