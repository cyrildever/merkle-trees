class EmptyTreeError(Exception):
    def __init__(self):
        super().__init__('empty tree')


class InvalidEngineError(Exception):
    def __init__(self, message):
        super().__init__(f"invalid engine: {message}")


class InvalidJSONError(Exception):
    pass


class InvalidMerkleProofError(Exception):
    def __init__(self, message):
        super().__init__(f"invalid proof: {message}")


class TreeNotBuildError(Exception):
    def __init__(self):
        super().__init__('tree not built')


class UnableToBuildPathError(Exception):
    def __init__(self, message) -> None:
        super().__init__(f"unable to build path, found: {message}")
