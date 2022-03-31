import re

Hash = bytes
Hashes = list[Hash]

# Supported hash functions
SHA_256 = 'sha-256'

regex_sha256 = re.compile(r"""^[a-f0-9]{64}$""", re.I)


def is_correct_hash(h: bytes, engine: str) -> bool:
    """Determine if it's a hash"""
    if engine == SHA_256:
        return regex_sha256.match(h.hex())
    else:
        return False
