import json

from merklepy.hash import SHA_256


class MerkleTreeOptions(object):
    """
    Define the `MerkleTree` options

    Parameters
    ----------
    doubleHash : bool, optional
        Set to `True` to hash nodes twice (the default is `False`).
    engine : str, optional
        The name of the hashing function (the default is `'sha-256'`).
    sort : bool, optional
        Set to `True` to lexicographically sort leaves (the default is `False`).
    """

    def __init__(self, doubleHash: bool = False, engine: str = SHA_256, sort: bool = False):
        self.doubleHash = doubleHash
        self.engine = engine
        self.sort = sort

    def to_json(self) -> str:
        """Returns the JSON-stringified representation of the current `MerkleTreeOptions`"""
        return json.dumps(self.__dict__, separators=(',', ':'))
