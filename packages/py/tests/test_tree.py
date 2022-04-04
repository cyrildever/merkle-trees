from unittest import TestCase
from .context import *

from merklepy.exception import EmptyTreeError, InvalidJSONError, TreeNotBuildError
from merklepy.hash import SHA_256, build_hash_function
from merklepy.proof import proof_from
from merklepy.tree import MerkleTree, tree_from


class TestMerkleTree(TestCase):

    def test_add_leaves(self):
        tree = MerkleTree()
        self.assertRaises(EmptyTreeError, tree.add_leaves, True)
        self.assertRaises(EmptyTreeError, tree.add_leaves,
                          False, bytes('123', 'utf-8'))

    def test_depth(self):
        tree = MerkleTree()
        self.assertRaises(TreeNotBuildError, tree.depth)

        hashes = [
            bytes.fromhex(
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
            bytes.fromhex(
                'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789')
        ]
        tree.add_leaves(False, *hashes)
        found = tree.depth()
        self.assertEqual(found, 1)

    def test_get_proof(self):
        data = list(map(lambda x: bytes(x, 'utf-8'), [
                    'data1', 'data2', 'data3', 'data4', 'data5']))
        tree = MerkleTree()
        maybe_proofs = tree.add_leaves(True, *data)

        proof1 = tree.get_proof(_sha256(bytes('data1', 'utf-8')))
        self.assertIsNotNone(proof1)
        self.assertEqual(proof1.to_string(), maybe_proofs[0].to_string())

        proof2 = tree.get_proof(_sha256(bytes('data2', 'utf-8')))
        self.assertIsNotNone(proof2)
        self.assertEqual(proof2.path, '110')
        self.assertEqual(len(proof2.trail), 3)
        self.assertEqual(proof2.to_string(), maybe_proofs[1].to_string())

        proof5 = tree.get_proof(_sha256(bytes('data5', 'utf-8')))
        self.assertIsNotNone(proof5)
        self.assertEqual(proof5.to_string(), maybe_proofs[4].to_string())

        tree2 = MerkleTree()
        tree2.add_leaves(True, *data)
        proof1_2 = tree2.get_proof(_sha256(bytes('data1', 'utf-8')))
        self.assertEqual(proof1_2.to_string(), proof1.to_string())

    def test_to_json(self):
        empty = MerkleTree()
        found = empty.to_json()
        self.assertEqual(
            found, '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}')

        data = list(map(lambda x: bytes(x, 'utf-8'), [
                    'data1', 'data2', 'data3', 'data4', 'data5']))
        tree = MerkleTree()
        tree.add_leaves(True, *data)
        expected = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'
        found = tree.to_json()
        self.assertEqual(found, expected)

    def test_tree_from(self):
        empty = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}'
        self.assertRaises(InvalidJSONError, tree_from, empty)

        json = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'
        found = tree_from(json)
        self.assertEqual(found.get_root_hash(
        ), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
        proof = found.get_proof(bytes.fromhex(
            'd98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c'))
        self.assertIsNotNone(proof)

    def test_validate_proof(self):
        to_prove = proof_from('ZTE5NWRhNGM0MGYyNmI4NWViMmI2MjJlMWMwZDFjZTczZDRkOGJmNDE4M2NkODA4ZDM5YTU3ZTg1NTA5MzQ0NmFhNzVjZDVlMjUzMWYwNzJjNzAwN2JiMTkxZmViZGNkYmUyM2Q5YTRhZTMwY2RiYjg0Y2I1YTg2OWNlOWFiODM1YjQxMzYyYmM4MmI3ZjNkNTZlZGM1YTMwNmRiMjIxMDU3MDdkMDFmZjQ4MTllMjZmYWVmOTcyNGEyZDQwNmM5LjExMC5zaGEtMjU2LjU=')
        json = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'

        tree = tree_from(json)
        # It's supposed to be tested somehow, even though it's not part of the proof per se
        self.assertEqual(tree.size(), to_prove.size)
        found = tree.validate_proof(to_prove, _sha256(bytes(
            'data2', 'utf-8')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
        self.assertTrue(found)

        # refuse an invalid data
        found = tree.validate_proof(to_prove, _sha256(bytes(
            'data6', 'utf-8')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
        self.assertFalse(found)

        # refuse an invalid proof even for an existing data
        found = tree.validate_proof(to_prove, _sha256(bytes(
            'data1', 'utf-8')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
        self.assertFalse(found)


_sha256 = build_hash_function(SHA_256)
