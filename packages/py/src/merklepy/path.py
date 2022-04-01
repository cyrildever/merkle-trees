import math

from merklepy.exception import UnableToBuildPathError

Path = str

LEFT = '1'
RIGHT = '0'


def _half_bucket(using: int) -> float:
    return math.pow(2, math.ceil(math.log(using) / math.log(2))) / 2


def build_path(index: int, size: int, depth: int) -> Path:
    """
    Build the left-right path from the root to the leaf at the passed index.

    Parameters
    ----------
    index : int
        The leaf index.
    size : int
        The size of the Merkle tree.
    depth : int
        The depth of the Merkle tree.

    Returns
    -------
    Path
        The path code.

    Raises
    ------
    UnableToBuildPathError
        If the path length is different from the tree depth.
    """
    path = ''
    initial_depth = depth
    while size > 0 and depth > 0:
        half = _half_bucket(size)
        if index < half:
            path += LEFT
            size = max(half, 1)
        else:
            path += RIGHT
            index -= half
            if size - half * 2 == 0:
                size = max(half, 1)
            else:
                size = size - half
        depth -= 1
    if len(path) != initial_depth:
        raise UnableToBuildPathError(path)
    return path
