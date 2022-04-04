import base64
from pyutls.hex import from_hex, to_hex
import re

from merklepy.exception import InvalidMerkleProofError
from merklepy.hash import SHA_256, Hashes
from merklepy.path import Path


class Proof(object):
    """
    The proof consists of the trail of intermediate hashes suffixed with the path, the name
    of the hashing engine used and the size of the Merkle tree at the date of the proof.

    Parameters
    ----------
    trail : Hashes
        The intermediate hashes bottom up (not including the final root hash)
    path : Path
        The path from root to leaf
    size : int
        The number of leaves in the Merkle tree at issuance of the proof
    engine : str, optional
        The name of the hashing function (the default is `'sha-256'`)
    """

    def __init__(self, trail: Hashes, path: Path, size: int, engine: str = SHA_256):
        self.trail = trail
        self.path = path
        self.size = size
        self.engine = engine

    def to_string(self) -> str:
        """
        Returns
        -------
        str
            The base64-encoded dot-separated concatenation of the hexadecimal hashes, the path, the engine and the size of the tree, eg.

            Base64('&lt;hash1&gt;&lt;hash2&gt;.11.sha-256.4')
        """
        trail_hex = ''.join(map(to_hex, self.trail))
        readable_proof = '.'.join(
            [trail_hex, self.path, self.engine, str(self.size)])
        return base64.b64encode(bytes(readable_proof, 'utf-8')).decode('utf-8')


def proof_from(string: str) -> Proof:
    """Build a `Proof` from the passed string, provided it's an actual stringified proof"""
    try:
        decoded = str(base64.b64decode(string), 'utf-8')
    except Exception as error:
        raise InvalidMerkleProofError(string) from error
    parts = decoded.split('.')
    if len(parts) != 4:
        raise InvalidMerkleProofError(string)
    path = parts[1]
    engine = parts[2]
    size = int(parts[3])
    if size == 0:
        raise InvalidMerkleProofError(string)
    if engine == SHA_256:
        hashes = list(filter(lambda item: len(item) == 32,
                             map(from_hex, re.split('(.{64})', parts[0]))))
        return Proof(hashes, path, size, engine)
    else:
        raise InvalidMerkleProofError(string)
