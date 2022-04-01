class InvalidEngineError(Exception):
    def __init__(self, message):
        super().__init__(f"invalid engine: ${message}")


class UnableToBuildPathError(Exception):
    def __init__(self, message) -> None:
        super().__init__(f"unable to build path, found: {message}")
