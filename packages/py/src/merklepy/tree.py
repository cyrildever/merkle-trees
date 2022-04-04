from functools import reduce
import json
from typing import Optional

from merklepy.exception import EmptyTreeError, InvalidJSONError, TreeNotBuildError
from merklepy.hash import Hash, Hashes, build_hash_function, is_correct_hash, sort_hashes
from merklepy.options import MerkleTreeOptions
from merklepy.path import RIGHT, build_path
from merklepy.proof import Proof


class MerkleTree(object):

    def __init__(self, options: MerkleTreeOptions = MerkleTreeOptions()):
        self._isReady = False
        self._options = options
        self._leaves: Hashes = []
        self._leavesHex: list[str] = []
        self._levels: list[Hashes] = []
        self._hashFunction = build_hash_function(
            options.engine, options.doubleHash)

    def add_leaves(self, do_hash: bool, *args: bytes) -> list[Optional[Proof]]:
        """Add leaves, either sources (by passing `True` to the first parameter) or hashes"""
        self._isReady = False
        if len(args) == 0:
            raise EmptyTreeError()
        leaves = list(map(self._hashFunction, args)) if do_hash == True else list(
            filter(lambda h: is_correct_hash(h, self.get_engine()), args))
        if self._options.sort == True:
            self._sort()
        self._leaves = leaves
        self._leavesHex = list(map(lambda leaf: leaf.hex(), leaves))
        return self._make()

    def depth(self):
        """Returns the depth of the tree, ie. the number of levels excluding the root hash"""
        if self._isReady == False:
            raise TreeNotBuildError()
        return len(self._levels) - 1

    def get_engine(self):
        """Returns the name of the used hashing function"""
        return self._options.engine

    def get_proof(self, leaf: Hash) -> Optional[Proof]:
        """
        Try and retrieve the proof in the current Merkle tree for the passed hash

        Parameters
        ----------
        leaf : Hash
            The hashed data

        Returns
        -------
        Proof or None
            The correponding proof if any
        """
        if self._isReady == False:
            return None
        try:
            index = self._leaves.index(leaf)
            path = build_path(index, self.size(), self.depth())
            trail = list(
                map(lambda tuple: self._levels[tuple[0] + 1][tuple[1]], [(i, int(l)) for i, l in enumerate(path)]))
            if len(trail) == 0:
                return None
            return Proof(trail, path, self.size(), self.get_engine())
        except Exception as error:
            print(error)
            return None

    def get_root_hash(self):
        """Returns the hexadecimal representation of the root hash of the current Merkle tree"""
        if self._isReady == False:
            raise TreeNotBuildError()
        return self._levels[0][0].hex()

    def is_sorted(self):
        """Returns `true` if the current Merkle tree leaves are sorted, `false` otherwise"""
        return self._options.sort

    def size(self):
        """Returns the number of leaves"""
        return len(self._leaves)

    def to_json(self) -> str:
        """
        IMPORTANT: Use with caution!

        Returns
        -------
        str
            The JSON-stringified representation of the current Merkle tree

        Raises
        ------
        TreeNotBuiltError
            If there is no valid leaf added
        """
        if self._isReady == False and len(self._leaves) != 0:
            raise TreeNotBuildError()
        return f'{{"options":{self._options.to_json()},"leaves":{json.dumps(self._leavesHex, separators=(",", ":"))}}}'

    def use_double_hash(self):
        """Returns `true` if the current Merkle tree uses double hashing, `false` otherwise"""
        return self._options.doubleHash

    def validate_proof(self, proof: Proof, leaf: Hash, root_hash: str, rebuilding_proof: bool = False) -> bool:
        """
        Check that the passed proof matches the passed data using the passed root hash

        Parameters
        ----------
        proof : Proof
            The proof to use
        leaf : Hash
            The (hashed) data to check
        root_hash : str
            The hexadecimal representation of the root hash to compare to
        rebuilding_proof : bool, optional
            Set to `True` to use the method rebuilding the proof (default: `False`)

        Returns
        -------
        bool
            `True` if the proof is valid for the passed leaf
        """
        if self._isReady == False or root_hash != self.get_root_hash():
            return False
        if rebuilding_proof == True:
            rebuilt = self.get_proof(leaf)
            if rebuilt is None:
                return False
            return rebuilt.to_string() == proof.to_string()
        else:
            path = proof.path[::-1]
            trail = proof.trail[::-1]
            hFn = self._hashFunction
            proved = reduce(lambda h, tuple: hFn(tuple[1] + h) if path[tuple[0]] == RIGHT else hFn(
                h + tuple[1]), [(idx, current) for idx, current in enumerate(trail)], leaf)
            return proved.hex() == root_hash

    # For internal use only

    def _make(self):
        if len(self._leaves) == 0:
            raise EmptyTreeError()

        # Build the actual tree
        self._levels.insert(0, self._leaves)
        while len(self._levels[0]) > 1:
            self._levels.insert(0, self._next_level())
        if len(self._levels) == 0:
            return []
        self._isReady = True

        # Retrieve the proofs
        return list(map(self.get_proof, self._leaves))

    def _next_level(self):
        nodes = []
        from_level = self._levels[0]
        from_level_count = len(from_level)
        for i in range(0, from_level_count, 2):
            if i + 1 <= from_level_count - 1:
                nodes.append(self._hashFunction(
                    from_level[i] + from_level[i+1]))
            else:
                # Odd number promoted to the next level
                nodes.append(from_level[i])
        return nodes

    def _sort(self):
        self._leaves = sort_hashes(self._leaves)


def tree_from(json_string: str) -> MerkleTree:
    """Build a `MerkleTree` instance from the passed JSON string"""
    try:
        js = json.loads(json_string)
        options = MerkleTreeOptions() if 'options' not in js else MerkleTreeOptions(
            js['options']['doubleHash'], js['options']['engine'], js['options']['sort'])
        tree = MerkleTree(options)
        if 'leaves' not in js or len(js['leaves']) == 0:
            raise EmptyTreeError()
        leaves = list(map(bytes.fromhex, js['leaves']))
        tree.add_leaves(False, *leaves)
        return tree
    except Exception as error:
        raise InvalidJSONError(json_string) from error
