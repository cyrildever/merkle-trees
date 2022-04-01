import hashlib
import re
from typing import Callable

from merklepy.exception import InvalidEngineError

Hash = bytes
Hashes = list[Hash]

HashFunction = Callable[[bytes], Hash]


# Supported hash functions
SHA_256 = 'sha-256'

regex_sha256 = re.compile(r"""^[a-f0-9]{64}$""", re.I)


def build_hash_function(engine: str, doubleHash: bool = False) -> HashFunction:
    if engine == SHA_256:
        def Sha256(item: bytes) -> Hash:
            return hashlib.sha256(hashlib.sha256(item).digest()).digest() if doubleHash else hashlib.sha256(item).digest()
        return Sha256
    else:
        raise InvalidEngineError(engine)


def is_correct_hash(h: bytes, engine: str) -> bool:
    """Determine if it's a hash"""
    if engine == SHA_256:
        return regex_sha256.match(h.hex())
    else:
        return False


def sort_hashes(input: Hashes) -> Hashes:
    """Lexicographically sort the hexadecimal representation of the passed hashes"""
    return sorted(input)
